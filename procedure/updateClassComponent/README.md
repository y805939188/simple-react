```js
function updateClassComponent(workInProgress) {
  let nextProps = resolveDefaultProps(workInProgress)
  let component = workInProgress.type
  let instance = workInProgress.stateNode
  let shouldUpdate = false
  // 初次渲染的时候class组件是没有current的
  // 一般情况下 没有执行过setState的节点是没有alternate的
  // 但是如果它的父节点执行了跳过更新或他的key一样 那就会给它创建alternate
  // 比如有个组件 <Ding /> 内部执行了setState 然后会先找到root 再从root往下遍历
  // 当遍历root时 发现root节点本身没有更新 那就会执行那个 bailoutOnAlreadyFinishedWork方法
  // 这个方法会跳过root的更新同时如果这个 Ding 组件是root的第一个子节点的话就会给Ding组件执行createWorkInProgress
  // 从而给Ding组件的fiber创建了一个alternate
  // 或者当某个节点更新前后两次的key一样并且type啥的都没变的话 那会复用这个节点的fiber
  // 在复用时会调用 useFiber 内部也会使用createWorkInProgress创建当前fiber的alternate
  let current = workInProgress.alternate
  if (instance === null) {
    // 基本上没有实例说明是初次渲染
    // 一般到这里都是没有current的 但是如果用了suspend组件之类的话
    // 可能也会存在有current的情况 这里先不弄suspend组件相关的 以后再整
    if (current !== null) {}
    // 先初始化
    constructorClassInstance(workInProgress, nextProps, component)
    // 再挂载
    mountClassInstance(workInProgress, nextProps, component)
    // 之后让shouldUpdate变为true 表示需要更新
    shouldUpdate = true
  } else {
    // 进入这里说明已经存在实例 也就是说可能执行了setState
    shouldUpdate = updateClassInstance(workInProgress, nextProps)
  }

  // finishClassComponent这个方法就是返回下一个nextUnitOfWork
  return finishClassComponent(workInProgress, shouldUpdate)
}
```