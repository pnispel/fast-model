import Model from '../src/model';
import * as util from '../src/util';
import chai from 'chai';

var expect = chai.expect;
var assert = chai.assert;

/*
 * TODO:
 * make sure freeze only happens on objects
 */

describe('Model get', function () {
    var model = null;
    var data = {
        nestedArr: [
            2,2,{another: [1,2,10]}
        ],
        another: {
            is: 'test',
            arr: [1,2,3],
            arr2: [1,2,3]
        }
    };

    beforeEach(function () {
        model = new Model();

        model.set(data);
    });

    it('should return root', function () {
        var ret = model.get();

        assert(util.isObject(ret));
    });

    it('should return immutable data', function () {
        var ret = model.get();

        expect(function () {
            ret.a = 'new value';
        }).to.throw('Can\'t add property a, object is not extensible');
    });

    it('should return nested data', function () {
        var data = model.get('nestedArr.2.another', true);

        assert(util.isArray(data));
        expect(data.length).to.equal(3);
    });

    it('should return data that is deep', function () {
        var data = model.get('another', true);

        assert(util.isObject(data));
        assert(data.is);
        expect(data.is).to.equal('test');

        expect(function () {
            data.is = 'new value';
        }).to.throw('Cannot assign to read only property \'is\' of #<Object>');
    });
});
