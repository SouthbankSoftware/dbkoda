/*
 *  Full Screen Navigation Page Object
 */
import Page from './Page';

export default class SideNav extends Page {
  componentSelector = '.mainContainer .sideNav';
  menuItemSelector = `${this.componentSelector} .menuItem`;

  clickMenuItem(menuName) {
    return this.browser.leftClick(`${this.menuItemSelector}${menuName}`);
  }
}
