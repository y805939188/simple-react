```js
 function commitBeforeMutationLifecycles() {
  // 这是commit阶段的第一个循环
  // 这个commitBeforeMutationLifeCycles方法主要就是
  // 判断current如果存在并且是classComponent同时有Snapshot这个生命周期
  // 就获取到它的memoizedProps和memoizedState
  // 然后把这俩作为prevProps和prevState传进这个组件的getSnapshotBeforeUpdate
  // 可以获得一个快照 也就是 snapshot
  // 再然后把这个snapshot快照放在这个实例上
  // instance.__reactInternalSnapshotBeforeUpdate = snapshot
  while (!!nextEffect) {
    let effectTag = nextEffect.effectTag
    if (effectTag & Snapshot) {
      let finishedWork = nextEffect
      let tag = finishedWork.tag
      if (tag === ClassComponent) {
        // 只有当本fiber的tag是class组件的时候才执行逻辑
        // 因为只有class组件才能写这种周期
        let current = finishedWork.alternate
        if (!!current) {
          // 如果有current的话才执行
          // 因为这个getSnapshotBeforeUpdate是用作更新前的快照
          // 初次渲染是 组件都是不会有current的 只有当组件要更新时才会产生current
     
          // 获取组件实例
          let instance = finishedWork.stateNode
          // 现在current上获取更新前的props和state
          let prevProps = Object.assign({}, finishedWork.type.defaultProps, current.memoizedProps)
          let prevState = Object.assign({}, current.memoizedState)
          let snapshot = instance.getSnapshotBeforeUpdate(prevProps, prevState)

          // 最后执行完给组件添加上这个老特么长的属性作为快照
          // 这个snapshot会在更新完成之后传递给componentDidUpdate
          // 这个快照周期 比较适合用来获取更新前的状态 比如更新前的dom信息之类的
          instance.__reactInternalSnapshotBeforeUpdate = snapshot
        }
      }
    }
    nextEffect = nextEffect.nextEffect
  }
}
 
```