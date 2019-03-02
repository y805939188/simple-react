```js
function renderRoot(root, isYield) {
  // 一旦开始执行renderRoot了就进入到更新或创建fiber的流程了
  // 这个流程也是working的过程 所以全局变量isWorking要置为true
  isWorking = true

  // nextExpirationTimeToWorkOn就是在findNextExpirationTimeToWorkOn函数中被赋值的
  // 它表示在异步渲染时 要commit任务的最晚时间 超过的话就要使用同步更新了
  // findNextExpirationTimeToWorkOn的值是优先级最大的待更新的任务
  // 如果没有待更新的任务的话 那他可能就是被suspense挂起的优先级最小的任务
  // 基本上不使用suspense组件的话 它就是本次更新的优先级最大的任务的那个时间
  let expirationTime = root.nextExpirationTimeToWorkOn
  if (nextUnitOfWork === null || expirationTime !== nextRenderExpirationTime) {
    // nextUnitOfWork是空说明还没有要工作的fiber
    // expirationTime不等于nextRenderExpirationTime 说明之前的异步任务中断的空隙时 有个优先级更高的任务进来了
    // 这两种情况都要先创建一个新的workInProgress 之后在更新等等操作都是在workInProgress上完成的

    // resetStack函数的作用是将之前已经更新了的父节点们的状态回滚到初始状态
    // 因为走到这里说明可能是有个新的优先级任务进来了
    // 这个任务的状态可能会和上一次更新的状态冲突 所以要先回滚
    // resetStack()
    nextRoot = root

    // nextRenderExpirationTime 表示当前正在进行渲染(生成fiber树)的优先级时间
    // 如果expirationTime !== nextRenderExpirationTime
    // 说明之前异步任务中断了 然后当主线程在浏览器手中时 用户手贱又点了一下按钮触发了setState
    // 而这时假设触发了一个同步的setState的话 之后也会进入到这个renderRoot中
    // 由于在scheduleWork中会执行那什么markPendingxxx的那个方法 所以有可能会改变root.nextExpirationTimeToWorkOn这个值
    // 然后就会又进到这里
    nextRenderExpirationTime = expirationTime
    // 创建第一个要工作的单元
    // 第二个参数是要传入的props 初始是null
    nextUnitOfWork = createWorkInProgress(root.current, null)
    root.pendingCommitExpirationTime = NoWork
  }

  // 这个workLoop就是要不停(或有停止)地递归生成fiber树
  workLoop(isYield)
  // debugger
  root.finishedWork = root.current.alternate


  // 在初次渲染时 肯定会给RootFiber一个current
  // 所以当在调度RootFiber的子节点的时候 根据current有或无 来判断是直接reconcilec还是mount
  // 所以肯定会给它的子节点
  // 不管是class类也好 函数组件也好 或者原生dom节点也好
  // 一定会有个effectTag是Placement 表示RootFiber下的这个firstChild在commit阶段要被放置
  // 之后这个RootFiber.child调度完了该调度RootFiber的孙子们了 也就是被Placement的这个child的子节点们了
  // 但是这个时候 这个节点本身包括它的子节点们均不会再生成current 也就是说在调度子节点的过程中
  // 会直接走mount的过程 mount的过程中不会给他们加上Placement 说他们的effectTag都是0
  // 所以当next === null 执行completeUnitOfWork时 只有一个fiber会作为有effect的fiber挂到finishedWork上
  // 也就是RootFiber的firstChild 这个firstChild会作为Root的firstEffect和lastEffect

  // 并且在completeUnitOfWork中会执行completeWork(workInProgress)
  // 这个函数中会特殊处理HostComponent类型的fiber 也就是原生dom的类型
  // 会先根据type来createElement 然后把props设置到这个元素节点上
  // 之后appendAllChild 如果这个节点有child的话并且这个节点是真实dom
  // 就给他appendChild咯 之后再初始化一些event相关的

  // 最后在commit阶段 由于是初次渲染 只会有一个Placement
  // 然后在commit阶段的第二个whule循环中 把这个dom节点挂载到真实的container上

  /*
    比如RootFiber下有这么个fiber结构:
      div
        h1
        h2
        Ding
          span

      首先在调度RootFiber下的firstChild也就是div的时候 会给div上一个Placement的effectTag
      然后调度h1 发现h1没有child 于是对h1执行 completeUnitOfWork
      completeUnitOfWork中执行completeWork 创建h1的真实dom节点
      然后执行appendAllChildren 发现它没有child直接退出
      之后执行finalizeInitialChildren 在这里面并把props给它设置上并将h1下的文本给inner咯
      
      随后往下走 发现h1有兄弟节点 返回兄弟节点h2的fiber作为next
      继续执行performUnitOfWork
      执行时发现h2的child也是null 于是又进入completeUnitOfWork
      然后就是和h1一样的逻辑 创建h2的真实dom 给props 插入文本节点 等
      之后返回Ding组件

      接下来就是Ding组件调度它的span子节点
      调度完把span的fiber作为next执行下一次的performUnitOfWork继续调度span的子节点
      然后发现span没有子节点 于是又进入completeUnitOfWork
      和h1与h2的逻辑一样
      之后发现它没有兄弟节点于是把它的父节点也就是return作为下一个fiber继续completeUnitOfWork

      它的父fiber是Ding组件 Ding组件由于是个ClassComponent 所以没有太多的处理
      Ding组件又没有兄弟节点 于是返回Ding组件的父fiber也就是div继续下一轮的completeUnitOfWork

      之后也会执行completeWork
      也会给div生成真实dom
      之后执行appendAllChildren 这个时候div可是有child的 那就是h1
      于是把h1给appendChild到div下 接下来根据appendAllChildren方法中的逻辑
      也会把h2 以及Ding组件下的span都给appendChild到div下 这样就完成了一个真正的dom树了
      之后初始化div的event事件系统

      最后commit阶段 由于是初次渲染 所以只会对有着Placement标志的div进行Placement
      这样就把刚才的div对应的stateNode挂载到了container上 从而完成了初次渲染
  */
      

  if (!root.finishedWork) return // 如果没有的话说明出错了或者压根儿没节点

  // pendingCommitExpirationTime在后面的commit过程中会用到
  root.pendingCommitExpirationTime = expirationTime
}
```