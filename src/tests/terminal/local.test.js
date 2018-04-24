/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-20T09:30:17+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-22T11:43:30+11:00
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
import { config, getApp } from '#/helpers';
import ProfileListContextMenu from '../pageObjects/ProfileListContextMenu';
import Terminal from '../pageObjects/Terminal';
import waitUtil from '../helpers/waitUntil';

describe('Terminal', () => {
  /** Global (to current test suite) setup */
  config();

  /** Global (to current test suite) vars */
  const r = {};
  const cleanupWorkflows = [];

  const cleanup = async () => {
    // cleanup in reverse order
    await _.reduceRight(
      cleanupWorkflows,
      async (acc, wf) => {
        await acc;
        try {
          await wf();
        } catch (e) {
          console.error(e.stack);
        }
      },
      Promise.resolve()
    );
  };

  beforeAll(async () => {
    try {
      const app = await getApp();

      r.app = app;
      r.browser = app.client;
      r.profileListContextMenu = new ProfileListContextMenu(r.browser);
      r.terminal = new Terminal(r.browser);
      r.debug = async () => {
        console.log('\n\nWebdriverIO debugging REPL...');
        await r.browser.debug();
      };
      global.debug = r.debug;

      cleanupWorkflows.push(async () => {
        if (app && app.isRunning()) {
          await app.stop();
        }
      });
    } catch (error) {
      test.error = error;
    }
  });

  afterAll(async () => {
    await cleanup();
  });

  test('opens a local terminal', async () => {
    await r.profileListContextMenu.openContextMenu();
    await r.profileListContextMenu.newLocalTerminal();

    r.terminalId = await r.terminal.getCurrentTerminalId();
    await r.terminal.waitTerminalReady(r.terminalId, 8000);
  });

  test('can execute a command correctly', async () => {
    await r.terminal.executeInTerminal(r.terminalId, 'echo TEST\r');

    await waitUtil(
      async () => (await r.terminal.getTerminalLastNLines(r.terminalId, 2))[0] === 'TEST'
    );
  });
});
