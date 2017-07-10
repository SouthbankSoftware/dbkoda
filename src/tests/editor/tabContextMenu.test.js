/**
* @Author: chris
* @Date:   2017-05-26T11:17:01+10:00
* @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-29T13:42:46+10:00
*/

import {
  getRandomPort,
  killMongoInstance,
  launchSingleInstance
} from 'test-utils';
import Editor from '../pageObjects/Editor';
import EditorTabContextMenu from '../pageObjects/EditorTabContextMenu';
import ConnectionProfile from '../pageObjects/Connection';
import { config, getApp } from '../helpers';

describe('editor-test-suite', () => {
  // Always configure test suite.
  config();

  // Declare all global variables.
  let app;
  let browser;
  let mongoPort;
  let editor; // Editor Page Object.
  let profile; // Profile Connection Page Object.
  let editorTabContextMenu;
  const debug = false; // Set to true to stop app closing at end of test, etc

  // Executes before the test suite begins.
  beforeAll(async () => {
    return getApp().then((res) => {
      // Get our app and browser for testing.
      app = res;
      browser = app.client;
      // Create our pageObjects
      profile = new ConnectionProfile(browser);
      editor = new Editor(browser);
      editorTabContextMenu = new EditorTabContextMenu(browser);

      // Create our mongo instances.
      mongoPort = getRandomPort();
      launchSingleInstance(mongoPort);
    });
  });

  // Executes after the test suite has finished.
  afterAll(() => {
    // Cleans up the mongo instances.
    if (!debug) {
      killMongoInstance(mongoPort);
      if (app && app.isRunning()) {
        return app.stop();
      }
    }
  });

  // Opens a new profile called 'Test1' and then executes a 'show dbs;' command.
  test('Open profile and use context menu to close tab', async () => {
    await profile.connectProfileByHostname({
      alias: 'Test1',
      hostName: 'localhost',
      port: mongoPort,
      database: 'test'
    });
    await browser.waitForExist('.Test1').getText('.Test1');
    await editor._getTab('Test1');
    await editorTabContextMenu.openContextMenu('.Test1');
    await editorTabContextMenu.closeTab();
    // TODO Verify editor tab closed
  });
});
