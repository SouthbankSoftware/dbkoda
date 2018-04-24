/**
 * @Last modified by:   chris
 * @Last modified time: 2017-06-14T09:27:33+10:00
 */

import _ from 'lodash';
import { sprintf } from 'sprintf-js';
import { getRandomPort, killMongoInstance, launchSingleInstance } from 'test-utils';
import TreeAction from '#/pageObjects/TreeAction';
import Connection from '#/pageObjects/Connection';
import { config, getApp } from '#/helpers';
import { mongoPortOutput } from './uiDefinitions/inputAndTest/common';

const debug = false;

describe('TreeAction:AlterUser', () => {
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

  /** Setup database */
  test('requires a testing database', async () => {
    r.mongoDbPort = getRandomPort();
    launchSingleInstance(r.mongoDbPort);

    cleanupWorkflows.push(async () => {
      killMongoInstance(r.mongoDbPort);
    });

    r.template = require('./uiDefinitions/ddd/AlterUser.ddd.json');
    r.templateInput = require('./uiDefinitions/inputAndTest/AlterUser.hbs.input.json');
    r.randomUser = 'user' + Math.floor(Math.random() * 10000000);
    r.adminRandomUser = 'admin.' + r.randomUser;
    r.templateInput.UserId = r.adminRandomUser;
    r.templateInput.UserName = r.randomUser;

    r.createUserCmd = sprintf(
      'db.getSiblingDB("admin").createUser(    {user: "%s" ,    pwd:  "password" ,   roles:[{role:"read", db: "admin" }]}   ,{w: "majority"}  );\n',
      r.randomUser
    );
    r.dropUserCmd = sprintf(
      'db.getSiblingDB("admin").dropUser(   "%s",{w: "majority"}) ;\n',
      r.randomUser
    );
    r.validateUserCmd = sprintf(
      '\nvar  userDoc=db.getSiblingDB("admin").system.users.find({_id:"%s"}).toArray()[0];\n  if (userDoc.roles.length==4) print (userDoc._id+" updated ok"); \n',
      r.adminRandomUser
    );
    if (debug) console.log(r.createUserCmd);
    await mongoPortOutput(r.mongoDbPort, r.createUserCmd);
  });

  /** Connect to database */
  test('requires a connection to the database', async () => {
    const { browser, connection, mongoDbPort: port, treeAction } = r;

    await connection.connectProfileByHostname({
      alias: 'Test',
      hostName: 'localhost',
      port,
      database: 'test'
    });

    expect(await browser.waitForExist(treeAction.treeNodeSelector)).toBeTruthy;
  });

  /** Select tree node and bring up action dialogue */
  test('allows user to select its corresponding tree node and bring up an action dialogue', async () => {
    await r.treeAction
      .getTreeNodeByPath(['Users', r.adminRandomUser])
      .rightClick()
      .pause(500);
    await r.treeAction.clickContextMenu(r.template.Title);
  });

  /** Fill in action dialogue */
  test('allows user to fill in action dialogue', async () => {
    await r.browser.waitForExist('.dynamic-form').pause(500);
    if (debug) await r.debug();
    await r.browser.pause(500);
    await r.treeAction.fillInDialogue(r.template, r.templateInput);

    // example of getting value options for Select field
    // FIXME remove this example
    console.log(
      await r.treeAction.getValueOptionsForSelectField(
        'Role',
        r.treeAction.getTableFieldNthRow('Database Roles', 1)
      )
    );
  });

  /** Press execute */
  test('allows user to press `execute` button', async () => {
    await r.treeAction.execute().pause(1000);
  });

  /** Get output and compare */
  test('returns the correct output', async () => {
    const output = await mongoPortOutput(r.mongoDbPort, r.validateUserCmd);
    const expectedOutput = expect.stringMatching(sprintf('%s updated ok', r.adminRandomUser));
    expect(output).toEqual(expectedOutput);
  });
});
