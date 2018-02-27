/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2018-02-27T11:00:34+11:00
 * @Email:  inbox.wahaj@gmail.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-02-27T16:52:26+11:00
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
const sendMsgToMainWindow = (channel, command, message) => {
  const activeWindow = getMainWindow();
  if (activeWindow) {
    activeWindow.webContents.send(channel, command, message);
  }
};
const getPerformanceWindow = (profileId) => {
  if (!hashPerformanceWindows[profileId]) {
    return null;
  }
  return hashPerformanceWindows[profileId];
};
const sendMsgToPerformanceWindow = (id, channel, command, message) => {
  const activeWindow = getPerformanceWindow(id);
  if (activeWindow) {
    activeWindow.webContents.send(channel, command, message);
  }
};
const deletePerformanceWindow = (win) => {
  const profileId = _.findKey(hashPerformanceWindows, win);
  console.log('profileId: ', profileId);
  if (profileId) {
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

const handlePerformanceRequest = (event, args) => {
  console.log('handlePerformanceRequest: ', args);
  if (args.command === 'createPerformanceWindow' && args.profileId !== null) {
    if (!hashPerformanceWindows[args.profileId]) {
      const window = createPerformanceWindow();
      hashPerformanceWindows[args.profileId] = window;
    }
  } else if (args.command === 'sendMsgToPerformanceWindow' && args.profileId !== null) {
    sendMsgToPerformanceWindow(args.profileId, 'performance', 'dataObject', args.dataObject);
  }
};
const initPerformanceBroker = () => {
  ipcMain.on('performance', handlePerformanceRequest);
};
const destroyPerformanceBroker = () => {
  ipcMain.removeListener('performance', handlePerformanceRequest);
};
export default {
  initPerformanceBroker,
  destroyPerformanceBroker
};
