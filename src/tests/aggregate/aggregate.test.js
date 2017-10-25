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
import AggregateBuilder from '../pageObjects/AggregateBuilder';
import Editor from '../pageObjects/Editor';
import Output from '../pageObjects/Output';
import ConnectionProfile from '../pageObjects/Connection';

import { config, getApp } from '../helpers';

describe('aggregate-test-suite', () => {
    // Always configure test suite.
    config();

    // Declare all global variables.
    let app;
    let browser;
    let mongoPort1;
    let aggregate;
    let treeAction;
    let editor; // eslint-disable-line
    let profile; // eslint-disable-line
    let output; // eslint-disable-line
    let template; // eslint-disable-line
    let templateInput; // eslint-disable-line
    const debug = false; // Set to true to stop app closing at end of test, etc

    // Executes before the test suite begins.
    beforeAll(async() => {
        return getApp().then((res) => {
            // Get our app and browser for testing.
            app = res;
            browser = app.client;
            // Create our page objects.
            treeAction = new TreeAction(browser);
            aggregate = new AggregateBuilder(browser);
            profile = new ConnectionProfile(browser);
            editor = new Editor(browser);
            output = new Output(browser);
            template = require('./blockDefinitions/ddd/Group.ddd.json');
            templateInput = {
                GroupByKeys: [{
                    AttributeName: 'founded_year',
                }],
                AggregateKeys: [{
                    AttributeName: 'founded_year',
                    Aggregation: 'sum',
                }],
            };

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

    test('Open A New Connection', async() => {
        try {
            await browser.pause(500);
            await profile.connectProfileByHostname({
                alias: 'Test1',
                hostName: 'localhost',
                port: mongoPort1,
                database: 'test',
            });
            await editor._appendToEditor(
                'use test\nfor (var i=2000;i<2020;i+=1) { db.companies.insertOne({name:"company"+i,founded_year:i,});\n db.companies.insertOne({name:"company2"+i,founded_year:i,}); };\n',
            );
            await browser.pause(500);
            await editor._clickExecuteAll();
            await browser.pause(500);
            await browser.element('.refreshTreeButton').click();
            expect(true).toBe(true);
        } catch (error) {
            console.log(error);
            expect(false).toBe(true);
        }
    });

    test('Open Aggregate Builder', async() => {
        try {
            await treeAction
                .getTreeNodeByPath(['Databases', 'test', 'companies'])
                .rightClick()
                .pause(500);

            await treeAction.clickContextMenu('Aggregate Builder').pause(500);
            expect(true).toBe(true);
        } catch (error) {
            console.log(error);
            expect(false).toBe(true);
        }
    });

    // Checks that all the elemnt selectors exist on the page.
    test('Aggregate Builder Elements Exists.', async() => {
        try {
            await aggregate.aggregateBuilderIsOpen();
            expect(true).toBe(true);
        } catch (error) {
            console.log(error);
            expect(false).toBe(true);
        }
    });

    // Checks that all the elemnt selectors exist on the page.
    test('Add a block from common.', async() => {
        try {
            // No group by yet.
            let res = await editor._getEditorContentsAsString();
            expect(res).not.toMatch('{ $group:{     _id:{  }');

            // Add block.
            await browser.pause(500);
            await aggregate.addBlockFromPalette('Group');
            await aggregate.isBlockSelected(2);
            // Check Output - Unfilled.
            res = await output.getAllOutputLines();
            expect(res).toMatch(
                'Please fill in Stage details and click on the stage to see results',
            );

            // Check Editor for block.
            res = await editor._getEditorContentsAsString();
            expect(res).toMatch('{ $group:{     _id:{  }');

            expect(true).toBe(true);
        } catch (error) {
            console.log(error);
            expect(false).toBe(true);
        }
    });

    // Click the group block and ensure the output / editor has updated.
    test('Select a block in Graphical Builder.', async() => {
        try {
            // Select Second Block (Group)
            await aggregate.selectBlock(2);

            // Check Output - Results
            let res = await output.getAllOutputLines();
            expect(res).toMatch('{"_id":{},"count":40}');

            // Check Editor for block.
            res = await editor._getEditorContentsAsString();
            expect(res).toMatch('{ $group:{     _id:{  }');

            expect(true).toBe(true);
        } catch (error) {
            console.log(error);
            expect(false).toBe(true);
        }
    });

    // Click the Start block and check the editor comments.
    test('Select the Start Block.', async() => {
        try {
            // Select First Block
            await aggregate.selectBlock(1);

            // Check Output - All Rows.
            let res = await output.getAllOutputLines();
            expect(res).toMatch('{"_id":"ObjectId');

            // Check Editor for block.
            await aggregate.selectBlock(1);
            res = await editor._getEditorContentsAsString();
            expect(res).toMatch('{ $group:{     _id:{  }');
            expect(true).toBe(true);
        } catch (error) {
            console.log(error);
            expect(false).toBe(true);
        }
    });

    // Remove a block and check block has auto swapped
    test('Remove Block.', async() => {
        try {
            // Add another block to remove.
            await aggregate.addBlockFromPalette('Group');
            await browser.pause(500);
            // Remove the second (non-selected) block.
            await aggregate.removeBlock(3);
            await browser.pause(500);

            await aggregate.isBlockSelected(2);

            expect(true).toBe(true);
        } catch (error) {
            console.log(error);
            expect(false).toBe(true);
        }
    });

    // Open and close the left hand panel.
    test('Toggle Left Panel.', async() => {
      try {
          await aggregate.closeLeftPanel();
          await browser.pause(1000);
          await aggregate.openLeftPanel();
          expect(true).toBe(true);
      } catch (error) {
          console.log(error);
          expect(false).toBe(true);
      }
    });

    // @todo -> Add a test to test the formbuilder component of the aggregation builder.
});
