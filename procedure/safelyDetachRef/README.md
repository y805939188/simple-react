```js
 function safelyDetachRef(current) {
  let ref = current.ref
  if (!ref) return
  if (typeof ref === 'function') ref(null)
  if (ref instanceof Object) ref.current = null
}
 
```