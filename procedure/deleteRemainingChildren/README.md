```js
function deleteRemainingChildren(returnFiber, currentFirstChild) {
  // 这个函数的作用是删除当前传进来的这个child节点以及它之后的兄弟节点
  // 比如说当节点是文本类型且只有一个子节点的时候要删除
  // 再比如说当删除多余的子节点 举个例子就是上一次有5个子节点 更新之后只有三个子节点 要删除多余的俩
  // 还比如当前节点前后两次key不一样的情况就直接干掉他子节点们
  let returnFiberLastChild = null
  while (!!currentFirstChild) {
    // 要把所有的子节点都删除
    deleteChild(returnFiber, currentFirstChild)
    if (!currentFirstChild.sibling) {
      returnFiberLastChild = currentFirstChild
      break
    }
    currentFirstChild = currentFirstChild.sibling
  }
  return returnFiberLastChild
}
```