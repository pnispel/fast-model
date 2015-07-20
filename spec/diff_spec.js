import chai from 'chai';
import now from 'performance-now';
import fs from 'fs';
import dummyjson from 'dummy-json';

import * as util from '../src/util';
import {runDiff} from '../src/diff';

import u from 'util';

var expect = chai.expect;
var assert = chai.assert;

/*
 * TODO:
 * check values with dots in them (html)
 */

describe('Diff', function () {
    const template = `
        {
          "people": [
            {{#repeat 4}}
            {
              "id": {{index}},
              "name": {
                  "firstName": "{{firstName}}",
                  "lastName": "{{lastName}}"
              },
              "email": "{{email}}",
              "work": "{{company}}",
              "age": {{number 20 50}},
              "optedin": {{boolean}}
            }
            {{/repeat}}
          ],
          "images": [
            {{#repeat 3 6}}
            "img{{index}}.png"
            {{/repeat}}
          ],
          "revision": {{uniqueIndex}},
          "tolerance": {{number '0' '2'}}
        }
    `;

    let json1, json2;

    beforeEach(function () {
        json1 = JSON.parse(dummyjson.parse(template));
        json2 = JSON.parse(dummyjson.parse(template));
    });


    it('it should return empty with same object', function () {
        var ret = runDiff(json1, json1);

        assert(ret.moved.length === 0 &&
               ret.added.length === 0 &&
               ret.removed.length === 0);
    });

    it('it should allow diffing', function () {
        let newjson = JSON.parse(JSON.stringify(json1));

        newjson.people[0].name.firstName = "testFirstName";
        newjson.people[0].test = {
            one: 1,
            two: 2
        };

        newjson.people.splice(1, 1);

        var toAdd = newjson.people.splice(1, 1)[0];
        newjson.people.splice(0, 0, toAdd);

        var start = now();
        let ret = runDiff(json1, newjson);
        var end = now();

        // console.log(json1, newjson);
        // console.log('\n');

        // console.log(u.inspect(ret, {showHidden: false, depth: null}));

    });
    // var json = JSON.parse(fs.readFileSync('./spec_data/data1.json', 'utf8'));
    // var json2 = JSON.parse(JSON.stringify(json));
    // json2.cutupAngles[0].clipAngles[0].duration = 100;
    // var data1 = {
    // start: {
    //         one: {data: [
    //                 1,2,3
    //             ]},
    //         two: {data: [
    //                 4,5,6
    //             ]},
    //     }
    // };

    // var data2 = {
    //     start: {
    //         two: {data: [
    //                 5
    //             ]},
    //         one: {data: [
    //                 4,5,6
    //             ]},
    //         three: {data: [
    //                 14,15,16
    //             ]}
    //     }
    // };

    // var xml1 = {
    //     animals: {
    //         dog:[
    //             {name:'Rufus', breed:'labrador'},
    //             {name:'Marty', breed:'whippet'}
    //         ],
    //         cat:{name:'Matilda'}
    //     }
    // };

    // var xml2 = {
    //     animals: {
    //         dog:[
    //             {name:'Rufus', breed:'labrador'},
    //             {name:'Marty', breed:'whippet'}
    //         ],
    //         cat:{name:'Maty'}
    //     }
    // };
});
