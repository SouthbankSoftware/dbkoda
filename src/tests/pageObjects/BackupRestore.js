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
import {DELAY_TIMEOUT} from '../helpers/config';

/**
 * all parameter names used on backup/restore commands
 */
export const ParameterName = {
  pathInput: 'pathInput',
  gzip: 'gzip',
  allCollections: 'all-collections',
  allDatabases: 'all-databases',
  repair: 'repair',
  dumpDbUsersAndRoles: 'dumpDbUsersAndRoles',
  viewsAsCollections: 'viewsAsCollections',
  forceTableScan: 'forceTableScan',
  query: 'query',
  readPreference: 'readPreference',
};

/**
 * define each parameter classname and type
 */
export const Options = {
  [ParameterName.pathInput]: {clsName: 'path-input', type: 'input'},
  [ParameterName.gzip]: {clsName: 'gzip input', type: 'checkbox'},
  [ParameterName.allCollections]: {clsName: 'all-collections input', type: 'checkbox'},
  [ParameterName.allDatabases]: {clsName: 'all-collections input', type: 'checkbox'},
  [ParameterName.repair]: {clsName: 'repair input', type: 'checkbox'},
  [ParameterName.dumpDbUsersAndRoles]: {clsName: 'dump-db-users-and-roles input', type: 'checkbox'},
  [ParameterName.viewsAsCollections]: {clsName: 'views-as-collections input', type: 'checkbox'},
  [ParameterName.forceTableScan]: {clsName: 'force-table-scan input', type: 'checkbox'},
  [ParameterName.query]: {clsName: 'query', type: 'input'},
  [ParameterName.readPreference]: {clsName: 'read-preference', type: 'input'},
};

/**
 * tree action command name
 */
export const TreeActions = {
  DUMP_DATABASE: 'Dump Database',
  RESTORE_DATABASE: 'Restore Database',
  IMPORT_COLLECTIONS: 'Import Collections',
  EXPORT_COLLECTIONS: 'Export Collections',
  DUMP_DATABASES: 'Dump Databases',
  RESTORE_DATABASES: 'Restore Databases',
  IMPORT_COLLECTION: 'Import Collection',
  EXPORT_COLLECTION: 'Export Collection'
};

const getOptionObject = (key) => {
  return Options[key];
};

export default class BackupRestore extends Page {
  panelSelector = '.database-export-panel';

  prefixSelector = '.db-backup-';

  executeButtonSelector = this.prefixSelector + 'execute';

  closeButtonSelector = this.prefixSelector + 'close';

  /**
   * run mongodump on the database
   * @param db  the name of the database
   * @param options the options of mongodump command. The parameters can be found at ParameterName objects
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
    await treeAction.getTreeNodeByPath(['Databases', db]).rightClick().pause(1000);
    // await this.browser.rightClick(this._getDatabaseSelector(db));
    await treeAction.clickContextMenu('Dump Database');
    await this.browser.waitForExist(this.panelSelector);
    await this.browser.pause(1000);
    const dbValue = await this.browser.getValue(this.prefixSelector + 'database-input');
    assert.equal(dbValue, db);
    await this.fillInOptions(options);
    await this.executeCommand();
    await this.browser.pause(3000);
    await this.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  }

  /**
   * run mongorestore to restore databases
   *
   * @param db  the database name to be restored
   * @param options
   */
  async restoreDatabase(db, options) {
    const tree = new Tree(this.browser);
    const treeAction = new TreeAction(this.browser);
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
    await this.browser.waitForExist(tree.treeNodeSelector);
    await this.browser.pause(1000);
    await treeAction.getTreeNodeByPath(['Databases', db]).rightClick().pause(1000);
    await treeAction.clickContextMenu('Restore Database');
    await this.browser.waitForExist(this.panelSelector);
    const dbValue = await this.browser.getValue(this.prefixSelector + 'database-input');
    assert.equal(dbValue, db);
    await this.fillInOptions(options);
    await this.executeCommand();
    await this.browser.pause(3000);
    await this.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  }

  /**
   * open the backup restore panel
   * @param nodePath the node path to be selected. For example, ['Databases', 'admin'] means select the admin database node
   * @param action the context menu action, can be one of the value from
   *        {TreeActions.DUMP_DATABASE, TreeActions.DUMP_DATABASES, TreeActions.RESTORE_DATABASE, TreeActions.RESTORE_DATABASES,
   *         TreeActions.IMPORT_COLLECTION, TreeACtions.IMPORT_COLLECTIONS, TreeActions.EXPORT_COLLECTION, TreeActions.EXPORT_COLLECTIONS}
   * @param options  the parameter values on the panel. All parameter names are defined in ParameterName object
   */
  async openMongoBackupRestorePanel(nodePath, action, options) {
    const tree = new Tree(this.browser);
    const treeAction = new TreeAction(this.browser);
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
    await this.browser.waitForExist(tree.treeNodeSelector);
    await this.browser.pause(1000);
    await treeAction.getTreeNodeByPath(nodePath).rightClick().pause(1000);
    await treeAction.clickContextMenu(action);
    await this.fillInOptions(options);
  }

  /**
   * click execute button to run commands
   */
  async executeCommand() {
    await this.browser.waitForExist(this.executeButtonSelector, DELAY_TIMEOUT);
    await this.browser.leftClick(this.executeButtonSelector);
  }

  async closePanel() {
    await this.browser.waitForExist(this.closeButtonSelector, DELAY_TIMEOUT);
    await this.browser.leftClick(this.closeButtonSelector);
    await this.browser.waitForExist(this.closeButtonSelector, DELAY_TIMEOUT, true);
  }

  /**
   * get the parameter value from the panel
   * @param name
   */
  async getParameterValue(name) {
    const parameterSelector = this.getParameterSelector(name);
    const o = getOptionObject(name);
    if (o.type === 'checkbox') {
      return this.browser.getAttribute(parameterSelector, 'checked');
    } else if (o.type === 'input') {
      return this.browser.getValue(parameterSelector);
    }
  }


  /**
   * get parameter class name selector
   * @param name   the name of the parameter
   * @returns {string}
   */
  getParameterSelector(name) {
    return this.prefixSelector + getOptionObject(name).clsName;
  }

  /**
   * fill in the given options on the panel
   * @param options the options is a json object for the mongo command parameters
   */
  async fillInOptions(options) {
    await _.forOwn(options, async (value, key) => {
      const o = getOptionObject(key);
      if (o.type === 'input') {
        await this.browser.setValue(this.prefixSelector + o.clsName, value);
        await this.browser.waitForValue(this.prefixSelector + o.clsName);
      } else if (o.type === 'checkbox') {
        await this._setCheckbox(this.prefixSelector + o.clsName, value);
      }
      await this.browser.pause(1000);
    });
  }

  /**
   * make the checkbox selected or unselected
   * @param selector the checkbox selector
   * @param checked whether select the checkbox
   */
  async _setCheckbox(selector, checked) {
    const current = await this.browser.getAttribute(selector, 'checked');
    if (checked && current !== 'true') {
      await this.browser.click(selector.replace(' input', ''));
    } else if (!checked && current === 'true') {
      await this.browser.click(selector.replace(' input', ''));
    }
    this.browser.pause(1000);
  }
}
