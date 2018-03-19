/**
 * @Author: chris
 * @Date:   2017-05-02T09:49:06+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2018-01-30T14:00:55+11:00
 */

import {getRandomPort, killMongoInstance, launchSingleInstance, generateMongoData} from 'test-utils';
import Output from '../pageObjects/Output';
import ConnectionProfile from '../pageObjects/Connection';
import Editor from '../pageObjects/Editor';
import {config, getApp} from '../helpers';

describe('output-panel-test-suite', () => {
  // always config test suite
  config();

  const PROMPT_LENGTH = 10;
  let app;
  let browser;
  let mongoPort;
  let output;
  let connection;
  let editor;

  beforeAll(async() => {
    mongoPort = getRandomPort();
    launchSingleInstance(mongoPort);
    generateMongoData(mongoPort, 'test', 'test', 500);
    return getApp().then((res) => {
      app = res;
      browser = app.client;
      output = new Output(browser);
      connection = new ConnectionProfile(browser);
      editor = new Editor(browser);
    });
  });

  afterAll(() => {
    killMongoInstance(mongoPort);
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  test('output displays connection text', async () => {
    await connection.connectProfileByHostname({
      alias: 'Local' + mongoPort,
      hostName: 'localhost',
      port: mongoPort,
      database: 'test'
    });
    const outputLines = await output.getAllOutputLines();
    expect(outputLines).not.toBe('');
  });

  test('disables show more by default', async () => {
    const isDisabled = await output._isShowMoreDisabled();
    expect(isDisabled).toBe(true);
  });

  test('executes show more on large queries', async () => {
    await output.setNewOutputCursor();
    await editor._appendToEditor('use test;\n');
    await editor._appendToEditor('db.test.find();\n');
    await editor._clickExecuteAll();
    // TODO A better way of waiting for execution completion
    await browser.pause(1000);
    let outputLines = await output.getNewOutputLines();
    const showMoreDisabled = await output._isShowMoreDisabled();
    expect(showMoreDisabled).toBe(false);
    await output.setNewOutputCursor();
    await output.showMore.leftClick();
    // TODO A better way of waiting for execution completion
    await browser.pause(1000);
    outputLines = await output.getNewOutputLines();
    expect(outputLines.length).toBeGreaterThan(PROMPT_LENGTH);
  });

  test('clears output', async () => {
    await output.clearOutput.leftClick();
    const outputLines = await output.getAllOutputLines();
    expect(outputLines).toBe('');
  });

  // TODO test ('saves output'); - needs to handle save(download) dialog
});
