import _ from 'lodash';

let depTarget = null;

export class Observer {
  constructor(data) {
    this.observe(data);
  }

  observe(data) {
    if (!data || typeof data !== 'object') {
      return;
    }
    if (Array.isArray(data)) {
      data.forEach(value => this.observe(value));
    } else {
      Object.keys(data).forEach(key =>
        this.defineReactive(data, key, data[key])
      );
    }
  }

  defineReactive(obj, key, value) {
    const deps = []
    const _this = this;
    this.observe(value);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        depTarget && deps.push(depTarget);
        return value;
      },
      set(newVal) {
        if (newVal === value) {
          return;
        }
        _this.observe(newVal);
        value = newVal;
        deps.forEach(watcher => watcher.update())
      }
    });
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
    if (newValue === this.value) {
      return;
    }
    this.cb(newValue);
    this.value = newValue;
  }
}

