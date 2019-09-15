import _ from 'lodash';

export class Observer {
  constructor(data) {
    this.observe(data);
  }

  observe(data) {
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        data.forEach(value => this.observe(value));
      } else {
        Object.keys(data).forEach(key =>
          this.defineReactive(data, key, data[key])
        );
      }
    }
  }

  defineReactive(obj, key, value) {
    const _this = this;
    this.observe(value);
    const dep = new Dep();
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        depTarget && dep.addSub(depTarget);
        return value;
      },
      set(newVal) {
        if (newVal !== value) {
          _this.observe(newVal);
          value = newVal;
          dep.notify();
        }
      }
    });
  }
}

let depTarget = null;

class Dep {
  constructor() {
    this.subs = [];
  }

  addSub(watcher) {
    this.subs.push(watcher);
  }

  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}

export class Watcher {
  constructor(instance, path, cb) {
    this.instance = instance;
    this.path = path;
    this.cb = cb;
    this.value = this.getValue();
  }

  getValue() {
    depTarget = this;
    let value = _.get(this.instance.$data, this.path);
    depTarget = null;
    return value;
  }

  update() {
    let newValue = _.get(this.instance.$data, this.path);
    if (newValue !== this.value) {
      this.cb(newValue);
      this.value = newValue;
    }
  }
}

