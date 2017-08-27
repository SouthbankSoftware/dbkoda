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
 * Test mongo import parameter selections
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

describe('mongo import test suite', () => {
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
      dbName = 'testimport-' + getRandomPort();
      generateMongoData(mongoPort, dbName, 'testcol', '--num 10');
      app = res;
      browser = app.client;
      connectProfile = new ConnectionProfile(browser);
      bkRestore = new BackupRestore(browser);
      tree = new TreeAction(browser);
      editor = new Editor(browser);
      await connectProfile
        .connectProfileByHostname({
          alias: 'test import a database ' + mongoPort,
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

  test('import a database to verify its parameter values', async () => {
    try {
      const params = {
        [ParameterName.pathInput]: 'data/test/dump',
        [ParameterName.collection]: 'test-import-collections',
        [ParameterName.fields]: '',
        [ParameterName.headerLine]: true,
        [ParameterName.jsonArray]: true,
        [ParameterName.columnsHaveTypes]: '',
        [ParameterName.drop]: true,
        [ParameterName.ignoreBlanks]: true,
        [ParameterName.maintainInsertionOrder]: true,
        [ParameterName.stopOnError]: true,
        [ParameterName.upsertFields]: '',
        [ParameterName.writeConcern]: '',
        [ParameterName.bypassDocumentValidation]: true,
      };
      await bkRestore.openMongoBackupRestorePanel(['Databases', dbName], TreeActions.IMPORT_COLLECTIONS, params);
      await browser.pause(1000);
      assert.equal(await bkRestore.getParameterValue(ParameterName.database), dbName);
      assert.equal(await bkRestore.getParameterValue(ParameterName.pathInput), 'data/test/dump');
      assert.equal(await bkRestore.getParameterValue(ParameterName.fields), '');
      assert.equal(await bkRestore.getParameterValue(ParameterName.jsonArray), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.headerLine), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.fields), '');
      assert.equal(await bkRestore.getParameterValue(ParameterName.collection), 'test-import-collections');
      assert.equal(await bkRestore.getParameterValue(ParameterName.columnsHaveTypes), '');
      assert.equal(await bkRestore.getParameterValue(ParameterName.drop), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.ignoreBlanks), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.maintainInsertionOrder), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.stopOnError), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.upsertFields), '');
      assert.equal(await bkRestore.getParameterValue(ParameterName.writeConcern), '');
      assert.equal(await bkRestore.getParameterValue(ParameterName.bypassDocumentValidation), 'true');
      const cmd = await editor._getEditorContentsAsString();
      assert.equal(cmd, `mongoimport --host localhost --port ${mongoPort} --db ${dbName} --collection test-import-collections --headerLine --jsonArray --parseGrace stop --drop --ignoreBlanks --maintainInsertionOrder --stopOnError --mode insert --bypassDocumentValidation data/test/dump`);
    } catch (err) {
      console.error(err);
      assert.fail(true, false, err.message);
    }
  });

  test('import a collection to verify its parameter values', async () => {
    try {
      const params = {
        [ParameterName.pathInput]: 'data/test/dump',
        [ParameterName.fields]: '',
        [ParameterName.headerLine]: true,
        [ParameterName.jsonArray]: true,
        [ParameterName.columnsHaveTypes]: '',
        [ParameterName.drop]: true,
        [ParameterName.ignoreBlanks]: true,
        [ParameterName.maintainInsertionOrder]: true,
        [ParameterName.stopOnError]: true,
        [ParameterName.upsertFields]: '',
        [ParameterName.writeConcern]: '',
        [ParameterName.bypassDocumentValidation]: true,
      };
      await bkRestore.openMongoBackupRestorePanel(['Databases', dbName, 'testcol'], TreeActions.IMPORT_COLLECTION, params);
      await browser.pause(1000);
      assert.equal(await bkRestore.getParameterValue(ParameterName.database), dbName);
      assert.equal(await bkRestore.getParameterValue(ParameterName.pathInput), 'data/test/dump');
      assert.equal(await bkRestore.getParameterValue(ParameterName.fields), '');
      assert.equal(await bkRestore.getParameterValue(ParameterName.jsonArray), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.headerLine), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.fields), '');
      assert.equal(await bkRestore.getParameterValue(ParameterName.collection), 'testcol');
      assert.equal(await bkRestore.getParameterValue(ParameterName.columnsHaveTypes), '');
      assert.equal(await bkRestore.getParameterValue(ParameterName.drop), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.ignoreBlanks), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.maintainInsertionOrder), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.stopOnError), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.upsertFields), '');
      assert.equal(await bkRestore.getParameterValue(ParameterName.writeConcern), '');
      assert.equal(await bkRestore.getParameterValue(ParameterName.bypassDocumentValidation), 'true');
      const cmd = await editor._getEditorContentsAsString();
      assert.equal(cmd, `mongoimport --host localhost --port ${mongoPort} --db ${dbName} --collection testcol --headerLine --jsonArray --parseGrace stop --drop --ignoreBlanks --maintainInsertionOrder --stopOnError --mode insert --bypassDocumentValidation data/test/dump`);
    } catch (err) {
      console.error(err);
      assert.fail(true, false, err.message);
    }
  });
});
