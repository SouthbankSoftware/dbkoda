/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-06-01T14:02:40+10:00
 */

import _ from 'lodash';
import {
  getRandomPort,
  killMongoInstance,
  launchSingleInstance
} from 'test-utils';
import {
    sprintf
} from 'sprintf-js';
import TreeAction from '#/pageObjects/TreeAction';
import Connection from '#/pageObjects/Connection';
import Editor from '#/pageObjects/Editor';
import Output from '#/pageObjects/Output';


import {
    config,
    getApp
} from '#/helpers';
import {
    mongoPortOutput
} from './uiDefinitions/inputAndTest/common';

const debug = false;

describe('TreeAction:Collections', () => {
    /** Global (to current test suite) setup */
    config();

    /** Global (to current test suite) vars */
    const r = {};
    const cleanupWorkflows = [];

    const cleanup = async() => {
        // cleanup in reverse order
        await _.reduceRight(cleanupWorkflows, async(acc, wf) => {
            await acc;
            try {
                await wf();
            } catch (e) {
                console.error(e.stack);
            }
        }, Promise.resolve());
    };

    beforeAll(async() => {
        try {
            const app = await getApp();

            r.app = app;
            r.browser = app.client;
            r.treeAction = new TreeAction(r.browser);
            r.connection = new Connection(r.browser);
            r.output = new Output(r.browser);
            r.editor = new Editor(r.browser);
            r.debug = async() => {
                console.log('\n\nWebdriverIO debugging REPL...');
                await r
                    .browser
                    .debug();
            };
            global.debug = r.debug;

            cleanupWorkflows.push(async() => {
                if (app && app.isRunning()) {
                    await app.stop();
                }
            });
        } catch (error) {
            test.error = error;
        }
    });

    afterAll(async() => {
        await cleanup();
    });

    /** Setup database */
    test('Create testing database', async() => {
        r.mongoDbPort = getRandomPort();
        launchSingleInstance(r.mongoDbPort);
        if (debug) {
            console.log('DB start');
        }
        cleanupWorkflows.push(async() => {
            killMongoInstance(r.mongoDbPort);
        });
        // initialize the test db just in case ....
        const output = await mongoPortOutput(r.mongoDbPort, 'use test\ndb.z.insertOne({a:1});\n');
        if (debug) console.log(output);
    });

    test('Setup globals', async() => {
        r.createCLtemp = require('./uiDefinitions/ddd/CreateCollection.ddd.json');
        r.createCLInput = require('./uiDefinitions/inputAndTest/CreateCollection.hbs.input.json');
        r.randomCollection = 'collection' + Math.floor(Math.random() * 10000000);
        r.createCLInput.CollectionName = r.randomCollection;
        r.createCLInput.Database = 'test';
        r.validateCollectionCmd = sprintf('\ndb.getSiblingDB("%s").%s.stats();\n', 'test', r.randomCollection);
    });

    /** Connect to database */
    test('Create a connection', async() => {
        const {
            browser,
            connection,
            mongoDbPort: port,
            treeAction
        } = r;

        await connection.connectProfileByHostname({
            alias: 'Test',
            hostName: 'localhost',
            port,
            database: 'admin'
        });
        expect(await browser.waitForExist(treeAction.treeNodeSelector)).toBeTruthy;
    });

    /** Select tree node and bring up action dialogue */
    test('Invoke create Collection',
        async() => {
            await r
                .treeAction
                .getTreeNodeByPath(['Databases', 'test'])
                .rightClick()
                .pause(500);
            await r
                .treeAction
                .clickContextMenu(r.createCLtemp.Title);
        });

    /** Fill in action dialogue */
    test('Enter Collection Properties', async() => {
        await r
            .browser
            .waitForExist('.dynamic-form')
            .pause(500);
        if (debug) {
            console.log(r.createCLtemp);
            console.log(r.createCLInput);
        }

        await r
            .treeAction
            .fillInDialogue(r.createCLtemp, r.createCLInput);
    });

    /** Press execute */
    test('Hit execute', async() => {
        // await r.debug();
        await r
            .treeAction
            .execute()
            .pause(500);
    });

    /** Press execute */
    test('Hit close', async() => {
        // await r.debug();
        await r
            .treeAction
            .close()
            .pause(500);
        // await r.debug();
    });
    test('refresh', async() => {
        // await r.debug();
        await r
            .treeAction
            ._clickRefreshButton();
        await r.browser.pause(1000);
        // await r.debug();
    });

    test('Validate collection created', async() => {
        // await r.debug();
        // await mongoPortOutput(r.mongoDbPort, r.validateCollectionCmd);

        if (debug) {
            console.log(r.validateCollectionCmd);
        }
        const output = await mongoPortOutput(r.mongoDbPort, r.validateCollectionCmd);
        const expectedOutput = expect.stringMatching('totalIndexSize');
        if (debug) {
            console.log(output);
        }
        expect(output).toEqual(expectedOutput);
    });

    test('Validate collection created using product', async() => {
        if (debug) {
            console.log(r.validateCollectionCmd);
        }
        await r.editor._clickAddNewEditor();
        await r.output.setNewOutputCursor();
        await r.browser.pause(1000);
        await r.editor._appendToEditor(r.validateCollectionCmd);
        await r.editor._clickExecuteAll();
        // if (debug) await r.debug();
        await r.browser.pause(1000);
        const outputLines = await r.output.getNewOutputLines();
        if (debug) console.log(outputLines);
        const expectedOutput = expect.stringMatching('totalIndexSize');
        expect(outputLines.toString()).toEqual(expectedOutput);
    });



    test('Insert some data', async() => {
        await r.editor._clickAddNewEditor();
        await r.output.setNewOutputCursor();
        await r.browser.pause(1000);
        let cmd = 'use test\n';
        for (let i = 1; i < 5; i += 1) {
            cmd += sprintf('db.getSiblingDB("%s").%s.insertOne({phone:%s});\n',
                r.randomCollection, 'test', i);
        }
        await r.editor._appendToEditor(cmd);
        await r.editor._clickExecuteAll();
        // if (debug) await r.debug();
        const outputLines = await r.output.getNewOutputLines();
        if (debug) console.log(outputLines);
    });

    test('Create index',
        async() => {
            r.createIXtemp = require('./uiDefinitions/ddd/CreateIndex.ddd.json');
            r.createIXInput = require('./uiDefinitions/inputAndTest/CreateIndex.hbs.input.json');
            r.createIXInput.CollectionName = r.randomCollection;
            r.createIXInput.IndexName = r.randomCollection + '-i';
            r.createIXInput.Keys = [{
                    'AttributeName': 'phone',
                    'Direction': 1
                },
                {
                    'AttributeName': 'c.d',
                    'Direction': -1
                }
            ];
            // await r.debug();
            await r
                .treeAction
                .getTreeNodeByPath(['Databases', 'test', r.randomCollection])
                .rightClick()
                .pause(500);
            await r.treeAction.clickContextMenu(r.createIXtemp.Title);
            // await r.debug();
            await r
                .browser
                .waitForExist('.dynamic-form')
                .pause(500);
            if (debug) {
                console.log(r.createIXtemp);
                console.log(r.createIXInput);
            }

            await r
                .treeAction.fillInDialogue(r.createIXtemp, r.createIXInput);
            await r
                .treeAction
                .execute()
                .pause(500);

            await r
                .treeAction
                .close()
                .pause(500);
            // await r.debug();
        });

    test('Index visible on tree', async() => {
        // await r.debug();
        await r
            .treeAction
            ._clickRefreshButton();
        await r.browser.pause(1000);
        await r
            .treeAction
            .getTreeNodeByPath(['Databases', 'test', r.randomCollection, r.createIXInput.IndexName])
            .rightClick()
            .pause(500);
        // await r.debug();
    });

    test('Drop Index', async() => {
        r.dropIXtemp = require('./uiDefinitions/ddd/DropIndex.ddd.json');
        r.dropIXtemp.Database = 'test';
        r.dropIXtemp.CollectionName = r.randomCollection;
        r.dropIXtemp.IndexName = r.createIXInput.IndexName;
        await r
            .treeAction
            .getTreeNodeByPath(['Databases', 'test', r.randomCollection, r.createIXInput.IndexName])
            .rightClick()
            .pause(500);
        await r.treeAction.clickContextMenu(r.dropIXtemp.Title);
                    await r
                .browser
                .waitForExist('.dynamic-form')
                .pause(500);
        await r
            .treeAction
            .execute()
            .pause(1000);
       // await r.debug();
       await r.treeAction.close().pause(500);
       // await r.debug();
    });

    const editorCommand = async(inputCommands) => {
        if (debug) console.log(inputCommands);
        await r.editor._clickAddNewEditor();
        await r.output.setNewOutputCursor();
        await r.browser.pause(1000);
        await r.editor._appendToEditor(inputCommands);
        await r.editor._clickExecuteAll();
        await r.browser.pause(1000);
        const outputLines = await r.output.getAllOutputLines();
        if (debug) console.log(outputLines);
        return (outputLines);
    };

    test('Check that index is removed', async() => {
        const editorInput = sprintf('db.getSiblingDB("%s").%s.getIndexes()',
            'test', r.randomCollection);
        const outputLines = await editorCommand(editorInput);
        // await r.debug();
        const expectedOutput = expect.stringMatching(r.createIXInput.IndexName);
        expect(outputLines.toString()).not.toEqual(expectedOutput);
    });

    test('Drop Collection', async() => {
        r.dropCLtemp = require('./uiDefinitions/ddd/DropCollection.ddd.json');
        r.dropCLtemp.Database = 'test';
        r.dropCLtemp.CollectionName = r.randomCollection;

        await r
            .treeAction
            .getTreeNodeByPath(['Databases', 'test', r.randomCollection])
            .rightClick()
            .pause(500);
        await r.treeAction.clickContextMenu(r.dropCLtemp.Title);
                    await r
                .browser
                .waitForExist('.dynamic-form')
                .pause(500);
        await r
            .treeAction
            .execute()
            .pause(1000);
        await r
            .treeAction
            .close()
            .pause(500);
        // await r.debug();
    });

   test('Check that collection is removed', async() => {
        const editorInput = sprintf('db.getSiblingDB("%s").getCollectionNames()',
            'test');
        const outputLines = await editorCommand(editorInput);
        if (debug) await r.debug();
        const expectedOutput = expect.stringMatching(r.randomCollection);
        expect(outputLines.toString()).not.toEqual(expectedOutput);
    });
});
