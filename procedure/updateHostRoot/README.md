```js
function updateHostRoot(workInProgress) {
  // 对于Root来讲 它的state就是ReactDOM.render传进来的第一个参数
  // 当然第一次肯定是没有的 因为这里获取的prevChildren 初次渲染的时候没有上一个节点
  let prevState = workInProgress.memoizedState
  let prevChildren = prevState !== null ? prevState.element : null
  processUpdateQueue(workInProgress, null)
  // 这个memoizedState是在上面那个provessUpdateQueue中赋值的
  // 就是从update上把payload拿出来 对于Root节点 它的payload是 {element}
  // 所以这里获取到的nextChildren就是这个element
  let nextChildren = workInProgress.memoizedState.element
  if (prevChildren === nextChildren) {
    // 如果上次的element和这次element一样 那么就跳出这个Root的更新
    // 一般来讲都会跳出的 因为很少有场景是直接改变ReactDOM.render的第一个参数的
    return bailoutOnAlreadyFinishedWork(workInProgress)
  }
  // 该去调和Root的子节点了
  // reconcile这个词翻译成"调和" 虽然乍一看不知道意思
  // 但是时间久了之后......仍然不知道啥意思
  // 不过源码看多了就有那种不可言传的感觉了
  return reconcileChildren(workInProgress, nextChildren)
}
```