```js
function requestCurrentTime() {
  if (isRendering) {
    // 已经开始渲染的话就返回最近计算出来的时间
    return currentSchedulerTime
  }
  // 这里在源码中应该还有一步找到最高优先级的root
  if (nextFlushedExpirationTime === NoWork || nextFlushedExpirationTime === Never) {
    // 这一步其实就是计算到目前为止已经花了多长时间
    // msToExpirationTime的语义就是把js在32位系统下支持的最大数字1073741823作为react可以处理的最大单元数
    // 一个单元数react定义为10ms 然后用到目前为止已经花费的时间除以10ms 计算出但目前为止已经消耗了多少单元可用的时间
    // 然后用1073741823减去这老些单元 就可以得出react还能够处理多少单元的东西
    currentSchedulerTime = currentRendererTime = msToExpirationTime(performance.now() - originalStartTimeMs)
  }
  return currentSchedulerTime
}
```