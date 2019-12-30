```js
function enqueueUpdate(fiber, update) {
  // 这里的fiber.alternate不能叫current
  // 因为在之后的逻辑中 这个fiber.alternate有可能作为workInProgress
  // 也可能作为current  
  let alternate = fiber.alternate
  let queue1 = fiber.updateQueue || null
  let queue2 = alternate ? alternate.updateQueue : null

  if (!alternate) {
    // 初次渲染根节点以及某个组件第一次执行setState时会走到这儿
    queue1 = fiber.updateQueue || (fiber.updateQueue = createUpdateQueue(fiber.memoizedState))
    queue2 = null
  } else {
    // 进到这里的话 说明肯定不是初次渲染或者该组件第一次执行setState
    // 只有当某个组件第二次或第二次执行了setState之后才会进入这里

    // 但是基本上进到这里来的情况 queue1和queue2的updateQueue应该都有
    // 所以大多数情况下如果有alternate的话 进入这里都不会执行什么逻辑
    // 这里的逻辑也主要就是看queue1和queue2有没有值 如果没有就create一个UpdateQueue或者克隆一个


    // ただし！！！
    // 当节点effecttag是Update或PlacementAndUpdate的情况下会执行commitWork
    // commitWork中如果当前这个节点是HostComponet或者是SuspenseComponent的话
    // 会把这个节点的updateQueue置为null

    // 或者当删除的时候执行commitDeletion函数中会调用detacheFiber
    // 会把这个节点updateQueue置为null

    // 以上两种情况 第二种是删除节点的行为 所以可以忽略不计
    // 也就是说只有第一种情况时可能会把updateQueue置为null

    if (!queue1 && !queue2) {
      // 进入这里说明俩都没有 所以都创建一条updateQueue
      queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState)
      queue2 = alternate.updateQueue = createUpdateQueue(alternate.memoizedState)
    } else if (!queue1 && queue2) {
      // 进入这里说明只有queue2上有值 queue1上没有 给queue1创建updateQueue
      queue1 = fiber.updateQueue = cloneUpdateQueue(queue2)
    } else if (queue1 && !queue2) {
      // 进入这里说明只有queue1上有值 queue2上没有 给queue2创建updateQueue
      queue2 = alternate.updateQueue = cloneUpdateQueue(queue1)
    }
  }

  if (queue2 === null || queue1 === queue2) {
    // 进入这里 说明只有一条
    // 大部分会进入这里的场景 应该是初次渲染或者某组件第一次执行setState

    // 至于queue1等于queue2的情况
    // 我个人感觉 只有在createWorkInProgress中会让俩指向同一个引用
    // 但是如果是组件执行setState而进入这里的话 一般不会存在queue1 === queue2的情况
    // 因为在上一轮更新中 组件肯定会执行processUpdateQueue 这里会对workInProgress的链表进行克隆
    // 但是既然react源码里也写了这个判断 那可能是还有我没发现的场景 所以我也先写上吧
    appendUpdateToQueue(queue1, update)
    // 这里因为是只有一条链表或者是两条链表指向同一个引用
    // 所以只需要对其中一个引用执行appendUpdateToQueue就好
  } else {
    // 当该组件中 是偶数次执行setState时
    // 比如第2次执行setState是 queue1 也就是fiber.updateQueue上肯定会保留着上次setState时的状态
    // 因为在上一轮的奇数次setState时 fiber是作为current的
    // 在processUpdateQueue中 只会修改workInProgress.updateQueue的状态
    // 所以上一轮的current的updateQueue作为这一轮更新的fiber 把updateQueue的状态保留了下来
    // setState奇数次执行时则和偶数次相反
    // 比如第3次执行的时候(第1次执行setState不走这个代码块的逻辑)
    // 那这个queue1也就是fiber.updateQueue 在上一轮的偶数次更新中
    // 被processUpdateQueue把updateQueue给处理了 (比如说可能lastUpdate啥的都是null了)
    // 而queue2.updateQueue也就是alternate.updateQueue在上一把中是作为current的
    // 所queue2上仍然保留着上一轮setState的链表状态

    if (!queue1.lastUpdate || !queue2.lastUpdate) {
      // 如果说queue1或者queue2上任何一条链表的lastUpdate是null的话
      // 那么就把当前这个新的更新任务放到他们的lastUpdate上
      appendUpdateToQueue(queue1, update)
      appendUpdateToQueue(queue2, update)
    } else {
      // 进入这里说明queue1和queue2两条链表的lastUpdate都不是null
      appendUpdateToQueue(queue1, update)
      // 这种情况下只更新一条链表的lastUpdate就好
      // 因为在上面那个逻辑中 已经让queue1和queue2的lastUpdate都指向同一个引用update了
      // 比如说在一个点击事件当中 同时执行了俩setState
      // 然后第一个setState会进入到上面那个if逻辑 会让queue1和queue2都指向update这个引用
      // 之后当执行第二个setState时 由于两个queue都有lastUpdate了 于是就会进入这个逻辑
      // 在这个appendUpdateToQueue方法中会执行queue.lastUpdate.next = update
      // 虽然传入的参数是queue1 不过由于在上一轮中queue1和queue2的lastUpdate在结构上指向一样
      // 所以就算只执行了一个appendUpdateToQueue(queue1, update)
      // 也会让queue2.lastUpdate中的next指向改变
      // 于是就没有必要再调用一次appendUpdateToQueue去改变queue2的lastUpdate.next了
      // 所以只需要再改变queue2自己本身的lastUpdate属性的指向就可以了
      if (!!queue2.firstUpdate) {
        // 其实正常react源码中是没有这个判断的
        // 是直接queue2.lastUpdate = update
        // 但是由于我这里的ContextAPI稍微更源码中不太一样
        // 所以可能会导致到这里的时候queue2没有firstUpdate
        // 于是我自己加了个判断
        queue2.lastUpdate = update
      } else {
        appendUpdateToQueue(queue2, update)
      }
    }
  }

  // 这个函数主要作用 我感觉吧
  // 应该就是当初次渲染或者第一次执行setState时
  // 保证当前组件对应的fiber上的updateQueue有最新的状态和更新
  // 之后会把这个updateQueue上的状态和更新复制给workInProgress
  // 在不是初次渲染并且不是第一次执行setState时
  // 保证当前组件对应的fiber和这个fiber的alterante上的updateQueue都有最新的更新
  // 不同点在于
  // 偶数次setState时fiber.updateQueue上可能会保存着上一轮的更新状态
  // 奇数次setState时alternate.updateQueue上可能会保存着上一轮的更新状态
  // 没有上一轮状态 只保存着本轮最新update的那个updateQueue
  // 一定会作为后面render时候的workInProgress
  // 因为每次createWorkInProgress时一定会把workInProgress的updateQueue
  // 指向本轮的current 而本轮的current在上一轮是作为workInProgress的
  // 这个上一轮的workInProgress的updateQueue一定会在processUpdateQueue中被操作处理的
  // 所以本轮在之后要生成的workInProgress的updateQueue 一定是只保存着本次最新的update的对象
}

// 这个enqueueUpdate稍微简化了一些 不过和源码中的效果是一样的 可以把源码中的替换成这个
// 效果一样
function enqueueUpdate(fiber, update) {
  // 由于react中采用的是current和workInProgress的这种设计
  // 在执行setState时会发生一种情况
  // 什么情况呢
  // 就是执行setState会先根据找到当前执行setState这个组件的实例
  // 来找到当前组件对应的fiber 而这个fiber 在新一轮的更新中
  // 有可能会作为current 但是也有可能会被复用 来作为workInProgress
  // 而当创建workInProgress的时候 是一定要让它保持新的状态的
  // 所以要对这两颗树上的updateQueue进行同步
  let alternate = fiber.alternate
  // 初次渲染的时候queue1代表的是current树
  // 初次渲染的时候queue2代表的是workInProgress 也就是null
  let queue1 = fiber.updateQueue
  let queue2 = alternate ? alternate.updateQueue : null
  if (!alternate) {
    if (!queue1 && isFirstRender) {
      queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState)
      queue2 = null
    }
  } else {
    if (!queue1) {
      queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState)
    }
    if (!queue2) {
      queue2 = alternate.updateQueue = createUpdateQueue(alternate.memoizedState)
    }
    if (!queue1.lastUpdate) {
      queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState)
    }
    if (!queue2.lastUpdate) {
      queue2 = alternate.updateQueue = createUpdateQueue(alternate.memoizedState)
    }
  }

  appendUpdateToQueue(queue1, update)
  if (!!alternate) {
    appendUpdateToQueue(queue2, update)
  }

}
```
