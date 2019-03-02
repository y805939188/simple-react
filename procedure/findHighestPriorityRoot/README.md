```js
 
function findHighestPriorityRoot() {
  // 这是俩临时变量
  // 用来代替全局的nextFlushedRoot和nextFlushedExpirationTime
  // 用临时变量可以减少往上查作用域
  let highestPriorityWork = NoWork
  let highestPriorityRoot = null
  if (!!lastScheduledRoot) {
    let root = firstScheduledRoot
    let previousScheduledRoot = lastScheduledRoot
    while (!!root) {
      let remainingExpirationTime = root.expirationTime
      // root的expriationTime === NoWork 说明这个节点没有任何更新
      // 就是当任务都执行完了会把root的expirationTime置为NoWork
      // 所以如果本次的setState不是执行在某个root上的时候
      // 这时候这个root的expirationTime就是NoWork
      // 或者在循环执行root的更新时 执行已经被执行完更新的root也会是NoWork
      if (remainingExpirationTime === NoWork) {
        if (root === root.nextScheduledRoot) {
          // 进入这里说明当前只有一个root节点待更新 并且这个root还没有任务
          // 所以把那些东西都置为null就好
          root.nextScheduledRoot = null
          firstScheduledRoot = lastScheduledRoot = null
          break
        } else if (root === firstScheduledRoot) {
          // 进入这里说明有多个root节点要被调度
          // 当前root没任务 于是先获取当前root的下一个root
          let next = root.nextScheduledRoot
          // 之后让全局的这个firstScheduleRoot指向下一个root
          firstScheduledRoot = next
          // 再更新lastScheduleRoot的next 这就是循环链表的正常操作
          lastScheduledRoot.nextScheduledRoot = next
          // 由于当前root没不需要用它 并且它的下一个root已经被保存了 就把它的下一个root置为null
          root.nextScheduledRoot = null
          // 之后用当前这个root的下一个root进行下一轮的while循环
        } else if (root === lastScheduledRoot) {
          // 进入这里说明当前这个没有任务的root已经是最后一个带调度的root了
          // 由于这个root进到这里说明它没有更新 那么就在链表上删除这个root
          // 先让最后一个root变量等于上一个root
          lastScheduledRoot = previousScheduledRoot
          // 然后让新晋的最后root的next的Root等于第一个root
          lastScheduledRoot.nextScheduledRoot = firstScheduledRoot
          // 最后得把当前这个root下一个root的指向给干掉
          root.nextScheduledRoot = null
          // 到了最后一个root了 可以直接跳出了
          // 因为很可能已经在前几轮的while中找到了优先级最高的即将要被调度的root了
          break
        } else {
          // 进入到这里说明当前这条root链表有超过两个的root
          // 并且能进入这里 说明在当前这个root之前 肯定起码有一个root上有任务要更新
          // 如果这个root之前的所有root都没有任务的话 那么这个root肯定在上一轮就变成了firstScheduleRoot了
          // previousScheduledRoot此时表示上一个有更新的root
          // 然后这里让上一个有更新的root的下一个root指向当前root的下一个root
          // 再把当前root的下一个root置为null 把当前root在链表中干掉
          previousScheduledRoot.nextScheduledRoot = root.nextScheduledRoot
          root.nextScheduledRoot = null
        }
        // 走到这儿
        // 要么说明当前这个root是第一个root
        // 由于在上面的逻辑中第一个root已经被做掉了
        // 所以previousScheduledRoot也就是lastScheduledRoot
        // 它的nextScheduleRoot自然指向当前root的下一个root

        // 要么说明链表上有两个以上的root同时在之前至少已经有一个root有更新
        // 在之前那个有更新的root的逻辑中肯定会把previousScheduledRoot指向当前root的前一个root
        
        // 所以不管是以上两种中的那种情况 这里都要让root指向previousScheduledRoot的下一个root
        root = previousScheduledRoot.nextScheduledRoot
      } else {
        // 进入这里 说明当前这个root上有更新
        if (remainingExpirationTime > highestPriorityWork) {
          highestPriorityRoot = root
          highestPriorityWork = remainingExpirationTime
        }
        if (root === lastScheduledRoot) break // 如果这都最后一个root了 那就可以直接退出了
        if (highestPriorityWork === Sync) break // 如果这个任务是同步任务说明优先级最大 也可以直接跳出
        // 最后让上一个root指向当前这个root 以便下一轮可以使用本轮的root
        previousScheduledRoot = root
        root = root.nextScheduledRoot
      }
    }
  }
  // 最后返回一个优先级最高的root
  nextFlushedRoot = highestPriorityRoot
  nextFlushedExpirationTime = highestPriorityWork
}
 
```