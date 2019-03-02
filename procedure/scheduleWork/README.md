```js
function scheduleWork(fiber, expirationTime) {
  // 每次开始调度都是从root开始的 不管是第一次渲染还是setState
  // scheduleWorkToRoot中会把当前这个fiber上的expirationTime置为优先级最大的
  let root = scheduleWorkToRoot(fiber, expirationTime)
  // 没找到root说明出毛病了
  if (!root) return null
  // 接下来在源码中判断了一下是否之前有个被中断的任务
  // 如果有就重置一下之前的状态 这种情况发生的几率比较小 回头再写
  // 这里头给root挂上了expirationTime和nextExpirationTimeToWorkOn
  markPendingPriorityLevel(root, expirationTime)
  if (!isWorking) {
    // 
    requestWork(root, root.expirationTime)
  }
}

```