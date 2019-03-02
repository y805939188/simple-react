```js
function appendUpdateToQueue(queue, update) {
  // 如果队列是空的话就让队列的first和last都指向一个
  // 如果队列不为空的话 就让最后一位指向当前这个update
  if (!queue.lastUpdate) {
    queue.firstUpdate = queue.lastUpdate = update;
  } else {
    queue.lastUpdate.next = update;
    queue.lastUpdate = update;
  }
}
```