```js
 function commitNestedUnmounts(root) {
  /*
  |            div
  |             ↓
  |            img → span → map
  |             ↓            ↓            
  |             p          portal
  |                          ↓
  |                         div

    commitDeletion中发现传进来的要删除的节点是div
    是个HostComponent 于是会执行这个commitNestedUnmounts方法
    之后先对div执行commitUnmount 这个就是用来判断如果是portal进行一些处理
    如果是class组件就删除ref和执行卸载的声明周期 原生dom节点执行卸载ref等操作

    之后node.tag 不是portal并且有child 就直接用它的child进行下一轮循环

    然后它的child是img 同样上来就执行commitUnmount 之后发现还有child是p
    对p进行同样的操作 执行commitUnmount 但是到p发现没有child了 于是往下走
    发现p也没有sibling 于是让node = p.return 回到上一个节点
    然后把node置为上一个节点sibling兄弟节点 也就是span
    用span作为下一轮的node 发现span没有child但是又sibling
    于是把span的sibling也就是map标签作为下一轮node

    同样都执行commitUnmount
    然后又child 是个portal 作为下一轮的node
    之后发现是个portal 于是在执行commitUnmount的过程中
    发现是个portal就会对portal进行commitDeletion
    也就是调用commitNestedUnmounts的那个外部的方法
    然后在commitDeletion方法中用portal的child作为下一轮的node进行循环
    也就是用portal下的那个div进行循环 div是个HostComponent 于是会再执行commitNestedUnmounts
    之后会跟上面的逻辑一样
    commitNestedUnmounts传进div作为root 然后发现没有child了 而且node等于root
    于是return回commitDeletion 对div进行removeChild
    再然后div没有child 于是找return 发现return就是current 与return回commitUnmount中
    之后commitUnmount再return回commitNestedUnmounts中 此时这个函数中的node是portal
    并且child都被整干净了 于是继续往下走 最后如果有兄弟节点的话再按照同样的逻辑处理sibling
    没有的话最终会找到node === div 于是return会最最开始的commitDeletion
    然后对这个最最开始的div执行removeChild 这个节点的删除就算是完事儿了
  */
  let node = root
  while (true) {
    // commitUnmount就是用来卸载ref以及执行对应声明周期的方法
    commitUnmount(node)
    if (!!node.child) {
      // 进到这个方法说明这个传进来的root肯定是一个HostComponent 也就是原生dom节点类型
      // 如果有child的话找child 对它所有的child都执行commitUnmount操作
      node.child.return = node
      node = node.child
      continue
    }
    if (node === root) return
    while (!node.sibling) {
      // 没有兄弟节点的话就找他的父节点
      // 直到找到一个有兄弟节点的父节点或者是找到头了
      if (!node.return || node.return === root) return
      node = node.return
    }
    // 然后用兄弟节点进行下一次的commitUnmount
    // 这个就是先找fiber树一侧的子节点
    // 然后一点一点往上找兄弟节点和父节点的深度优先
    node.sibling.return = node.return
    node = node.sibling
  }
}
 
```