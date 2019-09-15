import {Watcher} from './reactive';
import _ from 'lodash';

class Compiler {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;
    let fragment = this.createFragment(this.el);
    const childNode = this.compile(fragment);
    this.el.appendChild(childNode);
    return this.el;
  }

  isElementNode(el) {
    return el.nodeType === 1;
  }

  createFragment(el) {
    let fragment = document.createDocumentFragment();
    let firstChild;
    while ((firstChild = el.firstChild)) {
      fragment.appendChild(firstChild);
    }
    return fragment;
  }

  isCustomEvent(attr) {
    return attr.startsWith('@');
  }

  isBindValue(attr) {
    return attr.startsWith(':');
  }

  isModel(attr) {
    return attr.startsWith(':model');
  }

  compile(_node) {
    let fragment = document.createDocumentFragment();
    const childNodes = _node.childNodes;
    childNodes.forEach(node => {
      // node type === 1 这里的Node全部视为Element类型
      if (this.isElementNode(node)) {
        const createdNode = document.createElement(node.tagName);

        node.getAttributeNames().forEach(attr => {
          const attrValue = node.getAttribute(attr);
          // 检测这个属性是不是绑定或 event
          if (this.isModel(attr)) {
            this.resolveModel(createdNode, attrValue, this.vm);
            return;
          }
          if (this.isBindValue(attr)) {
            const [, valueName] = attr.split(':');
            this.resolveBind(createdNode, attrValue, this.vm, valueName);
            return;
          }
          if (this.isCustomEvent(attr)) {
            const [, eventName] = attr.split('@');
            this.resolveEvent(createdNode, attrValue, this.vm, eventName);
            return;
          }
          // 如果不是绑定或者event 则将原attr绑定到dom节点
          createdNode.setAttribute(attr, attrValue || '');
        });
        createdNode.appendChild(this.compile(node));
        fragment.appendChild(createdNode);
      } else {
        let content = node.textContent || '';
        const createdNode = document.createTextNode(content);
        // 匹配 {{}}
        if (/\{\{(.+?)\}\}/.test(content)) {
          this.resolveText(createdNode, content, this.vm);
        }
        fragment.appendChild(createdNode);
      }
    });
    return fragment;
  }

  resolveEvent(element, exp, instance, eventName) {
    element.addEventListener(eventName, e => instance[exp].call(instance, e));
  }

  resolveBind(element, exp, instance, valueName) {

    // 创建一个 watcher， watcher创建时会把回调函数和instance绑定到exp对象的订阅中
    new Watcher(instance, exp, nVal => {
      element[valueName] = nVal;
    });

    element[valueName] = _.get(instance.$data, exp);
  }

  resolveModel(element, exp, instance) {
    this.resolveBind(element, exp, instance, 'value');
    element.addEventListener('input', e => {
      console.debug(e);
      let value = e.target.value;
      _.set(instance.$data, exp, value);
    });
  }

  resolveText(element, content, instance) {
    const _rawContent = content;
    let reg = /\{\{(.+?)\}\}/;
    let expr;

    // 重新渲染textNode的逻辑
    function reRenderText() {
      let _content = _rawContent;
      let _expr;

      while ((_expr = _content.match(reg))) {
        // 替换模板值 {{a}} -> real value
        _content = _content.replace(_expr[0], _.get(instance.$data, _expr[1].trim()));
      }
      element.textContent = _content;
    }

    while ((expr = content.match(reg))) {
      const valPath = expr[1].trim()
      // 替换模板值 {{a}} -> real value
      content = content.replace(expr[0], _.get(instance.$data, valPath));
      // 绑定watcher到 exp的数据上 当数据改变时，会触发Text重绘
      new Watcher(instance, valPath, reRenderText);
      element.textContent = content;
    }
  }
}

export default Compiler;
