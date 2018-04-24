/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-12-22T09:31:02+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-22T10:21:15+11:00
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

export default (condition, timeout = 5000, timeoutMsg = 'waitUntil timed out', interval = 500) => {
  let totalTimeoutId;
  let intervalTimeoutId;

  const clearTimeouts = () => {
    clearTimeout(totalTimeoutId);
    clearTimeout(intervalTimeoutId);
  };

  return Promise.race([
    new Promise((resolve, reject) => {
      totalTimeoutId = setTimeout(() => {
        clearTimeouts();
        reject(new Error(timeoutMsg));
      }, timeout);
    }),
    new Promise((resolve, reject) => {
      const checkCondition = () => {
        Promise.resolve(condition())
          .then(result => {
            if (result) {
              clearTimeouts();
              return resolve();
            }
            intervalTimeoutId = setTimeout(checkCondition, interval);
          })
          .catch(err => {
            clearTimeouts();
            reject(err);
          });
      };

      checkCondition();
    })
  ]);
};
