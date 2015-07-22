import chai from 'chai';
import now from 'performance-now';
import fs from 'fs';
import dummyjson from 'dummy-json';

import * as util from '../src/util';
import {diff} from '../src/diff';
import Model from '../src/model';

import u from 'util';

var expect = chai.expect;
var assert = chai.assert;

var dataJSON = JSON.parse(fs.readFileSync('./spec/spec_data/data1.json', 'utf8'));

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

    const simpleTemplate = `
        {
          "images": [
            {{#repeat 3}}
            {"name": "img{{index}}.png"}
            {{/repeat}}
          ]
        }
    `;

    let json1, json2, json3, json4;

    beforeEach(function () {
        json1 = JSON.parse(dummyjson.parse(template));
        json2 = JSON.parse(dummyjson.parse(template));

        json3 = JSON.parse(JSON.stringify(dataJSON));
        json4 = JSON.parse(JSON.stringify(dataJSON));
    });


    it('it should return empty with same object', function () {
        var m = new Model();
        // console.log(json3);
        m.set(json3);
        // var clipAngles = m.getMutable('cutupAngles.0.clipAngles');

        // clipAngles.forEach(function (ca) {
        //     ca.id = Math.random();

        //     if (!ca.files) return;

        //     ca.files.forEach(function (f) {
        //         f.id = Math.random();
        //     });
        // });

        // clipAngles.splice(0, 1);
        // added
        // clipAngles.splice(0, 0, {isSpacer: true});

        function combine () {
            var clipAngles = m.getMutable('cutupAngles.0.clipAngles');
            var first = clipAngles[0];
            var second = clipAngles[1];

            console.log(first, second);

            var firstFiles = first.files;
            var nextFiles = second.files;

            var duration = first.duration + second.duration;

            second.duration = duration;

            // if we combine in reverse order - we want the 'next' videos clips first

            second.files = firstFiles.concat(nextFiles);


            second.isModified = true;

            clipAngles.splice(0,1);

            m.set('cutupAngles.0.clipAngles', clipAngles);
        }



        combine();

        console.log('bef');
        // m.set('cutupAngles.0.clipAngles', clipAngles);

        // var json5 = JSON.parse(dummyjson.parse(simpleTemplate));
        // var json6 = JSON.parse(JSON.stringify(json5));

        // added
        // json6.images.splice(0,0, {name: 'test'});

        // json6.images[1].name = "test";

        // swap
        // var spliced = json6.images.splice(1,1)[0];
        // json6.images.splice(0,0, spliced);

        // delete
        // json6.images.splice(0,1);

        // move
        // var buffer = json6.images[0];
        // json6.images[0] = json6.images[1];
        // json6.images[1] = json6.images[2];
        // json6.images[2] = buffer;

        // add two of same element
        // json6.images.splice(0,0, {name: 'test'});
        // json6.images.splice(0,0, {name: 'test'});

        // add object
        // json6.tar = {test: 1, another: 2};
        // json6.bing = "bang";

        // var start = now();
        // var ret = diff(json5, json6);
        // var end = now();
        // console.log(end - start);

        // console.log(u.inspect(ret, {showHidden: false, depth: null}));

        // assert(ret.moved.length === 0 &&
        //        ret.added.length === 0 &&
        //        ret.removed.length === 0);
    });

    it('it should allow diffing', function () {
        // let newjson = JSON.parse(JSON.stringify(json1));

        // newjson.people[0].name.firstName = "testFirstName";
        // newjson.people[0].test = {
        //     one: 1,
        //     two: 2
        // };

        // newjson.people.splice(1, 1);

        // var toAdd = newjson.people.splice(1, 1)[0];
        // newjson.people.splice(0, 0, toAdd);

        // var start = now();
        // let ret = runDiff(json1, newjson);
        // var end = now();

        // console.log(json1, newjson);
        // console.log('\n');

        // console.log(u.inspect(ret, {showHidden: false, depth: null}));

    });

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
