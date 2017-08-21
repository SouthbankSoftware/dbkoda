/*
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
/**
 * Created by joey on 17/8/17.
 */

import _ from 'lodash';
import assert from 'assert';
import Page from './Page';
import Tree from './Tree';
import TreeAction from './TreeAction';

export default class BackupRestore extends Page {

  panelSelector = '.database-export-panel';

  prefixSelector = '.db-backup-';

  options = {'path-input': {type: 'input'},
    'gzip': {type: 'checkbox'},
    'all-collections': {type: 'checkbox'},
    'all-databases': {type: 'checkbox'}};

  /**
   * run mongodump on the database
   * @param db  the name of the database
   * @param options the options of mongodump command
   * @returns {Promise.<void>}
   */
  async dumpDatabase(db, options) {
    const tree = new Tree(this.browser);
    const treeAction = new TreeAction(this.browser);
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
    await this.browser.waitForExist(tree.treeNodeSelector);
    await this.browser.pause(1000);
    await this.browser.rightClick(this._getDatabaseSelector(db));
    await treeAction.clickContextMenu('Dump Database');
    await this.browser.waitForExist(this.panelSelector);
    await this.browser.pause(1000);
    const dbValue = await this.browser.getValue(this.prefixSelector + 'database-input');
    assert.equal(dbValue, db);
    await this.fillInOptions(options);
    await this.browser.pause(10000);
  }

  /**
   * fill in the given options on the panel
   * @param options the options is a json object for the mongo command parameters:
   * {
   *  'path-input': '',
   *
   * }
   * @returns {Promise.<void>}
   */
  async fillInOptions(options) {
    await _.forOwn(options, async (value, key) => {
      console.log('fill in options ', key, value);
      await this.browser.leftClick(this.prefixSelector + key);
      const o = this._getOptionObject(key);
      if (o.type === 'input') {
        await this.browser.setValue(this.prefixSelector + key, value);
        await this.browser.waitForValue(this.prefixSelector + key);
      } else if (o.type === 'checkbox') {
        const checked = await this.browser.getValue(this.prefixSelector + key);
        console.log('checked value', key, checked);
        await this.browser.leftClick(this.prefixSelector + key);
        console.log('checked value', key, await this.browser.getValue(this.prefixSelector + key));
      }
    });
  }

  /**
   * get database xpath select based on database name
   * @param db  the database name
   * @private
   */
  _getDatabaseSelector(db) {
    return `//span[@class="pt-tree-node-label"]/span[contains(string(),"${db}")]`;
  }

  _getOptionObject(key) {
    if (key === 'all-databases') {
      return this.options['all-collections'];
    }
    return this.options[key];
  }
}
