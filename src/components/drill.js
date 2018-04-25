/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-12-02T12:07:05+11:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2018-04-24T12:34:30+10:00
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

import fs from 'fs';
import wget from 'wget-improved';
import tar from 'tar';
import path from 'path';
import sh from 'shelljs';
import _ from 'lodash';

const sendStatusToRenderer = (channel, command, message) => {
  const activeWindow = global.getMainWindow();
  if (activeWindow) {
    activeWindow.webContents.send(channel, command, message);
  }
};
const downloadDrill = () => {
  return new Promise((resolve, reject) => {
    const drillVersion = 'drill-1.13.0';
    const drillPath = path.resolve(global.PATHS.home, 'drill');
    console.log(drillPath);
    const src = `http://apache.mirrors.hoobly.com/drill/${drillVersion}/apache-${drillVersion}.tar.gz`;
    const drillTarFile = path.resolve(drillPath, `apache-${drillVersion}.tar.gz`);
    const drillExtractedPath = path.resolve(drillPath, `apache-${drillVersion}`);
    const options = {};

    const drillPathExists = fs.existsSync(drillPath);
    const drillExtractedPathExists = fs.existsSync(drillExtractedPath);

    if (!drillPathExists || (drillPathExists && !drillExtractedPathExists)) {
      if (!drillPathExists) {
        sh.mkdir('-p', [drillPath]);
      }
      global.bEnableDrillDownload = false;
      const download = wget.download(src, drillTarFile, options);
      download.on('error', err => {
        console.log('WGET drill error:', err);
        sendStatusToRenderer('updateDrillStatus', 'ERROR', err + '');
        global.bEnableDrillDownload = true;
        reject(err);
      });
      download.on('start', fileSize => {
        console.log('WGET drill fileSize:', fileSize);
        sendStatusToRenderer('updateDrillStatus', 'START', 'drill');
      });
      download.on('end', message => {
        console.log('WGET drillTarFile:', message);
        tar
          .x({
            file: drillTarFile,
            cwd: drillPath
          })
          .then(() => {
            console.log('extraction complete');
            sh.rm(drillTarFile);

            global.bEnableDrillDownload = true;
            sendStatusToRenderer('updateDrillStatus', 'COMPLETE', 'drillCmd|' + drillExtractedPath);
            resolve(drillExtractedPath);
          });
      });
      const progressUpdateFunc = _.throttle(progress => {
        console.log('WGET drill progress:', progress);
        sendStatusToRenderer('updateDrillStatus', 'DOWNLOADING', progress);
      }, 2000);
      download.on('progress', progress => {
        progressUpdateFunc(progress);
        if (progress === 1) {
          progressUpdateFunc.flush();
        }
      });
    } else {
      sendStatusToRenderer('updateDrillStatus', 'COMPLETE', 'drillCmd|' + drillExtractedPath);
      resolve(drillExtractedPath);
    }
  });
};

const downloadDrillController = () => {
  return new Promise((resolve, reject) => {
    const drillPath = path.resolve(global.PATHS.home, 'drill');
    const src =
      'https://s3-ap-southeast-2.amazonaws.com/asiapac-sydney.release.dbkoda/dbkoda-java-controller-latest.jar';
    const drillJavaController = path.resolve(drillPath, 'dbkoda-java-controller-latest.jar');
    const drillPathExists = fs.existsSync(drillPath);
    const drillJavaControllerExists = fs.existsSync(drillJavaController);
    console.log(drillJavaController);

    if (!drillPathExists) {
      sh.mkdir('-p', [drillPath]);
    }
    if (!drillJavaControllerExists) {
      const options = {};

      global.bEnableDrillDownload = false;
      const download = wget.download(src, drillJavaController, options);

      download.on('error', err => {
        console.log('WGET drill controller error:', err);
        sendStatusToRenderer('updateDrillStatus', 'ERROR', err + '');
        global.bEnableDrillDownload = true;
        reject(err);
      });
      download.on('start', fileSize => {
        console.log('WGET drill controller fileSize:', fileSize);
        sendStatusToRenderer('updateDrillStatus', 'START', 'drillController');
      });
      download.on('end', message => {
        console.log('WGET drillJavaController:', message);
        sendStatusToRenderer(
          'updateDrillStatus',
          'COMPLETE',
          'drillControllerCmd|' + drillJavaController
        );
        global.bEnableDrillDownload = true;
        resolve(drillJavaController);
      });
      const ctrlProgressUpdateFunc = _.throttle(progress => {
        console.log('WGET drill controller progress:', progress);
        sendStatusToRenderer('updateDrillStatus', 'DOWNLOADING', progress);
      }, 1000);
      download.on('progress', progress => {
        ctrlProgressUpdateFunc(progress);
        if (progress === 1) {
          ctrlProgressUpdateFunc.flush();
        }
      });
    } else {
      sendStatusToRenderer(
        'updateDrillStatus',
        'COMPLETE',
        'drillControllerCmd|' + drillJavaController
      );
      resolve(drillJavaController);
    }
  });
};

export default {
  downloadDrillController,
  downloadDrill
};
