/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-04T15:29:02+11:00
 */

import _ from 'lodash';

import { config, getApp } from '#/helpers';
import { getRandomPort, killMongoInstance, launchSingleInstance } from 'test-utils';
import TreeAction from '#/pageObjects/TreeAction';
import Connection from '#/pageObjects/Connection';
import Editor from '#/pageObjects/Editor';
import Output from '#/pageObjects/Output';

import { mongoPortOutput } from './uiDefinitions/inputAndTest/common';

const debug = false;

describe('TreeAction:SimpleQuery', () => {
  /** Global (to current test suite) setup */
  config();

  /** Global (to current test suite) vars */
  const r = {};
  const cleanupWorkflows = [];

  const cleanup = async () => {
    // cleanup in reverse order
    await _.reduceRight(
      cleanupWorkflows,
      async (acc, wf) => {
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

  beforeAll(async () => {
    try {
      const app = await getApp();

      r.app = app;
      r.browser = app.client;
      r.treeAction = new TreeAction(r.browser);
      r.connection = new Connection(r.browser);
      r.output = new Output(r.browser);
      r.editor = new Editor(r.browser);
      r.debug = async () => {
        console.log('\n\nWebdriverIO debugging REPL...');
        await r.browser.debug();
      };
      global.debug = r.debug;

      cleanupWorkflows.push(async () => {
        if (app && app.isRunning()) {
          await app.stop();
        }
      });
    } catch (error) {
      test.error = error;
    }
  });

  afterAll(async () => {
    await cleanup();
  });

  test('Create testing database', async () => {
    r.mongoDbPort = getRandomPort();
    launchSingleInstance(r.mongoDbPort);
    if (debug) {
      console.log('DB start');
    }
    cleanupWorkflows.push(async () => {
      killMongoInstance(r.mongoDbPort);
    });
    // initialize the test db just in case ....
    const output = await mongoPortOutput(
      r.mongoDbPort,
      'use test\nfor (var i=2000;i<2020;i+=1) { db.companies.insertOne({name:"company"+i,founded_year:i,}); };\n'
    );
    if (debug) console.log(output);
  });
  /** Connect to database */
  test('Create a connection', async () => {
    const { browser, connection, mongoDbPort: port, treeAction } = r;

    await connection.connectProfileByHostname({
      alias: 'Test',
      hostName: 'localhost',
      port,
      database: 'admin'
    });
    expect(await browser.waitForExist(treeAction.treeNodeSelector)).toBeTruthy;
  });
  /** Setup database */
  test('Setup globals', async () => {
    r.template = require('./uiDefinitions/ddd/SimpleQuery.ddd.json');
    r.templateInput = {
      Database: 'test',
      CollectionName: 'companies',
      UseOr: true,
      FilterKeys: [
        {
          AttributeName: 'founded_year',
          Operator: '$eq',
          Value: 2000
        },
        {
          AttributeName: 'founded_year',
          Operator: '$eq',
          Value: 2001,
          last: 1
        }
      ],
      Projections: [
        {
          AttributeName: 'name',
          AttributeProjectionValue: 1
        },
        {
          AttributeName: 'founded_year',
          AttributeProjectionValue: 1
        }
      ],
      Limit: 10,
      Count: false
    };
  });

  /** Select tree node and bring up action dialogue */
  test('allows user to select its corresponding tree node and bring up an action dialogue', async () => {
    await r.treeAction
      .getTreeNodeByPath(['Databases', 'test', 'companies'])
      .rightClick()
      .pause(2000);
    await r.treeAction.clickContextMenu(r.template.Title);
  });

  /** Fill in action dialogue */
  test('allows user to fill in action dialogue', async () => {
    await r.browser.waitForExist('.dynamic-form').pause(1000);
    await r.browser.pause(1000);
    // Workaround: Click add button for Filter table
    await r.browser
      .element(
        '.dynamic-form > div > form > fieldset:nth-child(4) > .tableHeader > .right > span > span > div > a'
      )
      .click();
    // Workaround: Click add button for Projection table
    await r.browser
      .element(
        '.dynamic-form > div > form > fieldset:nth-child(5) > .tableHeader > .right > span > span > div > a'
      )
      .click();
    await r.treeAction.fillInDialogue(r.template, r.templateInput);
    if (debug) await r.debug();
  });

  /** Press execute */
  test('allows user to press `execute` button', async () => {
    await r.output.clearOutput();
    await r.treeAction.execute();
    await r.browser.pause(1000);
  });

  /** Get output and compare */
  test('returns the correct output', async () => {
    await r.browser.pause(10000);
    const outputLines = await r.output.getAllOutputLines();
    console.log(outputLines);
    const expectedOutput = expect.stringMatching('company2001');
    expect(outputLines.toString()).toEqual(expectedOutput);
  });
});
