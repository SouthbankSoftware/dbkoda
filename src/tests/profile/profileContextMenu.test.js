/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-16T15:12:46+10:00
 */
import { getRandomPort, killMongoInstance, launchSingleInstance } from 'test-utils';

import ProfileListContextMenu from '../pageObjects/ProfileListContextMenu';
import ConnectionProfile from '../pageObjects/Connection';
import { config, getApp } from '../helpers';

describe('test profile list', () => {
  config();
  let app;
  let browser;
  let mongoPort;
  let profile;
  let connectProfileContextMenu;
  let debug; // eslint-disable-line

  beforeAll(async () => {
    return getApp().then(res => {
      app = res;
      browser = app.client;
      profile = new ConnectionProfile(browser);
      connectProfileContextMenu = new ProfileListContextMenu(browser);
      debug = async () => {
        console.log('\n\nWebdriverIO debugging REPL...');
        await browser.debug();
      };
      mongoPort = getRandomPort();
      launchSingleInstance(mongoPort);
    });
  });

  afterAll(() => {
    killMongoInstance(mongoPort);
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  test('Create a new Connection and Open context menu', async () => {
    try {
      await profile.connectProfileByHostname({
        alias: 'Test1',
        hostName: 'localhost',
        port: mongoPort,
        database: 'test'
      });
      let res = await browser.waitForExist('.Test1');
      expect(res).toBe(true);

      res = await connectProfileContextMenu.openContextMenu('Test1');
      console.log(res);
      expect(res).toBe(true);
    } catch (err) {
      console.log(err);
      expect(true).toBe(false);
    }
  });

  test('Open a new editor via context menu', async () => {
    try {
      // Check that context menu is still open.
      let res = await browser.waitForExist(connectProfileContextMenu.menuSelector);
      expect(res).toBe(true);

      // Check number of visible tabs is one.
      res = await browser.elements('.pt-tab.visible.Test1');
      expect(res.value.length).toBe(1);

      // Open new tab and check for two existing tabs.
      res = await connectProfileContextMenu.newEditor();
      await browser.pause(2000);
      res = await browser.elements('.pt-tab.visible.Test1');
      expect(res.value.length).toBe(2);

      // Open new tab and check for three existing tabs.
      res = await connectProfileContextMenu.openContextMenu('Test1');
      res = await browser.waitForExist(connectProfileContextMenu.menuSelector);
      expect(res).toBe(true);
      res = await connectProfileContextMenu.newEditor();
      await browser.pause(2000);
      res = await browser.elements('.pt-tab.visible.Test1');
      expect(res.value.length).toBe(3);
    } catch (err) {
      console.log(err);
      expect(true).toBe(false);
    }
  });

  test('Close a connection via context menu', async () => {
    try {
      // Open the context Menu again.
      let res = await connectProfileContextMenu.openContextMenu('Test1');
      expect(res).toBe(true);

      // Click the Close Button and check it is closed.
      res = await connectProfileContextMenu.closeProfile();
      await browser.pause(500);
      res = await browser.waitForExist('i.closedProfile');
      expect(res).toBe(true);
    } catch (err) {
      console.log(err);
      expect(true).toBe(false);
    }
  });

  test('Open a connection via context menu', async () => {
    try {
      // Open the context Menu again.
      let res = await connectProfileContextMenu.openContextMenu('Test1');
      expect(res).toBe(true);

      // Click the Open Button and check it is closed.
      res = await connectProfileContextMenu.openProfile();
      res = await browser.waitForExist('i.closedProfile', 2000, true);
      expect(res).toBe(true);
    } catch (err) {
      console.log(err);
      expect(true).toBe(false);
    }
  });

  test('Close and delete a connection via context menu', async () => {
    try {
      // Open the context Menu again.
      let res = await connectProfileContextMenu.openContextMenu('Test1');
      expect(res).toBe(true);

      // Click the Close Button and check it is closed.
      res = await connectProfileContextMenu.closeProfile();
      await browser.pause(500);
      res = await browser.waitForExist('i.closedProfile');
      expect(res).toBe(true);

      // Open the context menu again
      await browser.pause(1000);
      res = await connectProfileContextMenu.openContextMenu('Test1');
      expect(res).toBe(true);
      await browser.pause(3000);

      // Click the delete button and check it is closed.
      res = await connectProfileContextMenu.deleteProfile();
      res = await browser.waitForExist('div.bp-table-truncated-text=Test1', 500, true);
      expect(res).toBe(true);
    } catch (err) {
      console.log(err);
      expect(true).toBe(false);
    }
  });
});
