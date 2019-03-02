```js
 function diffProperties(instance, type, newProps, oldProps) {
  let updatePayload = []
  let styleValueObj = {}
  for (let propKey in oldProps) {
    if (newProps.hasOwnProperty(propKey) || !oldProps.hasOwnProperty(propKey) || !oldProps[propKey]) {
      // 这第一个循环要先把旧属性中有但是新属性中没有的给拿出来
      // 因为新属性中没有了 所以要给它对应的值置为 ''
      continue
    }
    if (propKey === 'style') {
      for (let i in oldProps[propKey]) {
        styleValueObj[i] = ''
      }
    }
  }

  for (let propKey2 in newProps) {
    if (!newProps.hasOwnProperty(propKey2) || !newProps[propKey2]) continue
    if (propKey2 === 'children') {
      // 如果这个属性是children要更新的话
      // 并且是个单一的文本节点的话
      // 那就把updatePayload置为 [..., 'children', 'newChildText', ...]
      let newProp = newProps[propKey2]
      if (typeof newProp === 'string' || typeof newProp === 'number') {
        updatePayload.push(propKey2, String(newProp))
      }
    } else if (propKey2 === 'style') {
      let newStyles = newProps[propKey2]
      styleValueObj = Object.assign(styleValueObj, newStyles)
    } else if (temp_events_obj.hasOwnProperty(propKey2)) {
      // 进入这里说明添加了事件
      ensureListeningTo(instance, type, propKey2)
    }
  }
  if (JSON.stringify(styleValueObj) !== '{}') {
    updatePayload.push('style', styleValueObj)
  }
  return updatePayload
}
 
```