```js
 function performWork(minExpirationTime, isYield) {

  findHighestPriorityRoot()

  if (!isYield) {
    // 进入这里说明是优先级高 不允许暂停
    // 第三个参数表示不能暂停
    while (
      !!nextFlushedRoot &&
      !!nextFlushedExpirationTime &&
      // 这个minExpirationTime <= nextFlushedExpirationTime的意义是什么呢
      // 当同步调用和异步断点调用的时候 传进来的这个minExpirationTime是不一样的
      // 当同步时传进来的就是Sync 意味着这个任务的优先级最大 比如flushSync的时候
      // 如果在执行这个flushSync之前还有一个优先级比较低的异步任务的话
      // 那么在processUpdateQueue执行更新state的操作时候就会暂时先忽略那个优先级低的
      // 然后在processUpdateQueue中会把第一个优先级低于当前这个Sync的作为firstUpdate
      // 并将这个update的expirationTime挂在workInProgress上
      // 之后当一侧的节点都更新完成会执行那个completeWork方法
      // 在这个方法中有个resetChildExpirationTime
      // 在往父节点们遍历的过程中都会执行到这个重置的方法
      // 之后就会把刚才在processUpdateQueue中挂在workInProgress上的那个expirationTime
      // 作为他节点们的childExpirationTime
      // 最后在commit过程中 当执行完最后那三个while循环后会执行一个叫做onCommit的方法
      // 这个方法就会把这个childExpiration给root 作为root.expirationTime
      // 然后这个root就算是更新完成了
      // 然后一般会执行一个findHighestPriorityRoot的方法找root
      // 然后就会读取root.expirationTime 如果有的话就作为全局变量 nextFlushedExpirationTime
      // 所以这里对比的就是传进来的time和这个nextFlushedExpirationTime
      // 如果当执行了flushSync的时候传进来的是Sync 那么就算还有一个优先级低的任务被放置了
      // 当进行下一次while的时候也会由于minExpirationTime(Sync) > nextFlushedExpirationTime而跳过这个更新
      // 不过当异步更新的时候
      // 执行performAsync时候传进的是NoWork 就相当于每次while的时候的minExpirationTime是NoWork
      // 所以在异步更新的时候如果有个优先级低 就比如当前一个任务被中断时 用户正好点击了一下更新的情况
      // 这个第二次点击更新就是一个优先级比上一次挂起的那个任务优先级低的任务
      // 然后这里判断的时候就会发现 nextFlushedExpirationTime > NoWork
      // 如果同时currentRendererTime 也就是当前的精确时间优先级小于 nextFlushedExpirationTime
      // 也就是说对于该更新的过期时间 当前时间还够 还有富余的话 就继续执行performWorkOnRoot
      minExpirationTime <= nextFlushedExpirationTime
    ) {
      performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, false)
      // 找下一个需要更新的Root
      findHighestPriorityRoot()
    }
  } else {
    // while (nextFlushedRoot !== null && nextFlushedExpirationTime !== NoWork && minExpirationTime <= nextFlushedExpirationTime && !(didYield && currentRendererTime > nextFlushedExpirationTime)) {
      performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, currentRendererTime > nextFlushedExpirationTime);
      nextFlushedExpirationTime = NoWork
      nextFlushedRoot = null
      // findHighestPriorityRoot()
      // recomputeCurrentRendererTime()
    // }
  }
}
 
```