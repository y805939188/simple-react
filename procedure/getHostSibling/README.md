```js
 function getHostSibling(fiber) {
  // 这个函数的逻辑 就是要找到一个真实dom节点
  // 好让当前这个Placement节点能插在它前头

  let node = fiber
  siblings: while (true) {
    // 这个循环的作用就是找到当前节点的右边的兄弟节点
    // 如果当前这个节点没有的话就一直往上找
    // 直到找到一个有兄弟节点的组件
    // 注意 只有父节点全是class类型或者function类型的才能继续往上找
    // 一旦当找到了第一个原生dom节点 而还没有找到一个有兄弟节点的东西
    // 就说明它真的只是个单一节点 就可以退出返回null了
    while (node.sibling === null) {
      let returnFiber = node.return
      let tag = returnFiber.tag
      if (returnFiber === null || tag === HostComponent || tag === HostRoot) {
        // 走到这儿就说明他是一个单一节点
        // 当找到RootFiber了或者它真的就是一个单一节点的话
        // 那就没必要再找了 直接return一个null

        return null
      }
      node = node.return
    }

    // 这是当找到自己本身或者它的父节点(这个父节点一定不能是原生dom类型的)的兄弟节点的时候
    // 让这个节点(一定是个class或者function之类的组件类型的节点)的兄弟节点的return指向该节点的return
    // 然后让兄弟节点作为兄弟节点
    // 此时这个兄弟节点可能是个组件类型的也可能是个原生dom类型的
    node.sibling.return = node.return
    node = node.sibling
    // 如果这个找到的兄弟节点直接就是原生dom类型的
    // 那么就可以直接把它作为要返回值 等待前面被这个新节点插入了
    // 但是如果它要是个组件类型的节点的话
    // 需要判断这个节点是否也是一个要新插入的节点
    // 如果是的话直接跳过 用这个节点作为下一轮的循环再找这个节点的兄弟节点
    // 如果不是需要新插入的 就说明这个组件类型的节点在之前就已经存在了
    // 所以需要判断它是否有真实的child的dom节点并且不能是portal(portal要被插入到fiber树之外)
    // 如果这个组件类型的节点自己就有子节点 那么这个子节点就要作为before被返回 以便新节点插在它前头
    // 如果这个组件没有子节点的话 那么就得把这个组件节点放到下一轮进行循环
    while (node.tag !== HostComponent && node.tag !== HostText) {
      if (node.effectTag & Placement) {
        continue siblings;
      }
      if (node.child === null || node.tag === HostPortal) {
        continue siblings;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }

    /*
      像下面这种fiber结构
      <div id="-1">
        <div id="0">
          <Ding1>
            <Ding2>
              <Ding3>
                <div id="1"></div>
              </Ding3>
            </Ding2>
            <Ding4></Ding4>
            <Ding5>
              <div id="2"></div>
            </Ding5>
          </Ding1>
        </div>
      </div>
      虽然在fiber树的结构上来讲
      id1和id2不是兄弟节点
      但是最终渲染出来的真实dom树 这俩却有可能是兄弟节点
      所以上面那俩循环的主要目的
      当想把id1插入到id0中 其实是要把id1插入到id2之前 通过insertBefore
      所以要遍历id1是否有兄弟节点
      没有的话往上找到Ding3发现它也没有兄弟节点
      然后再往上找 找到Ding2 发现Ding2有兄弟节点是Ding4
      但是Ding4没有子节点 所以只能把Ding4作为下一轮要循环的对象
      然后下一轮中找到了Ding4的兄弟节点是Ding5
      正巧又发现Ding5有子节点 这个子节点就是id2
      同时这个id2并不是一个Placement也就是它是一个旧有的已经存在于dom树上的节点
      所以可以使用这个id2作为before
      然后新的Placement的dom节点就可以插在它前面了~

      注意!假设Ding5下没有id2的话就会一直往上找找到id0
      这个时候就不用再找了 说明在这个dom树中
      这个id1节点就是独一个的存在
      直接返回null
    */
    if (!(node.effectTag & Placement)) {
      return node.stateNode
    }
  }
}

 
```