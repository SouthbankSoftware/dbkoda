/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-18T09:55:29+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-18T11:09:12+10:00
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
 *
 * raygun
 * https://github.com/MindscapeHQ/raygun4node
 *
 * Copyright (c) 2015 MindscapeHQ
 */

const fs = require('fs');
const path = require('path');
const raygunTransport = require('raygun/lib/raygun.transport');

const OfflineStorage = function() {
  const storage = this;

  function _sendAndDelete(item) {
    fs.readFile(path.join(storage.cachePath, item), 'utf8', (err, cacheContents) => {
      try {
        raygunTransport.send(JSON.parse(cacheContents));
      } catch (e) {
        l._error(e);
      } finally {
        fs.unlink(path.join(storage.cachePath, item), err => {
          if (err) l._error(err);
        });
      }
    });
  }

  storage.init = function(offlineStorageOptions) {
    if (!offlineStorageOptions && !offlineStorageOptions.cachePath) {
      throw new Error('Cache Path must be set before Raygun can cache offline');
    }

    storage.cachePath = offlineStorageOptions.cachePath;
    storage.cacheLimit = offlineStorageOptions.cacheLimit || 100;

    if (!fs.existsSync(storage.cachePath)) {
      fs.mkdirSync(storage.cachePath);
    }

    return storage;
  };

  storage.save = function(transportItem, callback) {
    const filename = path.join(storage.cachePath, Date.now() + '.json');
    delete transportItem.callback;

    if (!callback) {
      callback = function() {};
    }

    fs.readdir(storage.cachePath, (err, files) => {
      if (err) {
        console.log('[Raygun] Error reading cache folder');
        console.log(err);
        return callback(err);
      }

      if (files.length > storage.cacheLimit) {
        console.log('[Raygun] Error cache reached limit');
        return callback(null);
      }

      fs.writeFile(filename, JSON.stringify(transportItem), 'utf8', err => {
        if (!err) {
          return callback(null);
        }

        console.log('[Raygun] Error writing to cache folder');
        console.log(err);

        return callback(err);
      });
    });
  };

  storage.retrieve = function(callback) {
    fs.readdir(storage.cachePath, callback);
  };

  storage.send = function(callback) {
    if (!callback) {
      callback = function() {};
    }

    storage.retrieve((err, items) => {
      if (err) {
        console.log('[Raygun] Error reading cache folder');
        console.log(err);
        return callback(err);
      }

      for (let i = 0; i < items.length; i += 1) {
        _sendAndDelete(items[i]);
      }

      callback(err, items);
    });
  };
};

exports = module.exports = OfflineStorage;
