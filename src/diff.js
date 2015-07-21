import {indexOf, filter, isObject, isArray} from '../src/util';
import BiMap from 'bimap';
import XXH from 'xxhashjs';

function bfs (tree, cb) {
    var h = XXH(JSON.stringify(tree), 0xABCD).toString(16).toString(16);

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
            var signature = pathCopy.join('.');
            var hash = XXH(JSON.stringify(val), 0xABCD).toString(16).toString(16);

            pathCopy.push(key);

            queue.push({
                path: Object.freeze(pathCopy),
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
    var deleted = [];
    var moved = [];
    var added = [];

    function addChildrenToMap (oldItem, newItem, map) {
        var oldElKeys, newElKeys;
        var oldItemPath = oldItem.path.length ? oldItem.path.join('.') : 'root';
        var newItemPath = newItem.path.length ? newItem.path.join('.') : 'root';

        map.push(oldItemPath, newItemPath);

        if (!isObject(oldItem.val)) return;

        var keys = Object.keys(oldItem.val);

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];

            var oldVal = oldItem.val[key];
            var newVal = newItem.val[key];

            var oldPath = oldItem.path.slice(0);
            var newPath = newItem.path.slice(0);

            oldPath.push(key);
            newPath.push(key);

            addChildrenToMap({
                path: Object.freeze(oldPath),
                val: oldVal
            }, {
                path: Object.freeze(newPath),
                val: newVal
            }, map);
        }

    }

    bfs(newVal, function (el) {
        signatureHashTable[el.signature] =
            signatureHashTable[el.signature] || [];

        signatureHashTable[el.signature].push(el);
    });

    bfs(oldVal, function (oldEl) {
        var sameParentElements = signatureHashTable[oldEl.signature];
        var bestElementMap = new BiMap;

        for (var i = 0; i < sameParentElements.length; i++) {
            var newEl = sameParentElements[i];

            if (oldEl.hash === newEl.hash &&
                !mapping.key(oldEl.path.join('.'))) {
                addChildrenToMap(oldEl, newEl, mapping);

                if (oldEl.path.join('.') !== newEl.path.join('.')) {
                    moved.push([oldEl, newEl]);
                }

                break;
            }
        }
    });

    bfs(oldVal, function (el) {
        if (!mapping.key(el.path.join('.'))) {
            deleted.push(el);
        }
    });

    bfs(newVal, function (el) {
        var path = el.path.length ? el.path.join('.') : 'root';
        if (!mapping.val(path)) {
            added.push(el);
        }
    });

    var replaced = [];

    for (var i = (added.length - 1); i >= 0; i--) {
        for (var j = (deleted.length - 1); j >= 0; j--) {
            if (added[i].signature === deleted[j].signature) {
                var newEl = added.splice(i, 1)[0];
                var oldEl = deleted.splice(j, 1)[0];

                replaced.push([oldEl, newEl]);
                i--;
            }
        }
    }

    return {
        added: added,
        deleted: deleted,
        replaced: replaced,
        moved: moved
    };
}
