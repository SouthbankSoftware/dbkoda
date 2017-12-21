/**
 * @Last modified by:   guy
 * @Last modified time: 2017-06-01T14:02:40+10:00
 */

 /* eslint no-multi-str: 0 */
import _ from 'lodash';
import {
    getRandomPort,
    killMongoInstance,
    launchSingleInstance
} from 'test-utils';
import {
    sprintf
} from 'sprintf-js';
import TreeAction from '../pageObjects/TreeAction';
import Connection from '../pageObjects/Connection';
import Editor from '../pageObjects/Editor';
import Output from '../pageObjects/Output';


import {
    config,
    getApp
} from '../helpers';
import {
    mongoPortOutput
} from '../tree/actions/uiDefinitions/inputAndTest/common';

const debug = false;

describe('Mongoscripts:tests', () => {
    config();
    const r = {};
    const cleanupWorkflows = [];

    const cleanup = async () => {
        // cleanup in reverse order
        await _.reduceRight(cleanupWorkflows, async (acc, wf) => {
            await acc;
            try {
                await wf();
            } catch (e) {
                console.error(e.stack);
            }
        }, Promise.resolve());
    };

    beforeAll(async () => {
        try {
            const app = await getApp();

            r.app = app;
            r.browser = app.client;
            r.treeAction = new TreeAction(r.browser);
            r.connection = new Connection(r.browser);
            r.output = new Output(r.browser);
            r.editor = new Editor(r.browser);
            r.debug = async () => {
                console.log('\n\nWebdriverIO debugging REPL...');
                await r
                    .browser
                    .debug();
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

    const editorCommand = async (inputCommands) => {
        if (debug) console.log('Editor input: ', inputCommands);
        await r.editor._clickAddNewEditor();
        await r.browser.waitForExist('.pt-toast-message');
        await r.browser.pause(1000);

        await r.output.setNewOutputCursor();
        await r.browser.pause(1000);
        await r.editor._appendToEditor(inputCommands);
        await r.editor._clickExecuteAll();
        await r.browser.pause(1000);
        const outputLines = await r.output.getAllOutputLines();
        if (debug) console.log('Editor output: ', outputLines);
        return (outputLines);
    };

    /** Setup database */
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
        const output = await mongoPortOutput(r.mongoDbPort, 'use test\ndb.z.insert({a:1});\n');
        if (debug) console.log(output);
    });

    test('Setup globals', async () => {
         r.randomCollection = 'collection' + Math.floor(Math.random() * 10000000);
    });

    /** Connect to database */
    test('Create a connection', async () => {
        const {
            browser,
            connection,
            mongoDbPort: port,
            treeAction
        } = r;

        await connection.connectProfileByHostname({
            alias: 'Test',
            hostName: 'localhost',
            port,
            database: 'admin'
        });
        expect(await browser.waitForExist(treeAction.treeNodeSelector)).toBeTruthy;
    });

    test('Check MongoScripts exist and have expected functions', async () => {
        const cmd = 'var check=Object.keys(dbe).length>=16 & \
        Object.keys(dbk_agg).length>=15 & \
        Object.keys(dbc_rsStats).length>=3 & \
        Object.keys(dbcShards).length>=5 & \
        Object.keys(dbeCR).length>=4 & \
        Object.keys(dbeOps).length>=3 & \
        Object.keys(dbeSS).length>=7 & \
        Object.keys(dbk_Cs).length>=7 & \
        Object.keys(dbkInx).length>=12  ;\n \
        print ("MongoScript status "+check);';

        const editorInput = cmd;
        if (debug) {
            console.log(editorInput);
        }
        const outputLines = await editorCommand(editorInput);

        const expectedOutput = expect.stringMatching('MongoScript status 1');

        expect(outputLines.toString()).toEqual(expectedOutput);
    });

    test('Insert some data', async () => {
        let cmd = 'use test\n';
        for (let i = 1; i <= 10; i += 1) {
            cmd += sprintf('db.getSiblingDB("%s").%s.insert({col_a:%s,col_b:%s,col_c:%s,col_d:%s,col_e:%s});\n',
                'test', r.randomCollection, i, i, i, i, i);
        }
        const outputLines = await editorCommand(cmd);
        if (debug) console.log('outputLines', outputLines);
    });

    test('Check that insert worked', async () => {
        const editorInput = sprintf('var x=db.getSiblingDB("%s").%s.count();print("count="+x);\n\n',
            'test', r.randomCollection);
        if (debug) {
            console.log(editorInput);
        }
        const outputLines = await editorCommand(editorInput);

        const expectedOutput = expect.stringMatching('count=10');

        expect(outputLines.toString()).toEqual(expectedOutput);
    });
    test('Index recomendations for AND query ', async () => {
        const editorInput = sprintf(`
        var x1=db.getSiblingDB("%s").%s.find({a:1,b:2},{c:1}).sort({d:-1}).explain();
        var suggest=dbkInx.suggestIndexKeys(x1);
        var test1=suggest.length===1;
        var test2=JSON.stringify(Object.keys(suggest[0]))===JSON.stringify(["a", "b", "d","c"]);
        var test3=suggest[0].d===-1;
        print ('index AND tests OK',test1&test2&test3)`, 'test', r.randomCollection);
        if (debug) {
            console.log(editorInput);
        }
        const outputLines = await editorCommand(editorInput);

        const expectedOutput = expect.stringMatching('index AND tests OK 1');
        // if (debug) await r.debug();
        expect(outputLines.toString()).toEqual(expectedOutput);
    });

    test('Index recomendations for OR query ', async () => {
        const editorInput = sprintf(`
        var x1=db.getSiblingDB("%s").%s.find({'$or':[{a:1},{b:2}]},{c:1}).sort({d:-1}).explain();
        var suggest=dbkInx.suggestIndexKeys(x1);
        var test1=suggest.length===2;
        var test2=JSON.stringify(Object.keys(suggest[0]))===JSON.stringify(["a", "d","c"]);
        var test3=suggest[0].d===-1;
        var test4=JSON.stringify(Object.keys(suggest[1]))===JSON.stringify(["b", "d","c"]);
        print ('index OR tests OK',test1&test2&test3&test4)`, 'test', r.randomCollection);
        if (debug) {
            console.log(editorInput);
        }
        const outputLines = await editorCommand(editorInput);

        const expectedOutput = expect.stringMatching('index OR tests OK 1');
        // if (debug) await r.debug();
        expect(outputLines.toString()).toEqual(expectedOutput);
    });

    test('Don\'t recomend redundant index', async () => {
        const editorInput = sprintf(`
        db.getSiblingDB("%s").%s.createIndex({a:1,b:1,c:1});
        var x1=db.getSiblingDB("%s").%s.find({a:1,b:2}).explain();
        var suggest=dbkInx.suggestIndexKeys(x1);
        printjson(suggest);
        var test1=suggest.length===0;
        print ('index redundant test',test1)`, 'test', r.randomCollection,
         'test', r.randomCollection);
        if (debug) {
            console.log(editorInput);
        }
        const outputLines = await editorCommand(editorInput);

        const expectedOutput = expect.stringMatching('index redundant test true');
        // if (debug) await r.debug();
        expect(outputLines.toString()).toEqual(expectedOutput);
    });
    test('Check dbe.version', async () => {
        const editorInput = 'print("Major version OK",dbe.version()[0]>=3);';
        if (debug) {
            console.log(editorInput);
        }
        const outputLines = await editorCommand(editorInput);

        const expectedOutput = expect.stringMatching('Major version OK true');

        expect(outputLines.toString()).toEqual(expectedOutput);
    });
});
