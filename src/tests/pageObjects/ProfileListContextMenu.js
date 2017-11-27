/**
 * Connection profile context menu page object
 *
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-27T13:29:56+11:00
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
  removeProfileAlertSelector = '.remove-profile-alert-dialog';
  confirmRemoveButtonSelector = '.remove-profile-alert-dialog .dialogButtons .submitButton';

  /**
   * open connection panel
   */
  async openContextMenu(profileName) {
    return this.browser
      .waitForExist('div.bp-table-truncated-text=' + profileName)
      .rightClick('div.bp-table-truncated-text=' + profileName, 5, 5)
      .waitForExist(this.menuSelector);
  }

  async newEditor() {
    return this.browser
      .waitForExist(this.newWindowSelector)
      .leftClick(this.newWindowSelector, 1, 1);
  }

  async closeProfile() {
    return this.browser
      .waitForExist(this.closeConnectionSelector)
      .leftClick(this.closeConnectionSelector, 1, 1)
      .waitForExist(this.closeProfileAlertSelector)
      .leftClick(this.confirmCloseButtonSelector);
  }

  async openProfile(hasAuthorization) {
    if (hasAuthorization) {
      return this.browser
        .waitForExist(this.openConnectionSelector)
        .leftClick(this.openConnectionSelector, 1, 1)
        .waitForExist(this.openProfileAlertSelector)
        .leftClick(this.confirmOpenButtonSelector);
    }
    return this.browser
      .waitForExist(this.openConnectionSelector)
      .leftClick(this.openConnectionSelector, 1, 1);
  }

  async deleteProfile() {
    return this.browser
      .waitForExist(this.deleteProfileSelector)
      .leftClick(this.deleteProfileSelector, 1, 1)
      .waitForExist(this.removeProfileAlertSelector)
      .leftClick(this.confirmRemoveButtonSelector);
  }
}
