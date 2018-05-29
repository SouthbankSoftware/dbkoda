/**
 * @flow
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-04-27T11:01:11+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-29T18:11:33+10:00
 *
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
 */

// $FlowFixMe
import raygun from 'raygun';
import _ from 'lodash';
// $FlowFixMe
import sh from 'shelljs';
// $FlowFixMe
import Transport from 'winston-transport';
// $FlowFixMe
import { version, apiKey } from './pkginfo';
import OfflineStorage from './raygun.offline';

export let raygunClient; // eslint-disable-line

export const setUser = (user: { id: string }) => {
  raygunClient.user = () => ({
    identifier: user.id
  });
};

export const initRaygun = (cachePath: string, defaultTags: string[]) => {
  // ensure path exists
  sh.mkdir('-p', cachePath);

  raygunClient = new raygun.Client().init({
    apiKey,
    isOffline: true,
    offlineStorage: new OfflineStorage(),
    offlineStorageOptions: {
      cachePath,
      cacheLimit: 100
    }
  });

  defaultTags.push(global.IS_PRODUCTION ? 'prod' : 'dev');
  global.UAT && defaultTags.push('uat');

  raygunClient.setVersion(version);
  raygunClient.setTags(defaultTags);

  setUser({ id: 'beforeConfigLoaded' });

  if (IS_PRODUCTION) {
    raygunClient.onBeforeSend(payload => {
      _.unset(payload, 'details.machineName');

      return payload;
    });
  }
};

export let isRaygunEnabled = false; // eslint-disable-line

let retryRaygunTimeout = null;
const RETRY_RAYGUN_TIMEOUT = 300000; // after 5 min
const RETRY_RAYGUN_TIMES = 6; // retry for 30 min

const retryRaygun = (count: number) => {
  if (count > 0 && !retryRaygunTimeout) {
    raygunClient.offline();

    retryRaygunTimeout = setTimeout(() => {
      retryRaygunTimeout = null;
      // wait for Raygun to become available
      raygunClient.online(err => {
        if (err) {
          // failed to bring Raygun online, trying it again
          retryRaygun(count - 1);
        }
      });
    }, RETRY_RAYGUN_TIMEOUT);
  }
};

export const toggleRaygun = (enabled: boolean) => {
  if (retryRaygunTimeout) {
    clearTimeout(retryRaygunTimeout);
    retryRaygunTimeout = null;
  }

  if (enabled) {
    raygunClient.online();
    isRaygunEnabled = true;
  } else {
    raygunClient.offline();
    isRaygunEnabled = false;
  }
};

export const sendError = (
  error: Error,
  options: { customData?: *, callback?: *, request?: *, tags?: * }
) => {
  const { customData, callback, request, tags } = options || {};

  raygunClient.send(error, customData, callback, request, tags);
};

const raygunErrorMessages = {
  '5XX': 'Internal server error',
  '403': 'Over subscription plan limits',
  '401': 'Invalid API key'
};

// $FlowFixMe
console._error = console.error;

export class RaygunTransport extends Transport {
  log(info: *, callback: *) {
    const {
      error,
      raygun,
      customData: providedCustomData,
      callback: cb,
      request,
      tags,
      timestamp
    } = info;

    if (!error || raygun === false || process.env.NODE_ENV === 'test') {
      callback && callback();
      cb && cb();
      return;
    }

    // as `raygun4node` doesn't support customised timestamp yet, we provide `winston` timestamp as
    // customData
    const customData = _.assign({ winstonTimestamp: timestamp }, providedCustomData);

    sendError(error, {
      customData,
      callback: (err: Error, res: *) => {
        let raygunError;

        if (err) {
          raygunError = err;
          raygunError.message = `RaygunTransport: ${raygunError.message}`;
        } else if (res) {
          const code = res.statusCode > 499 ? '5XX' : res.statusCode;
          const errMsg = raygunErrorMessages[code];

          if (errMsg) {
            raygunError = new Error(`RaygunTransport: [${code}] ${errMsg}`);
          }
        }

        if (raygunError) {
          global.l._error(raygunError);

          if (isRaygunEnabled) {
            // Raygun is enabled but we have trouble to connect to Raygun server. We try to save the
            // error in offline cache and bring Raygun online again after a timeout
            retryRaygun(RETRY_RAYGUN_TIMES);

            sendError(error, {
              customData,
              request,
              tags,
              callback: (err: Error) => {
                if (err) {
                  l._error(err);
                }

                callback && callback();
                cb && cb(raygunError);
              }
            });
            return;
          }

          callback && callback();
          cb && cb(raygunError);
          return;
        }

        // at this point, error is correctly reported
        this.emit('logged');
        callback && callback();
        cb && cb(res);
      },
      request,
      tags
    });
  }
}

// by default crash process
let exitOnUnhandledError = process.env.NODE_ENV !== 'test';

const handleError = (err, desc) => {
  if (_.has(global, 'l.error')) {
    global.l.error(`${_.upperFirst(desc)}: `, err, {
      // $FlowFixMe
      [Symbol.for('info')]: {
        tags: [desc],
        callback: exitOnUnhandledError ? () => process.exit(1) : null
      }
    });
  } else {
    console.error(`${_.upperFirst(desc)}: `, err);
    exitOnUnhandledError && process.exit(1);
  }
};

const onUnhandledRejection = reason => {
  const err = reason instanceof Error ? reason : new Error(String(reason));

  handleError(err, 'unhandled-rejection');
};

const onUncaughtException = err => {
  handleError(err, 'unhandled-exception');
};

process.on('unhandledRejection', onUnhandledRejection);
process.on('uncaughtException', onUncaughtException);

export const setExitOnUnhandledError = (value: boolean) => {
  exitOnUnhandledError = value;
};
