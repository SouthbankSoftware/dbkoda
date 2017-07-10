/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-03-03T10:05:42+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   guiguan
 * @Last modified time: 2017-06-24T01:25:14+10:00
 */

import _ from 'lodash';
import path from 'path';
import sh from 'shelljs';
import childProcess from 'child_process';
import { app, BrowserWindow, Menu } from 'electron';
import moment from 'moment';
import winston from 'winston';
import { ipcMain } from 'electron';
import { identifyWorkingMode, invokeApi } from './helpers';
import touchbar from './touchbar';

process.env.NODE_CONFIG_DIR = path.resolve(__dirname, '../config/');
const config = require('config');

identifyWorkingMode();

if (global.MODE !== 'prod') {
  // in non-production mode, enable source map for stack tracing
  require('source-map-support/register');
  process.env.NODE_ENV = 'development';
} else {
  process.env.NODE_ENV = 'production';
}

let modeDescription;
if (global.MODE == 'byo') {
  modeDescription = 'Bring Your Own (BYO) Dev';
} else if (global.MODE == 'dev') {
  modeDescription = 'Dev';
} else if (global.MODE == 'super_dev') {
  modeDescription = 'Super Dev';
} else {
  modeDescription = 'Production';
}

global.UAT = process.env.UAT === 'true';

global.NAME = app.getName();
global.PATHS = (() => {
  const userHome = app.getPath('home');
  const home = path.resolve(userHome, `.${global.NAME}`);
  const userData = app.getPath('userData');

  return {
    home,
    userData,
    userHome,
    logs: path.resolve(userData, 'logs'),
    stateStore: global.UAT
      ? '/tmp/stateStore.json'
      : path.resolve(home, 'stateStore.json')
  };
})();

// TODO create an uninstaller
// ensure paths exist
sh.mkdir('-p', _.values(_.omit(global.PATHS, ['stateStore'])));

const configWinstonLogger = () => {
  const commonOptions = {
    colorize: 'all',
    timestamp() {
      return moment().format();
    }
  };

  const transports = [new winston.transports.Console(commonOptions)];

  if (global.MODE === 'prod' && !global.UAT) {
    require('winston-daily-rotate-file');
    transports.push(
      new winston.transports.DailyRotateFile(
        _.assign({}, commonOptions, {
          filename: path.resolve(global.PATHS.logs, 'app.log'),
          datePattern: 'yyyy-MM-dd.',
          localTime: true,
          prepend: true,
          json: false
        })
      )
    );
  }

  global.l = new winston.Logger({
    level: config.get('loggerLevel'),
    // level: 'debug',
    padLevels: true,
    levels: {
      error: 0,
      warn: 1,
      notice: 2,
      info: 3,
      debug: 4
    },
    colors: {
      error: 'red',
      warn: 'yellow',
      notice: 'green',
      info: 'black',
      debug: 'blue'
    },
    transports
  });

  process.on('unhandledRejection', (reason) => {
    l.error(reason);
  });

  process.on('uncaughtException', (err) => {
    l.error(err.stack);
  });
};
configWinstonLogger();

l.notice(`Starting up with ${modeDescription} mode...`);

// Launch dbKoda Controller
let controllerProcess;
const configController = () => {
  const controllerPath = require.resolve(
    '@southbanksoftware/dbkoda-controller'
  );

  // NOTE: cwd option is not supported in asar, please avoid using it
  controllerProcess = childProcess.fork(controllerPath, [], {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      LOG_PATH: path.resolve(global.PATHS.logs, 'controller.log'),
      MONGO_SCRIPTS_PATH: path.resolve(
        app.getAppPath(),
        '../app.asar.unpacked/node_modules/@southbanksoftware/dbkoda-controller/lib/'
      ),
      UAT: global.UAT
    }
  });
};
if (global.MODE !== 'byo') {
  configController();
}

const openFileInEditor = () => {
  const activeWindow = BrowserWindow.getFocusedWindow();
  if (activeWindow) {
    activeWindow.webContents.send('command', 'openFile');
  }
};

const saveFileInEditor = () => {
  const activeWindow = BrowserWindow.getFocusedWindow();
  if (activeWindow) {
    activeWindow.webContents.send('command', 'saveFile');
  }
};

// Create main window with React UI
const createWindow = (url, options) => {
  options = _.assign(
    {
      width: 1280,
      height: 900,
      backgroundColor: '#363951'
    },
    options
  );
  const win = new BrowserWindow(options);

  win.loadURL(url);

  win.on('closed', () => {
    win.destroy();
  });

  return win;
};

const createMainWindow = () => {
  const url = global.MODE === 'byo' || global.MODE === 'super_dev'
    ? 'http://localhost:3000/ui/'
    : 'http://localhost:3030/ui/';

  if (global.UAT) {
    invokeApi(
      { url },
      {
        shouldRetryOnError(e) {
          return _.includes(
            ['ECONNREFUSED', 'ECONNRESET', 'ESOCKETTIMEDOUT'],
            e.error.code || _.includes([404, 502], e.statusCode)
          );
        },
        errorHandler(err) {
          l.error(err.stack);
          throw err;
        }
      }
    ).then(() => {
      createWindow(url);
    });
    return;
  }

  // show a splash screen
  const splashWindow = createWindow(
    `file://${path.resolve(__dirname, '../assets/splash/index.html')}`
  );

  // wait for uiUrl to become reachable and then show real main window
  // const uiPath = require.resolve('@southbanksoftware/dbkoda-ui');
  invokeApi(
    {
      url
    },
    {
      shouldRetryOnError(e) {
        return (
          !splashWindow.isDestroyed() &&
          (_.includes(
            ['ECONNREFUSED', 'ECONNRESET', 'ESOCKETTIMEDOUT'],
            e.error.code
          ) ||
            _.includes([404, 502], e.statusCode))
        );
      },
      errorHandler(err) {
        if (splashWindow.isDestroyed()) {
          return;
        }
        l.error(err.stack);
        throw err;
      }
    }
  ).then(() => {
    if (splashWindow.isDestroyed()) {
      return;
    }
    const mainWindow = createWindow(url, {
      show: false
    });
    ipcMain.once('appReady', () => {
      if (splashWindow.isDestroyed()) {
        mainWindow.destroy();
        return;
      }
      if (splashWindow.isFullScreen()) {
        splashWindow.hide();
        mainWindow.setFullScreen(true);
      } else {
        mainWindow.setBounds(splashWindow.getBounds());
        if (splashWindow.isMinimized()) {
          mainWindow.minimize();
        } else {
          mainWindow.show();
        }
      }
      splashWindow.destroy();
      mainWindow.setTouchBar(touchbar);
    });
  });
};

// Set app menu
const setAppMenu = () => {
  const menus = [
    {
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services', submenu: [] },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click() {
            createMainWindow();
          }
        },
        {
          label: 'Open File',
          accelerator: 'CmdOrCtrl+O',
          click() {
            openFileInEditor();
          }
        },
        {
          label: 'Save File',
          accelerator: 'CmdOrCtrl+S',
          click() {
            saveFileInEditor();
          }
        },
        { role: 'close' }
      ]
    },
    {
      role: 'editMenu'
    },
    {
      label: 'View',
      submenu: [
        { role: 'togglefullscreen' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' }
      ]
    },
    {
      label: 'Development',
      submenu: [
        {
          label: 'Reload UI',
          accelerator: 'CmdOrCtrl+R',
          role: 'forcereload'
        },
        {
          label: 'Reload Controller',
          accelerator: 'Shift+CmdOrCtrl+R',
          click: () => {
            controllerProcess && controllerProcess.kill();
            configController();
          },
          enabled: global.MODE !== 'byo'
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'Alt+CmdOrCtrl+I',
          role: 'toggledevtools'
        }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ]
    },
    {
      label: 'Help',
      role: 'help',
      submenu: []
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

app.on('ready', () => {
  setAppMenu();
  createMainWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('will-quit', () => {
  l.notice('Shutting down...');
  controllerProcess && controllerProcess.kill();
});
