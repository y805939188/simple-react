```js
function updateContextProvider(workInProgress) {
  // 通过React.createContext('name') 会返回一个ContextAPI对象
  // 就是这个对象
  // context = {
  //   $$typeof: REACT_CONTEXT_TYPE,
  //   _currentValue: defaultValue,
  //   _currentValue2: defaultValue,
  //   _threadCount: 0,
  //   Provider: {
  //     $$typeof: REACT_PROVIDER_TYPE,
  //     _context: context // 这个context不能直接写在这儿 会未找到的
  //   },
  //   Consumer: {
  //     $$typeof: REACT_CONTEXT_TYPE,
  //     _context: context, // 这个context不能直接写在这儿 会未找到的
  //     _calculateChangedBits: context._calculateChangedBits
  //   }
  // }
  // 然后这里的providerType就是ContextAPI.Provider
  let context = workInProgress.type._context
  let newProps = workInProgress.pendingProps
  let oldProps = workInProgress.memoizedProps
  let newValue = newProps.value // Provider上要给个value属性
  context._currentValue = newValue

  // 其实被注释掉的东西 是用来做性能优化的
  // 在react源码中 如果context改变了 是要不停地寻找子节点
  // 当碰到class组件有更新时
  // 会手动给class组件创建update以及updateQueue
  // 其他情况下 节点都不会产生updateQueue
  // 不过也可以更新 因为在completeWork中
  // 处理原生节点的时候 如果使用了context并且传进来的不一样了
  // 就会触发diffProperties然后产生一个updatePayload
  // 还会给这个节点加上一个Update的effectTag

  // 这里碰到个坑儿 如果直接跳过propagateContextChange的过程的话
  // 当context执行完毕马上又调用setState的时候
  // 就会发现updateQueue有值 但是firstUpdate以及lastUpdate都是null
  // 所以经历了enqueueUpdate方法后 会导致alternate只有lastUpdate没有firstUpdate
  // 就会导致后面可能会发生更新失败的情况
  // 这种情况在enqueueUpdate中对queue2也进行一次和queue1一样的操作就可以了
  // 可是react源码中 如果走了propagateContextChange的话
  // 那节点的updateQueue就直接是null 就很正常
  // 所以还是应该不跳过propagateContextChange的好

  // 这里要是把这堆都注释掉也行 后面就相当于强制更新了
  // 不管context是否发生变化 不管某个节点是否使用到了context
  // 只要setState都会更新

  // if (!!oldProps) {
  //   // 如果有oldProps说明不是第一次渲染
  //   let oldValue = oldProps.value
  //   if (Object.is(oldValue, newValue)) {
  //     if (oldProps.children === newProps.children) {
  //       // 进入这里 说明新旧的context一样并且前后两次的children也一样 那就可以跳过更新
  //       return bailoutOnAlreadyFinishedWork(workInProgress)
  //     }
  //   } else {
  //     // 进入这里说明context发生了改变
  //     // propagateContextChange(workInProgress)
  //   }
  // }
  return reconcileChildren(workInProgress, newProps.children)
}
```