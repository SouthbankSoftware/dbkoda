/**
 * Test connection profile
 *
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-27T13:30:58+11:00
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

import assert from 'assert';
import os from 'os';
import { getRandomPort, killMongoInstance, launchSingleInstance } from 'test-utils';
import ConnectionProfile from '../pageObjects/Connection';
import { config, getApp } from '../helpers';

describe('connection-profile-test-suite', () => {
  // always config test suite
  config({ setupFailFastTest: false });
  const closeApp = true; // Set to false if you want to play with app after connections are created
  /** Global (to current test suite) vars */
  const r = {};
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
    r.ec2 = process.env.EC2_SHARD_CLUSTER_HOSTNAME;
    r.ec2User = process.env.EC2_SHARD_CLUSTER_USERNAME;
    r.ec2Pass = process.env.EC2_SHARD_CLUSTER_PASSWORD;
    r.ec2SshUser = process.env.EC2_SHARD_CLUSTER_USER_SSH;
    r.ec2SshKey = process.env.EC2_SHARD_CLUSTER_USER_KEY;
    r.ec2SshKey2 = process.env.EC2_SHARD_CLUSTER_USER_KEY2;
    r.ec2SshKeyPass = process.env.EC2_SHARD_CLUSTER_USER_PASSPHRASE;
    r.ec2LocalPort = getRandomPort();
    r.ec2LocalPort2 = getRandomPort();

    mongoPort = getRandomPort();
    launchSingleInstance(mongoPort);
    authMongoPort = getRandomPort();
    if (os.platform() !== 'win32') {
      launchSingleInstance(
        authMongoPort,
        '--auth --username admin --password 123456 --auth-db admin',
      );
    }
    process.on('SIGINT', cleanup);
    return getApp().then(async (res) => {
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
          database: 'admin',
        })
        .then(() => {
          return browser.getAttribute(connectProfile.connectButtonSelector, 'disabled');
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
      .then(() => browser.waitForExist(connectProfile.newProfileButtonSelector));
  });

  test('open connection profile through hostname', () => {
    return connectProfile
      .connectProfileByHostname({
        alias: 'Test ' + mongoPort + '(' + getRandomPort() + ')',
        hostName: 'localhost',
        port: mongoPort,
        database: 'test',
      })
      .catch(err => assert.fail(false, true, err));
  });

  test('open connection profile through url', () => {
    return connectProfile.connectProfileByURL({
      alias: 'TestUrl' + mongoPort + '(' + getRandomPort() + ')',
      url: 'mongodb://localhost:' + mongoPort,
      database: 'test',
    });
  });

  test('open atlas connection with SSL', () => {
    return connectProfile
      .connectProfileByURL({
        alias: 'Atlas' + getRandomPort(),
        url: `mongodb://${process.env.ATLAS_SERVER_HOSTNAME}`,
        database: 'admin',
        authentication: true,
        ssl: true,
        userName: process.env.ATLAS_SERVER_USERNAME,
        password: process.env.ATLAS_SERVER_PASSWORD,
      })
      .then(() => {
        browser.waitForExist(connectProfile.newProfileButtonSelector);
      })
      .catch(err => assert.fail(false, true, err));
  });

  test('connect to mongo instance with authentication', () => {
    if (os.platform() === 'win32') {
      return;
    }
    return connectProfile.connectProfileByURL({
      alias: 'TestAuth' + mongoPort + '(' + getRandomPort() + ')',
      url: 'mongodb://localhost:' + authMongoPort,
      database: 'admin',
      authentication: true,
      userName: 'admin',
      password: '123456',
    });
  });

  test('connect to mongo instance with authentication through hostname', () => {
    if (os.platform() === 'win32') {
      return;
    }
    return connectProfile
      .connectProfileByHostname({
        alias: 'TestAuth' + mongoPort + '(' + getRandomPort() + ')',
        hostName: 'localhost',
        port: authMongoPort,
        database: 'admin',
        authentication: true,
        userName: 'admin',
        password: '123456',
      })
      .catch(err => console.error(err));
  });

  test('Connect Mongo 3.0', () => {
    return connectProfile
      .connectProfileByHostname({
        alias: 'Test30' + mongoPort + '(' + getRandomPort() + ')',
        hostName: process.env.EC2_SHARD_CLUSTER_HOSTNAME,
        port: 27030,
        database: 'test',
      })
      .catch(err => assert.fail(false, true, err));
  });

  test('Connect Mongo 3.2', () => {
    return connectProfile
      .connectProfileByHostname({
        alias: 'Test32' + mongoPort + '(' + getRandomPort() + ')',
        hostName: process.env.EC2_SHARD_CLUSTER_HOSTNAME,
        port: 27032,
        database: 'test',
      })
      .catch(err => assert.fail(false, true, err));
  });

  test('open connection profile through hostname via SSH Tunnel', () => {
    return connectProfile
      .connectProfileByHostname({
        alias: 'Test EC2 with SSH (27017)',
        hostName: r.ec2,
        port: 27017,
        database: 'admin',
        ssh: true,
        remoteHost: r.ec2,
        remoteUser: r.ec2SshUser,
        keyRadio: true,
        sshKeyFile: r.ec2SshKey2,
        authentication: true,
        userName: r.ec2User,
        password: r.ec2Pass,
        sshTunnel: true,
      })
      .catch(err => assert.fail(false, true, err));
  });

  test('open connection profile through hostname via SSH Tunnel with passPhrase', () => {
    return connectProfile
      .connectProfileByHostname({
        alias: 'Test EC2 with SSH + passPhrase(27017)',
        hostName: r.ec2,
        port: 27017,
        database: 'admin',
        ssh: true,
        remoteHost: r.ec2,
        remoteUser: r.ec2SshUser,
        keyRadio: true,
        sshKeyFile: r.ec2SshKey,
        passPhrase: r.ec2SshKeyPass,
        authentication: true,
        userName: r.ec2User,
        password: r.ec2Pass,
        sshTunnel: true,
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
