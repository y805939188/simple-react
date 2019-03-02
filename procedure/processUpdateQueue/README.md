```js
function processUpdateQueue(workInProgress, instance) {
  // react在更新的时候最受的规则是
  // 越靠后点击的更新 计算出来的expirationTime就越小
  // 而每次更新合并update的时候则是优先合并expirationTime大的
  // 比如说点按钮更新
  // 第一次点击的时候计算出来的时间是 17xxx99
  // 然后这个是个异步任务 当中断把主线程交给浏览器的时候又点击了一下按钮触发了新更新
  // 那这个新更新重新计算出来的时间可能是 17xxx88
  // 这就意味着第一次点击时候的优先级要高于第二次的 所以会优先把17xxx99的状态合并
  // 下次再合并 17xxx88的状态 这样最后得到的结果也是第二次点击时候产生的更新结果

  // 要保证workInProgress和alternate上的queue不指向同一个对象 否则修改了这个另外一个也改了
  let queue = ensureWorkInProgressQueueIsAClone(workInProgress)
  
  // 对于初次渲染的情况下这个firstUpdate的payload是ReactDOM.render的第一个参数
  let update = queue.firstUpdate
  // 这个newBaseState用来记录的是新的状态
  let newBaseState = queue.baseState
  // 而resultState记录的是当前这个updateQueue中所在的state
  // 这个resultState在getStateFromUpdate中是作为prevState的
  // 表示每次新产生的结果
  let resultState = newBaseState

  let newFirstUpdate = null
  let newExpirationTime = 0
  while (!!update) {
    // 这里得到的是每个update上的更新时间
    let updateExpirationTime = update.expirationTime
    if (updateExpirationTime < nextRenderExpirationTime) {
      // 进入这里说明这个update的优先级较小
      // 比如执行了一个setState后又马上执行了一个flushSync(() => this.setState())
      // 像这种情况下 全局变量nextRenderExpirationTime是Sync 肯定比前面那个大
      // 但是updateQueue中的update链表是从第一个setState的update指向第二的
      // 所以就会走到这里
      if (newFirstUpdate === null) {
        newFirstUpdate = update
        // 这里让这个newBaseState等于目前最新的值
        newBaseState = resultState
      }
      if (newExpirationTime < updateExpirationTime) {
        newExpirationTime = updateExpirationTime
      }
    } else {
      // 初次渲染时候返回的是{element} 之后更新时候才返回state
      resultState = getStateFromUpdate(workInProgress, queue, update, instance)
      let _callback = update.callback
      if (!!_callback) {
        // 在更新RootFiber时肯定会有一个callback
        // 因为在最初执行render的时候 new 了一个 ReactWork
        // 这个回调就是 work._onCommit 执行这个 _onCommit 就可以触发ReactDOM.render的第三个参数
        workInProgress.effectTag |= Callback // 0b000000100000 也就是32
        
        // 下面这块源码中有 注释是在中断渲染时防止它变异
        // 暂时不是很理解 回头再研究吧 反正肯定不是啥有大影响的东西 做掉几了也无所谓
        // update.nextEffect = null
        // if (queue.lastEffect === null) {
        //   queue.firstEffect = queue.lastEffect = update
        // } else {
        //   queue.lastEffect.nextEffect = update
        //   queue.lastEffect = update
        // }
      }
    }
    update = update.next
  }

  if (newFirstUpdate === null) {
    // 进入这里说明该节点上的更新任务的优先级都比较高
    // 也说明所有任务都进入到getStateFromUpdate中被更新为新的状态了
    queue.lastUpdate = null
    newBaseState = resultState
  }
  // 不能直接让baseState等于resultState
  // 因为有可能会有优先级低的任务没有计算呢
  queue.baseState = newBaseState
  // 这里让firstUpdate是newFirstUpdate
  // 如果全部任务优先级都高都计算完了 那么这个firstUpdate就是null
  // 如果有优先级低的任务 那么这个firstUpdate就是第一个优先级低的任务
  queue.firstUpdate = newFirstUpdate
  // 同时还要更新当前fiber节点的expirationTime
  // 用来下一次更新
  workInProgress.expirationTime = newExpirationTime
  workInProgress.memoizedState = resultState
}
```