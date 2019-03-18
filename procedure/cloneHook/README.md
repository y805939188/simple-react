```js
function cloneHook(hook) {
  return {
    memoizedState: hook.memoizedState,
    baseState: hook.baseState,
    queue: hook.queue,
    baseUpdate: hook.baseUpdate,
    next: null
  }
}

```