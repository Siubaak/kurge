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
  function requestIdleCallbackPolyfill(callback) {
      var start = Date.now();
      return requestAnimationFrame(function () {
          callback({
              timeRemaining: function () { return Math.max(0, 50 - (Date.now() - start)); }
          });
      });
  }
  var nextTick = window.requestIdleCallback || requestIdleCallbackPolyfill;
  function getProto(object) {
      return Object.getPrototypeOf(object) || object.__proto__ || null;
  }
  function setProto(object, proto) {
      if (Object.setPrototypeOf) {
          Object.setPrototypeOf(object, proto);
          return true;
      }
      else if (object.__proto__) {
          object.__proto__ = proto;
          return true;
      }
      else {
          return false;
      }
  }

  var DATA_ID = 'data-kgid';
  var DEP_SYMBOL = Math.random().toString(36).substr(2);
  var RESERVED_PROPS = { key: true, ref: true };
  var eventHandlers = Object.keys(window || {}).filter(function (key) { return /^on/.test(key); });
  var SUPPORTED_LISTENERS = {};
  eventHandlers.forEach(function (listener) { return SUPPORTED_LISTENERS[listener] = true; });

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
          markup += Object.keys(className).filter(function (cls) { return className[cls]; }).join(' ');
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

  var Emitter = (function () {
      function Emitter() {
          this.listeners = {};
      }
      Emitter.prototype.on = function (event, callback) {
          if (!this.listeners[event]) {
              this.listeners[event] = [];
          }
          this.listeners[event].push(callback);
      };
      Emitter.prototype.emit = function (event) {
          if (this.listeners[event]) {
              for (var i = 0; i < this.listeners[event].length; i++) {
                  this.listeners[event][i]();
              }
              this.clean(event);
          }
      };
      Emitter.prototype.clean = function (event) {
          delete this.listeners[event];
      };
      return Emitter;
  }());
  var emitter = new Emitter();

  var TextInstance = (function () {
      function TextInstance(element) {
          this.node = null;
          this.element = '' + element;
      }
      Object.defineProperty(TextInstance.prototype, "key", {
          get: function () {
              return this.index != null ? '' + this.index : null;
          },
          enumerable: true,
          configurable: true
      });
      TextInstance.prototype.mount = function (id) {
          var _this = this;
          this.id = id;
          emitter.on('loaded', function () {
              var wrapper = getNode(_this.id);
              if (wrapper) {
                  _this.node = wrapper.firstChild;
                  if (!_this.node) {
                      _this.node = createNode('');
                  }
                  wrapper.parentNode.insertBefore(_this.node, wrapper);
                  wrapper.remove();
              }
          });
          return "<span " + DATA_ID + "=\"" + id + "\" >" + this.element + "</span>";
      };
      TextInstance.prototype.same = function (nextElement) {
          return is.number(nextElement) || is.string(nextElement);
      };
      TextInstance.prototype.update = function (nextElement) {
          if (!this.node)
              return;
          nextElement = nextElement == null ? this.element : '' + nextElement;
          if (this.element !== nextElement) {
              this.element = nextElement;
              this.node.textContent = this.element;
          }
      };
      TextInstance.prototype.unmount = function () {
          if (this.node)
              this.node.remove();
          delete this.id;
          delete this.node;
          delete this.index;
          delete this.element;
      };
      return TextInstance;
  }());

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
          reconciler.enqueueSetState(this.instance);
      };
      return Watcher;
  }());

  var uid = 0;
  var Dependency = (function () {
      function Dependency(specificWatcher) {
          if (specificWatcher === void 0) { specificWatcher = null; }
          this.id = uid++;
          this.list = [];
          this.specificWatcher = specificWatcher;
      }
      Dependency.prototype.subscribe = function (watcher) {
          this.list.push(watcher);
      };
      Dependency.prototype.unsubscribe = function (watcher) {
          delArrItem(this.list, watcher);
      };
      Dependency.prototype.collect = function () {
          if (Dependency.target &&
              (!this.specificWatcher ||
                  this.specificWatcher && this.specificWatcher === Dependency.target)) {
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

  var ComponentInstance = (function () {
      function ComponentInstance(element) {
          this.refs = {};
          this.watcher = new Watcher(this);
          this.guards = [];
          this.guardLeft = 0;
          this.states = [];
          this.stateId = 0;
          this.element = element;
          this.component = this.element.type;
      }
      Object.defineProperty(ComponentInstance.prototype, "key", {
          get: function () {
              return this.element && this.element.key != null
                  ? 'k_' + this.element.key
                  : this.index != null ? '' + this.index : null;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(ComponentInstance.prototype, "node", {
          get: function () {
              return this.renderedInstance ? this.renderedInstance.node : null;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(ComponentInstance.prototype, "currentState", {
          get: function () {
              return this.states[this.stateId++];
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(ComponentInstance.prototype, "prevGuard", {
          get: function () {
              if (this.guardLeft) {
                  this.guardLeft--;
                  return this.guards.shift();
              }
          },
          enumerable: true,
          configurable: true
      });
      ComponentInstance.prototype.mount = function (id) {
          pushTarget(this.watcher);
          this.renderedInstance = instantiate(this.component(this.element.props));
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
          if (!this.node)
              return;
          nextElement = nextElement == null ? this.element : nextElement;
          var shouldUpdate = true;
          if (is.function(this.component.shouldUpdate)) {
              shouldUpdate = this.component.shouldUpdate(this.element.props, nextElement.props);
          }
          if (shouldUpdate) {
              this.stateId = 0;
              this.guardLeft = this.guards.length;
              pushTarget(this.watcher);
              reconciler.enqueueUpdate(this.renderedInstance, this.component(nextElement.props));
              popTarget();
              this.watcher.clean();
          }
          this.element = nextElement;
      };
      ComponentInstance.prototype.unmount = function () {
          emitter.emit("unmount:" + this.id);
          this.renderedInstance.unmount();
          this.watcher.clean();
          delete this.id;
          delete this.index;
          delete this.guards;
          delete this.guardLeft;
          delete this.states;
          delete this.stateId;
          delete this.refs;
          delete this.watcher;
          delete this.element;
          delete this.component;
          delete this.renderedInstance;
      };
      return ComponentInstance;
  }());

  var DirtyList = (function () {
      function DirtyList() {
          this.map = {};
          this.arr = [];
      }
      Object.defineProperty(DirtyList.prototype, "first", {
          get: function () {
              return this.map[this.arr[0]];
          },
          enumerable: true,
          configurable: true
      });
      DirtyList.prototype.push = function (componentInst) {
          var id = componentInst.id;
          if (!this.map[id]) {
              this.arr.push(id);
          }
          this.map[id] = [{ instance: componentInst, element: null }];
      };
      DirtyList.prototype.shift = function () {
          delete this.map[this.arr.shift()];
      };
      return DirtyList;
  }());
  var Reconciler = (function () {
      function Reconciler() {
          this.dirtyList = new DirtyList();
          this.isBatchUpdating = false;
      }
      Reconciler.prototype.enqueueSetState = function (componentInst) {
          this.dirtyList.push(componentInst);
          if (!this.isBatchUpdating) {
              this.runBatchUpdate();
          }
      };
      Reconciler.prototype.enqueueUpdate = function (instance, element) {
          this.dirtyList.first.push({ instance: instance, element: element });
      };
      Reconciler.prototype.runBatchUpdate = function () {
          var _this = this;
          this.isBatchUpdating = true;
          var batchUpdate = function (deadline) {
              var _loop_1 = function () {
                  if (_this.dirtyList.first.length) {
                      var _a = _this.dirtyList.first.shift(), instance_1 = _a.instance, element = _a.element;
                      if (instance_1.id) {
                          instance_1.update(element);
                          if (instance_1 instanceof ComponentInstance) {
                              emitter.on('updated', function () {
                                  if (instance_1.node) {
                                      emitter.emit("updated:" + instance_1.id);
                                  }
                              });
                          }
                      }
                  }
                  else {
                      _this.dirtyList.shift();
                  }
              };
              while (deadline.timeRemaining() > 0 && _this.dirtyList.first) {
                  _loop_1();
              }
              if (_this.dirtyList.first) {
                  nextTick(batchUpdate);
              }
              else {
                  _this.isBatchUpdating = false;
              }
              emitter.emit('updated');
          };
          nextTick(batchUpdate);
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
              reconciler.enqueueUpdate(prevInstance, nextChild);
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
  function patch(parentInst, patches) {
      var container = parentInst.node;
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
                  var markup = op.inst.mount(parentInst.id + ":" + op.inst.key);
                  var node = createNode(markup);
                  var beforeNode = container.children[beforeIndex];
                  container.insertBefore(node, beforeNode);
                  emitter.emit('loaded');
                  emitter.emit('mounted');
              }
              else {
                  var node = op.inst.node;
                  var beforeNode = container.children[beforeIndex];
                  container.insertBefore(node, beforeNode);
              }
          }
      });
  }

  var DOMInstance = (function () {
      function DOMInstance(element) {
          this.node = null;
          this.element = element;
      }
      Object.defineProperty(DOMInstance.prototype, "key", {
          get: function () {
              return this.element && this.element.key != null
                  ? 'k_' + this.element.key
                  : this.index != null ? '' + this.index : null;
          },
          enumerable: true,
          configurable: true
      });
      DOMInstance.prototype.mount = function (id) {
          var _this = this;
          this.id = id;
          emitter.on('loaded', function () { return _this.node = getNode(_this.id); });
          var markup = "<" + this.element.type + " " + DATA_ID + "=\"" + id + "\" ";
          if (this.element.key != null) {
              markup += "key=\"" + this.element.key + "\" ";
          }
          var props = this.element.props;
          var _loop_1 = function (prop) {
              if (prop === 'children') {
                  return "continue";
              }
              else if (prop === 'className') {
                  markup += "class=\"" + getClassString(props.className) + "\" ";
              }
              else if (prop === 'style') {
                  markup += "style=\"" + getStyleString(props.style) + "\" ";
              }
              else if (SUPPORTED_LISTENERS[prop.toLowerCase()] && is.function(props[prop])) {
                  emitter.on('loaded', function () { return _this.node[prop.toLowerCase()] = props[prop]; });
              }
              else {
                  markup += prop + "=\"" + props[prop] + "\" ";
              }
          };
          for (var prop in props) {
              _loop_1(prop);
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
              emitter.on('loaded', function () { return compInst_1.refs[_this.element.ref] = _this.node; });
          }
          emitter.on('loaded', function () {
              if (_this.node) {
                  _this.node.removeAttribute(DATA_ID);
              }
          });
          return markup;
      };
      DOMInstance.prototype.same = function (nextElement) {
          return is.object(nextElement)
              && nextElement.type === this.element.type
              && nextElement.key === this.element.key;
      };
      DOMInstance.prototype.update = function (nextElement) {
          if (!this.node)
              return;
          nextElement = nextElement == null ? this.element : nextElement;
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
                  var nextEventListener = nextProps[prop];
                  if (this.node[prop.toLowerCase()] !== nextEventListener) {
                      this.node[prop.toLowerCase()] = nextEventListener;
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
                      delete this.node[prop.toLowerCase()];
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
              patch(this, diff(prevChildInstances, nextChildren));
          }
          this.element = nextElement;
      };
      DOMInstance.prototype.unmount = function () {
          this.childInstances.forEach(function (child) { return child.unmount(); });
          if (this.node)
              this.node.remove();
          delete this.id;
          delete this.node;
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
      var props = { children: [].concat.apply([], children) };
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
      if (Dependency.target) {
          throw new Error('please call render outside all components');
      }
      else if (!is.object(vdom)) {
          throw new Error('please offer a legal VDOM node');
      }
      else if (!container) {
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
      var node = createNode(markup);
      container.parentNode.insertBefore(node, container);
      container.remove();
      emitter.emit('loaded');
      emitter.emit('mounted');
  }

  var mutatedMethods = [
      'push',
      'pop',
      'shift',
      'unshift',
      'splice',
      'sort',
      'reverse'
  ];
  var ProxyPolyfill = (function () {
      function ProxyPolyfill(target, handler) {
          var isArray = is.array(target);
          var proxy = {};
          function getter(p) {
              if (isArray && mutatedMethods.indexOf(p) > -1) {
                  var origin_1 = handler.get(target, p, proxy);
                  return function () {
                      var args = [];
                      for (var _i = 0; _i < arguments.length; _i++) {
                          args[_i] = arguments[_i];
                      }
                      switch (p) {
                          case 'push':
                          case 'unshift':
                              for (var i = 0; i < args.length; i++) {
                                  if (is.object(args[i]) || is.array(args[i])) {
                                      args[i] = observe(args[i], handler.get(target, DEP_SYMBOL, proxy).specificWatcher);
                                  }
                                  var index = handler.get(target, 'length', proxy) + i;
                                  Object.defineProperty(proxy, index, {
                                      configurable: true,
                                      enumerable: true,
                                      get: getter.bind(target, index),
                                      set: setter.bind(target, index)
                                  });
                              }
                              break;
                          case 'pop':
                          case 'shift':
                              delete proxy[handler.get(target, 'length', proxy) - 1];
                              break;
                          case 'splice':
                              var remove = args[1];
                              for (var i = 2; i < args.length; i++) {
                                  if (is.object(args[i]) || is.array(args[i])) {
                                      args[i] = observe(args[i], handler.get(target, DEP_SYMBOL, proxy).specificWatcher);
                                  }
                              }
                              for (var i = 0; i < remove; i++) {
                                  delete proxy[handler.get(target, 'length', proxy) - 1 - i];
                              }
                              break;
                      }
                      var result = origin_1.apply(target, args);
                      handler.get(target, DEP_SYMBOL, proxy).notify();
                      return result;
                  };
              }
              else {
                  return handler.get(target, p, proxy);
              }
          }
          function setter(p, v) {
              handler.set(target, p, v, proxy);
          }
          var propertyMap = Object.create(null);
          var proto = target;
          while (proto) {
              Object.getOwnPropertyNames(proto).forEach(function (prop) {
                  if (!propertyMap[prop]) {
                      var descriptor = Object.getOwnPropertyDescriptor(proto, prop);
                      Object.defineProperty(proxy, prop, {
                          configurable: descriptor.configurable,
                          enumerable: descriptor.enumerable,
                          get: getter.bind(target, prop),
                          set: setter.bind(target, prop)
                      });
                      propertyMap[prop] = true;
                  }
              });
              proto = getProto(proto);
          }
          setProto(proxy, getProto(target));
          return proxy;
      }
      return ProxyPolyfill;
  }());
  if (!window.Proxy) {
      console.warn('Proxy isn\'t natively supported, and Kurge will use built-in polyfill instead');
  }
  var Proxy = window.Proxy || ProxyPolyfill;

  var ReflectPolyfill = {
      get: function (target, property) {
          return target[property];
      },
      set: function (target, property, value) {
          target[property] = value;
          return true;
      },
      deleteProperty: function (target, property) {
          return delete target[property];
      }
  };
  var Reflect = window.Reflect || ReflectPolyfill;

  function observe(data, specificWatcher) {
      if (specificWatcher === void 0) { specificWatcher = null; }
      if (is.function(data)) {
          throw new Error('function can\'t be observed');
      }
      else if (!is.object(data) && !is.array(data)) {
          data = { value: data };
      }
      for (var key in data) {
          if (hasOwn(data, key)) {
              if (is.object(data[key]) || is.array(data[key])) {
                  data[key] = observe(data[key], specificWatcher);
              }
          }
      }
      var dep = new Dependency(specificWatcher);
      var handler = {
          get: function (target, property) {
              if (property === DEP_SYMBOL) {
                  return dep;
              }
              if (hasOwn(target, property)) {
                  dep.collect();
              }
              return Reflect.get(target, property);
          },
          set: function (target, property, value) {
              if ((hasOwn(target, property) || is.undefined(target[property])) &&
                  value !== target[property]) {
                  if ((is.object(value) || is.array(value)) && !value[DEP_SYMBOL]) {
                      value = observe(value, specificWatcher);
                  }
                  dep.notify();
              }
              return Reflect.set(target, property, value);
          },
          deleteProperty: function (target, property) {
              if (hasOwn(target, property)) {
                  dep.notify();
              }
              return Reflect.deleteProperty(target, property);
          }
      };
      return new Proxy(data, handler);
  }

  function createContext(ctx) {
      if (Dependency.target) {
          throw new Error('please call createContext outside all components');
      }
      else {
          return observe(ctx);
      }
  }

  function useState(state) {
      if (!Dependency.target) {
          throw new Error('please call useState at top level in a component');
      }
      else {
          var instance = Dependency.target.instance;
          if (!instance.node) {
              instance.states.push(observe(state, Dependency.target));
          }
          var currentState = instance.currentState;
          if (!currentState) {
              throw new Error('unmatch any states. please don\'t call useState in if/loop statement');
          }
          else {
              return currentState;
          }
      }
  }

  function useRefs() {
      if (!Dependency.target) {
          throw new Error('please call useRefs at top level in a component');
      }
      else {
          return Dependency.target.instance.refs;
      }
  }

  function useEffect(effect, guard) {
      if (guard === void 0) { guard = null; }
      if (!is.null(guard) && !is.array(guard)) {
          throw new Error('the second argument of useEffect only accepts array');
      }
      else if (!Dependency.target) {
          throw new Error('please call useEffect at top level in a component');
      }
      else {
          var instance_1 = Dependency.target.instance;
          if (instance_1.node) {
              var prevGuard = instance_1.prevGuard;
              if (is.undefined(prevGuard)) {
                  throw new Error('unmatch any effects. please don\'t call useEffect in if/loop statement');
              }
              var shouldCall = false;
              if (is.array(guard) && is.array(prevGuard) && guard.length === prevGuard.length) {
                  for (var i = 0; i < guard.length; i++) {
                      if (guard[i] !== prevGuard[i]) {
                          shouldCall = true;
                      }
                  }
              }
              else {
                  shouldCall = true;
              }
              if (shouldCall) {
                  emitter.on("updated:" + instance_1.id, function () {
                      emitter.clean("unmount:" + instance_1.id);
                      var cleanup = effect();
                      if (cleanup && is.function(cleanup)) {
                          emitter.on("unmount:" + instance_1.id, cleanup);
                      }
                  });
              }
          }
          else {
              emitter.on('mounted', function () {
                  if (instance_1.node) {
                      var cleanup = effect();
                      if (cleanup && is.function(cleanup)) {
                          emitter.on("unmount:" + instance_1.id, cleanup);
                      }
                  }
              });
          }
          instance_1.guards.push(guard);
      }
  }

  var version = "1.1.1";

  var index = {
      version: version,
      render: render,
      createElement: createElement,
      createContext: createContext,
      useState: useState,
      useRefs: useRefs,
      useEffect: useEffect
  };

  return index;

}));
