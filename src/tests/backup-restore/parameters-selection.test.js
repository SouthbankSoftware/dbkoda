/*
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
/**
 * Test mongo dump/restore parameter selections
 *
 * Created by joey on 21/8/17.
 */

import assert from 'assert';
import {getRandomPort, killMongoInstance, launchSingleInstance, generateMongoData} from 'test-utils';
import ConnectionProfile from '../pageObjects/Connection';
import BackupRestore, {ParameterName, TreeActions} from '../pageObjects/BackupRestore';

import {getApp, config} from '../helpers';

describe('backup restore test suite', () => {
  config();
  let mongoPort;
  let connectProfile;
  let browser;
  let bkRestore;
  let app;
  let dumpDbName;

  const cleanup = () => {
    killMongoInstance(mongoPort);
    if (app && app.isRunning()) {
      return app.stop();
    }
  };

  beforeAll(async () => {
    mongoPort = getRandomPort();
    launchSingleInstance(mongoPort);
    process.on('SIGINT', cleanup);
    return getApp().then(async (res) => {
      dumpDbName = 'testdump-' + getRandomPort();
      generateMongoData(mongoPort, dumpDbName, 'testcol', '--num 10');
      app = res;
      browser = app.client;
      connectProfile = new ConnectionProfile(browser);
      bkRestore = new BackupRestore(browser);
    });
  });

  afterAll(() => {
    return cleanup();
  });

  test('mongodump parameter values', async () => {
    await connectProfile
      .connectProfileByHostname({
        alias: 'test backup ' + mongoPort,
        hostName: 'localhost',
        database: 'admin',
        port: mongoPort,
      });
    try {
      await bkRestore.openMongoBackupRestorePanel(['Databases', dumpDbName], TreeActions.DUMP_DATABASE,
        {
          [ParameterName.gzip]: true,
          [ParameterName.forceTableScan]: true,
          [ParameterName.query]: '{user.name: "Joey"}',
          [ParameterName.pathInput]: 'data/test/dump',
          [ParameterName.readPreference]: 'primaryPreferred',
          [ParameterName.repair]: true,
          [ParameterName.dumpDbUsersAndRoles]: true,
          [ParameterName.viewsAsCollections]: true
        });
      await browser.pause(1000);
      assert.equal(await bkRestore.getParameterValue(ParameterName.gzip), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.forceTableScan), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.repair), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.dumpDbUsersAndRoles), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.viewsAsCollections), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.query), '{user.name: "Joey"}');
      assert.equal(await bkRestore.getParameterValue(ParameterName.pathInput), 'data/test/dump');
    } catch (err) {
      console.error('get error ', err);
      assert.fail(err.message);
    }
  });
});
