/**
 * Created by joey on 24/5/17.
 */
import assert from 'assert';
import uuidV1 from 'uuid/v1';
import {
  generateMongoData,
  getRandomPort,
  killMongoInstance,
  launchSingleInstance
} from 'test-utils';

import ConnectionProfile from '../pageObjects/Connection';
import Editor from '../pageObjects/Editor';
import Output from '../pageObjects/Output';
import Explain from '../pageObjects/Explain';

import { config, getApp } from '../helpers';

describe('test explain', () => {
  // always config test suite
  config({ setupFailFastTest: false });

  let app;
  let browser;
  let mongoPort;
  let connectProfile;
  let editor;
  let output;
  let explain;

  const cleanup = async () => {
    killMongoInstance(mongoPort);
    if (app && app.isRunning()) {
      return app.stop();
    }
  };

  beforeAll(async (done) => {
    mongoPort = getRandomPort();
    launchSingleInstance(mongoPort);
    generateMongoData(mongoPort, 'test', 'users', '--num 500');
    process.on('SIGINT', cleanup);
    return getApp().then(async (res) => {
      app = res;
      browser = app.client;
      connectProfile = new ConnectionProfile(browser);
      explain = new Explain(browser);
      editor = new Editor(browser);
      output = new Output(browser);
      done();
    });
  });

  afterAll(() => {
    return cleanup();
  });

  test('run query plain show explain panel, run normal execution show normal output panel', async () => {
    try {
      const alias = 'connection:' + uuidV1();
      await connectProfile.connectProfileByURL({
        alias,
        url: 'mongodb://localhost:' + mongoPort,
        database: 'test'
      });
      await editor._appendToEditor('use test;\n');
      await editor._appendToEditor('db.users.find();\n');

      await editor.moveToText('db');

      await editor._clickExplainQueryPlanner();
      await browser.pause(2000);
      let tabName = await browser.getText(output.selectedTabSelector);
      assert.equal(tabName.indexOf('Explain') >= 0, true);
      const namespace = await explain.getCommandNamespace();
      assert.equal(namespace, 'test.users');

      await editor._clickExecuteAll();
      // after execute all, normal output panel should be shown
      await browser.pause(2000);
      tabName = await browser.getText(output.selectedTabSelector);
      assert.equal(tabName.indexOf('Explain') < 0, true);
    } catch (err) {
      console.error(err);
      assert.fail(true, false, err);
    }
  });

  test('check explain stage COLLSCAN', async () => {
    try {
      await editor.moveToText('db');
      await editor.clickExplainAllPlansExecution();
      await browser.pause(4000);
      const stages = await explain.getNumberOfStages();
      assert.equal(stages, 1);
      const stage = await explain.getStageText(0);
      assert.equal(stage, 'COLLSCAN');
      const row = await explain.getExplainTableRowNumber();
      assert.equal(row, 1);
    } catch (err) {
      console.error(err);
      assert.fail(true, false, err);
    }
  });

  test('check explain stage IXSCAN', async () => {
    try {
      await editor._appendToEditor('\ndb.users.createIndex({"user.name":1});');
      await browser.pause(200);
      await editor._clickExecuteLine();
      await editor._appendToEditor('\ndb.users.find({"user.name":"DBEnvy"});');
      await editor.clickExplainAllPlansExecution();
      await browser.pause(200);
      await editor.clickExplainAllPlansExecution();
      await browser.pause(4000);
      const stages = await explain.getNumberOfStages();
      assert.equal(stages, 2);
      const stage1 = await explain.getStageText(0);
      assert.equal(stage1, 'IXSCAN');
      const stage2 = await explain.getStageText(1);
      assert.equal(stage2, 'FETCH');
      const row = await explain.getExplainTableRowNumber();
      assert.equal(row, 2);
      const detailData = await explain.getExplainDetailTableData();
      assert.equal(detailData.length, 2);
      assert.equal(detailData[0].name, 'IXSCAN');
      assert.equal(detailData[1].name, 'FETCH');
    } catch (err) {
      console.error(err);
      assert.equal(false, true, err);
    }
  });

  test('check explain stage SORT', async () => {
    try {
      await editor._appendToEditor('\ndb.users.find().sort({"user.age":1});');
      await browser.pause(200);
      await editor.clickExplainExecutionStats();
      await browser.pause(2000);
      const stages = await explain.getNumberOfStages();
      assert.equal(stages, 3);
      const stage1 = await explain.getStageText(0);
      assert.equal(stage1, 'COLLSCAN');
      const stage2 = await explain.getStageText(1);
      assert.equal(stage2, 'SORT_KEY_GENERATOR');
      const stage3 = await explain.getStageText(2);
      assert.equal(stage3, 'SORT');
      const detailData = await explain.getExplainDetailTableData();
      assert.equal(detailData.length, 3);
      assert.equal(detailData[0].name, 'COLLSCAN');
      assert.equal(detailData[1].name, 'SORT_KEY_GENERATOR');
      assert.equal(detailData[2].name, 'SORT');
    } catch (err) {
      console.error(err);
      assert.equal(false, true, err);
    }
  });

  test('check explain stage LIMIT', async () => {
    try {
      await editor._appendToEditor('\ndb.users.find().limit(10);');
      await browser.pause(200);
      await editor.clickExplainExecutionStats();
      await browser.pause(2000);
      const stages = await explain.getNumberOfStages();
      assert.equal(stages, 2);
      const stage1 = await explain.getStageText(0);
      assert.equal(stage1, 'COLLSCAN');
      const stage2 = await explain.getStageText(1);
      assert.equal(stage2, 'LIMIT');
      const detailData = await explain.getExplainDetailTableData();
      assert.equal(detailData.length, 2);
      assert.equal(detailData[0].name, 'COLLSCAN');
      assert.equal(detailData[1].name, 'LIMIT');
      const statistics = await explain.getStatisticTableData();
      assert.equal(statistics.docReturned, 10);
    } catch (err) {
      console.error(err);
      assert.equal(false, true, err);
    }
  });

  test('check explain stage SKIP', async () => {
    try {
      await editor._appendToEditor('\ndb.users.find().skip(10);');
      await browser.pause(200);
      await editor.clickExplainExecutionStats();
      await browser.pause(2000);
      const stages = await explain.getNumberOfStages();
      assert.equal(stages, 2);
      const stage1 = await explain.getStageText(0);
      assert.equal(stage1, 'COLLSCAN');
      const stage2 = await explain.getStageText(1);
      assert.equal(stage2, 'SKIP');
      const detailData = await explain.getExplainDetailTableData();
      assert.equal(detailData.length, 2);
      assert.equal(detailData[0].name, 'COLLSCAN');
      assert.equal(detailData[1].name, 'SKIP');
    } catch (err) {
      console.error(err);
      assert.equal(false, true, err);
    }
  });

  test('check index advisor', async () => {
    try {
      await editor._appendToEditor('\ndb.users.find({"user.age":1});');
      await browser.pause(200);
      await editor.clickExplainExecutionStats();
      await browser.pause(2000);
      // Click suggest index button.
      await explain.clickSuggestIndex();
      await browser.waitForExist('.explain-view-copy-suggested-index-button');

      // Add to editor.
      await explain.clickAddIndex();
      await browser.pause(200);

      // Check editor.
      const editorContents = await editor._getEditorContentsAsString();

      expect(editorContents).toMatch(
        'db.getSiblingDB("test").users.createIndex({"user.age":1});'
      );
    } catch (err) {
      console.error(err);
      assert.equal(false, true, err);
    }
  });
});
