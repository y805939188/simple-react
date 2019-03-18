import React, { ConcurrentMode, useState } from './my-react/react/react'
import ReactDOM from './my-react/react-dom/react-dom'
// import './index.css'
// let Context = React.createContext({ding: 666})

// let Provider = Context.Provider
// let Consumer = Context.Consumer

// class Ding6 extends React.Component {
//   state = {
//     ding10: false
//   }
//   handleClickBtn2 = () => {
//     this.setState({
//       ding10: !this.state.ding10
//     })
//   }
//   render() {
//     return (
//       <div>
//         <button onClick={this.handleClickBtn2}>dian ji</button>
//         <h2>{this.state.ding10 ? 11 : 22}</h2>
//         <h1>{this.props.dingge}</h1>
//       </div>
//     )
//   }
// }

// class Ding5 extends React.Component {
//   render() {
//     return (
//       <Consumer>
//         {
//           (contextValue) => {
//             return <Ding6 dingge={contextValue.ding}></Ding6>
//           }
//         }
//       </Consumer>
//     )
//   }
// }

// class Ding4 extends React.Component {
//   state = {ding: 1}
//   handleClickBtn = () => {
//     let ding = this.state.ding
//     this.setState({
//       ding: ++ding
//     })
//   }
//   componentDidMount() {
//     console.log(this.btnRef)
//   }
//   render() {
//     return (
//       <Provider value={{ding: this.state.ding}}>
//         <Ding5></Ding5>
//         <button ref={(ele) => {this.btnRef = ele}} onClick={this.handleClickBtn}>click me</button>
//       </Provider>
//     )
//   }
// }

// class Ding7 extends React.Component {
//   // ref两种用法
//   // 其实还一种直接写string的
//   // 不过那种做起来太费事儿
//   constructor(props) {
//     super(props)
//     this.ref3 = React.createRef()
//   }

//   componentDidMount() {
//     console.log(this.ref2)
//     console.log(this.ref3)
//   }
//   render() {
//     return (
//       <div>
//         <h2 ref={ele => (this.ref2 = ele)}>h2</h2>
//         <h3 ref={this.ref3}>h3</h3>
//       </div>
//     )
//   }
// }

// class Ding10 extends React.Component {
//   state = {
//     ding: false
//   }
//   handleClickBtn = () => {
//     this.setState({
//       ding: !this.state.ding
//     })
//   }
//   returnFn = () => {
//     if (this.state.ding) {
//       return (
//         <h1 onClick={this.handleClickBtn}>H1</h1>
//       )
//     } else {
//       return (
//         <h3 onClick={this.handleClickBtn}>H3</h3>
//       )
//     }
//   }
//   render() {
//     return (
//       <div>
//         {this.returnFn()}
//       </div>
//     )
//   }
// }

// class Ding12 extends React.Component {
//   render() {
//     return (
//       <div>789</div>
//     )
//   }
// }

// class Ding11 extends React.Component {
//   state = {
//     ding: false
//   }
//   handleClickBtn = () => {
//     this.setState({
//       ding: !this.state.ding
//     })
//   }
//   returnFn = () => {
//     if (this.state.ding) {
//       return (
//         <h1 onClick={this.handleClickBtn}>H1</h1>
//       )
//     } else {
//       return (
//         <h3 onClick={this.handleClickBtn}>H3</h3>
//       )
//     }
//   }
//   render() {
//     return (
//       <div>
//         <Ding12></Ding12>
//         {this.returnFn()}
//       </div>
//     )
//   }
// }

// class Ding13 extends React.Component {
//   state = {
//     ding: false
//   }
//   handleClick = () => {
//     this.setState({
//       ding: !this.state.ding
//     })
//   }
//   createChild = () => {
//     let res = []
//     for (let i = 0; i < 1000; i++) {
//       res.push(<div>{this.state.ding ? 666 : 999}</div>)
//     }
//     return res
//   }
//   render() {
//     return(
//       <div>
//         <h1 onClick={this.handleClick}>click</h1>
//         <div class="move">
//           {this.createChild()}
//         </div>
//       </div>
//     )
//   }
// }


function Ding14() {
  let [num1, setNum1] = useState(1)
  let [num2, setNum2] = useState(99)
  let handleClickFn = () => {
    setNum1(++num1)
    setNum1(++num1)
    setNum2(--num2)
  }
  return (
    <button onClick={handleClickFn}>
      <h1>{num1}</h1>
      <h4>{num2}</h4>
    </button>
  )
}

ReactDOM.render(
  // <Ding3></Ding3>,
  // <Ding4></Ding4>,
  // <Ding7></Ding7>,
  // <Ding10></Ding10>,
  // <Ding11></Ding11>,
  // <ConcurrentMode>
  //   <Ding13></Ding13>
  // </ConcurrentMode>,
  <Ding14></Ding14>,
  document.querySelector('#app')
)
