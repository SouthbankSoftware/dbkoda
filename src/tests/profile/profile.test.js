/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-16T14:56:57+10:00
 */

import assert from 'assert';
import uuidV1 from 'uuid/v1';
import {getRandomPort, killMongoInstance, launchSingleInstance} from 'test-utils';

import ProfileList from '../pageObjects/ProfileList';
import ConnectionProfile from '../pageObjects/Connection';

import {config, getApp} from '../helpers';

describe('test profile list', () => {
  config();

  let profileList;
  let app;
  let browser;
  let mongoPort;
  let connectProfile;

  beforeAll(async () => {
    return getApp().then((res) => {
      app = res;
      browser = app.client;
      profileList = new ProfileList(browser);
      connectProfile = new ConnectionProfile(browser);
      mongoPort = getRandomPort();
      launchSingleInstance(mongoPort);
    });
  });

  afterAll(() => {
    killMongoInstance(mongoPort);
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  test('check toolbar exists on profile list panel', () => {
    return profileList.exist();
  });

  test('open and close connection ', () => {
    return profileList
      .openConnectionProfile()
      .then(() => {
        return connectProfile.closeConnectionProfile();
      })
      .then(() => {
        return profileList.exist();
      });
  });

  test('create new connection', () => {
    return connectProfile
      .connectProfileByHostname({
        alias: 'connect-profile-' + mongoPort + '(' + getRandomPort() + ')',
        hostName: 'localhost',
        port: mongoPort,
        database: 'test'
      })
      .then(() => {
        return profileList.getConnectionProfileList();
      })
      .then((elements) => {
        assert(elements.value.length, 1);
      })
      .then(() => {
        return connectProfile.connectProfileByURL({
          alias: 'connect-profile-' + mongoPort + '(' + getRandomPort() + ')',
          url: 'mongodb://localhost:' + mongoPort,
          database: 'test'
        });
      })
      .then(() => {
        return profileList.getConnectionProfileList();
      })
      .then((elements) => {
        assert(elements.value.length, 2);
      });
  });

  test('click connection ', () => {
    return profileList
      .clickProfile(0)
      .waitForEnabled(profileList.closeProfileButtonSelector)
      .waitUntil(() => {
        return browser
          .getAttribute(profileList.removeProfileButtonSelector, 'disabled')
          .then((disabled) => {
            return disabled === 'true';
          });
      });
  });

  test('close connection', () => {
    return profileList
      .closeConnectionProfile()
      .waitForEnabled(profileList.removeProfileButtonSelector)
      .waitForEnabled(profileList.editProfileButtonSelector);
  });

  test('edit connection', () => {
    return profileList
      .editConnectionProfile()
      .then(() => {
        return connectProfile.getCurrentProfileData();
      })
      .then((profile) => {
        assert(profile.hostName, 'localhost');
        assert(profile.port, mongoPort);
        assert(profile.database, 'test');
        return connectProfile.connectProfileByHostname({
          alias: 'connect-profile-' + mongoPort + '(' + getRandomPort() + ')',
          url: 'mongodb://localhost:' + mongoPort,
          database: 'admin'
        });
      })
      .then(() => {
        return browser.waitForEnabled(profileList.closeProfileButtonSelector);
      });
  });

  test('remove connection', () => {
    return profileList
      .clickProfile(1)
      .then(() => {
        return profileList.closeConnectionProfile();
      })
      .then(() => {
        return browser.waitForEnabled(profileList.removeProfileButtonSelector);
      })
      .then(() => {
        return profileList.removeConnectionProfile();
      })
      .then(() => {
        return profileList.getConnectionProfileList();
      })
      .then((elements) => {
        assert.equal(1, elements.value.length);
      });
  });

  test('save connection', async () => {
    await profileList.openConnectionProfile();
    await connectProfile.saveProfile({
      alias: 'Connection ' + uuidV1(),
      hostName: 'localhost',
      port: mongoPort,
      database: 'test'
    });
    await browser.pause(1000);
    const elements = await profileList.getConnectionProfileList();
    assert.equal(elements.value.length, 2);
  });
});
