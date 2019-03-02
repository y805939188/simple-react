```js
function performUnitOfWork(workInProgress) {
  // beginWork就是开始工作 开始工作就是创建出子fiber节点
  let next = beginWork(workInProgress)
  workInProgress.memoizedProps = workInProgress.pendingProps

  if (next === null) {
    // 子fiber节点是null了
    // 说明一侧的fiber树创建完成
    // 然后要在completeUnitOfWork函数中将这一侧的update都挂到root上
    // next = completeUnitOfWork
    // 然后在completeUnitOfWork中找到兄弟节点作为next进行兄弟节点上的fiber的创建
    // 如果都到这里了 这next还是返回null 就说明这个root下的节点们都已经完成了fiber
    // 就可以进行下一步的commit了
    next = completeUnitOfWork(workInProgress)
  } 
  return next
}
```