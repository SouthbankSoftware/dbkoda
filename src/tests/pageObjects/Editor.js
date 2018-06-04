import path from 'path';
import os from 'os';
import fs from 'fs-extra';
import Page from './Page';

/* eslint class-methods-use-this: 0 */
export default class Editor extends Page {
  electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
  // Toolbar
  executeLineButtonSelector = '.executeLineButton';
  executeAllButtonSelector = '.executeAllButton';
  explainPlanButtonSelector = '.explainPlanButton';
  queryPlannerButtonSelector = '.queryPlannerButton';
  allPlansExecutionButtonSelector = '.allPlansExecutionButton';
  executionStatsButtonSelector = '.executionStatsButton';
  stopExecutionButtonSelector = '.stopExecutionButton';
  addEditorButtonSelector = '.addEditorButton';
  openFileButtonSelector = '.openFileButton';
  saveFileButtonSelector = '.saveFileButton';
  editorContextDropdownSelector = '.editorContextDropdown';

  // Panel
  editorPanelSelector = '.editorTabView';
  welcomeTabSelector = '#pt-tab-title_EditorTabs_Default';

  get editorContextDropdown() {
    return this.getEditorElement(this.editorContextDropdownSelector);
  }
  get executeLineButton() {
    return this.getEditorElement(this.executeLineButtonSelector);
  }
  get executeAllButton() {
    return this.getEditorElement(this.executeAllButtonSelector);
  }
  get explainPlanButton() {
    return this.getEditorElement(this.explainPlanButtonSelector);
  }
  get queryPlannerButton() {
    return this.getEditorElement(this.queryPlannerButtonSelector);
  }
  get executionStatsButton() {
    return this.getEditorElement(this.executionStatsButtonSelector);
  }
  get allPlansExecutionButton() {
    return this.getEditorElement(this.allPlansExecutionButtonSelector);
  }
  get stopExecutionButton() {
    return this.getEditorElement(this.stopExecutionButtonSelector);
  }
  get addEditorButton() {
    return this.getEditorElement(this.addEditorButtonSelector);
  }
  get openFileButton() {
    return this.getEditorElement(this.openFileButtonSelector);
  }
  get saveFileButton() {
    return this.getEditorElement(this.saveFileButtonSelector);
  }
  get editorPanel() {
    return this.getEditorElement(this.editorPanelSelector);
  }
  get welcomeTab() {
    return this.getEditorElement(this.welcomeTabSelector);
  }
  _getTab(tabValue) {
    return this.getEditorElement('.editorTab .' + tabValue);
  }

  async _editorElementsExist() {
    await this.browser.waitForExist(this.editorContextDropdownSelector);
    await this.browser.waitForExist(this.executeLineButtonSelector);
    await this.browser.waitForExist(this.executeAllButtonSelector);
    await this.browser.waitForExist(this.explainPlanButtonSelector);
    await this.browser.waitForExist(this.stopExecutionButtonSelector);

    await this.browser.waitForExist(this.addEditorButtonSelector);
    await this.browser.waitForExist(this.openFileButtonSelector);
    await this.browser.waitForExist(this.saveFileButtonSelector);
    await this.browser.waitForExist(this.editorPanelSelector);
    await this.browser.waitForExist(this.welcomeTabSelector);
  }

  async _selectConnectionContext(value) {
    await this.browser.selectByVisibleText(this.editorContextDropdownSelector, value);
  }
  async _getConnectionContextText() {
    const result = await this.browser
      .element(this.editorContextDropdownSelector)
      .getText('option:checked');
    return result;
  }
  async _getConnectionContextValue() {
    const result = await this.browser.element(this.editorContextDropdownSelector).getValue();
    return result;
  }
  async _clickExecuteLine() {
    await this.executeLineButton.click();
  }
  async _clickExecuteAll() {
    await this.executeAllButton.click();
  }
  async _clickExplainPlan() {
    await this.explainPlanButton.click();
  }
  async _clickExplainQueryPlanner() {
    await this._clickExplainPlan();
    await this.browser.pause(100);
    await this.browser.waitForExist(this.queryPlannerButtonSelector);
    await this.browser.pause(100);
    await this.queryPlannerButton.click();
  }
  async clickExplainExecutionStats() {
    await this._clickExplainPlan();
    await this.browser.pause(100);
    await this.browser.waitForExist(this.executionStatsButtonSelector);
    await this.browser.pause(100);
    await this.executionStatsButton.click();
  }
  async clickExplainAllPlansExecution() {
    await this._clickExplainPlan();
    await this.browser.pause(100);
    await this.browser.waitForExist(this.allPlansExecutionButtonSelector);
    await this.browser.pause(100);
    await this.allPlansExecutionButton.click();
  }
  async _clickStopExecution() {
    await this.stopExecutionButton.click();
  }
  async _clickAddNewEditor() {
    await this.addEditorButton.click();
    await this.browser.waitForEnabled(this.addEditorButtonSelector);
  }
  async _loadFile(filePath) {
    // eslint-disable-line
    filePath = path.join(__dirname, filePath);
    await fs.readFile(filePath, 'utf-8', async (err, data) => {
      console.log(data);
      return data;
    });
  }
  async _saveFileButton() {
    await this.saveFileButton.click();
  }
  async _appendToEditor(value) {
    await this.browser.element('.pt-tab-panel.editorTab.visible[aria-hidden="false"]').click();
    await this.browser.keys(value.split('')).keys(['NULL']);
  }

  async _getEditorContentsAsArray() {
    let res = await this.browser.getText(
      '.pt-tab-panel.editorTab.visible[aria-hidden="false"] .CodeMirror-code'
    );
    res = res.split(/\r?\n/);
    let tmp = []; //eslint-disable-line
    for (let i = 1; i < res.length; i += 1) {
      if (res[i].match(/^[0-9]+$/g)) {
        // Probably a number?
      } else {
        tmp.push(res[i]);
      }
    }
    return tmp;
  }

  async _getEditorContentsAsString() {
    let res = await this.browser.getText(
      '.pt-tab-panel.editorTab.visible[aria-hidden="false"] .CodeMirror-code'
    );
    res = res.split(/\r?\n/);
    let tmp = []; //eslint-disable-line
    for (let i = 1; i < res.length; i += 1) {
      if (res[i].match(/^[0-9]+$/g)) {
        // Probably a number?
      } else {
        tmp.push(res[i]);
      }
    }
    return tmp.join('\n');
  }

  async _clickEditorTab(editorName) {
    await this.browser.element('.editorTab.' + editorName).click();
  }
  async _clearEditor() {
    await this.browser.element('.pt-tab-panel.editorTab.visible[aria-hidden="false"]').click();

    if (os.platform() !== 'darwin') {
      await this.browser.keys(['Control', 'a']).keys('NULL');
    } else {
      await this.browser.keys(['Command', 'a']).keys('NULL');
    }

    await this.browser.pause(500);

    await this.browser.keys(['Back space']).keys('NULL');

    await this.browser.element('.pt-tab-panel.editorTab.visible[aria-hidden="false"]').click();

    await this.browser.pause(500);
  }
  getEditorElement(name) {
    return this.browser.element(name);
  }

  /**
   * move cursor to specified text
   * @param text
   */
  async moveToText(text) {
    await this.browser.click("//span[text()='" + text + "']");
  }

  /**
   * get total line number on this editor
   * @returns {Promise.<void>}
   */
  async getLineNumber() {
    return this.browser.elements('.editorView .CodeMirror-code > div[style="position: relative;"]')
      .elements.value.length;
  }

  /**
   * move cursor to the line by index
   * @param index
   * @returns {Promise.<void>}
   */
  async moveToLine(index) {
    index += 1;
    this.browser.click(
      '.editorView .CodeMirror-code > div[style="position: relative;"]:nth-child(' + index + ')'
    );
  }
}
