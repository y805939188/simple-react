```js
 function commitPlacement(finishedWork) {
  // 先找到当前节点最近的父节点 这个节点一定是个HostComponent或HostRoot
  // 因为只有这两种才有对应的真实dom (其实还一种portal类型 暂且不论)
  let parentFiber = finishedWork.return
  while (!!parentFiber) {
    let tag = parentFiber.tag
    if (tag === HostComponent || tag === HostRoot) {
      break
    }
    parentFiber = parentFiber.return
  }

  let isContainer = null // 表示是否要挂载在根节点上
  let parent = null // 表示parentFiber对应的实例
  let parentTag = parentFiber.tag
  if (parentTag === HostComponent) {
    parent = parentFiber.stateNode
    isContainer = false
  } else {
    parent = parentFiber.stateNode.containerInfo
    isContainer = true
  }

  // 如果这个parent也需要重置文字内容
  // 那就要先执行resetTextContent给它做掉
  // 然后把这个ContentReset给去掉
  // if (parentFiber.effectTag & ContentReset) {}

  // 这个方法比较重要
  // 里头用了一个语法是:
  /*
    ding: while (xxx) {
      while (yyy) {
        // ...
        break ding
      }
      while (zzz) {
        continue ding
      }
    }
    这个语法的意思就是当while循环有嵌套的时候
    在内部的循环如果想直接break或continue的话
    只是单纯的跳出或者打断自己这个内部循环
    但是跳出外部的循环的话就可以通过这种语法直接跳出
  */

  // 找到一个节点before 要把新的节点插在这个before前面
  let before = getHostSibling(finishedWork)
  let node = finishedWork
  while (true) {
    let childTag = node.tag
    // 判断这个node是否是真实的dom节点或者text节点
    // 因为只有这两种节点才能被插入进dom
    if (childTag === HostComponent || childTag === HostText) {
      if (!!before) {
        // 如果有before说明找到了一个合适的真实兄弟dom
        // 那么就把它插在它前面
        parent.insertBefore(node.stateNode, before)
      } else {
        // 对于没有找到before的情况
        // 只能通过appendChlid去根据父元素
        // 把节点插入到父元素的最后一位了
        parent.appendChild(node.stateNode)
      }
    } else if (!!node.child) {
      // 如果当前这个需要Placement的节点
      // 是个classComponent之类的话
      // 就往下找 去找它的child
      // 它的child节点当中如果有节点需要插入的话 就重新执行对应的方法
      node.child.return = node
      node = node.child
      continue
    }
    if (node === finishedWork) {
      // 进入这里说明已经把子树都搞完了
      return
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === finishedWork) {
        return
      }
      node = node.return
    }
    // 由于classComponent可能返回数组
    // 也就是说当前节点有兄弟节点
    // 它的兄弟节点也是需要插入到刚才那个before之前的
    // 所以要让当前节点node指向兄弟节点进行下一轮插入操作
    node.sibling.return = node.return
    node = node.sibling
  }
}
 
```