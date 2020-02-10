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
/******/ 	return __webpack_require__(__webpack_require__.s = 21);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/* harmony import */ var rumsan_ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);



const rest = new rumsan_ui__WEBPACK_IMPORTED_MODULE_1__["REST"]({ url: _config__WEBPACK_IMPORTED_MODULE_0__["default"].apiPath, debugMode: _config__WEBPACK_IMPORTED_MODULE_0__["default"].debugMode });

class Service {
  async login(body) {
    return rest.post({
      url: `/login`,
      useAccessToken: false,
      body
    });
  }

  async getData() {
    return rest.get({ url: "/auth" });
  }

  forgetPassword(body) {
    return rest.post({
      path: `/users/password_forgot`,
      useAccessToken: false,
      body
    });
  }
}

/* harmony default export */ __webpack_exports__["default"] = (new Service());


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _config_client_json__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
var _config_client_json__WEBPACK_IMPORTED_MODULE_0___namespace = /*#__PURE__*/__webpack_require__.t(3, 1);

/* harmony default export */ __webpack_exports__["default"] = (_config_client_json__WEBPACK_IMPORTED_MODULE_0__);


/***/ }),
/* 3 */
/***/ (function(module) {

module.exports = JSON.parse("{\"debugMode\":true,\"apiPath\":\"/api/v1\"}");

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _permission__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Permission", function() { return _permission__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _session__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Session", function() { return _session__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _rest__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "REST", function() { return _rest__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _notify__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(10);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Notify", function() { return _notify__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _alert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(11);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Alert", function() { return _alert__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(12);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UIUtils", function() { return _utils__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _modal__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(13);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Modal", function() { return _modal__WEBPACK_IMPORTED_MODULE_6__["default"]; });

/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(14);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Component", function() { return _component__WEBPACK_IMPORTED_MODULE_7__["default"]; });

/* harmony import */ var _panel__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(15);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Panel", function() { return _panel__WEBPACK_IMPORTED_MODULE_8__["default"]; });

/* harmony import */ var _tablePanel__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(16);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TablePanel", function() { return _tablePanel__WEBPACK_IMPORTED_MODULE_9__["default"]; });

/* harmony import */ var _form__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(20);
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Form", function() { return _form__WEBPACK_IMPORTED_MODULE_10__["default"]; });



















/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var rumsan_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(6);
/* harmony import */ var rumsan_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(rumsan_core__WEBPACK_IMPORTED_MODULE_0__);


class Permission {
  constructor(cfg) {}

  list() {
    let permissions = localStorage.getItem("permissions");
    if (permissions) return JSON.parse(permissions);
    else return {};
  }

  has(perms = []) {
    try {
      if (typeof perms == "string") perms = perms.split(",");
      let permissions = this.list();
      return rumsan_core__WEBPACK_IMPORTED_MODULE_0__["RSUtils"].Array.arrayContainsArray(permissions, perms);
    } catch (e) {
      return false;
    }
  }
}

/* harmony default export */ __webpack_exports__["default"] = (new Permission());


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {module.exports={RSUtils:{Array:{arrayContainsArray:function(e,n){if(0===n.length||e.length<n.length)return!1;for(var r=0;r<n.length;r++)if(e.indexOf(n[r])>-1)return!0;return!1}},Server:{checkIfProduction:function(){return console.log("######## Environment: ["+process.env.ENV_TYPE+"] ########"),"production"===process.env.ENV_TYPE||"prod"===process.env.ENV_TYPE},getEnvironment:function(){return process.env.ENV_TYPE}},Text:{pascalToCamelCase:function(e){return e.replace(/\.?([A-Z])/g,function(e,n){return"_"+n.toLowerCase()}).replace(/^_/,"")},escapeRegex:function(e){return e.replace(/[-[\]{}()*=?.,\\^$|#\s]/g,"\\$&")},randomText:function(e){return Math.random().toString(36).slice(-8)}}}};
//# sourceMappingURL=index.js.map

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(7)))

/***/ }),
/* 7 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
class Session {
  constructor(cfg) {}

  getToken() {
    return { access_token: localStorage.getItem("access_token") };
  }

  getUser() {
    let userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);
    else return {};
  }

  get() {
    return {
      access_token: localStorage.getItem("access_token"),
      user: this.getUser(),
      permissions: localStorage.getItem("permissions")
        ? JSON.parse(localStorage.getItem("permissions"))
        : []
    };
  }

  set({ access_token, user, permissions } = {}) {
    if (!access_token) throw Error("Must pass token");
    if (!user) throw Error("Must pass user");
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("permissions", JSON.stringify(permissions));
  }
}

/* harmony default export */ __webpack_exports__["default"] = (new Session());


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _notify__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10);


class REST {
  constructor(cfg) {
    if (!fetch) throw Error("fetch library is not found");
    Object.assign(this, cfg);
    this.debugMode = this.debugMode || false;
  }

  async request(options) {
    if (typeof options == "string") options = { path: options };
    const url = options.url || `${this.url}${options.path}`;
    if (options.body) options.body = JSON.stringify(options.body);

    options.method = options.method || "GET";
    options.useAccessToken = options.useAccessToken || true;
    options.headers = options.headers || {};

    options.headers["content-type"] = "application/json";
    if (options.useAccessToken)
      options.headers["access_token"] = localStorage.getItem("access_token");
    let res = await fetch(url, options);
    if (!res.ok) return this.badResponse(res);
    let json = await res.json();
    return json;
  }

  get(options) {
    if (typeof options == "string") options = { path: options };
    return this.request(options);
  }

  post(options) {
    options.method = "POST";
    return this.request(options);
  }

  put(options) {
    options.method = "PUT";
    return this.request(options);
  }

  delete(options) {
    if (typeof options == "string") options = { path: options };
    options.method = "DELETE";
    return this.request(options);
  }

  patch(options) {
    options.method = "PATCH";
    return this.request(options);
  }

  notImplemented(name) {
    _notify__WEBPACK_IMPORTED_MODULE_0__["default"].warning(`${name} is not implemented`);
  }

  async badResponse(res) {
    let message = res.statusText;

    if (this.debugMode) {
      let json = await res.json();
      message = json.message;
    } else {
      if (res.status === 401) {
        location.href = "/login";
        return;
      }
    }

    if (toastr) {
      toastr.error(`${message}<br />Error Code: ${res.status}`);
    } else {
      console.warn("Include toastr library to get nicer looking message");
      alert(message);
    }

    throw Error(message);
  }
}

/* harmony default export */ __webpack_exports__["default"] = (REST);


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
class Notify {
  show(message, options) {
    options = options || {};
    options.type = options.type || "success";
    options.title = options.title || "SUCCESS";
    if (toastr) {
      let obj = toastr.success;
      if (options.type === "warning") obj = toastr.warning;
      else if (options.type === "error") obj = toastr.error;
      else obj = toastr.success;

      obj(message, options.title);
    } else {
      console.warn("Include toastr library to get nicer looking message");

      if (options.useAlert) alert(options.title + "\n" + message);
      else {
        let obj = console.info;
        if (options.type === "warning") obj = console.warn;
        else if (options.type === "error") obj = console.error;
        else obj = console.info;
        obj(options.title + ": " + message);
      }
    }
  }

  warning(message, options) {
    options = options || {};
    options.type = "warning";
    options.title = options.title || "WARNING";
    this.show(message, options);
  }

  error(message, options) {
    options = options || {};
    options.type = "error";
    options.title = options.title || "ERROR";
    this.show(message, options);
  }
}

/* harmony default export */ __webpack_exports__["default"] = (new Notify());


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
class Alert {
  show(message) {
    alert(message);
  }

  async confirm(options) {
    if (!swal) throw new Error("SweetAlert2 (swal) library is not found");

    options = options || {};
    if (typeof options == "string") options = { text: options };

    let data = await swal.fire(
      Object.assign(
        {
          title: "Are you sure?",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes",
          cancelButtonText: "No"
        },
        options
      )
    );
    return data.value;
  }
}

/* harmony default export */ __webpack_exports__["default"] = (new Alert());


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const Utils = {
  Loading: {
    show: (target, options = {}) => {
      options.background = options.background || "rgba(255, 255, 255, 1)";
      options.fade = options.fade || true;
      if (target) $(target).LoadingOverlay("show", options);
      else $.LoadingOverlay("show", options);
    },

    hide: (target, force = false) => {
      if (target) $(target).LoadingOverlay("hide", force);
      else $.LoadingOverlay("hide", force);
    }
  }
};

/* harmony default export */ __webpack_exports__["default"] = (Utils);


/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14);


class Modal extends _component__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(cfg) {
    super(cfg);
    this.registerEvents("open", "close");

    this.comp.on("show.bs.modal", e => {
      this.fire("open", this);
    });

    this.comp.on("hide.bs.modal", e => {
      this.fire("close", this);
    });
  }

  open() {
    this.comp.modal("show");
  }

  close() {
    this.comp.modal("hide");
  }
}

/* harmony default export */ __webpack_exports__["default"] = (Modal);


/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
class Component {
  constructor(cfg) {
    if (!$) throw Error("jQuery($) library is not found");
    if (!cfg.target) throw Error("Must have target property");

    Object.assign(this, cfg);

    this.comp = $(this.target);
    this.eventStore = [];
  }

  registerEvents() {
    this.eventStore = [...this.eventStore, ...arguments];
  }

  on(event, cb) {
    let exists = this.eventStore.find(e => e === event);
    if (!exists) throw Error(`Event [${event}] is not registered`);
    $(this.target).on(event, cb);
  }

  trigger(event, data) {
    let exists = this.eventStore.find(e => e === event);
    if (!exists) throw Error(`Event [${event}] is not registered`);
    $(this.target).trigger(event, data);
  }

  fire(event, data) {
    this.trigger(event, data);
  }

  setValues(data) {
    let fields = [...document.querySelectorAll(`${this.target} [data-field]`)];
    fields.forEach(f => {
      let el = $(f);
      let fName = el.data("field");
      el.html(data[fName]);
    });
  }
}

/* harmony default export */ __webpack_exports__["default"] = (Component);


/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _component__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);



class Panel extends _component__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(cfg) {
    super(cfg);
    this.registerEvents("render");
  }

  showLoading(options) {
    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].Loading.show(this.target, options);
  }

  hideLoading(force = false) {
    _utils__WEBPACK_IMPORTED_MODULE_1__["default"].Loading.hide(this.target, force);
  }

  show() {
    this.comp.show();
  }

  hide() {
    this.comp.hide();
  }
}

/* harmony default export */ __webpack_exports__["default"] = (Panel);


/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _panel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(15);
/* harmony import */ var util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(17);
/* harmony import */ var util__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(util__WEBPACK_IMPORTED_MODULE_1__);



class TablePanel extends _panel__WEBPACK_IMPORTED_MODULE_0__["default"] {
  constructor(cfg) {
    super(cfg);
    if (!this.comp.DataTable) throw Error("DataTable library is not found");

    this.tblConfig = Object.assign(
      {
        pageLength: 20,
        processing: true,
        responsive: true,
        filter: true,
        sort: false,
        searchDelay: 500,
        dom: "<'row'<'col-sm-12'tr>>" + "<'row'<'col-sm-4'i><'col-sm-8'<'float-right p-2'p>>>",
        columns: this.setColumns(this)
      },
      cfg.tblConfig
    );

    if (cfg.url) {
      this.tblConfig.serverSide = true;
      this.tblConfig.ajax = {
        url: cfg.url,
        headers: { access_token: localStorage.getItem("access_token") },
        dataFilter: data => {
          let json = JSON.parse(data);
          json.recordsTotal = json.total;
          json.recordsFiltered = json.total;
          this.toggleFooter(json.total);
          return JSON.stringify(json);
        },
        data: function(d) {
          return Object.assign(
            {},
            {
              start: d.start,
              limit: d.length,
              search: d.search.value
            }
          );
        }
      };
    }
  }

  toggleFooter(total, pageLength) {
    pageLength = pageLength || this.tblConfig.pageLength;
    if (total > pageLength) {
      $(`${this.target}_wrapper .dataTables_info`).show();
      $(`${this.target}_wrapper .dataTables_paginate`).show();
    } else {
      $(`${this.target}_wrapper .dataTables_info`).hide();
      $(`${this.target}_wrapper .dataTables_paginate`).hide();
    }
  }

  setColumns(parent) {
    return [];
  }

  getRowByValue(val, colIndex = 0) {
    let retIndex = null;
    this.table.rows().every(function(rowIdx, tableLoop, rowLoop) {
      var data = this.data()[colIndex];
      if (data == val) {
        retIndex = rowIdx;
        return;
      }
    });
    return retIndex;
  }

  render(tblConfig) {
    Object.assign(this.tblConfig, tblConfig);
    this.table = this.comp.DataTable(this.tblConfig);
  }

  load(url) {
    this.table.ajax.url(url).load();
  }

  loadData(data) {
    if (!Array.isArray(data)) data = [data];
    this.table.clear();
    data.forEach(d => {
      if (Object(util__WEBPACK_IMPORTED_MODULE_1__["isString"])(d)) d = [d];
      this.table.row.add(d);
    });
    this.toggleFooter(data.length);
    this.table.draw();
  }

  reload() {
    this.table.ajax.reload();
  }
}

/* harmony default export */ __webpack_exports__["default"] = (TablePanel);


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors ||
  function getOwnPropertyDescriptors(obj) {
    var keys = Object.keys(obj);
    var descriptors = {};
    for (var i = 0; i < keys.length; i++) {
      descriptors[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return descriptors;
  };

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  if (typeof process !== 'undefined' && process.noDeprecation === true) {
    return fn;
  }

  // Allow for deprecating things in the process of starting up.
  if (typeof process === 'undefined') {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = __webpack_require__(18);

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = __webpack_require__(19);

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var kCustomPromisifiedSymbol = typeof Symbol !== 'undefined' ? Symbol('util.promisify.custom') : undefined;

exports.promisify = function promisify(original) {
  if (typeof original !== 'function')
    throw new TypeError('The "original" argument must be of type Function');

  if (kCustomPromisifiedSymbol && original[kCustomPromisifiedSymbol]) {
    var fn = original[kCustomPromisifiedSymbol];
    if (typeof fn !== 'function') {
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    }
    Object.defineProperty(fn, kCustomPromisifiedSymbol, {
      value: fn, enumerable: false, writable: false, configurable: true
    });
    return fn;
  }

  function fn() {
    var promiseResolve, promiseReject;
    var promise = new Promise(function (resolve, reject) {
      promiseResolve = resolve;
      promiseReject = reject;
    });

    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }
    args.push(function (err, value) {
      if (err) {
        promiseReject(err);
      } else {
        promiseResolve(value);
      }
    });

    try {
      original.apply(this, args);
    } catch (err) {
      promiseReject(err);
    }

    return promise;
  }

  Object.setPrototypeOf(fn, Object.getPrototypeOf(original));

  if (kCustomPromisifiedSymbol) Object.defineProperty(fn, kCustomPromisifiedSymbol, {
    value: fn, enumerable: false, writable: false, configurable: true
  });
  return Object.defineProperties(
    fn,
    getOwnPropertyDescriptors(original)
  );
}

exports.promisify.custom = kCustomPromisifiedSymbol

function callbackifyOnRejected(reason, cb) {
  // `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
  // Because `null` is a special error value in callbacks which means "no error
  // occurred", we error-wrap so the callback consumer can distinguish between
  // "the promise rejected with null" or "the promise fulfilled with undefined".
  if (!reason) {
    var newReason = new Error('Promise was rejected with a falsy value');
    newReason.reason = reason;
    reason = newReason;
  }
  return cb(reason);
}

function callbackify(original) {
  if (typeof original !== 'function') {
    throw new TypeError('The "original" argument must be of type Function');
  }

  // We DO NOT return the promise as it gives the user a false sense that
  // the promise is actually somehow related to the callback's execution
  // and that the callback throwing will reject the promise.
  function callbackified() {
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var maybeCb = args.pop();
    if (typeof maybeCb !== 'function') {
      throw new TypeError('The last argument must be of type Function');
    }
    var self = this;
    var cb = function() {
      return maybeCb.apply(self, arguments);
    };
    // In true node style we process the callback on `nextTick` with all the
    // implications (stack, `uncaughtException`, `async_hooks`)
    original.apply(this, args)
      .then(function(ret) { process.nextTick(cb, null, ret) },
            function(rej) { process.nextTick(callbackifyOnRejected, rej, cb) });
  }

  Object.setPrototypeOf(callbackified, Object.getPrototypeOf(original));
  Object.defineProperties(callbackified,
                          getOwnPropertyDescriptors(original));
  return callbackified;
}
exports.callbackify = callbackify;

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(7)))

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}

/***/ }),
/* 19 */
/***/ (function(module, exports) {

if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}


/***/ }),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
class Form {
  constructor(cfg) {
    if (!$) throw Error("jQuery($) library is not found");
    Object.assign(this, cfg);

    $(this.target).submit(e => {
      e.preventDefault();
      if (this.onSubmit) this.onSubmit(e);
    });
  }

  get() {
    return this.getValues();
  }

  set(data, fields) {
    return this.setValues(data, fields);
  }

  getValues() {
    var data = {};
    $(`${this.target} :input`).each(function() {
      if (!this.name) return;
      let value = this.value;
      if (this.type == "checkbox") {
        value = this.checked;
      }
      if (this.type == "radio") {
        value = $(`input[name="${this.name}"]:checked`).val();
      }
      if (this.type == "select") {
        value = $(`select[name="${this.name}"]`).val();
      }
      let group = $(this).data("group");
      if (group) {
        data[group] = {
          ...data[group],
          ...{
            [this.name]: value
          }
        };
      } else {
        data[this.name] = value;
      }
    });
    return data;
  }

  setValues(data, fields) {
    if (!fields) {
      fields = [];
      for (let key in data) {
        fields.push(key);
      }
    } else {
      fields = fields.split(",");
    }

    let nested = [];

    fields.forEach(f => {
      let datatype = typeof data[f];
      if (datatype === "string" || datatype === "number" || datatype === "boolean") {
        $(`${this.target} input[name=${f}]:not([group])`).val(data[f]);
        $(`${this.target} select[name=${f}]:not([group])`).val(data[f]);
        $(`${this.target} textarea[name=${f}]:not([group])`).val(data[f]);
      } else if (datatype === "object") {
        if (!Array.isArray(data[f])) nested.push(f);
      }
    });
    nested.forEach(nestedf => {
      let nestedData = data[nestedf];
      let innerFields = [];
      for (let key in nestedData) {
        innerFields.push(key);
      }
      innerFields.forEach(inf => {
        let innerData = nestedData[inf];
        let innerDatatype = typeof innerData;
        if (
          innerDatatype === "string" ||
          innerDatatype === "number" ||
          innerDatatype === "boolean"
        ) {
          $(`${this.target} input[name=${inf}][data-group=${nestedf}]`).val(innerData);
          $(`${this.target} select[name=${inf}][data-group=${nestedf}]`).val(innerData);
          $(`${this.target} textarea[name=${inf}][data-group=${nestedf}]`).val(innerData);
        }
      });
    });
  }

  clear() {
    $(":input", this.target)
      .not(":button, :submit, :reset")
      .val("")
      .prop("checked", false)
      .prop("selected", false);
  }
}

/* harmony default export */ __webpack_exports__["default"] = (Form);


/***/ }),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var rumsan_ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);



$(document).ready(async () => {
  localStorage.setItem("access_token", access_token);
  localStorage.removeItem("user");
  localStorage.removeItem("permissions");

  let data = await _service__WEBPACK_IMPORTED_MODULE_0__["default"].getData();
  rumsan_ui__WEBPACK_IMPORTED_MODULE_1__["Session"].set(data);
  if (!data.access_token) window.location.replace("/login");
  if (redirect_url) window.location.replace(redirect_url);
  else window.location.replace("/");
});


/***/ })
/******/ ]);