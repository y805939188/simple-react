```js
function computeExpirationForFiber(currentTime, fiber) {
  let expirationTime = null
  if (expirationContext !== NoWork) {
    // 当通过syncUpdates把任务强制变为最高优先级的时候就会直接走这里
    expirationTime = expirationContext
  } else if (isWorking) {
    if (isCommitting) {
      // 在提交阶段也就是全部fiber都构建完成之后
      // 要把更新真实地渲染到dom上去 这个过程是不能中断的
      // 所以要直接让他变为同步的
      expirationTime = Sync
    } else {
      // 进入这里说明可能是刚才有个异步的任务被中断了
      // 然后现在要重新回来执行刚才那个被中断的任务
      expirationTime = nextRenderExpirationTime
    }
  } else {
    // &是用来看这个mode上是否被添加过ConcurrentMode这个东西
    // 只有当给组件包裹了 <ConcurrentMode></ConcurrentMode> 的时候
    // 才会进入这个逻辑 表示该组件下的所有更新任务都要以低优先级的异步方式更新
    if (fiber.mode & ConcurrentMode) {
      if (isBatchingInteractiveUpdates) {
        // 进入这里说明是批量更新
        // 一般正常情况下如果在同一个函数中写了多个setState的话
        // isBatchingInteractiveUpdates就是true
        // 但是当一个函数中同时有多个异步的setState的时候
        // isBatchingInteractiveUpdates就是false
        // 比如在setTimeout的回调中放了好多setState的话
        // 这种情况下就不会批量更新 执行一个setState触发一次更新
        // 不过如果给所有的setState外部包裹上batchedUpdates
        // 那也会走这个逻辑 就相当于把所有的异步setState放进一个队列 最后统一更新

        // 批量更新的优先级相对来说要稍微高一点 比sync低 比async高
        // expirationTime = computeInteractiveExpiration(currentTime)
      } else {
        // 给组件包裹了ConcurrentMode组件之后 组件默认都采用async的更新方式
        // 这种更新方式的优先级是最低的
        // expirationTime = computeAsyncExpiration(currentTime)
      }
      // if (nextRoot !== null && expirationTime === nextRenderExpirationTime) {
      //   // 这块是干啥的暂时不太理解
      //   expirationTime -= 1;
      // }
    } else {
      // 如果即不是异步也不批量也不是在正在更新fiber树的途中的话
      // 就直接让这个expirationTime变为同步的Sync
      expirationTime = Sync
    }
  }
  return expirationTime
}
```