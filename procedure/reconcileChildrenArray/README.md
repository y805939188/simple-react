```js
// 这块代码基本上是我直接在react源码中拷贝过来的
// 因为太复杂了 我已经很用力理解了 但是仍有个别小地感觉理解的不是特别透彻
// 所以就都粘过来了~
 function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, isMount) {
  let expirationTime = nextRenderExpirationTime
  // 注意！！！！！要处理这里
  // 如果是deletion的话 要把Deletion(8)标记在current上
  // 然后workInProgress就是null
  // 比如
  /*
    <div>                                       <div>
      <span>1</span>     ——————————————→          <span>1</span>
      <span>2</span>                            </div>
    </div>
  */
  // 这种情况下<span>1</span>的current.sibling 仍然指向<span>2</span>的current
  // 并且这个<span>2</span>的effectTag是8
  // 但是<span>1</span>的workInProgress.sibling 就指向null了

  // 因为如果这个节点要被Deletion的话那就会在这个函数中执行deleteChild
  // 这个deleteChild会直接把这个要被删除的节点作为returnFiber的nextEffect

  // 再比如
  /*
    <div>                                       <div>
      null                                        <span>0</span>
      <span>1</span>                              <span>1</span>
      <span>2</span>     ——————————————→          <span>2</span>
      <span>3</span>                            </div>
    </div>
  */
  // 像这样新Placement一个<span>0</span> 然后Deletion一个<span>3</span>
  // 最终生成的新的fiber树的结构就是
  //
  //   div(lastEffect: span3)
  //    ↓
  //  span0(effectTag: Placement) → span1 → span2


  let resultingFirstChild = null
  let previousNewFiber = null
  let oldFiber = currentFirstChild
  let lastPlacedIndex = 0
  let newIdx = 0
  let nextOldFiber = null
  // 初次渲染直接跳过这里
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      // 进入这里 可能说明上一次中 有的节点是null
      // 比如
      /*
        <div>                          <div>
          null                           <h1></h1>
          null                           <h2></h2>
          <h1></h1>     ——————————→      <h3></h3>
          <h2></h2>                      <h4></h4>
          <h3></h3>                      <h5></h5> 
        </div>                         </div>
      */
      // 这种情况上一轮的h1到h3的index分别是 0 ~ 2 但是新的fiber中h1到h3的index要从0 ~ 4
      nextOldFiber = oldFiber
      oldFiber = null
    } else {
      nextOldFiber = oldFiber.sibling
    }

    // 这里返回的newFiber有三种情况
    // 第一种是返回null
    // 说明这个节点新旧两次key值不一样
    // 或新旧两次一次是文本一次不是文本或一次是数组一次不是数组
    // 第二种情况就是返回一个可以复用的fiber
    // 这说明新旧俩节点的fiber一样并且类型也一样
    // 第三种情况就是返回一个新的fiber
    // 新的fiber说明前后两次的key一样但是类型改变了
    // 有可能是新插入了或真的直接就被改变类型了
    // 如果在内部调用了create之类的创建新fiber的方法
    // 表示不能复用之前的fiber
    // 而这个新创建的fiber上是没有alternate的
    const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], expirationTime)
    if (newFiber === null) {
      // 遍历新的children数组 直到找到第一个key不相同的节点
      // 如果上一轮中对应的节点或者key是null 并且本次新节点也没有key 那么不进入这里 因为null===null
      // 但如果上一轮中对应的节点或者key是null 但本次新节点有key 那么就进入这里
      if (oldFiber === null) {
        // 让oldFiber这个变量等于当前循环到的child对应的老child
        oldFiber = nextOldFiber
      }
      // 当找到第一个不能复用的节点的时候就跳出循环
      break
    }
    if (!isMount) {
      // 进入这里说明不是初次渲染 Mount时执行Childxxx时传的是false
      if (oldFiber && newFiber.alternate === null) {
        // 进入这里说明没有复用 新旧俩节点前后两次的key可能一样但是类型改变了
        // 有可能是新插入了或真的直接就被改变类型了
        // 新创建的create的fiber没有alternate
        // 所以旧的节点已经失效了 要把它删除
        deleteChild(returnFiber, oldFiber)
      }
    }

    // 这个placeChild就是
    // 如果需要把这个新的节点放置到dom上
    // 判断这个节点是否需要被放置或者是插入或是移动
    // 给newFiber.effectTag 赋值成 Placement
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx)
    if (previousNewFiber === null) {
      resultingFirstChild = newFiber
    } else {
      previousNewFiber.sibling = newFiber
    }
    previousNewFiber = newFiber
    oldFiber = nextOldFiber
  }

  // 初次渲染也直接跳过这里
  if (newIdx === newChildren.length) {
    // 如果newIdx等于了这回新数组的长度
    // 说明新数组中全部内容已经都被创建好了fiber对象
    // 新数组已经操作完成了
    // 如果这个时候老数组还有东西的话 就要被删除掉
    // 最后返回第一个子节点
    deleteRemainingChildren(returnFiber, oldFiber)
    return resultingFirstChild
  }

  // 初次渲染也会进入这里
  if (oldFiber === null) {
    // 走到这里就说明老的节点已经被复用完了或初次渲染
    // 但是仍然还存在新的节点没有被创建fiber
    for (; newIdx < newChildren.length; newIdx++) {
      // 这种情况下就对所有剩下的新的节点创建一个新的fiber
      const newFiber = createChild(
        returnFiber,
        newChildren[newIdx],
        expirationTime,
      );
      if (!newFiber) {
        continue
      }
      // 新节点的fiber被创建好了之后要给effectTag上标为Placement
      // 初次渲染的时候 根据这个for循环和newIdx 从0依次按顺序给newFiber一个index 
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      // 接下来让这些节点形成一条链表
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }
      previousNewFiber = newFiber
    }
    return resultingFirstChild
  }
  // 走到这儿的话可能是新的子节点们的长度小于旧的子节点长度
  // 或者是旧有的节点的顺序发生了变化
  // 这个函数主要做的就是给剩下的旧的fiber们做了一个map对象
  // 如果剩下的fiber们有key 就用key做键 对应的fiber做值
  // 如果某个fiber没有key就用它的index做键
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber)
  // 然后这里是根据上面那个map来方便地查找可以复用的fiber
  // 就是先找map中对应的key有没有 没有就找index 也没有就直接创建
  // 反正最后找没找到都要创建
  // 每当找到一个可以复用的fiber节点 就把它从map中删除
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      expirationTime,
    );
    if (newFiber) {
      if (!isMount) {
        if (newFiber.alternate !== null) {
          // 进到这里说明复用了旧的节点
          // 所以旧的那个fiber已经不能再给别人用了 于是要从map中删除
          existingChildren.delete(
            newFiber.key === null ? newIdx : newFiber.key,
          )
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx, isMount)
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }
      previousNewFiber = newFiber
    }
  }

  // 最后当把所有的可以复用的都找干净了之后就把map里的都干掉
  if (!isMount) {
    existingChildren.forEach(child => deleteChild(returnFiber, child))
  }

  return resultingFirstChild
}
 
```