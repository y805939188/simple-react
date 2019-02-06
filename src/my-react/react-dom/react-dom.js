import {
  NoContext,
  ConcurrentMode
} from './ReactTypeOfMode'
import {
  NoEffect,
  Placement,
  Update,
  PlacementAndUpdate,
  Deletion,
  Callback,
  Snapshot
} from './ReactSideEffectTag'
import {
  FunctionComponent,
  ClassComponent,
  IndeterminateComponent,
  HostRoot,
  HostComponent,
  HostText,
  Mode
} from './ReactWorkTags'
import {
  NoWork,
  Never,
  Sync,
  msToExpirationTime
} from './ReactFiberExpirationTime'

let nextUnitOfWork = null
let nextRoot = null

let noTimeout = -1 // 这个没啥b用 就是单纯告诉你不延时

var firstScheduledRoot = null;
var lastScheduledRoot = null;

var callbackExpirationTime = NoWork;
var callbackID = void 0;
var isRendering = false;
var nextFlushedRoot = null;
var nextFlushedExpirationTime = NoWork;
var lowestPriorityPendingInteractiveExpirationTime = NoWork;
var hasUnhandledError = false;
var unhandledError = null;

// 这几个是控制是否批量更新的全局变量
var isBatchingUpdates = false;
var isUnbatchingUpdates = false;
var isBatchingInteractiveUpdates = false;

var completedBatches = null;

var originalStartTimeMs = performance.now()
var currentRendererTime = msToExpirationTime(originalStartTimeMs)
var currentSchedulerTime = currentRendererTime

let expirationContext = NoWork

let isWorking = false
let isCommitting = false
let nextRenderExpirationTime = NoWork

export const UpdateState = 0
export const ReplaceState = 1
// export const ForceUpdate = 2
// export const CaptureUpdate = 3

/* ---------计算时间相关 */
function requestCurrentTime() {
  if (isRendering) {
    // 已经开始渲染的话就返回最近计算出来的时间
    return currentSchedulerTime
  }
  // 这里在源码中应该还有一步找到最高优先级的root
  if (nextFlushedExpirationTime === NoWork || nextFlushedExpirationTime === Never) {
    // 这一步其实就是计算到目前为止已经花了多长时间
    // msToExpirationTime的语义就是把js在32位系统下支持的最大数字1073741823作为react可以处理的最大单元数
    // 一个单元数react定义为10ms 然后用到目前为止已经花费的时间除以10ms 计算出但目前为止已经消耗了多少单元可用的时间
    // 然后用1073741823减去这老些单元 就可以得出react还能够处理多少单元的东西
    currentSchedulerTime = currentRendererTime =msToExpirationTime(performance.now() - originalStartTimeMs)
  }
  return currentSchedulerTime
}

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

function shouldYieldToRenderer() {}
/* ---------计算时间相关 */


/* ---------创建fiber相关 */
function createFiber(tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode)
}

class FiberNode {
  // 创建一个fiber数据结构
  constructor(tag, pendingProps, key, mode) {
    this.tag = tag // 初次渲染时候的tag肯定是HostRoot 也就是3
    this.key = key
    this.elementType = null
    this.type = null // 该fiber的类型
    this.stateNode = null // 该fiber实例
  
    // Fiber
    this.return = null // 父fiber
    this.child = null // 该fiber的第一个子fiber
    this.sibling = null // 紧邻着该fiber的兄弟fiber
    this.index = 0 // 该fiber的index
  
    // this.ref = null
  
    this.pendingProps = pendingProps // 该fiber的新属性
    this.memoizedProps = null // 当前fiber的旧属性
    this.updateQueue = null // 该fiber的更新队列 这个队列上会存放一个或多个update
    this.memoizedState = null // 当前fiber的自身状态
    this.firstContextDependency = null
  
    this.mode = mode
  
    // Effects
    this.effectTag = NoEffect // 表示该fiber的更新类型 一般有放置、替换、删除这三个
    this.nextEffect = null // 下一个effect的fiber 表示下一个更新
  
    // 这两个属性是一条链表 从first指向last
    this.firstEffect = null // 第一个effect的fiber
    this.lastEffect = null // 最后一个effect的fiber
  
    this.expirationTime = NoWork // 当前fiber的更新优先级
    this.childExpirationTime = NoWork // 当前fiber的子fiber中的优先级最高
  
    this.alternate = null // 用来连接上一个状态的当前fiber
  }
}
/* ---------创建fiber相关 */


/* ---------react提供的API相关 */
function unbatchedUpdates(fn, a) {
  // a 表示参数
  if (isBatchingUpdates && !isUnbatchingUpdates) {
    // 这里是告诉全局 不进行批量更新
    // 初次渲染时候不会走到这里
    isUnbatchingUpdates = true;
    try {
      return fn(a);
    } finally {
      isUnbatchingUpdates = false;
    }
  }
  // 初次渲染会直接走到这里 这个函数就是 root.render
  return fn(a);
}
/* ---------react提供的API相关 */


function updateContainerAtExpirationTime(element, container, parentComponent, expirationTime, callback) {
  let current = container.current
  // 这里有一些获取context的方法
}


/* ---------更新任务队列相关 */
function createUpdate(expirationTime) {
  return {
    expirationTime: expirationTime, // 该更新的优先级
    tag: UpdateState, // tag表示这个更新的类型
    payload: null, // 初次渲染时表示要更新的元素 执行setState时 它是传进来的新的state
    callback: null,
    next: null,
    nextEffect: null // 下一个update对应的fiber
  }
}

function createUpdateQueue(state) {
  return {
    baseState: state, // 这个baseState就是当前这个fiber的状态 每次更新完后都会把最新的state给这个属性
    firstUpdate: null,
    lastUpdate: null,
    firstEffect: null,
    lastEffect: null,
  }
}

function appendUpdateToQueue(queue, update) {
  // 如果队列是空的话就让队列的first和last都指向一个
  // 如果队列不为空的话 就让最后一位指向当前这个update
  if (!queue.lastUpdate) {
    queue.firstUpdate = queue.lastUpdate = update;
  } else {
    queue.lastUpdate.next = update;
    queue.lastUpdate = update;
  }
}

function enqueueUpdate(current, update) {
  // 我觉得更新可以理解成是 实例的更新
  // 比如dom节点有变化了 就是dom节点这个实例要更新
  // 比如class组件要更新了 也是要调用类这个实例的方法来更新
  // 于是初次渲染的时候 根fiber的实例也就是stateNode是FiberRoot
  // 所以调用了FiberRoot这个根fiber实例上的更新方法updateContainer
  // 然后要更新的内容就是ReactDOM.render中传进来的第二个参数
  // 把这个参数作为payload放进这个fiber的更新队列上

  // 之所以有两个queue是要保持alternate和current同步
  // alternate可以理解成连接新旧fiber的一个桥
  // 当有新的update来个并更新完了之后
  // 在有些情况下如果需要恢复到上一次的状态 就可以用这个alternate

  let queue1 = null
  let queue2 = null
  let alternate = current.alternate // 初次渲染的时候肯定是null
  // 初次渲染和第一次setState时都没有alternate
  // 第一次setState时没有是因为
  // 初次渲染的时候只有current没有alternate
  // 但是在之后的逻辑中会将current和alternate的指针对换
  // 所以第一次setState时候
  if (!alternate) {
    // 进入这里一般来说就是首次渲染或首次setState
    // 第一次setState没有alternate是因为
    // 初次渲染时候alternate肯定没有值
    // 这个时候给current上创建了一个updateQueue
    // 首次渲染时是没有上一次的状态的
    // 所以也就不需要queue2
    queue1 = current.updateQueue || (current.updateQueue = createUpdateQueue(current.memoizedState))
    queue2 = null
  } else {
    // 由于在之后会把alternate和current交换指针
    // 所以在首次setState时 queue1有可能是null
    // queue1 = current.updateQueue // 得到当前fiber的updateQueue
    // queue2 = alternate.updateQueue // 得到上一次当前fiber的updateQueue
    // if (queue1 === null) {
    //   if (queue2 === null) {
    //     queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
    //     queue2 = alternate.updateQueue = createUpdateQueue(alternate.memoizedState);
    //   } else {
    //     queue1 = fiber.updateQueue = cloneUpdateQueue(queue2);
    //   }
    // } else {
    //   if (queue2 === null) {
    //     queue2 = alternate.updateQueue = cloneUpdateQueue(queue1);
    //   }
    // }
  }

  if (queue2 === null || queue1 === queue2) {
    appendUpdateToQueue(queue1, update)
  } else {

  }
}
/* ---------更新任务队列相关 */


/* ---------真正开始调度相关 */
function scheduleWorkToRoot(fiber, expirationTime) {
  let root = null
  let alternate = fiber.alternate
  let parentNode = fiber.return
  // 检测如果当前这个fiber节点的优先级要是小于新的优先级的话
  // 就要更新这个节点的优先级 第一次渲染时候传进来的fiber是RootFiber 它的初始优先级是0
  // 要在这里赋值成最高优先级
  // 如果是setState的情况 这个组件可能已经存在一个优先级了 比如上次异步时候中断的时候
  // 也就是在浏览器非空闲时间又主动触发了一次该组件的更新 此时这个fiber就有可能有个expirationTime
  if (fiber.expirationTime < expirationTime) fiber.expirationTime = expirationTime
  // 如果当前这个节点的tag类型就已经是HostRoot了 说明它自己就是个FiberRoot 直接返回它的实例就好
  if (fiber.tag === HostRoot) return fiber.stateNode
  while (parentNode !== null) {
    // 这里就是要更新当前fiber已经它所有父节点包括爷爷 太爷爷节点等等的childExpirationTime
    // 这个childExpriationTime在之后更新时候会用来判断是否可以直接跳过更新 用作优化的
    // 然后alternate上面也要保持同步
    alternate = parentNode.alternate
    if (parentNode.childExpirationTime < expirationTime) parentNode.childExpirationTime = expirationTime
    if (alternate && alternate.childExpirationTime < expirationTime) alternate.childExpirationTime = expirationTime
    // 如果parentNode的tag类型就是HostRoot的话说明当前节点的父节点就是FiberRoot 直接返回实例就成
    if (parentNode.tag === HostRoot) return parentNode.stateNode
    parentNode = parentNode.return
  }
  // 如果都退出循环走到这步了还没找到root说明可能出bug了
  return null
}

function markPendingPriorityLevel(root, expirationTime) {
  // 这个表示root上优先级最高的任务
  let earliestPendingTime = root.earliestPendingTime
  // 这个表示root上优先级最低的任务
  let latestPendingTime = root.latestPendingTime
  if (earliestPendingTime === NoWork) {
    // 第一次渲染肯定是走到这步 最高和最低这俩在初始化的时候都是NoWork状态
    root.earliestPendingTime = root.latestPendingTime = expirationTime
  } else {
    // root的最低优先级如果还大于当前这个expirationTime的话就说明当前这个expriationTime才是优先级最低的
    if (latestPendingTime > expirationTime) root.latestPendingTime = expirationTime
    // root的最高优先级如果还小于当前这个expriationTime的话就说明当前这个expirationTime才时优先级最高的
    if (earliestPendingTime < expirationTime) root.earliestPendingTime = expirationTime
  }
  // 这个函数是用来给root上添加有限级时间的 这里面添加的时间才是最后更新时候真正会用到的时间
  // findNextExpirationTimeToWorkOn(expirationTime, root)
  let nextExpirationTimeToWorkOn = expirationTime
  root.nextExpirationTimeToWorkOn = nextExpirationTimeToWorkOn
  root.expirationTime = expirationTime
}

function performSyncWork(root) {
  // 同步更新的情况下只干了一件事就是调用performWork
  // 第一个参数是表示优先级是同步的最高优先级
  // 第二个参数禁止yield也就是不能暂停 从头到尾一把梭
  // nextFlushedRoot是一个全局变量 表示接下来要更新哪个root节点
  // nextFlushedExpirationTime也是个全局变量 表示接下来要更新的root的优先级时间
  // 正常来讲不应该写在这 但是先这么着吧
  nextFlushedRoot = root
  nextFlushedExpirationTime = Sync
  performWork(Sync, false)
}

function performWork(expirationTime, isYield) {
  // react源码中这里先是找了一下有最高优先级的root
  // 调用了一个叫做findHighestPriorityRoot的方法
  // 不过有多个root也就是应用不止一个挂载点的情况比较少 所以暂时先不做 以后再弄
  if (!isYield) {
    // 进入这里说明是优先级高 不允许暂停
    // 第三个参数表示不能暂停
    performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, false)
  } else {

  }
}

function scheduleCallbackWithExpirationTime(root, expirationTime) {}

function performWorkOnRoot(root, expirationTime, isYield) {
  isRendering = true // 上来要先告诉react目前在更新(创建)fiber阶段
  let finishedWork = root.finishedWork || null // 这个就是最终生成的fiber树 初始是null
  if (finishedWork) {
    // 如果有有finishedWork说明已经生成好了fiber树
    // 或者是在异步的状态下 上一帧生成好了fiber树但是没时间提交了 于是放到这一帧
    completeRoot(root, finishedWork, expirationTime)
  } else {
    renderRoot(root, isYield)
    if (!!root.finishedWork) {
      if ( !isYield || (isYield && shouldYieldToRenderer()) ) {
        // 在renderRoot中会给root挂上最终生成的这个finishedWork 也就是fiber树
        // 如果isYield是false说明优先级高 是同步的 所以就直接肛

        // 如果不是同步是异步的也就是说允许暂停的情况的话
        // 就通过shouldYieldToRenderer这个方法判断是否还有剩余时间来渲染
        // 有的话再渲染 没有的话就等下一帧再说
        completeRoot(root, root.finishedWork, expirationTime)
      }
    }
  }
  isRendering = false
}

function renderRoot(root, isYield) {
  // 一旦开始执行renderRoot了就进入到更新或创建fiber的流程了
  // 这个流程也是working的过程 所以全局变量isWorking要置为true
  isWorking = true

  // nextExpirationTimeToWorkOn就是在findNextExpirationTimeToWorkOn函数中被赋值的
  // 我这里暂时没写那个函数 暂时先让它是Sync
  // nextExpirationTimeToWorkOn是root里有最高优先级的fiber的expirationTime
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
    nextRenderExpirationTime = expirationTime
    // 创建第一个要工作的单元
    // 第二个参数是要传入的props 初始是null
    nextUnitOfWork = createWorkInProgress(root.current, null)
    root.pendingCommitExpirationTime = NoWork
  }

  // 这个workLoop就是要不停(或有停止)地递归生成fiber树
  workLoop(isYield)
  root.finishedWork = root.current.alternate
  root.pendingCommitExpirationTime = expirationTime
}

function createWorkInProgress(current, pendingProps) {
  // 首次渲染时候只会给FiberRoot创建RootFiber 也就是这个current 所以不会有alternate
  // alternate一般是用来连接上一次状态的fiber的
  // 每次渲染或更新都会从FiberRoot开始

  // 初次渲染时这里可以理解成 把旧的最初生成的那个RootFiber当成旧的节点生成一个新的RootFiber节点
  let workInProgress = current.alternate
  if (!workInProgress) {
    workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode)
    // workInProgress.elementType = current.elementType;
    // workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode
    // 这里把旧的fiber的alternate指向新的fiber
    // 然后把新的fiber的alternate指向旧的fiber
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    // 如果已经有了alternate的话就复用这个alternate并初始化
    workInProgress.pendingProps = pendingProps
    workInProgress.effectTag = NoEffect
    workInProgress.nextEffect = null
    workInProgress.firstEffect = null
    workInProgress.lastEffect = null
  }
  // 然后要把alternate和current进行同步
  workInProgress.childExpirationTime = current.childExpirationTime
  workInProgress.expirationTime = current.expirationTime
  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue
  // workInProgress.firstContextDependency = current.firstContextDependency
  workInProgress.sibling = current.sibling
  workInProgress.index = current.index
  // workInProgress.ref = current.ref
  return workInProgress
}

function workLoop(isYield) {
  console.log(nextUnitOfWork)
  // 这里要把每一个workInProgress作为参数
  // 然后在performUnitOfWork中生成下一个workInProgress
  // 直到没有workInProgress或者时间不够用了才退出
  if (!isYield) {
    // 如果不能暂停的话就一路solo下去
    while (!!nextUnitOfWork) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
  } else {
    // 如果isYield是true说明可能是用的异步渲染
    // 那每次都要判断是否还有剩余时间
    while (!!nextUnitOfWork && !shouldYieldToRenderer()) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
  }
}

function performUnitOfWork(workInProgress) {
  let next = beginWork(workInProgress)
  workInProgress.memoizedProps = workInProgress.pendingProps

  if (next === null) {
    // next = completeUnitOfWork
  }
  return next
}

function beginWork(workInProgress) {
  let next = null
  let tag = workInProgress.tag
  if (tag === HostRoot) {
    next = updateHostRoot(workInProgress)
  } else if (tag === FunctionComponent) {

  } else if (tag === ClassComponent) {

  } else if (tag === HostComponent) {

  } else if (tag === HostText) {

  }
  // 当前这个workInProgress马上就要更新完了 所以可以把它的expirationTime置为NoWork了
  workInProgress.expirationTime = NoWork
  return next
}


function completeRoot() {

}

function requestWork(root, expirationTime) {
  // 如果isRendering是true说明目前正在更新fiber树
  // 这种情况不需要再执行requestWork 因为异步调度的关系
  // 当放在requestAnimationFrame中的下一帧的任务开始时会自动调度
  if (isRendering) return null
  // 如果是批量更新但是调用了禁止批量更新的方法那就直接更新
  if (isBatchingUpdates && isUnbatchingUpdates) performWorkOnRoot(root, Sync, false)
  // 如果是批量更新比如说同一个事件中触发了好多setState的情况下就直接return 之后的react的事件回调会触发更新渲染
  if (isBatchingUpdates && !isUnbatchingUpdates) return null
  // 如果时间是Sync说明他是个最高优先级的同步任务或者是初次渲染
  if (expirationTime === Sync) return performSyncWork(root)
  // 如果时间不为Sync说明可能是个异步任务或者批量任务
  if (expirationTime !== Sync) return scheduleCallbackWithExpirationTime(root, expirationTime)
}

function scheduleWork(fiber, expirationTime) {
  // 每次开始调度都是从root开始的 不管是第一次渲染还是setState
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
/* ---------更新任务队列相关 */


/* ---------根据类型更新fiber相关 */
function updateHostRoot(workInProgress) {
  let current = workInProgress.alternate
  let renderExpirationTime = nextRenderExpirationTime
  let updateQueue = workInProgress.updateQueue

  processUpdateQueue(workInProgress, null)

}

function processUpdateQueue(workInProgress, instance) {
  // 要保证workInProgress和alternate上的queue不指向同一个对象 否则修改了这个另外一个也改了
  let queue = ensureWorkInProgressQueueIsAClone(workInProgress)
  
  // 对于初次渲染的情况下这个firstUpdate的payload是ReactDOM.render的第一个参数
  let update = queue.firstUpdate
}

function ensureWorkInProgressQueueIsAClone(workInProgress) {
  let current = workInProgress.alternate
  let queue = workInProgress.updateQueue
  if (!!current && queue === workInProgress.updateQueue) {
    queue = workInProgress.updateQueue = cloneUpdateQueue(queue)
  }
  return queue
}

function cloneUpdateQueue(currentQueue) {
  return {
    baseState: currentQueue.baseState,
    firstUpdate: currentQueue.firstUpdate,
    lastUpdate: currentQueue.lastUpdate,
    firstEffect: null,
    lastEffect: null
  }
}

/* ---------根据类型更新fiber相关 */



/* ---------初次渲染相关 */
function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
  // 这个_reactRootContainer就是FiberRoot
  // 第一次肯定是undefined
  let root = container._reactRootContainer
  if (!root) {
    // 第二个参数是 isConcurrent 表示是否是异步渲染
    // 初次渲染肯定是false
    // react源码中还要传个是否是服务端渲染
    root = container._reactRootContainer = new ReactRoot(container, false)

    // 这里要检查callback
    // ...
    
    // 这个unbatchedUpdates啥也没干
    // 只是改了个全局变量 告诉react不要批量更新
    // 批量更新会在同时执行多个异步的时候用到 比如同时执行了好几个setTimeout
    unbatchedUpdates(function () {
      root.render(children, callback)
    })
  }
}

class ReactRoot {
  constructor(container, isConcurrent) {
    this._internalRoot = this.createFiberRoot(container, isConcurrent)
  }
  createFiberRoot = (containerInfo, isConcurrent) => {
    // 会通过new FiberNode返回一个RootFiber
    let uninitializedFiber = this.createHostRootFiber(isConcurrent)

    // 初始化一个 FiberRoot
    // 这个FiberRoot和RootFiber不是一个东西
    // 这个FiberRoot要作为RootFiber的实例也就是stateNode
    let root = {
      current: uninitializedFiber, // 
      containerInfo: containerInfo, // 这个就是ReactDOM时候传进来的第二个参数
      pendingChildren: null,

      earliestPendingTime: NoWork,
      latestPendingTime: NoWork,
      // earliestSuspendedTime: NoWork,
      // latestSuspendedTime: NoWork,
      latestPingedTime: NoWork,

      // pingCache: null,

      // didError: false,

      pendingCommitExpirationTime: NoWork,
      finishedWork: null, // 最终会生成的fiber树
      timeoutHandle: noTimeout,
      context: null,
      pendingContext: null,
      // hydrate: hydrate,
      nextExpirationTimeToWorkOn: NoWork,
      expirationTime: NoWork,
      // firstBatch: null,
      nextScheduledRoot: null, // 下一个root节点 一个react应用可能会有好多根节点

      // interactionThreadID: tracing.unstable_getThreadID(),
      // memoizedInteractions: new Set(),
      // pendingInteractionMap: new Map()
    }

    uninitializedFiber.stateNode = root
    // 这个FiberRoot要返回给_internalRoot和container._reactRootContainer
    return root
  }
  createHostRootFiber = (isConcurrent) => {
    // 第一次渲染肯定是false
    // 第一次的mode肯定是同步模式
    let mode = isConcurrent ? ConcurrentMode : NoContext
    // 第二个参数是要传入的属性props
    // 第三个参数是key
    return createFiber(HostRoot, null, null, mode)
  }
  updateContainer = (element, container, parentComponent, callback) => {
    // 这里在初次渲染时 element是children container是root parentComponent是null
    let current = container.current // current就是RootFiber
    let currentTime = requestCurrentTime() // 这里得到的是到目前为止 react还能处理多少单位时间(1单位时间是10ms)
    let expirationTime = computeExpirationForFiber(currentTime, current)
    console.log(expirationTime)
    // updateContainerAtExpirationTime(element, container, parentComponent, expirationTime, callback)
    this.scheduleRootUpdate(current, element, expirationTime, callback)
  }
  scheduleRootUpdate = (current, element, expirationTime, callback) => {
    let update = createUpdate(expirationTime)
    // payload应该是表示要更新的新的状态
    // 不过初次渲染的时候这个payload是根组件
    update.payload = { element }
    update.payload = callback

    // enqueueUpdate是用来更新该fiber上的任务队列的
    // 初次渲染的时候就是要把根组件更新到RootFiber上
    enqueueUpdate(current, update)
    // scheduleWork是开始调度工作了
    // 什么fiber树的创建或者更新 还有真实渲染啥的都是这里做的 它是最屌的
    // 也就是告诉react该干活了
    scheduleWork(current, expirationTime)
  }

  render(children, callback) {
    console.log(children)
    let root = this._internalRoot
    // 第三个参数表示parentComponent
    this.updateContainer(children, root, null, callback)
  }

  unmount = (callback) => {}

  legacy_renderSubtreeIntoContainer = () => {}

  createBatch = () => {}
}
/* ---------初次渲染相关 */



const ReactDOM = {
  render: function(element, container, callback) {
    // 第一个参数是parentComponent
    // 第四个参数是标识是否是服务端渲染
    // 这个legacyRenderSubtreeIntoContainer可能会在其他方法中被用到
    // 比如服务端渲染之类的
    return legacyRenderSubtreeIntoContainer(null, element, container, false, callback)
  }
}
export default ReactDOM
