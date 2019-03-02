```js
function createWorkInProgress(current, pendingProps) {
  // 首次渲染时候只会给FiberRoot创建RootFiber 也就是这个current 所以不会有alternate
  // alternate一般是用来连接上一次状态的fiber的 也就是current
  // 每次渲染或更新都会从FiberRoot开始
  // 一般来讲 当执行setState时class下的节点都有current
  // 但是如果是新创建的节点 就是说上一轮中根本没有这个节点的话
  // 那这种节点也不会有alternate
  let workInProgress = current.alternate
  if (!workInProgress) {
    workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode)
    // elementType和type大多数情况下都是一样的
    // 只有suspense组件情况下可能不一样
    // 因为suspense组件会先不渲染子节点
    // type或elementType一般就是
    // 什么 'div' 呀或者 class function 之类的
    workInProgress.elementType = current.elementType
    workInProgress.type = current.type
    // stateNode表示当前节点的实例 dom节点就指向真实dom
    // class组件就指向组件实例
    workInProgress.stateNode = current.stateNode
    // 这里把旧的fiber的alternate指向新的fiber
    // 然后把新的fiber的alternate指向旧的fiber
    // 也就是说让新旧的workInProgress和current产生一个联系
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    // 如果已经有了alternate的话就复用这个alternate并初始化

    // createWorkInProgress在每次触发更新的时候都会执行到
    // 但是在异步渲染的时候 每一帧不会再执行这个
    // pendingProps是新传进来的属性
    workInProgress.pendingProps = pendingProps
    // effectTag就表示当前这个节点在commit阶段要被怎么处理
    // 一般是Update(更新)Deletion(删除)Placement(插入)
    workInProgress.effectTag = NoEffect
    // 下面这仨形成一条链表
    // 表示的是当前fiber的全部的需要被更新的子节点
    // 但是不包括自己本身
    // 比如
    /*
      div(有更新)
        span#1(有更新)
        span#2(无更新)
          h1(有更新)
    */
    // 这种情况下这条链表就是 h1 → span#1
    // 但是不包括父节点的div
    // div的更新要被挂载到div的父节点上
    workInProgress.nextEffect = null
    workInProgress.firstEffect = null
    workInProgress.lastEffect = null
  }
  // 然后要把alternate和current进行同步

  // childExpirationTime是当前fiber下的子节点们最高的更新优先级
  workInProgress.childExpirationTime = current.childExpirationTime
  // expirationTime表示当前fiber上的更新的优先级
  workInProgress.expirationTime = current.expirationTime
  // 子节点
  // 这里是child 不是children
  // 因为每个fiber都只有一个child指向它的第一个child也就是ffirstChild 至于其他的子节点会作为firstChild的兄弟节点
  workInProgress.child = current.child
  // 上一个状态的props
  workInProgress.memoizedProps = current.memoizedProps
  // 上一轮状态的state
  workInProgress.memoizedState = current.memoizedState

  // workInProgress和current的updateQueue是共享的
  // 但是在后面对workInProgress的updateQueue进行操作
  // 合并多个update时会对workInProgress的updateQueue进行克隆
  // 用来保证current和workInProgress的updateQueue不再是同一个指向
  workInProgress.updateQueue = current.updateQueue
  // 这个firstContextDependency是跟新的ContextAPI相关的
  // 我这里实现的不太一样 所以暂时用不到这个属性
  // workInProgress.firstContextDependency = current.firstContextDependency
  // sibling就是当前fiber的兄弟节点
  workInProgress.sibling = current.sibling
  // 当前fiber的index 默认是0 当有多个子节点的时候
  // 子节点们会形成一个数组 然后对数组类型的子节点们
  // 进行调度的过程中会给每个子节点一个index
  // 这个index在setState过程中会被和key值一起用来
  // 尽量地对比复用减少更新
  workInProgress.index = current.index
  // ref就是实例
  workInProgress.ref = current.ref
  return workInProgress
}
```