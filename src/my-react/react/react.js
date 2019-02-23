
const REACT_ELEMENT_TYPE = Symbol.for('react.element')

function ReactElement(type, key, props) {
  // console.log(type, key, props)
  let element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    props: props
  }
  return element
}

function createElement(type, props = {}, children) {
  // debugger
  let _props = Object.assign({}, props)
  let _key = _props.key || null
  // 其实这里还应该处理一下ref
  // // 当有多个children时 children可以不按照数组的形式传
  // _props.children = arguments.length - 2 === 1 ? arguments[2] : arguments.slice(2)
  // _props.children = (children.length === 1) ? children[0] : children
  let children_length = children.length
  _props.children = children_length === 0 ? null : children_length === 1 ? children[0] : children
  return ReactElement(type, _key, _props)
}

// function Component(props, context, updater) {
//   this.props = props
//   this.context = context
//   // this.refs = emptyObject

//   this.updater = updater || null
// }
// Component.prototype.isReactComponent = true

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

const React = {
  createElement: function(type, props, ...children) {
    // console.log(type, props, children)
    let element = createElement(type, props, children)
    // 然后应该做一些校验比如children或者props之类的
    return element
  },
  Component
}
export default React