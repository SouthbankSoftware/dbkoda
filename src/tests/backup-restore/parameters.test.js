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
import {generateMongoData, getRandomPort, killMongoInstance, launchSingleInstance} from 'test-utils';
import ConnectionProfile from '../pageObjects/Connection';
import BackupRestore, {ParameterName, TreeActions} from '../pageObjects/BackupRestore';
import TreeAction from '../pageObjects/TreeAction';

import {config, getApp} from '../helpers';

describe('backup restore test suite', () => {
  config();
  let mongoPort;
  let connectProfile;
  let browser;
  let bkRestore;
  let app;
  let dumpDbName;
  let tree;

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
      await bkRestore.closePanel();
      await tree.toogleExpandTreeNode(
        tree.databasesNodeSelector
      );
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
      await bkRestore.closePanel();
      await tree.toogleExpandTreeNode(
        tree.databasesNodeSelector
      );
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
      await bkRestore.closePanel();
      await tree.toogleExpandTreeNode(
        tree.databasesNodeSelector
      );
    } catch (err) {
      console.error('get error ', err);
      assert.fail(true, false, err.message);
    }
  });

  test('restore a server to verify parameter values', async () => {
    try {
      const params = {
        [ParameterName.database]: dumpDbName,
        [ParameterName.drop]: true,
        [ParameterName.pathInput]: 'data/test/dump',
        [ParameterName.dryRun]: true,
        [ParameterName.writeConcern]: 'majority',
        [ParameterName.noIndexRestore]: true,
        [ParameterName.noOptionsRestore]: true,
        [ParameterName.keepIndexVersion]: true,
        [ParameterName.maintainInsertionOrder]: true,
        [ParameterName.numParallelCollections]: 5,
        [ParameterName.numInsertionWorkers]: 3,
        [ParameterName.stopOnError]: true,
        [ParameterName.bypassDocumentValidation]: true,
        [ParameterName.objcheck]: true,
        [ParameterName.oplogReplay]: true,
        [ParameterName.oplogLimit]: 10,
        [ParameterName.restoreDbUsersAndRoles]: true,
        [ParameterName.gzip]: true,
      };
      await bkRestore.openMongoBackupRestorePanel(['Databases'], TreeActions.RESTORE_DATABASES, params);
      await browser.pause(1000);
      assert.equal(await bkRestore.getParameterValue(ParameterName.database), dumpDbName);
      assert.equal(await bkRestore.getParameterValue(ParameterName.drop), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.pathInput), 'data/test/dump');
      assert.equal(await bkRestore.getParameterValue(ParameterName.dryRun), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.writeConcern), 'majority');
      assert.equal(await bkRestore.getParameterValue(ParameterName.noIndexRestore), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.noOptionsRestore), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.keepIndexVersion), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.maintainInsertionOrder), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.numParallelCollections), '5');
      assert.equal(await bkRestore.getParameterValue(ParameterName.numInsertionWorkers), '3');
      assert.equal(await bkRestore.getParameterValue(ParameterName.stopOnError), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.bypassDocumentValidation), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.objcheck), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.oplogReplay), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.oplogLimit), '10');
      assert.equal(await bkRestore.getParameterValue(ParameterName.restoreDbUsersAndRoles), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.gzip), 'true');
      await bkRestore.closePanel();
      await tree.toogleExpandTreeNode(
        tree.databasesNodeSelector
      );
    } catch (err) {
      console.error('get error ', err);
      assert.fail(true, false);
    }
  });

  test('restore a database to verify its parameter values', async () => {
      try {
        const params = {
          [ParameterName.drop]: true,
          [ParameterName.collection]: 'testcol',
          [ParameterName.pathInput]: 'data/test/dump',
          [ParameterName.dryRun]: true,
          [ParameterName.writeConcern]: 'majority',
          [ParameterName.noIndexRestore]: true,
          [ParameterName.noOptionsRestore]: true,
          [ParameterName.keepIndexVersion]: true,
          [ParameterName.maintainInsertionOrder]: true,
          [ParameterName.numParallelCollections]: 5,
          [ParameterName.numInsertionWorkers]: 3,
          [ParameterName.stopOnError]: true,
          [ParameterName.bypassDocumentValidation]: true,
          [ParameterName.objcheck]: true,
          [ParameterName.oplogReplay]: true,
          [ParameterName.oplogLimit]: 10,
          [ParameterName.restoreDbUsersAndRoles]: true,
          [ParameterName.gzip]: true,
        };
        await bkRestore.openMongoBackupRestorePanel(['Databases', dumpDbName], TreeActions.RESTORE_DATABASE, params);
        await browser.pause(1000);
        assert.equal(await bkRestore.getParameterValue(ParameterName.database), dumpDbName);
        assert.equal(await bkRestore.getParameterValue(ParameterName.collection), 'testcol');
        assert.equal(await bkRestore.getParameterValue(ParameterName.drop), 'true');
        assert.equal(await bkRestore.getParameterValue(ParameterName.pathInput), 'data/test/dump');
        assert.equal(await bkRestore.getParameterValue(ParameterName.dryRun), 'true');
        assert.equal(await bkRestore.getParameterValue(ParameterName.writeConcern), 'majority');
        assert.equal(await bkRestore.getParameterValue(ParameterName.noIndexRestore), 'true');
        assert.equal(await bkRestore.getParameterValue(ParameterName.noOptionsRestore), 'true');
        assert.equal(await bkRestore.getParameterValue(ParameterName.keepIndexVersion), 'true');
        assert.equal(await bkRestore.getParameterValue(ParameterName.maintainInsertionOrder), 'true');
        assert.equal(await bkRestore.getParameterValue(ParameterName.numParallelCollections), '5');
        assert.equal(await bkRestore.getParameterValue(ParameterName.numInsertionWorkers), '3');
        assert.equal(await bkRestore.getParameterValue(ParameterName.stopOnError), 'true');
        assert.equal(await bkRestore.getParameterValue(ParameterName.bypassDocumentValidation), 'true');
        assert.equal(await bkRestore.getParameterValue(ParameterName.objcheck), 'true');
        assert.equal(await bkRestore.getParameterValue(ParameterName.oplogReplay), 'true');
        assert.equal(await bkRestore.getParameterValue(ParameterName.oplogLimit), '10');
        assert.equal(await bkRestore.getParameterValue(ParameterName.restoreDbUsersAndRoles), 'true');
        assert.equal(await bkRestore.getParameterValue(ParameterName.gzip), 'true');
        await bkRestore.closePanel();
        await tree.toogleExpandTreeNode(
          tree.databasesNodeSelector
        );
      } catch (err) {
        console.error('get error ', err);
        assert.fail(true, false);
      }
  });

  test('restore a collection to verify its parameter values', async () => {
    try {
      const params = {
        [ParameterName.drop]: true,
        [ParameterName.pathInput]: 'data/test/dump',
        [ParameterName.dryRun]: true,
        [ParameterName.writeConcern]: 'majority',
        [ParameterName.noIndexRestore]: true,
        [ParameterName.noOptionsRestore]: true,
        [ParameterName.keepIndexVersion]: true,
        [ParameterName.maintainInsertionOrder]: true,
        [ParameterName.numParallelCollections]: 5,
        [ParameterName.numInsertionWorkers]: 3,
        [ParameterName.stopOnError]: true,
        [ParameterName.bypassDocumentValidation]: true,
        [ParameterName.objcheck]: true,
        [ParameterName.oplogReplay]: true,
        [ParameterName.oplogLimit]: 10,
        [ParameterName.restoreDbUsersAndRoles]: true,
        [ParameterName.gzip]: true,
      };
      await bkRestore.openMongoBackupRestorePanel(['Databases', dumpDbName, 'testcol'], TreeActions.RESTORE_COLLECTION, params);
      await browser.pause(1000);
      assert.equal(await bkRestore.getParameterValue(ParameterName.database), dumpDbName);
      assert.equal(await bkRestore.getParameterValue(ParameterName.collection), 'testcol');
      assert.equal(await bkRestore.getParameterValue(ParameterName.drop), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.pathInput), 'data/test/dump');
      assert.equal(await bkRestore.getParameterValue(ParameterName.dryRun), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.writeConcern), 'majority');
      assert.equal(await bkRestore.getParameterValue(ParameterName.noIndexRestore), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.noOptionsRestore), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.keepIndexVersion), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.maintainInsertionOrder), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.numParallelCollections), '5');
      assert.equal(await bkRestore.getParameterValue(ParameterName.numInsertionWorkers), '3');
      assert.equal(await bkRestore.getParameterValue(ParameterName.stopOnError), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.bypassDocumentValidation), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.objcheck), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.oplogReplay), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.oplogLimit), '10');
      assert.equal(await bkRestore.getParameterValue(ParameterName.restoreDbUsersAndRoles), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.gzip), 'true');
      await bkRestore.closePanel();
      await tree.toogleExpandTreeNode(
        tree.databasesNodeSelector
      );
    } catch (err) {
      console.error('get error ', err);
      assert.fail(true, false);
    }
  });
});
