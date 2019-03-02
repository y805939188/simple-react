```js
 function createFiberFromText(text, mode) {
  let fiber = new createFiber(HostText, text, null, mode)
  fiber.expirationTime = nextRenderExpirationTime
  return fiber
}
 
```