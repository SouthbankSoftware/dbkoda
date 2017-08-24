/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-08-22T14:20:20+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-25T09:58:22+10:00
 */



 /**
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-25T09:58:22+10:00
  */

 import _ from 'lodash';

 import {
   config,
   getApp
 } from '#/helpers';
 import {
   getRandomPort,
   killMongoInstance,
   launchSingleInstance
 } from 'test-utils';
 import StorageDrillDown from '#/pageObjects/StorageDrillDown';
 import TreeAction from '#/pageObjects/TreeAction';
 import Connection from '#/pageObjects/Connection';
 import Editor from '#/pageObjects/Editor';
 import Output from '#/pageObjects/Output';


 import {
   mongoPortOutput
 } from './uiDefinitions/inputAndTest/common';

 const debug = false;

 describe('TreeAction:StorageDrillDown', () => {
   /** Global (to current test suite) setup */
   config();

   /** Global (to current test suite) vars */
   const r = {};
   const cleanupWorkflows = [];

   const cleanup = async() => {
     // cleanup in reverse order
     await _.reduceRight(
       cleanupWorkflows,
       async(acc, wf) => {
         await acc;
         try {
           await wf();
         } catch (e) {
           console.error(e.stack);
         }
       },
       Promise.resolve()
     );
   };

   beforeAll(async() => {
     try {
       const app = await getApp();

       r.app = app;
       r.browser = app.client;
       r.storageDrillDown = new StorageDrillDown(r.browser);
       r.treeAction = new TreeAction(r.browser);
       r.connection = new Connection(r.browser);
       r.output = new Output(r.browser);
       r.editor = new Editor(r.browser);
       r.debug = async() => {
         console.log('\n\nWebdriverIO debugging REPL...');
         await r.browser.debug();
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
     const output = await mongoPortOutput(r.mongoDbPort, 'use test\nfor (var i=2000;i<2020;i+=1) { db.companies.insertOne({name:"company"+i,founded_year:i,}); };\n');
     if (debug) console.log(output);
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
   /** Setup database */
  //  test('Setup globals', async() => {
  //
  //  });

   const editorCommand = async(inputCommands) => {
       if (debug) console.log(inputCommands);
       await r.output.clearOutput.click();
       await r.editor._clearEditor();
       await r.browser.pause(500);
       await r.editor._appendToEditor(inputCommands);
       await r.browser.pause(500);
       // if (debug) await r.debug();
       await r.editor._clickExecuteAll();
       await r.browser.pause(r.delay);
       const outputLines = await r.output.getAllOutputLines();
       if (debug) console.log(outputLines);
       // if (debug) await r.debug();
       return (outputLines);
   };

   test('List StorageAnalysis in Databases', async() => {
       const output = await editorCommand('dbe.storageAnalysis()');
       // if (debug) await r.debug();
       const lines = output.split('\n');
       lines.shift();
       lines.pop();
       lines.pop();
       if (lines[lines.length - 1].indexOf('dbKoda&gt;') >= 0) {
         lines.pop();
       }
       console.log(lines.join(''));
       r.summary = JSON.parse(lines.join(''));
       if (debug) console.log(r.summary);
   });

   /** Select tree node and bring up action dialogue */
   test('allows user to select its corresponding tree node and bring up an action dialogue', async() => {
     await r.treeAction
       .getTreeNodeByPath(['Databases'])
       .rightClick()
       .pause(2000);
     await r.treeAction.clickContextMenu('Database Storage');
   });

   /** Fill in action dialogue */
   test('Match the no of table rows with the data', async() => {
     await r.browser.pause(1000);
     const dataName = await r.storageDrillDown.getRowDataName(0);
     console.log(dataName);
     const dataSize = await r.storageDrillDown.getRowDataSize(0);
     console.log(dataSize);
     const noOfChildren = await r.storageDrillDown.getAllChildRows();
     console.log(noOfChildren);

     expect(noOfChildren.length).toBe(r.summary.children.length);
     if (debug) await r.debug();
   });
 });
