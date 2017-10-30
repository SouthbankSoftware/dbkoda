/**
 * @Author: Mike
 * @Date:   2017-10-30 09:07:51 GMT+10:00
 * @Email:  mike@southbanksoftware.com
 * @Last modified by:   Mike
 * @Last modified time: 2017-10-30 09:07:51 GMT+10:00
 */

import {
  getRandomPort,
  killMongoInstance,
  launchSingleInstance,
} from 'test-utils';

import ConnectionProfile from '../pageObjects/Connection.js';
import TableView from '../pageObjects/TableView.js';
import TreeAction from '../pageObjects/TreeAction.js';
import Editor from '../pageObjects/Editor';
import Output from '../pageObjects/Output';
import { config, getApp } from '../helpers';

describe('table-output-test-suite', () => {
    config();

    // Declare all global variables.
    let app;
    let browser;
    let mongoPort;
    let treeAction;
    let tableView;
    let connection;
    let editor; // eslint-disable-line
    let output; // eslint-disable-line
    let template; // eslint-disable-line
    let templateInput; // eslint-disable-line

  beforeAll(async () => {
    return getApp().then((res) => {
      app = res;
      browser = app.client;
      editor = new Editor(browser);
      output = new Output(browser);
      mongoPort = getRandomPort();
      connection = new ConnectionProfile(browser);
      tableView = new TableView(browser);
      treeAction = new TreeAction(browser);
      launchSingleInstance(mongoPort);
    });
  });

  afterAll(() => {
    killMongoInstance(mongoPort);
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  test('Create New Connection', async () => {
    try {
            await browser.pause(500);
            await connection.connectProfileByHostname({
                alias: 'Test1',
                hostName: 'localhost',
                port: mongoPort,
                database: 'test',
            });
            await editor._appendToEditor(
                'use test\nfor (var i=2000;i<2020;i+=1) { db.companies.insertOne({ _id: i, name:"company"+i,founded_year:i, nestedArray: [{nestedName: "company"+i+i, nested_year: i+i, nested_something: "huh"},{nestedName: "company"+i+i, nested_year: i+i, nested_something: "huh"},{nestedName: "company"+i+i, nested_year: i+i, nested_something: "huh"}]});\n',
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

  test('Open Table View from Tree', async () => {
    await treeAction
      .getTreeNodeByPath(['Databases', 'test', 'companies'])
      .rightClick()
      .pause(500);

    await treeAction.clickContextMenu('View as Table').pause(500);
    expect(await browser.waitForExist('.tableViewWrapper > .table-json-panel')).toBeTruthy;
  });

  // @TODO: Figure out why expand and collapse buttons don't work on Linux.
  test.skip('Expand All Rows', async () => {
    await browser.debug();
    await tableView.expandAll();
    expect(await browser.waitForExist('.deepObjectWrapper')).toBeTruthy;
  });


  // @TODO: Figure out why expand and collapse buttons don't work on Linux.
  test.skip('Collapse All Rows', async () => {
    await tableView.collapseAll();
    expect(await browser.waitForExist('.deepObjectWrapper', 500, true))
      .toBeTruthy;
  });

  test('Expand a Single Row', async () => {
    await browser.element('.expandButton').leftClick();
    await browser.pause(500);
    expect(await browser.waitForExist('.deepObjectWrapper')).toBeTruthy;
  });

  test('Collapse a Single Row', async () => {
    await browser.element('.hideButton').leftClick();
    await browser.pause(500);
    expect(await browser.waitForExist('.deepObjectWrapper', 500, true)).toBeTruthy;
  });

  test('Change Document Limit to 1 and refresh.', async () => {
    await tableView.setDocumentLimit('1');
    await browser.pause(500);
    await tableView.refresh();
    await browser.pause(500);
    const op = await browser.getHTML('.docCount > b', false);
    expect(op).toMatch(/1/);
  });
});
