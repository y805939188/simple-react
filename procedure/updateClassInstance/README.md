```js
function updateClassInstance(workInProgress, newProps) {
  let instance = workInProgress.stateNode
  let oldState = workInProgress.memoizedState
  let newState = oldState
  let updateQueue = workInProgress.updateQueue
  if (!!updateQueue) {
    processUpdateQueue(workInProgress, instance)
    newState = workInProgress.memoizedState
  }

  // 如果前后两次的props和state都相等的话就直接返回false作为shouldUpdate
  let current = workInProgress.alternate
  let oldProps = workInProgress.memoizedProps
  if ((oldProps === newProps) && (oldState === newState)) {
    if (typeof instance.componentDidUpdate === 'function') {
      if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
        workInProgress.effectTag |= Update
      }
    }
    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
        workInProgress.effectTag |= Snapshot
      }
    }
    return false
  }

  // 执行这个新的周期 更新instance上的state
  let getDerivedStateFromProps = instance.getDerivedStateFromProps
  if (!!getDerivedStateFromProps && typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(workInProgress, getDerivedStateFromProps, newProps)
    newState = workInProgress.memoizedState
  }

  // 判断是否有shouldComponentUpdate这个周期 并直接返回这个周期的返回值作为shouldUpdate
  let shouldComponentUpdateLife = instance.shouldComponentUpdate
  let shouldUpdate = true
  if (typeof shouldComponentUpdateLife === 'function') {
    shouldUpdate = shouldComponentUpdate(newProps, newState)
    if (shouldUpdate) {
      if (typeof instance.componentDidUpdate === 'function') {
        workInProgress.effectTag |= Update
      }
      if (typeof instance.getSnapshotBeforeUpdate === 'function') {
        workInProgress.effectTag |= Snapshot
      }
    } else {
      // 如果不更新的话 也要把fiber上的props和state置为最新
      workInProgress.memoizedProps = newProps
      workInProgress.memoizedState = newState
    }
  }
  instance.props = newProps
  instance.state = newState

  // 其实这里应该还要判断一下是否是 PureComponent
  // 但是这个比较简单 就是单纯浅对比了一下新旧State和Props
  // 这个自己在react里判断都行 所以这儿就先不写了

  return shouldUpdate
}
```