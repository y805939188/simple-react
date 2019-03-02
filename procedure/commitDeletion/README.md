```js
 function commitDeletion(current) {
  let node = current
  let parent = node.return
  let currentParent = null
  let currentParentIsContainer = null
  while (true) {
    if (parent.tag === HostComponent) {
      currentParent = parent.stateNode
      currentParentIsContainer = false
      break
    } else if (parent.tag === HostRoot) {
      currentParent = parent.stateNode.containerInfo
      currentParentIsContainer = true
      break
    }
  }

  while (true) {
    if (node.tag === HostComponent || node.tag === HostText) {
      // 内部是先从一侧子树开始遍历
      // 每个真实的dom节点都会被执行到 commitUnmount 方法
      // 然后找兄弟节点 直到把所有的节点都执行了commitUnmount
      // 如果碰到portal 在执行commitUnmount时候会再次执行commitNestedUnmounts
      // 就会把portal下的children都执行同样的逻辑
      commitNestedUnmounts(node)
      currentParent.removeChild(node.stateNode)
    } else if (node.tag === HostPortal) {
      /* 暂时先不处理portal */
    } else {
      // 进入这里说明这个节点可能是个function或者class之类的
      // 对这些节点直接进行ref卸载或者执行卸载的生命周期
      commitUnmount(node)
      if (!!node.child) {
        // 如果还有child 就对它的child进行上面同样的操作
        node.child.return = node
        node = node.child
        continue
      }
    }
    // 如果这个node是传进来的current了
    // 说明这个current下面的节点都被弄干净了 所以可以退出了
    // 因为对于删除操作是要一直找子节点的
    // 每找一个子节点就执行一下提交删除的方法 然后再找兄弟或往上回滚一个
    // 最终一定会回到传进来的这个current节点
    if (node === current) return
    while (!node.sibling) {
      // 看有无兄弟节点 如果有的话直接让node变为sibling 对sibling进行卸载
      // 没有的话直接找node的父节点的兄弟节点
      if (!node.return || node.return === current) return
      node = node.return
    }
    node.sibling.return = node.return
    node = node.sibling
  }
}

 
```