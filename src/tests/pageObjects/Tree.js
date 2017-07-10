/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-26T09:58:01+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-05-30T14:48:13+10:00
 */

import Page from './Page';

class Tree extends Page {

  treeNodeSelector = '.pt-tree-node-list > li';

  shardsNodeSelector = '.shardsIcon';

  configsNodeSelector = '.configServersIcon';

  routersNodeSelector = '.routersIcon';

  databasesNodeSelector = '.databasesIcon';

  usersNodeSelector = '.usersIcon';

  shardNodeSelector = '.shardIcon';

  configNodeSelector = '.configIcon';

  mongosNodeSelector = '.mongosIcon';

  databaseNodeSelector = '.databaseIcon';

  collectionNodeSelector = '.collectionIcon';

  indexNodeSelector = '.indexIcon';

  userNodeSelector = '.userIcon';

  replicasetNodeSelector = '.replicaSetIcon';

  replicaMemberNodeSelector = '.replicaMemberIcon';

  _getTreeElement(name) {
    return this.browser.element(`${name}`);
  }
  get refreshButton() {
        return this.browser.element('.refreshTreeButton');
  }
  getTreeNode(selector) {
    return this._getTreeElement(selector).$('..').$('..');
  }
  getTreeNodeCaret(selector) {
    return this.getTreeNode(selector).$('.pt-tree-node-caret');
  }
  getTreeNodeLabel(selector) {
    return this.getTreeNode(selector).$('.pt-tree-node-label span');
  }

  async _clickRefreshButton() {
    await this
      .refreshButton
      .click();
  }

  async checkTreeNodeExpanded(selector) {
    try {
      const bExpanded = await this.getTreeNode(selector).waitForExist(
        '.pt-tree-node-caret-open',
        100
      );
      return bExpanded;
    } catch (e) {
      return false;
    }
  }

  toogleExpandTreeNode(selector) {
    return this.getTreeNodeCaret(selector).leftClick();
  }

  async dragAndMoveTreeNode(selector, xOffset, yOffset) {
    await this.getTreeNodeLabel(selector)
      .moveToObject()
      .pause(2000)
      .buttonDown()
      .moveTo(null, xOffset, yOffset)
      .pause(2000)
      .buttonUp();
  }
}

export default Tree;
