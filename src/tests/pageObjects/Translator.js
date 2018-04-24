/*
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
/**
 * Created by joey on 11/10/17.
 */

import Page from './Page';

export default class Translator extends Page {
  editorCodeMirrorSelector = '.editorView .ReactCodeMirror';

  translatorCodeMirrorSelector = '.translate-codemirror .ReactCodeMirror';

  translatorMenuItemSelector = '.menuItemWrapper.translator';

  translateAllMenuItemSelector = '.menuItemWrapper.translate-to-native-driver';

  clostBtnSelector = '.translate-codemirror .close-btn';

  async translate() {
    await this.browser.rightClick(this.editorCodeMirrorSelector);
    await this.browser.waitForExist(this.translatorMenuItemSelector);
    await this.browser.click(this.translatorMenuItemSelector);
    await this.browser.waitForExist(this.translatorCodeMirrorSelector);
  }

  async execution() {
    await this.browser.waitForExist(this.translatorCodeMirrorSelector);
    await this.browser.rightClick(this.translatorCodeMirrorSelector);
    await this.browser.rightClick(this.translatorCodeMirrorSelector);
    await this.browser.waitForExist(this.translateAllMenuItemSelector);
    await this.browser.click(this.translateAllMenuItemSelector);
  }

  async close() {
    await this.browser.waitForExist(this.clostBtnSelector);
    await this.browser.click(this.clostBtnSelector);
    await this.browser.waitForExist(this.translatorCodeMirrorSelector, 5000, true);
  }
}
