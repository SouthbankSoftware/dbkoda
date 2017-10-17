# dbKoda
*State of the art MongoDB IDE*

[![Build Status](https://drone.southbanksoftware.com/api/badges/SouthbankSoftware/dbkoda/status.svg)](https://drone.southbanksoftware.com/SouthbankSoftware/dbkoda)

This repository defines dbKoda's building, user acceptance testing (UAT), launching and packaging workflows.

## Requirement

* Yarn 0.21.3+
* To install and use this repository you will need to clone [dbkoda-ui](https://github.com/Southbanksoftware/dbkoda-ui) and [dbkoda-controller](https://github.com/Southbanksoftware/dbkoda-controller)

## Setup

1. Make sure `dbkoda-ui`, `dbkoda-controller` and `dbkoda` are sibling folders to each other within a same parent folder, e.g:
```text
root_folder
├── dbkoda-ui
├── dbkoda-controller
├── dbkoda
```
2. **[Important]** In `dbkoda`, run the following command `yarn dev:link`. This is only needed for the first setup. If you are installing on windows, use `yarn dev:link:win`.
3. Run `yarn install` within all 3 repos.
4. To build a new the app, `yarn run pack`. For Windows, use `yarn pack:win`.
5. To build a version of the app, run `yarn run dist:dev` (without compression) and `yarn run dist` (with normal compression). For Windows, use the command `yarn dist:win`.
6. *[optional]* After you have tried above commands, your `dbkoda-controller`’s native modules will be built against `electron`‘s node version. If you want to go back to 'byo' mode, you need to run `yarn dev:rebuild:current` to rebuild these native modules against your current `node` version.
7. *[optional]* If you encounter errors or irregularities during any of these steps, you can run `rm -rf node_modules` within each of the repositories, and then run `yarn install` again. If you are still having troubles, please check our FAQs or raise a new topic at our [support site](https://dbkoda.useresponse.com)

## Config
You can config dbKoda by putting a `config.yml` in your dbKoda home folder as follows:

```yaml
# Note: please use full path for all commands

# Local mongo binary path. dbKoda will detect your mongo binary upon first launch in your login
# shell
mongoCmd: /usr/local/bin/mongo

```

### dbKoda Home Folder
Mac & Linux: `~/.dbKoda/`
Windows: `c:\Users\<username>\.dbKoda\`

## Development
In development mode dbKoda has four running modes: byo, super_dev, dev and prod

### Bring Your Own (BYO) Dev Mode (byo)
You can separately launch your own copy of `dbkoda-ui` or `dbkoda-controller` to be used by `dbkoda` in this mode. You should `unlink` `dbkoda-ui` and `dbkoda-controller` from `dbkoda` in this mode to avoid unwanted interference.

Start BYO mode using the commands `yarn run byo` or `yarn byo`.

### Super Dev Mode (super_dev)
Hot-reloading of `dbkoda-ui` is enabled in this mode. When app launches, Webpack needs some time to package the UI for the first time, so the launching speed is much slower than other modes.

`yarn run super` or `yarn super`

### Dev Mode (dev)

`yarn run dev` or `yarn dev`

### [Devtron](https://github.com/electron/devtron#-devtron)
Devtron is an Electron DevTools extension to help you inspect, monitor, and debug your app, to install Devtron, follow the steps below.

1. `yarn add -D devtron`
2. Run `require('devtron').install()` in Chrome DevTools. In either [BYO](#bring-your-own-byo-dev-mode) or [Super Dev](#super-dev-mode) mode, you should run this in DevTools of splash screen window. You can kill `dbkoda-ui`, and create a new window (<kbd>cmd+n</kbd>) in electron, so a new splash
screen window will keep shown. This step is only needed for first time installation.

### [React DevTools](https://github.com/firejune/electron-react-devtools)
React component tree inspector extension for Chrome DevTools

1. `yarn add -D electron-react-devtools`
2. Run `require('electron-react-devtools').install()` in Chrome DevTools. In either [BYO](#bring-your-own-byo-dev-mode) or [Super Dev](#super-dev-mode) mode, you should run this in DevTools of splash screen window. You can kill `dbkoda-ui`, and create a new window (<kbd>cmd+n</kbd>) in electron, so a new splash
screen window will keep shown. This step is only needed for first time installation.

### Transpiling ES6 Code

`yarn run build` or `yarn build`

### Cleaning up Transpiled ES6 Code

`yarn run clean`

### Packaging into App (prod)

`yarn run pack`

To Pack for windows
`yarn run pack:win`

### Packaging into Installer (prod)
With normal compression (around 3 min):

`yarn run dist` or `yarn dist`

Fow Windows:
`yarn run dist:win` or `yarn dist:win`

Without compression (fastest, around 1 min):

`yarn run dist:dev` or `yarn dist:dev`

## Testing
Following commands will run all test suites under `tests`. To run a particular test suite, e.g. `example1.test.js` and `example2.test.js` with `jest:dev` command:

`yarn jest:dev "example[1,2].test.js"`

#### Development (byo)
This will run `eslint` and `jest` against unpacked app

`yarn test` or `yarn test:dev`

#### Production (prod)
This will run `eslint` then `jest` against packed app

`yarn test:prod`

#### Jest only (byo)
This is `spectron` based UAT

`yarn jest:dev`

#### Jest only (prod)
Similar to previous one, but run `jest` against packed app

`yarn jest:prod`

##### Run only
Run `jest` against previously packed app

`yarn jest:prod:runonly`

## UAT Test
Set up below environment variables for UAT testing:

- EC2_SHARD_CLUSTER_HOSTNAME
- EC2_SHARD_CLUSTER_USERNAME
- EC2_SHARD_CLUSTER_PASSWORD
- ATLAS_SERVER_HOSTNAME
- ATLAS_SERVER_USERNAME
- ATLAS_SERVER_PASSWORD
