/**
 * Created by joey on 12/10/17.
 * @Last modified by:   guiguan
 * @Last modified time: 2018-01-30T14:01:49+11:00
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

import assert from 'assert';
import uuidV1 from 'uuid/v1';
import {generateMongoData, getRandomPort, killMongoInstance, launchSingleInstance} from 'test-utils';

import Translator from '../pageObjects/Translator';
import Editor from '../pageObjects/Editor';
import {config, getApp} from '../helpers';
import ConnectionProfile from '../pageObjects/Connection';


describe('test translator', () => {
  // always config test suite
  config({setupFailFastTest: false});

  let app;
  let browser;
  let mongoPort;
  let editor;
  let translator;
  let connectProfile;

  const cleanup = async () => {
    killMongoInstance(mongoPort);
    if (app && app.isRunning()) {
      return app.stop();
    }
  };

  beforeAll(async (done) => {
    mongoPort = getRandomPort();
    launchSingleInstance(mongoPort);
    generateMongoData(mongoPort, 'test', 'users', 500);
    process.on('SIGINT', cleanup);
    return getApp().then(async (res) => {
      app = res;
      browser = app.client;
      connectProfile = new ConnectionProfile(browser);
      translator = new Translator(browser);
      editor = new Editor(browser);
      const alias = 'connection:' + uuidV1();
      await connectProfile.connectProfileByURL({
        alias,
        url: 'mongodb://localhost:' + mongoPort,
        database: 'test'
      });
      done();
    });
  });


  afterAll(() => {
    return cleanup();
  });

  it('test translate mongo shell script', async () => {
    try {
      await editor._appendToEditor('use test\n');
      await editor._appendToEditor('db.users.find()\n');
      await translator.translate();
      await translator.execution();
      await translator.close();
    } catch (err) {
      console.error(err);
      assert.fail(true, false, err);
    }
  });
});
