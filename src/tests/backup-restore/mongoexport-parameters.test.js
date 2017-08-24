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

  afterEach(async () => {
    await bkRestore.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  });

  test('export a collection to verify its parameter values', async () => {
    try {
      const params = {
        [ParameterName.pathInput]: 'data/test/dump',
        [ParameterName.pretty]: true,
        [ParameterName.jsonArray]: true,
        [ParameterName.noHeaderLine]: true,
        [ParameterName.fields]: '',
        [ParameterName.forceTableScan]: true,
        [ParameterName.assertExists]: true,
        [ParameterName.query]: '{name: "joey"}',
        [ParameterName.readPreference]: 'primaryPreferred',
        // TODO fix number input issue
        // [ParameterName.skip]: 100,
        // [ParameterName.limit]: 1000,
        [ParameterName.sort]: '1',
      };
      await bkRestore.openMongoBackupRestorePanel(['Databases', dumpDbName, 'testcol'], TreeActions.EXPORT_COLLECTION, params);
      await browser.pause(1000);
      assert.equal(await bkRestore.getParameterValue(ParameterName.database), dumpDbName);
      assert.equal(await bkRestore.getParameterValue(ParameterName.pathInput), 'data/test/dump');
      // assert.equal(await bkRestore.getParameterValue(ParameterName.collection), 'testcol');
      assert.equal(await bkRestore.getParameterValue(ParameterName.pretty), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.jsonArray), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.noHeaderLine), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.fields), '');
      assert.equal(await bkRestore.getParameterValue(ParameterName.forceTableScan), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.assertExists), 'true');
      assert.equal(await bkRestore.getParameterValue(ParameterName.query), '{name: "joey"}');
      assert.equal(await bkRestore.getParameterValue(ParameterName.readPreference), 'primaryPreferred');
      // assert.equal(await bkRestore.getParameterValue(ParameterName.skip), 100);
      // assert.equal(await bkRestore.getParameterValue(ParameterName.limit), 1000);
      assert.equal(await bkRestore.getParameterValue(ParameterName.sort), '1');


      const cmd = await editor._getEditorContentsAsString();
      assert.equal(cmd, `mongoexport --host localhost --port ${mongoPort} --db ${dumpDbName} --collection testcol --pretty --jsonArray --noHeaderLine --type json -q {name: "joey"} --readPreference primaryPreferred --forceTableScan --sort 1 --assertExists -o data/test/dump/testcol.json `);
    } catch (err) {
      console.error(err);
      assert.fail(true, false, err.message);
    }
  });
});
