/**
 * @Author: guiguan
 * @Date:   2017-04-19T16:47:12+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-06-23T21:20:45+10:00
 */

import Layout from '../pageObjects/Layout';
import { config, getApp } from '../helpers';

describe.skip('Layout', () => {
  // always config test suite
  config();

  let app;
  let browser;
  let layout;

  beforeAll(() => {
    return getApp().then(res => {
      app = res;
      browser = app.client;
      layout = new Layout(browser);
    });
  });

  afterAll(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  test('allows user to resize root split panel by dragging its vertical resizer', async () => {
    const resizeOffset = 100;
    const getWidth = async () => {
      return (await layout.leftSplitPane.getCssProperty('width')).parsed.value;
    };

    const lastWidth = await getWidth();
    await Layout.dragAndMoveResizer(layout.rootSplitPaneResizer, resizeOffset, 0);
    const newWidth = await getWidth();

    expect(Math.round(newWidth - lastWidth)).toBe(resizeOffset);
  });

  test('allows user to resize left split panel by dragging its horizontal resizer', async () => {
    const resizeOffset = 100;
    const getHeight = async () => {
      return (await browser
        .element(`${layout.leftSplitPaneSelector} > .Pane1`)
        .getCssProperty('height')).parsed.value;
    };

    const lastHeight = await getHeight();
    await Layout.dragAndMoveResizer(layout.leftSplitPaneResizer, 0, resizeOffset);
    const newHeight = await getHeight();

    expect(Math.round(newHeight - lastHeight)).toBe(resizeOffset);
  });

  test('allows user to resize right split panel by dragging its horizontal resizer', async () => {
    const resizeOffset = 100;
    const getHeight = async () => {
      return (await browser
        .element(`${layout.rightSplitPaneSelector} > .Pane1`)
        .getCssProperty('height')).parsed.value;
    };

    const lastHeight = await getHeight();
    await Layout.dragAndMoveResizer(layout.rightSplitPaneResizer, 0, resizeOffset);
    const newHeight = await getHeight();

    expect(Math.round(newHeight - lastHeight)).toBe(resizeOffset);
  });
});
