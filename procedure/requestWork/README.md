```js
function requestWork(root, expirationTime) {
  addRootToSchedule(root, expirationTime)

  // 如果isRendering是true说明目前正在更新fiber树
  // 这种情况不需要再执行requestWork 因为异步调度的关系
  // 当放在requestAnimationFrame中的下一帧的任务开始时会自动调度
  if (isRendering) return null
  // 如果是批量更新但是调用了禁止批量更新的方法那就直接更新
  if (isBatchingUpdates && isUnbatchingUpdates) performWorkOnRoot(root, Sync, false)
  // 如果是批量更新比如说同一个事件中触发了好多setState的情况下就直接return 之后的react的事件回调会触发更新渲染
  if (isBatchingUpdates && !isUnbatchingUpdates) return null
  // 如果时间是Sync说明他是个最高优先级的同步任务或者是初次渲染
  if (expirationTime === Sync) return performSyncWork(root)
  // 如果时间不为Sync说明可能是个异步任务或者批量任务
  if (expirationTime !== Sync) return scheduleCallbackWithExpirationTime(root, expirationTime)
}
```