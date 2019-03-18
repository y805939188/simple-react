```js
function createWorkInProgressHook() {
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
```