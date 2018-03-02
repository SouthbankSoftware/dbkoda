/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-27T11:00:34+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-03-02T11:56:40+11:00
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

const getMainWindow = () => {
  if (global.mainWindowId) {
    return BrowserWindow.fromId(global.mainWindowId);
  }
  return null;
};

const sendMsgToMainWindow = (channel, args) => {
  const activeWindow = getMainWindow();
  if (activeWindow) {
    activeWindow.webContents.send(channel, args);
  }
};

const getPerformanceWindow = (profileId) => {
  if (!hashPerformanceWindows[profileId]) {
    return null;
  }
  return hashPerformanceWindows[profileId];
};

const sendMsgToPerformanceWindow = (id, channel, args) => {
  const activeWindow = getPerformanceWindow(id);
  if (activeWindow && activeWindow.window) {
    activeWindow.window.webContents.send(channel, args);
  }
};

const deletePerformanceWindow = (win) => {
  const profileId = _.findKey(hashPerformanceWindows, ['window', win]);
  console.log('profileId: ', profileId);
  if (profileId) {
    sendMsgToMainWindow('performance', {command: 'pw_windowClosed', profileId});
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
      show: false
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

const checkPerformanceWindowInitialized = (win) => {
  const profileId = _.findKey(hashPerformanceWindows, ['window', win]);
  console.log('checkPerformanceWindowActive::profileId: ', profileId);
  if (profileId) {
    sendMsgToPerformanceWindow(profileId, 'performance', {command: 'mw_setProfileId', profileId});
  }
};

const handlePerformanceBrokerRequest = (event, args) => {
  console.log('handlePerformanceRequest:: ', args.command, '::', args.profileId);
  if (args.profileId) {
    if (args.command === 'mw_createWindow') {
      if (!hashPerformanceWindows[args.profileId]) {
        const window = createPerformanceWindow();
        hashPerformanceWindows[args.profileId] = { ready: false, window };
        setTimeout(checkPerformanceWindowInitialized, 1000, window); // TODO: Check for status ready and call this function again
      }
    } else if (args.command === 'mw_updateData' || args.command === 'mw_initData') {
      sendMsgToPerformanceWindow(args.profileId, 'performance', args);
    } else if (args.command === 'mw_closeWindow') {
      const win = getPerformanceWindow(args.profileId);
      win.window.close();
    } else if (args.command === 'pw_windowReady') { // performance window is ready to accept data
      const win = getPerformanceWindow(args.profileId);
      win.ready = true;
      sendMsgToMainWindow('performance', args);
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
