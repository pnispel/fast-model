var now = require("performance-now");
var fs = require('fs');
var json = JSON.parse(fs.readFileSync('./spec/spec_data/data1.json', 'utf8'));
var json2 = JSON.parse(JSON.stringify(json));

json2.cutupAngles[0].clipAngles[0].duration = 100;

function mapping (a, b) {
    function filter(subject, fn, thisContext) {
        var length = subject.length,
        result = [],
        iterator = thisContext !== undefined ? bindInternal3(fn, thisContext) : fn,
        i;
        for (i = 0; i < length; i++) {
        if (iterator(subject[i], i, subject)) {
        result.push(subject[i]);
        }
        }
        return result;
    }

    function fastIndexOf (subject, target, fromIndex) {
        var length = subject.length,
        i = 0;

        if (typeof fromIndex === 'number') {
        i = fromIndex;
        if (i < 0) {
        i += length;
        if (i < 0) {
        i = 0;
        }
        }
        }

        for (; i < length; i++) {
        if (subject[i] === target) {
        return i;
        }
        }
        return -1;
    }

    var data1 = {
        start: {
            one: {data: [
                    1,2,3
                ]},
            two: {data: [
                    4,5,6
                ]},
        }
    };

    var data2 = {
        start: {
            two: {data: [
                    5
                ]},
            one: {data: [
                    4,5,6
                ]},
            three: {data: [
                    14,15,16
                ]}
        }
    };

    var xml1 = {
        animals: {
            dog:[
                {name:'Rufus', breed:'labrador'},
                {name:'Marty', breed:'whippet'}
            ],
            cat:{name:'Matilda'}
        }
    };

    var xml2 = {
        animals: {
            dog:[
                {name:'Rufus', breed:'labrador'},
                {name:'Marty', breed:'whippet'}
            ],
            cat:{name:'Maty'}
        }
    };

    function getPaths (toot, path, pathsArr) {
        path = path || '';
        var keys = Object.keys(toot);
        var l = keys.length;

        for (var i = 0; i < l; i++) {
            var key = keys[i];
            var newPath = path + '.' + key;

            if (toot[key] !== null && typeof toot[key] === 'object') {
                pathsArr.push(newPath);

                pathsArr = getPaths(toot[key], newPath, pathsArr);
            } else {
                pathsArr.push(path + '.' + toot[key]);
            }
        }

        return pathsArr;
    }

    function diff (one, two) {
        var start = now();

        var ret1 = getPaths(one, '', []);
        var ret2 = getPaths(two, '', []);

        var oldIntersectNew = filter(ret1, function(id) {
            return (fastIndexOf(ret2, id) !== -1);
        });

        var newIntersectOld = filter(ret2, function(id) {
            return (fastIndexOf(ret1, id) !== -1);
        });

        var added = filter(ret2, function(id) {
            return (fastIndexOf(oldIntersectNew, id) === -1);
        });

        var removed = filter(ret1, function(id) {
            return (fastIndexOf(oldIntersectNew, id) === -1);
        });

        var moved = filter(oldIntersectNew, function (id, i) {
            return fastIndexOf(newIntersectOld, id) !== i;
        });

        var oldWithoutRemoved = filter(ret1, function (id) {
            return fastIndexOf(removed, id) === -1;
        });

        moved.forEach(function (id) {
            var oldIndex = fastIndexOf(oldWithoutRemoved, id);
            var newIndex = fastIndexOf(newIntersectOld, id);

            moved.push([oldIndex, newIndex]);
        });

        var end = now();

        console.log((end-start).toFixed(3)) // ~ 0.002 on my system
        console.log({
            added: added,
            removed: removed,
            moved: moved
        });
    }

    // diff(data1, data2);
    // diff(xml1, xml2);
    diff(json, json2);
    // console.log(added, removed, moved);
}

mapping();


