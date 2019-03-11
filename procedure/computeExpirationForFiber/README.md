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
      // 给组件包裹了ConcurrentMode组件之后会走到这里
      if (isBatchingInteractiveUpdates) {
        // 进入这里说明是批量更新
        // isBatchingInteractiveUpdates初始默认是false
        // 而在合成事件中 比如onClick等 合成事件会触发 interactiveUpdates方法
        // 这个方法中会将isBatchingInteractiveUpdates和isBatchingUpdates临时置为true
        // 然后才会去调用自己写的真实的想触发的事件 于是在事件中不管执行几次setState
        // 都是按照批量更新进行的(isBatchingUpdates控制是否直接退出还是继续往下去调度Root)
        // 完事儿之后再给isBatchingInteractiveUpdates和isBatchingUpdates置回false

        // 当传的事件中有异步的时候
        // 虽然interactiveUpdates中最终也会触发performSyncWork
        // 但是里头由于还没执行到异步中的setState所以不一定有root
        // 所以可能会直接退出
        // 之后当执行到异步中的setState的时候isBatchingInteractiveUpdates就是false
        // 于是就会走到下面按个Async的逻辑中(在使用了Concurrent组件的前提下 不用Concurrent模式就直接Sync)
        // 不过如果给所有的setState的最外部包裹上batchedUpdates
        // 比如: 
        // setTimeout(() => {
        //   batchedUpdates(() => {
        //     this.setState({ // isBatchingUpdates是true 批量更新
        //       ding: xxx
        //     })
        //     this.setState({ // isBatchingUpdates是true 批量更新
        //       ding: yyy
        //     })
        //     console.log(this.state.ding) // 不能获取
        //   })
        //   console.log(this.state.ding) // 能获取
        // })   

        // 或者当使用addEventListener绑定的事件时 isBatchingInteractiveUpdates也是false
        // 批量更新的优先级相对来说要稍微高一点 比sync低 比async高
        expirationTime = computeInteractiveExpiration(currentTime)
      } else {
        // 总结一下就是
        // 当外层包裹了Concurrent组件的前提下
        // 不把setState放在异步中就会走到上面那个批量更新的逻辑中
        // 而当把setState放在异步中 比如用了setTimeout或放在addEventListener中
        // 都会进入到这个Async的逻辑
        expirationTime = computeAsyncExpiration(currentTime)
      }
      if (nextRoot !== null && expirationTime === nextRenderExpirationTime) {
        // 这块是当异步更新时
        // 比如在对fiber树render了一半的时候讲线程交还给浏览器
        // 然后交还的这段时间内 又触发了一个setState的话
        // 这个时候nextRoot是有值的
        // nextRenderExpirationTime也有值 就是刚才还没有完成的那个更新的截止时间
        // 进到这里的话 说明在交还主线程的这段时间里执行的setState的优先级
        // 和上一把没完成的是一样的 所以就给它减个1 让它的优先级相对来说第一点
        // 这样就优先执行上一把还没整完的那个更新了
        expirationTime -= 1;
      }
    } else {
      // 如果即不是异步也不批量也不是在正在更新fiber树的途中的话
      // 就直接让这个expirationTime变为同步的Sync
      expirationTime = Sync
    }
  }
  return expirationTime
}
```