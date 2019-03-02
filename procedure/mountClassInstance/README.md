```js
function mountClassInstance(workInProgress, nextProps, component) {
  // 实例是在上面那个constructorClassInstance里头挂上的
  let instance = workInProgress.stateNode
  instance.props = nextProps
  instance.state = workInProgress.memoizedState

  // 初次渲染的时候updateQueue肯定是null的
  // setState时可能会有多个update
  let updateQueue = workInProgress.updateQueue
  if (!!updateQueue) {
    // 有updateQueue的时候要更新实例上的state
    processUpdateQueue(workInProgress, instance)
    instance.state = workInProgress.memoizedState
  }

  // 判断这个class组件是否有这个新的生命周期
  let getDerivedStateFromProps = component.getDerivedStateFromProps
  if (!!getDerivedStateFromProps && typeof getDerivedStateFromProps === 'function') {
    // 执行这个新的周期 更新instance上的state
    applyDerivedStateFromProps(workInProgress, getDerivedStateFromProps, nextProps)
    // 在上边这个方法中把workInP的memoizedState更新了
    // 这里也要把实例上的state更新一下 因为新的生命周期可能会返回新的state
    // 最终要把返回的state和之前的state合并
    instance.state = workInProgress.memoizedState
  }
  
  // 应该还有别的声明周期比如什么componentWillMount
  // 不过这种在下个版本里都要被做掉了 所以就不写了

  if (typeof instance.componentDidMount === 'function') {
    // 这里的意思就是说 如果用的人写了这个didMount方法的话
    // 就给这个fiber加上一个 Update 的性质
    // 这样呢 在之后的commit阶段 react就知道有这个周期方法
    // 就会在挂载完成之后调用这个didMount
    workInProgress.effectTag |= Update
  }
}
```