```js
 function ensureListeningTo(instance, type, propKey) {
  let rootContainer = null
  let RootFiber = instance.__reactInternalInstance
  while (RootFiber.tag !== HostRoot) {
    RootFiber = RootFiber.return
  }
  rootContainer = RootFiber.stateNode.containerInfo
  if (!RootContainerHasAddedEvents.hasOwnProperty(propKey)) {
    RootContainerHasAddedEvents[propKey] = true
    let eventName = propKey.slice(2).toLowerCase()
    let eventName2 = ''
    if (eventName === 'click') {
      eventName2 = eventName
    } else if (eventName === 'change') {
      /*
        input可能有这么多种类型
        0: "blur"
        1: "change"
        2: "click"
        3: "focus"
        4: "input"
        5: "keydown"
        6: "keyup"
        7: "selectionchange"
      */
      if (type === 'input' && instance.type === 'text') {
        eventName2 = 'input'
      } else if (type === 'input' && instance.type === 'file') {
        eventName2 = eventName
      } else if (type === 'select') {
        eventName2 = eventName
      } else if (type === 'textare') {
        eventName2 === 'input'
      }
    } else {
      eventName2 = eventName
    }
    if (type === 'input') {
      rootContainer.addEventListener(eventName2, interactiveUpdates.bind(null, temp_dispatch_event_fn2, propKey), false)
    } else {
      rootContainer.addEventListener(eventName2, interactiveUpdates.bind(null, temp_dispatch_event_fn1, propKey), false)
    }
  }
}
 
```