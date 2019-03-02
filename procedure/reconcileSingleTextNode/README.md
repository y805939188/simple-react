```js
 function reconcileSingleTextNode(returnFiber, currentFirstChild, text) {
  let expirationTime = nextRenderExpirationTime
  if (!!currentFirstChild && currentFirstChild.tag === HostText) {
    // 有currentFirstChild并且tag是HostText的话
    // 说明当前这个fiber已经有了子节点并且这个子节点就是文本类型
    // 那么就可以复用这个子节点fiber
    deleteRemainingChildren(returnFiber, currentFirstChild)
    let existingFiber = useFiber(currentFirstChild, text, expirationTime)
    existingFiber.return = returnFiber
    return existingFiber
  }
  let createdFiber = createFiberFromText(text, returnFiber.mode)
  createdFiber.return = returnFiber
  return createdFiber
}
 
```