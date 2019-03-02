import {
  NoContext,
  ConcurrentMode
} from './ReactTypeOfMode'
import {
  NoEffect, 
  Placement, 
  Update, 
  PlacementAndUpdate, 
  ContentReset, 
  Deletion, 
  Callback, 
  Snapshot, 
  Ref 
} from './ReactSideEffectTag'
import {
  FunctionComponent, 
  ClassComponent, 
  IndeterminateComponent, 
  Fragment, 
  HostRoot, 
  HostComponent, 
  HostText, 
  HostPortal, 
  
  ContextProvider, 
  ContextConsumer 
} from './ReactWorkTags'
import {
  NoWork, 
  Never, 
  Sync, 
  msToExpirationTime 
} from './ReactFiberExpirationTime'
import {
  UpdateState 
} from './ReactUpdateQueue'

let nextUnitOfWork = null 
let nextRoot = null 
let nextEffect = null 

let firstScheduledRoot = null 
let lastScheduledRoot = null 
let isRendering = false 
let nextFlushedRoot = null 
let nextFlushedExpirationTime = NoWork 
let isWorking = false 
let isCommitting = false 
let nextRenderExpirationTime = NoWork 


let isBatchingUpdates = false
let isUnbatchingUpdates = false
let isBatchingInteractiveUpdates = false

let originalStartTimeMs = performance.now()
let currentRendererTime = msToExpirationTime(originalStartTimeMs)
let currentSchedulerTime = currentRendererTime
let expirationContext = NoWork



function requestCurrentTime() {
  if (isRendering) {
    return currentSchedulerTime
  }
  if (nextFlushedExpirationTime === NoWork || nextFlushedExpirationTime === Never) {
    currentSchedulerTime = currentRendererTime = msToExpirationTime(performance.now() - originalStartTimeMs)
  }
  return currentSchedulerTime
}

function computeExpirationForFiber(currentTime, fiber) {
  let expirationTime = null
  if (expirationContext !== NoWork) {
    expirationTime = expirationContext
  } else if (isWorking) {
    if (isCommitting) {
      expirationTime = Sync
    } else {
      expirationTime = nextRenderExpirationTime
    }
  } else {
    if (fiber.mode & ConcurrentMode) {
      if (isBatchingInteractiveUpdates) {
      } else {
      }
    } else {
      expirationTime = Sync
    }
  }
  return expirationTime
}

function shouldYieldToRenderer() {}




function createFiber(tag, pendingProps, key, mode) {
  return new FiberNode(tag, pendingProps, key, mode)
}

class FiberNode {
  
  constructor(tag, pendingProps, key, mode) {
    this.tag = tag 
    this.key = key
    this.elementType = null
    this.type = null 
    this.stateNode = null 
  
    
    this.return = null 
    this.child = null 
    this.sibling = null 
    this.index = 0 
    this.ref = null 
    this.pendingProps = pendingProps 
    this.memoizedProps = null 
    this.updateQueue = null 
    this.memoizedState = null 
    this.firstContextDependency = null
    this.mode = mode
    
    this.effectTag = NoEffect 
    this.nextEffect = null 

    
    this.firstEffect = null 
    this.lastEffect = null 
    this.expirationTime = NoWork 
    this.childExpirationTime = NoWork 
    this.alternate = null 
  }
}


function unbatchedUpdates(fn, a) {
  
  if (isBatchingUpdates && !isUnbatchingUpdates) {
    
    
    isUnbatchingUpdates = true;
    try {
      return fn(a);
    } finally {
      isUnbatchingUpdates = false;
    }
  }
  
  return fn(a);
}

function interactiveUpdates(fn, eventName, event) {
  if (isBatchingInteractiveUpdates) {
    return fn(eventName, event)
  }
  let previousIsBatchingInteractiveUpdates = isBatchingInteractiveUpdates
  let previousIsBatchingUpdates = isBatchingUpdates
  isBatchingInteractiveUpdates = true
  isBatchingUpdates = true
  try {
    return fn(eventName, event)
  } finally {
    isBatchingInteractiveUpdates = previousIsBatchingInteractiveUpdates
    isBatchingUpdates = previousIsBatchingUpdates
    if (!isBatchingUpdates && !isRendering) {
      performSyncWork()
    }
  }
}


let temp_events_obj = {
  onClick: {},
  onChange: {},
  onBlur: {},
  onFocus: {},
  onInput: {},
  onKeyDown: {},
  onKeyUp: {},
  onTouchEnd: {},
  onTouchStart: {},
  onTouchCancel: {},
  
  
}

let RootContainerHasAddedEvents = {}


function ensureListeningTo(instance, type, propKey) {
  let rootContainer = null
  let RootFiber = instance.__reactInternalInstance
  while (RootFiber.tag !== HostRoot) {
    RootFiber = RootFiber.return
  }
  rootContainer = RootFiber.stateNode.containerInfo
  if (!RootContainerHasAddedEvents.hasOwnProperty(propKey)) {
    RootContainerHasAddedEvents[propKey] = true
    let eventName = propKey.slice(2).toLowerCase()
    let eventName2 = ''
    if (eventName === 'click') {
      eventName2 = eventName
    } else if (eventName === 'change') {
      if (type === 'input' && instance.type === 'text') {
        eventName2 = 'input'
      } else if (type === 'input' && instance.type === 'file') {
        eventName2 = eventName
      } else if (type === 'select') {
        eventName2 = eventName
      } else if (type === 'textare') {
        eventName2 === 'input'
      }
    } else {
      eventName2 = eventName
    }
    if (type === 'input') {
      rootContainer.addEventListener(eventName2, interactiveUpdates.bind(null, temp_dispatch_event_fn2, propKey), false)
    } else {
      rootContainer.addEventListener(eventName2, interactiveUpdates.bind(null, temp_dispatch_event_fn1, propKey), false)
    }
  }
}

function temp_dispatch_event_fn1(eventName, event) {
  event = event || window.event
  let target = event.target || event.srcElement
  let nextFiber = target.__reactInternalInstance
  let temp_parent_arr = []
  let rootContainer = null
  while (true) {
    if (nextFiber.tag === HostRoot) {
      rootContainer = nextFiber.stateNode.containerInfo
      break
    }
    if (nextFiber.tag === HostComponent || nextFiber.tag === HostText) {
      let props = nextFiber.pendingProps
      if (props.hasOwnProperty(eventName)) {
        temp_parent_arr.push(props[eventName])
      }
    }
    nextFiber = nextFiber.return
  }

  let len = temp_parent_arr.length
  let _event = {
    nativeEvent: event
  }
  Object.defineProperty(_event, 'target', {
    get() {
      return _event.nativeEvent.target
    }
  })
  let shouldStopBubble = false
  let shouldStopBubbleFn = function () {
    shouldStopBubble = true
  }
  _event.stopBubble = shouldStopBubbleFn
  for (let i = 0; i < len; i++) {
    temp_parent_arr[i](_event)
    if (shouldStopBubble) {
      break
    }
  }
}

function temp_dispatch_event_fn2(eventName, event) {
  event = event || window.event
  let target = event.target || event.srcElement
  let nextFiber = target.__reactInternalInstance
  let temp_parent_arr = []
  let rootContainer = null
  while (true) {
    if (nextFiber.tag === HostRoot) {
      rootContainer = nextFiber.stateNode.containerInfo
      break
    }
    if (nextFiber.tag === HostComponent || nextFiber.tag === HostText) {
      let props = nextFiber.pendingProps
      if (props.hasOwnProperty(eventName)) {
        temp_parent_arr.push(props[eventName])
      }
    }
    nextFiber = nextFiber.return
  }

  let len = temp_parent_arr.length
  let _event = {
    nativeEvent: event
  }
  Object.defineProperty(_event, 'target', {
    get() {
      return _event.nativeEvent.target
    }
  })
  let shouldStopCapture = false
  let shouldStopCaptureFn = function () {
    shouldStopCapture = true
  }
  _event.stopCapture = shouldStopCaptureFn
  for (let i = len; i > 0; i--) {
    temp_parent_arr[i - 1](_event)
    if (shouldStopCapture) {
      break
    }
  }
}


function createUpdate(expirationTime) {
  return {
    expirationTime: expirationTime, 
    tag: UpdateState, 
    payload: null, 
    callback: null,
    next: null,
    nextEffect: null 
  }
}

function createUpdateQueue(state) {
  return {
    baseState: state, 
    firstUpdate: null,
    lastUpdate: null,
    firstEffect: null,
    lastEffect: null,
  }
}

function appendUpdateToQueue(queue, update) {
  
  
  if (!queue.lastUpdate) {
    queue.firstUpdate = queue.lastUpdate = update;
  } else {
    queue.lastUpdate.next = update;
    queue.lastUpdate = update;
  }
}

function enqueueUpdate(fiber, update) {
  let alternate = fiber.alternate
  let queue1 = fiber.updateQueue || null
  let queue2 = alternate ? alternate.updateQueue : null
  if (!alternate) {
    queue1 = fiber.updateQueue || (fiber.updateQueue = createUpdateQueue(fiber.memoizedState))
    queue2 = null
  } else {
    if (!queue1 && !queue2) {
      queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState)
      queue2 = alternate.updateQueue = createUpdateQueue(alternate.memoizedState)
    } else if (!queue1 && queue2) {
      queue1 = fiber.updateQueue = cloneUpdateQueue(queue2)
    } else if (queue1 && !queue2) {
      queue2 = alternate.updateQueue = cloneUpdateQueue(queue1)
    }
  }

  if (queue2 === null || queue1 === queue2) {
    appendUpdateToQueue(queue1, update)
  } else {
    if (queue1.lastUpdate || queue2.lastUpdate) {
      appendUpdateToQueue(queue1, update)
      appendUpdateToQueue(queue2, update)
    } else {
      appendUpdateToQueue(queue1, update)
      if (!!queue2.firstUpdate) {
        queue2.lastUpdate = update
      } else {
        appendUpdateToQueue(queue2, update)
      }
    }
  }
}


function scheduleWorkToRoot(fiber, expirationTime) {
  let root = null
  let alternate = fiber.alternate
  let parentNode = fiber.return
  if (fiber.expirationTime < expirationTime) fiber.expirationTime = expirationTime
  
  if (!!alternate && alternate.expirationTime < expirationTime) alternate.expirationTime = expirationTime
  if (fiber.tag === HostRoot) return fiber.stateNode
  while (parentNode !== null) {
    alternate = parentNode.alternate
    if (parentNode.childExpirationTime < expirationTime) parentNode.childExpirationTime = expirationTime
    if (alternate && alternate.childExpirationTime < expirationTime) alternate.childExpirationTime = expirationTime
    if (parentNode.tag === HostRoot) return parentNode.stateNode
    parentNode = parentNode.return
  }
  return null
}

function markPendingPriorityLevel(root, expirationTime) {
  let earliestPendingTime = root.earliestPendingTime
  let latestPendingTime = root.latestPendingTime
  if (earliestPendingTime === NoWork) {
    root.earliestPendingTime = root.latestPendingTime = expirationTime
  } else {
    if (latestPendingTime > expirationTime) root.latestPendingTime = expirationTime
    
    if (earliestPendingTime < expirationTime) root.earliestPendingTime = expirationTime
  }
  
  
  let nextExpirationTimeToWorkOn = expirationTime
  root.nextExpirationTimeToWorkOn = nextExpirationTimeToWorkOn
  root.expirationTime = expirationTime
}

function performSyncWork(root) {
 
  performWork(Sync, false)
}

function performWork(minExpirationTime, isYield) {

  findHighestPriorityRoot()

  if (!isYield) {
    
    
    while (
      !!nextFlushedRoot &&
      !!nextFlushedExpirationTime &&
      
      minExpirationTime <= nextFlushedExpirationTime
    ) {
      performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, false)
      
      
      findHighestPriorityRoot()
    }
  } else {
    
      performWorkOnRoot(nextFlushedRoot, nextFlushedExpirationTime, currentRendererTime > nextFlushedExpirationTime);
      nextFlushedExpirationTime = NoWork
      nextFlushedRoot = null
      
  }
}

function findHighestPriorityRoot() {

  let highestPriorityWork = NoWork
  let highestPriorityRoot = null
  if (!!lastScheduledRoot) {
    let root = firstScheduledRoot
    let previousScheduledRoot = lastScheduledRoot
    while (!!root) {
      let remainingExpirationTime = root.expirationTime
        
      if (remainingExpirationTime === NoWork) {
        if (root === root.nextScheduledRoot) {
          
          
          root.nextScheduledRoot = null
          firstScheduledRoot = lastScheduledRoot = null
          break
        } else if (root === firstScheduledRoot) {
          
          
          let next = root.nextScheduledRoot
          
          firstScheduledRoot = next
          
          lastScheduledRoot.nextScheduledRoot = next
          
          root.nextScheduledRoot = null
          
        } else if (root === lastScheduledRoot) {
          
              
          lastScheduledRoot = previousScheduledRoot
          
          lastScheduledRoot.nextScheduledRoot = firstScheduledRoot
          
          root.nextScheduledRoot = null
          
          
          break
        } else {
                 
          previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot
          root.nextScheduledRoot = null
        }
        
      
        root = previousScheduledRoot.nextScheduledRoot
      } else {
        
        if (remainingExpirationTime > highestPriorityWork) {
          highestPriorityRoot = root
          highestPriorityWork = remainingExpirationTime
        }
        if (root === lastScheduledRoot) break 
        if (highestPriorityWork === Sync) break 
        
        previousScheduledRoot = root
        root = root.nextScheduledRoot
      }
    }
  }
  
  nextFlushedRoot = highestPriorityRoot
  nextFlushedExpirationTime = highestPriorityWork
}

function scheduleCallbackWithExpirationTime(root, expirationTime) {}

function performWorkOnRoot(root, expirationTime, isYield) {
  isRendering = true 
  let finishedWork = root.finishedWork || null 
  if (finishedWork) {
    
    
    completeRoot(root, finishedWork, expirationTime)
  } else {
    renderRoot(root, isYield)
    if (!!root.finishedWork) {
      if ( !isYield || (isYield && shouldYieldToRenderer()) ) {
              
        completeRoot(root, root.finishedWork)
      }
    }
  }
  isRendering = false
}

function renderRoot(root, isYield) {
  
  isWorking = true
 
  let expirationTime = root.nextExpirationTimeToWorkOn
  if (nextUnitOfWork === null || expirationTime !== nextRenderExpirationTime) {
    
    nextRoot = root
  
    nextRenderExpirationTime = expirationTime
    
    
    nextUnitOfWork = createWorkInProgress(root.current, null)
    root.pendingCommitExpirationTime = NoWork
  }

  
  workLoop(isYield)
  
  root.finishedWork = root.current.alternate


  if (!root.finishedWork) return 

  root.pendingCommitExpirationTime = expirationTime
}

function createWorkInProgress(current, pendingProps) {
  
  
  

  
  let workInProgress = current.alternate
  if (!workInProgress) {
    workInProgress = createFiber(current.tag, pendingProps, current.key, current.mode)
    workInProgress.elementType = current.elementType
    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode
    
    
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    
    workInProgress.pendingProps = pendingProps
    workInProgress.effectTag = NoEffect
    workInProgress.nextEffect = null
    workInProgress.firstEffect = null
    workInProgress.lastEffect = null
  }
  
  workInProgress.childExpirationTime = current.childExpirationTime
  workInProgress.expirationTime = current.expirationTime
  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState

  
  workInProgress.updateQueue = current.updateQueue
  
  workInProgress.sibling = current.sibling
  workInProgress.index = current.index
  workInProgress.ref = current.ref
  return workInProgress
}

function workLoop(isYield) {
  

  if (!isYield) {
    
    while (!!nextUnitOfWork) {
      
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
  } else {
    
    while (!!nextUnitOfWork && !shouldYieldToRenderer()) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    }
  }
}

function performUnitOfWork(workInProgress) {
  
  let next = beginWork(workInProgress)
  workInProgress.memoizedProps = workInProgress.pendingProps

  if (next === null) {
    
    next = completeUnitOfWork(workInProgress)
  } 
  return next
}

function beginWork(workInProgress) {
  let next = null
  let tag = workInProgress.tag

  if (workInProgress.alternate !== null) {
    let oldProps = workInProgress.alternate.memoizedProps
    let newProps = workInProgress.pendingProps
    
    
    if (oldProps === newProps && workInProgress.expirationTime < nextRenderExpirationTime && workInProgress.tag !== ContextConsumer) {
      
      
      return bailoutOnAlreadyFinishedWork(workInProgress)
    }
  }

  if (tag === IndeterminateComponent) {
    

    next = mountIndeterminateComponent(workInProgress)
  } else if (tag === HostRoot) {
    next = updateHostRoot(workInProgress)
  } else if (tag === FunctionComponent) {

  } else if (tag === ClassComponent) {
    next = updateClassComponent(workInProgress)
  } else if (tag === HostComponent) {
    next = updateHostComponent(workInProgress)
  } else if (tag === HostText) {
    next = updateHostText(workInProgress)
  } else if (tag === ContextProvider) {
    next = updateContextProvider(workInProgress)
  } else if (tag === ContextConsumer) {
    next = updateContextConsumer(workInProgress)
  }
  
  workInProgress.expirationTime = NoWork
  
  return next
}

function completeUnitOfWork(workInProgress) {
  
  while(true) {
    let current = workInProgress.alternate
    let returnFiber = workInProgress.return
    let siblingFiber = workInProgress.sibling
    
    let nextUnitOfWork = completeWork(workInProgress)
    resetChildExpirationTime(workInProgress)

    
    if (!!nextUnitOfWork) return nextUnitOfWork
    
    if (!!returnFiber) {
      
      if (returnFiber.firstEffect === null) {
        
        
        returnFiber.firstEffect = workInProgress.firstEffect
      }
      if (!!workInProgress.lastEffect) {
        if (!!returnFiber.lastEffect) {
          
          
          returnFiber.lastEffect.nextEffect = workInProgress.firstEffect
        }
        
        returnFiber.lastEffect = workInProgress.lastEffect
      }

      let effectTag = workInProgress.effectTag
      
      
      let workInProgressHasEffect = effectTag & (Placement | Update | PlacementAndUpdate | Deletion | ContentReset)
      
      if (workInProgressHasEffect) {
        if (!!returnFiber.lastEffect) {
          
          
          returnFiber.lastEffect.nextEffect = workInProgress
        } else {
          
          
          returnFiber.firstEffect = workInProgress
        }
        returnFiber.lastEffect = workInProgress
      }
    }

    
    if (!!siblingFiber) return siblingFiber
    
    if (!!returnFiber) {
      workInProgress = returnFiber
      continue
    }
    return null
  }
  return null
}

function completeWork(workInProgress) {
  let tag = workInProgress.tag
  if (tag === FunctionComponent) return null
  if (tag === ClassComponent) return null
  if (tag === HostRoot) return null
  if (tag === Fragment) return null
  if (tag === ContextProvider) return null
  if (tag === ContextConsumer) return null
  if (tag === HostComponent) {
    let instance = workInProgress.stateNode
    let type = workInProgress.type
    let props = workInProgress.pendingProps
    if (!instance) {
      instance = createInstance(type, props, workInProgress)
      appendAllChildren(instance, workInProgress)
      
      
      finalizeInitialChildren(instance, type, props)
      workInProgress.stateNode = instance
    } else {
    
      
      diffAndUpdateHostComponent(workInProgress, instance, type, props)
      
    }
    markRef(workInProgress)
    return null
  }
  if (tag === HostText) {
    
    let newText = workInProgress.pendingProps
    if (newText && !!workInProgress.stateNode) {
      workInProgress.stateNode.nodeValue = newText
    } else {
      workInProgress.stateNode = document.createTextNode(newText)
    }
    return null
  }
  
  
  
  
  return null
}

function createInstance(type, props, workInProgress) {
  let children = props.children
  if (typeof children === 'string' || typeof children === 'number') {
    
  }
  
  let domElement = document.createElement(type)
  domElement.__reactInternalInstance = workInProgress
  return domElement
}

function appendAllChildren(parentInstance, workInProgress) {
  
  let node = workInProgress.child
  
  while (!!node) {
    let tag = node.tag
    if (tag === HostComponent || tag === HostText) {
      
      
      if (tag === HostText) {
        
        parentInstance.appendChild(node.stateNode)
      } else {
        parentInstance.appendChild(node.stateNode)
      }
    } else if (!!node.child) {
      
      
      
      node.child.return = node
      node = node.child
      continue
    }
    if (node === workInProgress) {
      
      
      return
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) return
      
      
      
      node = node.return
    }
    
    
    node.sibling.return = node.return
    node = node.sibling

    
  }
}

function finalizeInitialChildren(instance, type, props) {
  for (let propKey in props) {
    
    if (!props.hasOwnProperty(propKey)) continue
    let prop = props[propKey]
    if (propKey === 'style') {
      let styles = prop
      let domStyle = instance.style
      for (let styleName in styles) {
        if (!styles.hasOwnProperty(styleName)) continue
        let styleValue = styles[styleName].trim()
        domStyle[styleName] = styleValue
      }
    } else if (propKey === 'children') {
      if (typeof prop === 'string') {
        instance.textContent = prop
      }
      if (typeof prop === 'number') {
        instance.textContent = String(prop)
      }
    } else if (temp_events_obj.hasOwnProperty(propKey)) {
      
      ensureListeningTo(instance, type, propKey)
    }
  }
}

function diffAndUpdateHostComponent(workInProgress, instance, type, newProps) {
  let current = workInProgress.alternate
  let oldProps = workInProgress.alternate.memoizedProps
  if (oldProps === newProps) return

  let updatePayload = prepareUpdate(instance, type, newProps, oldProps)
  
  workInProgress.updateQueue = updatePayload
  if (!!updatePayload) workInProgress.effectTag |= Update
}

function prepareUpdate(instance, type, newProps, oldProps) {
  return diffProperties(instance, type, newProps, oldProps)
}

function diffProperties(instance, type, newProps, oldProps) {
  let updatePayload = []
  let styleValueObj = {}
  for (let propKey in oldProps) {
    if (newProps.hasOwnProperty(propKey) || !oldProps.hasOwnProperty(propKey) || !oldProps[propKey]) {
      
      
      continue
    }
    if (propKey === 'style') {
      for (let i in oldProps[propKey]) {
        styleValueObj[i] = ''
      }
    }
  }

  for (let propKey2 in newProps) {
    if (!newProps.hasOwnProperty(propKey2) || !newProps[propKey2]) continue
    if (propKey2 === 'children') {
      
      
      
      let newProp = newProps[propKey2]
      if (typeof newProp === 'string' || typeof newProp === 'number') {
        updatePayload.push(propKey2, String(newProp))
      }
    } else if (propKey2 === 'style') {
      let newStyles = newProps[propKey2]
      styleValueObj = Object.assign(styleValueObj, newStyles)
    } else if (temp_events_obj.hasOwnProperty(propKey2)) {
      
      ensureListeningTo(instance, type, propKey2)
    }
  }
  if (JSON.stringify(styleValueObj) !== '{}') {
    updatePayload.push('style', styleValueObj)
  }
  return updatePayload
}

function bailoutOnAlreadyFinishedWork(workInProgress) {
  let renderExpirationTime = nextRenderExpirationTime
  if (workInProgress.childExpirationTime < renderExpirationTime) {
    
    
    
    return null
  } else {
    let currentChild = workInProgress.child
    if (workInProgress.child === null) return null

    let newChildFiber = createWorkInProgress(currentChild, currentChild.pendingProps)
    workInProgress.child = newChildFiber
    newChildFiber.return = workInProgress
    let currentChildSibling = currentChild.sibling
    while (!!currentChildSibling) {
      
      
      let newChildFiberSibling = createWorkInProgress(currentChildSibling, currentChildSibling.pendingProps)
      newChildFiber.sibling = newChildFiberSibling
      newChildFiberSibling.return = workInProgress
      newChildFiber = newChildFiber.sibling
      currentChildSibling = currentChildSibling.sibling
    }
    
    return workInProgress.child
  }
}

function completeRoot(root, finishedWork) {
  
  
  root.finishedWork = null
  commitRoot(root, finishedWork)
}

function commitRoot(root, finishedWork) {
  
  isWorking = true
  isCommitting = true

  let committedExpirationTime = root.pendingCommitExpirationTime
  


  let firstEffect = null
  if (!!finishedWork.effectTag) {
  
    
    if (!!finishedWork.lastEffect) {
      finishedWork.lastEffect.nextEffect = finishedWork
      firstEffect = finishedWork.firstEffect
    } else {
      firstEffect = finishedWork
    }
  } else {
    
    firstEffect = finishedWork.firstEffect
  }

  nextEffect = firstEffect 
  while (!!nextEffect) {
    try {
      commitBeforeMutationLifecycles()
    } catch (err) {
      console.log(err)
      break
    }
  }

  
  nextEffect = firstEffect
  while (!!nextEffect) {
    try {
      commitAllHostEffects()
    } catch (err) {
      console.log(err)
      break
    }
  }


  root.current = finishedWork

  
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


  let updateExpirationTimeAfterCommit = finishedWork.expirationTime
  let childExpirationTimeAfterCommit = finishedWork.childExpirationTime

  let earliestRemainingTimeAfterCommit =
    childExpirationTimeAfterCommit > updateExpirationTimeAfterCommit
      ? childExpirationTimeAfterCommit
      : updateExpirationTimeAfterCommit

  root.expirationTime = earliestRemainingTimeAfterCommit
  root.finishedWork = null
}
     
function requestWork(root, expirationTime) {
  addRootToSchedule(root, expirationTime)

  if (isRendering) return null
  
  if (isBatchingUpdates && isUnbatchingUpdates) performWorkOnRoot(root, Sync, false)
  
  if (isBatchingUpdates && !isUnbatchingUpdates) return null
  
  if (expirationTime === Sync) return performSyncWork(root)
  
  if (expirationTime !== Sync) return scheduleCallbackWithExpirationTime(root, expirationTime)
}

function addRootToSchedule(root, expirationTime) {
  
  if (!root.nextScheduledRoot) {
    root.expirationTime = expirationTime
    if (!lastScheduledRoot) {
      firstScheduledRoot = lastScheduledRoot = root 
      
      root.nextScheduledRoot = root
    } else {
      
      lastScheduledRoot.nextScheduledRoot = root
      lastScheduledRoot = root
      lastScheduledRoot.nextScheduledRoot = firstScheduledRoot
    }
  } else {
    

    let remainingExpirationTime = root.expirationTime
    if (remainingExpirationTime < expirationTime) {
      
      
      root.expirationTime = expirationTime
    }
  }
}

function scheduleWork(fiber, expirationTime) {
  
  
  let root = scheduleWorkToRoot(fiber, expirationTime)
  
  if (!root) return null
  
  
  
  markPendingPriorityLevel(root, expirationTime)
  if (!isWorking) {
    
    requestWork(root, root.expirationTime)
  }
}


function resetChildExpirationTime(workInProgress) {
  let child = workInProgress.child
  let newChildExpirationTime = NoWork
  while (!!child) {
    let childUpdateExpirationTime = child.expirationTime
    let childChildExpirationTime = child.childExpirationTime
    if (childUpdateExpirationTime > newChildExpirationTime) {
      newChildExpirationTime = childUpdateExpirationTime
    }
    if (childChildExpirationTime > newChildExpirationTime) {
      newChildExpirationTime = childChildExpirationTime
    }
    child = child.sibling
  }
  workInProgress.childExpirationTime = newChildExpirationTime
}

function commitBeforeMutationLifecycles() {
  
  while (!!nextEffect) {
    let effectTag = nextEffect.effectTag
    if (effectTag & Snapshot) {
      let finishedWork = nextEffect
      let tag = finishedWork.tag
      if (tag === ClassComponent) {
        
        
        let current = finishedWork.alternate
        if (!!current) {
           
          let instance = finishedWork.stateNode
          
          let prevProps = Object.assign({}, finishedWork.type.defaultProps, current.memoizedProps)
          let prevState = Object.assign({}, current.memoizedState)
          let snapshot = instance.getSnapshotBeforeUpdate(prevProps, prevState)     
          instance.__reactInternalSnapshotBeforeUpdate = snapshot
        }
      }
    }
    nextEffect = nextEffect.nextEffect
  }
}

function commitAllHostEffects() {
  while (!!nextEffect) {
    let effectTag = nextEffect.effectTag

    if (effectTag & Ref) {
      
      
      let current = effectTag.alternate
      let currentRef = current ? current.ref : null
      if (currentRef !== null) {
        
        
        
        
        if (typeof currentRef === 'function') {
          currentRef(null)
        } else {
          currentRef.current = null
        }
      }
    }

    
    
    
    let primaryEffectTag = effectTag & (Placement | Update | Deletion)
    if (primaryEffectTag === Placement) {
      

      commitPlacement(nextEffect)
      
      nextEffect.effectTag &= ~Placement

    } else if (primaryEffectTag === PlacementAndUpdate) {
      
      
      commitPlacement(nextEffect);
      
      nextEffect.effectTag &= ~Placement
      
      commitWork(nextEffect);
    } else if (primaryEffectTag === Update) {
      
      commitWork(nextEffect)
    } else if (primaryEffectTag === Deletion) {
      
      commitDeletion(nextEffect)
      
      detachFiber(nextEffect)
    }
    nextEffect = nextEffect.nextEffect
  }
}


function commitPlacement(finishedWork) {
  
  
  let parentFiber = finishedWork.return
  while (!!parentFiber) {
    let tag = parentFiber.tag
    if (tag === HostComponent || tag === HostRoot) {
      break
    }
    parentFiber = parentFiber.return
  }

  let isContainer = null 
  let parent = null 
  let parentTag = parentFiber.tag
  if (parentTag === HostComponent) {
    parent = parentFiber.stateNode
    isContainer = false
  } else {
    parent = parentFiber.stateNode.containerInfo
    isContainer = true
  }

  
  
  
  

  
  
  

  
  let before = getHostSibling(finishedWork)
  let node = finishedWork
  while (true) {
    let childTag = node.tag
    
    
    if (childTag === HostComponent || childTag === HostText) {
      if (!!before) {
        
        
        parent.insertBefore(node.stateNode, before)
      } else {
        
        
        
        parent.appendChild(node.stateNode)
      }
    } else if (!!node.child) {
      
      
      
      
      node.child.return = node
      node = node.child
      continue
    }
    if (node === finishedWork) {
      
      return
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === finishedWork) {
        return
      }
      node = node.return
    }
    
    
    
    
    node.sibling.return = node.return
    node = node.sibling
  }
}

function commitWork(finishedWork) {
  
  let tag = finishedWork.tag
  let instance = finishedWork.stateNode

  
  
  if (tag === HostComponent) {
    if (!!instance) {
      
      
      commitUpdate(instance, finishedWork)
    }
  } else if (tag === HostText) {
    if (!!instance) {
      instance.nodeValue = finishedWork.memoizedProps
    }
  }
}

function commitDeletion(current) {
  let node = current
  let parent = node.return
  let currentParent = null
  let currentParentIsContainer = null
  while (true) {
    if (parent.tag === HostComponent) {
      currentParent = parent.stateNode
      currentParentIsContainer = false
      break
    } else if (parent.tag === HostRoot) {
      currentParent = parent.stateNode.containerInfo
      currentParentIsContainer = true
      break
    }
  }

  while (true) {
    if (node.tag === HostComponent || node.tag === HostText) {
      
      
      
      
      
      commitNestedUnmounts(node)
      currentParent.removeChild(node.stateNode)
    } else if (node.tag === HostPortal) {
      
    } else {
      
      
      commitUnmount(node)
      if (!!node.child) {
        
        node.child.return = node
        node = node.child
        continue
      }
    }
    
    
    
    
    
    if (node === current) return
    while (!node.sibling) {
      
      
      if (!node.return || node.return === current) return
      node = node.return
    }
    node.sibling.return = node.return
    node = node.sibling
  }
}

function commitNestedUnmounts(root) {
  
  let node = root
  while (true) {
    
    commitUnmount(node)
    if (!!node.child) {
      
      
      node.child.return = node
      node = node.child
      continue
    }
    if (node === root) return
    while (!node.sibling) {
      
      
      if (!node.return || node.return === root) return
      node = node.return
    }
    
    
    
    node.sibling.return = node.return
    node = node.sibling
  }
}

function commitUnmount(node) {
  
  let tag = node.tag
  if (tag === ClassComponent) {
    
    safelyDetachRef(node)
    let willUnmountLifeFn = node.stateNode.componentWillUnmount
    
    if (typeof willUnmuntLifeFn === 'function') {
      willUnmountLifeFn(node, node.stateNode)
    }
  } else if (tag === HostComponent) {
    
    safelyDetachRef(node)
  } else if (tag === HostPortal) {
    
    
    
  }
}

function safelyDetachRef(current) {
  let ref = current.ref
  if (!ref) return
  if (typeof ref === 'function') ref(null)
  if (ref instanceof Object) ref.current = null
}

function detachFiber(fiber) {
  fiber.return = null
  fiber.child = null
  fiber.memoizedState = null
  fiber.updateQueue = null
  let alternate = fiber.alternate
  if (!!alternate) {
    alternate.return = null
    alternate.child = null
    alternate.memoizedState = null
    alternate.updateQueue = null
  }
}

function getHostSibling(fiber) {
  
  

  let node = fiber
  siblings: while (true) {
    
    
    
    
    
    
    while (node.sibling === null) {
      let returnFiber = node.return
      let tag = returnFiber.tag
      if (returnFiber === null || tag === HostComponent || tag === HostRoot) {
        
        
        

        return null
      }
      node = node.return
    }

    
    
    
    
    node.sibling.return = node.return
    node = node.sibling
    
    
    
    
    
    
    
    
    
    while (node.tag !== HostComponent && node.tag !== HostText) {
      if (node.effectTag & Placement) {
        continue siblings;
      }
      if (node.child === null || node.tag === HostPortal) {
        continue siblings;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }

    
    if (!(node.effectTag & Placement)) {
      return node.stateNode
    }
  }
}

function commitUpdate(instance, finishedWork) {
  let updatePayload = finishedWork.updateQueue
  if (!updatePayload) return
  let current = finishedWork.alternate
  let newProps = finishedWork.memoizedProps
  let oldProps = current ? current.memoizedProps : null

  for (let i = 0, len = updatePayload.length; i < len; i+=2) {
    let propKey = updatePayload[i]
    let propValue = updatePayload[i + 1]
    if (propKey === 'children') {
      let firstChild = instance.firstChild
      if (firstChild && firstChild === instance.lastChild && firstChild.nodeType === 3) {
        
        firstChild.nodeValue = propValue
      } else {
        instance.textContent = propValue
      }
    } else if (propKey === 'style') {
      let style = instance.style
      for (let stylePropKey in propValue) {
        let stylePropValue = propValue[stylePropKey]
        if (stylePropKey === 'float') stylePropKey = 'cssFloat'
        style[stylePropKey] = stylePropValue
      }
    }
  }
}

function commitAllLifeCycles(finishedRoot, committedExpirationTime) {
  while (!!nextEffect) {
    let effectTag = nextEffect.effectTag
    if (effectTag & (Update | Callback)) {
      
      
      
      let tag = nextEffect.tag
      let instance = nextEffect.stateNode
      let current = nextEffect.alternate
      if (tag === ClassComponent) {
        
        
        if (effectTag & Update) {
          
          if (!current) {
            
            
            instance.componentDidMount()
          } else {
            
            
            let prevProps = current.memoizedProps
            let prevState = current.memoizedState
            
            instance.componentDidUpdate(prevProps, prevState, instance.__reactInternalSnapshotBeforeUpdate)
          }
        }

        
        
        let updateQueue = nextEffect.updateQueue
        if (!!updateQueue) {
          let effect = updateQueue.firstEffect
          while (!!effect) {
            let callback = effect.callback
            if (!!callback) {
              effect.callback = null
              callback.apply(instance)
            }
            effect = effect.nextEffect
          }
        }
      }
      else if (tag === HostComponent) {}
      else if (tag === HostRoot) {}
    }

    if (effectTag & Ref) {
      
      let ref = nextEffect.ref
      if (!!ref) {
        let instance = nextEffect.stateNode 
        if (typeof ref === 'function') ref(instance)
        if (ref instanceof Object) ref.current = instance
      }
    }
    nextEffect = nextEffect.nextEffect
  }
}






function updateHostRoot(workInProgress) {
  
  
  

  
  
  let prevState = workInProgress.memoizedState
  let prevChildren = prevState !== null ? prevState.element : null
  processUpdateQueue(workInProgress, null)
  
  
  
  let nextChildren = workInProgress.memoizedState.element
  if (prevChildren === nextChildren) {
    
    
    return bailoutOnAlreadyFinishedWork(workInProgress)
  }
  
  return reconcileChildren(workInProgress, nextChildren)
}



function updateClassComponent(workInProgress) {
  let nextProps = resolveDefaultProps(workInProgress)
  let component = workInProgress.type
  let instance = workInProgress.stateNode
  let shouldUpdate = false
  let current = workInProgress.alternate
  if (instance === null) {
    if (current !== null) {}
    constructorClassInstance(workInProgress, nextProps, component)
    mountClassInstance(workInProgress, nextProps, component)
    shouldUpdate = true
  } else {
    shouldUpdate = updateClassInstance(workInProgress, nextProps)
  }

  
  return finishClassComponent(workInProgress, shouldUpdate)
}

function constructorClassInstance(workInProgress, nextProps, component) {
  let context = null
  let instance = new component(nextProps, context)
  workInProgress.memoizedState = instance.state || null
  adoptClassInstance(workInProgress, instance)
  return instance
}

function adoptClassInstance(workInProgress, instance) {
  instance.updater = classComponentUpdater
  workInProgress.stateNode = instance
  instance._reactInternalFiber = workInProgress
}

function mountClassInstance(workInProgress, nextProps, component) {
  let instance = workInProgress.stateNode
  instance.props = nextProps
  instance.state = workInProgress.memoizedState

  let updateQueue = workInProgress.updateQueue
  if (!!updateQueue) {
    processUpdateQueue(workInProgress, instance)
    instance.state = workInProgress.memoizedState
  }

  let getDerivedStateFromProps = component.getDerivedStateFromProps
  if (!!getDerivedStateFromProps && typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(workInProgress, getDerivedStateFromProps, nextProps)
    instance.state = workInProgress.memoizedState
  }
  
  if (typeof instance.componentDidMount === 'function') {
    workInProgress.effectTag |= Update
  }
}

function applyDerivedStateFromProps(workInProgress, getDerivedStateFromProps, nextProps) {
  let prevState = workInProgress.memoizedState
  let partialState = getDerivedStateFromProps(nextProps, prevState) || {}
  let memoizedState = Object.assign({}, prevState, partialState)
  workInProgress.memoizedState = memoizedState
}

function updateClassInstance(workInProgress, newProps) {
  let instance = workInProgress.stateNode
  let oldState = workInProgress.memoizedState
  let newState = oldState
  let updateQueue = workInProgress.updateQueue
  if (!!updateQueue) {
    processUpdateQueue(workInProgress, instance)
    newState = workInProgress.memoizedState
  }

  let current = workInProgress.alternate
  let oldProps = workInProgress.memoizedProps
  if ((oldProps === newProps) && (oldState === newState)) {
    if (typeof instance.componentDidUpdate === 'function') {
      if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
        workInProgress.effectTag |= Update
      }
    }
    if (typeof instance.getSnapshotBeforeUpdate === 'function') {
      if (oldProps !== current.memoizedProps || oldState !== current.memoizedState) {
        workInProgress.effectTag |= Snapshot
      }
    }
    return false
  }

  let getDerivedStateFromProps = instance.getDerivedStateFromProps
  if (!!getDerivedStateFromProps && typeof getDerivedStateFromProps === 'function') {
    applyDerivedStateFromProps(workInProgress, getDerivedStateFromProps, newProps)
    newState = workInProgress.memoizedState
  }
  let shouldComponentUpdateLife = instance.shouldComponentUpdate
  let shouldUpdate = true
  if (typeof shouldComponentUpdateLife === 'function') {
    shouldUpdate = shouldComponentUpdate(newProps, newState)
    if (shouldUpdate) {
      if (typeof instance.componentDidUpdate === 'function') {
        workInProgress.effectTag |= Update
      }
      if (typeof instance.getSnapshotBeforeUpdate === 'function') {
        workInProgress.effectTag |= Snapshot
      }
    } else {
      workInProgress.memoizedProps = newProps
      workInProgress.memoizedState = newState
    }
  }
  instance.props = newProps
  instance.state = newState
  return shouldUpdate
}

function finishClassComponent(workInProgress, shouldUpdate) {
  markRef(workInProgress)

  if (!shouldUpdate) return bailoutOnAlreadyFinishedWork(workInProgress)
  let instance = workInProgress.stateNode
  let nextChild = instance.render()
  reconcileChildren(workInProgress, nextChild)
  workInProgress.memoizedState = instance.state
  return workInProgress.child
}



function updateHostComponent(workInProgress) {
  let nextProps = workInProgress.pendingProps 
  let nextChildren = nextProps.children
  if (typeof nextChildren === 'string' || typeof nextChildren === 'number') {
    nextChildren = null
  }
  markRef(workInProgress)
  return reconcileChildren(workInProgress, nextChildren)
}



function updateHostText(workInProgress) {
  return null
}



function mountIndeterminateComponent(workInProgress) {
  let props = workInProgress.pendingProps
  let value = workInProgress.type(props)
  workInProgress.tag = FunctionComponent
  return reconcileChildren(workInProgress, value)
}



function updateContextProvider(workInProgress) {
  let context = workInProgress.type._context
  let newProps = workInProgress.pendingProps
  let oldProps = workInProgress.memoizedProps
  let newValue = newProps.value 
  context._currentValue = newValue
  return reconcileChildren(workInProgress, newProps.children)
}

function updateContextConsumer(workInProgress) {
  let context = workInProgress.type._context
  let newProps = workInProgress.pendingProps
  let render = newProps.children
  if (typeof render !== 'function') return null
  let contextItem = {
    context,
  }
  workInProgress.firstContextDependency = contextItem
  let newValue = context._currentValue
  let newChildren = render(newValue)
  return reconcileChildren(workInProgress, newChildren)
}

function propagateContextChange(workInProgress) {
}



function processUpdateQueue(workInProgress, instance) {
  let queue = ensureWorkInProgressQueueIsAClone(workInProgress)

  let update = queue.firstUpdate
  let newBaseState = queue.baseState
  let resultState = newBaseState

  let newFirstUpdate = null
  let newExpirationTime = 0
  while (!!update) {
    let updateExpirationTime = update.expirationTime
    if (updateExpirationTime < nextRenderExpirationTime) {
      if (newFirstUpdate === null) {
        newFirstUpdate = update
        newBaseState = resultState
      }
      if (newExpirationTime < updateExpirationTime) {
        newExpirationTime = updateExpirationTime
      }
    } else {
      resultState = getStateFromUpdate(workInProgress, queue, update, instance)
      let _callback = update.callback
      if (!!_callback) {
        workInProgress.effectTag |= Callback 
      }
    }
    update = update.next
  }

  if (newFirstUpdate === null) {
    queue.lastUpdate = null
    newBaseState = resultState
  }
  queue.baseState = newBaseState
  queue.firstUpdate = newFirstUpdate
  workInProgress.expirationTime = newExpirationTime
  workInProgress.memoizedState = resultState
}

function getStateFromUpdate(workInProgress, queue, update, instance) {
  if (update.tag === UpdateState) {
    let payload = update.payload
    let partialState = null 
    let prevState = queue.baseState
    let nextProps = workInProgress.pendingProps
    if (typeof payload === 'function') {
      partialState = payload.call(instance, prevState, nextProps)
    } else {
      partialState = payload
    }
    if (payload) {
      return Object.assign({}, prevState, partialState)
    } else {
      return prevState
    }
  }
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
  let isMount = !!current ? false : true
  if (!!current) {
    workInProgress.child = reconcileChildFibers(workInProgress, newChild, isMount)
  } else {
    workInProgress.child = reconcileChildFibers(workInProgress, newChild, isMount)
  }
  return workInProgress.child
}

function reconcileChildFibers(workInProgress, newChild, isMount) {
  let current = workInProgress.alternate
  let currentFirstChild = current ? current.child : null

  if (newChild instanceof Object) {
    if (newChild.$$typeof === Symbol.for('react.element')) {
      return placeSingleChild(
        reconcileSingleElement(workInProgress, currentFirstChild, newChild),
        isMount
      )
    }
  }
  if (newChild instanceof Array) {
    return reconcileChildrenArray(workInProgress, currentFirstChild, newChild, isMount)
  }
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    return reconcileSingleTextNode(workInProgress, currentFirstChild, String(newChild))
  }
  deleteRemainingChildren(workInProgress, currentFirstChild)
  return null
}

function markRef(workInProgress) {
  let newRef = workInProgress.ref
  let current = workInProgress.alternate
  if (!!newRef) {
    if (!current) {
      workInProgress.effectTag |= Ref
    } else if (!!current && current.ref !== newRef) {
      workInProgress.effectTag |= Ref
    }
  }
}


function reconcileSingleElement(returnFiber, currentFirstChild, element) {
  let createdFiber = null
  while (currentFirstChild !== null) {
    if (currentFirstChild.key === element.key) {
      if (currentFirstChild.elementType === element.type) {
        deleteRemainingChildren(returnFiber, currentFirstChild.sibling)
        let existingFiber = useFiber(currentFirstChild, element.props)
        existingFiber.return = returnFiber
        return existingFiber
      } else {
        deleteRemainingChildren(returnFiber, currentFirstChild)
        break
      }
    } else {
      deleteChild(returnFiber, currentFirstChild)
    }
    currentFirstChild = currentFirstChild.sibling
  }
  if (element.type !== Symbol.for('react.fragment')) {
    createdFiber = createFiberFromElement(element, returnFiber.mode)
    createdFiber.ref = element.ref
    createdFiber.return = returnFiber
  } else {
  }
  return createdFiber
}

function placeSingleChild(newFiber, isMount) {
  if (!isMount && !newFiber.alternate) {
    newFiber.effectTag = Placement
  }
  return newFiber
}

function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, isMount) {
  let expirationTime = nextRenderExpirationTime
  let resultingFirstChild = null
  let previousNewFiber = null
  let oldFiber = currentFirstChild
  let lastPlacedIndex = 0
  let newIdx = 0
  let nextOldFiber = null
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber
      oldFiber = null
    } else {
      nextOldFiber = oldFiber.sibling
    }
    const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], expirationTime)
    if (newFiber === null) {
      if (oldFiber === null) {
        oldFiber = nextOldFiber
      }
      break
    }
    if (!isMount) {
      if (oldFiber && newFiber.alternate === null) {
        deleteChild(returnFiber, oldFiber)
      }
    }
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
    if (previousNewFiber === null) {
      resultingFirstChild = newFiber
    } else {
      previousNewFiber.sibling = newFiber
    }
    previousNewFiber = newFiber
    oldFiber = nextOldFiber
  }

  
  if (newIdx === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber)
    return resultingFirstChild
  }

  
  if (oldFiber === null) {
    for (; newIdx < newChildren.length; newIdx++) {
      
      const newFiber = createChild(
        returnFiber,
        newChildren[newIdx],
        expirationTime,
      );
      if (!newFiber) {
        continue
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }
      previousNewFiber = newFiber
    }
    return resultingFirstChild
  }
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber)
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      expirationTime,
    );
    if (newFiber) {
      if (!isMount) {
        if (newFiber.alternate !== null) {
          existingChildren.delete(
            newFiber.key === null ? newIdx : newFiber.key,
          )
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx, isMount)
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }
      previousNewFiber = newFiber
    }
  }
  if (!isMount) {
    existingChildren.forEach(child => deleteChild(returnFiber, child))
  }

  return resultingFirstChild
}

function updateSlot(returnFiber, oldFiber, newChild, expirationTime) {
  const key = oldFiber !== null ? oldFiber.key : null
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    if (key !== null) {
      return null
    }
    return updateTextNode(returnFiber, oldFiber, '' + newChild, expirationTime)
  }

  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case Symbol.for('react.element'): {
        if (newChild.key === key) {
          return updateElement(returnFiber, oldFiber, newChild, expirationTime)
        } else {
          return null
        }
      }
    }
  }
  return null
}

function createChild(returnFiber, newChild) {
  if (!newChild) return null
  let createdFiber = null
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    createdFiber = createFiberFromText(String(newChild), returnFiber.mode)
  }
  if (newChild instanceof Object) {
    if (newChild.$$typeof === Symbol.for('react.element')) {
      createdFiber = createFiberFromElement(newChild, returnFiber.mode)
    }
  }
  createdFiber.ref = newChild.ref
  createdFiber.return = returnFiber
  return createdFiber
}

function placeChild(newFiber, lastPlacedIndex, newIndex, isMount) {
  newFiber.index = newIndex
  if (isMount) {
    return lastPlacedIndex
  }
  const current = newFiber.alternate
  if (current !== null) {
    const oldIndex = current.index
    if (oldIndex < lastPlacedIndex) {
      newFiber.effectTag = Placement
      return lastPlacedIndex
    } else {
      return oldIndex
    }
  } else {
    newFiber.effectTag = Placement
    return lastPlacedIndex
  }
}

function updateTextNode(returnFiber, current, textContent, expirationTime) {
  if (current === null || current.tag !== HostText) {
    const created = createFiberFromText(textContent, returnFiber.mode, expirationTime)
    created.return = returnFiber
    return created
  } else {
    const existing = useFiber(current, textContent, expirationTime)
    existing.return = returnFiber
    return existing
  }
}

function updateElement(returnFiber, current, element, expirationTime) {
  if (current !== null && current.elementType === element.type) {
    const existing = useFiber(current, element.props, expirationTime)
    existing.ref = element.ref
    existing.return = returnFiber
    return existing
  } else {
    
    const created = createFiberFromElement(element, returnFiber.mode, expirationTime)
    created.ref = element.ref
    created.return = returnFiber
    return created
  }
}

function updateFromMap(existingChildren, returnFiber, newIdx, newChild, expirationTime) {
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    const matchedFiber = existingChildren.get(newIdx) || null
    return updateTextNode(returnFiber, matchedFiber, '' + newChild, expirationTime)
  }
  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        const matchedFiber =
          existingChildren.get(newChild.key === null ? newIdx : newChild.key) || null
        return updateElement(
          returnFiber,
          matchedFiber,
          newChild,
          expirationTime,
        )
      }
    }
  }
  return null
}

function mapRemainingChildren(returnFiber, currentFirstChild) {
  const existingChildren = new Map()
  let existingChild = currentFirstChild
  while (existingChild !== null) {
    if (existingChild.key !== null) {
      existingChildren.set(existingChild.key, existingChild)
    } else {
      existingChildren.set(existingChild.index, existingChild)
    }
    existingChild = existingChild.sibling
  }
  return existingChildren
}

function createFiberFromElement(element, mode) {
  let expirationTime = nextRenderExpirationTime
  return createFiberFromTypeAndProps(element.type, element.key, element.props, mode, expirationTime)
}

function createFiberFromTypeAndProps(type, key, pendingProps, mode, expirationTime) {
  let flag = IndeterminateComponent 
  if (typeof type === 'function') {
    if (isClassComponent(type)) {
      flag = ClassComponent
    }
  } else if (typeof type === 'string') {
    flag = HostComponent
  } else {
    let tag = type.$$typeof
    if (tag === Symbol.for('react.provider')) {
      flag = ContextProvider
    } else if (tag === Symbol.for('react.context')) {
      flag = ContextConsumer
    }
  }

  let fiber = createFiber(flag, pendingProps, key, mode)
  fiber.elementType = type
  fiber.type = type
  fiber.expirationTime = expirationTime
  return fiber
}

function reconcileSingleTextNode(returnFiber, currentFirstChild, text) {
  let expirationTime = nextRenderExpirationTime
  if (!!currentFirstChild && currentFirstChild.tag === HostText) {
    deleteRemainingChildren(returnFiber, currentFirstChild)
    let existingFiber = useFiber(currentFirstChild, text, expirationTime)
    existingFiber.return = returnFiber
    return existingFiber
  }
  let createdFiber = createFiberFromText(text, returnFiber.mode)
  createdFiber.return = returnFiber
  return createdFiber
}

function createFiberFromText(text, mode) {
  let fiber = new createFiber(HostText, text, null, mode)
  fiber.expirationTime = nextRenderExpirationTime
  return fiber
}

function deleteRemainingChildren(returnFiber, currentFirstChild) {
  let returnFiberLastChild = null
  while (!!currentFirstChild) {
    
    deleteChild(returnFiber, currentFirstChild)
    if (!currentFirstChild.sibling) {
      returnFiberLastChild = currentFirstChild
      break
    }
    currentFirstChild = currentFirstChild.sibling
  }
  return returnFiberLastChild
}

function deleteChild(returnFiber, toBeDeleteChild) {
  toBeDeleteChild.effectTag = Deletion
  let last = returnFiber.lastEffect
  if (!!last) {
    last.nextEffect = toBeDeleteChild
    returnFiber.lastEffect = toBeDeleteChild
  } else {
    returnFiber.firstEffect = returnFiber.lastEffect = toBeDeleteChild
  }
  toBeDeleteChild.nextEffect = null
}

function useFiber(toBeCloneFiber, pendingProps) {
  let clonedFiber = createWorkInProgress(toBeCloneFiber, pendingProps)
  clonedFiber.index = 0
  clonedFiber.sibling = null
  return clonedFiber
}



function isClassComponent(fn) {
  return fn.prototype && fn.prototype.isReactComponent
}
function resolveDefaultProps(workInProgress) {
  let pendingProps = workInProgress.pendingProps
  let component = workInProgress.type
  let defaultProps = component.defaultProps
  let resolvedProps = pendingProps
  if (defaultProps && defaultProps instanceof Object) {
    resolvedProps = Object.assign({}, defaultProps, pendingProps)
  }
  return resolvedProps
}






function legacyRenderSubtreeIntoContainer(parentComponent, children, container, forceHydrate, callback) {
  let root = container._reactRootContainer
  if (!root) {
    let isConcurrent = false
    root = container._reactRootContainer = new ReactRoot(container, isConcurrent)
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
    let uninitializedFiber = this.createHostRootFiber(isConcurrent)
    let root = {
      current: uninitializedFiber, 
      containerInfo: containerInfo, 
      pendingChildren: null, 

      earliestPendingTime: NoWork, 
      latestPendingTime: NoWork, 
      latestPingedTime: NoWork,
      pendingCommitExpirationTime: NoWork, 
      finishedWork: null, 
      timeoutHandle: -1, 
      context: null, 
      pendingContext: null,
      
      nextExpirationTimeToWorkOn: NoWork, 
      expirationTime: NoWork, 
      
      nextScheduledRoot: null, 
      
    }

    uninitializedFiber.stateNode = root
    return root
  }
  createHostRootFiber = (isConcurrent) => {
    let mode = isConcurrent ? ConcurrentMode : NoContext
    return createFiber(HostRoot, null, null, mode)
  }
  updateContainer = (element, container, parentComponent, callback) => {
    let current = container.current 
    let currentTime = requestCurrentTime() 
    let expirationTime = computeExpirationForFiber(currentTime, current)
    this.scheduleRootUpdate(current, element, expirationTime, callback)
  }
  scheduleRootUpdate = (current, element, expirationTime, callback) => {
    let update = createUpdate(expirationTime)
    update.payload = { element }
    update.callback = callback

    enqueueUpdate(current, update)
    scheduleWork(current, expirationTime)
  }

  render(children, callback) {
    let root = this._internalRoot
    let work = new ReactWork()
    if (!!callback) work.then(callback)
    this.updateContainer(children, root, null, work._onCommit)
  }

  unmount = (callback) => {}

  legacy_renderSubtreeIntoContainer = () => {}

  createBatch = () => {}
}

class ReactWork {
  _callbacks = []
  _didCommit = false
  _onCommit = this._onCommit.bind(this)
  then(callback) {
    if (typeof callback === 'function') {
      this._callbacks.push(callback)
    }
  }
  _onCommit() {
    if (this._didCommit) return
    this._didCommit = true
    if (this._callbacks.length > 0) {
      this._callbacks.forEach((item) => {
        item()
      })
    }
  }
}




const classComponentUpdater = {
  
  enqueueSetState(instance, payload, callback) {
    let fiber = instance._reactInternalFiber
    let currentTime = requestCurrentTime()
    let expirationTime = computeExpirationForFiber(currentTime, fiber)
    let update = createUpdate(expirationTime)
    update.payload = payload
    enqueueUpdate(fiber, update)
    scheduleWork(fiber, expirationTime)
  },
  enqueueForceUpdate() {}
}

const ReactDOM = {
  render: function(element, container, callback) {
    return legacyRenderSubtreeIntoContainer(null, element, container, false, callback)
  }
}
export default ReactDOM