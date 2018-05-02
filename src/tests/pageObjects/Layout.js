/**
 * @Author: guiguan
 * @Date:   2017-04-20T10:56:38+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-04-20T21:23:48+10:00
 */

import Page from './Page';

/**
 * Layout page object
 */
class Layout extends Page {
  rootSplitPaneSelector = '.EditorSplitPane';

  /** @type {WebDriverIoPromise} */
  get rootSplitPane() {
    return this.browser.element(this.rootSplitPaneSelector);
  }

  /** @type {WebDriverIoPromise} */
  get rootSplitPaneResizer() {
    return this._getResizer(this.rootSplitPaneSelector);
  }

  leftSplitPaneSelector = '.LeftSplitPane';

  /** @type {WebDriverIoPromise} */
  get leftSplitPane() {
    return this.browser.element(this.leftSplitPaneSelector);
  }

  /** @type {WebDriverIoPromise} */
  get leftSplitPaneResizer() {
    return this._getResizer(this.leftSplitPaneSelector);
  }

  rightSplitPaneSelector = '.RightSplitPane';

  /** @type {WebDriverIoPromise} */
  get rightSplitPane() {
    return this.browser.element('.RightSplitPane');
  }

  /** @type {WebDriverIoPromise} */
  get rightSplitPaneResizer() {
    return this._getResizer(this.rightSplitPaneSelector);
  }

  /**
   * @param {string} splitPaneSelector
   * @return {WebDriverIoPromise}
   */
  _getResizer(splitPaneSelector) {
    return this.browser.element(`${splitPaneSelector} > .Resizer`);
  }

  /**
   * Drag and move given split panel resizer
   *
   * @param {WebDriverIoPromise} resizer - split panel resizer to drag and move
   * @param {number} xOffset - x axis offset
   * @param {number} yOffset - y axis offset
   */
  static async dragAndMoveResizer(resizer, xOffset, yOffset) {
    await resizer
      .moveToObject()
      .buttonDown()
      .moveTo(null, xOffset, yOffset)
      .buttonUp();
  }
}

export default Layout;
