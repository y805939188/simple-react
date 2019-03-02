```js
function createFiberFromTypeAndProps(type, key, pendingProps, mode, expirationTime) {
  // Indeterminate是模糊的,不确定的意思
  // 初次渲染时 如果某个组件是function类型的话 就会先给这个组件一个Indeterminate
  let flag = IndeterminateComponent 
  if (typeof type === 'function') {
    // 进入这里说明是函数类型的组件或是class类
    // flag = 
    if (isClassComponent(type)) {
      flag = ClassComponent
    }
  } else if (typeof type === 'string') {
    // 进入这里说明可能是个原生节点比如 'div'
    flag = HostComponent
  } else {
    // 进入这里就要分别判断各种react自己内部提供的组件类型了
    // 比如concurrent fragment之类的
    let tag = type.$$typeof
    if (tag === Symbol.for('react.provider')) {
      flag = ContextProvider
    } else if (tag === Symbol.for('react.context')) {
      flag = ContextConsumer
    }
  }

  let fiber = createFiber(flag, pendingProps, key, mode)
  fiber.elementType = type
  fiber.type = type
  fiber.expirationTime = expirationTime
  return fiber
}

```