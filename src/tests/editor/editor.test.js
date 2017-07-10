/**
 * Test Suite for Editor Profile
 *
 * @Last modified by:   chris
 * @Last modified time: 2017-06-27T08:55:04+10:00
 */

import {
  getRandomPort,
  killMongoInstance,
  launchSingleInstance
} from 'test-utils';
import Editor from '../pageObjects/Editor';
import ConnectionProfile from '../pageObjects/Connection';
import {
    config,
    getApp
} from '../helpers';

describe('editor-test-suite', () => {
    // Always configure test suite.
    config();

    // Declare all global variables.
    let app;
    let browser;
    let mongoPort1;
    let mongoPort2;
    let editor; // Editor Page Object.
    let profile; // Profile Connection Page Object.
    const debug = false; // Set to true to stop app closing at end of test, etc

    // Executes before the test suite begins.
    beforeAll(async() => {
        return getApp().then((res) => {
            // Get our app and browser for testing.
            app = res;
            browser = app.client;
            // Create our page objects.
            profile = new ConnectionProfile(browser);
            editor = new Editor(browser);

            // Create our mongo instances.
            mongoPort1 = getRandomPort();
            mongoPort2 = getRandomPort();
            launchSingleInstance(mongoPort1);
            launchSingleInstance(mongoPort2);
        });
    });

    // Executes after the test suite has finished.
    afterAll(() => {
        // Cleans up the mongo instances.
        if (!debug) {
            killMongoInstance(mongoPort1);
            killMongoInstance(mongoPort2);
            if (app && app.isRunning()) {
                return app.stop();
            }
        }
    });

    // Checks that all the elemnt selectors exist on the page.
    test('Editor Elements Exists.', async() => {
        try {
            await editor._editorElementsExist();
            expect(true).toBe(true);
        } catch (error) {
            console.log(error);
            expect(false).toBe(true);
        }
    });

    // Opens a new profile called 'Test1' and then executes a 'show dbs;' command.
    test('Open profile and execute show dbs', async() => {
        try {
            await profile.connectProfileByHostname({
                alias: 'Test1',
                hostName: 'localhost',
                port: mongoPort1,
                database: 'test'
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

    // Creates a second profile called 'Test2', then swaps editor tabs back to the
    // 'Test1' editor.
    test('Create a new profile and swap tabs.', async() => {
        try {
            await profile.connectProfileByHostname({
                alias: 'Test2',
                hostName: 'localhost',
                port: mongoPort2,
                database: 'test'
            });
            let res = await browser.waitForExist('.Test2');
            expect(res).toBe(true);

            await editor._clickEditorTab('Test1');
            await browser.pause(10000);
            res = await editor._getConnectionContextText();
            expect(res).toMatch(/Test1/);
        } catch (err) {
            console.log(err);
            expect(true).toBe(false);
        }
    });

    // Adds a new editor and checks that we now have two editors for context
    // 'Test1'.
    test('Add a new editor.', async() => {
        try {
            let res = await browser.elements('.pt-tab.visible.Test1');
            expect(res.value.length).toBe(1);
            await editor._clickAddNewEditor();
            await browser.pause(1000);
            res = await browser.elements('.pt-tab.visible.Test1');
            expect(res.value.length).toBe(2);
        } catch (err) {
            console.log(err);
            return expect(true).toBe(false);
        }
    });

    // Appends db.serverCmdLineOpts(); to the edito on context 'Test1', executes it,
    // checks the port. Then selects context 'Test2', executes the command and
    // checks the new port matches.
    test('Swap the context of an editor and check port.', async() => {
        try {
            let res = await editor._getConnectionContextText();
            expect(res).toMatch(/Test1/);

            editor._appendToEditor('db.serverCmdLineOpts();\n');
            res = await browser.waitForExist('.cm-db');
            expect(res).toBe(true);

            editor._clickExecuteAll();
            res = await browser.waitForExist('span*=port');
            expect(res).toBe(true);

            let regExp = new RegExp('"port" : ' + mongoPort1);
            res = await browser.getText('.CodeMirror-scroll');
            expect(res[9]).toMatch(regExp);

            res = await editor._selectConnectionContext('Test2');
            await browser.pause(500);

            res = await browser
                .element('.clearOutputBtn')
                .click();

            res = await editor._getConnectionContextText();
            expect(res).toMatch(/Test2/);
            await browser.pause(500);

            editor._clickExecuteAll();
            res = await browser.waitForExist('span*=port'); // Check for any span containing the expression ".*port.*"
            expect(res).toBe(true);

            regExp = new RegExp('"port" : ' + mongoPort2);
            res = await browser.getText('.CodeMirror-scroll');
            console.log(res[9]);
            expect(res[9]).toMatch(regExp);
        } catch (err) {
            console.log(err);
            return expect(true).toBe(false);
        }
    });
});
