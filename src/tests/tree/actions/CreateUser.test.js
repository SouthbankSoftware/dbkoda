/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-06-16T12:38:44+10:00
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
import {
  config,
  getApp
} from '#/helpers';
import {
  mongoPortOutput
} from './uiDefinitions/inputAndTest/common';

const debug = false;

describe('TreeAction:CreateUser', () => {
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
  test('requires a testing database', async() => {
    r.mongoDbPort = getRandomPort();
    launchSingleInstance(r.mongoDbPort);
    if (debug) {
      console.log('DB start');
    }
    cleanupWorkflows.push(async() => {
      killMongoInstance(r.mongoDbPort);
    });
    if (debug) {
      console.log('Loading templates');
    }
    r.template = require('./uiDefinitions/ddd/CreateUser.ddd.json');
    if (debug) {
      console.log('ddd loaded');
    }
    r.templateInput = require('./uiDefinitions/inputAndTest/CreateUser.hbs.input.json');
    if (debug) {
      console.log('input.json loaded');
    }
    r.randomUser = 'user' + Math.floor(Math.random() * 10000000);
    r.adminRandomUser = 'admin.' + r.randomUser;

    r.templateInput.UserName = r.randomUser;
    //
    // The sample data contains a "last" tag.  We need to remove the final entry to
    // get rid of that
    //
    const roleArray = r.templateInput.Roles;
    roleArray.pop();
    r.templateInput.Roles = roleArray;
    r.templateInput.Roles;
    r.templateInput.Database; // Fails on this for some reason
    r.templateInput.Roles;
    r.createDatabase = 'db.getSiblingDB("admin").xxx.insertOne({x:1});';
    r.dropUserCmd = sprintf('db.getSiblingDB("admin").dropUser(   "%s",{w: "majority"}) ;\n', r.randomUser);
    r.validateUserCmd = sprintf('\ndb.getSiblingDB("admin").system.users.find({_id:"%s"});' +
      'var  userDoc=db.getSiblingDB("admin").system.users.find({_id:"%s"}).toArray()[' +
      '0];\n  print (userDoc._id+" created roles="+userDoc.roles.length); \n',
      r.adminRandomUser, r.adminRandomUser);
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

  test('Create admin database', async() => {
    // This is only neccessary on Mongo < 3.4
    await mongoPortOutput(r.mongoDbPort, r.createDatabase);
    if (debug) {
      console.log(r.dropUserCmd);
    }
  });

  /** Select tree node and bring up action dialogue */
  test('Invoke create user',
    async() => {
      await r
        .treeAction
        .getTreeNodeByPath(['Users'])
        .rightClick()
        .pause(500);
      await r
        .treeAction
        .clickContextMenu(r.template.Title);
    });

  /** Fill in action dialogue */
  test('Enter user properties', async() => {
    await r
      .browser
      .waitForExist('.dynamic-form')
      .pause(500);
    console.log('Form exists!');
    if (debug) {
      console.log(r.template);
      console.log(r.templateInput);
    }
    if (debug) await r.debug();
    await r
      .treeAction
      .fillInDialogue(r.template, r.templateInput);
    if (debug) await r.debug();
  });

  /** Press execute */
  test('Hit execute', async() => {
    await r
      .treeAction
      .execute()
      .pause(500);
  });

  test('Validate user created', async() => {
    // await r.debug();
    await mongoPortOutput(r.mongoDbPort, r.validateUserCmd);

    if (debug) {
      console.log(r.validateUserCmd);
    }
    const output = await mongoPortOutput(r.mongoDbPort, r.validateUserCmd);
    const expectedOutput = expect.stringMatching(sprintf('%s created roles=3', r.adminRandomUser));
    if (debug) {
      console.log(output);
    }
    expect(output).toEqual(expectedOutput);
  });

  test('Drop user', async() => {
    await mongoPortOutput(r.mongoDbPort, r.dropUserCmd);

    if (debug) {
      console.log(r.dropUserCmd);
    }
  });
});
