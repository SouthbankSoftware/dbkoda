/**
 * @Author: guiguan
 * @Date:   2017-10-12T20:10:14+11:00
 * @Last modified by:   guiguan
 * @Last modified time: 2018-05-23T09:57:10+10:00
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

import { config, getApp } from '#/helpers';
import { getRandomPort, killMongoInstance, launchSingleInstance } from 'test-utils';
import TreeAction from '#/pageObjects/TreeAction';
import Connection from '#/pageObjects/Connection';
import AggregateBuilder from '#/pageObjects/AggregateBuilder';
import Chart from '#/pageObjects/Chart';
import Editor from '#/pageObjects/Editor';
import Output from '#/pageObjects/Output';

import { mongoPortOutput } from '../tree/actions/uiDefinitions/inputAndTest/common';

const debug = false;

describe('ChartPanel', () => {
  /** Global (to current test suite) setup */
  config();

  /** Global (to current test suite) vars */
  const r = {};
  const cleanupWorkflows = [];

  const cleanup = async () => {
    // cleanup in reverse order
    await _.reduceRight(
      cleanupWorkflows,
      async (acc, wf) => {
        await acc;
        try {
          await wf();
        } catch (e) {
          console.error(e.stack);
        }
      },
      Promise.resolve()
    );
  };

  beforeAll(async () => {
    try {
      const app = await getApp();

      r.app = app;
      r.browser = app.client;
      r.treeAction = new TreeAction(r.browser);
      r.connection = new Connection(r.browser);
      r.aggregateBuilder = new AggregateBuilder(r.browser);
      r.chart = new Chart(r.browser);
      r.output = new Output(r.browser);
      r.editor = new Editor(r.browser);
      r.debug = async () => {
        console.log('\n\nWebdriverIO debugging REPL...');
        await r.browser.debug();
      };
      global.debug = r.debug;

      cleanupWorkflows.push(async () => {
        if (app && app.isRunning()) {
          await app.stop();
        }
      });
    } catch (error) {
      test.error = error;
    }
  });

  afterAll(async () => {
    await cleanup();
  });

  test('Create testing database', async () => {
    r.mongoDbPort = getRandomPort();
    launchSingleInstance(r.mongoDbPort);
    if (debug) {
      console.log('DB start');
    }
    cleanupWorkflows.push(async () => {
      killMongoInstance(r.mongoDbPort);
    });
    // initialize the test db just in case ....
    const output = await mongoPortOutput(
      r.mongoDbPort,
      'use test\nfor (var i=0;i<500;i+=1) { db.companies.insertOne({name:"company"+(i+1),type:"type"+((i%10)+1),num_of_employees:i*200+100}); };\n'
    );
    if (debug) console.log(output);
  });

  test('Create a connection', async () => {
    const { browser, connection, mongoDbPort: port, treeAction } = r;

    await connection.connectProfileByHostname({
      alias: 'Test',
      hostName: 'localhost',
      port,
      database: 'admin'
    });
    expect(await browser.waitForExist(treeAction.treeNodeSelector)).toBeTruthy;
  });

  test('Open aggregate builder and click generate chart', async () => {
    await r.treeAction
      .getTreeNodeByPath(['Databases', 'test', 'companies'])
      .rightClick()
      .pause(500);

    await r.treeAction.clickContextMenu('Aggregate Builder').pause(500);
    await r.aggregateBuilder.generateChartButton.click().pause(500);
  });

  test('Unload all components and load X, Y and Center components', async () => {
    await r.chart
      .getDataTreeNodeByPath(['_id'])
      .rightClick()
      .pause(500);

    await r.chart.clickContextMenu('Unload all').pause(200);

    await r.chart
      .getDataTreeNodeByPath(['name'])
      .rightClick()
      .pause(500);

    await r.chart.clickContextMenu('Load to X axis').pause(200);

    await r.chart
      .getDataTreeNodeByPath(['num_of_employees'])
      .rightClick()
      .pause(500);

    await r.chart.clickContextMenu('Load to Y axis').pause(200);

    await r.chart
      .getDataTreeNodeByPath(['type'])
      .rightClick()
      .pause(500);

    await r.chart.clickContextMenu('Load to center').pause(200);

    expect(await r.chart.isLegendExisting('`other')).toBeTruthy();
    expect(await r.chart.minYValue).toEqual('0');
    expect(await r.chart.maxYValue).toEqual('20000000');
    expect(await r.chart.minXValue).toEqual('company446');
    expect(await r.chart.maxXValue).toEqual('`other');
  });

  test('Hide `other in X axis and center', async () => {
    await r.chart.barChart.rightClick().pause(500);

    await r.chart.clickContextMenu('Hide `other in X axis').pause(200);

    await r.chart.barChart.rightClick().pause(500);

    await r.chart.clickContextMenu('Hide `other in center').pause(200);

    expect(await r.chart.isLegendExisting('`other')).toBeFalsy();
    expect(await r.chart.minYValue).toEqual('0');
    expect(await r.chart.maxYValue).toEqual('100000');
    expect(await r.chart.minXValue).toEqual('company443');
    expect(await r.chart.maxXValue).toEqual('company500');
  });
});
