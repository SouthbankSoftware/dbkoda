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
  fs.copySync('./src/tests/helpers/profiles.yml', '/tmp/profiles.yml');
  // Clear existing config.yml just in case.
  fs.copySync('./src/tests/helpers/defaultConfigFile.yml', '/tmp/config.yml');
  fs.removeSync('.tmp/config.yml');
  fs.writeFileSync(
    '/tmp/config.yml',
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
