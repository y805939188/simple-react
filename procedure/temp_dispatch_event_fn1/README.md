```js
// 我自己瞎写的事件代理
// 因为源码的实在太复杂了
// 虽然可以 但是我觉得没必要
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
 
```