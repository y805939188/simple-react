```js
 function updateElement(returnFiber, current, element, expirationTime) {
  // 这里是判断新旧两个节点的类型是否一样
  // 使用elementType和type是否相等来判断
  // elementType 是resolved之后的type类型
  // type 是resolved之前的type类型
  // 大部分情况下俩值是一样的
  // 不过像react中的lazyComponent组件 前后的elementType和type就不一样
  // 所以这里用这俩是否相等判断
  // 当然如果没有lazy加载的功能的话 直接用新旧type对比也成
  if (current !== null && current.elementType === element.type) {
    const existing = useFiber(current, element.props, expirationTime)
    existing.ref = element.ref
    existing.return = returnFiber
    return existing
  } else {
    // Insert
    const created = createFiberFromElement(element, returnFiber.mode, expirationTime)
    created.ref = element.ref
    created.return = returnFiber
    return created
  }
}

 
```