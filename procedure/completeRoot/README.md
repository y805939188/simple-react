```js
 function completeRoot(root, finishedWork) {
  // 因为马上要提交(commit)了 所以root的finishedWork可以置为空了
  // 每次执行setState的时候 finishedWork要从0开始
  root.finishedWork = null
  commitRoot(root, finishedWork)
}
 
```