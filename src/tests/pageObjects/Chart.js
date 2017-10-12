/**
 * @Author: guiguan
 * @Date:   2017-10-12T20:44:13+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-10-12T22:27:39+11:00
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

export default class Chart extends Page {
  chartPanelSelector = '.ChartPanel';
  barChartSelector = '.BarChart';

  /** @type {WebDriverIoPromise} */
  get barChart() {
    return this.browser.$(`${this.chartPanelSelector} ${this.barChartSelector}`);
  }

  /** @type {WebDriverIoPromise} */
  get minXValue() {
    return this.browser
      .$(
        `${this
          .chartPanelSelector} .recharts-xAxis g.recharts-cartesian-axis-tick:first-child text`,
      )
      .getText();
  }

  /** @type {WebDriverIoPromise} */
  get maxXValue() {
    return this.browser
      .$(
        `${this.chartPanelSelector} .recharts-xAxis g.recharts-cartesian-axis-tick:last-child text`,
      )
      .getText();
  }

  /** @type {WebDriverIoPromise} */
  get minYValue() {
    return this.browser
      .$(
        `${this
          .chartPanelSelector} .recharts-yAxis g.recharts-cartesian-axis-tick:first-child text`,
      )
      .getText();
  }

  /** @type {WebDriverIoPromise} */
  get maxYValue() {
    return this.browser
      .$(
        `${this.chartPanelSelector} .recharts-yAxis g.recharts-cartesian-axis-tick:last-child text`,
      )
      .getText();
  }

  async isLegendExisting(text) {
    const legend = await this.browser
      .$(this.chartPanelSelector)
      .$$(`.recharts-legend-item-text=${text}`);
    return legend.length > 0;
  }

  clickContextMenu(label) {
    return this.browser
      .$('.pt-popover .pt-menu')
      .$(`.pt-menu-item=${label}`)
      .leftClick();
  }

  /* eslint-disable no-eval */
  /**
   * Get tree node element by label path
   *
   * @param {Array<string>} path - label path
   * @return {WebDriverIoPromise}
   */
  getDataTreeNodeByPath(path) {
    const _this = this; // eslint-disable-line no-unused-vars
    return this.browser.call(() =>
      _.reduce(
        path,
        async (accPromise, nodeName, idx, path) => {
          const currNodeEleStr = (await accPromise) + `.$('.pt-tree-node-content=${nodeName}')`;

          await this.browser.waitUntil(
            async () => {
              return (await eval(currNodeEleStr)).status === 0;
            },
            5000,
            `tree node ${_.take(path, idx + 1).join(' -> ')} still not exist after 5 sec`,
          );

          try {
            const needToExpandCaret =
              (await eval(currNodeEleStr)
                .scroll()
                .$('.pt-tree-node-caret.pt-tree-node-caret-closed')).status === 0;
            if (needToExpandCaret) {
              await eval(currNodeEleStr)
                .$('.pt-tree-node-caret.pt-tree-node-caret-closed')
                .leftClick();
            }
          } catch (_e) {} // eslint-disable-line no-empty

          return currNodeEleStr + (idx < path.length - 1 ? ".$('..')" : '');
        },
        Promise.resolve(`_this.browser.$('${this.chartPanelSelector}')`),
      ).then((eleStr) => {
        return eval(eleStr);
      }),
    );
  }
  /* eslint-enable */
}
