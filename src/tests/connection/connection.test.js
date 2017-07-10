/**
 * Test connection profile
 *
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-16T14:32:42+10:00
 */
import assert from 'assert';
import {getRandomPort, killMongoInstance, launchSingleInstance} from 'test-utils';
import ConnectionProfile from '../pageObjects/Connection';
import {config, getApp} from '../helpers';

describe('connection-profile-test-suite', () => {
  // always config test suite
  config({setupFailFastTest: false});
  const closeApp = true;  // Set to false if you want to play with app after connections are created
  let app;
  let browser;
  let mongoPort;
  let connectProfile;
  let authMongoPort;
  const cleanup = () => {
    if (closeApp) {
      killMongoInstance(mongoPort);
      killMongoInstance(authMongoPort);
      if (app && app.isRunning()) {
        return app.stop();
      }
    } else {
      return true;
    }
  };

  beforeAll(async () => {
    mongoPort = getRandomPort();
    launchSingleInstance(mongoPort);
    authMongoPort = getRandomPort();
    launchSingleInstance(
      authMongoPort,
      '--auth --username admin --password 123456 --auth-db admin'
    );
    process.on('SIGINT', cleanup);
    return getApp().then((res) => {
      app = res;
      browser = app.client;
      connectProfile = new ConnectionProfile(browser);
    });
  });

  afterAll(() => {
    return cleanup();
  });

  test('fill in invalid url', () => {
    return new Promise((resolve, reject) => {
      return connectProfile
        .fillConnectionProfileData({
          alias: 'invalid connection ',
          url: 'localhost',
          database: 'admin'
        })
        .then(() => {
          return browser.getAttribute(
            connectProfile.connectButtonSelector,
            'disabled'
          );
        })
        .then((v) => {
          assert.equal('true', v);
          return connectProfile.closeConnectionProfile();
        })
        .then(() => resolve())
        .catch(err => reject(err));
    }).catch(err => assert.fail(false, true, err));
  });

  test('open and close connection panel', () => {
    return connectProfile
      .openConnectionProfilePanel()
      .then(() => connectProfile.closeConnectionProfile())
      .then(() =>
        browser.waitForExist(connectProfile.newProfileButtonSelector)
      );
  });

  test('open connection profile through hostname', () => {
    return connectProfile
      .connectProfileByHostname({
        alias: 'Test ' + mongoPort + '(' + getRandomPort() + ')',
        hostName: 'localhost',
        port: mongoPort,
        database: 'test'
      })
      .catch(err => assert.fail(false, true, err));
  });

  test('open connection profile through url', () => {
    return connectProfile.connectProfileByURL({
      alias: 'TestUrl' + mongoPort + '(' + getRandomPort() + ')',
      url: 'mongodb://localhost:' + mongoPort,
      database: 'test'
    });
  });


  test('open atlas connection with SSL', () => {
    return connectProfile.connectProfileByURL({
      alias: 'Atlas' + getRandomPort(),
      url: `mongodb://${process.env.ATLAS_SERVER_HOSTNAME}`,
      database: 'admin',
      authentication: true,
      ssl: true,
      userName: process.env.ATLAS_SERVER_USERNAME,
      password: process.env.ATLAS_SERVER_PASSWORD
    }).then(() => {
      browser.waitForExist(connectProfile.newProfileButtonSelector);
    })
      .catch(err => assert.fail(false, true, err));
  });

  test('connect to mongo instance with authentication', () => {
    return connectProfile.connectProfileByURL({
      alias: 'TestAuth' + mongoPort + '(' + getRandomPort() + ')',
      url: 'mongodb://localhost:' + authMongoPort,
      database: 'admin',
      authentication: true,
      userName: 'admin',
      password: '123456'
    });
  });

  test('connect to mongo instance with authentication through hostname', () => {
    return connectProfile.connectProfileByHostname({
      alias: 'TestAuth' + mongoPort + '(' + getRandomPort() + ')',
      hostName: 'localhost',
      port: authMongoPort,
      database: 'admin',
      authentication: true,
      userName: 'admin',
      password: '123456'
    }).catch(err => console.error(err));
  });


  test('Connect Mongo 3.0', () => {
    return connectProfile
      .connectProfileByHostname({
        alias: 'Test30' + mongoPort + '(' + getRandomPort() + ')',
        hostName: process.env.EC2_SHARD_CLUSTER_HOSTNAME,
        port: 27030,
        database: 'test'
      })
      .catch(err => assert.fail(false, true, err));
  });

  test('Connect Mongo 3.2', () => {
    return connectProfile
      .connectProfileByHostname({
        alias: 'Test32' + mongoPort + '(' + getRandomPort() + ')',
        hostName: process.env.EC2_SHARD_CLUSTER_HOSTNAME,
        port: 27032,
        database: 'test'
      })
      .catch(err => assert.fail(false, true, err));
  });

  // test('open atlas connection without SSL', () => {
  //     return connectProfile.connectProfileByURL({
  //             alias: 'Atlas' + getRandomPort(),
  //             url: process.env.ATLAS_SERVER_URL
  //             database: 'admin',
  //             authentication: true,
  //             ssl: true,
  //             userName: process.env.ATLAS_SERVER_USERNAME,
  //             password: process.env.ATLAS_SERVER_PASSWORD
  //         }).then(() => {
  //             assert.fail(false, true, 'no SSL connection should have failed');
  //         })
  //         .catch(() => connectProfile.closeConnectionProfile());
  // });
});
