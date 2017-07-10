/**
 * @Author: chris
 * @Date:   2017-05-25T10:39:47+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-05-26T16:22:53+10:00
 */

import Page from './Page';

export default class EditorTabContextMenu extends Page {
  menuSelector = '.editorTabContentMenu';
  tabSelector = '.editorTab';
  closeTabSelector = this.menuSelector + ' .closeTabItem';
  closeOtherSelector = this.menuSelector + ' .closeOtherItem';
  closeAllSelector = this.menuSelector + ' .closeAllItem';
  closeLeftSelector = this.menuSelector + ' .closeLeftItem';
  closeRightSelector = this.menuSelector + ' .closeRightItem';

  async openContextMenu(tabName) {
    console.log(`${this.tabSelector}${tabName}`);
    return this
      .browser
      .waitForExist(`${this.tabSelector}${tabName}`)
      .rightClick(`${this.tabSelector}${tabName}`)
      .waitForExist(this.menuSelector);
  }

  async closeTab() {
    return this
      .browser
      .waitForExist(this.closeTabSelector)
      .leftClick(this.closeTabSelector);
  }

  async closeOtherTabs() {
    return this
      .browser
      .waitForExist(this.closeOtherSelector)
      .leftClick(this.closeOtherSelector);
  }

  async closeAllTabs() {
    return this
      .browser
      .waitForExist(this.closeTabSelector)
      .leftClick(this.closeTabSelector);
  }

  async closeLeftTabs() {
    return this
      .browser
      .waitForExist(this.closeLeftSelector)
      .leftClick(this.closeLeftSelector);
  }

  async closeRightTabs() {
    return this
      .browser
      .waitForExist(this.closeRightSelector)
      .leftClick(this.closeRightSelector);
  }
}
