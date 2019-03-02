```js
 function completeUnitOfWork(workInProgress) {
  /*
    能进入这个函数 说明当前这个workInProgress有一侧已经到头了
    比如说:

    <div>
      |
      |
      | child 
      |
      ↓     sibling
    <img> ——————————→ <img>
      |
      |
      | child
      | 
      ↓    sibling         sibling
     <p> ——————————→ <p> ——————————→ <p>
      |
      |
      | child
      |
      ↓
     null

     遍历到一侧就是说 比如当前这个workInProgress是指代的img标签
     那么img的child是一个p p的sibling是下一个p
     当对img的第一个p执行完了beginWork 由于它没有子节点 所以 next = beginWork返回的next是null
     这就是完成了一侧 这个时候就要进入这个completeUnitOfWork中
  */
  while(true) {
    let current = workInProgress.alternate
    let returnFiber = workInProgress.return
    let siblingFiber = workInProgress.sibling

    // let nextUnitOfWork = workInProgress
    // 这个completeWork中会执行对原生dom节点的创建
    // 属性的设置child的append等操作
    let nextUnitOfWork = completeWork(workInProgress)
    resetChildExpirationTime(workInProgress)

    // 几乎不会用到这个逻辑 因为除了suspense组件 其他类型nextUnitOfWork都是null
    if (!!nextUnitOfWork) return nextUnitOfWork

    // 接下来要构造出一条链表
    // 给所有有effect的fiber构造
    // 将来在commit的时候会找这条链表
    // 这条链表上就是所有有effect的节点的
    if (!!returnFiber) {
      // 进到这里就是一个正常的情况

      // firstEffect表示当前fiber的子节点中的第一个更新
      // lastEffect表示当前fiber的子节点中的最后一个更新
      // effectTag表示当前fiber自己的更新
      // 然后这里会判断当前的fiber的父fiber
      // 也就是returnFiber上是否有firstEffect
      // 没有的话直接把当前fiber的firstEffect给它
      // 然后把当前fiber的lastEffect也给它
      // 之后判断当前fiber自己是否有更新 如果有的话
      // 就让当前这个fiber的更新变成returnFiber的lastEffect
      // 也就是说最后在根节点上的firstEffect和lastEffect的结构
      // 或者说这条链表表示的更新顺序是

      /*
        d: 最深处的
        c: 子节点(的)
        f: 父节点(的)
        s: 兄弟节点(的)
        
        dc → dcs → dcf → dcfsc → dcfscs → dcfs → dcff
        
        或者说顺序是:
          div 7
            div 3
              div 1
              div 2
            div 6
              div 4
              div 5

        最后这个链表会记录到RootFiber上也就是最终生成的finishedWork
      */

      if (returnFiber.firstEffect === null) {
        // 进入这里表示当前这个fiber的父节点上还没有记录任何一个有副作用的子节点
        // 然后就直接把当前节点的第一个副作用节点赋值给父节点
        returnFiber.firstEffect = workInProgress.firstEffect
      }
      if (!!workInProgress.lastEffect) {
        if (!!returnFiber.lastEffect) {
          // 如果父节点上已经有了副作用节点
          // 那就把当前这个节点的副作用挂到父节点的副作用的末尾
          returnFiber.lastEffect.nextEffect = workInProgress.firstEffect
        }
        // 然后更新父节点的最后一个effect节点
        returnFiber.lastEffect = workInProgress.lastEffect
      }

      // 初次渲染时 比如有个class类渲染
      // 那么类里面的render返回值上不会有effectTag 只会在class类自己本身这个fiber上有
      // 初次渲染时可能会是 3 因为在finishClassComponent方法中会 |= 一个PerformedWork(1)
      // 而当对RootFiber执行beginWork 调度子节点的时候 如果RootFiber的child是class组件的话
      // 当进入了reconcileChildren时 由于RootFiber有current 所以不会进入mount调度的逻辑
      // 于是当执行placeSingleChild的时候 会判断是否是执行的mount的逻辑
      // 如果是mount逻辑的话 那么就不给他加 Placement 如果不是mount的逻辑 那么就给他加个Placement的标识
      // 在react源码中调试的话 如果RootFiber下有个child是class组件 那么它走到这里时
      // 它的effectTag可能会是3 也就是 Placrment + PerformedWork
      // 这儿PerformedWork应该没什么太大用 源码中的注释标识这个performedWork是给devTools用的

      let effectTag = workInProgress.effectTag
      // 每个fiber上都有effectTag和firstEffect跟lasteEffect
      // effectTag是标识这个fiber自己本身有何种更新
      // 而firstEffect和lasteEffect是当前fiber需要更新的子节点们的链表
  
      // & 的意思就是看effectTag上是否有这个标志
      // 比如 Placement 是0b000000000010
      // 如果effectTag是Placement(0b000000000010)或PlacementAndUpdate(0b000000000110)的话
      // 那么执行 effectTag & Placement 会返回一个非0的数
      // 反之如果effectTag没有Placement之类的标志 那么就会返回0

      let workInProgressHasEffect = effectTag & (Placement | Update | PlacementAndUpdate | Deletion | ContentReset)
      // 然后就要把当前节点的父节点的last和firsteffect更新为当前节点
      if (workInProgressHasEffect) {
        if (!!returnFiber.lastEffect) {
          // 进入这里说明之前returnFiber上就存在待更新的节点
          // 那就把当前节点作为lastEffect
          returnFiber.lastEffect.nextEffect = workInProgress
        } else {
          // 进入这里说明之前returnFiber上没有待更新的节点
          // 就可以直接让firstEffect等于当前节点的fiber
          returnFiber.firstEffect = workInProgress
        }
        returnFiber.lastEffect = workInProgress
      }
    }

    // 如果有兄弟节点的话 优先把兄弟节点作为next返回
    if (!!siblingFiber) return siblingFiber
    // 没有兄弟节点的话往上找它的父节点 returnFiber
    if (!!returnFiber) {
      workInProgress = returnFiber
      continue
    }
    return null
  }
  return null
}
 
```