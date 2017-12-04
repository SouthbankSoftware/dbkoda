/**
 * @Author: Guan Gui <guiguan>
 * @Date:   2017-07-10T12:54:02+10:00
 * @Email:  root@guiguan.net
 * @Last modified by:   guiguan
 * @Last modified time: 2017-12-04T15:18:49+11:00
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

import _ from 'lodash';
import Tree from './Tree';

const debug = false;

class TreeAction extends Tree {
  /** @type {WebDriverIoPromise} */
  get executeButton() {
    return this.browser.$('.form-button-panel').$('button=Execute');
  }

  /** @type {WebDriverIoPromise} */
  get closeButton() {
    return this.browser.$('.form-button-panel').$('button=Close');
  }

  /** @type {WebDriverIoPromise} */
  get topLevelContextElement() {
    return this.browser.$$('.pt-top-level');
  }

  execute() {
    return this.executeButton.leftClick();
  }

  close() {
    return this.closeButton.leftClick();
  }

  clickContextMenu(label) {
    return this.browser
      .$('.pt-popover .pt-menu')
      .$(`.pt-menu-item=${label}`)
      .leftClick();
  }

  /** Boolean field */
  getBooleanField(label, contextElement = this.topLevelContextElement) {
    return contextElement.$(`input[type="checkbox"][label="${label}"]`);
  }

  async setValueForBooleanField(value, label, contextElement) {
    const oldValue = await this.getValueForBooleanField(label, contextElement);
    if (oldValue !== value) {
      await this.getBooleanField(label, contextElement).leftClick();
    }
  }

  getValueForBooleanField(label, contextElement) {
    return this.getBooleanField(label, contextElement).isSelected();
  }

  /** Text field */
  getTextField(label, contextElement = this.topLevelContextElement) {
    return contextElement.$(`input[label="${label}"]`);
  }

  setValueForTextField(value, label, contextElement) {
    return this.getTextField(label, contextElement).setValue(value);
  }

  getValueForTextField(label, contextElement) {
    return this.getTextField(label, contextElement).getValue();
  }

  /** Numeric field */
  getNumericField(label, contextElement = this.topLevelContextElement) {
    return contextElement.$(`input[type="Numeric"][label="${label}"]`);
  }

  setValueForNumericField(value, label, contextElement) {
    return this.getNumericField(label, contextElement).setValue(Number(value));
  }

  getValueForNumericField(label, contextElement) {
    return this.getNumericField(label, contextElement)
      .getValue()
      .then(value => Number(value));
  }

  /** Combo field */
  getComboField(label, contextElement = this.topLevelContextElement) {
    return contextElement.$(`div[label="${label}"]`);
  }

  setValueForComboField(value, label, contextElement) {
    return this.getComboField(label, contextElement)
      .$('input[role="combobox"]')
      .setValue(value)
      .keys('\uE007');
  }

  getValueForComboField(label, contextElement) {
    return this.getComboField(label, contextElement)
      .$('span.Select-value-label')
      .getText();
  }

  async getValueOptionsForComboField(label, contextElement) {
    await this.getComboField(label, contextElement)
      .$('span.Select-arrow-zone')
      .leftClick();
    const rawStr = await this.browser.$('.Select-menu-outer').getText();
    return rawStr.split('\n');
  }

  /** Select field */
  getSelectField(label, contextElement = this.topLevelContextElement) {
    return contextElement.$(`select[label="${label}"]`);
  }

  setValueForSelectField(value, label, contextElement) {
    return this.getSelectField(label, contextElement).selectByValue(value);
  }

  getValueForSelectField(label, contextElement) {
    return this.getSelectField(label, contextElement).getValue();
  }

  async getValueOptionsForSelectField(label, contextElement) {
    const rawStr = await this.getSelectField(label, contextElement).getText();
    return rawStr.split('\n');
  }

  /** Table field */
  getTableField(label) {
    return this.browser.$(`.tableFieldSet[label="${label}"]`);
  }

  getTableFieldAddButton(label) {
    return this.getTableField(label).$('.pt-icon-add');
  }

  getTableFieldTrashButton(label) {
    return this.getTableField(label).$('.pt-icon-trash');
  }

  getTableFieldNthRow(label, nth) {
    return this.getTableField(label).$(
      `.scrollableDiv > div:nth-child(${nth})`
    );
  }

  getTableFieldNthRowDeleteButton(label, nth) {
    return this.getTableFieldNthRow(label, nth).$('.pt-icon-delete');
  }

  deleteTableFieldNthRow(label, nth) {
    return this.getTableFieldNthRowDeleteButton(label, nth).leftClick();
  }

  /**
   * Fill in given action dialogue field
   *
   * @param {Object} field - ddd template field definition
   * @param {Object} templateInput - ddd template input JSON, could be partial only for target field
   * @param {WebDriverIoPromise} [contextElement=this.topLevelContextElement] - the context (container) to fill in this field
   * @return {Promise}
   */
  async fillInDialogueField(
    field,
    templateInput,
    contextElement = this.topLevelContextElement
  ) {
    if (field.readOnly) {
      // ignore read only field
      return;
    }

    if (!field.label) {
      // use name as label
      field.label = field.name;
    }

    if (field.type === 'Table') {
      if (_.has(templateInput, field.name)) {
        const tableLabel = field.label;

        await _.reduce(
          templateInput[field.name],
          async (acc, rowData, rowIdx, data) => {
            await acc;

            await _.reduce(
              field.columns,
              async (acc, field) => {
                await acc;

                await this.fillInDialogueField(
                  field,
                  rowData,
                  this.getTableFieldNthRow(tableLabel, rowIdx + 1)
                );
              },
              Promise.resolve()
            );

            if (rowIdx < data.length - 1) {
              // add another row for next loop
              await this.getTableFieldAddButton(tableLabel)
                .leftClick()
                .pause(200);
            }
          },
          Promise.resolve()
        );
      }
    } else if (
      _.includes(['Boolean', 'Text', 'Numeric', 'Select', 'Combo'], field.type)
    ) {
      if (_.has(templateInput, field.name)) {
        if (debug) {
          console.log(
            'Inputing field' + field.name + '=' + templateInput[field.name]
          );
        }
        await this[`setValueFor${field.type}Field`](
          templateInput[field.name],
          field.label,
          contextElement
        );
      }
    } else {
      throw new Error(`Unsupported tree action form field type ${field.type}`);
    }
  }

  /**
   * Fill in action dialogue
   *
   * @param {Object} template - ddd template
   * @param {Object} templateInput - ddd template input JSON
   * @return {Promise}
   */
  fillInDialogue(template, templateInput) {
    return _.reduce(
      template.Fields,
      async (acc, field) => {
        await acc; // chain promises up
        await this.fillInDialogueField(field, templateInput);
      },
      Promise.resolve()
    );
  }

  /* eslint-disable no-eval, class-methods-use-this */
  /**
    * Get tree node element by label path
    *
    * @param {Array<string>} path - label path
    * @return {WebDriverIoPromise}
    */
  getTreeNodeByPath(path) {
    const _this = this; // eslint-disable-line no-unused-vars
    if (debug) console.log('getTreeNodeByPath ', path);
    return this.browser.call(() =>
      _.reduce(
        path,
        async (accPromise, nodeName, idx, path) => {
          const currNodeEleStr =
            (await accPromise) + `.$('.pt-tree-node-content=${nodeName}')`;

          await this.browser.waitUntil(
            async () => {
              return (await eval(currNodeEleStr)).status === 0;
            },
            5000,
            `tree node ${_.take(path, idx + 1).join(
              ' -> '
            )} still not exist after 5 sec`
          );

          try {
            const needToExpandCaret =
              (await eval(currNodeEleStr)
                .$('.pt-tree-node-caret.pt-tree-node-caret-closed')).status ===
              0;
            if (needToExpandCaret) {
              await eval(currNodeEleStr)
                .$('.pt-tree-node-caret.pt-tree-node-caret-closed')
                .leftClick();
            }
          } catch (_e) {} // eslint-disable-line no-empty

          return currNodeEleStr + (idx < path.length - 1 ? ".$('..')" : '');
        },
        Promise.resolve('_this.browser')
      )
        .then((eleStr) => {
          return eval(eleStr);
        })
    );
  }
  /* eslint-enable */
}

export default TreeAction;
