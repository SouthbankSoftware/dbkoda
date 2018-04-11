/**
 * @Author: guiguan
 * @Date:   2017-05-16T14:20:34+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-05-16T14:30:51+10:00
 */

import fs from 'fs-extra';
import path from 'path';

export default () => {
  console.log('initStateStore()');
  const basePath = '/tmp/dbkoda/';
  console.log('State Store: ', path.resolve(basePath, 'stateStore.json'));
  console.log('Profiles: ', path.resolve(basePath, 'profiles.yml'));
  console.log('Config: ', path.resolve(basePath, 'config.yml'));
  fs.copySync(
    './src/tests/helpers/defaultStateStore.json',
    path.resolve(basePath, 'stateStore.json')
  );
  fs.copySync('./src/tests/helpers/profiles.yml', path.resolve(basePath, 'profiles.yml'));
  // Clear existing config.yml just in case.
  fs.copySync('./src/tests/helpers/defaultConfigFile.yml', path.resolve(basePath, 'config.yml'));
  fs.removeSync('.tmp/config.yml');
  fs.writeFileSync(
    path.resolve(basePath, 'config.yml'),
    'mongoCmd: /usr/local/bin/mongo\n' +
      'mongoVersionCmd: /usr/local/bin/mongo --version\n' +
      'mongodumpCmd: /usr/local/bin/mongodump\n' +
      'mongorestoreCmd: /usr/local/bin/mongorestore\n' +
      'mongoimportCmd: /usr/local/bin/mongoimport\n' +
      'mongoexportCmd: /usr/local/bin/mongoexport\n' +
      'drillCmd: ' +
      process.env.DRILL_PATH +
      '\n' +
      'drillControllerCmd: ' +
      process.env.DRILL_CONTROLLER_PATH +
      '\n' +
      'showWelcomePageAtStart: true\n' +
      'telemetryEnabled: true\n' +
      'sshCounterInterval: 2\n' +
      'sshCounterCmd: vmstat'
  );
};
