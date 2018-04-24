/**
 * @Author: chris
 * @Date:   2017-08-16T15:51:55+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-01-30T14:01:10+11:00
 */

import {
  getRandomPort,
  killMongoInstance,
  launchSingleInstance,
  generateMongoData
} from 'test-utils';
import Output from '../pageObjects/Output';
import ConnectionProfile from '../pageObjects/Connection';
import JsonView from '../pageObjects/JsonView';
import Editor from '../pageObjects/Editor';
import { config, getApp } from '../helpers';

describe('output-panel-context-menu', () => {
  let mongoPort;
  let app;
  let browser;
  let output;
  let connection;
  let editor;
  let jsonView;
  let viewContents = '';
  // always config test suite
  config();

  beforeAll(async () => {
    mongoPort = getRandomPort();
    launchSingleInstance(mongoPort);
    generateMongoData(mongoPort, 'test', 'test', 500);
    return getApp().then(res => {
      app = res;
      browser = app.client;
      output = new Output(browser);
      connection = new ConnectionProfile(browser);
      editor = new Editor(browser);
      jsonView = new JsonView(browser);
    });
  });

  afterAll(() => {
    killMongoInstance(mongoPort);
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  test('connect and do query', async () => {
    await connection.connectProfileByHostname({
      alias: 'Local' + mongoPort,
      hostName: 'localhost',
      port: mongoPort,
      database: 'test'
    });
    await editor._appendToEditor('use test;\n');
    await editor._appendToEditor('db.test.find();\n');
    await editor._clickExecuteAll();
    await browser.pause(1000);
    const outputLines = await output.getAllOutputLines();
    expect(outputLines).not.toBe('');
  });

  test('open json view', async () => {
    await output.openJsonView(30);
    await browser.pause(200);
    const tabName = await output.activeTabName();
    viewContents = await jsonView.getJsonViewText();
    expect(tabName).toContain('Enhanced JSON');
  });

  test('browse next document', async () => {
    await jsonView.clickNext();
    await browser.pause(1000);
    const oldContents = viewContents;
    viewContents = await jsonView.getJsonViewText();
    expect(viewContents).not.toBe(oldContents);
  });

  test('browse previous document', async () => {
    await jsonView.clickPrevious();
    await browser.pause(1000);
    const oldContents = viewContents;
    viewContents = await jsonView.getJsonViewText();
    expect(viewContents).not.toBe(oldContents);
  });

  test('clear json view', async () => {
    await output.clearOutput.click();
    await browser.pause(200);
    const tabName = await output.activeTabName();
    expect(tabName).not.toContain('EnhancedJson-');
  });

  /* test('open table view', async () => {
    await output.openTableView(25);
    await browser.pause(200);
    const tabName = await output.activeTabName();
    expect(tabName).toContain('TableView-');
  });

  test('clear table view', async () => {
    await output.clearOutput.click();
    await browser.pause(200);
    const tabName = await output.activeTabName();
    expect(tabName).not.toContain('TableView-');
  }); */
});
