```js
 function ensureWorkInProgressQueueIsAClone(workInProgress) {
  let current = workInProgress.alternate
  let queue = workInProgress.updateQueue
  if (!!current && queue === workInProgress.updateQueue) {
    queue = workInProgress.updateQueue = cloneUpdateQueue(queue)
  }
  return queue
}

 
```