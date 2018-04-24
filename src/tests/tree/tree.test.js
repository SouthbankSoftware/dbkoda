/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-26T09:37:52+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-30T09:34:17+10:00
 */

import { getRandomPort, killMongoInstance, launchSingleInstance } from 'test-utils';
import Tree from '../pageObjects/Tree';
import ConnectionProfile from '../pageObjects/Connection';
import { config, getApp } from '../helpers';

describe('tree-test-suite', () => {
  // always config test suite
  config();

  let app;
  let browser;
  let tree;
  let mongoPort1;
  // let mongoPort2;
  let connectProfile;

  const cleanup = () => {
    killMongoInstance(mongoPort1);
    // killMongoInstance(mongoPort2);
    if (app && app.isRunning()) {
      return app.stop();
    }
  };
  beforeAll(async () => {
    mongoPort1 = getRandomPort();
    // mongoPort2 = getRandomPort();
    launchSingleInstance(mongoPort1);
    // launchSingleInstance(mongoPort2);
    process.on('SIGINT', cleanup);
    return getApp().then(res => {
      app = res;
      browser = app.client;
      tree = new Tree(browser);
      connectProfile = new ConnectionProfile(browser);
    });
  });

  afterAll(() => {
    return cleanup();
  });

  test('get the tree topology from new profile', async () => {
    await connectProfile.connectProfileByHostname({
      alias: 'Test1',
      hostName: 'localhost',
      port: mongoPort1,
      database: 'test'
    });

    const bTreeNode = await browser.waitForExist(tree.treeNodeSelector);
    expect(bTreeNode).toBe(true);
  });

  test('connect to EC2 instance and check for basic tree nodes exists', async () => {
    await connectProfile.connectProfileByURL({
      alias: 'Test 27017(' + getRandomPort() + ')',
      url: `mongodb://${process.env.EC2_SHARD_CLUSTER_HOSTNAME}:27017`,
      database: 'admin',
      authentication: true,
      userName: process.env.EC2_SHARD_CLUSTER_USERNAME,
      password: process.env.EC2_SHARD_CLUSTER_PASSWORD
    });

    let bTreeNode = await browser.waitForExist(tree.shardsNodeSelector);
    expect(bTreeNode).toBe(true);

    bTreeNode = await browser.waitForExist(tree.configsNodeSelector);
    expect(bTreeNode).toBe(true);

    bTreeNode = await browser.waitForExist(tree.routersNodeSelector);
    expect(bTreeNode).toBe(true);

    bTreeNode = await browser.waitForExist(tree.databasesNodeSelector);
    expect(bTreeNode).toBe(true);

    bTreeNode = await browser.waitForExist(tree.usersNodeSelector);
    expect(bTreeNode).toBe(true);
  });

  test('expand and collapse the database node', async () => {
    const bDatabasesNode = await browser.waitForExist(tree.databasesNodeSelector);
    expect(bDatabasesNode).toBe(true);

    let bDBNodeExpanded = await tree.checkTreeNodeExpanded(tree.databasesNodeSelector);
    console.log('bDBNodeExpanded: ', bDBNodeExpanded);

    await tree
      .getTreeNodeCaret(tree.databasesNodeSelector)
      .leftClick()
      .pause(500);

    bDBNodeExpanded = await tree.checkTreeNodeExpanded(tree.databasesNodeSelector);
    console.log('bDBNodeExpanded: ', bDBNodeExpanded);
    expect(bDBNodeExpanded).toBe(true);

    await tree.toogleExpandTreeNode(tree.databasesNodeSelector).pause(500);

    bDBNodeExpanded = await tree.checkTreeNodeExpanded(tree.databasesNodeSelector);
    console.log('bDBNodeExpanded: ', bDBNodeExpanded);
    expect(bDBNodeExpanded).toBe(false);
  });

  // test('drag and drop a tree node', async () => {
  //   let editorText = await browser.getText('.CodeMirror-scroll');
  //   console.log('editorText:', editorText);
  //
  //   await browser.pause(2000);
  //
  //   console.log('NodeLabel: ', await tree.getTreeNodeLabel(tree.databasesNodeSelector).getText());
  //
  //   tree.dragAndMoveTreeNode(tree.databasesNodeSelector, 400, 0);
  //
  //   await browser.pause(5000);
  //   editorText = await browser.getText('.CodeMirror-scroll');
  //   console.log('editorText:', editorText);
  // });
});
