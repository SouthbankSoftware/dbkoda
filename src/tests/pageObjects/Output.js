/**
 * @Author: chris
 * @Date:   2017-04-28T15:03:44+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-08-25T10:25:28+10:00
 */

import Page from './Page';

export default class Output extends Page {
  outputPanelSelector = '.pt-tab-panel.visible[aria-hidden="false"]';
  clearOutputSelector = '.clearOutputBtn';
  showMoreSelector = '.showMoreBtn';
  saveOutputSelector = '.saveOutputBtn';
  visibleTabsSelector = '.outputTabView .pt-tab.visible';
  selectedTabSelector = '.outputTabView .pt-tab.visible[aria-selected="true"]';
  currentVisibleOutputSelector = '.pt-tab-panel.visible .outputEditor';
  outputLinesSelector = '.pt-tab-panel.visible > .outputEditor > .ReactCodeMirror > textarea';
  newOutputCursor = 0;
  codeMirrorSelector = this.outputPanelSelector + ' .CodeMirror';
  // Context Menu selectors
  menuSelector = '.outputContextMenu';
  jsonViewSelector = this.menuSelector + ' .showJsonView';
  jsonContentSelector = '';
  tableViewSelector = this.menuSelector + ' .showTableView';
  tableContentSelector = '';
  LINE_HEIGHT = 18; // CodeMirror Output lines are 18 px high
  LINE_OFFSET = 4;  // First 4px are padding to be skipped

  /** @type {WebDriverIoPromise} */
  get clearOutput() {
    return this._getOutputToolbarElement(this.clearOutputSelector);
  }

  /** @type {WebDriverIoPromise} */
  get showMore() {
    return this._getOutputToolbarElement(this.showMoreSelector);
  }

  /** @type {WebDriverIoPromise} */
  get saveOutput() {
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
  get explainOutput() { // eslint-disable-line
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
    return this.browser.getHTML(this.outputLinesSelector, false);
  }

  activeTabName() {
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
    const newOutput = await this.browser.getHTML(this.outputLinesSelector, false);
    return newOutput.substring(this.newOutputCursor);
  }

  /** @type {WebDriverIoPromise} */
  _getOutputToolbarElement(name) {
    return this.browser.element(`.outputToolbar ${name}`);
  }

  /*
   *
   */
  async _openContextMenu(lineNumber) {
    const xOffset = 15;
    const yOffset = this.LINE_OFFSET + (this.LINE_HEIGHT * lineNumber);
    return this
      .browser
      .waitForExist(`${this.codeMirrorSelector}-scroll`)
      .rightClick(`${this.codeMirrorSelector}-scroll`, xOffset, yOffset)
      .waitForExist(this.menuSelector);
  }

  async openJsonView(lineNumber) {
    await this._openContextMenu(lineNumber);
    return this
      .browser
      .waitForExist(`${this.jsonViewSelector}`)
      .click(`${this.jsonViewSelector}`);
  }

  async openTableView(lineNumber) {
    await this._openContextMenu(lineNumber);
    return this
      .browser
      .waitForExist(`${this.tableViewSelector}`)
      .click(`${this.tableViewSelector}`);
  }


}
