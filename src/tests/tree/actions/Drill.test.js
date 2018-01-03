/**
 * Test Suite for Editor Profile
 *
 * @Last modified by:   chris
 * @Last modified time: 2017-06-27T08:55:04+10:00
 */

import {
  getRandomPort,
  killMongoInstance,
  launchSingleInstance,
} from 'test-utils';
import TreeAction from '#/pageObjects/TreeAction';
import Editor from '#/pageObjects/Editor';
// import Output from '#/pageObjects/Output';
import ConnectionProfile from '#/pageObjects/Connection';
import { config, getApp } from '#/helpers';

describe('drill-test-suite', () => {
  // Always configure test suite.
  config();

  // Declare all global variables.
  let app;
  let browser;
  let mongoPort1;
  let editor; // Editor Page Object.
  let profile; // Profile Connection Page Object.
//   let output; // Output Page Object.
  let treeAction;
  const debug = false; // Set to true to stop app closing at end of test, etc

  // Executes before the test suite begins.
  beforeAll(async () => {
    return getApp().then((res) => {
      // Get our app and browser for testing.
      app = res;
      browser = app.client;
      // Create our page objects.
      profile = new ConnectionProfile(browser);
      editor = new Editor(browser);
    //   output = new Output(browser);
      treeAction = new TreeAction(browser);

      // Create our mongo instances.
      mongoPort1 = getRandomPort();
      launchSingleInstance(mongoPort1);
    });
  });

  // Executes after the test suite has finished.
  afterAll(() => {
    // Cleans up the mongo instances.
    if (!debug) {
      killMongoInstance(mongoPort1);
      if (app && app.isRunning()) {
        return app.stop();
      }
    }
  });

  // Checks that all the elemnt selectors exist on the page.
  test('Editor Elements Exists.', async () => {
    try {
      await editor._editorElementsExist();
      expect(true).toBe(true);
    } catch (error) {
      console.log(error);
      expect(false).toBe(true);
    }
  });

  // Opens a new profile called 'Test1' and then executes a 'show dbs;' command.
  test('Open profile and execute show dbs', async () => {
    try {
      await profile.connectProfileByHostname({
        alias: 'Test1',
        hostName: 'localhost',
        port: mongoPort1,
        database: 'test',
      });
      let res = await browser.waitForExist('.Test1');
      expect(res).toBe(true);
      editor._appendToEditor('show dbs;\n');
      res = await browser.waitForExist('.cm-dbs');
      expect(res).toBe(true);

      editor._clickExecuteAll();
      res = await browser.waitForExist('span*=local');

      res = await browser.getText('.CodeMirror-scroll');
      if (debug) {
        res.forEach((line) => {
          console.log(line);
        });
      }
      expect(res[3]).toMatch(/local/);
    } catch (err) {
      console.log(err);
      expect(true).toBe(false);
    }
  });


  test('Open Drill', async () => {
    try {
      await editor._appendToEditor(
        'use test\nfor (var i=2000;i<2020;i+=1) { db.companies.insertOne({name:"company"+i,founded_year:i,});\n db.companies.insertOne({name:"company2"+i,founded_year:i,}); };\n',
      );
      await browser.pause(500);
      await editor._clickExecuteAll();
      await browser.pause(500);
      await browser.element('.refreshTreeButton').click();
      await browser.pause(5000);
      await treeAction
        .getTreeNodeByPath(['Databases', 'test'])
        .rightClick()
        .pause(1000);

      await treeAction
        .clickContextMenu('Query Database with Drill')
        .pause(1000);
      // console.log(browser);
      // console.log(browser.alertText());
      // if (browser.alertText()) {
      //   console.log('Alert open');
      //   browser.alertDismiss();
      //   // browser.alertAccept();
      // }
      await browser.element('.drill-alert-dialog .openButton').leftClick();
      await browser.pause(30000);
      expect(true).toBe(true);
    } catch (error) {
      console.log(error);
      expect(false).toBe(true);
    }
  });
});
