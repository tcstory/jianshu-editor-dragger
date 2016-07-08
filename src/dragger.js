import 'babel-polyfill';

function Dragger(opts) {
    if (typeof opts.classNameOfChildren === 'undefined' ||
        typeof opts.classNameOfContainer === 'undefined' ||
        typeof opts.noteHolder === 'undefined') {
        throw new Error('缺少参数');
    }
    this._children = document.getElementsByClassName(opts.classNameOfChildren);
    this._mirror_children = Array.from(this._children);
    this._mirror_children.forEach((item, index, original) => {
        item.dataset.drag = '0';
        item.dataset.mousedown = '0';
        item.addEventListener('mousedown', (ev) => {
            this._handle_item_mousedown(ev);
        });
    });
    if (typeof opts.callback !== 'function') {
        this._callback = function () {
        }
    } else {
        this._callback = opts.callback;
    }
    this._container = document.querySelector('.' + opts.classNameOfContainer);
    this._rect = {
        container: this._container.getBoundingClientRect()
    };
    this._max_scroll_height = this._container.scrollHeight;
    this._init();
    this._holder = new Holder(opts.noteHolder, this._container, this._children, this._callback);
}

Dragger.prototype.update = function () {
    this._mirror_children = Array.from(this._children);
    this._holder.update();
};

Dragger.prototype._init = function () {
    window.addEventListener('mouseup', () => {
        this._handle_item_mouseup();
    });
    window.addEventListener('mousemove', (ev) => {
        this._handle_item_mousemove(ev)
    });
};

Dragger.prototype._handle_item_mousedown = function (ev) {
    _reset_prop(this._mirror_children, 'mousedown', '0');
    ev.target.dataset.mousedown = '1';
    ev.target.dataset.deltay = ev.clientY - ev.target.getBoundingClientRect().top;
}

Dragger.prototype._handle_item_mousemove = function (ev) {
    let {target} = _get_target_item(this._mirror_children, 'mousedown', '1');
    if (target) {
        target.dataset.drag = '1';
        this._holder.insert();
        _auto_scroll(ev.clientY, this);
        let top = ev.clientY - this._rect.container.top - target.dataset.deltay + this._container.scrollTop;
        if (top < this._max_scroll_height && top >= 0) {
            target.style.top = top + 'px';
            target.style.position = 'absolute';
        }
    }
};

Dragger.prototype._handle_item_mouseup = function () {
    this._mirror_children = Array.from(this._children);
    let {target} = _get_target_item(this._mirror_children, 'mousedown', '1');
    if (target) {
        target.style.top = '';
        target.style.position = '';
    }
    this._holder.remove();
    _reset_prop(this._mirror_children, 'mousedown', '0');
    _reset_prop(this._mirror_children, 'drag', '0');
    _reset_prop(this._mirror_children, 'deltay', '0');
};

function Holder(holder, parent, items, callback) {
    this._holder = holder;
    this._parent = parent;
    this._items = items;
    this._mirror_items = Array.from(this._items);
    this._time_id = -1;
    this._interval = 150;
    this._pos = -1;
    this._callback = callback;
    this._half = parseFloat(getComputedStyle(this._items[0], null).height) / 2;
    this._update_pos();
}

Holder.prototype.update = function () {
    this._mirror_items = Array.from(this._items);
    this._mirror_items.forEach((item) => {
        item.dataset.half = item.offsetTop + this._half;
    });
};

Holder.prototype._update_pos = function () {
    this._mirror_items = Array.from(this._items);
    let result = [];
    setTimeout(() => {
        this._pos = -1;
        this._mirror_items.forEach((item, index) => {
            if (typeof item.dataset.order !== 'undefined') {
                result.push(item.dataset.order);
            }
            item.dataset.half = item.offsetTop + this._half;
            item.dataset.order = index;
        });
        this._callback(result);
    }, 0)
};

Holder.prototype.insert = function () {
    if (this._time_id === -1) {
        this._add_holder();
        this._time_id = setTimeout(() => {
            this._time_id = -1;
            if (_whether(this._mirror_items, 'drag', '1')) {
                this._add_holder();
            }
        }, this._interval);
    }
};

Holder.prototype.remove = function () {
    let {target} = _get_target_item(this._mirror_items, 'drag', '1');
    if (target !== null) {
        this._parent.removeChild(this._holder);
        this._parent.insertBefore(target, this._mirror_items[this._pos]);
        this._update_pos();
    }
};

Holder.prototype._add_holder = function () {
    let {target} = _get_target_item(this._mirror_items, 'drag', '1');
    let i = 0;
    let len = this._mirror_items.length;
    for (; i < len; i++) {
        if (target.offsetTop < this._mirror_items[i].dataset.half) {
            this._parent.insertBefore(this._holder, this._mirror_items[i]);
            this._pos = i;
            break;
        }
    }
    if (i === len) {
        this._parent.appendChild(this._holder);
        this._pos = len;
    }
};


function _auto_scroll(clientY, self) {
    if (clientY < (self._rect.container.top + 10)) {
        self._container.scrollTop -= 20;
    } else if (clientY > (self._rect.container.bottom - 10)) {
        self._container.scrollTop += 20;
    }
}

function _reset_prop(items, prop, val) {
    items.forEach((item) => {
        item.dataset[prop] = val;
    });
}

function _get_target_item(items, prop, val) {
    let target = null;
    let i = 0, len = items.length;
    for (; i < len; i++) {
        if (items[i].dataset[prop] === val) {
            target = items[i];
            break;
        }
    }
    return {target, index: i};
}

function _whether(items, prop, val) {
    let flag = false;
    for (let i = 0, len = items.length; i < len; i++) {
        if (items[i].dataset[prop] === val) {
            flag = true;
            break;
        }
    }
    return flag;
}

export default Dragger;