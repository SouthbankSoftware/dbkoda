/**
 * Connection profile context menu page object
 *
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-22T11:12:32+11:00
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
  openConnectionSelector = `${this.menuSelector}.openProfile`;
  closeConnectionSelector = `${this.menuSelector}.closeProfile`;
  newWindowSelector = `${this.menuSelector}.newWindow`;
  deleteProfileSelector = `${this.menuSelector}.deleteProfile`;
  editorListingSelector = `${this.menuSelector}.editorListing`;
  newSshTerminalSelector = `${this.menuSelector}.newSshTerminal`;
  newSshTerminalDialogSelector = '.open-profile-alert-dialog';
  newSshTerminalDialogInputSelector = `${this.newSshTerminalDialogSelector} input.remotePassInput`;
  newSshTerminalDialogOpenButtonSelector = `${
    this.newSshTerminalDialogSelector
  } .pt-button.openButton`;
  newLocalTerminalSelector = `${this.menuSelector}.newLocalTerminal`;
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
  async openContextMenu(profileName?: string) {
    if (profileName) {
      return this.browser
        .waitForExist('div.pt-table-truncated-text=' + profileName)
        .rightClick('div.pt-table-truncated-text=' + profileName, 5, 5)
        .waitForExist(this.menuSelector);
    }
    return this.browser
      .waitForExist('.profileList')
      .rightClick('.profileList')
      .waitForExist('.profilePanelContextMenu');
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
      .waitForExist(this.confirmCloseButtonSelector)
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

  async newSshTerminal(password?: string) {
    await this.browser
      .waitForExist(this.newSshTerminalSelector)
      .leftClick(this.newSshTerminalSelector, 1, 1);

    if (password) {
      await this.browser
        .waitForExist(this.newSshTerminalDialogSelector)
        .setValue(this.newSshTerminalDialogInputSelector, password)
        .leftClick(this.newSshTerminalDialogOpenButtonSelector);
    }
  }

  async newLocalTerminal() {
    return this.browser
      .waitForExist(this.newLocalTerminalSelector)
      .leftClick(this.newLocalTerminalSelector, 1, 1);
  }
}
