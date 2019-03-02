```js

function markPendingPriorityLevel(root, expirationTime) {
  // 每次一轮更新完成之后earliestPendingTime和latestPendingTime还有latestPendingTime会被重置为NoWork

  // 这个表示root上等待更新的优先级最高的任务
  // earliestPendingTime是NoWork的话说明这个root目前没有等待更新的任务
  let earliestPendingTime = root.earliestPendingTime
  // 这个表示root上等待更新的优先级最低的任务
  let latestPendingTime = root.latestPendingTime
  if (earliestPendingTime === NoWork) {
    // 第一次渲染肯定是走到这步 最高和最低这俩在初始化的时候都是NoWork状态
    root.earliestPendingTime = root.latestPendingTime = expirationTime
  } else {
    // root的最低优先级如果还大于当前这个expirationTime的话就说明当前这个expriationTime才是优先级最低的
    if (latestPendingTime > expirationTime) root.latestPendingTime = expirationTime
    // root的最高优先级如果还小于当前这个expriationTime的话就说明当前这个expirationTime才时优先级最高的
    if (earliestPendingTime < expirationTime) root.earliestPendingTime = expirationTime
  }
  // 这个函数是用来给root上添加有限级时间的 这里面添加的时间才是最后更新时候真正会用到的时间
  // findNextExpirationTimeToWorkOn(expirationTime, root)
  // 这里会涉及到suspense组件

  // expirationTime和nextExpirationTimeToWorkOn的区别
  // expirationTime是作用在渲染前的
  // nextExpirationTimeToWorkOn是作用在渲染时的

  // expirationTime在scheduleCallbackWithExpirationTime被执行时那第二个参数就是这个root.expirationTime
  // 就是说它表示在异步渲染模式下 这个每次异步执行的callback在什么时间节点是过期的
  // 只要这个expirationTime不是Sync 那他就有可能会执行异步的渲染

  // nextExpirationTimeToWorkOn表示当前正在更新的这个任务的优先级的
  // nextExpirationTimeToWorkOn在beginWork中用来判断每个fiber节点上是否有任务要被执行
  // 如果某个节点上的最高的任务的优先级要比nextExpirationTimeToWorkOn低的话 那就可以跳过这个更新

  // 其实这俩time 可以简单理解成 expirationTime是更新模式
  // nextExpirationTimeToWorkOn是更新任务的优先级
  let nextExpirationTimeToWorkOn = expirationTime
  root.nextExpirationTimeToWorkOn = nextExpirationTimeToWorkOn
  root.expirationTime = expirationTime
}
```