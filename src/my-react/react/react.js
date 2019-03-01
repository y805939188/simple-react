
const REACT_ELEMENT_TYPE = Symbol.for('react.element')
const REACT_CONTEXT_TYPE = Symbol.for('react.context')
const REACT_PROVIDER_TYPE = Symbol.for('react.provider')

function ReactElement(type, key, ref, props) {
  // console.log(type, key, props)
  let element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key,
    ref,
    props
  }
  return element
}

function createElement(type, props = {}, children) {
  // debugger
  let _props = Object.assign({}, props)
  let _key = _props.key || null
  let _ref = _props.ref || null
  // 其实这里还应该处理一下ref
  // 当有多个children时 children可以不按照数组的形式传
  let children_length = children.length
  _props.children = children_length === 0 ? null : children_length === 1 ? children[0] : children
  return ReactElement(type, _key, _ref, _props)
}

class Component {
  constructor(props, context, updater) {
    this.props = props
    this.context = context
    this.updater = updater || null
  }
  get isReactComponent() {
    return true
  }
  setState(partialState, callback) {
    if (partialState instanceof Object || typeof partialState === 'function') {
      let _setState = this.updater.enqueueSetState
      _setState && _setState(this, partialState, callback, 'setState')
    }
  }
  forceUpdate(callback) {
    let _forceUpdate = this.updater.enqueueSetState
    _forceUpdate && _forceUpdate(this, callback, 'forceUpdate')
  }
}

function createContext(defaultValue) {
  let context = {
    $$typeof: REACT_CONTEXT_TYPE,
    _currentValue: defaultValue,
    Provider: null,
    Consumer: null
  }
  context.Provider = {
    $$typeof: REACT_PROVIDER_TYPE,
    _context: context
  }
  context.Consumer = {
    $$typeof: REACT_CONTEXT_TYPE,
    _context: context
  }
  return context
}

function createRef() {
  return {
    current: null
  }
}

const React = {
  createElement: function(type, props, ...children) {
    // console.log(type, props, children)
    let element = createElement(type, props, children)
    // 然后应该做一些校验比如children或者props之类的
    return element
  },
  createContext,
  createRef,
  Component
}
export default React