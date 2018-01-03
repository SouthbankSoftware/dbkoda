/**
 * @Author: guiguan
 * @Date:   2017-05-16T14:20:34+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-16T14:30:51+10:00
 */

import fs from 'fs-extra';

export default () => {
  fs.copySync(
    './src/tests/helpers/defaultStateStore.json',
    '/tmp/stateStore.json'
  );
  fs.copySync(
    './src/tests/helpers/profiles.yml',
    '/tmp/profiles.yml'
  );
  fs.removeSync('/tmp/config.yml');
};
