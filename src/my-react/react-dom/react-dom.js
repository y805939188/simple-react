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
  if (queue.lastUpdate === null) {
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
    queue1 = current.updateQueue // 得到当前fiber的updateQueue
    queue2 = alternate.updateQueue // 得到上一次当前fiber的updateQueue
    if (queue1 === null) {
      if (queue2 === null) {
        queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
        queue2 = alternate.updateQueue = createUpdateQueue(alternate.memoizedState);
      } else {
        queue1 = fiber.updateQueue = cloneUpdateQueue(queue2);
      }
    } else {
      if (queue2 === null) {
        queue2 = alternate.updateQueue = cloneUpdateQueue(queue1);
      }
    }
  }

  if (!queue2 || queue1 === queue2) {
    appendUpdateToQueue(queue1, update)
  }
}
/* ---------更新任务队列相关 */


/* ---------真正开始调度相关 */
function scheduleWork() {

}
/* ---------更新任务队列相关 */



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
