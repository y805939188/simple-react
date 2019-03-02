```js
 function appendAllChildren(parentInstance, workInProgress) {
  // 如果它有child的话
  // 也就是说fiber树的叶子节点不会走这个while循环
  // 该函数主要就是把原生dom的子节点都添加到当前parent下
  // 比如:
  // div 有child走下面那个循环
  //   span 有child 走下面那个循环
  //     h1 没有child不走这里
  //     h2 没有child不走这里
  //     Ding 组件类型 有child 走下面的循环
  //       h3 没有 child不走这里 但是会直接把h3放在h2的后面
  let node = workInProgress.child
  while (!!node) {
    let tag = node.tag
    if (tag === HostComponent || tag === HostText) {
      // 如果这个tag就是原生dom节点或者文本类型的话
      // 那就把这个child的实例直接append到parent下
      if (tag === HostText) {
        parentInstance.appendChild(node.stateNode)
      } else {
        parentInstance.appendChild(node.stateNode)
      }
    } else if (!!node.child) {
      // 进入这里说明这个child可能是个class组件或者函数组件之类的非原生节点类型
      // 那么就把node置为它的第一个child 然后重新执行循环
      // 就像上面例子中那个Ding组件下的h3要放在h2的后面一样
      node.child.return = node
      node = node.child
      continue
    }
    if (node === workInProgress) {
      // 因为上面一直在往下遍历child
      // 所以下面那个while循环会往上遍历
      return
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) return
      // 当这个child没有兄弟节点了就要往上遍历它的父fiber了
      // 直到发现父fiber就是当前这个parent了才退出
      // 否则就一直往上遍历直到找到一个有兄弟节点的父fiber
      node = node.return
    }
    // 走到这里时当前这个child有兄弟节点的情况
    // 有兄弟节点的话就让兄弟节点作为node进行下一次循环
    node.sibling.return = node.return
    node = node.sibling

    /*
      比如:
        div
          Ding1
            h1
          Ding2
            h2
            h3

        遍历到Ding1时 发现它不是原生节点类型就直接用child 也就是h1进行下一轮循环
        第二轮循环中的h1 被append到了div下 然后发现它没有兄弟节点 就往上找到Ding1
        找到Ding1后发现Ding1有个兄弟节点Ding2 然后用Ding2进行下一轮的循环
        之后Ding2同样直接把h2作为下一轮的循环node 然后h2也会被append到div下
        然后往下走发现h2有个h3的兄弟节点 于是把它的兄弟节点h3作为下一轮的循环node
        h3也会被append到div下
        再然后h3没有兄弟节点就往上遍历到Ding2 Ding2也没有兄弟节点了就再往上遍历
        最后终于遍历到div 发现div就是传进来的这个workInProgress
        于是return
    */
  }
}

 
```