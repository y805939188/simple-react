```js
function createFiberFromElement(element, mode) {
  let expirationTime = nextRenderExpirationTime
  return createFiberFromTypeAndProps(element.type, element.key, element.props, mode, expirationTime)
}
```