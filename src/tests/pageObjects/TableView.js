/**
 * @Author: Mike
 * @Date:   2017-10-30 09:09:56 GMT+10:00
 * @Email:  Mike@southbanksoftware.com
 * @Last modified by:   Mike
 * @Last modified time: 2017-10-30 09:09:56 GMT+10:00
 */

import os from 'os';
import Page from './Page';

export default class TableView extends Page {
  expandAllButtonSelector = '.outputToolbar > .pt-align-right > .expandWrapper > a';
  collapseAllButtonSelector = '.outputToolbar > .pt-align-right > .collapseWrapper > a';
  refreshButtonSelector = '.outputToolbar > .pt-align-right > div > span > a';
  documentLimitSelector = '.outputToolbar > .pt-align-left > div > div > span';
  tableWrapperSelector = '.tableViewWrapper > .table-json-panel';

  /** @type {WebDriverIoPromise} */
  get expandAllButton() {
    return this.browser.element(this.expandAllButtonSelector);
  }
  /** @type {WebDriverIoPromise} */
  get collapseAllButton() {
    return this.browser.element(this.collapseAllButtonSelector);
  }
  /** @type {WebDriverIoPromise} */
  get refreshButton() {
    return this.browser.element(this.refreshButtonSelector);
  }
  /** @type {WebDriverIoPromise} */
  get documentLimit() {
    return this.browser.element(this.documentLimitSelector);
  }
  /** @type {WebDriverIoPromise} */
  get tableWrapper() {
    return this.browser.element(this.tableWrapperSelector);
  }

  /** Give the terminal the shortcut to send a command to the editor */
  async expandAll() {
    return this.expandAllButton.leftClick();
  }

  async collapseAll() {
    return this.collapseAll.leftClick();
  }

  async refresh() {
    return this.refreshButton.leftClick();
  }

  async setDocumentLimit(newLimit) {
    await this.documentLimit.leftClick();
    await this.browser.pause(500);
    if (os.platform() !== 'darwin') {
      await this.browser.keys(['Control', 'a']).keys('NULL');
    } else {
      await this.browser.keys(['Command', 'a']).keys('NULL');
    }
    await this.browser.pause(500);
    await this.browser.keys(['Back space']).keys('NULL');
    await this.browser.keys(newLimit.split('')).keys(['NULL']);
  }
}
