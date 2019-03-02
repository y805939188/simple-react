```js
function addRootToSchedule(root, expirationTime) {
  // lastScheduledRoot 和 firstScheduleRoot这俩是全局变量
  // 如果react应用存在多个 root 可能会这俩会成为一个单向链表的结构
  if (!root.nextScheduledRoot) {
    root.expirationTime = expirationTime
    // 当react运行了个异步任务时候
    // 如果被中断了 然后浏览器又添加了一个新的任务的时候
    // 可能会调用两次 addRootToSchedule
    // 这个时候两次更新的 root都是一样的
    // 所以就变成了 root.nextScheduledRoot = root
    if (!lastScheduledRoot) {
      firstScheduledRoot = lastScheduledRoot = root
      root.nextScheduledRoot = root
    } else {
      // 这个就是循环链表正常的改变指向的操作
      lastScheduledRoot.nextScheduledRoot = root
      lastScheduledRoot = root
      lastScheduledRoot.nextScheduledRoot = firstScheduledRoot
    }
  } else {
    // 进入这里说明root已经被调度了
    // 比如在同一个click事件中执行了两次setState
    // 每次执行都会进入这里
    // 当第二次进来的时候这个root是已经有nextScheduleRoot的
    let remainingExpirationTime = root.expirationTime
    if (remainingExpirationTime < expirationTime) {
      // 能走到这里就说明这回这个新的setState的优先级比上回那个大
      // 比如它用了flushSync之类的 于是要更新 root上的expirationTime
      root.expirationTime = expirationTime
    }
  }
}

```