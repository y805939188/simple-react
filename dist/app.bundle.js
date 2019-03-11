/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

// import React, { Component, ConcurrentMode } from './my-react/react/react'
// import ReactDOM from './my-react/react-dom/react-dom'
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
//   render() {
//     return(
//       <div>
//         <h1 onClick={this.handleClick}>{this.state.ding ? 666 : 999}</h1>
//       </div>
//     )
//   }
// }
// ReactDOM.render(
//   // <Ding3></Ding3>,
//   // <Ding4></Ding4>,
//   // <Ding7></Ding7>,
//   // <Ding10></Ding10>,
//   // <Ding11></Ding11>,
//   <ConcurrentMode>
//     <Ding13></Ding13>
//   </ConcurrentMode>,
//   document.querySelector('#app')
// )
var oDiv = React.createElement(ConcurrentMode, null, React.createElement(Ding13, null));

/***/ })

/******/ });
//# sourceMappingURL=app.bundle.js.map