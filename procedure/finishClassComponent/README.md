```js
function finishClassComponent(workInProgress, shouldUpdate) {
  // 给它标记上Ref 如果传了ref属性的话
  markRef(workInProgress)

  // 如果返回不更新的话就直接调用bailxxx跳过更新
  if (!shouldUpdate) return bailoutOnAlreadyFinishedWork(workInProgress)
  let instance = workInProgress.stateNode
  // 这块就是class类里写的render方法
  let nextChild = instance.render()
  reconcileChildren(workInProgress, nextChild)
  workInProgress.memoizedState = instance.state
  return workInProgress.child
}
```