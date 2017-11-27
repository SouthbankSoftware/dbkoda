/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-04-26T09:58:01+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-27T13:30:18+11:00
 *
 * dbKoda - a modern, open source code editor, for MongoDB.
 * Copyright (C) 2017-2018 Southbank Software
 *
 * This file is part of dbKoda.
 *
 * dbKoda is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * dbKoda is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with dbKoda.  If not, see <http://www.gnu.org/licenses/>.
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
    return this._getTreeElement(selector)
      .$('..')
      .$('..');
  }
  getTreeNodeCaret(selector) {
    return this.getTreeNode(selector).$('.pt-tree-node-caret');
  }
  getTreeNodeLabel(selector) {
    return this.getTreeNode(selector).$('.pt-tree-node-label span');
  }

  async _clickRefreshButton() {
    await this.refreshButton.click();
  }

  async checkTreeNodeExpanded(selector) {
    try {
      const bExpanded = await this.getTreeNode(selector).waitForExist(
        '.pt-tree-node-caret-open',
        100,
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
