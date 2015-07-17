import Model from '../src/model';
import assert from 'assert';

describe('Model set', function () {
    var model = null;

    beforeEach(function () {
        model = new Model();
    });

    it('should set data at root', function () {
        model.set({test: 1});

        assert(model._data.test === 1);
    });

    it('should set nested data', function () {
        model.set({foo: {test: 1}});
        assert(model._data.foo.test === 1);

        model.set({foo: {fa: {test: 1}}});
        assert(model._data.foo.fa.test === 1);
    });

    it('should set data using keys', function () {
        model.set('foo', {test: 1});
        assert(model._data.foo.test === 1);

        model.set('foo.fa', {test: 1});
        assert(model._data.foo.fa.test === 1);
    });

    it('should set arrays from object', function () {
        var data, isArr;

        model.set({arr: [1,2,3]});

        data = model._data.arr;
        isArr = Object.prototype.toString.call( data ) === '[object Array]';
        assert(data.length === 3);
        assert(isArr === true);
    });

    it('should set arrays from key', function () {
        var data, isArr;

        model.set('arr', [1,2,3,4]);

        data = model._data.arr;
        isArr = Object.prototype.toString.call( data ) === '[object Array]';
        assert(data.length === 4);
        assert(isArr === true);
    });

    it('should set nested arrays', function () {
        model.set('test.foo.arr', [1,2,3]);

        console.log('adata', model._data);
        var data = model._data.test.foo.arr;
        var isArr = Object.prototype.toString.call( data ) === '[object Array]';

        assert(data.length === 3);
        assert(isArr === true);
    });

    it('should change nested array at index', function () {
        var data, isArr;

        model.set('test.foo.arr.0', 1);

        data = model._data.test.foo.arr;

        console.log(model._data);
        isArr = Object.prototype.toString.call( data ) === '[object Array]';
        assert(data[0] === 1);
        assert(data.length === 1);
        assert(isArr === true);

        model.set('test.bing.ba.0', 1);

        data = model._data.test.bing.ba;
        isArr = Object.prototype.toString.call( data ) === '[object Array]';
        assert(data[0] === 1);
        assert(data.length === 1);
        assert(isArr === true);
    });
});
