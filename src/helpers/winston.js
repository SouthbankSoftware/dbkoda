/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2018-03-06T16:47:58+11:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2018-03-06T17:12:59+11:00
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

const replacer = (key, value) => (value == null ? null : value);

const stringify = (value, space) => {
  const vType = typeof value;

  if (vType === 'undefined') {
    return 'undefined';
  } else if (vType === 'string') {
    return value;
  }

  if (value instanceof Error) {
    return value.stack;
  }

  return JSON.stringify(value, replacer, space);
};

export const commonFormatter = format(info => {
  const { timestamp, message, meta } = info;

  if (!timestamp) {
    info.timestamp = Date.now();
  }

  info.message = stringify(message, 2);

  if (meta != null) {
    info.meta = stringify(meta);
  }

  return info;
})();

export const printfFormatter = format.printf(info => {
  const { timestamp, level, message, meta } = info;

  return `${moment(timestamp).format()} - ${level}: ${message}${meta != null ? ` ${meta}` : ''}`;
});
