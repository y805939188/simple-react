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
import {
  UpdateState // setState和ReactDOM.render的时候都是这个类型
} from './ReactUpdateQueue'

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
  // 每次一轮更新完成之后earliestPendingTime和latestPendingTime还有latestPendingTime
  // 会被重置为NoWork
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
  root.finishedWork = root.current.alternate
  // pendingCommitExpirationTime在后面的commit过程中会用到
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

    // createWorkInProgress在每次触发更新的时候都会执行到
    // 但是在异步渲染的时候 每一帧不会再执行这个
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

  // eorkInProgress和current的updateQueue是共享的
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
      // 每个节点或者说每个react元素都是一个unit
      // 不管是真实dom节点还是class类或是函数节点
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
  // beginWork就是开始工作 开始工作就是创建出子fiber节点
  let next = beginWork(workInProgress)
  workInProgress.memoizedProps = workInProgress.pendingProps

  if (next === null) {
    // 子fiber节点是null了
    // 说明一侧的fiber树创建完成
    // 然后要在completeUnitOfWork函数中将这一侧的update都挂到root上
    // next = completeUnitOfWork
    // 然后在completeUnitOfWork中找到兄弟节点作为next进行兄弟节点上的fiber的创建
    // 如果都到这里了 这next还是返回null 就说明这个root下的节点们都已经完成了fiber
    // 就可以进行下一步的commit了
  }
  return next
}

function beginWork(workInProgress) {
  let next = null
  let tag = workInProgress.tag

  let oldProps = workInProgress.alternate.memoizedProps
  let newProps = workInProgress.pendingProps

  // 每个current也就是每个fiber都有自己的expirationTime
  // 这个expirationTime是当执行setState的时候在通过实例找root的那个函数中
  // 会把新计算出来的expirationTime放在那个类的fiber上
  // 然后在最后任务执行完了就会把那个fiber的expirationTime重置为NoWork
  // 所以这里的updateExpirationTime得到的很可能是0 如果这个fiber上没有更新的话那就会是0
  // 因为在createWorkInProgress的时候会将current.expirationTime赋值给workInProgress.expirationTime
  // 而renderExpirationTime则是root.nextExpirationTimeToWorkOn给赋值的全局变量 是当前任务的更新时间
  // 所以如果某个fiber上的updateExpirationTime是0就会小于renderExpirationTime也就会执行下面那个跳过更新的逻辑
  if (oldProps === newProps && workInProgress.expirationTime < nextRenderExpirationTime) {
    // 这个函数用来跳过本fiber的更新的方法
    // 如果当前workInProgress没有子节点就返回个null 如果有子节点就返回一个子节点的克隆
    return bailoutOnAlreadyFinishedWork(workInProgress)
  }


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

function bailoutOnAlreadyFinishedWork(workInProgress) {
  if (workInProgress.childExpirationTime < renderExpirationTime) {
    // childExpirationTime表示该fiber以及它的子节点们上优先级最大的一个更新
    // 所以进入这里就是说这个fiber包括它的子节点上没有任何一个fiber的更新的优先级要大于或等于这个renderExpirationTime
    // 就可以直接把这个fiber以及它的子节点们都跳过
    // 比如说:
    // <div id="ding1">
    //   <Dingge></Dingge>
    //   <Dingye></Dingye>
    // </div>
    // 假设在Dingye这个组件上执行了一个setState产生了一个更新
    // 那么这个更新计算出来的新的expirationTime会被挂到root上并会被作为全局变量renderExpirationTime
    // 然后renderRoot的时候会从root的fiber一直往下遍历
    // 当遍历到Dingge这个组件的时候 由于该组件上没有产生更新 所以该组件上的childExpirationTime也是0
    // 那么就可以直接跳过这个Dingge组件的更新
    // 跳过返回null之后会到performUnitOfWork中 判断出next是null了 就会执行completeUnitOfWork
    // 然后会找到这个Dingge的兄弟节点也就是Dingye Dingye身上有childExpirationTime 所以就不会跳过Dingye这个组件
    return null
  } else {
    let currentChild = workInProgress.child
    if (workInProgress.child === null) return null
    // 在createWorkInProgress中会判断currentChild是否有alternate
    // 有就说明这个fiber之前就setState过 没有就说明是第一次更新
    // 另外如果这个currentChild正好有更新的话 那么在scheduleWork
    // 那个函数中第一步执行的找root的方法中 就会给这个fiber赋上expirationTime
    // 之后在这里的createWorkInProgress中会给新返回的workInProgress也赋值上那个上面那句话里的expirationTime
    // 这样当下一次再执行beginWork的时候就有可能不跳过了
    let newChildFiber = createWorkInProgress(currentChild, currentChild.pendingProps)
    workInProgress.child = newChildFiber
    newChildFiber.return = workInProgress
    let currentChildSibling = currentChild.sibling
    while (!!currentChildSibling) {
      // 如果这个child有兄弟节点的话保证它兄弟节点也是克隆的
      // 把它的所有兄弟节点都要创建克隆的workInProgress
      let newChildFiberSibling = createWorkInProgress(currentChildSibling, currentChildSibling.pendingProps)
      newChildFiber.sibling = newChildFiberSibling
      newChildFiberSibling.return = workInProgress
      newChildFiber = newChildFiber.sibling
      currentChildSibling = currentChildSibling.sibling
    }
    // 最后返回第一个子节点
    return workInProgress.child
  }
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
/* ---------更新任务队列相关 */


/* ---------根据类型更新fiber相关 */
function updateHostRoot(workInProgress) {
  // let current = workInProgress.alternate
  // let renderExpirationTime = nextRenderExpirationTime
  // let updateQueue = workInProgress.updateQueue

  // 对于Root来讲 它的state就是ReactDOM.render传进来的第一个参数
  // 当然第一次肯定是没有的 因为这里获取的prevChildren 初次渲染的时候没有上一个节点
  let prevState = workInProgress.memoizedState
  let prevChildren = prevState !== null ? prevState.element : null
  processUpdateQueue(workInProgress, null)
  // 这个memoizedState是在上面那个provessUpdateQueue中赋值的
  // 就是从update上把payload拿出来 对于Root节点 它的payload是 {element}
  // 所以这里获取到的nextChildren就是这个element
  let nextChildren = workInProgress.memoizedState.element
  if (prevChildren === nextChildren) {
    // 如果上次的element和这次element一样 那么就跳出这个Root的更新
    // 一般来讲都会跳出的 因为很少有场景是直接改变ReactDOM.render的第一个参数的
    return bailoutOnAlreadyFinishedWork(workInProgress)
  }
  // 该去调和Root的子节点了
  return reconcileChildren(workInProgress, nextChildren)
}

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

function getStateFromUpdate(workInProgress, queue, update, instance) {
  if (update.tag === UpdateState) {
    // 这个payload有可能是执行setState时候传进来的新的状态
    // 也有可能是初次渲染的时候传进来的那个element
    let payload = update.payload
    let partialState = null // partialState是部分state的意思
    let prevState = queue.baseState
    let nextProps = workInProgress.pendingProps
    if (typeof payload === 'function') {
      // setState时候可以传个函数
      // 传函数的话一定得有个返回值
      partialState = payload.call(instance, prevState, nextProps)
    }
    // 如果payload不是函数的话说明要么传的是个对象 要么是初次渲染时候的{element}
    if (payload) {
      return Object.assign({}, prevState, partialState)
    } else {
      return prevState
    }
  }
  // else if (update.tag === forceState) {}
  // else if (update.tag === ReplaceState) {}
  // else if (update.tag === CaptureUpdate) {}
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

function reconcileChildren(workInProgress, newChild) {
  let current = workInProgress.alternate
  if (!!current) {
    workInProgress.child = reconcileChildFibers(workInProgress, newChild)
  } else {
    // 进入这里说明没有current 一般不会发生在初次渲染
  }
  return workInProgress.child
}

function reconcileChildFibers(workInProgress, newChild) {
  let current = workInProgress.alternate
  let returnFiber = workInProgress
  let currentFirstChild = current.child

  let isObject = newChild instanceof Object
  if (newChild instanceof Object) {
    // 说明newChild是个对象 可能是react元素
    if (newChild.$$typeof === Symbol.for('react.element')) {
      // $$typeof:Symbol(react.xxx) 是react元素的标志
      return reconcileSingleElement(returnFiber, currentFirstChild, newChild)
    }
  }
  if (newChild instanceof Array) {
    // 说明newChild是个数组 数组可能是好多同级的react元素
  }
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    // 说明newChild是个文本类型的
  }
  return deleteRemainingChildren(returnFiber, currentFirstChild)
}

function reconcileSingleElement(returnFiber, child, element) {
  let expirationTime = nextRenderExpirationTime
  let key = element.key
  while (child !== null) {
    
  }
}

function deleteRemainingChildren() {}

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
