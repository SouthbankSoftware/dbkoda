/**
 * @Author: guiguan
 * @Date:   2017-04-13T12:25:20+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2018-01-23T11:24:22+11:00
 */

import _ from 'lodash';
import path from 'path';
import os from 'os';
import { Application } from 'spectron';
import electron from 'electron';
import browserSideTestingHelper from '~/tests/helpers/browserSideTestingHelper';

let defaultAppOptions;

global.IS_PRODUCTION = process.env.NODE_ENV === 'production';

if (IS_PRODUCTION) {
  if (os.platform() === 'win32') {
    defaultAppOptions = {
      path: path.resolve(__dirname, '../../../dist/win-unpacked/dbKoda.exe'),
      env: {
        UAT: 'true'
      }
    };
  } else {
    defaultAppOptions = {
      path: path.resolve(__dirname, '../../../dist/mac/dbKoda.app/Contents/MacOS/dbKoda'),
      env: {
        UAT: 'true'
      }
    };
  }
} else {
  defaultAppOptions = {
    path: electron,
    args: [path.resolve(__dirname, '../../../lib/')],
    env: {
      MODE: 'byo',
      UAT: 'true'
    }
  };
}

defaultAppOptions.webdriverOptions = {
  deprecationWarnings: false
};

/**
 * Get a test instance of dbKoda app
 *
 * @param {Object} [options = {}] - options
 * @param {boolean} [options.shouldBeReady = true] - whether to return a promise that represents a ready app
 * @param {Object} [options.appOptions = undefined] - extra options that should be passed to `spectron`
 * @return {Application|Promise<Application>} target app
 */
export default (options = {}) => {
  const { shouldBeReady = true } = options;
  let { appOptions } = options;
  appOptions = _.assign(defaultAppOptions, appOptions);

  // patch spectron stop
  Application.prototype.stop = function() {
    const self = this;

    if (!self.isRunning()) {
      return Promise.reject(Error('Application not running'));
    }

    return new Promise((resolve, reject) => {
      const endClient = function() {
        setTimeout(() => {
          self.client.end().then(() => {
            self.chromeDriver.stop();
            self.running = false;
            resolve(self);
          }, reject);
        }, self.quitTimeout);
      };

      self.client.getWindowCount().then(count => {
        const winIdx = count - 1;
        if (self.api.nodeIntegration) {
          self.client
            .windowByIndex(winIdx)
            .electron.remote.app.quit()
            .then(endClient, reject);
        } else {
          self.client
            .windowByIndex(winIdx)
            .execute(() => {
              require('electron').remote.app.quit();
            })
            .then(endClient, reject);
        }
      });
    });
  };

  const app = new Application(appOptions);

  if (shouldBeReady) {
    return app
      .start()
      .then(() => {
        return Promise.race([
          new Promise(resolve => {
            const getTitle = () => {
              app.client.getWindowCount().then(count => {
                const winIdx = count - 1;
                return app.client
                  .windowByIndex(winIdx)
                  .getTitle()
                  .then(title => {
                    if (title === 'dbKoda') {
                      return resolve(
                        app.client
                          .windowByIndex(winIdx)
                          .waitUntilTextExists('#pt-tab-title_EditorTabs_Default', 'Home')
                      );
                    }
                    _.delay(getTitle, 200);
                  });
              });
            };
            getTitle();
          }),
          new Promise((resolve, reject) => {
            _.delay(() => {
              reject(new Error('Timed out before app is ready'));
            }, 10000); // 10 sec timeout for app to be ready
          })
        ]);
      })
      .then(() => {
        return app.client.execute(browserSideTestingHelper).then(() => app);
      })
      .catch(err => {
        const rethrow = () => Promise.reject(err);
        if (app.isRunning()) {
          return app
            .stop()
            .then(rethrow)
            .catch(rethrow);
        }
        return rethrow();
      });
  }
  return app;
};
