```js
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
      // 这里会对该元素进行一堆事件的初始化
      // 把事件绑定到document上
      finalizeInitialChildren(instance, type, props)
      workInProgress.stateNode = instance
    } else {
      // current !== null 说明有上一次的状态
      // workInProgress.stateNode != null 说明有实例
      // 所以进入这里说明不是第一次

      // 这个方法中要对比前后dom是否有变化
      // 内部调用prepareUpdate
      // prepareUpdate会把不同类型的改变添加到数组
      // 比如children从 0 → 1
      // 就会 ["children", '1'] 最后返回这个数组作为updatePayload
      // 之后把 workInProgress.updateQueue = updatePayload
      diffAndUpdateHostComponent(workInProgress, instance, type, props)
      // 如果这个节点ref也更新了的话就要给他个Ref
    }
    markRef(workInProgress)
    return null
  }
  if (tag === HostText) {
    // 在react源码里 如果某个dom元素下只有一个文本类型的子元素
    // 那在reconcile子节点的时候会直接返回null 也就是说这种情况下
    // 这个dom节点的fiber没有child 直接对这个dom节点的fiber进行
    // completeWork 这个时候不会进到这这个tag === HostText里
    // 而是在初始化dom节点时 给dom设置属性时候判断prop是children
    // 然后如果是string类型就给他放进去
    // 当只有一个文本类型的children发生改变的时候 会给这个文本节点的父元素
    // 一个ContentReset类型的effectTag(16)

    // 如果要是有多个文本类型的子节点的话 那就相当于children是个数组
    // 就会按照数组的方式处理 reconcileChildrenArray
    // 然后这样每个文本类型的子节点都有一个自己的fiber 并且都会执行completeWork
    // 然后就会走到这里 给它创建一个fiber 之后在给它父节点添加属性的时候
    // 由于children类型是数组 并不是string或number 所以就不会赋值了
    // 就在实例化父节点时 通过哪个appendAllChild添加进去
    let newText = workInProgress.pendingProps
    if (newText && !!workInProgress.stateNode) {
      workInProgress.stateNode.nodeValue = newText
    } else {
      workInProgress.stateNode = document.createTextNode(newText)
    }
    return null
  }
  // 这里其实在react源码中还有好多其他类型
  // 比如suspense组件 lazy组件 memo组件等等
  // 基本上除了SuspenseComponent组件之外
  // 剩下的tag类型都是返回的null
  return null
}
 
```