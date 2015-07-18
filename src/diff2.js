import {indexOf, filter, isObject, isArray} from '../src/util';

function getPaths (toot, path=[], pathsArr=[]) {
    var keys = Object.keys(toot);
    var l = keys.length;

    for (var i = 0; i < l; i++) {
        var key = keys[i];
        var newPath = path.slice(0).push(key);

        if (isObject(toot[key])) {
            pathsArr.push(newPath);

            pathsArr = getPaths(toot[key], newPath, pathsArr);
        } else {
            var valPath = path.slice(0).push(key);
            pathsArr.push(valPath);
            pathsArr.push(valPath.slice(0).push(toot[key]));
        }
    }

    return pathsArr;
}

function bfs(root, second) {
    var paths = getPaths(second);
    var queue = [{obj: root, path: ''}];
    var mapping = {};
    var reverseMapping = {};

    function matchFragment (node1, node2, internalMap, internalReverseMap, match) {
        if (mapping[node1.path] || reverseMapping[node2.path] ||
            (node1.path !== node2.path)) return;

        internalMap[node1.path] = node2.path;
        internalReverseMap[node2.path] = node1.path;

        var node1Children = Object.keys(node1.obj);
        var node2Children = Object.keys(node2.obj);
        for (var i = 0; i < node1Children.length; i++) {
            var newNode1Path = node1.path + node1Children[i];

            var newNode1 = {
                path: newNode1Path;
                obj: node1[newNode1Path]
            };
        }
    }

    do {
        var len = queue.length;

        var queueItem = queue.splice(0,1)[0];
        var obj = queueItem.obj;
        var queueItemPath = queueItem.path;

        var keys = Object.keys(obj);

        var mapPrimePrime = {};

        for (var j = 0; j < keys.length; j++) {
            var key = keys[j];
            var newObj = obj[key];
            var newPath = queueItemPath + key + '.';

            if (mapping[newPath]) continue;

            for (var i = 0; i < paths.length; i++) {
                var path = paths[i];
                var pathKey = path.join('.');
                var indexOfKey = path.indexOf(key);
                if (indexOfKey === -1 ||
                    reverseMapping[pathKey]) continue;

                var mapPrime = {};
                var mapReversePrime = {};

                var thing = second;

                for (var k = 0; k < path.length; k++) {
                    thing = thing[path[j]];
                }

                matchFragment(
                    queueItem,
                    {
                        obj: thing,
                        path: path
                    },
                    mapPrime,
                    mapReversePrime,
                    path[indexOfKey]);
            }

            var type = typeof newObj;
            if ((type === 'object' || type === 'function') && !!newObj) {
                queue.push({
                    path: newPath
                    obj: newObj});
            } else {
                // leaf
                console.log(newObj);
            }
        }
    } while( 0 !== queue.length );
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

export function run (one, two) {
    var ret1 = getPaths(one, '', []);
    var ret2 = getPaths(two, '', []);


}
