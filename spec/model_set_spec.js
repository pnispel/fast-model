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
        model.set('foo', {test: 1}, true);
        assert(model._data.foo.test === 1);

        model.set('foo.fa', {test: 1}, true);
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

        model.set('arr', [1,2,3,4], true);

        data = model._data.arr;
        isArr = Object.prototype.toString.call( data ) === '[object Array]';
        assert(data.length === 4);
        assert(isArr === true);
    });

    it('should set nested arrays', function () {
        model.set('test.foo.arr', [1,2,3], true);

        var data = model._data.test.foo.arr;
        var isArr = Object.prototype.toString.call( data ) === '[object Array]';

        assert(data.length === 3);
        assert(isArr === true);
    });

    it('should change nested array at index', function () {
        var data, isArr;

        model.set('test.foo.arr.0', 1, true);

        data = model._data.test.foo.arr;

        isArr = Object.prototype.toString.call( data ) === '[object Array]';
        assert(data[0] === 1);
        assert(data.length === 1);
        assert(isArr === true);

        model.set('test.bing.ba.0', 1, true);

        data = model._data.test.bing.ba;
        isArr = Object.prototype.toString.call( data ) === '[object Array]';
        assert(data[0] === 1);
        assert(data.length === 1);
        assert(isArr === true);
    });

    it('should allow nested array creation', function () {
        var data, isArr;

        model.set('test.foo.arr.0.test.0.five.0', 1, true);

        data = model._data.test.foo.arr[0].test[0].five;

        isArr = Object.prototype.toString.call( data ) === '[object Array]';
        assert(data[0] === 1);
        assert(data.length === 1);
        assert(isArr === true);
    });

    it('should do complicated actions', function () {
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

        model.set({
            nestedArr: [
                1,2,{another: [1,2,3]}
            ],
            another: {
                is: 'here',
                arr: [1,2,3]
            }
        });

        model.set('nestedArr.0', 2, true);
        model.set('nestedArr.2.another.2', 10, true);
        model.set('another.is', 'test', true);
        model.set('another.arr2', [1,2,3], true);

        assert(JSON.stringify(data) === JSON.stringify(model._data));
    });

    it('should do more complicated actions', function () {
        console.log('\nHERE: ');
        var data = {
            nestedArr: [
                2,2,{thisGuy: [1,2,10]}
            ],
            another: {
                is: 'test',
                arr: [1,2,3],
                arr2: [1,2,3]
            }
        };

        model.set({
            nestedArr: [
                1,2,{another: [1,2,3]}
            ],
            another: {
                is: 'here',
                arr: [1,2,3]
            }
        });

        model.set('nestedArr', data.nestedArr);
        model.set('another', data.another);

        assert(JSON.stringify(data) === JSON.stringify(model._data));
    });
});
