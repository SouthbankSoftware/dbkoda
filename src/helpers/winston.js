/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-03-06T16:47:58+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-02T12:22:45+10:00
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

import moment from 'moment';
import { format } from 'winston';
import util from 'util';
import _ from 'lodash';

export const levelConfig = {
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
    info: 'gray',
    debug: 'blue'
  }
};

export const commonFormatter = format(info => {
  const { timestamp, message } = info;
  const level = info[Symbol.for('level')];

  if (!timestamp) {
    info.timestamp = Date.now();
  }

  if (typeof message !== 'string') {
    if (level === 'error' && info.raygun !== false && message instanceof Error) {
      // shallow clone original error
      info.error = Object.create(
        Object.getPrototypeOf(message),
        Object.getOwnPropertyDescriptors(message)
      );
    }

    info.message = util.format(message);
  }

  // final check for `error`
  if (level === 'error' && info.raygun !== false && !info.error) {
    info.error = new Error(info.message);
  }

  return info;
})();

export const printfFormatter = format.printf(info => {
  const { timestamp, level, message } = info;

  return `${moment(timestamp).format()} - ${level}: ${message}`;
});

export const infoSymbol = Symbol.for('info');

export const bindDbKodaLoggingApi = logger => {
  const { levels } = logger;

  _.forEach(levels, (v, k) => {
    logger[k] = (...args) => {
      const results = [];
      let resultsWithErrors;
      const info = {};

      for (const arg of args) {
        const argType = typeof arg;
        let isIgnored = false;

        if (argType === 'object' && arg) {
          const c = arg[infoSymbol];

          if (c) {
            isIgnored = true;
            _.assign(info, c);
          }

          if (v === 0 && info.raygun !== false && arg instanceof Error) {
            isIgnored = true;

            if (!resultsWithErrors) {
              // lazy init
              resultsWithErrors = results.slice();
            }

            // shallow clone original error
            info.error = Object.create(
              Object.getPrototypeOf(arg),
              Object.getOwnPropertyDescriptors(arg)
            );

            results.push(arg);
            resultsWithErrors.push(arg.message);
          }
        }

        if (!isIgnored) {
          results.push(arg);
          resultsWithErrors && resultsWithErrors.push(arg);
        }
      }

      // stringify input args
      info.message = util.format(...results);

      if (info.error) {
        info.error.message = util.format(...resultsWithErrors);
      }

      logger.log(k, info);
    };
  });

  logger._error = (...args) => {
    logger.error(...args, { [infoSymbol]: { raygun: false } });
  };

  // finally, connect general error. Note that original `console.error` is already backed up as
  // `console._error`
  console.error = logger.error;
};
