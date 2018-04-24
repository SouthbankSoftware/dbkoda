/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-22T10:40:33+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-01-25T15:47:44+11:00
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
import Connection from '../pageObjects/Connection';
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
      r.ssh = {
        remoteHost: 'iota.southbanksoftware.com',
        remoteUser: 'core',
        remotePass: process.env.EC2_SHARD_CLUSTER_PASSWORD
      };
      r.connection = new Connection(r.browser);
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

  test('opens a ssh terminal', async () => {
    const alias = 'iota';

    await r.connection.connectProfileByHostname({
      alias,
      hostName: 'localhost',
      port: 27017,
      database: 'admin',
      ssh: true,
      sshTunnel: true,
      remoteHost: r.ssh.remoteHost,
      remoteUser: r.ssh.remoteUser,
      remotePass: r.ssh.remotePass,
      passRadio: true,
      authentication: false
    });
    await r.profileListContextMenu.openContextMenu(alias);
    await r.profileListContextMenu.newSshTerminal(r.ssh.remotePass);

    r.terminalId = await r.terminal.getCurrentTerminalId();
    await r.terminal.waitTerminalReady(r.terminalId);
  });

  test('can execute a command correctly', async () => {
    await r.terminal.executeInTerminal(r.terminalId, 'echo TEST\r');

    await waitUtil(
      async () => (await r.terminal.getTerminalLastNLines(r.terminalId, 2))[0] === 'TEST'
    );
  });
});
