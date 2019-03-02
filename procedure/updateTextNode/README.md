```js
 function updateTextNode(returnFiber, current, textContent, expirationTime) {
  if (current === null || current.tag !== HostText) {
    const created = createFiberFromText(textContent, returnFiber.mode, expirationTime)
    created.return = returnFiber
    return created
  } else {
    const existing = useFiber(current, textContent, expirationTime)
    existing.return = returnFiber
    return existing
  }
}
 
```