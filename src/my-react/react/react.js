
const REACT_ELEMENT_TYPE = Symbol.for('react.element')

function ReactElement(type, key, props) {
  console.log(type, key, props)
  let element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    props: props
  }
  return element
}

function createElement(type, props = {}, children) {
  let _props = Object.assign({}, props)
  let _key = _props.key || null
  // 其实这里还应该处理一下ref
  // // 当有多个children时 children可以不按照数组的形式传
  _props.children = arguments.length - 2 === 1 ? children : arguments.slice(2)
  return ReactElement(type, _key, _props)
}

function Component(props, context, updater) {
  this.props = props
  this.context = context
  this.refs = emptyObject

  this.updater = updater || ReactNoopUpdateQueue
}
Component.prototype.isReactComponent = {}

const React = {
  createElement: function(type, props, children) {
    // console.log(type, props, children)
    let element = createElement(type, props, children)
    // 然后应该做一些校验比如children或者props之类的
    return element
  },
  Component
}
export default React