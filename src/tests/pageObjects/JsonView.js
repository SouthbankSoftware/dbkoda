/**
 * @Author: chris
 * @Date:   2017-08-25T11:33:08+10:00
 * @Email:  chris@southbanksoftware.com
 * @Last modified by:   chris
 * @Last modified time: 2017-08-28T11:49:03+10:00
 */

import Page from './Page';

export default class JsonView extends Page {
  toolbarSelector = '.enhanced-json-panel .pt-navbar';
  jsonSelector = '.enhanced-json-panel .react-json-view';

  previousSelector = this.toolbarSelector + ' .previous-button';
  nextSelector = this.toolbarSelector + ' .next-button';
  expandButtonsSelector = this.toolbarSelector + ' .collapseGroup .pt-button';
  activeExpandButtonSelector = this.expandButtonsSelector + '.active';

  get previous() {
    return this.browser.element(this.previousSelector);
  }

  get next() {
    return this.browser.element(this.nextSelector);
  }

  get activeExpandButton() {
    return this.browser.elements(this.activeExpandButtonSelector);
  }

  getJsonViewText() {
    return this.browser.getText('.object-key-val');
  }

  async clickNext() {
    await this.browser.waitForExist(this.nextSelector);
    return this.next.click();
  }

  async clickPrevious() {
    await this.browser.waitForExist(this.previousSelector);
    return this.previous.click();
  }
}
