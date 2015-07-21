import {indexOf, filter, isObject, isArray, hashCode} from '../src/util';
import BiMap from 'bimap';
import u from 'util';

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
            var signature = pathCopy.join('.');

            var hashObj = {};
            hashObj[key] = val;

            var hash = hashCode(JSON.stringify(hashObj)).toString(16);

            pathCopy.push(key);

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
    var deleted = [];
    var moved = [];
    var added = [];

    function getChildren (item, children) {
        if (!isObject(item.val)) return;

        var keys = Object.keys(item.val);

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];

            var newItem = item.val[key];
            var newPath = item.path.slice(0);

            var hashObj = {};
            hashObj[key] = newItem;

            var hash = hashCode(JSON.stringify(hashObj)).toString(16);

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
        var bestElementMap = new BiMap;

        if (!sameParentElements) return;

        for (var i = 0; i < sameParentElements.length; i++) {
            var newEl = sameParentElements[i];
            var oldElPath = oldEl.path.length ? oldEl.path.join('.') : 'root';
            var newElPath = newEl.path.length ? newEl.path.join('.') : 'root';

            if (oldEl.hash === newEl.hash &&
                !mapping.key(oldElPath)) {

                console.log('mashing hash', oldElPath, newElPath);

                mapping.push(oldElPath, newElPath);

                var oldChildren = [];
                var newChildren = [];

                getChildren(oldEl, oldChildren);
                getChildren(newEl, newChildren);

                for (var j = 0; j < oldChildren.length; j++) {
                    var oldItem = oldChildren[j];
                    var newItem = newChildren[j];

                    var oldItemPath = oldItem.path.length ? oldItem.path.join('.') : 'root';
                    var newItemPath = newItem.path.length ? newItem.path.join('.') : 'root';

                    mapping.push(oldItemPath, newItemPath);
                }

                if (oldElPath !== newElPath) {
                    moved.push([oldEl, newEl]);
                }

                break;
            }
        }
    });

    bfs(oldVal, function (el) {
        var path = el.path.length ? el.path.join('.') : 'root';

        if (path === 'root') return;

        if (!mapping.key(path)) {
            deleted.push(el);

            var children = [];
            getChildren(el, children);

            for (var i = 0; i < children.length; i++) {
                mapping.push(children[i].path.join('.'), children[i].hash);
            }
        }
    });

    bfs(newVal, function (el) {
        var path = el.path.length ? el.path.join('.') : 'root';

        if (path === 'root') return;

        if (!mapping.val(path)) {
            added.push(el);

            var children = [];
            getChildren(el, children);

            for (var i = 0; i < children.length; i++) {
                mapping.push(children[i].hash, children[i].path.join('.'));
            }
        }
    });

    var replaced = [];

    for (var i = 0; i < added.length; i++) {
        for (var j = 0; j < deleted.length; j++) {
            if (added[i].path.join('.') === deleted[j].path.join('.')) {
                var newEl = added.splice(i--, 1)[0];
                var oldEl = deleted.splice(j, 1)[0];

                replaced.push([oldEl, newEl]);

                break;
            }
        }
    }

    return {
        added: added,
        removed: deleted,
        changed: replaced,
        moved: moved
    };
}
