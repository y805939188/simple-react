```js
function beginWork(workInProgress) {
  let next = null
  let tag = workInProgress.tag

  if (workInProgress.alternate !== null) {
    let oldProps = workInProgress.alternate.memoizedProps
    let newProps = workInProgress.pendingProps
    // 每个current也就是每个fiber都有自己的expirationTime
    // 这个expirationTime是当执行setState的时候在通过实例找root的那个函数中
    // 会把新计算出来的expirationTime放在那个类的fiber上
    // 然后在最后任务执行完了就会把那个fiber的expirationTime重置为NoWork
    // 所以这里的updateExpirationTime得到的很可能是0 如果这个fiber上没有更新的话那就会是0
    // 因为在createWorkInProgress的时候会将current.expirationTime赋值给workInProgress.expirationTime
    // 而renderExpirationTime则是root.nextExpirationTimeToWorkOn给赋值的全局变量 是当前任务的更新时间
    // 所以如果某个fiber上的updateExpirationTime是0就会小于renderExpirationTime也就会执行下面那个跳过更新的逻辑
    if (oldProps === newProps && workInProgress.expirationTime < nextRenderExpirationTime && workInProgress.tag !== ContextConsumer) {
      // 这个函数用来跳过本fiber的更新的方法
      // 如果当前workInProgress没有子节点就返回个null 如果有子节点就返回一个子节点的克隆
      return bailoutOnAlreadyFinishedWork(workInProgress)
    }
  }

  if (tag === IndeterminateComponent) {
    // tag默认是indeterminate类型
    // 初次渲染时的function类型组件会走这里离
    // 因为不确定function的返回值会是啥玩意儿
    // 根据函数的返回值 会在这个方法中确定workInProgress的tag类型
    next = mountIndeterminateComponent(workInProgress)
  } else if (tag === HostRoot) {
    next = updateHostRoot(workInProgress)
  } else if (tag === FunctionComponent) {

  } else if (tag === ClassComponent) {
    next = updateClassComponent(workInProgress)
  } else if (tag === HostComponent) {
    next = updateHostComponent(workInProgress)
  } else if (tag === HostText) {
    next = updateHostText(workInProgress)
  } else if (tag === ContextProvider) {
    next = updateContextProvider(workInProgress)
  } else if (tag === ContextConsumer) {
    next = updateContextConsumer(workInProgress)
  }
  // 当前这个workInProgress马上就要更新完了 所以可以把它的expirationTime置为NoWork了
  workInProgress.expirationTime = NoWork
  return next
}
```