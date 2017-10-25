/**
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-12T20:41:38+11:00
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

import path from 'path';
import Page from './Page';

export default class AggregateBuilder extends Page {
  electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');

  // Palette //
  aggregatePaletteWrapperSelector = '.aggregatePaletteWrapper';
  palettRootNodeSelector = '.pt-tree-root';
  expandSelector = ' > .pt-tree-node-content > .pt-tree-node-caret';
  commonCategoryNodesSelector = '.pt-tree-root > li:nth-child(1)' +
    this.expandSelector;
  queryAndAggregateCategoryNodesSelector = '.pt-tree-root > li:nth-child(2)' +
    this.expandSelector;
  groupAndJoinCategoryNodesSelector = '.pt-tree-root > li:nth-child(3)' +
    this.expandSelector;
  transformCategoryNodesSelector = '.pt-tree-root > li:nth-child(4)' +
    this.expandSelector;
  otherCategoryNodesSelector = '.pt-tree-root > li:nth-child(5)' +
    this.expandSelector;
  allCategoryNodesSelector = '.pt-tree-root > li:nth-child(6)' +
    this.expandSelector;

  // Details //
  aggregateDetailsWrapperSelector = '.aggregateDetailsWrapper';

  // Graphical Builder //
  graphicalBuilderWrapper = '.graphicalBuilderBlockList';

  // Toolbars //
  showButtonSelector = '.aggregateGraphicalBuilderWrapper > .topButtons > .pt-popover-target > .showLeftPanelButton';
  hideButtonSelector = '.aggregateDetailsToolbar > .pt-align-right > .pt-popover-target > .hideLeftPanelButton';

  async addBlockFromPalette(blockName) {
    const blockSelector =
      '.aggregateBlock.' + blockName + '.selected_undefined > div > svg';
    await this.browser.waitForExist(blockSelector);
    await this.browser.element(blockSelector).click();
  }

  async openCategory(categoryName) {
    switch (categoryName) {
      case 'Common':
        await this.browser.element(this.commonCategoryNodesSelector).click();
        break;
      case 'QueryAndAggregate':
        await this.browser
          .element(this.queryAndAggregateCategoryNodesSelector)
          .click();
        break;
      case 'GroupAndJoin':
        await this.browser
          .element(this.groupAndJoinCategoryNodesSelector)
          .click();
        break;
      case 'Transform':
        await this.browser.element(this.transformCategoryNodesSelector).click();
        break;
      case 'Other':
        await this.browser.element(this.otherCategoryNodesSelector).click();
        break;
      case 'all':
        await this.browser.element(this.allCategoryNodesSelector).click();
        break;
      default:
        console.log('ERROR - Did not detect a valid Category Name');
    }
  }

  async aggregateBuilderIsOpen() {
    await this.browser.waitForExist(this.graphicalBuilderWrapper);
    await this.browser.waitForExist(this.aggregateDetailsWrapperSelector);
    await this.browser.waitForExist(this.aggregatePaletteWrapperSelector);
  }

  async isBlockSelected(blockIndex) {
    blockIndex += 1;
    await this.browser.waitForExist(
      '.graphicalBuilderBlockList > div:nth-child(' +
        blockIndex +
        ').selected_true',
    );
  }

  async selectBlock(blockIndex) {
    blockIndex += 1;
    const indexSelector =
      '.graphicalBuilderBlockList > div:nth-child(' + blockIndex + ')';
    await this.browser.waitForExist(indexSelector);
    await this.browser.element(indexSelector).click().pause(500);
  }

  async removeBlock(blockIndex) {
    blockIndex += 1;
    const indexSelector =
      '.graphicalBuilderBlockList > div:nth-child(' +
      blockIndex +
      ') > div > svg.closeBlockIcon';
    await this.browser.waitForExist(indexSelector);
    await this.browser.element(indexSelector).click().pause(500);
  }

  async openLeftPanel() {
    await this.browser.waitForExist(this.showButtonSelector);
    await this.browser.element(this.showButtonSelector).click().pause(500);
    await this.browser.waitForExist(this.hideButtonSelector);
  }

  async closeLeftPanel() {
    await this.browser.waitForExist(this.hideButtonSelector);
    await this.browser.element(this.hideButtonSelector).click().pause(500);
    await this.browser.waitForExist(this.showButtonSelector);
  }

  /** @type {WebDriverIoPromise} */
  get generateChartButton() {
    return this.browser.$('.aggregateGraphicalBuilderWrapper .GenerateChartButton');
  }
}
