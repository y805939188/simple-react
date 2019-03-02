```js
function updateSlot(returnFiber, oldFiber, newChild, expirationTime) {
  const key = oldFiber !== null ? oldFiber.key : null
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    // 这里就是说如果之前那个旧的节点有key
    // 那就直接返回null 说明这个旧节点没法复用
    // 因为本次新节点是个文本类型 文本类型没有key
    if (key !== null) {
      return null
    }
    // 走到这里说明上次旧的节点也是文本类型
    // 或!没写key属性
    // 然后updateTextNode会判断如果上次节点也是文本类型
    // 就更新复用
    // 如果不是文本类型就创建一个新的fiber
    return updateTextNode(returnFiber, oldFiber, '' + newChild, expirationTime)
  }

  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case Symbol.for('react.element'): {
        // key相等时才会去考虑复用
        // key值不同的时候直接返回一个null
        if (newChild.key === key) {
          // 这里也是判断如果新旧两个类型一样
          // 就复用 不一样就create
          return updateElement(returnFiber, oldFiber, newChild, expirationTime)
        } else {
          return null
        }
      }
    }
  }
  return null
}

```