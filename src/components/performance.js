/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-27T11:00:34+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-03-07T13:58:16+11:00
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

import { BrowserWindow } from 'electron';
import { ipcMain } from 'electron';
import _ from 'lodash';


const hashPerformanceWindows = {};

const getPerformanceWindow = (profileId) => {
  if (!hashPerformanceWindows[profileId]) {
    return null;
  }
  return hashPerformanceWindows[profileId];
};

const deletePerformanceWindow = (win, bDestroy = false) => {
  const profileId = _.findKey(hashPerformanceWindows, ['window', win]);
  console.log('profileId: ', profileId);
  if (profileId) {
    if (!bDestroy) {
      global.sendMsgToMainWindow('performance', {command: 'pw_windowClosed', profileId});
    }
    delete hashPerformanceWindows[profileId];
  }
};

const createPerformanceWindow = (options) => {
  const url =
    global.MODE === 'byo' || global.MODE === 'super_dev'
      ? 'http://localhost:3000/ui/performance.html'
      : `http://localhost:${global.uiPort}/ui/performance.html`;
  options = _.assign(
    {
      width: 1280,
      height: 900,
      backgroundColor: '#363951',
      show: false,
      title: 'dbKoda - Performance Panel'
    },
    options
  );
  const win = new BrowserWindow(options);

  win.loadURL(url);
  win.on('close', () => {
    console.log('windowID: ', win.id);
    deletePerformanceWindow(win);
  });
  win.on('closed', () => {
    win.destroy();
  });
  win.once('ready-to-show', () => {
    win.show();
  });

  return win;
};

global.sendMsgToMainWindow = (channel, args) => {
  const activeWindow = global.getMainWindow();
  if (activeWindow) {
    activeWindow.webContents.send(channel, args);
  }
};

global.sendMsgToPerformanceWindow = (id, channel, args) => {
  const activeWindow = getPerformanceWindow(id);
  if (activeWindow && activeWindow.window) {
    activeWindow.window.webContents.send(channel, args);
  }
};

global.checkPerformanceWindowInitialized = (profileId) => {
  // console.log('checkPerformanceWindowActive::profileId: ', profileId);
  const winState = getPerformanceWindow(profileId);
  if (winState && !winState.ready) {
    global.setPerformanceWindowProfileId(profileId);
  }
};

global.setPerformanceWindowProfileId = (profileId) => {
  // console.log('setPerformanceWindowProfileId::profileId: ', profileId);
  if (profileId) {
    global.sendMsgToPerformanceWindow(profileId, 'performance', {command: 'mw_setProfileId', profileId});
    setTimeout(global.checkPerformanceWindowInitialized, 1000, profileId);
  }
};

const handlePerformanceBrokerRequest = (event, args) => {
  // console.log('handlePerformanceRequest:: ', args.command, '::', args.profileId);
  if (args.profileId) {
    const winState = getPerformanceWindow(args.profileId);
    switch (args.command) {
      case 'mw_createWindow':
        if (!winState) {
          const window = createPerformanceWindow();
          const profileAlias = (args.profileAlias) ? 'dbKoda - ' + args.profileAlias : 'dbKoda - Performance Panel';
          console.log('profileAlias::', profileAlias);
          window.setTitle(profileAlias);
          hashPerformanceWindows[args.profileId] = { ready: false, window };
          global.setPerformanceWindowProfileId(args.profileId);
        }
        break;

      case 'mw_updateData':
      case 'mw_initData':
        global.sendMsgToPerformanceWindow(args.profileId, 'performance', args);
        break;

      case 'mw_closeWindow':
        if (winState && winState.window) {
          deletePerformanceWindow(winState.window, true);
          winState.window.destroy(); // we have to destroy the performance window here because we don't need close event if the close command came from main window.
        }
        break;
      case 'pw_windowReady':
        if (winState) {
          winState.ready = true;
          global.sendMsgToMainWindow('performance', args);
        }
        break;
      case 'pw_windowReload':
        if (winState) {
          winState.ready = false;
          global.sendMsgToMainWindow('performance', args);
          setTimeout(global.setPerformanceWindowProfileId, 1000, args.profileId);
        }
        break;
      default:
        console.error('command not supported::', args.command);
        break;
    }
  } else {
    console.error('ProfileID is required for every call!!!');
  }
};

const initPerformanceBroker = () => {
  ipcMain.on('performance', handlePerformanceBrokerRequest);
};

const destroyPerformanceBroker = () => {
  ipcMain.removeListener('performance', handlePerformanceBrokerRequest);
};

export default {
  initPerformanceBroker,
  destroyPerformanceBroker
};
