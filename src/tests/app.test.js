/**
 * @Author: guiguan
 * @Date:   2017-04-13T09:32:40+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-06-13T16:49:20+10:00
 */
import { config, getApp } from './helpers';

/**
 * Master test case used to test basic functionality of an
 * Electron app. It should also provide a screenshot which will be archived when all tests have
 * passed. Those screenshots are precious history of how this app evolves
 */
describe('dbKoda app', () => {
  // always config test suite
  config();

  // define all variables that are shared among test cases in current test suite
  let app;

  // each test suite in Jest is run independently, and therefore a new dbKoda instance will need to
  // be created before all test cases
  beforeAll(() => {
    return getApp().then((res) => {
      app = res;
    });
  });

  // remember to cleanup everything used
  afterAll(() => {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  // es7 async/await is preferred over chai and chai-as-promised
  test('launches into main window', async () => {
    expect(await app.client.getWindowCount()).toBe(1);
  });
});
