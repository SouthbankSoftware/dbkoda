/**
 * @Author: chris
 * @Date:   2017-04-28T15:03:44+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-23T09:53:59+10:00
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

export default class Output extends Page {
  outputPanelSelector = '.pt-tab-panel.visible[aria-hidden="false"]';
  outputToolbarSelector = '.outputToolbar';
  clearOutputSelector = '.clearOutputBtn';
  showMoreSelector = '.showMoreBtn';
  saveOutputSelector = '.saveOutputBtn';
  visibleTabsSelector = '.outputTabView .pt-tab.visible';
  selectedTabSelector = '.outputTabView .pt-tab.visible[aria-selected="true"]';
  currentVisibleOutputSelector = '.pt-tab-panel.visible .outputEditor';
  outputLinesSelector = '.pt-tab-panel.visible > .outputEditor > .ReactCodeMirror .CodeMirror-code';
  newOutputCursor = 0;
  codeMirrorSelector = this.outputPanelSelector + ' .CodeMirror';
  // Context Menu selectors
  menuSelector = '.outputContextMenu';
  jsonViewSelector = this.menuSelector + ' .showJsonView';
  jsonContentSelector = '';
  tableViewSelector = this.menuSelector + ' .showTableView';
  tableContentSelector = '';
  LINE_HEIGHT = 18; // CodeMirror Output lines are 18 px high
  LINE_OFFSET = 4; // First 4px are padding to be skipped

  /** @type {WebDriverIoPromise} */
  get clearOutputBtn() {
    return this._getOutputToolbarElement(this.clearOutputSelector);
  }

  /** @type {WebDriverIoPromise} */
  get showMoreBtn() {
    return this._getOutputToolbarElement(this.showMoreSelector);
  }

  /** @type {WebDriverIoPromise} */
  get saveOutputBtn() {
    return this.browser.click(this._getOutputToolbarElement(this.saveOutputSelector));
  }

  /** @type {WebDriverIoPromise} */
  get visibleTabs() {
    return this.browser.elements(this.visibleTabsSelector);
  }

  /** @type {WebDriverIoPromise} */
  get selectedTab() {
    return this.browser.elements(this.selectedTabSelector);
  }

  /** @type {WebDriverIoPromise} */
  get outputLines() {
    return this.browser.element(this.outputLinesSelector);
  }

  /** @type {WebDriverIoPromise} */
  // eslint-disable-next-line class-methods-use-this
  get explainOutput() {
    return null;
  }

  /** @type {WebDriverIoPromise} */
  _visibleTabNames() {
    return this.browser.getText(this.visibleTabsSelector);
  }

  /** @type {WebDriverIoPromise} */
  async _isShowMoreDisabled() {
    const disabled = await this.browser.getAttribute(this.showMoreSelector, 'disabled');
    let showMoreDisabled = true;
    if (disabled != 'true') {
      showMoreDisabled = false;
    }
    return showMoreDisabled;
  }

  /** @type {WebDriverIoPromise} */
  getAllOutputLines() {
    // return this.browser.getHTML(this.outputLinesSelector, false);
    return this.browser.getText(this.outputLinesSelector);
  }

  async activeTabName() {
    await this.browser.waitForExist(this.selectedTabSelector);
    return this.browser.getHTML(this.selectedTabSelector, false);
  }

  /** Sets the outputCursor such that subsequent calls to getNewOutputLines
   *  return only the output data after the current cursor value.
   */
  async setNewOutputCursor() {
    const output = await this.getAllOutputLines();
    this.newOutputCursor = output.length;
  }

  /** Resets the output cursor back to 0
   */
  async initOutputCursor() {
    this.newOutputCursor = 0;
  }

  /** @return {String} newOutput - returns the output filtered by the cursor set
   *  in the last call to setNewOutputCursor. If setNewOutputCursor has not been
   * called, returns all output.
   */
  async getNewOutputLines() {
    const newOutput = await this.browser.getText(this.outputLinesSelector);
    return newOutput.substring(this.newOutputCursor);
  }

  /** @type {WebDriverIoPromise} */
  async _getOutputToolbarElement(name) {
    await this.browser.waitForExist(`${this.outputToolbarSelector} ${name}`);
    return this.browser.element(`${this.outputToolbarSelector} ${name}`);
  }

  /*
   *
   */
  async _openContextMenu(lineNumber) {
    const xOffset = 100;
    const yOffset = this.LINE_OFFSET + this.LINE_HEIGHT * lineNumber;
    return this.browser
      .waitForExist(`${this.codeMirrorSelector}-scroll`)
      .rightClick(`${this.codeMirrorSelector}-scroll`, xOffset, yOffset)
      .waitForExist(this.menuSelector);
  }

  async openJsonView(lineNumber) {
    await this._openContextMenu(lineNumber);
    return this.browser.waitForExist(`${this.jsonViewSelector}`).click(`${this.jsonViewSelector}`);
  }

  async openTableView(lineNumber) {
    await this._openContextMenu(lineNumber);
    return this.browser
      .waitForExist(`${this.tableViewSelector}`)
      .click(`${this.tableViewSelector}`);
  }

  async clearOutput() {
    await this.browser.waitForExist(this.clearOutputSelector);
    return this.browser.click(this.clearOutputSelector);
  }

  async showMore() {
    await this.browser.waitForExist(this.showMoreSelector);
    return this.browser.click(this.showMoreSelector);
  }

  async saveOutput() {
    await this.browser.waitForExist(this.saveOutputSelector);
    return this.browser.click(this.saveOutputSelector);
  }
}
