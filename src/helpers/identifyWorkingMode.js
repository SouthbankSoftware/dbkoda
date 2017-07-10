/**
 * @Author: guiguan
 * @Date:   2017-04-24T16:57:55+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-04-24T16:59:40+10:00
 */

import path from 'path';
import fs from 'fs';
import { app } from 'electron';

export default () => {
  if (process.env.MODE) {
    global.MODE = process.env.MODE;
  } else {
    const packageJson = JSON.parse(
      fs.readFileSync(path.resolve(app.getAppPath(), 'package.json'), {
        encoding: 'utf-8'
      })
    );
    global.MODE = packageJson.mode;
    process.env.MODE = global.MODE;
  }
};
