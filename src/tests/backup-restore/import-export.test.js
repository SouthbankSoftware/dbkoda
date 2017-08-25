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
 * Created by joey on 25/8/17.
 */
import assert from 'assert';
import {getRandomPort, killMongoInstance, launchSingleInstance, generateMongoData} from 'test-utils';
import ConnectionProfile from '../pageObjects/Connection';
import BackupRestore, {ParameterName} from '../pageObjects/BackupRestore';
import TreeAction from '../pageObjects/TreeAction';
import Tree from '../pageObjects/Tree';

import {getApp, config} from '../helpers';

describe('backup restore test suite', () => {
  config({initStateStore: false});
  let mongoPort;
  let connectProfile;
  let browser;
  let bkRestore;
  let app;
  let treeAction;
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
      app = res;
      browser = app.client;
      connectProfile = new ConnectionProfile(browser);
      bkRestore = new BackupRestore(browser);
      treeAction = new TreeAction(browser);
      tree = new Tree(browser);
    });
  });

  afterAll(() => {
    return cleanup();
  });

  test('import export a database', async () => {
    const dumpDbName = 'testdump-' + getRandomPort();
    const restoreDbName = 'testrestore-' + getRandomPort();
    generateMongoData(mongoPort, dumpDbName, 'testcol', '--num 500');
    generateMongoData(mongoPort, restoreDbName, 'placeholder');
    await connectProfile
      .connectProfileByHostname({
        alias: 'test backup ' + mongoPort,
        hostName: 'localhost',
        database: 'admin',
        port: mongoPort,
      });
    await bkRestore.exportDatabase(dumpDbName, {[ParameterName.pathInput]: `data/test/dump/${dumpDbName}`});
    await bkRestore.importCollectionToDatabase(restoreDbName, 'testcol', {[ParameterName.pathInput]: `data/test/dump/${dumpDbName}/testcol.json`});
    await tree._clickRefreshButton();
    // TODO: verify the restored database
    const nodes = await treeAction.getTreeNodeByPath(['Databases', restoreDbName, 'testcol']);
    console.log('get tree nodes ', nodes);
    assert.notEqual(nodes, null);
  });
});
