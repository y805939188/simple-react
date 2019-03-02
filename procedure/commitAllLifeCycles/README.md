```js
 function commitAllLifeCycles(finishedRoot, committedExpirationTime) {
  while (!!nextEffect) {
    let effectTag = nextEffect.effectTag
    if (effectTag & (Update | Callback)) {
      // 进入这里就是说如果当前这个fiber上有Update或者Callback的标志的话
      // 当在挂载或者更新ClassComponent时 如果组件上有什么ComponentDidUpdate之类的周期
      // 那么就会给该组件上 '|=' 一个Update 也就是挂上Update的标识
      let tag = nextEffect.tag
      let instance = nextEffect.stateNode
      let current = nextEffect.alternate
      if (tag === ClassComponent) {
        // 如果当前这个nextEffect的tag是class类型的组件的话
        // 就得好好处理 执行执行周期了
        if (effectTag & Update) {
          // 如果当前fiber上的标志挂的是Update的话
          if (!current) {
            // 并且如果它没有current的话 说明这个fiber是第一次渲染
            // 这个时候要执行didMount
            instance.componentDidMount()
          } else {
            // 进到这儿说明是执行setState了
            // 那就要执行didUpdate
            let prevProps = current.memoizedProps
            let prevState = current.memoizedState
            // 传参的时候要记着多传一个snapshot的快照
            instance.componentDidUpdate(prevProps, prevState, instance.__reactInternalSnapshotBeforeUpdate)
          }
        }

        // 这里要获取到updateQueue 因为有的setState可能传了回调函数
        // 这里就是遍历链表 把setState传进来的回调都给执行咯
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
      // 进入这里说明在之前更新的时候发现有新的ref或初次渲染时有ref
      let ref = nextEffect.ref
      if (!!ref) {
        let instance = nextEffect.stateNode // 获取到实例
        if (typeof ref === 'function') ref(instance)
        if (ref instanceof Object) ref.current = instance
      }
    }
    nextEffect = nextEffect.nextEffect
  }
}
 
```