/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-21T11:07:32+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-22T11:40:58+11:00
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

import waitUtil from '../helpers/waitUntil';
import Page from './Page';

const TERMINAL_ID_PREFIX = 'pt-tab-panel_outputPanelTabs_Terminal-';

export default class Terminal extends Page {
  outputPanelSelector = '.outputPanel .pt-tab-panel.visible[aria-hidden="false"]';
  contextMenuSelector = '.pt-overlay-open .pt-menu';

  async getCurrentTerminalId() {
    const tabId = await this.browser
      .waitForExist(this.outputPanelSelector)
      .getAttribute(this.outputPanelSelector, 'id');

    if (!tabId.startsWith(TERMINAL_ID_PREFIX)) {
      throw new Error('Current output tab is not a terminal');
    }

    return tabId.substring(TERMINAL_ID_PREFIX.length);
  }

  async openCurrentTerminalContextMenu() {
    return this.browser
      .waitForExist(this.outputPanelSelector)
      .rightClick(this.outputPanelSelector)
      .waitForExist(this.contextMenuSelector);
  }

  async clickCurrentTerminalContextMenuItem(itemName: string) {
    return this.browser
      .$(this.contextMenuSelector)
      .$(`li=${itemName}`)
      .leftClick();
  }

  async getTerminalLastNLines(id: string, n: number = 1) {
    /* eslint-disable */
    return (await this.browser.execute(
      (id, n) => {
        const { xterm } = store.terminals.get(id).reactComponent;
        const { buffer } = xterm;
        const result = [];

        for (let i = 0; i < n; i += 1) {
          result.push(
            buffer.translateBufferLineToString(buffer.ybase + buffer.y - n + 1 + i, true),
          );
        }

        return n === 1 ? result[0] : result;
      },
      id,
      n,
    )).value;
    /* eslint-enable */
  }

  async waitTerminalReady(id: string, timeout: number = 5000) {
    return waitUtil(
      async () => (await this.getTerminalLastNLines(id)).length > 0,
      timeout,
      `expects terminal to be ready within ${timeout} ms`,
    );
  }

  async executeInTerminal(id: string, command: string) {
    /* eslint-disable */
    await this.browser.execute(
      (id, command) => {
        const { reactComponent } = store.terminals.get(id);

        reactComponent.props.send(command);
      },
      id,
      command,
    );
    /* eslint-enable */
  }
}
