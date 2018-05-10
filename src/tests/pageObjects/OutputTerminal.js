/**
 * @Author: chris
 * @Date:   2017-04-28T14:27:49+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-05-10T11:34:20+10:00
 */

import Page from './Page';

export default class OutputTerminal extends Page {
  terminalSelector = '.pt-tab-panel.visible[aria-hidden="false"] > .outputEditor > .outputTerminal ';
  commandLineSelector = this.terminalSelector + '.outputCmdLine';
  commandTextArea = this.terminalSelector + '.outputCmdLine > .CodeMirror .CodeMirror-line span'; // '.outputCmdLine > textarea';
  executeCmdSelector = this.terminalSelector + '.executeCmdBtn > div > a';
  sendToEditorItemSelector = '.pt-menu-item';

  /** @type {WebDriverIoPromise} */
  get commandLine() {
    return this.browser.element(this.commandLineSelector);
  }

  /** @type {WebDriverIoPromise} */
  get executeCmd() {
    return this.browser.element(this.executeCmdSelector);
  }

  /** @type {WebDriverIoPromise} */
  get text() {
    return this.browser.getText(this.commandTextArea);
  }

  /** @type {WebDriverIoPromise} */
  get menuItemSendToEditor() {
    return this.browser.element(this.sendToEditorItemSelector);
  }

  /** @type {WebDriverIoPromise} */
  async enterText(commandText) {
    await this.commandLine.leftClick();
    return this.browser.keys(commandText.split(''));
  }

  /** Enter text (if provided), then click the execute button
   * @param {String} commandText - The single line command to be run (optional)
   */
  async executeCommand(commandText) {
    if (commandText) {
      await this.enterText(commandText);
    }
    return this.executeCmd.leftClick();
  }

  /** Updates the terminal with a more recent command from history */
  nextCommand() {
    return this.commandLine.leftClick().then(() => {
      this.browser.keys('ArrowDown');
    });
  }

  /** Updates the terminal with a less recent command from history */
  previousCommand() {
    return this.commandLine.leftClick().then(() => {
      this.browser.keys('ArrowUp');
    });
  }

  /** Give the terminal the shortcut to send a command to the editor */
  async sendToEditor() {
    await this.commandLine.rightClick();
    return this.menuItemSendToEditor.leftClick();
  }
}
