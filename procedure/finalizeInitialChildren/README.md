```js
 function finalizeInitialChildren(instance, type, props) {
  for (let propKey in props) {
    // 这一步是确保排除原型链上的
    if (!props.hasOwnProperty(propKey)) continue
    let prop = props[propKey]
    if (propKey === 'style') {
      let styles = prop
      let domStyle = instance.style
      for (let styleName in styles) {
        if (!styles.hasOwnProperty(styleName)) continue
        let styleValue = styles[styleName].trim()
        domStyle[styleName] = styleValue
      }
    } else if (propKey === 'children') {
      if (typeof prop === 'string') {
        instance.textContent = prop
      }
      if (typeof prop === 'number') {
        instance.textContent = String(prop)
      }
    } else if (temp_events_obj.hasOwnProperty(propKey)) {
      // 进入这里说明props上有个事件相关的
      ensureListeningTo(instance, type, propKey)
    }
  }
}
 
```