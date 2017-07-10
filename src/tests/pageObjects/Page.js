/**
 * @Author: guiguan
 * @Date:   2017-04-20T10:56:15+10:00
 * @Last modified by:   guiguan
 * @Last modified time: 2017-04-20T21:24:03+10:00
 */

/**
 * @external {WebDriverIoPromise} http://webdriver.io/guide/usage/transferpromises.html
 */

/**
 * Base page object
 */
class Page {
  constructor(browser) {
    this.browser = browser;
  }
}

export default Page;
