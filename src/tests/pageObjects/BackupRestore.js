/**
 * Created by joey on 17/8/17.
 * @Last modified by:   guiguan
 * @Last modified time: 2018-02-26T15:42:16+11:00
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

import assert from 'assert';
import Page from './Page';
import Tree from './Tree';
import TreeAction from './TreeAction';
import {DELAY_TIMEOUT} from '../helpers/config';

/* eslint "no-await-in-loop": 0 */

/**
 * all parameter names used on backup/restore commands
 */
export const ParameterName = {
  database: 'database',
  selectedCollections: 'selectedCollections',
  selectedDatabases: 'selectedDatabases',
  collection: 'collection',
  collectionSelect : 'collectionSelect',
  pathInput: 'pathInput',
  gzip: 'gzip',
  allCollections: 'allCollections',
  allDatabases: 'allDatabases',
  repair: 'repair',
  dumpDbUsersAndRoles: 'dumpDbUsersAndRoles',
  viewsAsCollections: 'viewsAsCollections',
  forceTableScan: 'forceTableScan',
  query: 'query',
  readPreference: 'readPreference',
  drop: 'drop',
  dryRun: 'dryRun',
  writeConcern: 'writeConcern',
  noIndexRestore: 'noIndexRestore',
  noOptionsRestore: 'noOptionsRestore',
  keepIndexVersion: 'keepIndexVersion',
  maintainInsertionOrder: 'maintainInsertionOrder',
  numParallelCollections: 'numParallelCollections',
  numInsertionWorkers: 'numInsertionWorkers',
  numInsertionWorkersImport: 'numInsertionWorkersImport',
  stopOnError: 'stopOnError',
  bypassDocumentValidation: 'bypassDocumentValidation',
  objcheck: 'objcheck',
  oplogReplay: 'oplogReplay',
  oplogLimit: 'oplogLimit',
  restoreDbUsersAndRoles: 'restoreDbUsersAndRoles',
  pretty: 'pretty',
  jsonArray: 'json-array',
  noHeaderLine: 'noHeaderLine',
  fields: 'fields',
  assertExists: 'assertExists',
  skip: 'skip',
  limit: 'limit',
  sort: 'sort',
  type: 'type',
  headerLine: 'headerLine',
  columnsHaveTypes: 'columnsHaveTypes',
  ignoreBlanks: 'ignoreBlanks',
  upsertFields: 'upsertFields',
};

/**
 * define each parameter classname and type
 */
export const Options = {
  [ParameterName.database]: {clsName: 'database-input', type: 'input'},
  [ParameterName.collection]: {clsName: 'collection-input', type: 'input'},
  [ParameterName.collectionSelect]: {clsName: 'list-select', type: 'select'},
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
  [ParameterName.drop]: {clsName: 'drop input', type: 'checkbox'},
  [ParameterName.dryRun]: {clsName: 'dry-run input', type: 'checkbox'},
  [ParameterName.writeConcern]: {clsName: 'write-concern', type: 'input'},
  [ParameterName.noIndexRestore]: {clsName: 'no-index-restore input', type: 'checkbox'},
  [ParameterName.noOptionsRestore]: {clsName: 'no-options-restore input', type: 'checkbox'},
  [ParameterName.keepIndexVersion]: {clsName: 'keep-index-version input', type: 'checkbox'},
  [ParameterName.maintainInsertionOrder]: {clsName: 'maintain-insertion-order input', type: 'checkbox'},
  [ParameterName.numParallelCollections]: {clsName: 'num-parallel-collections input', type: 'input'},
  [ParameterName.numInsertionWorkers]: {clsName: 'num-insertion-workers input', type: 'input'},
  [ParameterName.numInsertionWorkersImport]: {clsName: 'num-insertion-workers', type: 'input'},
  [ParameterName.stopOnError]: {clsName: 'stop-on-error input', type: 'checkbox'},
  [ParameterName.bypassDocumentValidation]: {clsName: 'bypass-document-validation input', type: 'checkbox'},
  [ParameterName.objcheck]: {clsName: 'objcheck input', type: 'checkbox'},
  [ParameterName.oplogReplay]: {clsName: 'oplog-replay input', type: 'checkbox'},
  [ParameterName.oplogLimit]: {clsName: 'oplog-limit', type: 'input'},
  [ParameterName.restoreDbUsersAndRoles]: {clsName: 'restore-db-users-and-roles input', type: 'checkbox'},
  [ParameterName.pretty]: {clsName: 'pretty input', type: 'checkbox'},
  [ParameterName.jsonArray]: {clsName: 'json-array input', type: 'checkbox'},
  [ParameterName.noHeaderLine]: {clsName: 'no-header-line input', type: 'checkbox'},
  [ParameterName.fields]: {clsName: 'output-fields', type: 'input'},
  [ParameterName.assertExists]: {clsName: 'assert-exists input', type: 'checkbox'},
  [ParameterName.skip]: {clsName: 'skip input', type: 'number'},
  [ParameterName.limit]: {clsName: 'limit input', type: 'number'},
  [ParameterName.sort]: {clsName: 'export-sort', type: 'input'},
  [ParameterName.type]: {clsName: 'type', type: 'select'},
  [ParameterName.headerLine]: {clsName: 'change-header-line input', type: 'checkbox'},
  [ParameterName.columnsHaveTypes]: {clsName: 'columns-have-types', type: 'input'},
  [ParameterName.ignoreBlanks]: {clsName: 'ignore-blanks input', type: 'checkbox'},
  [ParameterName.maintainInsertionOrder]: {clsName: 'maintain-insertion-order input', type: 'checkbox'},
  [ParameterName.upsertFields]: {clsName: 'upsert-fields', type: 'input'},
  [ParameterName.selectedCollections]: {clsName: 'list-select', type: 'select'},
  [ParameterName.selectedDatabases]: {clsName: 'list-select', type: 'select'},
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
  EXPORT_COLLECTION: 'Export Collection',
  DUMP_COLLECTION: 'Dump Collection',
  RESTORE_COLLECTION: 'Restore Collection'
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
   * run mongodump on the given database
   * @param db  the name of the database
   * @param options the options of mongodump command. The parameters can be found at ParameterName objects
   */
  async dumpDatabase(db, options) {
    const tree = new Tree(this.browser);
    await this.openMongoBackupRestorePanel(['Databases', db], TreeActions.DUMP_DATABASE, options);
    await this.browser.waitForExist(this.panelSelector);
    await this.browser.pause(1000);
    const dbValue = await this.browser.getValue(this.prefixSelector + 'database-input');
    assert.equal(dbValue, db);
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
    options[ParameterName.database] = db;
    await this.openMongoBackupRestorePanel(['Databases'], TreeActions.RESTORE_DATABASES, options);
    await this.browser.waitForExist(this.panelSelector);
    const dbValue = await this.browser.getValue(this.prefixSelector + 'database-input');
    assert.equal(dbValue, db);
    await this.executeCommand();
    await this.browser.pause(3000);
    await this.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  }

  /**
   * open mongo dump tree panel from Databases tree node and dump the database from array parameter
   * @param dbs an array including database names
   * @param options
   */
  async dumpServerDatabases(dbs, options) {
    const tree = new Tree(this.browser);
    options[ParameterName.allDatabases] = false;
    options[ParameterName.selectedDatabases] = dbs;
    await this.openMongoBackupRestorePanel(['Databases'], TreeActions.DUMP_DATABASES, options);
    await this.browser.waitForExist(this.panelSelector);
    await this.browser.pause(1000);
    await this.executeCommand();
    await this.browser.pause(3000);
    await this.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  }

  /**
   * dump database collections. It will select the collections from the given array
   * @param db  the name of database
   * @param cols  an array includes collection names
   * @param options
   */
  async dumpDatabaseCollections(db, cols, options) {
    const tree = new Tree(this.browser);
    options[ParameterName.allCollections] = false;
    options[ParameterName.selectedCollections] = cols;
    await this.openMongoBackupRestorePanel(['Databases', db], TreeActions.DUMP_DATABASE, options);
    await this.browser.waitForExist(this.panelSelector);
    await this.browser.pause(1000);
    await this.executeCommand();
    await this.browser.pause(3000);
    await this.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  }

  /**
   * restore a collection from database node
   * @param db  the name of the database
   * @param col  the name of the collection
   * @param options
   */
  async restoreDatabaseCollections(db, options) {
    const tree = new Tree(this.browser);
    await this.openMongoBackupRestorePanel(['Databases', db], TreeActions.RESTORE_DATABASE, options);
    await this.browser.waitForExist(this.panelSelector);
    await this.browser.pause(1000);
    await this.executeCommand();
    await this.browser.pause(3000);
    await this.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  }

  /**
   * dump a collection.
   * @param db  the name of database
   * @param col  the name of the collection
   * @param options
   */
  async dumpCollection(db, col, options) {
    const tree = new Tree(this.browser);
    await this.openMongoBackupRestorePanel(['Databases', db, col], TreeActions.DUMP_COLLECTION, options);
    await this.browser.waitForExist(this.panelSelector);
    await this.browser.pause(1000);
    await this.executeCommand();
    await this.browser.pause(3000);
    await this.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  }

  /**
   * restore a collection
   * @param db  the name of the database
   * @param col  the name of the collection
   * @param options
   */
  async restoreCollection(db, col, options) {
    const tree = new Tree(this.browser);
    await this.openMongoBackupRestorePanel(['Databases', db, col], TreeActions.RESTORE_COLLECTION, options);
    await this.browser.waitForExist(this.panelSelector);
    await this.browser.pause(1000);
    await this.executeCommand();
    await this.browser.pause(3000);
    await this.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  }

  /**
   * export all collections in a database
   * @param db  the name of the database
   * @param options
   */
  async exportDatabase(db, options) {
    const tree = new Tree(this.browser);
    await this.openMongoBackupRestorePanel(['Databases', db], TreeActions.EXPORT_COLLECTIONS, options);
    await this.browser.waitForExist(this.panelSelector);
    await this.browser.pause(1000);
    await this.executeCommand();
    await this.browser.pause(3000);
    await this.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  }

  /**
   * import a collection into a database
   * @param db the name of database
   * @param col the name of collection
   */
  async importCollectionToDatabase(db, col, options) {
    const tree = new Tree(this.browser);
    options[ParameterName.collection] = col;
    await this.openMongoBackupRestorePanel(['Databases', db], TreeActions.IMPORT_COLLECTIONS, options);
    await this.browser.waitForExist(this.panelSelector);
    await this.browser.pause(1000);
    await this.executeCommand();
    await this.browser.pause(3000);
    await this.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  }

  /**
   * export a collection
   *
   * @param db  database name
   * @param col collection name
   * @param options
   */
  async exportCollection(db, col, options) {
    const tree = new Tree(this.browser);
    await this.openMongoBackupRestorePanel(['Databases', db, col], TreeActions.EXPORT_COLLECTION, options);
    await this.browser.waitForExist(this.panelSelector);
    await this.browser.pause(1000);
    await this.executeCommand();
    await this.browser.pause(3000);
    await this.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  }

  /**
   * import collection from collection node
   * @param db  database name
   * @param col collection name
   * @param options
   */
  async importCollection(db, col, options) {
    const tree = new Tree(this.browser);
    await this.openMongoBackupRestorePanel(['Databases', db, col], TreeActions.IMPORT_COLLECTION, options);
    await this.browser.waitForExist(this.panelSelector);
    await this.browser.pause(1000);
    await this.executeCommand();
    await this.browser.pause(3000);
    await this.closePanel();
    await tree.toogleExpandTreeNode(
      tree.databasesNodeSelector
    );
  }

  /**
   * export multiple collections from one database
   *
   * @param db  the name of the database
   * @param cols  the array of collection names
   * @param options
   */
  async exportDatabaseCollections(db, cols, options) {
    const tree = new Tree(this.browser);
    options[ParameterName.allCollections] = false;
    options[ParameterName.selectedCollections] = cols;
    await this.openMongoBackupRestorePanel(['Databases', db], TreeActions.EXPORT_COLLECTIONS, options);
    await this.browser.waitForExist(this.panelSelector);
    await this.browser.pause(1000);
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
    await this.browser.pause(1000);
    await this.fillInOptions(options);
    await this.browser.pause(1000);
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
    } else if (o.type === 'input' || o.type === 'number' || o.type === 'select') {
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
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        const o = getOptionObject(key);
        const value = options[key];
        await this.browser.waitForExist(this.prefixSelector + o.clsName);
        if (key === ParameterName.selectedCollections || key === ParameterName.selectedDatabases) {
          await this.selectCollections(value);
        } else if (o.type === 'input') {
          await this.browser.setValue(this.prefixSelector + o.clsName, value);
          // await this.browser.waitForValue(this.prefixSelector + o.clsName);
        } else if (o.type === 'number') {
          await this.browser.leftClick(this.prefixSelector + o.clsName);
          await this.browser.setValue(this.prefixSelector + o.clsName, value);
          await this.browser.waitForValue(this.prefixSelector + o.clsName);
        } else if (o.type === 'checkbox') {
          await this._setCheckbox(this.prefixSelector + o.clsName, value);
        } else if (o.type === 'select') {
          await this.browser.selectByVisibleText(this.prefixSelector + o.clsName, value);
        }
        await this.browser.pause(500);
      }
    }
  }

  async selectCollections(value) {
    await this.browser.waitForExist('.collection-list');
    const header = await this.browser.getText('.collection-list .header .key');
    assert.equal(header !== null, true);
    for (let i = 0; i < value.length; i += 1) {
      const selector = `div.collection-list div:nth-child(${i + 2}) .db-backup-list-select`;
      await this.browser.waitForExist(selector);
      await this.browser.selectByVisibleText(selector, value[i]);
    }
    await this.browser.pause(1000);
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
  }
}
