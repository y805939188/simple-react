```js
function bailoutOnAlreadyFinishedWork(workInProgress) {
  let renderExpirationTime = nextRenderExpirationTime
  if (workInProgress.childExpirationTime < renderExpirationTime) {
    // childExpirationTime表示该fiber以及它的子节点们上优先级最大的一个更新
    // 所以进入这里就是说这个fiber包括它的子节点上没有任何一个fiber的更新的优先级要大于或等于这个renderExpirationTime
    // 就可以直接把这个fiber以及它的子节点们都跳过
    // 比如说:
    // <div id="ding1">
    //   <Dingge></Dingge>
    //   <Dingye></Dingye>
    // </div>
    // 假设在Dingye这个组件上执行了一个setState产生了一个更新
    // 那么这个更新计算出来的新的expirationTime会被挂到root上并会被作为全局变量renderExpirationTime
    // 然后renderRoot的时候会从root的fiber一直往下遍历
    // 当遍历到Dingge这个组件的时候 由于该组件上没有产生更新 所以该组件上的childExpirationTime也是0
    // 那么就可以直接跳过这个Dingge组件的更新
    // 跳过返回null之后会到performUnitOfWork中 判断出next是null了 就会执行completeUnitOfWork
    // 然后会找到这个Dingge的兄弟节点也就是Dingye Dingye身上有childExpirationTime 所以就不会跳过Dingye这个组件
    return null
  } else {
    let currentChild = workInProgress.child
    if (workInProgress.child === null) return null
    // 在createWorkInProgress中会判断currentChild是否有alternate
    // 有就说明这个fiber之前就setState过 没有就说明是第一次更新
    // 另外如果这个currentChild正好有更新的话 那么在scheduleWork
    // 那个函数中第一步执行的找root的方法中 就会给这个fiber赋上expirationTime
    // 之后在这里的createWorkInProgress中会给新返回的workInProgress也赋值上那个上面那句话里的expirationTime
    // 这样当下一次再执行beginWork的时候就有可能不跳过了
    let newChildFiber = createWorkInProgress(currentChild, currentChild.pendingProps)
    workInProgress.child = newChildFiber
    newChildFiber.return = workInProgress
    let currentChildSibling = currentChild.sibling
    while (!!currentChildSibling) {
      // 如果这个child有兄弟节点的话保证它兄弟节点也是克隆的
      // 把它的所有兄弟节点都要创建克隆的workInProgress
      let newChildFiberSibling = createWorkInProgress(currentChildSibling, currentChildSibling.pendingProps)
      newChildFiber.sibling = newChildFiberSibling
      newChildFiberSibling.return = workInProgress
      newChildFiber = newChildFiber.sibling
      currentChildSibling = currentChildSibling.sibling
    }
    // 最后返回第一个子节点
    return workInProgress.child
  }
}
```