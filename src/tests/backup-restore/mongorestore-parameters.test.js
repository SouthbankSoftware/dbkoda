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
 * Test mongo restore parameter selections
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

describe('mongo restore test suite', () => {
  config({initStateStore: false});
  let mongoPort;
  let connectProfile;
  let browser;
  let bkRestore;
  let app;
  let dbName;
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
      dbName = 'testdump-' + getRandomPort();
      generateMongoData(mongoPort, dbName, 'testcol', '--num 10');
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

  afterEach(async () => {
    await bkRestore.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  });

  test('restore a server to verify parameter values', async () => {
    try {
      const params = {
        [ParameterName.database]: dbName,
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
      assert.equal(await bkRestore.getParameterValue(ParameterName.database), dbName);
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
      const cmd = await editor._getEditorContentsAsString();
      assert.equal(cmd, `mongorestore --host localhost --port ${mongoPort} --db ${dbName} --objcheck --oplogReplay --oplogLimit 10 --restoreDbUsersAndRoles --gzip --drop -dryRun --writeConcern majority --noIndexRestore --noOptionsRestore --keepIndexVersion --maintainInsertionOrder --numParallelCollections 5 --numInsertionWorkersPerCollection 3 --stopOnError --bypassDocumentValidation data/test/dump`);
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
      await bkRestore.openMongoBackupRestorePanel(['Databases', dbName], TreeActions.RESTORE_DATABASE, params);
      await browser.pause(1000);
      assert.equal(await bkRestore.getParameterValue(ParameterName.database), dbName);
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
      const cmd = await editor._getEditorContentsAsString();
      assert.equal(cmd, `mongorestore --host localhost --port ${mongoPort} --db ${dbName} --collection testcol --objcheck --oplogReplay --oplogLimit 10 --restoreDbUsersAndRoles --gzip --drop -dryRun --writeConcern majority --noIndexRestore --noOptionsRestore --keepIndexVersion --maintainInsertionOrder --numParallelCollections 5 --numInsertionWorkersPerCollection 3 --stopOnError --bypassDocumentValidation data/test/dump`);
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
      await bkRestore.openMongoBackupRestorePanel(['Databases', dbName, 'testcol'], TreeActions.RESTORE_COLLECTION, params);
      await browser.pause(1000);
      assert.equal(await bkRestore.getParameterValue(ParameterName.database), dbName);
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
      const cmd = await editor._getEditorContentsAsString();
      assert.equal(cmd, `mongorestore --host localhost --port ${mongoPort} --db ${dbName} --collection testcol --objcheck --oplogReplay --oplogLimit 10 --restoreDbUsersAndRoles --gzip --drop -dryRun --writeConcern majority --noIndexRestore --noOptionsRestore --keepIndexVersion --maintainInsertionOrder --numParallelCollections 5 --numInsertionWorkersPerCollection 3 --stopOnError --bypassDocumentValidation data/test/dump`);
    } catch (err) {
      console.error('get error ', err);
      assert.fail(true, false);
    }
  });
});
