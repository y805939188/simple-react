```js
function dispatchAction(fiber, queue, action) {
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
```