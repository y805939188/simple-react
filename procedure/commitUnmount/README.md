```js
 function commitUnmount(node) {
  // 这个函数用来执行ref的卸载以及生命周期
  let tag = node.tag
  if (tag === ClassComponent) {
    // 先卸载ref 我暂时还没做ref相关的
    safelyDetachRef(node)
    let willUnmountLifeFn = node.stateNode.componentWillUnmount
    // 然后如果有这个生命周期就执行
    if (typeof willUnmuntLifeFn === 'function') {
      willUnmountLifeFn(node, node.stateNode)
    }
  } else if (tag === HostComponent) {
    // 对于原生的dom节点也要卸载ref
    safelyDetachRef(node)
  } else if (tag === HostPortal) {
    // 对于portal类型的组件 要重新调用这个方法
    // 这个方法里会找到portal的child 然后对child进行跟之前一样的操作
    // commitDeletion(node)
  }
}

 
```