import * as util from './util';
import {diff} from './diff';
import u from 'util';

/* -------------------------------------------------------------------------- */

class View {
    constructor () {
        this._paths = [];
        this._state = {
            text: 'test'
        };

        this._template = `
        <span> {{text}} <span>
        `;

        this._templateJSON = [
            {
                tagName: 'span',
                innerHTML: '<%this.text%>'
            }
        ];

        this._currentJSONRep = {};

        this.el = document.body;
    }

    /*
    span: {
        innerHTML: '{{text}}'
    }
    */

    render () {
        var jsonRep = JSON.parse(JSON.stringify(this._templateJSON));
        interpolateState(jsonRep, this._state);

        var d = diff(this._currentJSONRep, jsonRep);

        // console.log(u.inspect(d, {showHidden: false, depth: null}), jsonRep);

        renderChanges(this.el, d);

        this._currentJSONRep = jsonRep;
    }
}

function renderChanges (element, d) {
    d.added.forEach(function (added) {
        var parent = _walkToParent(added.path, element);
        var index = added.path.splice(-1)[0];
        var newElement = _createElement(added.val);

        if (!parent.firstChild) {
            parent.appendChild(newElement);
        } else {
            parent.insertBefore(newElement, parent.childNodes[index]);
        }
    });

    d.changed.forEach(function (changed) {
        var parent = _walkToParent(changed.path, element.childNodes);
        var index = changed.path.splice(-1)[0];

        parent.innerHTML = changed.val;
    });
}

function _createElement(val) {
    var el = document.createElement(val.tagName);
    el.innerHTML = val.innerHTML;

    return el;
}

function _walkToParent (keySplits, element) {
    // this is the object we need
    if (keySplits.length === 1) {
        return element;
    } else {
        var nextKey = keySplits.splice(0, 1)[0];
        // var twoKeys = keySplits.slice(0,1)[0];

        // if (!obj[nextKey]) {
        //     if (twoKeys && !isNaN(twoKeys)) {
        //         obj[nextKey] = [];
        //     } else {
        //         obj[nextKey] = {};
        //     }
        // }

        if (!isNaN(nextKey)) {
            console.log(nextKey);
            element = element[nextKey];
        } else {
            element = element.childNodes;
        }

        return _walkToParent(keySplits, element);
    }
}


function interpolateState (json, state) {
    var keys = Object.keys(json);
    var l = keys.length;

    for (var i = 0; i < l; i++) {
        var key = keys[i];
        var item = json[key];

        if (util.isObject(item)) {
            interpolateState(item, state);
        } else {
            json[key] = doTemplating(item, state);
        }
    }
}

function doTemplating (html, options) {
    var re = /<%([^%>]+)?%>/g, reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0, match;
    var add = function(line, js) {
        js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
            (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
        return add;
    }
    while(match = re.exec(html)) {
        add(html.slice(cursor, match.index))(match[1], true);
        cursor = match.index + match[0].length;
    }
    add(html.substr(cursor, html.length - cursor));
    code += 'return r.join("");';
    return new Function(code.replace(/[\r\t\n]/g, '')).apply(options);
}

/* -------------------------------------------------------------------------- */

export default View;
