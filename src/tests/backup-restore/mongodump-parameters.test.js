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
 * Test mongo dump parameter selections
 *
 * Created by joey on 21/8/17.
 */

import assert from 'assert';
import {generateMongoData, getRandomPort, killMongoInstance, launchSingleInstance} from 'test-utils';
import ConnectionProfile from '../pageObjects/Connection';
import BackupRestore, {ParameterName, TreeActions} from '../pageObjects/BackupRestore';
import TreeAction from '../pageObjects/TreeAction';
import Editor from '../pageObjects/Editor';

import {config, getApp} from '../helpers';

describe('mongo dump test suite', () => {
  config({initStateStore: true});
  let mongoPort;
  let connectProfile;
  let browser;
  let bkRestore;
  let app;
  let dumpDbName;
  let tree;
  let editor;

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
      tree = new TreeAction(browser);
      editor = new Editor(browser);
      await connectProfile
        .connectProfileByHostname({
          alias: 'test dump a database ' + mongoPort,
          hostName: 'localhost',
          database: 'admin',
          port: mongoPort,
        });
    });
  });

  afterAll(() => {
    return cleanup();
  });

  afterEach( async () => {
    await bkRestore.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  });

  /**
   * select one database and click dump database from tree action, verify each parameter values
   */
  test('mongodump on a single database to verify parameter values', async () => {
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
      const cmd = await editor._getEditorContentsAsString();
      assert.equal(cmd, `mongodump --host localhost --port ${mongoPort} --db ${dumpDbName} --gzip --repair --dumpDbUsersAndRoles --viewsAsCollections --numParallelCollections 4 -q {user.name: "Joey"} --readPreference primaryPreferred --forceTableScan -o data/test/dump `);
    } catch (err) {
      console.error('get error ', err);
      assert.fail(true, false, err.message);
    }
  });

  /**
   * click dump database on Databases node from tree action, verify each parameter values
   */
  test('mongodump on a server to verify parameter values', async () => {
    try {
      await bkRestore.openMongoBackupRestorePanel(['Databases'], TreeActions.DUMP_DATABASES,
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
      assert.equal(await bkRestore.getParameterValue(ParameterName.readPreference), 'primaryPreferred');
      const cmd = await editor._getEditorContentsAsString();
      assert.equal(cmd, `mongodump --host localhost --port ${mongoPort} --gzip --repair --dumpDbUsersAndRoles --viewsAsCollections --numParallelCollections 4 -q {user.name: "Joey"} --readPreference primaryPreferred --forceTableScan -o data/test/dump `);
    } catch (err) {
      console.error('get error ', err);
      assert.fail(true, false, err.message);
    }
  });

  /**
   * click on a collection and open mongo dump to verify all parameters
   */
  test('mongodump on a collection to verify parameter values', async () => {
    try {
      await bkRestore.openMongoBackupRestorePanel(['Databases', dumpDbName, 'testcol'], TreeActions.DUMP_COLLECTION,
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
      const cmd = await editor._getEditorContentsAsString();
      assert.equal(cmd, `mongodump --host localhost --port ${mongoPort} --db ${dumpDbName} --gzip --repair --dumpDbUsersAndRoles --viewsAsCollections --numParallelCollections 4 -q {user.name: "Joey"} --readPreference primaryPreferred --forceTableScan -o data/test/dump `);
    } catch (err) {
      console.error('get error ', err);
      assert.fail(true, false, err.message);
    }
  });
});
