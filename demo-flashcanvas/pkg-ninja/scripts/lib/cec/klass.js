/*
combined files : 

cec/utils/prototypefix
cec/klass

*/
KISSY.add('cec/utils/prototypefix',function (S) {
    if ( !Array.prototype.forEach ) {
        Array.prototype.forEach = function(fn, scope) {
            for(var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope || this, this[i], i, this);
            }
        }
    }
});
//klass: a classical JS OOP façade

KISSY.add('cec/klass',function (S) {

    var context = S || this,
        old = context.klass,
        f = 'function',
        fnTest = /xyz/.test(function () {
            xyz
        }) ? /\bsupr\b/ : /.*/,
        proto = 'prototype';

        function klass(o) {
            return extend.call(isFn(o) ? o : function () {}, o, 1)
        }

        function isFn(o) {
            return typeof o === f
        }

        function wrap(k, fn, supr) {
            return function () {
                var tmp = this.supr;
                this.supr = supr[proto][k];
                var undef = {}.fabricatedUndefined;
                var ret = undef;
                try {
                    ret = fn.apply(this, arguments);
                } finally {
                    this.supr = tmp;
                }
                return ret;
            }
        }

        function process(what, o, supr) {
            for (var k in o) {
                if (o.hasOwnProperty(k)) {
                    what[k] = isFn(o[k]) && isFn(supr[proto][k]) && fnTest.test(o[k]) ? wrap(k, o[k], supr) : o[k];
                }
            }
        }

        function extend(o, fromSub) {
            // must redefine noop each time so it doesn't inherit from previous arbitrary classes
            function noop() {}
            noop[proto] = this[proto];
            var supr = this,
                prototype = new noop(),
                isFunction = isFn(o),
                _constructor = isFunction ? o : this,
                _methods = isFunction ? {} : o;

                function fn() {
                    if (this.initialize) this.initialize.apply(this, arguments)
                    else {
                        fromSub || isFunction && supr.apply(this, arguments);
                        _constructor.apply(this, arguments);
                    }
                }

            fn.methods = function (o) {
                process(prototype, o, supr);
                fn[proto] = prototype;
                return this;
            }

            fn.methods.call(fn, _methods).prototype.constructor = fn;

            fn.extend = arguments.callee;
            fn[proto].implement = fn.statics = function (o, optFn) {
                o = typeof o == 'string' ? (function () {
                    var obj = {};
                    obj[o] = optFn;
                    return obj;
                }()) : o;
                process(this, o, supr);
                return this;
            }

            return fn;
        }

    klass.noConflict = function () {
        context.klass = old;
        return this;
    }

    return klass;

}, {
    requires: ['cec/utils/prototypefix']
});