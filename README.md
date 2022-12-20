# dbKoda [No Longer Maintained]

**Note:** Unfortunately this project is no longer under active development.

_State of the art MongoDB IDE_

[![CQUTesting](https://img.shields.io/travis/SouthbankSoftware/dbkoda.svg?style=flat-square&label=CQUTesting)](https://travis-ci.org/SouthbankSoftware/dbkoda)
[![dependencies](https://img.shields.io/david/SouthbankSoftware/dbkoda.svg?style=flat-square)](https://david-dm.org/SouthbankSoftware/dbkoda)
[![devDependencies](https://img.shields.io/david/dev/SouthbankSoftware/dbkoda.svg?style=flat-square)](https://david-dm.org/SouthbankSoftware/dbkoda?type=dev)

dbKoda is a modern (JavaScript/Electron framework), open source IDE for MongoDB. It has features to support development, administration and performance tuning on MongoDB databases. It has a rich feature set, including:

* Rich text editor with auto-complete, syntax highlighting and code formatting
* Visual explain plan with indexing advisors
* A real time performance dashboard
* Graphical aggregation and command builders
* One-click access to MongoDB administration commands
* Disk Storage analysis
* SQL queries using Apache Drill
* Data load and unload utilities
* and a lot of more… check our [blogs](https://medium.com/dbkoda) and [website](https://www.dbkoda.com) for details.

**Download latest release:** [v1.1.0](https://github.com/SouthbankSoftware/dbkoda/releases/tag/v1.1.0)
**Download latest beta release:** [v1.1rc9](https://github.com/SouthbankSoftware/dbkoda/releases/tag/1.1.0)

This repository defines dbKoda's building, user acceptance testing (UAT), launching and packaging workflows.

## Requirement

* Node 8.9.1+
* Yarn 1.3.2+
* To install and use this repository you will need to clone [dbkoda-ui](https://github.com/Southbanksoftware/dbkoda-ui) and [dbkoda-controller](https://github.com/Southbanksoftware/dbkoda-controller)

## Setup

1.  Make sure `dbkoda-ui`, `dbkoda-controller` and `dbkoda` are sibling folders to each other within a same parent folder, e.g:

```text
root_folder
├── dbkoda-ui
├── dbkoda-controller
└── dbkoda
```

2.  **[Important]** In `dbkoda`, run the following command `yarn dev:link`. This is only needed for the first setup. If you are installing on windows, use `yarn dev:link:win`.
3.  Run `yarn install` within all 3 repos.
4.  To build a new the app, `yarn run pack`. For Windows, use `yarn pack:win`.
5.  To build a version of the app, run `yarn run dist:dev` (without compression) and `yarn run dist` (with normal compression). For Windows, use the command `yarn dist:win`.
6.  _[optional]_ After you have tried above commands, your `dbkoda-controller`’s native modules will be built against `electron`‘s node version. If you want to go back to 'byo' mode, you need to run `yarn dev:rebuild:current` to rebuild these native modules against your current `node` version.
7.  _[optional]_ If you encounter errors or irregularities during any of these steps, you can run `rm -rf node_modules` within each of the repositories, and then run `yarn install` again. If you are still having troubles, please check our FAQs or raise a new topic at our [support site](https://dbkoda.useresponse.com)

## Config

You can config dbKoda by putting a `config.yml` in your dbKoda home folder as follows:

```yaml
# Note: please use full path for all commands

# Local mongo binary path. dbKoda will detect your mongo binary upon first launch in your login
# shell
mongoCmd: /usr/local/bin/mongo
```

## Docker Config

Please configure docker command if you are using mongo shell through a docker container:

```yaml
dockerEnabled: true
docker:
  mongoCmd: docker run -it --rm mongo mongo
  mongoVersionCmd: docker run --rm mongo mongo --version
```

Below configuration is used to run mongo shell through existed docker container:

```yaml
dockerEnabled: true
docker:
  mongoCmd: docker exec -it CONTAINER_ID mongo
  mongoVersionCmd: docker exec CONTAINER_ID mongo --version
```

Please configure the mongo os commands if you want to use backup/restore through docker container. You need to specify the mount points for the docker container in order to backup/resore your mongo file. Otherwise, the data you backedup will be wipped after the container exist.

```yaml
dockerEnabled: true
docker:
  mongoexportCmd: docker run --rm -v OS_PATH:CONTAINER_PATH mongo mongoexport
  mongoimportCmd: docker run --rm -v OS_PATH:CONTAINER_PATH mongo mongoimport
  mongodumpCmd: docker run --rm -v OS_PATH:CONTAINER_PATH mongo mongodump
  mongorestoreCmd: docker run --rm -v OS_PATH:CONTAINER_PATH mongo mongorestore
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

1.  `yarn add -D devtron`
2.  Run `require('devtron').install()` in Chrome DevTools. In either [BYO](#bring-your-own-byo-dev-mode) or [Super Dev](#super-dev-mode) mode, you should run this in DevTools of splash screen window. You can kill `dbkoda-ui`, and create a new window (<kbd>cmd+n</kbd>) in electron, so a new splash
    screen window will keep shown. This step is only needed for first time installation.

### [React DevTools](https://github.com/firejune/electron-react-devtools)

React component tree inspector extension for Chrome DevTools

1.  `yarn add -D electron-react-devtools`
2.  Run `require('electron-react-devtools').install()` in Chrome DevTools. In either [BYO](#bring-your-own-byo-dev-mode) or [Super Dev](#super-dev-mode) mode, you should run this in DevTools of splash screen window. You can kill `dbkoda-ui`, and create a new window (<kbd>cmd+n</kbd>) in electron, so a new splash
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

* EC2_SHARD_CLUSTER_HOSTNAME
* EC2_SHARD_CLUSTER_USERNAME
* EC2_SHARD_CLUSTER_PASSWORD
* ATLAS_SERVER_HOSTNAME
* ATLAS_SERVER_USERNAME
* ATLAS_SERVER_PASSWORD
