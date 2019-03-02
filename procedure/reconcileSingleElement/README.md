```js
function reconcileSingleElement(returnFiber, currentFirstChild, element) {
  let createdFiber = null
  while (currentFirstChild !== null) {
    // 这里要对key做优化
    // 优化的主要方法就是一直遍历子节点
    // 尝试着找出一个key和上次一样的节点 然后干掉其他的节点
    // workInProgress是本次带有新的状态的fiber
    // 这里要通过workInProgress.alternate.child
    // 也就是在reconcileChildFibers等函数中传进来的这个currentFirstChild.key
    // 获取当前这个旧的fiber的第一个子节点的key
    // 然后用这个key来和新的子节点也就是传进来的这个element的key作比较
    if (currentFirstChild.key === element.key) {
      // 能进入single逻辑中说明肯定当前fiber是只有一个子元素的
      if (currentFirstChild.elementType === element.type) {
        // 进入这里说明当前这个子节点的key和类型都一样
        // 可以复用一下
        // react源码中还执行了一次deleteRemainingChildren
        // 先把其他的兄弟节点都干掉
        // 这是因为本次虽然只有一个子节点 但是上一次的更新或渲染中可能会有兄弟节点
        deleteRemainingChildren(returnFiber, currentFirstChild.sibling)
        // 之后再复用
        let existingFiber = useFiber(currentFirstChild, element.props)
        existingFiber.return = returnFiber
        return existingFiber
      } else {
        // 进入这里说明当前子节点的key一样但是类型不一样
        // 也要干掉当前子节点以及它的全部兄弟节点
        deleteRemainingChildren(returnFiber, currentFirstChild)
        break
      }
    } else {
      // 进入这里说明子节点的key不想当 那么就直接干掉这个子节点
      deleteChild(returnFiber, currentFirstChild)
    }
    currentFirstChild = currentFirstChild.sibling
  }
  if (element.type !== Symbol.for('react.fragment')) {
    createdFiber = createFiberFromElement(element, returnFiber.mode)
    createdFiber.ref = element.ref
    createdFiber.return = returnFiber
  } else {
    // 这里暂时先不处理fragment的情况
  }
  return createdFiber
}
```