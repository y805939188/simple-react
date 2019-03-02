```js
 function commitUpdate(instance, finishedWork) {
  // 这里的updateQueue是在diffProperties中得到的数组
  let updatePayload = finishedWork.updateQueue
  if (!updatePayload) return
  let current = finishedWork.alternate
  let newProps = finishedWork.memoizedProps
  let oldProps = current ? current.memoizedProps : null

  for (let i = 0, len = updatePayload.length; i < len; i+=2) {
    let propKey = updatePayload[i]
    let propValue = updatePayload[i + 1]
    if (propKey === 'children') {
      let firstChild = instance.firstChild
      if (firstChild && firstChild === instance.lastChild && firstChild.nodeType === 3) {
        // 这里看它是不是只有一个文本节点
        firstChild.nodeValue = propValue
      } else {
        instance.textContent = propValue
      }
    } else if (propKey === 'style') {
      let style = instance.style
      for (let stylePropKey in propValue) {
        let stylePropValue = propValue[stylePropKey]
        if (stylePropKey === 'float') stylePropKey = 'cssFloat'
        style[stylePropKey] = stylePropValue
      }
    }
  }
}
 
```