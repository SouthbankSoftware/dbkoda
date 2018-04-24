/**
 * @Author: Wahaj Shamim <wahaj>
 * @Date:   2017-08-22T13:59:42+10:00
 * @Email:  wahaj@southbanksoftware.com
 * @Last modified by:   wahaj
 * @Last modified time: 2017-08-22T15:32:11+10:00
 */

import Page from './Page';

export default class StorageDrillDown extends Page {
  getAllChildRows() {
    return this.browser.elements('.StorageSunburstView .list tbody tr').getText();
  }
  getRowDataName(idx) {
    if (idx == 0) {
      return this._getChartTableHeadRow(2);
    }
    return this._getChartTableBodyRow(idx, 2);
  }

  getRowDataSize(idx) {
    if (idx == 0) {
      return this._getChartTableHeadRow(3);
    }
    return this._getChartTableBodyRow(idx, 3);
  }
  _getChartTableHeadRow(idxData) {
    return this.browser
      .elements('.StorageSunburstView .list thead tr th:nth-child(' + idxData + ')')
      .getText();
  }

  _getChartTableBodyRow(idxRow, idxData) {
    return this.browser
      .elements(
        '.StorageSunburstView .list tbody tr:nth-child(' +
          idxRow +
          ') td:nth-child(' +
          idxData +
          ')'
      )
      .getText();
  }
}
