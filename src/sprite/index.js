// todo:
// 1. bubble events binding
// 2. capture events 'mouseover, mouseout' fix
KISSY.add(function (S, Cobject) {
    
    var Sprite = Cobject.extend({
        _htmlevents: 'click,dblclick,mousedown,mousemove,mouseover,mouseout,mouseup,keydown,keypress,keyup,touchstart,touchend,touchcancel,touchleave,touchmove',
        initialize: function (options) {
            this.supr(options);

            this.parent = null;
            this.children = [];
        },
        add: function (o) {
            o.parent = this;
            o.canvas = this.canvas;
            o.ctx = this.ctx;
            this.children.push(o);
            this.children.sort(function (a, b) {
                return a.zIndex - b.zIndex;
            });

            return this;
        },
        remove: function (o) {
            for (var i = 0; i < this.children.length; i ++) {
                if (o == this.children[i]) {
                    o.parent = null;
                    this.children.splice(i, 1);
                    return o;
                }
            }

        },
        getIndex: function () {
            if (this.parent) {
                for (var i = 0; i < this.parent.children.length; i ++) {
                    if (this == this.parent.children[i]) {
                        return i;
                    }
                }
            }
            return -1;
        },
        getChildIndex: function (c) {
            for (var i = 0; i < this.children.length; i ++) {
                if (this.children[i] == c) {
                    return i;
                }
            }
            return -1;
        },
        contains: function (c) {
            return (this.getChildIndex(c) > -1);
        },
        isVisible: function () {
            var self = this;
            while (self) {
                if (!self.visible) {
                    return false;
                }
                self = self.parent;
            }
            return true;
        },
        render: function (dt) {
            var self = this;
            dt = dt || 0.016;

            if (!self.visible) {return}

            self.ctx.save();
            self.fire('render:before', self);
            self.ctx.rotate(self.angle);
            self.ctx.scale(self.scaleX, self.scaleY);
            self.fire('render', self);
            self.ctx.restore();

            for (var i = 0, len = self.children.length; i < len ; i++) {
                self.ctx.save();
                self.ctx.translate(self.children[i].x, self.children[i].y);
                self.children[i].render(dt);
                self.ctx.restore();
            }
            self.fire('render:after', self);

            return this;
        },
        clear: function (x, y, w, h) {
            if (x == undefined) x = 0;
            if (y == undefined) y = 0;
            if (w == undefined) w = this.width;
            if (h == undefined) h = this.height;
            this.ctx.clearRect(x, y, w, h);

            return this;
        },
        on: function (ev, callback) {
            if ((','+this._htmlevents+',').indexOf(','+ev+',') > -1) {
                // bubble events binding
                // todo
            } else {
                this.supr(ev, callback);
            }
            return this;
        },
        delegate: function (ev, callback) {
            // capture target events binding
            if ((','+this._htmlevents+',').indexOf(','+ev+',') > -1) {
                this._delegateHtmlEvents(ev, callback);
            }
            return this;
        },
        _delegateHtmlEvents: function (ev, callback) {
            //private 
            var win = window,
                self = this,
                html = document.documentElement || {scrollLeft:0, scrollTop: 0};
            function getWindowScroll() {
                return {
                    x: (win.pageXOffset || html.scrollLeft),
                    y: (win.pageYOffset || html.scrollTop)
                };
            }
            //private
            function getOffset(el) {
                el = el || self.canvas;
                var width = el.offsetWidth || el.width,
                    height = el.offsetHeight || el.height,
                    top = el.offsetTop || 0,
                    left = el.offsetLeft || 0;
                while (el = el.offsetParent) {
                    top = top + el.offsetTop;
                    left = left + el.offsetLeft;
                }
                return {
                    top: top,
                    left: left,
                    width: width,
                    height: height
                };
            }


            if (this.type == 'stage') {
                this.canvas.addEventListener(ev, function (e) {
                    e.originalTarget = e.target;
                    //find target
                    var stageOffsetX, stageOffsetY, targetOffsetX, targetOffsetY,
                        of = getOffset(self.canvas),
                        winScroll = getWindowScroll();

                    if (/touch/.test(ev) && e.touches[0]) {
                        var touch = e.touches[0];
                        stageOffsetX = touch.pageX - of.left;
                        stageOffsetY = touch.pageY - of.top;
                    } else {
                        stageOffsetX = e.clientX + winScroll.x - of.left;
                        stageOffsetY = e.clientY + winScroll.y - of.top;
                    }

                    var target = self._findTarget(stageOffsetX, stageOffsetY);
                    e.targetSprite = target;
                    //e._target = target;
                    e.stageOffsetX = stageOffsetX;
                    e.stageOffsetY = stageOffsetY;
                    e.spriteOffsetX = target._ev_offsetX;
                    e.spriteOffsetY = target._ev_offsetY;

                    delete target._ev_offsetX;
                    delete target._ev_offsetY;

                    callback && callback(e);

                }, false);

            } else {
                console && console.warn('only `stage` type can delegate HTMLEvents!');
            }
        },
        _findTarget: function (x, y) {
            var hoverSprites = [];
            hoverSprites.push(this);

            function find (o, l, t) {
                if (o.children && o.children.length) {
                    for (var i = 0, len = o.children.length; i < len; i ++) {
                        var c = o.children[i],
                            posc = [l + c.x, t + c.y, l + c.x + c.width, t + c.y + c.height];
                        if (x > posc[0] && x < posc[2] && y > posc[1] && y < posc[3]) {
                            c._ev_offsetX = x - posc[0];
                            c._ev_offsetY = y - posc[1];
                            hoverSprites.push(c);
                        }
                        find(c, posc[0], posc[1]);
                    }
                }
            }
            find(this, this.x, this.y);

            //console.log(hoverSprites[hoverSprites.length-1]);
            return hoverSprites[hoverSprites.length-1];
        }

    });

    return Sprite;

}, {
    requires: ['./cobject']
});