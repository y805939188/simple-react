import React from './my-react/react/react'
import ReactDOM from './my-react/react-dom/react-dom'

// function Ding() {
//   return (
//     <div>
//       <h1>1</h1>
//       <h2>2</h2>
//       <h3>3</h3>
//     </div>
//   )
// }
// let a = Ding()
// console.log(a)
// debugger
// console.log(React.createElement(
//   'div',
//   null,
//   React.createElement('h1', null, 1),
//   React.createElement('h2', null, 2)
// ))


// console.log(React)
// console.log(<div id='dingye'>777</div>)
// class Ding extends React.Component {
//   static defaultProps = {
//     ding3: 123456
//   }
//   static getDerivedStateFromProps(nextProps, prevState) {
//     return nextProps
//   }
//   constructor(props) {
//     super(props)
//     this.state = {
//       ding1: 999,
//       ding2: props.myProp
//     }
//   }
//   render() {
//     return (
//       <div>{this.state.ding1}</div>
//     )
//   }
// }

// function Ding(props) {
//   return <div>
//     <h1 style={{color: 'red'}}>{props.ding1}</h1>
//     <h2>{props.ding2}</h2>
//   </div>
// }

class Ding2 extends React.Component {
  render() {
    return (
      <span>{this.props.ding2}</span>
    )
  }
}

class Ding extends React.Component {
  render() {
    return (
      <div>
        <h2>niubi</h2>
        <h3>zheshih3</h3>
        <Ding2></Ding2>
      </div>
    )
  }
}

class Ding3 extends React.Component {
  state = {
    ding: 1,
    ding2: 666
  }
  handleClick1 = (event) => {
    console.log(event)
    console.log('div')
    // event.stopBubble()
    // console.log('div')
  }
  handleClick2 = (event) => {
    event.stopBubble()
    console.log('h1')
    // console.log('h1')
  }
  handleClick3 = (num, event) => {
    // console.log(this.state)
    // console.log(num, event)
    // console.log('parent')
    let ding = this.state.ding
    this.setState({
      ding: ++ding
    }, () => {
      console.log(111, this)
    })
  }
  handleChange = (e) => {
    console.log(e.target.value)
    // this.setState({
    //   ding: 9999
    // })
  }
  render () {
    return (
      <div onClick={this.handleClick3.bind(this, 222)}>
        clickme {this.state.ding}
        {/* 8888899
        <input type="text" onKeyDown={this.handleChange}/>
        <h1 onClick={this.handleClick2}>{this.props.ding1}</h1>
        <button onClick={this.handleClick1}handleClick1>点我</button> */}
      </div>
    )
  }
}
ReactDOM.render(
  // <div id="ding-ge">9999</div>,
  // <Ding myProp={'dinggewudi'}>dddddd</Ding>,
  <Ding3 ding1="666" ding2="999"></Ding3>,
  document.querySelector('#app')
)