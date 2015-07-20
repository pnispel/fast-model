import {indexOf, filter, isObject, isArray} from '../src/util';
import util from 'util';

function getPaths (toot, path='', pathsArr=[], values={}) {
    var keys = Object.keys(toot);
    var l = keys.length;

    for (var i = 0; i < l; i++) {
        var key = keys[i];
        var newPath = path + key + '.';

        if (isObject(toot[key])) {
            pathsArr.push(newPath.replace(/\.$/, ''));

            getPaths(toot[key], newPath, pathsArr, values);
        } else {
            var valPath = path + key;
            pathsArr.push(valPath);
            // pathsArr.push(valPath + toot[key]);
            values[valPath] = toot[key];
        }
    }

    return [pathsArr, values];
}

/*
 * change non-leaf nodes to include a '.' at the end
 * leaf nodes in 'added' are the 'changed' nodes
 */

function findShortestCommonSubstrings (vals) {
    if (!vals.length) return;

    vals.sort(function (a, b) {
        return (a.length < b.length) ? -1 :
               (a.length === b.length) ? 0 : 1;
    });

    for (var i = (vals.length - 1); i >= 0; i--) {
        var regex = new RegExp(vals[i]);

        for (var j = i; j < vals.length; j++) {
            if ((vals[i] !== vals[j]) && regex.test(vals[j])) {
                vals.splice(j, 1);
                j--;
            }
        }
    }
}

export function runDiff (one={}, two={}) {
    if (!isObject(one) && isObject(two)) {
        one = {}
    } else if (!isObject(one) && !isObject(two) ||
                isObject(one) && !isObject(two)) {

        return {
            added: [],
            removed: [],
            moved: [],
            changed: [{
                path: [],
                val: two
            }]
        };
    }

    var ret1, ret2, leafs1, leafs2;

    var [ret1, leafs1] = getPaths(one);
    var [ret2, leafs2] = getPaths(two);

    var oldIntersectNew = filter(ret1, function(id) {
        return (indexOf(ret2, id) !== -1);
    });

    var newIntersectOld = filter(ret2, function(id) {
        return (indexOf(ret1, id) !== -1);
    });

    var added = filter(ret2, function(id) {
        return (indexOf(oldIntersectNew, id) === -1);
    });

    var removed = filter(ret1, function(id) {
        return (indexOf(oldIntersectNew, id) === -1);
    });

    var moved = filter(oldIntersectNew, function (id, i) {
        return indexOf(newIntersectOld, id) !== i;
    });

    var oldWithoutRemoved = filter(ret1, function (id) {
        return indexOf(removed, id) === -1;
    });

    var movedRet = [], retAdd = [];

    moved.forEach(function (id) {
        var oldIndex = indexOf(oldWithoutRemoved, id);
        var newIndex = indexOf(newIntersectOld, id);

        moved.push([oldIndex, newIndex]);
    });

    findShortestCommonSubstrings(added);
    findShortestCommonSubstrings(removed);

    for (var i = added.length - 1; i >= 0; i--) {
        var el = added[i];
        var changedEl = added.splice(i, 1)[0].split('.');

        var obj = two;

        for (var j = 0; j < changedEl.length; j++) {
            if (changedEl[j] !== '') {
                obj = obj[changedEl[j]];
            }
        }

        retAdd.push({
            key: changedEl.splice(-1),
            path: changedEl,
            val: obj
        });
    }

    var retRemoved = removed.map(function (obj) {
        var path = obj.split('.');

        return {
            key: path.splice(-1),
            path: path,
        };
    });

    var leafKeys = Object.keys(leafs2);
    var changed = leafKeys.map(function (key) {
        var newVal = leafs2[key];
        var oldVal = leafs1[key];

        if ((oldVal === undefined) || (oldVal === newVal)) return;

        var parentPath = key.split('.');
        var attrKey = parentPath.splice(-1);

        return {
            path: parentPath,
            key: attrKey,
            oldVal: oldVal,
            newVal: newVal
        };
    }).filter(function (leaf) {
        return leaf;
    });

    console.log('cahnge', util.inspect({
        added: retAdd,
        removed: retRemoved,
        moved: moved,
        changed: changed
    }, {showHidden: false, depth: null}));

    return {
        added: retAdd,
        removed: retRemoved,
        moved: moved,
        changed: changed
    }
}
