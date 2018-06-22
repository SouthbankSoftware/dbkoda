/**
 * connection profile page object
 */

import Page from './Page';
import { DELAY_TIMEOUT } from '../helpers/config';

export default class ProfileList extends Page {
  /**
   * define selectors
   */

  profileListSelector = '.profileListPanel';

  get newProfileButtonSelector() {
    return this.profileListSelector + ' .newProfileButton';
  }

  connectionProfilesSelector = '.connection-profile-cell';

  selectedProfileClassName = 'connection-profile-cell-selected';

  closeProfileAlertDialogSelector = '.close-profile-alert-dialog';

  removeProfileAlertDialogSelector = '.remove-profile-alert-dialog';

  confirmCloseButtonSelector = '.close-profile-alert-dialog .dialogButtons .submitButton';

  cancelCloseButtonSelector = '.close-profile-alert-dialog .dialogButtons .cancelButton';

  confirmRemoveButtonSelector = this.removeProfileAlertDialogSelector +
  ' .dialogButtons .submitButton';

  /**
   * open connection panel
   */
  openConnectionProfile() {
    return this.browser
      .waitForExist('.optInAlert', DELAY_TIMEOUT, true)
      .waitForExist(this.newProfileButtonSelector)
      .leftClick(this.newProfileButtonSelector)
      .waitForExist(this.newProfileButtonSelector, DELAY_TIMEOUT, true);
  }

  /**
   * remove connection profile
   */
  removeConnectionProfile() {
    return this.browser
      .leftClick(this.removeProfileButtonSelector)
      .waitForExist(this.removeProfileAlertDialogSelector)
      .leftClick(this.confirmRemoveButtonSelector)
      .waitForExist(this.removeProfileAlertDialogSelector, DELAY_TIMEOUT, true);
  }

  /**
   * remove the connection profile
   * @param index the index of the profile
   */
  closeConnectionProfile() {
    return this.browser
      .leftClick(this.closeProfileButtonSelector)
      .waitForExist(this.closeProfileAlertDialogSelector)
      .leftClick(this.confirmCloseButtonSelector)
      .waitForExist(this.closeProfileAlertDialogSelector, DELAY_TIMEOUT, true);
  }

  /**
   * edit the connection profile
   * @param index the index of the profile
   */
  editSelectedConnectionProfile() {
    return this.browser
      .leftClick(this.editProfileButtonSelector)
      .waitForExist(this.newProfileButtonSelector, DELAY_TIMEOUT, true);
  }

  /**
   * check all dom element exists on this panel
   */
  exist() {
    return this.browser.waitForExist(this.newProfileButtonSelector);
  }

  /**
   * get connection profile list element. Return a list of WebElement JSON objects for the located elements.
   */
  getConnectionProfileList() {
    return this.browser.elements(this.connectionProfilesSelector);
  }

  /**
   * click on the profile
   * @param index the index of the profile on the list, start from 0
   */
  clickProfile(index) {
    return this.browser.click(this._getConnectProfileSelector(index)).waitUntil(() => {
      return this.getProfileClassName(index).then(className => {
        return className.indexOf(this.selectedProfileClassName) >= 0;
      });
    });
  }

  /**
   * get the profile class name
   * @param index the index of the profile on the list, start from 0
   */
  getProfileClassName(index) {
    return this.browser.getAttribute(this._getConnectProfileSelector(index), 'className');
  }

  _getConnectProfileSelector(index) {
    return this.connectionProfilesSelector + ':nth-child(' + (index + 1) + ')';
  }
}
