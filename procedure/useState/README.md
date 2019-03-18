```js
function useState(initialState) {
  return useReducer(basicStateReducer, initialState)
}
```