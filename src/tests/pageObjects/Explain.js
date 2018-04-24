/**
 * Created by joey on 24/5/17
 *
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-07-10T12:54:02+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-11-27T13:27:39+11:00
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

import _ from 'lodash';
import Page from './Page';

export default class Explain extends Page {
  explainStageProgress = '.explain-stage-progress';

  explainStage = '.explain-stage';

  explainStageWrapper = '.explain-stage-wrapper';

  explainStageTreeRoot = '.explain-stage-tree-root';

  explainStages = '.explain-stage-progress .explain-stage';

  explainTableRow = '.explain-stages-table  .stage-row';

  explainStatisticTable = '.explain-statistic-view';

  commandNamespace = '.explain-command-panel .namespace .value';

  shardStatisticsTable = '.explain-shards-statistic-view';

  shardStatisticsTableRow = '.explain-shards-statistic-view .row';

  suggestIndexButton = '.explain-view-suggest-index-button';

  addIndexButton = '.explain-view-copy-suggested-index-button';
  /**
   * get the stage number in the explain panel
   * @returns {Promise.<number>}
   */
  async getNumberOfStages() {
    const stages = await this.browser.elements(this.explainStages);
    return stages && stages.value ? stages.value.length : 0;
  }

  /**
   * get the row number of explain detail table
   * @returns {Promise.<number>}
   */
  async getExplainTableRowNumber() {
    const row = await this.browser.elements(this.explainTableRow);
    return row && row.value ? row.value.length : 0;
  }

  /**
   * get the stage detailed table data.
   * @returns an array include detail table content. Each element is a row of the table.
   */
  async getExplainDetailTableData(shard = false) {
    const row = await this.getExplainTableRowNumber();
    // const data = [];
    const data = await _.times(row, async i => {
      //eslint-disable-line
      let index = i + 2;
      if (shard) {
        index += 1;
      }
      const stage = {};
      stage.name = await this.browser.getText(
        this.explainTableRow + ':nth-child(' + index + ') .stage-cell:nth-child(2)'
      );
      stage.ms = await this.browser.getText(
        this.explainTableRow + ':nth-child(' + index + ') .stage-cell:nth-child(3) .text'
      );
      stage.examined = await this.browser.getText(
        this.explainTableRow + ':nth-child(' + index + ') .stage-cell:nth-child(4) .text'
      );
      stage.returned = await this.browser.getText(
        this.explainTableRow + ':nth-child(' + index + ') .stage-cell:nth-child(5) .text'
      );
      stage.comment = await this.browser.getText(
        this.explainTableRow + ':nth-child(' + index + ') .stage-cell:nth-child(6)'
      );
      return stage;
    });
    return Promise.all(data);
  }

  /**
   * get the explain statistic table data.
   * @returns an object include statistic table content.
   */
  async getStatisticTableData() {
    const data = {};
    data.docReturned = await this.browser.getText(
      this.explainStatisticTable + ' .row:nth-child(2) div:nth-child(2)'
    );
    data.keyExamined = await this.browser.getText(
      this.explainStatisticTable + ' .row:nth-child(3) div:nth-child(2)'
    );
    data.docExamined = await this.browser.getText(
      this.explainStatisticTable + ' .row:nth-child(4) div:nth-child(2)'
    );
    return data;
  }

  async getShardsStatisticTableData() {
    const elements = await this.browser.elements(this.shardStatisticsTableRow);
    const row = await elements.value.length;
    const data = await _.times(row, async i => {
      //eslint-disable-line
      const index = i + 2;
      const stage = {};
      stage.name = await this.browser.getText(
        this.shardStatisticsTableRow + ':nth-child(' + index + ') .cell:nth-child(1)'
      );
      stage.examined = await this.browser.getText(
        this.shardStatisticsTableRow + ':nth-child(' + index + ') .cell:nth-child(2)'
      );
      stage.returned = await this.browser.getText(
        this.shardStatisticsTableRow + ':nth-child(' + index + ') .cell:nth-child(3)'
      );
      stage.ms = await this.browser.getText(
        this.shardStatisticsTableRow + ':nth-child(' + index + ') .cell:nth-child(4)'
      );
      return stage;
    });
    return Promise.all(data);
  }

  /**
   * get the stage text by the given index
   */
  async getStageText(index) {
    index += 1;
    const stage = await this.browser.getText(
      `${this.explainStageProgress} ${this.explainStageWrapper}:nth-child(${index}) ${
        this.explainStage
      }`
    );
    return stage;
  }

  getCommandNamespace() {
    return this.browser.getText(this.commandNamespace);
  }

  clickSuggestIndex() {
    return this.browser.leftClick(this.suggestIndexButton);
  }

  clickAddIndex() {
    return this.browser.leftClick(this.addIndexButton);
  }

  closeExplainPanel() {
    return this.browser.leftClick('.clearOutputBtn');
  }
}
