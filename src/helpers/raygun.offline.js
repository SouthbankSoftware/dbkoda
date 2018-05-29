/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-05-18T09:55:29+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-29T18:02:02+10:00
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

  function _deleteError(item) {
    fs.unlink(path.join(storage.cachePath, item), err => {
      if (err) {
        l._error('RaygunOfflineCacheProvider: error removing old cache error', err);
      }
    });
  }

  function _sendAndDelete(item, cb) {
    fs.readFile(path.join(storage.cachePath, item), 'utf8', (err, cacheContents) => {
      if (err) {
        l._error('RaygunOfflineCacheProvider: error reading cache error', err);
        return;
      }

      try {
        const errorOptions = JSON.parse(cacheContents);

        errorOptions.callback = (err, _res) => {
          if (err) {
            // cannot report the error to raygun yet
            return cb && cb(err);
          }

          _deleteError(item);
          cb && cb();
        };

        raygunTransport.send(errorOptions);
      } catch (e) {
        l._error('RaygunOfflineCacheProvider:', e);
        _deleteError(item);
      }
    });
  }

  storage.init = function(offlineStorageOptions) {
    if (!offlineStorageOptions && !offlineStorageOptions.cachePath) {
      throw new Error(
        'RaygunOfflineCacheProvider: cache path must be set before Raygun can cache offline'
      );
    }

    storage.cachePath = offlineStorageOptions.cachePath;
    storage.cacheLimit = offlineStorageOptions.cacheLimit || 100;

    if (!fs.existsSync(storage.cachePath)) {
      fs.mkdirSync(storage.cachePath);
    }

    return storage;
  };

  storage.save = function(transportItem, callback) {
    const writeFilename = path.join(storage.cachePath, Date.now() + '.json');
    delete transportItem.callback;

    if (!callback) {
      callback = function() {};
    }

    storage.retrieve((err, files) => {
      if (err) {
        l._error('RaygunOfflineCacheProvider: error reading cache folder', err);
        return callback(err);
      }

      if (files.length >= storage.cacheLimit) {
        // remove old errors
        const removeNum = Math.min(files.length, files.length - storage.cacheLimit + 1);

        for (let i = 0; i < removeNum; i += 1) {
          _deleteError(files[i]);
        }
      }

      fs.writeFile(writeFilename, JSON.stringify(transportItem), 'utf8', err => {
        if (err) {
          l._error('RaygunOfflineCacheProvider: error writing to cache folder', err);
          return callback(err);
        }

        callback(null);
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
        l._error('RaygunOfflineCacheProvider: error reading cache folder', err);
        return callback(err);
      }

      if (items.length <= 0) {
        return callback(null, items);
      }

      // try first file and continue the rest if it succeeds
      _sendAndDelete(items[0], err => {
        if (!err) {
          for (let i = 1; i < items.length; i += 1) {
            _sendAndDelete(items[i]);
          }

          callback(null, items);
        } else {
          callback(err, items);
        }
      });
    });
  };
};

exports = module.exports = OfflineStorage;
