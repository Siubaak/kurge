(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Kurge = factory());
}(this, function () { 'use strict';

  var _toString = Object.prototype.toString;
  var is = {
      undefined: function (val) { return _toString.call(val) === '[object Undefined]'; },
      null: function (val) { return _toString.call(val) === '[object Null]'; },
      number: function (val) { return _toString.call(val) === '[object Number]'; },
      string: function (val) { return _toString.call(val) === '[object String]'; },
      boolean: function (val) { return _toString.call(val) === '[object Boolean]'; },
      symbol: function (val) { return _toString.call(val) === '[object Symbol]'; },
      regexp: function (val) { return _toString.call(val) === '[object RegExp]'; },
      object: function (val) { return _toString.call(val) === '[object Object]'; },
      array: function (val) { return _toString.call(val) === '[object Array]'; },
      function: function (val) { return _toString.call(val) === '[object Function]'; }
  };
  var _hasOwn = Object.prototype.hasOwnProperty;
  function hasOwn(object, property) {
      return _hasOwn.call(object, property);
  }
  function delArrItem(arr, item) {
      if (arr.length) {
          var index = arr.indexOf(item);
          if (index > -1) {
              return arr.splice(index, 1);
          }
      }
  }
  var nextTick = requestAnimationFrame;
  function assign(target, object) {
      for (var key in object) {
          if (hasOwn(object, key)) {
              target[key] = object[key];
          }
      }
      return target;
  }

  var DATA_ID = 'data-kutid';
  var PROXY_TARGET = Math.random().toString(36).substring(2);
  var RESERVED_PROPS = { key: true, ref: true };
  var CUT_ON_REGEX = /^on/;
  var eventHandlers = Object.keys(window || {}).filter(function (key) { return CUT_ON_REGEX.test(key); });
  var SUPPORTED_EVENTS = eventHandlers.map(function (key) { return key.replace(CUT_ON_REGEX, ''); });
  var SUPPORTED_LISTENERS = {};
  eventHandlers.forEach(function (listener) { return SUPPORTED_LISTENERS[listener] = true; });

  var regex = /[:]\w+$/;
  function getParentId(childId) {
      return regex.test(childId) && childId.replace(regex, '');
  }
  function getNode(id) {
      return document.querySelector("[" + DATA_ID + "=\"" + id + "\"]");
  }
  function createNode(markup) {
      if (markup === '') {
          return document.createTextNode('');
      }
      else {
          var node = document.createElement('div');
          node.innerHTML = markup;
          return node.firstChild;
      }
  }
  function getClassString(className) {
      var markup = '';
      if (className == null) ;
      else if (typeof className === 'object') {
          markup +=
              Object.keys(className)
                  .filter(function (cls) { return className[cls]; })
                  .join(' ');
      }
      else if (Array.isArray(className)) {
          markup += className.join(' ');
      }
      else {
          markup += className.toString();
      }
      return markup.trim();
  }
  function getStyleString(style) {
      var markup = '';
      if (style == null) ;
      else if (typeof style === 'object') {
          for (var key in style) {
              if (Object.hasOwnProperty.call(style, key)) {
                  markup += key.replace(/[A-Z]/g, function (letter) { return "-" + letter.toLowerCase(); }) + (": " + style[key] + "; ");
              }
          }
      }
      else {
          markup += style.toString();
      }
      return markup.trim();
  }

  var TextInstance = (function () {
      function TextInstance(element) {
          this.element = '' + element;
      }
      Object.defineProperty(TextInstance.prototype, "key", {
          get: function () {
              return this.index != null
                  ? '' + this.index
                  : null;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(TextInstance.prototype, "node", {
          get: function () {
              return getNode(this.id);
          },
          enumerable: true,
          configurable: true
      });
      TextInstance.prototype.mount = function (id) {
          this.id = id;
          return "<span " + DATA_ID + "=\"" + id + "\" >" + this.element + "</span>";
      };
      TextInstance.prototype.same = function (nextElement) {
          return is.number(nextElement) || is.string(nextElement);
      };
      TextInstance.prototype.update = function (nextElement) {
          nextElement = is.undefined(nextElement) || is.null(nextElement)
              ? this.element
              : '' + nextElement;
          if (this.element !== nextElement) {
              this.element = nextElement;
              this.node.innerText = this.element;
          }
      };
      TextInstance.prototype.unmount = function () {
          this.node.remove();
          delete this.id;
          delete this.index;
          delete this.element;
      };
      return TextInstance;
  }());

  var Heap = (function () {
      function Heap(compare) {
          this.arr = [];
          this.compare = compare;
      }
      Object.defineProperty(Heap.prototype, "length", {
          get: function () {
              return this.arr.length;
          },
          enumerable: true,
          configurable: true
      });
      Heap.prototype.push = function (item) {
          this.arr.push(item);
          this.promote(this.arr.length - 1);
      };
      Heap.prototype.shift = function () {
          var m;
          if (this.arr.length > 1) {
              m = this.arr[0];
              this.arr[0] = this.arr.pop();
              this.heapify(0);
          }
          else {
              m = this.arr.pop();
          }
          return m;
      };
      Heap.prototype.heapify = function (i) {
          var _a;
          var l = this.left(i);
          var r = this.right(i);
          var m = i;
          if (this.arr[l] && this.compare(this.arr[l], this.arr[i])) {
              m = l;
          }
          if (this.arr[r] && this.compare(this.arr[r], this.arr[i])) {
              m = r;
          }
          if (m !== i) {
              _a = [this.arr[m], this.arr[i]], this.arr[i] = _a[0], this.arr[m] = _a[1];
              this.heapify(m);
          }
      };
      Heap.prototype.promote = function (i) {
          var _a;
          var p = this.parent(i);
          while (this.arr[p] && this.compare(this.arr[p], this.arr[i])) {
              _a = [this.arr[p], this.arr[i]], this.arr[i] = _a[0], this.arr[p] = _a[1];
              i = p;
              p = this.parent(i);
          }
      };
      Heap.prototype.parent = function (i) {
          return Math.floor((i + 1) / 2) - 1;
      };
      Heap.prototype.left = function (i) {
          return 2 * (i + 1) - 1;
      };
      Heap.prototype.right = function (i) {
          return 2 * (i + 1);
      };
      return Heap;
  }());

  var EffectBus = (function () {
      function EffectBus() {
          this.listeners = {};
      }
      EffectBus.prototype.on = function (event, callback) {
          if (!this.listeners[event]) {
              this.listeners[event] = [];
          }
          this.listeners[event].push(callback);
      };
      EffectBus.prototype.emit = function (event, reverse) {
          if (reverse === void 0) { reverse = false; }
          if (this.listeners[event]) {
              if (reverse) {
                  for (var i = this.listeners[event].length - 1; i > -1; i--) {
                      this.listeners[event][i]();
                  }
              }
              else {
                  for (var i = 0; i < this.listeners[event].length; i++) {
                      this.listeners[event][i]();
                  }
              }
          }
      };
      EffectBus.prototype.clean = function (event) {
          delete this.listeners[event];
      };
      return EffectBus;
  }());
  var bus = new EffectBus();

  var wid = 0;
  var Watcher = (function () {
      function Watcher(instance) {
          this.id = wid++;
          this.depIds = {};
          this.newDepIds = {};
          this.list = [];
          this.newList = [];
          this.instance = instance;
      }
      Watcher.prototype.depend = function (dep) {
          var id = dep.id;
          if (!this.newDepIds[id]) {
              this.newDepIds[id] = true;
              this.newList.push(dep);
              if (!this.depIds[id]) {
                  dep.subscribe(this);
              }
          }
      };
      Watcher.prototype.clean = function () {
          var _a, _b;
          var i = this.list.length;
          while (i--) {
              var dep = this.list[i];
              if (!this.newDepIds[dep.id]) {
                  dep.unsubscribe(this);
              }
          }
          _a = [this.newDepIds, this.depIds], this.depIds = _a[0], this.newDepIds = _a[1];
          this.newDepIds = {};
          _b = [this.newList, this.list], this.list = _b[0], this.newList = _b[1];
          this.newList.length = 0;
      };
      Watcher.prototype.update = function () {
          reconciler.enqueueUpdate(this.instance);
      };
      return Watcher;
  }());

  var uid = 0;
  var Dependency = (function () {
      function Dependency() {
          this.id = uid++;
          this.list = [];
      }
      Dependency.prototype.subscribe = function (watcher) {
          this.list.push(watcher);
      };
      Dependency.prototype.unsubscribe = function (watcher) {
          delArrItem(this.list, watcher);
      };
      Dependency.prototype.collect = function () {
          if (Dependency.target) {
              Dependency.target.depend(this);
          }
      };
      Dependency.prototype.notify = function () {
          for (var i = 0; i < this.list.length; i++) {
              this.list[i].update();
          }
      };
      Dependency.target = null;
      return Dependency;
  }());
  var targetStack = [];
  function pushTarget(target) {
      targetStack.push(target);
      Dependency.target = target;
  }
  function popTarget() {
      targetStack.pop();
      Dependency.target = targetStack[targetStack.length - 1];
  }

  function observe(data) {
      if (!is.object(data) && !is.array(data)) {
          throw new Error('observed data must be object or array');
      }
      var dep = new Dependency();
      return new Proxy(data, {
          get: function (target, property, receiver) {
              if (property === PROXY_TARGET) {
                  return target;
              }
              if (hasOwn(target, property)) {
                  if (Dependency.target) {
                      dep.collect();
                  }
              }
              return Reflect.get(target, property, receiver);
          },
          set: function (target, property, value, receiver) {
              if (hasOwn(target, property) || is.undefined(target[property])) {
                  if (value !== target[property]) {
                      dep.notify();
                  }
              }
              return Reflect.set(target, property, value, receiver);
          },
          deleteProperty: function (target, property) {
              if (hasOwn(target, property)) {
                  dep.notify();
              }
              return Reflect.deleteProperty(target, property);
          }
      });
  }

  var context = { store: null };
  function useContext(ctx) {
      if (Dependency.target) {
          throw new Error('please invoke useContext at top level outside all components');
      }
      else if (context.store) {
          assign(context.store[PROXY_TARGET], ctx);
      }
      else {
          context.store = observe(ctx);
      }
  }

  var ComponentInstance = (function () {
      function ComponentInstance(element) {
          this.state = null;
          this.refs = {};
          this.watcher = new Watcher(this);
          this.element = element;
          this.component = this.element.type;
      }
      Object.defineProperty(ComponentInstance.prototype, "key", {
          get: function () {
              return this.element && this.element.key != null
                  ? 'k_' + this.element.key
                  : this.index != null
                      ? '' + this.index
                      : null;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(ComponentInstance.prototype, "node", {
          get: function () {
              return getNode(this.id);
          },
          enumerable: true,
          configurable: true
      });
      ComponentInstance.prototype.mount = function (id) {
          pushTarget(this.watcher);
          this.renderedInstance = instantiate(this.component(this.element.props, context.store));
          var markup = this.renderedInstance.mount(this.id = id);
          popTarget();
          this.watcher.clean();
          return markup;
      };
      ComponentInstance.prototype.same = function (nextElement) {
          return is.object(nextElement)
              && nextElement.type === this.element.type
              && nextElement.key === this.element.key;
      };
      ComponentInstance.prototype.update = function (nextElement) {
          nextElement = nextElement == null ? this.element : nextElement;
          pushTarget(this.watcher);
          reconciler.enqueueUpdate(this.renderedInstance, this.component(nextElement.props, context.store));
          popTarget();
          this.watcher.clean();
          this.element = nextElement;
      };
      ComponentInstance.prototype.unmount = function () {
          bus.emit("before-unmount:" + this.id);
          this.renderedInstance.unmount();
          this.watcher.clean();
          delete this.index;
          delete this.state;
          delete this.refs;
          delete this.watcher;
          delete this.element;
          delete this.component;
          delete this.renderedInstance;
          bus.emit("unmounted:" + this.id);
          bus.clean("before-update:" + this.id);
          bus.clean("updated:" + this.id);
          bus.clean("before-unmount:" + this.id);
          bus.clean("unmounted:" + this.id);
          delete this.id;
      };
      return ComponentInstance;
  }());

  var DirtyInstanceSet = (function () {
      function DirtyInstanceSet() {
          this.map = {};
          this.arr = new Heap(function (contrast, self) {
              return contrast.split(':').length > self.split(':').length;
          });
      }
      Object.defineProperty(DirtyInstanceSet.prototype, "length", {
          get: function () {
              return this.arr.length;
          },
          enumerable: true,
          configurable: true
      });
      DirtyInstanceSet.prototype.push = function (dirtyInstance) {
          var id = dirtyInstance.instance.id;
          if (!this.map[id]) {
              this.arr.push(id);
          }
          this.map[id] = dirtyInstance;
      };
      DirtyInstanceSet.prototype.shift = function () {
          var id = this.arr.shift();
          var dirtyInstance = this.map[id];
          delete this.map[id];
          return dirtyInstance;
      };
      return DirtyInstanceSet;
  }());
  var Reconciler = (function () {
      function Reconciler() {
          this.dirtyInstanceSet = new DirtyInstanceSet();
          this.isBatchUpdating = false;
      }
      Reconciler.prototype.enqueueUpdate = function (instance, element) {
          if (element === void 0) { element = null; }
          this.dirtyInstanceSet.push({ instance: instance, element: element });
          if (!this.isBatchUpdating) {
              this.runBatchUpdate();
          }
      };
      Reconciler.prototype.runBatchUpdate = function () {
          var _this = this;
          this.isBatchUpdating = true;
          nextTick(function () {
              var _loop_1 = function () {
                  var _a = _this.dirtyInstanceSet.shift(), instance = _a.instance, element = _a.element;
                  if (instance.id) {
                      if (instance instanceof ComponentInstance) {
                          bus.emit("before-update:" + instance.id);
                      }
                      instance.update(element);
                      if (instance instanceof ComponentInstance) {
                          bus.on('updated', function () { return bus.emit("updated:" + instance.id); });
                      }
                  }
              };
              while (_this.dirtyInstanceSet.length) {
                  _loop_1();
              }
              _this.isBatchUpdating = false;
              bus.emit('updated', true);
              bus.clean('updated');
          });
      };
      return Reconciler;
  }());
  var reconciler = new Reconciler();

  function diff(prevInstances, nextChildren) {
      var prevInstanceMap = {};
      prevInstances.forEach(function (inst) { return prevInstanceMap[inst.key] = inst; });
      var nextInstances = [];
      nextChildren.forEach(function (nextChild, index) {
          var key = nextChild.key != null
              ? 'k_' + nextChild.key
              : '' + index;
          var prevInstance = prevInstanceMap[key];
          if (prevInstance && prevInstance.same(nextChild)) {
              if (!(prevInstance instanceof ComponentInstance)) {
                  reconciler.enqueueUpdate(prevInstance, nextChild);
              }
              nextInstances.push(prevInstance);
          }
          else {
              var nextInstance = instantiate(nextChild);
              nextInstances.push(nextInstance);
          }
      });
      var forwardOps = [];
      var backwardOps = [];
      var lastForwardIndex = -1;
      var lastBackwardIndex = prevInstances.length;
      for (var index = 0; index < nextInstances.length; ++index) {
          var forwardNextInstance = nextInstances[index];
          var forwardPrevInstance = prevInstanceMap[forwardNextInstance.key];
          if (forwardPrevInstance === forwardNextInstance) {
              if (forwardPrevInstance.index < lastForwardIndex) {
                  forwardOps.push({
                      type: 'move',
                      inst: forwardPrevInstance,
                      index: lastForwardIndex
                  });
              }
              lastForwardIndex = Math.max(forwardPrevInstance.index, lastForwardIndex);
          }
          else {
              if (forwardPrevInstance) {
                  forwardOps.push({
                      type: 'remove',
                      inst: forwardPrevInstance
                  });
              }
              forwardOps.push({
                  type: 'insert',
                  inst: forwardNextInstance,
                  index: lastForwardIndex
              });
          }
          var backwardNextInstance = nextInstances[nextInstances.length - index - 1];
          var backwardPrevInstance = prevInstanceMap[backwardNextInstance.key];
          if (backwardPrevInstance === backwardNextInstance) {
              if (backwardPrevInstance.index > lastBackwardIndex) {
                  backwardOps.push({
                      type: 'move',
                      inst: backwardPrevInstance,
                      index: lastBackwardIndex
                  });
              }
              lastBackwardIndex = Math.min(backwardPrevInstance.index, lastBackwardIndex);
          }
          else {
              if (backwardPrevInstance) {
                  backwardOps.push({
                      type: 'remove',
                      inst: backwardPrevInstance
                  });
              }
              backwardOps.push({
                  type: 'insert',
                  inst: backwardNextInstance,
                  index: lastBackwardIndex
              });
          }
      }
      var nextInstanceMap = {};
      nextInstances.forEach(function (inst) {
          if (nextInstanceMap[inst.key]) {
              console.warn('Find duplicate keys in a list. '
                  + 'Please offer unique keys for list items '
                  + 'or rendering this list may meet some error');
          }
          nextInstanceMap[inst.key] = inst;
      });
      for (var key in prevInstanceMap) {
          if (!nextInstanceMap[key]) {
              forwardOps.push({
                  type: 'remove',
                  inst: prevInstanceMap[key]
              });
              backwardOps.push({
                  type: 'remove',
                  inst: prevInstanceMap[key]
              });
          }
      }
      nextInstances.forEach(function (nextInstance, index) { return nextInstance.index = index; });
      prevInstances.length = 0;
      prevInstances.push.apply(prevInstances, nextInstances);
      return forwardOps.length < backwardOps.length
          ? { ops: forwardOps, dir: 'forward' }
          : { ops: backwardOps, dir: 'backward' };
  }
  function patch(parentId, patches) {
      var container = getNode(parentId);
      var ops = patches.ops, dir = patches.dir;
      var insertNum = 0;
      ops.forEach(function (op) {
          var beforeIndex = dir === 'forward' ? op.index + 1 + insertNum : op.index;
          if (op.type === 'remove') {
              op.inst.unmount();
          }
          else {
              if (op.type === 'insert') {
                  ++insertNum;
                  var markup = op.inst.mount(parentId + ":" + op.inst.key);
                  var node = createNode(markup);
                  var beforeNode = container.children[beforeIndex];
                  container.insertBefore(node, beforeNode);
                  bus.emit('mounted');
                  bus.clean('mounted');
              }
              else {
                  var node = op.inst.node;
                  var beforeNode = container.children[beforeIndex];
                  container.insertBefore(node, beforeNode);
              }
          }
      });
  }

  var EventListenerSet = (function () {
      function EventListenerSet() {
          var _this = this;
          this._eventListeners = {};
          if (document) {
              SUPPORTED_EVENTS.forEach(function (event) {
                  document.addEventListener(event, function (e) {
                      var id = e.target.getAttribute
                          && e.target.getAttribute(DATA_ID);
                      while (id) {
                          var eventListener = _this._eventListeners[id] && _this._eventListeners[id][event];
                          if (eventListener) {
                              eventListener(e);
                          }
                          id = getParentId(id);
                      }
                  });
              });
          }
      }
      EventListenerSet.prototype.get = function (id, event) {
          return this._eventListeners[id][event];
      };
      EventListenerSet.prototype.set = function (id, event, eventListener) {
          if (!this._eventListeners[id]) {
              this._eventListeners[id] = {};
          }
          this._eventListeners[id][event] = eventListener;
      };
      EventListenerSet.prototype.remove = function (id, event) {
          if (this._eventListeners[id]) {
              delete this._eventListeners[id][event];
          }
      };
      EventListenerSet.prototype.clean = function (id) {
          delete this._eventListeners[id];
      };
      return EventListenerSet;
  }());
  var eventListenerSet = new EventListenerSet();

  var DOMInstance = (function () {
      function DOMInstance(element) {
          this.element = element;
      }
      Object.defineProperty(DOMInstance.prototype, "key", {
          get: function () {
              return this.element && this.element.key != null
                  ? 'k_' + this.element.key
                  : this.index != null
                      ? '' + this.index
                      : null;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(DOMInstance.prototype, "node", {
          get: function () {
              return getNode(this.id);
          },
          enumerable: true,
          configurable: true
      });
      DOMInstance.prototype.mount = function (id) {
          var _this = this;
          this.id = id;
          var markup = "<" + this.element.type + " " + DATA_ID + "=\"" + id + "\" ";
          if (this.element.key != null) {
              markup += "key=\"" + this.element.key + "\" ";
          }
          var props = this.element.props;
          for (var prop in props) {
              if (prop === 'children') {
                  continue;
              }
              else if (prop === 'className') {
                  markup += "class=\"" + getClassString(props.className) + "\" ";
              }
              else if (prop === 'style') {
                  markup += "style=\"" + getStyleString(props.style) + "\" ";
              }
              else if (SUPPORTED_LISTENERS[prop.toLowerCase()]
                  && is.function(props[prop])) {
                  eventListenerSet.set(id, prop.toLowerCase().replace(CUT_ON_REGEX, ''), props[prop]);
              }
              else {
                  markup += prop + "=\"" + props[prop] + "\" ";
              }
          }
          markup += '>';
          this.childInstances = [];
          this.element.props.children.forEach(function (child, index) {
              var instance = instantiate(child);
              instance.index = index;
              markup += instance.mount(id + ":" + instance.key);
              _this.childInstances.push(instance);
          });
          markup += "</" + this.element.type + ">";
          if (is.string(this.element.ref) && Dependency.target) {
              var compInst_1 = Dependency.target.instance;
              bus.on('mounted:refs', function () { return compInst_1.refs[_this.element.ref] = _this.node; });
          }
          return markup;
      };
      DOMInstance.prototype.same = function (nextElement) {
          return is.object(nextElement)
              && nextElement.type === this.element.type
              && nextElement.key === this.element.key;
      };
      DOMInstance.prototype.update = function (nextElement) {
          nextElement = nextElement == null
              ? this.element
              : nextElement;
          var node = this.node;
          var prevProps = this.element.props;
          var nextProps = nextElement.props;
          for (var prop in nextProps) {
              if (prop === 'children') {
                  continue;
              }
              else if (prop === 'className') {
                  var nextClassName = getClassString(nextProps.className);
                  if (node.className !== nextClassName) {
                      node.className = nextClassName;
                  }
              }
              else if (prop === 'style') {
                  var nextStyle = getStyleString(nextProps.style);
                  if (node.style.cssText !== nextStyle) {
                      node.style.cssText = nextStyle;
                  }
              }
              else if (prop === 'value') {
                  var nextValue = nextProps.value;
                  if (node.value !== nextValue) {
                      node.value = nextValue;
                  }
              }
              else if (SUPPORTED_LISTENERS[prop.toLowerCase()] && is.function(nextProps[prop])) {
                  var event_1 = prop.toLowerCase().replace(CUT_ON_REGEX, '');
                  var prevEventListener = eventListenerSet.get(this.id, event_1);
                  var nextEventListener = nextProps[prop];
                  if (prevEventListener !== nextEventListener) {
                      eventListenerSet.set(this.id, event_1, nextEventListener);
                  }
              }
              else {
                  var nextAttr = nextProps[prop];
                  if (node.getAttribute(prop) !== nextAttr) {
                      node.setAttribute(prop, nextAttr);
                  }
              }
          }
          for (var prop in prevProps) {
              if (is.undefined(nextProps[prop]) || is.null(nextProps[prop])) {
                  if (SUPPORTED_LISTENERS[prop.toLowerCase()] && is.function(nextProps[prop])) {
                      eventListenerSet.remove(this.id, prop.toLowerCase().replace(CUT_ON_REGEX, ''));
                  }
                  else {
                      node.removeAttribute(prop !== 'className' ? prop : 'class');
                  }
              }
          }
          var prevChildInstances = this.childInstances;
          var nextChildren = nextElement.props.children;
          if (prevChildInstances.length === 1
              && nextChildren.length === 1
              && prevChildInstances[0].same(nextChildren[0])) {
              reconciler.enqueueUpdate(prevChildInstances[0], nextChildren[0]);
          }
          else {
              var patches = diff(prevChildInstances, nextChildren);
              patch(this.id, patches);
          }
          this.element = nextElement;
      };
      DOMInstance.prototype.unmount = function () {
          eventListenerSet.clean(this.id);
          this.childInstances.forEach(function (child) { return child.unmount(); });
          this.node.remove();
          delete this.id;
          delete this.index;
          delete this.element;
          delete this.childInstances;
      };
      return DOMInstance;
  }());

  function createElement(type, config) {
      var children = [];
      for (var _i = 2; _i < arguments.length; _i++) {
          children[_i - 2] = arguments[_i];
      }
      children = children.length ? [].concat.apply([], children) : [''];
      var props = { children: children };
      var key = null;
      var ref = null;
      if (config) {
          if (config.key != null) {
              key = ('' + config.key).replace(/:/g, '_');
          }
          if (config.ref && is.string(config.ref)) {
              ref = config.ref;
          }
          for (var prop in config) {
              if (hasOwn(config, prop) && !RESERVED_PROPS[prop]) {
                  props[prop] = config[prop];
              }
          }
      }
      return { type: type, key: key, ref: ref, props: props };
  }

  function instantiate(element) {
      var instance = null;
      if (is.undefined(element)
          || is.null(element)
          || is.number(element)
          || is.string(element)) {
          instance = new TextInstance(element);
      }
      else if (is.string(element.type)) {
          instance = new DOMInstance(element);
      }
      else if (is.function(element.type)) {
          instance = new ComponentInstance(element);
      }
      else {
          throw new Error('illegal VDOM node type, please do not return array/null/undefined/etc in an app');
      }
      return instance;
  }
  function render(vdom, container) {
      if (!is.object(vdom)) {
          throw new Error('please offer a legal VDOM node');
      }
      if (!container) {
          throw new Error('a root DOM node is needed to mount the app');
      }
      var instance = null;
      if (is.string(vdom.type)) {
          instance = instantiate(createElement(function () { return vdom; }));
      }
      else {
          instance = instantiate(vdom);
      }
      var markup = instance.mount('kg');
      container.innerHTML = markup;
      bus.emit('mounted:refs');
      bus.emit('mounted');
      bus.clean('mounted:refs');
      bus.clean('mounted');
  }

  function useState(state) {
      if (!Dependency.target) {
          throw new Error('please invoke useState at top level in a component');
      }
      else {
          var instance = Dependency.target.instance;
          if (!instance.id) {
              if (instance.state) {
                  assign(instance.state[PROXY_TARGET], state);
              }
              else {
                  instance.state = observe(state);
              }
          }
          return instance.state;
      }
  }

  function useRefs() {
      if (!Dependency.target) {
          throw new Error('please invoke useRefs at top level in a component');
      }
      else {
          return Dependency.target.instance.refs;
      }
  }

  function onBeforeMount(callback) {
      if (!Dependency.target) {
          throw new Error('please invoke onBeforeMount at top level in a component');
      }
      else {
          var instance = Dependency.target.instance;
          if (!instance.id) {
              callback();
          }
      }
  }

  function onMounted(callback) {
      if (!Dependency.target) {
          throw new Error('please invoke onMounted at top level in a component');
      }
      else {
          var instance = Dependency.target.instance;
          if (!instance.id) {
              bus.on('mounted', callback);
          }
      }
  }

  function onBeforeUpdate(callback) {
      if (!Dependency.target) {
          throw new Error('please invoke onBeforeUpdate at top level in a component');
      }
      else {
          var instance_1 = Dependency.target.instance;
          if (!instance_1.id) {
              bus.on('mounted', function () { return bus.on("before-update:" + instance_1.id, callback); });
          }
      }
  }

  function onUpdated(callback) {
      if (!Dependency.target) {
          throw new Error('please invoke onUpdated at top level in a component');
      }
      else {
          var instance_1 = Dependency.target.instance;
          if (!instance_1.id) {
              bus.on('mounted', function () { return bus.on("updated:" + instance_1.id, callback); });
          }
      }
  }

  function onBeforeUnMount(callback) {
      if (!Dependency.target) {
          throw new Error('please invoke onBeforeUnMount at top level in a component');
      }
      else {
          var instance_1 = Dependency.target.instance;
          if (!instance_1.id) {
              bus.on('mounted', function () { return bus.on("before-unmount:" + instance_1.id, callback); });
          }
      }
  }

  function onUnMounted(callback) {
      if (!Dependency.target) {
          throw new Error('please invoke onUnMounted at top level in a component');
      }
      else {
          var instance_1 = Dependency.target.instance;
          if (!instance_1.id) {
              bus.on('mounted', function () { return bus.on("unmounted:" + instance_1.id, callback); });
          }
      }
  }

  var Kurge = {
      render: render,
      createElement: createElement,
      useState: useState,
      useContext: useContext,
      useRefs: useRefs,
      onBeforeMount: onBeforeMount,
      onMounted: onMounted,
      onBeforeUpdate: onBeforeUpdate,
      onUpdated: onUpdated,
      onBeforeUnMount: onBeforeUnMount,
      onUnMounted: onUnMounted
  };

  return Kurge;

}));
