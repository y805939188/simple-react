```js
 function commitRoot(root, finishedWork) {
  // 这俩全局变量表明现在的工作状态
  isWorking = true
  isCommitting = true

  let committedExpirationTime = root.pendingCommitExpirationTime
  // root.pendingCommitExpirationTime = null

  // let updateExpirationTimeBeforeCommit = finishedWork.expirationTime
  // let childExpirationTimeBeforeCommit = finishedWork.childExpirationTime
  // let earliestRemainingTimeBeforeCommit = 
  //   childExpirationTimeBeforeCommit > updateExpirationTimeBeforeCommit ?
  //   childExpirationTimeBeforeCommit : updateExpirationTimeBeforeCommit
  // markCommittedPriorityLevels(root, earliestRemainingTimeBeforeCommit)

  let firstEffect = null
  if (!!finishedWork.effectTag) {
    // effectTag > 0 说明finishedWork头上有更新
    // 如果这个RootFiber上也有更新的话
    // 就把这个RootFiber也加入到他的effect的链表的最后
    if (!!finishedWork.lastEffect) {
      finishedWork.lastEffect.nextEffect = finishedWork
      firstEffect = finishedWork.firstEffect
    } else {
      firstEffect = finishedWork
    }
  } else {
    // 如果RootFiber上没有更新的话 就从它的firstEffect开始
    firstEffect = finishedWork.firstEffect
  }

  // 之后一共有三个循环
  // 每次循环之前都要先获得firstEffect
  // 也就是需要commit的第一个fiber

  // 这个循环主要就是调用组件上面的getSnapshotBeforeUpdate这么个生命周期方法
  nextEffect = firstEffect // nextEffect是全局变量 用来记录当前正在操作的effect对应的fiber
  while (!!nextEffect) {
    try {
      commitBeforeMutationLifecycles()
    } catch (err) {
      console.log(err)
      break
    }
  }

  // 每次循环之前都要重新nextEffect
  // 因为在上一次循环中已经被置为null了
  // 第二个循环主要目的是操作真实dom节点了 要正儿八经地实现挂载了
  // 比如dom节点的新增 插入 删除 更新等操作
  nextEffect = firstEffect
  while (!!nextEffect) {
    try {
      commitAllHostEffects()
    } catch (err) {
      console.log(err)
      break
    }
  }

  // 因为到这里为止 fiber的更新以及渲染都已经完成了
  // 所以要把保存着现在状态的finishedWork作为root的current
  // 旧的current继续作为finishedWork的alternate存在
  // 只不过现在的current变成了本次创建的workInProgress
  // 等下次setState的时候再创建根据current(本次的workInProgress)创建新的workInProgress
  root.current = finishedWork

  // 这第三个循环主要就是调用跟组件或者其他的各种各样的生命周期相关的方法
  nextEffect = firstEffect
  while (!!nextEffect) {
    try {
      commitAllLifeCycles(root, committedExpirationTime)
    } catch (err) {
      console.log(err)
      break
    }
  }

  isWorking = false
  isCommitting = false

  // 这里要把一些expirationTime再做一下判断
  // 因为在执行那些生命周期方法的时候 可能又会产生新的更新
  // 这样childExpirationTime可能会发生变化
  let updateExpirationTimeAfterCommit = finishedWork.expirationTime
  let childExpirationTimeAfterCommit = finishedWork.childExpirationTime

  // 下面这个判断的主要作用就是选出优先级相对大的那个expirationTime
  // 然后这个会作为root上的新的expirationTime
  let earliestRemainingTimeAfterCommit =
    childExpirationTimeAfterCommit > updateExpirationTimeAfterCommit
      ? childExpirationTimeAfterCommit
      : updateExpirationTimeAfterCommit

  // 当设置完这root的expirationTime之后会退出这里回到外部的while循环
  // 那个循环中又会去找到下一个优先级高的root 然后重新开始调度root
  // 比如在执行声明周期的时候 某个又执行了一下setState 那么会产生新的expirationTime
  // 那么就要继续调度fiber 继续更新
  root.expirationTime = earliestRemainingTimeAfterCommit
  root.finishedWork = null
}
 
```