/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-21T11:05:55+11:00
 */

import _ from 'lodash';
// import {sprintf} from 'sprintf-js';
import TreeAction from '#/pageObjects/TreeAction';
import Connection from '#/pageObjects/Connection';
import Editor from '#/pageObjects/Editor';
import Output from '#/pageObjects/Output';
import ProfileList from '#/pageObjects/ProfileList';
import Terminal from '#/pageObjects/OutputTerminal';
import { config, getApp } from '#/helpers';
import { DELAY_TIMEOUT } from '../helpers/config';

const debug = false;

describe('CrossFunction:connection Switching', () => {
  /** Global (to current test suite) setup */
  config({ setupFailFastTest: false });

  /** Global (to current test suite) vars */
  const r = {};
  r.delay = 5000; // Set higher to make sure that tests don't fail on slow cloud
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
      r.profileList = new ProfileList(r.browser);
      r.terminal = new Terminal(r.browser);
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

  test('Setup globals', async () => {
    r.ec2 = process.env.EC2_SHARD_CLUSTER_HOSTNAME;
  });

  /** Connect to database */
  test('Connect 3.0', async () => {
    const {
      browser,
      connection,
      //          mongoDbPort: port,
      treeAction
    } = r;
    await connection.connectProfileByHostname({
      alias: 'db30',
      hostName: r.ec2,
      port: 27030,
      database: 'test'
    });
    expect(await browser.waitForExist(treeAction.treeNodeSelector)).toBeTruthy;
    console.log(r.profileList.getConnectionProfileList());
  });

  /** Connect to database */
  test('Connect 3.2', async () => {
    const {
      browser,
      connection,
      //          mongoDbPort: port,
      treeAction
    } = r;
    await connection.connectProfileByHostname({
      alias: 'db32',
      hostName: r.ec2,
      port: 27032,
      database: 'test'
    });
    expect(await browser.waitForExist(treeAction.treeNodeSelector, r.delay)).toBeTruthy;
  });
  /** Connect to database */
  test('Connect Atlas', async () => {
    const {
      browser,
      connection,
      //          mongoDbPort: port,
      treeAction
    } = r;
    await connection.connectProfileByURL({
      alias: 'Atlas',
      url: `mongodb://${process.env.ATLAS_SERVER_HOSTNAME}`,
      database: 'admin',
      authentication: true,
      ssl: true,
      userName: process.env.ATLAS_SERVER_USERNAME,
      password: process.env.ATLAS_SERVER_PASSWORD
    });
    expect(await browser.waitForExist(treeAction.treeNodeSelector, DELAY_TIMEOUT)).toBeTruthy;
  });

  test('Connect EC2 shards', async () => {
    await r.connection.connectProfileByURL({
      alias: 'EC2',
      url: `mongodb://${r.ec2}:27017`,
      database: 'admin',
      authentication: true,
      userName: process.env.EC2_SHARD_CLUSTER_USERNAME,
      password: process.env.EC2_SHARD_CLUSTER_PASSWORD
    });
    // if (debug) await r.debug();
    expect(await r.browser.waitForExist(r.treeAction.treeNodeSelector, DELAY_TIMEOUT)).toBeTruthy;
  });

  test('Get the shell version ', async () => {
    r.browser.pause(r.delay);
    const outputLines = await r.output.getAllOutputLines();
    // if (debug) console.log(outputLines);
    let regex = new RegExp(/MongoDB shell version: [0-9]*\.?[0-9]/g); // <3.4
    let mymatch = outputLines.match(regex);
    // if (debug) console.log(mymatch);
    if (mymatch !== null) {
      r.shellVersion = parseFloat(mymatch[0].split(':')[1]);
    } else {
      regex = new RegExp(/MongoDB shell version v[0-9]*\.?[0-9]/g); // 3.4 style
      mymatch = outputLines.match(regex);
      // if (debug) console.log(mymatch);
      if (mymatch !== null) {
        r.shellVersion = parseFloat(mymatch[0].split(' v')[2]);
      } else {
        r.shellVersion = -1;
      }
    }
    console.log('Mongo shell version ', r.shellVersion);
  });

  const editorCommand = async inputCommands => {
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
    return outputLines;
  };

  const repeatEditorCommand = async () => {
    if (debug) console.log('Repeating last output');
    await r.output.setNewOutputCursor();
    await r.output.clearOutput.click();
    await r.browser.pause(r.delay);
    await r.editor._clickExecuteAll();
    await r.browser.pause(r.delay);
    const outputLines = await r.output.getAllOutputLines();
    if (debug) console.log(outputLines);
    return outputLines;
  };

  const addNewEditor = async () => {
    await r.editor._clickAddNewEditor();
    r.browser.pause(r.delay);
    await r.editor._editorElementsExist();
    await r.output.initOutputCursor();
  };

  const newEditorCommand = async inputCommands => {
    await addNewEditor();
    await r.browser.pause(r.delay);
    await r.editor._editorElementsExist();
    const output = await editorCommand(inputCommands);
    return output;
  };

  test('Check version on Atlas (test might fail if Atlas upgraded)', async () => {
    if (debug) console.log('Check version on Atlas (test might fail if Atlas upgraded)');

    await r.profileList.clickProfile(2);
    await r.browser.waitForExist(r.treeAction.treeNodeSelector);
    await r.editor._editorElementsExist();
    await addNewEditor();
    await r.browser.pause(r.delay); // Atlas takes longer
    let mongoCmds = 'print ("version="+dbe.majorVersion());\n';
    mongoCmds += 'print("hosted by "+db.serverStatus().host.split(".")[1]);\n';
    const output = await editorCommand(mongoCmds);
    // if (debug) await r.debug();
    let expectedOutput = expect.stringMatching('version=3.4');
    expect(output.toString()).toEqual(expectedOutput);
    expectedOutput = expect.stringMatching('hosted by mongodb');
    expect(output.toString()).toEqual(expectedOutput);
  });

  test('Check version on 3.0', async () => {
    await r.profileList.clickProfile(0);
    await r.browser.waitForExist(r.treeAction.treeNodeSelector);
    await r.editor._editorElementsExist();
    const output = await newEditorCommand('print ("version="+dbe.majorVersion());\n');
    const expectedOutput = expect.stringMatching('version=3');
    expect(output.toString()).toEqual(expectedOutput);
  });

  test('Check version on 3.2', async () => {
    await r.profileList.clickProfile(1);
    await r.browser.waitForExist(r.treeAction.treeNodeSelector);
    await r.editor._editorElementsExist();
    const output = await newEditorCommand('print ("version="+dbe.majorVersion());\n');
    const expectedOutput = expect.stringMatching('version=3.2');
    expect(output.toString()).toEqual(expectedOutput);
  });

  test('Check version on EC2', async () => {
    await r.profileList.clickProfile(3);
    await r.browser.waitForExist(r.treeAction.treeNodeSelector);
    await r.editor._editorElementsExist();
    const output = await newEditorCommand(
      'print ("version="+dbe.majorVersion());\ndb.serverStatus().host;\n'
    );
    let expectedOutput = expect.stringMatching('version=3.6');
    expect(output.toString()).toEqual(expectedOutput);
    expectedOutput = expect.stringMatching('ap-southeast-2.compute.internal');
    expect(output.toString()).toEqual(expectedOutput);
  });

  const terminalCommand = async (profileNo, mongoCommands) => {
    await r.profileList.clickProfile(profileNo);
    await r.browser.waitForExist(r.treeAction.treeNodeSelector);
    await r.editor._editorElementsExist();

    if (debug) console.log(mongoCommands);

    await r.output.clearOutput.click();
    r.browser.pause(r.delay);

    await r.terminal.executeCommand(mongoCommands);
    await r.browser.pause(r.delay);
    const outputLines = await r.output.getAllOutputLines();

    if (debug) console.log(outputLines);
    return outputLines;
  };

  test('Check 3.0 version from terminal', async () => {
    const versionCmd = 'print ("version="+dbe.majorVersion());\n';
    const output = await terminalCommand(0, versionCmd);
    const expectedOutput = expect.stringMatching('version=3');
    expect(output.toString()).toEqual(expectedOutput);
  });

  test('Check 3.2 version from terminal', async () => {
    const versionCmd = 'print ("version="+dbe.majorVersion());\n';
    const output = await terminalCommand(1, versionCmd);
    const expectedOutput = expect.stringMatching('version=3.2');
    expect(output.toString()).toEqual(expectedOutput);
  });

  test('Check Atlas version from terminal', async () => {
    const versionCmd = 'print ("version="+dbe.majorVersion());\n';
    const output = await terminalCommand(2, versionCmd);
    const expectedOutput = expect.stringMatching('version=3.4');
    expect(output.toString()).toEqual(expectedOutput);
  });

  test('Start with a 3.0 connection window', async () => {
    if (debug) console.log('Start with a 3.0 connection window');
    await r.profileList.clickProfile(0);
    await r.browser.waitForExist(r.treeAction.treeNodeSelector);

    // await r.output.setNewOutputCursor();
    await r.browser.pause(r.delay);
    let mongoCmds = 'print ("version="+dbe.majorVersion());\n';
    mongoCmds += 'print("hosted by "+db.serverStatus().host.split(".")[1]);\n';
    const output = await editorCommand(mongoCmds);
    const expectedOutput = expect.stringMatching('version=3');
    expect(output.toString()).toEqual(expectedOutput);
  });

  test('Switch editor connection to Atlas', async () => {
    if (debug) console.log('Switch editor connection to Atlas');
    if (r.shellVersion >= 3.4) {
      await r.editor._selectConnectionContext('Atlas');
      await r.browser.pause(r.delay); // Atlas takes longer
      await r.editor._editorElementsExist();
      r.browser.pause(r.delay);
      const output = await repeatEditorCommand();
      const expectedOutput = expect.stringMatching('hosted by mongodb');
      // if (debug) await r.debug();
      expect(output.toString()).toEqual(expectedOutput);
    } else {
      console.log('Switching to Altas does not work on shells earlier than 3.4');
    }
  });

  test('Switch editor connection to 3.2', async () => {
    if (debug) console.log('Switch editor connection to db32');
    await r.editor._selectConnectionContext('db32');
    await r.browser.pause(r.delay);
    await r.editor._editorElementsExist();
    r.browser.pause(r.delay);
    const output = await repeatEditorCommand();
    const expectedOutput = expect.stringMatching('version=3.2');
    // if (debug) await r.debug();
    expect(output.toString()).toEqual(expectedOutput);
  });

  test('Switch editor connection to EC2 shards', async () => {
    if (debug) console.log('Switch editor connection to EC2');
    await r.editor._selectConnectionContext('EC2');
    await r.browser.pause(r.delay);
    await r.editor._editorElementsExist();
    r.browser.pause(r.delay);
    const output = await repeatEditorCommand();
    const expectedOutput = expect.stringMatching('version=3.6');
    // if (debug) await r.debug();
    expect(output.toString()).toEqual(expectedOutput);
  });

  test('Check we are now connected to mongos', async () => {
    if (debug) console.log('Check we are now connected to mongos');
    const output = await editorCommand('print("process="+db.serverStatus().process);');
    const expectedOutput = expect.stringMatching('process=mongos');
    // if (debug) await r.debug();
    expect(output.toString()).toEqual(expectedOutput);
  });

  test('Check Shard tree node on EC2', async () => {
    await r.profileList.clickProfile(3);
    await r.browser.waitForExist(r.treeAction.treeNodeSelector);
    await r.treeAction.getTreeNodeByPath(['Shards']).pause(500);
    expect(true).toEqual(true);
  });

  test('Check Replica set node on Atlas', async () => {
    await r.profileList.clickProfile(2);
    await r.browser.waitForExist(r.treeAction.treeNodeSelector);
    // if (debug) await r.debug();
    await r.treeAction
      .getTreeNodeByPath(['Replica Set']) // eslint-disable-line
      .pause(500);
    expect(true).toEqual(true);
  });
});
