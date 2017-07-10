/**
 * connection profile context menu page object
 */

import Page from './Page';

export default class ProfileListContextMenu extends Page {

  // Context Menu Selectors
  menuSelector = '.profileListContextMenu';
  openConnectionSelector = '.profileListContextMenu.openProfile';
  closeConnectionSelector = '.profileListContextMenu.closeProfile';
  newWindowSelector = '.profileListContextMenu.newWindow';
  deleteProfileSelector = '.profileListContextMenu.deleteProfile';
  editorListingSelector = '.profileListContextMenu.editorListing';
  openProfileAlertSelector = '.close-profile-alert-dialog';
  confirmOpenButtonSelector = '.close-profile-alert-dialog .pt-alert-footer :nth-child(1)';
  cancelOpenButtonSelector = '.close-profile-alert-dialog .pt-alert-footer :nth-child(2)';
  closeProfileAlertSelector = '.close-profile-alert-dialog';
  confirmCloseButtonSelector = '.close-profile-alert-dialog .dialogButtons .submitButton';
  cancelCloseButtonSelector = '.close-profile-alert-dialog .dialogButtons .cancelButton';
  removeProfileAlertSelector = '.remove-profile-alert-dialog'
  confirmRemoveButtonSelector = '.remove-profile-alert-dialog .dialogButtons .submitButton';

  /**
   * open connection panel
   */
  async openContextMenu(profileName) {
    return this
      .browser
      .waitForExist('div.bp-table-truncated-text=' + profileName)
      .rightClick('div.bp-table-truncated-text=' + profileName, 5, 5)
      .waitForExist(this.menuSelector);
  }

  async newEditor() {
    return this
      .browser
      .waitForExist(this.newWindowSelector)
      .leftClick(this.newWindowSelector, 1, 1);
  }

  async closeProfile() {
    return this
      .browser
      .waitForExist(this.closeConnectionSelector)
      .leftClick(this.closeConnectionSelector, 1, 1)
      .waitForExist(this.closeProfileAlertSelector)
      .leftClick(this.confirmCloseButtonSelector);
  }

  async openProfile(hasAuthorization) {
    if (hasAuthorization) {
      return this
        .browser
        .waitForExist(this.openConnectionSelector)
        .leftClick(this.openConnectionSelector, 1, 1)
        .waitForExist(this.openProfileAlertSelector)
        .leftClick(this.confirmOpenButtonSelector);
    }
    return this
      .browser
      .waitForExist(this.openConnectionSelector)
      .leftClick(this.openConnectionSelector, 1, 1);
  }

  async deleteProfile() {
    return this
      .browser
      .waitForExist(this.deleteProfileSelector)
      .leftClick(this.deleteProfileSelector, 1, 1)
      .waitForExist(this.removeProfileAlertSelector)
      .leftClick(this.confirmRemoveButtonSelector);
  }
}
