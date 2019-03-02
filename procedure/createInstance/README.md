```js
 function createInstance(type, props, workInProgress) {
  let children = props.children
  if (typeof children === 'string' || typeof children === 'number') {
    // 这里要对一些特殊标签进行一些特殊处理
  }
  // let domElement = createElement()
  let domElement = document.createElement(type)
  domElement.__reactInternalInstance = workInProgress
  return domElement
}
 
```