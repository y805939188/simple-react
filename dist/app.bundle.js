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
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _my_react_react_react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./my-react/react/react */ "./src/my-react/react/react.js");
 // import ReactDOM from './my-react/react-dom/react-dom'
// debugger

function Ding() {
  return _my_react_react_react__WEBPACK_IMPORTED_MODULE_0__["default"].createElement("div", null, _my_react_react_react__WEBPACK_IMPORTED_MODULE_0__["default"].createElement("h1", null, "1"), _my_react_react_react__WEBPACK_IMPORTED_MODULE_0__["default"].createElement("h2", null, "2"));
}

var a = Ding(); // console.log(React)
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
//     <h1>{props.ding1}</h1>
//     <h2>{props.ding2}</h2>
//   </div>
// }
// ReactDOM.render(
//   // <div id="ding-ge">9999</div>,
//   // <Ding myProp={'dinggewudi'}>dddddd</Ding>,
//   <Ding ding1="666" ding2="999"></Ding>,
//   document.querySelector('#app')
// )

/***/ }),

/***/ "./src/my-react/react/react.js":
/*!*************************************!*\
  !*** ./src/my-react/react/react.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
var REACT_ELEMENT_TYPE = Symbol.for('react.element');

function ReactElement(type, key, props) {
  console.log(type, key, props);
  var element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    props: props
  };
  return element;
}

function _createElement(type) {
  var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  debugger;

  var _props = Object.assign({}, props);

  var _key = _props.key || null; // 其实这里还应该处理一下ref
  // // 当有多个children时 children可以不按照数组的形式传


  _props.children = arguments.length - 2 === 1 ? arguments[2] : arguments.slice(2);
  return ReactElement(type, _key, _props);
}

function Component(props, context, updater) {
  this.props = props;
  this.context = context; // this.refs = emptyObject

  this.updater = updater || null;
}

Component.prototype.isReactComponent = true;
var React = {
  createElement: function createElement(type, props, children) {
    // console.log(type, props, children)
    var element = _createElement(type, props, children); // 然后应该做一些校验比如children或者props之类的


    return element;
  },
  Component: Component
};
/* harmony default export */ __webpack_exports__["default"] = (React);

/***/ })

/******/ });
//# sourceMappingURL=app.bundle.js.map