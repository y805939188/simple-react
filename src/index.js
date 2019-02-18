import React from './my-react/react/react'
import ReactDOM from './my-react/react-dom/react-dom'
// console.log(React)
// console.log(<div id='dingye'>777</div>)
class Ding extends React.Component {
  render() {
    return (
      <div>6666666</div>
    )
  }
}
ReactDOM.render(
  // <div id="ding-ge">9999</div>,
  <Ding myProp={'dinggewudi'}></Ding>,
  document.querySelector('#app')
)