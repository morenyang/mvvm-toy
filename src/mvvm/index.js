import {Observer} from './reactive';
import Compiler from './compiler'

class MVVM {
  constructor(options = {el: null, data: {}, computed: {}, methods: {}}) {
    this.$el = options.el;
    this.$data = options.data || {};
    const computed = options.computed;
    const methods = options.methods;
    const _this = this;

    if (!this.$el) {
      return;
    }
    new Observer(this.$data);

    computed && this.bindComputed(computed, _this);

    methods && this.bindMethods(methods, _this);

    this.proxyData(this.$data);

    new Compiler(this.$el, this);
    return this;
  }

  bindComputed(computed, _this) {
    Object.keys(computed).forEach(key => {
      Object.defineProperty(_this.$data, key, {
        enumerable: true,
        configurable: true,
        get() {
          return computed[key].call(_this);
        }
      });
    });
  }

  bindMethods(methods, _this) {
    Object.keys(methods).forEach(key => {
      Object.defineProperty(_this, key, {
        get() {
          return methods[key].bind(_this);
        }
      });
    });
  }

  proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key];
        },
        set(val) {
          data[key] = val;
        }
      });
    });
  }
}

export default MVVM
