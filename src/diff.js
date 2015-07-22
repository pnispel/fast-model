import {indexOf, filter, isObject, isArray, hashCode} from '../src/util';
import BiMap from 'bimap';

function bfs (tree, cb) {
    var h = hashCode(JSON.stringify({root: tree})).toString(16);

    var queue = [{
        val: tree,
        path: [],
        signature: '',
        hash: h
    }];

    var levels = [];
    var tillNextLevel = 0;
    var nextLevelBuffer = 0;
    var level = [];

    do {
        var item = queue.shift();

        cb(item)

        level.push(item);

        var type = typeof item.val;
        var keys = [];

        if (((type === 'object' || type === 'function') && !!item.val)) {
            keys = Object.keys(item.val);

            nextLevelBuffer += keys.length;
        }

        if (tillNextLevel <= 0) {
            tillNextLevel = nextLevelBuffer;
            nextLevelBuffer = 0;

            levels.push(level.slice(0));
            level.length = 0;
        }

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var val = item.val[key];

            var pathCopy = item.path.slice(0);

            pathCopy.push(key);

            var signature = !isNaN(pathCopy.slice(-1)) ?
                pathCopy.slice(0, pathCopy.length - 1).join('.') :
                pathCopy.join('.');

            // var hashObj = {};
            // hashObj[key] = val;

            var hash = hashCode(JSON.stringify(val)).toString(16);

            // console.log(hash, pathCopy.join('.'));

            queue.push({
                path: pathCopy,
                val: val,
                signature: signature,
                hash: hash
            });
        }

        tillNextLevel--;
    } while (queue.length !== 0)

    return levels;
}

export function diff (oldVal={}, newVal={}) {
    var signatureHashTable = {};
    var mapping = new BiMap;
    var movingBiMap = new BiMap;
    var script = [];

    function getChildren (item, children) {
        if (!isObject(item.val)) return;

        var keys = Object.keys(item.val);

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];

            var newItem = item.val[key];
            var newPath = item.path.slice(0);

            // var hashObj = {};
            // hashObj[key] = newItem;

            var hash = hashCode(JSON.stringify(newItem)).toString(16);

            newPath.push(key);

            var child = {
                path: newPath,
                val: newItem,
                hash: hash
            };

            children.push(child);

            getChildren(child, children);
        }
    }

    var newLevels = bfs(newVal, function (el) {
        signatureHashTable[el.signature] =
            signatureHashTable[el.signature] || [];

        signatureHashTable[el.signature].push(el);
    });

    var oldLevels = bfs(oldVal, function (oldEl) {
        var sameParentElements = signatureHashTable[oldEl.signature];
        var oldElPath = oldEl.path.length ? oldEl.path.join('.') : 'root';

        if (!sameParentElements || mapping.key(oldElPath)) return;

        for (var i = 0; i < sameParentElements.length; i++) {
            var newEl = sameParentElements[i];
            var newElPath = newEl.path.length ? newEl.path.join('.') : 'root';

            if (oldEl.hash === newEl.hash) {
                console.log('match:', oldElPath, newElPath, oldEl.hash)
                var match = mapping.key(oldElPath)
                if (mapping.val(match) === oldElPath) {
                    mapping.removeKey(oldElPath);
                }

                mapping.set(oldElPath, newElPath);

                var oldChildren = [];
                var newChildren = [];

                getChildren(oldEl, oldChildren);
                getChildren(newEl, newChildren);

                for (var j = 0; j < oldChildren.length; j++) {
                    var oldItem = oldChildren[j];
                    var newItem = newChildren[j];

                    var oldItemPath = oldItem.path.length ? oldItem.path.join('.') : 'root';
                    var newItemPath = newItem.path.length ? newItem.path.join('.') : 'root';

                    var newMatch = mapping.key(oldItemPath)
                    if (mapping.val(match) === oldItemPath) {
                        mapping.removeKey(oldItemPath);
                    }
                    // mapping.removeVal(newItemPath);
                    mapping.setNull(oldItemPath, newItemPath);
                }

                sameParentElements.splice(i, 1);

                break;
            } else if (oldElPath === newElPath &&
                !mapping.key(oldElPath)) {

                if (!isObject(oldEl.val) ||
                    !isObject(newEl.val)) continue;

                mapping.push(oldElPath, newElPath);
            }
        }
    });

console.log(mapping);

    bfs(oldVal, function (el) {
        var path = el.path.length ? el.path.join('.') : 'root';

        if (path === 'root') return;

        var match = mapping.key(path);

        if (!mapping.key(path) || (mapping.val(match) !== path)) {
            script.push(['delete', el]);

            var children = [];
            getChildren(el, children);

            for (var i = 0; i < children.length; i++) {
                mapping.set(children[i].path.join('.'), children[i].hash);
            }
        }
    });

    bfs(newVal, function (el) {
        var path = el.path.length ? el.path.join('.') : 'root';

        if (path === 'root') return;

        var match = mapping.val(path);

        if (!match) {
            script.push(['add', el]);

            var children = [];
            getChildren(el, children);

            for (var i = 0; i < children.length; i++) {
                mapping.set(children[i].hash, children[i].path.join('.'));
                movingBiMap.set(children[i].hash, children[i].path.join('.'));
            }
        } else if (!movingBiMap.val(path)) { // TODO remove !match
            var oldElPath = mapping.val(path);

            if (oldElPath !== path) {
                script.push(['move', el, oldElPath]);

                var children = [];
                getChildren(el, children);

                for (var i = 0; i < children.length; i++) {
                    movingBiMap.set(children[i].hash, children[i].path.join('.'));
                }
            }
        }
    });

    for (var i = 0; i < script.length; i++) {
        var item = script[i];

        if (item[0] !== 'move') continue;

        for (var j = i; j < script.length; j++) {
            var item2 = script[j];

            if (item2[0] !== 'move') continue;

            if (item[1].path.join('.') === item2[2] &&
                item2[1].path.join('.') === item[2]) {

                item[0] = 'swap';
                script.splice(j--, 1);
            }
        }
    }

    for (var i = 0; i < script.length; i++) {
        var item = script[i];

        if (item[0] !== 'move') continue;

        var lastInPath = item[1].path.slice(-1);
        var lastInOldPath = item[2].split('.').slice(-1);
        if (!isNaN(lastInPath) && !isNaN(lastInOldPath) &&
            (Math.abs(lastInPath - lastInOldPath) <= 1)) {
            script.splice(i--, 1);
        }
    }

    var replaced = [];

    for (var i = 0; i < script.length; i++) {
        var item = script[i];
        if (item[0] !== 'add') continue;

        for (var j = 0; j < script.length; j++) {
            var item2 = script[j];

            if (item2[0] !== 'delete') continue;

            if (item[1].path.join('.') === item2[1].path.join('.')) {
                var newEl = script.splice(i--, 1)[0][1];
                var oldEl = script.splice(j--, 1)[0][1];

                script.splice(0,0, ['replace', oldEl, newEl]);

                break;
            }
        }
    }

    return script;
}
