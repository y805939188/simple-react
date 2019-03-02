```js
function reconcileChildFibers(workInProgress, newChild, isMount) {
  // 在初次渲染阶段 除了RootFiber的workInProgress是有alternate的
  // 剩下它下面的任何子节点在初次渲染时候都没有alternate
  // 因为只有通过createWorkInProgress创建的workInProgress才会有alternate
  // 直接通过 new Fiber是没有的
  let current = workInProgress.alternate
  let currentFirstChild = current ? current.child : null

  if (newChild instanceof Object) {
    // 说明newChild是个对象 可能是react元素
    if (newChild.$$typeof === Symbol.for('react.element')) {
      // $$typeof:Symbol(react.xxx) 是react元素的标志
      return placeSingleChild(
        reconcileSingleElement(workInProgress, currentFirstChild, newChild),
        isMount
      )
    }
  }
  if (newChild instanceof Array) {
    // 说明newChild是个数组 数组可能是好多同级的react元素
    return reconcileChildrenArray(workInProgress, currentFirstChild, newChild, isMount)
  }
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    // 说明newChild是个文本类型的
    return reconcileSingleTextNode(workInProgress, currentFirstChild, String(newChild))
  }
  // 如果走到这里了 就是说上面那些类型都不符合
  // 那就有可能是因为返回的是个null
  // 于是要把现有的child都删掉
  // 因为新产生的props的children是null
  // 那就需要把老节点的children删掉
  deleteRemainingChildren(workInProgress, currentFirstChild)
  return null
}
```