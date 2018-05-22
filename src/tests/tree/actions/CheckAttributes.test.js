/**
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-23T09:38:30+10:00
 */

/* eslint no-await-in-loop: 0 */

import _ from 'lodash';

import TreeAction from '#/pageObjects/TreeAction';
import Connection from '#/pageObjects/Connection';
import Editor from '#/pageObjects/Editor';
import Output from '#/pageObjects/Output';

import { config, getApp } from '#/helpers';

const debug = true;

describe('TreeAction:CheckAttributes', () => {
  /** Global (to current test suite) setup */
  config({
    setupFailFastTest: false
  });

  global.jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

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
    expect(await browser.waitForExist(treeAction.treeNodeSelector, 10000)).toBeTruthy;
    // if (debug) await r.debug();
  });

  const editorCommand = async inputCommands => {
    if (debug) console.log(inputCommands);
    await r.output.clearOutput();
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

  test('List collections in SampleCollections', async () => {
    const output = await editorCommand('db.getSiblingDB("SampleCollections").getCollectionNames()');
    // if (debug) await r.debug();
    const lines = output.split('\n');
    if (debug) console.log(lines);
    lines.shift();
    // lines.pop();
    lines.pop();
    if (lines[lines.length - 1].indexOf('dbKoda&gt;') >= 0) {
      lines.pop();
    }
    console.log(lines.join(''));
    r.collections = JSON.parse(lines.join(''));
    if (debug) console.log(r.collections);
  });

  test(
    'Make sure we can get attributes for all collections',
    async () => {
      await r.treeAction.getTreeNodeByPath(['Databases', 'SampleCollections']).pause(500);
      for (let ci = 0; ci < r.collections.length; ci += 1) {
        const col = r.collections[ci];
        if (col !== 'serverStats') {
          console.log('Now getting attributes for ' + col);
          await r.treeAction
            .getTreeNodeByPath(['Databases', 'SampleCollections', col])
            .rightClick()
            .pause(1000);
          await r.treeAction.clickContextMenu('Find Attributes'); // eslint-disable-line
          await r.browser.pause(1000);
          await r.treeAction
            .getTreeNodeByPath(['Databases', 'SampleCollections', col, 'Attributes']) // eslint-disable-line
            .leftClick()
            .pause(1000);
        } else {
          console.log('Skipping serverStats');
        }
      }
    },
    240000
  );
});
