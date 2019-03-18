/*
  useState的大概原理就是
  每当调用了一次useState就创建一个对应的workInProgressHook
  每个workInProgressHook上都有一个update的链表
  比如:
    function HooksTest() {
      let [num1, setNum1] = useState(1)
      let [num2, setNum2] = useState(99)
      ... 下面省略 ...
    }
  向上面这样就创建了两个workInProgressHook
  一个是num1的一个是num2的
  这俩workInProgressHook会形成一条链表
  作为当前函数组件的memoizedState存在

  之后当执行了某个回调 回调中触发了setXXX之类的方法时
  每触发一次setXXX就会在它对应的workInProgressHook上多挂一个update
  比如:
    function HooksTest() {
      ... 上面省略 ...
      let handleClick = () => {
        setNum1(++num1)
        setNum1(++num1)
        setNum1(++num1)
        setNum2(--num2)
        setNum2(--num2)
      }
    }
    ... 下面省略 ...
  向上面这样执行了三次setNum1就给num1对应的那个workInProgressHook上的queue
  挂上三个update 这三个update形成一条链表
  然后执行了两次setNum2就给num2对应的那个workInProgressHook上的queue
  挂上两个update 这俩也是一条链表

  然后在beginWork的过程中
  会对函数类型的组件执行updateFunctionComponent
  在这个函数调用过程中会再次触发执行当前这个函数组件
  执行函数组件的过程中又会执行到useState
  这个时候由于对应的fiber上已经挂了memoizedState
  所以此时执行的useState会走和初次渲染时不一样的逻辑
  此时会判断当前执行到的useState对应的workInProgressHook上是否有queue
  有的话循环这条queue的链表生成最终的结果并返回
*/

import { NoWork } from './ReactFiberExpirationTime'
import {
  requestCurrentTime,
  computeExpirationForFiber,
  scheduleWork,
} from './react-dom'
// 下头这几个在函数组件中使用了hooks时会用到
let renderExpirationTime = NoWork
let remainingExpirationTime = NoWork
let currentlyRenderingFiber = null
let firstCurrentHook = null
let workInProgressHook = null
let firstWorkInProgressHook = null
let isReRender = false
let currentHook = null

export function prepareToUseHooks(workInProgress, nextRenderExpirationTime) {
  let current = workInProgress.alternate
  renderExpirationTime = nextRenderExpirationTime
  currentlyRenderingFiber = workInProgress
  // 对于函数组件来讲
  // 由于不知道在函数中会调用几次hooks对应的api
  // 所以通过链表的形式来记录每次调用hooks时对应的对象
  // 所以这个memoizedState就是用来记录hooks们的链表
  firstCurrentHook = !!current ? current.memoizedState : null
}

export function finishHooks(children) {
  // 获取到当前正在render的这个函数组件
  let renderedWork = currentlyRenderingFiber
  renderedWork.memoizedState = firstWorkInProgressHook

  // remainingExpirationTime也是个全局变量 但是只有在函数组件中使用了hooks
  // 才会给它赋值 其他react的正常逻辑中不会用到这个变量
  // useReducer中判断是否要跳过当前更新时会给它赋值
  // renderedWork.expirationTime = remainingExpirationTime
  // componentUpdateQueue也是个全局变量
  // 在调用useEffect时候会执行一个pushEffect的方法
  // 里面会给这个componentUpdateQueue赋值
  // renderedWork.updateQueue = componentUpdateQueue

  // 下边这仨是在prepareToUseHooks中赋值的全局变量
  // renderExpirationTime赋值时是等于nextRenderExpirationTime
  // currentlyRenderingFiber赋值时就是当前正在render的函数组件
  // firstCurrentHook赋值时就是current.memoizedState
  renderExpirationTime = NoWork
  currentlyRenderingFiber = null
  firstCurrentHook = null

  // currentHook是在createWorkInProgressHook中赋值的
  currentHook = null
  // firstWorkInProgressHook就是本次执行该函数组件得到的所有的hooks
  // 已经在上面被保存在fiber.memoizedState上了
  firstWorkInProgressHook = null
  // workInProgressHook是每次执行useXXX产生的hook
  workInProgressHook = null
  // remainingExpirationTime = NoWork
  // componentUpdateQueue = null

  return children
}

export function resetHooks() {
  renderExpirationTime = NoWork
  currentlyRenderingFiber = null
  firstCurrentHook = null
  currentHook = null
  firstWorkInProgressHook = null
  workInProgressHook = null
  remainingExpirationTime = NoWork
  // componentUpdateQueue = null
}

export function createHook() {
  return {
    memoizedState: null,
    baseState: null,
    queue: null,
    baseUpdate: null,
    next: null
  }
}

export function cloneHook(hook) {
  return {
    memoizedState: hook.memoizedState,
    baseState: hook.baseState,
    queue: hook.queue,
    baseUpdate: hook.baseUpdate,
    next: null
  }
}

export function createWorkInProgressHook() {
  // workInProgressHook是全局变量 初始是null
  // 基本上每次进来这里workInProgressHook都是null
  // 因为在workLoop后会执行resetHooks里面会把hooks相关重置
  // 不过如果在函数组件中调用多次hook 这个workInProgress就会有值
  // 比如在同一个函数组件中连续调用多次useState
  if (!workInProgressHook) {
    if (!firstWorkInProgressHook) {
      // firstWorkInProgressHook也是全局变量 初始是null
      // 如果它上面没有值 说明当前正在执行的hook是全局中第一个被执行到的hook

      // isReRender表示
      isReRender = false
      // currentHook表示当前正在执行的hook
      // firstCurrentHook是在prepareToUseHooks中被赋值的全局变量
      // 没有current的时候就是null
      // 有current的话就是current.memoizedState
      currentHook = firstCurrentHook
      if (!currentHook) {
        // 如果当前没有正在执行的hook说明目前为止还没有创建hook
        // 于是就创建一个hook
        // workInProgressHook上要存储一条链表
        workInProgressHook = createHook()
      } else {
        // 在初次渲染时给每个useState都创建了一个workInProgressHook
        // 并且每个上面都有个updateQueue 之后所有的workInProgressHook会形成一条链表
        // 之后finishHooks方法中会把这条链表挂载到当前函数组件的memoizedState上
        // 再然后当执行setXXX触发了更新之后 会给该state对应的workInProgressHook
        // 上的queue挂载上update形成的链表
        // 等当执行了scheduleWork之后
        // 会执行到updateFunctionComponent方法中
        // 然后会先执行prepareToUseHooks
        // 这个方法中给那三个全局变量赋值
        // 其中firstCurrentHook = current.memoizedState
        // 此时已经有current并且current上也有memoizedState了
        // 就是在初次渲染时挂上的那条workInProgressHook链

        // 接下来当执行到 nextChildren = component(xxx)时候
        // 又会重新执行到函数组件中的useState
        // 执行useState又会执行到useReducer从而进入到这个createWorkInProgressHook函数中
        // 另外由于workInProgressHook和firstWorkInProgressHook这个两个全局变量
        // 每次finishHook都会被重新置为null
        // 所以还会进入到这个逻辑 不过不同的是
        // 这次再进来 就有firstCurrentHook 也就意味着currentHook也有了
        // 所以就会走到这个分支
        // 不能直接修改currentHook 因为这样相当于修改current上的东西了
        // 所以要克隆一下currentHook

        // 克隆当前这个hook
        workInProgressHook = cloneHook(currentHook)
      }
      firstWorkInProgressHook = workInProgressHook
    }
  } else {
    // 进入这里说明之前可能已经执行了一个hook了

    // workInProgressHook的next如果没值说明之前只有一个hook
    if (!workInProgressHook.next) {
      isReRender = false
      let hook = null
      // currentHook在上面那个逻辑中赋值为firstCurrentHook了
      // 但是如果是初次渲染或者是没有current的情况
      // firstCurrentHook也是null
      // 所以这里的currenHook有可能是null
      if (!currentHook) {
        hook = createHook()
      } else {
        // 当某个组件已经有current之后
        // 在重新render的话有可能会进入到这里
        // 比如:
        /*
          function Ding() {
            let [ding1, setDing1] = useState('ding1')
            let [ding2, setDing2] = useState('ding2')
            let [ding3, setDing3] = useState('ding3')
            handleClick = () => {
              setDing1('ding1111')
              setDing2('ding2222')
              setDing3('ding3333')
            }
            return (
              <div onClick={handleClick}>666</div>
            )
          }
        */
        // 当触发了点击事件 handleClick之后
        // setDing1和setDing2将俩update推入对应的workInProgressHook的updateQueue上
        // 之后走scheduleWork的更新逻辑中的updateFunctionComponent
        // 然后会重新触发该函数组件 然后执行到第一个useState的时候
        // 会走上面那个没有 workInProgressHook的逻辑 因为在初次渲染时
        // workInProgressHook会在后面被置为null
        // 但是当执行第二个useState的时候 第一轮的useState还没有被清除呢
        // 所以会进入到第二个逻辑
        // 此时currentHook在第一次的useState中已经被置为firstCurrenHook了
        // firstCurrenHook在那个prepareToUseHooks中被置为了current.memoizedState
        // 也就是初次渲染时候执行的两次useState对应生成的链表
        // 所以此时这里的currentHook表示的是初次渲染时第一个useState创建的workInProgressHook
        // 但是现在已经是执行第二个useState了 所以要让currentHook指向第一个hook的next
        // (等重新执行到第三个useState的时候也会和第二个useState走一样的逻辑)
        currentHook = currentHook.next
        // 到这儿 currentHook才是第二个useState创建的workInProgressHook
        // 然后如果有的话要克隆一下 因为我们不想操作current上的hook
        if (!currentHook) {
          hook = createHook()
        } else {
          hook = cloneHook(currentHook)
        }
      }
      // 给链表上添加新的hook
      // 这里先让workInProgressHook的next指向当前新创建(或克隆)的hook
      // 然后马上就让workInProgressHook这个全局变量又指向当前这个新的hook
      // 乍一看柑橘workInProgressHook没有next了
      // 但是实际每次产生的workInProgressHook已经作为链表
      // 在firstWorkInProgressHook上存储着了
      // 所以这么干没毛病
      workInProgressHook = workInProgressHook.next = hook
    } else {
      
    }
  }
  return workInProgressHook
}

export function dispatchAction(fiber, queue, action) {
  // 前俩参数是在执行setReducer时候就被bind上的
  // 第一个fiber表示当前这个函数组件
  // 第二个queue表示每次执行useReducer时候
  // 都会创建一个对应的独立的workInProgressHook
  // 每个workInProgressHook都有个queue
  // 比如:
  /*
    function DingTest() {
      let [xxx, setXXX] = useState('ding1') // 会产生一个xxx的workInProgressHook
      let [yyy, setYYY] = useState('ding2') // 会产生一个yyy的workInProgressHook
      let [zzz, setZZZ] = useState('ding3') // 会产生一个zzz的workInProgressHook
      ...
      // 做一些其他事
      ...
    }
  */
  // 第三个参数就是自己再执行setXXX时候传进来的那个参数了

  // 第一次执行setXXX时候是不会有alternate的 这点和setState一样
  let alternate = fiber.alternate

  if (fiber === currentlyRenderingFiber || !!alternate && alternate === currentlyRenderingFiber) {
    // 在函数组件中执行setXXXX之类的hook会进来这里
    // 一般来讲这里fiber和currentlyRenderingFiber是不相等的
    // 因为currentlyRenderingFiber会在resetHooks这个函数中被置为null
    // 不过如果在一个函数组件中直接执行了setXXX那就会进到这里
    // 比如:
    /*
      function Ding() {
        let [ding, setDing] = useState('ding')
        setDing('xxx') // 这里没有把setDing放在回调中 而是直接执行
        return (
          <div>{ding}</div>
        )
      }
    */
    // 像上面这种情况就会fiber === currentlyRenderingFiber
  } else {
    let currentTime = requestCurrentTime() // 这里得到的是到目前为止 react还能处理多少单位时间(1单位时间是10ms)
    let expirationTime = computeExpirationForFiber(currentTime, fiber)
    // 手动创建一个更新
    let update = {
      next: null,
      expirationTime,
      action
    }
    let last = queue.last
    if (!last) {
      // 如果queue上没有last的话 说明当前是第一个更新
      // 要做一条循环链表
      queue.first = update
      update.next = update
    } else {
      // 如果有last的话 就获取到第一个update
      // 然后改变链表中的next和last的指向
      // 这就是链表正常操作
      // let first = last.next
      let first = queue.first
      if (!!first) {
        update.next = first
      }
      last.next = update
    }
    queue.last = update
    // queue其实在最初次渲染的时候就被存放在每个对应的workInProgressHook上了
    // 所以在更新的时候会走一些更新的逻辑

    // 所以这个函数其实就是每次执行setXXX时给对应的更新创建一个update
    // 比如:
    /*
      function Ding() {
        let [ding, setDing] = useState('ding')
        handleClick = () => {
          setDing('ding1')
          setDing('ding2')
          setDing('ding3')
        } // 这里没有把setDing放在回调中 而是直接执行
        return (
          <div onClick={handleClick}>{ding}</div>
        )
      }
    */
    // 会给这个Ding对应的workInProgressHook上创建三个update
    // 并通过链表的形式链接起来

    scheduleWork(fiber, expirationTime)
  }
}

export function basicStateReducer(state, action) {
  return typeof action === 'function' ? action(state) : action;
}

export function useState(initialState) {
  return useReducer(basicStateReducer, initialState)
}

export function useReducer(reducer, initialState, initialAction) {
  // 当在一个组件中连续调用多次useState时候
  // 每调用一次都会产生一个新的workInProgressHook
  // 但是会有个firstWorkInProgressHook上保存着每次创建的workInProgressHook这条链表
  workInProgressHook = createWorkInProgressHook()
  // 初次渲染时候这里的queue肯定是null
  // 而当执行了setXXX进入到这里时 queue上就有可能有值
  // queue上存储的就是执行setXXX时候传进来的update的那条链表
  let queue = workInProgressHook.queue

  if (!!queue) {
    if (isReRender) {
      // 一般在函数组件render阶段时调用了setXXX就有可能进入这里
    }

    let last = queue.last
    let first = queue.first
    let baseUpdate = workInProgressHook.baseUpdate
    if (!!baseUpdate) {

    }
    if (!!first) {
      let newState = workInProgressHook.baseState
      let newBaseState = null
      let newBaseUpdate = null
      let prevUpdate = baseUpdate
      let update = first
      // let didSkip = false
      do {
        // 每个更新和class组件更新一样 都有优先级
        let updateExpirationTime = update.expirationTime
        // renderExpirationTime 是在prepareToUseHooks方法中赋值的
        // 就是nextRenderExpirationTime
        if (updateExpirationTime < renderExpirationTime) {
          // 进入这里说明当前这个更新的优先级比较低 可以放到之后再更新
          // if (!didSkip) {
          //   // 这一小块在干嘛暂时不太理解它要干嘛
          //   // 应该是要记录下被跳过的更新的前一个更新和前一个state
          //   didSkip = true
          //   newBaseUpdate = prevUpdate
          //   newBaseState = newState
          // }
          // remainingExpirationTime是一个全局变量 只有这个useReducer中会给它赋值
          // 初始是NoWork
          if (updateExpirationTime > remainingExpirationTime) {
            // 进入这里说明当前这个更新可以暂时先被跳过
            // 同时将remainingExpirationTime这个全局变量
            // 赋值为所有被跳过的更新中优先级最高的那个
            remainingExpirationTime = updateExpirationTime
          }
        } else {
          // 进入这里说明当前update不能被跳过
          let action = update.action
          // 传进来的reducer就是下面这个方法
          // function basicStateReducer(state, action) {
          //   return typeof action === 'function' ? action(state) : action
          // }
          newState = reducer(newState, action)
          // 到这为止就已经生成了一个新的值了

          // 然后用当前update的next作为下一个要循环的update
          // 同时将当前这个update记录为上一个update
          prevUpdate = update
          update = update.next
        }
      } while (update !== null && update !== first)

      // if (!didSkip) {
      //   newBaseUpdate = prevUpdate
      //   newBaseState = newState
      // }
      newBaseUpdate = prevUpdate
      newBaseState = newState

      workInProgressHook.memoizedState = newState
      workInProgressHook.baseUpdate = newBaseUpdate
      workInProgressHook.baseState = newBaseState

      return [workInProgressHook.memoizedState, queue.dispatch]
    }
  }

  if (reducer === basicStateReducer) {
    // 在使用useState时候会内部调用useReducer
    // 然后会同时将basicStateReducer作为参数传进来
    // 所以暂时可以认为通过reducer和basicStateReducer是否相等来判断是否是执行的useState
    if (typeof initialState === 'function') {
      // 如果传进来的参数是个函数的话
      // 要获取到这个函数的返回值
      initialState = initialState()
    }
  } else {
    // 如果不是调用的useState进入到的这里的话
    // 那就像是一个正常的reducer使用那样
    // 有点类似于redux中的reducer
    initialState = reducer(initialState, initialAction)
  }
  workInProgressHook.memoizedState = initialState
  workInProgressHook.baseState = initialState
  queue = workInProgressHook.queue = {
    first: null,
    last: null,
    dispatch: null
  }
  queue.dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue)
  return [workInProgressHook.memoizedState, queue.dispatch]
}

export const Dispatcher = {
  useState: useState,
  useReducer: useReducer,
  // useEffect: useEffect,
  // readContext: readContext,
  // useCallback: useCallback,
  // useContext: useContext,
  // useImperativeHandle: useImperativeHandle,
  // useDebugValue: useDebugValue,
  // useLayoutEffect: useLayoutEffect,
  // useMemo: useMemo,
  // useRef: useRef
}
