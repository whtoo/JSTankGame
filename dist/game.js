/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./css/main.css":
/*!**********************!*\
  !*** ./css/main.css ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./resources/tankbrigade.png":
/*!***********************************!*\
  !*** ./resources/tankbrigade.png ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "e24e6cca025414826060.png";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*******************************!*\
  !*** ./src/extreem-engine.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _resources_tankbrigade_png__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../resources/tankbrigade.png */ "./resources/tankbrigade.png");
/* harmony import */ var _css_main_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../css/main.css */ "./css/main.css");
/**
 * #author whtoo
 * #Created Date 2013-11-20
 * #Revised Date 2021-04-13
 */



function setupGame() {
  window.addEventListener('load', eventWindowLoaded, false);

  function eventWindowLoaded() {
    canvasApp();
  }

  function canvasSupport() {
    return true;
  }

  function canvasApp() {
    if (!canvasSupport()) {
      return;
    } else {
      var theCanvas = document.getElementById("canvas");
      window.context = theCanvas.getContext("2d");
      window.gameManager = new GameObjManager();
      window.render = new Render();
      window.render.init();
      window.apControl = new APWatcher();
    }
  }
}

function APWatcher() {
  var gm = window.gameManager;
  var body = document.querySelector('body');

  this.keyWatcher = function (e) {
    var player = gm.gameObjects[0];

    if (gm.commandList.stop) {
      gm.commandList.stop = false;
    }

    console.log(player.destY + "===" + player.destX);

    switch (e.which) {
      case 119:
        console.log('press w');

        if (player.destY > 0) {
          player.rotationAP('w');
        }

        break;

      case 115:
        console.log('press s');

        if (player.destY < 13) {
          player.rotationAP('s');
        }

        break;

      case 97:
        console.log('press a');

        if (player.destX > 0) {
          player.rotationAP('a');
        }

        break;

      case 100:
        console.log('press d');

        if (player.destX < 24) {
          player.rotationAP('d');
        }

        break;

      default:
        //console.log('press other');
        break;
    }
  };

  this.keyWatcherUp = function (e) {
    gm.commandList.stop = true;
    gm.commandList.nextX = gm.commandList.nextY = 0;
  };

  body.onkeyup = this.keyWatcherUp;
  body.onkeypress = this.keyWatcher;
}

function GameObjManager() {
  var objList = [];

  for (var i = 0; i < 1; i++) {
    var player = new TankPlayer('Tank' + i, 'w', 0);
    player.animSheet = new SpriteAnimSheet(3, 9, 16);
    objList.push(player);
  }

  this.gameObjects = objList;
  this.commandList = {
    nextX: 0,
    nextY: 0,
    stop: true
  };
  this.isInited = 0;
} //动画图册


function SpriteAnimSheet(startAnim, stopAnim, X) {
  this.animationFrames = new Array();
  this.animLength = stopAnim - startAnim + 1;
  this.orderIndex = 0;

  for (var i = 0; i < this.animLength; i++) {
    var item = new SpriteAnimation(X, i + startAnim);
    this.animationFrames.push(item);
  }
}

SpriteAnimSheet.prototype.getFrames = function () {
  if (this.orderIndex < this.animLength) {
    this.orderIndex++;
  } else {
    this.orderIndex = 0;
  } //    var index = (parseInt(this.orderIndex) % parseInt(this.animLength));


  return this.animationFrames[0];
}; //单桢动画


function SpriteAnimation(sX, sY) {
  this.sourceDx = sX * 33;
  this.sourceDy = sY * 33;
  this.sourceW = 33;
  this.sourceH = 33;
}

function Player() {
  this.sourceDx = 528;
  this.sourceDy = 99;
  this.sourceW = 33;
  this.sourceH = 33;
  this.animSheet = null;
}

function TankPlayer(tankID, initDirection, isUser) {
  //w 4,d 1,s 2,a 3
  this.direction = initDirection;
  this.tankName = tankID;
  this.isPlayer = isUser; // this.destX = (Math.floor(Math.random()*100) % 23) * 33;
  // 	this.destY = (Math.floor(Math.random()*100) % 13) * 33;

  this.destCook = 33;
  this.destX = 6;
  this.destY = 4;
  this.destW = 33;
  this.destH = 33;
  this.arc = 0;
  this.X = this.destX * this.destCook;
  this.Y = this.destY * this.destCook;
  this.centerX = this.X + this.destW * 0.5;
  this.centerY = this.Y + this.destH * 0.5;
}

TankPlayer.prototype = new Player();
TankPlayer.prototype.constructor = TankPlayer;
TankPlayer.prototype.speed = 2.4;

TankPlayer.prototype.updateSelfCoor = function () {
  this.X = this.destX * this.destCook;
  this.Y = this.destY * this.destCook;
  this.centerX = this.X + this.destW * 0.5;
  this.centerY = this.Y + this.destH * 0.5;
};

TankPlayer.prototype.rotationAP = function (direction) {
  //    console.log("dr" + direction + "===" + this.direction);
  var cmd = window.gameManager.commandList;

  if (direction != this.direction) {
    cmd.nextX = cmd.nextY = 0;

    switch (direction) {
      case 'w':
        //console.log('press wT');
        this.arc = 270;
        break;

      case 's':
        //console.log('press sT');
        this.arc = 90;
        break;

      case 'a':
        //console.log('press aT');
        this.arc = 180;
        break;

      case 'd':
        //console.log('press dT');
        this.arc = 0;
        break;

      default:
        //console.log('press otherT');
        break;
    }

    this.direction = direction;
  } else {
    if (cmd.stop === false) {
      per = this.speed / 60;

      switch (direction) {
        case 'w':
          // console.log('press wT');
          cmd.nextY -= per * 2; //this.destY -= this.speed;

          break;

        case 's':
          //console.log('press sT');
          cmd.nextY += per * 2; //this.destY += this.speed;

          break;

        case 'a':
          // console.log('press aT');
          cmd.nextX -= per * 2; //this.destX -= this.speed;

          break;

        case 'd':
          cmd.nextX += per * 2; //console.log('press dT');
          //this.destX +=  this.speed;

          break;

        default:
          //console.log('press otherT');
          break;
      }
    }

    this.direction = direction;
    this.updateSelfCoor();
  }
}; //Render Object Def


function Render() {
  window.context = window.context;
  var tileSheet = new Image();
  this.tileSheet = tileSheet;
  tileSheet.addEventListener('load', eventShipLoaded, false);
  tileSheet.src = _resources_tankbrigade_png__WEBPACK_IMPORTED_MODULE_0__;
  var that = this;

  function eventShipLoaded() {
    that.init();
  }
}

window.requestAnimFrame = function () {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback, element) {
    window.setTimeout(callback, 1000 / 60);
  };
}();

var per = 0;
var lastTime = new Date();
var offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 800;
offscreenCanvas.height = 500;
var offscreenContext = offscreenCanvas.getContext('2d');

function calculateFps() {
  var now = +new Date(),
      fps = 1000 / (now - lastTime);
  lastTime = now;
  return fps;
}

function offscreenCache(contextRef) {
  offscreenContext.fillStyle = "#aaaaaa";
  offscreenContext.fillRect(0, 0, 23 * 33, 13 * 33);
  var mapTitle = contextRef.mapTitle;
  var mapRows = 13;
  var mapCols = 23;
  var mapIndexOffset = -1;

  for (var rowCtr = 0; rowCtr < mapRows; rowCtr++) {
    for (var colCtr = 0; colCtr < mapCols; colCtr++) {
      var tileId = mapTitle[rowCtr][colCtr] + mapIndexOffset;
      var sourceX = Math.floor(tileId % 24) * 33; //tmx use line-based count

      var sourceY = Math.floor(tileId / 24) * 33;
      offscreenContext.drawImage(contextRef.tileSheet, sourceX, sourceY, 32, 32, colCtr * 33, rowCtr * 33, 32, 32);
    }
  }
} //Render Object prototype Def


Render.prototype = {
  constructor: Render,
  mapTitle: [[78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 55, 78, 78, 78, 78], [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102], [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102], [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102], [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 100, 100, 100, 100, 55, 102, 102, 102, 102], [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 100, 100, 100, 100, 55, 102, 102, 102, 102], [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102], [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102], [102, 102, 100, 100, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102], [102, 102, 100, 100, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102], [102, 102, 100, 100, 102, 102, 102, 102, 60, 60, 60, 60, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102], [102, 102, 102, 102, 102, 102, 102, 102, 60, 74, 74, 60, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102], [102, 102, 102, 102, 102, 102, 102, 102, 60, 74, 74, 60, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102]],
  init: function init() {
    offscreenCache(this);
    window.requestAnimFrame(this.drawScreen); //		this.drawScreen();
  },
  drawScreen: function drawScreen() {
    var tileSheet = window.render.tileSheet;
    window.context.clearRect(0, 0, 800, 500);
    window.render.drawMap(tileSheet);
    window.render.drawPlayer(tileSheet);
    context.fillStyle = 'cornflowerblue';
    context.fillText(calculateFps().toFixed() + ' fps', 20, 60);
    window.requestAnimFrame(Render.prototype.drawScreen.bind(this));
  },
  drawPlayer: function drawPlayer(tileSheet) {
    var cl = window.gameManager.commandList;
    var players = window.gameManager.gameObjects;
    var item;

    for (var i = 0; i < players.length; i++) {
      item = players[i];

      if (cl.stop === false) {
        var cmd = cl;

        switch (item.direction) {
          case 'w':
            //console.log('press wT');
            cmd.nextY += per;
            item.destY -= per;
            break;

          case 's':
            // console.log('press sT');
            cmd.nextY -= per;
            item.destY += per;

            if (cmd.nextX < per) {
              cmd.nextY = 0;
            }

            break;

          case 'a':
            // console.log('press aT');
            cmd.nextX += per;
            item.destX -= per;
            break;

          case 'd':
            cmd.nextX -= per;
            item.destX += per;

            if (cmd.nextX < per) {
              nextX = 0;
            }

            break;

          default:
            // console.log('press otherT');
            break;
        }
      }

      item.updateSelfCoor();
    }

    var angleInRadians = item.arc / 180 * Math.PI;
    var animFrame = item.animSheet.getFrames(); //            console.log(animFrame);

    window.context.save(); //console.log("X:"+item.centerX+"+Y:"+item.centerY)

    window.context.translate(item.centerX, item.centerY);
    window.context.rotate(angleInRadians);
    window.context.drawImage(tileSheet, animFrame.sourceDx, animFrame.sourceDy, animFrame.sourceW, animFrame.sourceH, -item.destW / 2, -item.destH / 2, item.destW, item.destH);
    window.context.restore();
  },
  drawMap: function drawMap(tileSheet) {
    //draw a background so we can see the Canvas edges 
    window.context.drawImage(offscreenCanvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
  }
};
setupGame();
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (setupGame);
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9qc190YW5rX2dhbWUvLi9jc3MvbWFpbi5jc3M/MWFkNiIsIndlYnBhY2s6Ly9qc190YW5rX2dhbWUvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vanNfdGFua19nYW1lL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9qc190YW5rX2dhbWUvd2VicGFjay9ydW50aW1lL2dsb2JhbCIsIndlYnBhY2s6Ly9qc190YW5rX2dhbWUvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9qc190YW5rX2dhbWUvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9qc190YW5rX2dhbWUvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vanNfdGFua19nYW1lLy4vc3JjL2V4dHJlZW0tZW5naW5lLmpzIl0sIm5hbWVzIjpbInNldHVwR2FtZSIsIndpbmRvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudFdpbmRvd0xvYWRlZCIsImNhbnZhc0FwcCIsImNhbnZhc1N1cHBvcnQiLCJ0aGVDYW52YXMiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwiY29udGV4dCIsImdldENvbnRleHQiLCJnYW1lTWFuYWdlciIsIkdhbWVPYmpNYW5hZ2VyIiwicmVuZGVyIiwiUmVuZGVyIiwiaW5pdCIsImFwQ29udHJvbCIsIkFQV2F0Y2hlciIsImdtIiwiYm9keSIsInF1ZXJ5U2VsZWN0b3IiLCJrZXlXYXRjaGVyIiwiZSIsInBsYXllciIsImdhbWVPYmplY3RzIiwiY29tbWFuZExpc3QiLCJzdG9wIiwiY29uc29sZSIsImxvZyIsImRlc3RZIiwiZGVzdFgiLCJ3aGljaCIsInJvdGF0aW9uQVAiLCJrZXlXYXRjaGVyVXAiLCJuZXh0WCIsIm5leHRZIiwib25rZXl1cCIsIm9ua2V5cHJlc3MiLCJvYmpMaXN0IiwiaSIsIlRhbmtQbGF5ZXIiLCJhbmltU2hlZXQiLCJTcHJpdGVBbmltU2hlZXQiLCJwdXNoIiwiaXNJbml0ZWQiLCJzdGFydEFuaW0iLCJzdG9wQW5pbSIsIlgiLCJhbmltYXRpb25GcmFtZXMiLCJBcnJheSIsImFuaW1MZW5ndGgiLCJvcmRlckluZGV4IiwiaXRlbSIsIlNwcml0ZUFuaW1hdGlvbiIsInByb3RvdHlwZSIsImdldEZyYW1lcyIsInNYIiwic1kiLCJzb3VyY2VEeCIsInNvdXJjZUR5Iiwic291cmNlVyIsInNvdXJjZUgiLCJQbGF5ZXIiLCJ0YW5rSUQiLCJpbml0RGlyZWN0aW9uIiwiaXNVc2VyIiwiZGlyZWN0aW9uIiwidGFua05hbWUiLCJpc1BsYXllciIsImRlc3RDb29rIiwiZGVzdFciLCJkZXN0SCIsImFyYyIsIlkiLCJjZW50ZXJYIiwiY2VudGVyWSIsImNvbnN0cnVjdG9yIiwic3BlZWQiLCJ1cGRhdGVTZWxmQ29vciIsImNtZCIsInBlciIsInRpbGVTaGVldCIsIkltYWdlIiwiZXZlbnRTaGlwTG9hZGVkIiwic3JjIiwidGFua2JyaWdhZGUiLCJ0aGF0IiwicmVxdWVzdEFuaW1GcmFtZSIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsIndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSIsIm1velJlcXVlc3RBbmltYXRpb25GcmFtZSIsIm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJtc1JlcXVlc3RBbmltYXRpb25GcmFtZSIsImNhbGxiYWNrIiwiZWxlbWVudCIsInNldFRpbWVvdXQiLCJsYXN0VGltZSIsIkRhdGUiLCJvZmZzY3JlZW5DYW52YXMiLCJjcmVhdGVFbGVtZW50Iiwid2lkdGgiLCJoZWlnaHQiLCJvZmZzY3JlZW5Db250ZXh0IiwiY2FsY3VsYXRlRnBzIiwibm93IiwiZnBzIiwib2Zmc2NyZWVuQ2FjaGUiLCJjb250ZXh0UmVmIiwiZmlsbFN0eWxlIiwiZmlsbFJlY3QiLCJtYXBUaXRsZSIsIm1hcFJvd3MiLCJtYXBDb2xzIiwibWFwSW5kZXhPZmZzZXQiLCJyb3dDdHIiLCJjb2xDdHIiLCJ0aWxlSWQiLCJzb3VyY2VYIiwiTWF0aCIsImZsb29yIiwic291cmNlWSIsImRyYXdJbWFnZSIsImRyYXdTY3JlZW4iLCJjbGVhclJlY3QiLCJkcmF3TWFwIiwiZHJhd1BsYXllciIsImZpbGxUZXh0IiwidG9GaXhlZCIsImJpbmQiLCJjbCIsInBsYXllcnMiLCJsZW5ndGgiLCJhbmdsZUluUmFkaWFucyIsIlBJIiwiYW5pbUZyYW1lIiwic2F2ZSIsInRyYW5zbGF0ZSIsInJvdGF0ZSIsInJlc3RvcmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7O1VDQUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx3Q0FBd0MseUNBQXlDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EsRUFBRTtXQUNGO1dBQ0E7V0FDQSxDQUFDLEk7Ozs7O1dDUEQsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0Esc0RBQXNELGtCQUFrQjtXQUN4RTtXQUNBLCtDQUErQyxjQUFjO1dBQzdELEU7Ozs7O1dDTkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0Esa0M7Ozs7Ozs7Ozs7Ozs7Ozs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFTQSxTQUFULEdBQXFCO0FBQ2pCQyxRQUFNLENBQUNDLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDQyxpQkFBaEMsRUFBbUQsS0FBbkQ7O0FBRUEsV0FBU0EsaUJBQVQsR0FBNkI7QUFDekJDLGFBQVM7QUFDWjs7QUFFRCxXQUFTQyxhQUFULEdBQXlCO0FBQ3JCLFdBQU8sSUFBUDtBQUNIOztB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QWYsQ0FBeUJwRixJQUFJLENBQUNzQixPQUE5QixFQUF1Q3RCLElBQUksQ0FBQ3VCLE9BQTVDO0FBQ0ExRSxVQUFNLENBQUNRLE9BQVAsQ0FBZWdJLE1BQWYsQ0FBc0JMLGNBQXRCO0FBQ0FuSSxVQUFNLENBQUNRLE9BQVAsQ0FBZWdILFNBQWYsQ0FBeUJ4QyxTQUF6QixFQUFvQ3FELFNBQVMsQ0FBQzVFLFFBQTlDLEVBQXdENEUsU0FBUyxDQUFDM0UsUUFBbEUsRUFBNEUyRSxTQUFTLENBQUMxRSxPQUF0RixFQUErRjBFLFNBQVMsQ0FBQ3pFLE9BQXpHLEVBQWtILENBQUNULElBQUksQ0FBQ2tCLEtBQU4sR0FBYyxDQUFoSSxFQUFtSSxDQUFDbEIsSUFBSSxDQUFDbUIsS0FBTixHQUFjLENBQWpKLEVBQW9KbkIsSUFBSSxDQUFDa0IsS0FBekosRUFBZ0tsQixJQUFJLENBQUNtQixLQUFySztBQUNBdEUsVUFBTSxDQUFDUSxPQUFQLENBQWVpSSxPQUFmO0FBRVAsR0EvRmM7QUFnR2ZkLFNBQU8sRUFBRSxpQkFBVTNDLFNBQVYsRUFBcUI7QUFDMUI7QUFFSGhGLFVBQU0sQ0FBQ1EsT0FBUCxDQUFlZ0gsU0FBZixDQUF5QnZCLGVBQXpCLEVBQTBDLENBQTFDLEVBQTZDLENBQTdDLEVBQ1FBLGVBQWUsQ0FBQ0UsS0FEeEIsRUFDK0JGLGVBQWUsQ0FBQ0csTUFEL0M7QUFHQTtBQXRHYyxDQUFuQjtBQXlHQXJHLFNBQVM7QUFFVCxpRUFBZUEsU0FBZixFIiwiZmlsZSI6ImdhbWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBleHRyYWN0ZWQgYnkgbWluaS1jc3MtZXh0cmFjdC1wbHVnaW5cbmV4cG9ydCB7fTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwidmFyIHNjcmlwdFVybDtcbmlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLmcuaW1wb3J0U2NyaXB0cykgc2NyaXB0VXJsID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmxvY2F0aW9uICsgXCJcIjtcbnZhciBkb2N1bWVudCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5kb2N1bWVudDtcbmlmICghc2NyaXB0VXJsICYmIGRvY3VtZW50KSB7XG5cdGlmIChkb2N1bWVudC5jdXJyZW50U2NyaXB0KVxuXHRcdHNjcmlwdFVybCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjXG5cdGlmICghc2NyaXB0VXJsKSB7XG5cdFx0dmFyIHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKTtcblx0XHRpZihzY3JpcHRzLmxlbmd0aCkgc2NyaXB0VXJsID0gc2NyaXB0c1tzY3JpcHRzLmxlbmd0aCAtIDFdLnNyY1xuXHR9XG59XG4vLyBXaGVuIHN1cHBvcnRpbmcgYnJvd3NlcnMgd2hlcmUgYW4gYXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCB5b3UgbXVzdCBzcGVjaWZ5IGFuIG91dHB1dC5wdWJsaWNQYXRoIG1hbnVhbGx5IHZpYSBjb25maWd1cmF0aW9uXG4vLyBvciBwYXNzIGFuIGVtcHR5IHN0cmluZyAoXCJcIikgYW5kIHNldCB0aGUgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gdmFyaWFibGUgZnJvbSB5b3VyIGNvZGUgdG8gdXNlIHlvdXIgb3duIGxvZ2ljLlxuaWYgKCFzY3JpcHRVcmwpIHRocm93IG5ldyBFcnJvcihcIkF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyXCIpO1xuc2NyaXB0VXJsID0gc2NyaXB0VXJsLnJlcGxhY2UoLyMuKiQvLCBcIlwiKS5yZXBsYWNlKC9cXD8uKiQvLCBcIlwiKS5yZXBsYWNlKC9cXC9bXlxcL10rJC8sIFwiL1wiKTtcbl9fd2VicGFja19yZXF1aXJlX18ucCA9IHNjcmlwdFVybDsiLCIvKipcbiAqICNhdXRob3Igd2h0b29cbiAqICNDcmVhdGVkIERhdGUgMjAxMy0xMS0yMFxuICogI1JldmlzZWQgRGF0ZSAyMDIxLTA0LTEzXG4gKi9cbmltcG9ydCB0YW5rYnJpZ2FkZSBmcm9tICcuLi9yZXNvdXJjZXMvdGFua2JyaWdhZGUucG5nJztcbmltcG9ydCAnLi4vY3NzL21haW4uY3NzJztcblxuZnVuY3Rpb24gc2V0dXBHYW1lKCkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZXZlbnRXaW5kb3dMb2FkZWQsIGZhbHNlKTtcblxuICAgIGZ1bmN0aW9uIGV2ZW50V2luZG93TG9hZGVkKCkge1xuICAgICAgICBjYW52YXNBcHAoKTtcbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gY2FudmFzU3VwcG9ydCgpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIGNhbnZhc0FwcCgpIHtcbiAgICAgICAgaWYgKCFjYW52YXNTdXBwb3J0KCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0aGVDYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKTtcbiAgICAgICAgICAgIHdpbmRvdy5jb250ZXh0ID0gdGhlQ2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbiAgICAgICAgICAgIHdpbmRvdy5nYW1lTWFuYWdlciA9IG5ldyBHYW1lT2JqTWFuYWdlcigpO1xuICAgIFxuICAgICAgICAgICAgd2luZG93LnJlbmRlciA9IG5ldyBSZW5kZXIoKTtcbiAgICAgICAgICAgIHdpbmRvdy5yZW5kZXIuaW5pdCgpO1xuICAgICAgICAgICAgd2luZG93LmFwQ29udHJvbCA9IG5ldyBBUFdhdGNoZXIoKTtcbiAgICBcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5cbmZ1bmN0aW9uIEFQV2F0Y2hlcigpIHtcbiAgICB2YXIgZ20gPSB3aW5kb3cuZ2FtZU1hbmFnZXI7XG4gICAgdmFyIGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG4gICAgXG4gICAgdGhpcy5rZXlXYXRjaGVyID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IGdtLmdhbWVPYmplY3RzWzBdO1xuICAgICAgICBpZihnbS5jb21tYW5kTGlzdC5zdG9wKXtcbiAgICAgICAgICAgIGdtLmNvbW1hbmRMaXN0LnN0b3AgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhwbGF5ZXIuZGVzdFkgK1wiPT09XCIrcGxheWVyLmRlc3RYKTtcbiAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICBjYXNlIDExOTpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncHJlc3MgdycpO1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuZGVzdFkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllci5yb3RhdGlvbkFQKCd3Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxMTU6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3ByZXNzIHMnKTtcbiAgICAgICAgICAgICAgICBpZiAocGxheWVyLmRlc3RZIDwgMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnJvdGF0aW9uQVAoJ3MnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDk3OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwcmVzcyBhJyk7XG4gICAgICAgICAgICAgICAgaWYgKHBsYXllci5kZXN0WCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyLnJvdGF0aW9uQVAoJ2EnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDEwMDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncHJlc3MgZCcpO1xuICAgICAgICAgICAgICAgIGlmIChwbGF5ZXIuZGVzdFggPCAyNCkge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXIucm90YXRpb25BUCgnZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygncHJlc3Mgb3RoZXInKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5rZXlXYXRjaGVyVXAgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBnbS5jb21tYW5kTGlzdC5zdG9wID0gdHJ1ZTtcbiAgICAgICAgZ20uY29tbWFuZExpc3QubmV4dFggPSAgZ20uY29tbWFuZExpc3QubmV4dFkgPSAwO1xuICAgICAgICBcbiAgICB9O1xuICAgIGJvZHkub25rZXl1cCA9IHRoaXMua2V5V2F0Y2hlclVwO1xuICAgIGJvZHkub25rZXlwcmVzcyA9IHRoaXMua2V5V2F0Y2hlcjtcblxufVxuXG5mdW5jdGlvbiBHYW1lT2JqTWFuYWdlcigpIHtcbiAgICB2YXIgb2JqTGlzdCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMTsgaSsrKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBuZXcgVGFua1BsYXllcignVGFuaycgKyBpLCAndycsIDApO1xuICAgICAgICBwbGF5ZXIuYW5pbVNoZWV0ID0gbmV3IFNwcml0ZUFuaW1TaGVldCgzLCA5LCAxNik7XG4gICAgICAgIG9iakxpc3QucHVzaChwbGF5ZXIpO1xuICAgIH1cbiAgICB0aGlzLmdhbWVPYmplY3RzID0gb2JqTGlzdDtcbiAgICB0aGlzLmNvbW1hbmRMaXN0ID0ge25leHRYOjAsbmV4dFk6MCxzdG9wOnRydWV9O1xuICAgIHRoaXMuaXNJbml0ZWQgPSAwO1xufVxuXG4vL+WKqOeUu+WbvuWGjFxuZnVuY3Rpb24gU3ByaXRlQW5pbVNoZWV0KHN0YXJ0QW5pbSwgc3RvcEFuaW0sIFgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbkZyYW1lcyA9IG5ldyBBcnJheSgpO1xuICAgIHRoaXMuYW5pbUxlbmd0aCA9IHN0b3BBbmltIC0gc3RhcnRBbmltICsgMTtcbiAgICB0aGlzLm9yZGVySW5kZXggPSAwO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFuaW1MZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaXRlbSA9IG5ldyBTcHJpdGVBbmltYXRpb24oWCwgaSArIHN0YXJ0QW5pbSk7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uRnJhbWVzLnB1c2goaXRlbSk7XG4gICAgfVxufVxuXG5TcHJpdGVBbmltU2hlZXQucHJvdG90eXBlLmdldEZyYW1lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5vcmRlckluZGV4IDwgdGhpcy5hbmltTGVuZ3RoKSB7XG4gICAgICAgIHRoaXMub3JkZXJJbmRleCsrO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5vcmRlckluZGV4ID0gMDtcbiAgICB9XG5cbi8vICAgIHZhciBpbmRleCA9IChwYXJzZUludCh0aGlzLm9yZGVySW5kZXgpICUgcGFyc2VJbnQodGhpcy5hbmltTGVuZ3RoKSk7XG4gICAgcmV0dXJuIHRoaXMuYW5pbWF0aW9uRnJhbWVzWzBdO1xufTtcblxuLy/ljZXmoaLliqjnlLtcbmZ1bmN0aW9uIFNwcml0ZUFuaW1hdGlvbihzWCwgc1kpIHtcbiAgICB0aGlzLnNvdXJjZUR4ID0gc1ggKiAzMztcbiAgICB0aGlzLnNvdXJjZUR5ID0gc1kgKiAzMztcbiAgICB0aGlzLnNvdXJjZVcgPSAzMztcbiAgICB0aGlzLnNvdXJjZUggPSAzMztcbn1cblxuZnVuY3Rpb24gUGxheWVyKCkge1xuICAgIHRoaXMuc291cmNlRHggPSA1Mjg7XG4gICAgdGhpcy5zb3VyY2VEeSA9IDk5O1xuICAgIHRoaXMuc291cmNlVyA9IDMzO1xuICAgIHRoaXMuc291cmNlSCA9IDMzO1xuICAgIHRoaXMuYW5pbVNoZWV0ID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gVGFua1BsYXllcih0YW5rSUQsIGluaXREaXJlY3Rpb24sIGlzVXNlcikge1xuICAgIC8vdyA0LGQgMSxzIDIsYSAzXG5cbiAgICB0aGlzLmRpcmVjdGlvbiA9IGluaXREaXJlY3Rpb247XG5cbiAgICB0aGlzLnRhbmtOYW1lID0gdGFua0lEO1xuICAgIHRoaXMuaXNQbGF5ZXIgPSBpc1VzZXI7XG4gICAgLy8gdGhpcy5kZXN0WCA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTAwKSAlIDIzKSAqIDMzO1xuICAgIC8vIFx0dGhpcy5kZXN0WSA9IChNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqMTAwKSAlIDEzKSAqIDMzO1xuICAgIHRoaXMuZGVzdENvb2sgPSAzMztcbiAgICB0aGlzLmRlc3RYID0gNjtcbiAgICB0aGlzLmRlc3RZID0gNDtcbiAgICB0aGlzLmRlc3RXID0gMzM7XG4gICAgdGhpcy5kZXN0SCA9IDMzO1xuICAgIHRoaXMuYXJjID0gMDtcbiAgICB0aGlzLlggPSB0aGlzLmRlc3RYICogdGhpcy5kZXN0Q29vaztcbiAgICB0aGlzLlkgPSB0aGlzLmRlc3RZICogdGhpcy5kZXN0Q29vaztcbiAgICB0aGlzLmNlbnRlclggPSB0aGlzLlggKyB0aGlzLmRlc3RXICogMC41O1xuICAgIHRoaXMuY2VudGVyWSA9IHRoaXMuWSArIHRoaXMuZGVzdEggKiAwLjU7XG59XG5cblRhbmtQbGF5ZXIucHJvdG90eXBlID0gbmV3IFBsYXllcigpO1xuVGFua1BsYXllci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUYW5rUGxheWVyO1xuVGFua1BsYXllci5wcm90b3R5cGUuc3BlZWQgPSAyLjQ7XG5cblRhbmtQbGF5ZXIucHJvdG90eXBlLnVwZGF0ZVNlbGZDb29yID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuWCA9IHRoaXMuZGVzdFggKiB0aGlzLmRlc3RDb29rO1xuICAgIHRoaXMuWSA9IHRoaXMuZGVzdFkgKiB0aGlzLmRlc3RDb29rO1xuICAgIHRoaXMuY2VudGVyWCA9IHRoaXMuWCArIHRoaXMuZGVzdFcgKiAwLjU7XG4gICAgdGhpcy5jZW50ZXJZID0gdGhpcy5ZICsgdGhpcy5kZXN0SCAqIDAuNTtcbn07XG5cblRhbmtQbGF5ZXIucHJvdG90eXBlLnJvdGF0aW9uQVAgPSBmdW5jdGlvbiAoZGlyZWN0aW9uKSB7XG4vLyAgICBjb25zb2xlLmxvZyhcImRyXCIgKyBkaXJlY3Rpb24gKyBcIj09PVwiICsgdGhpcy5kaXJlY3Rpb24pO1xuICAgIHZhciBjbWQgPSB3aW5kb3cuZ2FtZU1hbmFnZXIuY29tbWFuZExpc3Q7XG4gICAgaWYgKGRpcmVjdGlvbiAhPSB0aGlzLmRpcmVjdGlvbikge1xuICAgICAgICBjbWQubmV4dFggPSBjbWQubmV4dFkgPSAwO1xuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgY2FzZSAndyc6XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygncHJlc3Mgd1QnKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFyYyA9IDI3MDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3ByZXNzIHNUJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcmMgPSA5MDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2EnOlxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3ByZXNzIGFUJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hcmMgPSAxODA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdwcmVzcyBkVCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXJjID0gMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygncHJlc3Mgb3RoZXJUJyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZihjbWQuc3RvcCA9PT0gZmFsc2Upe1xuICAgICAgICAgICAgcGVyID0gdGhpcy5zcGVlZCAvIDYwO1xuICAgICAgICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlICd3JzpcbiAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncHJlc3Mgd1QnKTtcbiAgICAgICAgICAgICAgICAgICBjbWQubmV4dFkgLT0gcGVyICogMjtcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLmRlc3RZIC09IHRoaXMuc3BlZWQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdwcmVzcyBzVCcpO1xuICAgICAgICAgICAgICAgICAgICAgY21kLm5leHRZICs9IHBlciAqIDI7XG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5kZXN0WSArPSB0aGlzLnNwZWVkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdhJzpcbiAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncHJlc3MgYVQnKTtcbiAgICAgICAgICAgICAgICAgICAgY21kLm5leHRYIC09IHBlciAqIDI7XG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5kZXN0WCAtPSB0aGlzLnNwZWVkO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgIGNtZC5uZXh0WCArPSBwZXIgKiAyO1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdwcmVzcyBkVCcpO1xuICAgICAgICAgICAgICAgICAgICAvL3RoaXMuZGVzdFggKz0gIHRoaXMuc3BlZWQ7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3ByZXNzIG90aGVyVCcpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICAgICAgdGhpcy51cGRhdGVTZWxmQ29vcigpO1xuICAgIH1cblxufTtcblxuXG4vL1JlbmRlciBPYmplY3QgRGVmXG5mdW5jdGlvbiBSZW5kZXIoKSB7XG4gICAgd2luZG93LmNvbnRleHQgPSB3aW5kb3cuY29udGV4dDtcbiAgICB2YXIgdGlsZVNoZWV0ID0gbmV3IEltYWdlKCk7XG4gICAgdGhpcy50aWxlU2hlZXQgPSB0aWxlU2hlZXQ7XG5cbiAgICB0aWxlU2hlZXQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGV2ZW50U2hpcExvYWRlZCwgZmFsc2UpO1xuICAgIHRpbGVTaGVldC5zcmMgPSB0YW5rYnJpZ2FkZTtcblxuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIGV2ZW50U2hpcExvYWRlZCgpIHtcbiAgICAgICAgdGhhdC5pbml0KCk7XG4gICAgfVxufVxuXG53aW5kb3cucmVxdWVzdEFuaW1GcmFtZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIHdpbmRvdy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gICAgICAgICAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChjYWxsYmFjaywgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xuICAgICAgICAgICAgfTtcbn0pKCk7XG5cbnZhciBwZXIgPSAwO1xudmFyIGxhc3RUaW1lID0gbmV3IERhdGUoKTtcbnZhciBvZmZzY3JlZW5DYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbm9mZnNjcmVlbkNhbnZhcy53aWR0aCA9IDgwMDtcbm9mZnNjcmVlbkNhbnZhcy5oZWlnaHQgPSA1MDA7XG52YXIgb2Zmc2NyZWVuQ29udGV4dCA9IG9mZnNjcmVlbkNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG5mdW5jdGlvbiBjYWxjdWxhdGVGcHMoKSB7XG5cdCAgIHZhciBub3cgPSAoK25ldyBEYXRlKSxcblx0ICAgICAgIGZwcyA9IDEwMDAgLyAobm93IC0gbGFzdFRpbWUpO1xuXHQgICBsYXN0VGltZSA9IG5vdztcblx0cmV0dXJuIGZwczsgXG59XG5cblxuZnVuY3Rpb24gb2Zmc2NyZWVuQ2FjaGUoY29udGV4dFJlZil7XG5cdG9mZnNjcmVlbkNvbnRleHQuZmlsbFN0eWxlID0gXCIjYWFhYWFhXCI7XG5cdG9mZnNjcmVlbkNvbnRleHQuZmlsbFJlY3QoMCwgMCwgMjMgKiAzMywgMTMgKiAzMyk7XG4gICAgdmFyIG1hcFRpdGxlID0gY29udGV4dFJlZi5tYXBUaXRsZTtcbiAgICB2YXIgbWFwUm93cyA9IDEzO1xuICAgIHZhciBtYXBDb2xzID0gMjM7XG5cbiAgICB2YXIgbWFwSW5kZXhPZmZzZXQgPSAtMTtcbiAgIFxuXG4gICAgZm9yICh2YXIgcm93Q3RyID0gMDsgcm93Q3RyIDwgbWFwUm93czsgcm93Q3RyKyspIHtcbiAgICAgICAgZm9yICh2YXIgY29sQ3RyID0gMDsgY29sQ3RyIDwgbWFwQ29sczsgY29sQ3RyKyspIHtcbiAgICAgICAgICAgIHZhciB0aWxlSWQgPSBtYXBUaXRsZVtyb3dDdHJdW2NvbEN0cl0gKyBtYXBJbmRleE9mZnNldDtcbiAgICAgICAgICAgIHZhciBzb3VyY2VYID0gTWF0aC5mbG9vcih0aWxlSWQgJSAyNCkgKiAzMzsvL3RteCB1c2UgbGluZS1iYXNlZCBjb3VudFxuICAgICAgICAgICAgdmFyIHNvdXJjZVkgPSBNYXRoLmZsb29yKHRpbGVJZCAvIDI0KSAqIDMzO1xuICAgICAgICAgICAgb2Zmc2NyZWVuQ29udGV4dC5kcmF3SW1hZ2UoY29udGV4dFJlZi50aWxlU2hlZXQsIHNvdXJjZVgsIHNvdXJjZVksIDMyLCAzMiwgY29sQ3RyICogMzMsIHJvd0N0ciAqIDMzLCAzMiwgMzIpO1xuICAgICAgICB9XG4gICAgfVxufVxuLy9SZW5kZXIgT2JqZWN0IHByb3RvdHlwZSBEZWZcblJlbmRlci5wcm90b3R5cGUgPSB7XG4gICAgY29uc3RydWN0b3I6IFJlbmRlcixcbiAgICBtYXBUaXRsZSA6IFtbNzgsIDc4LCA3OCwgNzgsIDc4LCA3OCwgNzgsIDc4LCA3OCwgNzgsIDc4LCA3OCwgNzgsIDc4LCA3OCwgNzgsIDc4LCA3OCwgNTUsIDc4LCA3OCwgNzgsIDc4XSxcbiAgICAgICAgICAgICAgICAgICAgWzEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDU1LCAxMDIsIDEwMiwgMTAyLCAxMDJdLFxuICAgICAgICAgICAgICAgICAgICBbMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgNTUsIDEwMiwgMTAyLCAxMDIsIDEwMl0sXG4gICAgICAgICAgICAgICAgICAgIFsxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCA1NSwgMTAyLCAxMDIsIDEwMiwgMTAyXSxcbiAgICAgICAgICAgICAgICAgICAgWzEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDAsIDEwMCwgMTAwLCAxMDAsIDU1LCAxMDIsIDEwMiwgMTAyLCAxMDJdLFxuICAgICAgICAgICAgICAgICAgICBbMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMCwgMTAwLCAxMDAsIDEwMCwgNTUsIDEwMiwgMTAyLCAxMDIsIDEwMl0sXG4gICAgICAgICAgICAgICAgICAgIFsxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCA1NSwgMTAyLCAxMDIsIDEwMiwgMTAyXSxcbiAgICAgICAgICAgICAgICAgICAgWzEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDU1LCAxMDIsIDEwMiwgMTAyLCAxMDJdLFxuICAgICAgICAgICAgICAgICAgICBbMTAyLCAxMDIsIDEwMCwgMTAwLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgNTUsIDEwMiwgMTAyLCAxMDIsIDEwMl0sXG4gICAgICAgICAgICAgICAgICAgIFsxMDIsIDEwMiwgMTAwLCAxMDAsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCA1NSwgMTAyLCAxMDIsIDEwMiwgMTAyXSxcbiAgICAgICAgICAgICAgICAgICAgWzEwMiwgMTAyLCAxMDAsIDEwMCwgMTAyLCAxMDIsIDEwMiwgMTAyLCA2MCwgNjAsIDYwLCA2MCwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgNTUsIDEwMiwgMTAyLCAxMDIsIDEwMl0sXG4gICAgICAgICAgICAgICAgICAgIFsxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgNjAsIDc0LCA3NCwgNjAsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyXSxcbiAgICAgICAgICAgICAgICAgICAgWzEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCA2MCwgNzQsIDc0LCA2MCwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDIsIDEwMiwgMTAyLCAxMDJdXSxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgXHRvZmZzY3JlZW5DYWNoZSh0aGlzKTtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltRnJhbWUodGhpcy5kcmF3U2NyZWVuKTtcbiAgICAgICAgLy9cdFx0dGhpcy5kcmF3U2NyZWVuKCk7XG4gICAgfSxcbiAgICBkcmF3U2NyZWVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0aWxlU2hlZXQgPSB3aW5kb3cucmVuZGVyLnRpbGVTaGVldDtcbiAgICAgICAgd2luZG93LmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIDgwMCwgNTAwKTtcbiAgICAgICAgXG4gICAgICAgIHdpbmRvdy5yZW5kZXIuZHJhd01hcCh0aWxlU2hlZXQpO1xuICAgICAgICBcbiAgICAgICAgd2luZG93LnJlbmRlci5kcmF3UGxheWVyKHRpbGVTaGVldCk7XG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ2Nvcm5mbG93ZXJibHVlJztcbiAgICAgICAgY29udGV4dC5maWxsVGV4dChjYWxjdWxhdGVGcHMoKS50b0ZpeGVkKCkgKyAnIGZwcycsIDIwLCA2MCk7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbUZyYW1lKFJlbmRlci5wcm90b3R5cGUuZHJhd1NjcmVlbi5iaW5kKHRoaXMpKTtcblxuICAgIH0sXG4gICAgZHJhd1BsYXllcjogZnVuY3Rpb24gKHRpbGVTaGVldCkge1xuICAgICAgICB2YXIgY2wgPSB3aW5kb3cuZ2FtZU1hbmFnZXIuY29tbWFuZExpc3Q7XG4gICAgICAgIFxuICAgICAgICB2YXIgcGxheWVycyA9IHdpbmRvdy5nYW1lTWFuYWdlci5nYW1lT2JqZWN0cztcbiAgICAgICAgdmFyIGl0ZW07XG4gICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGl0ZW0gPSBwbGF5ZXJzW2ldO1xuICAgICAgICAgICAgICAgIGlmKGNsLnN0b3AgPT09IGZhbHNlKXtcbiAgICAgICAgICAgICAgICB2YXIgY21kID0gY2w7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc3dpdGNoIChpdGVtLmRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICd3JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3ByZXNzIHdUJyk7XG4gICAgICAgICAgICAgICAgICAgICAgIGNtZC5uZXh0WSArPSBwZXI7XG4gICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZGVzdFkgLT0gcGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3MnOlxuICAgICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygncHJlc3Mgc1QnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgY21kLm5leHRZIC09IHBlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZGVzdFkgKz0gcGVyO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNtZC5uZXh0WCA8IHBlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNtZC5uZXh0WSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnYSc6XG4gICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdwcmVzcyBhVCcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgIGNtZC5uZXh0WCArPSBwZXI7XG4gICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uZGVzdFggLT0gcGVyO1xuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIGNtZC5uZXh0WCAtPSBwZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtLmRlc3RYICs9IHBlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjbWQubmV4dFggPCBwZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0WCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuXG4gICAgICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdwcmVzcyBvdGhlclQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGl0ZW0udXBkYXRlU2VsZkNvb3IoKTtcbiAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYW5nbGVJblJhZGlhbnMgPSBpdGVtLmFyYyAvIDE4MCAqIE1hdGguUEk7XG4gICAgICAgICAgICB2YXIgYW5pbUZyYW1lID0gaXRlbS5hbmltU2hlZXQuZ2V0RnJhbWVzKCk7XG4vLyAgICAgICAgICAgIGNvbnNvbGUubG9nKGFuaW1GcmFtZSk7XG5cbiAgICAgICAgICAgIHdpbmRvdy5jb250ZXh0LnNhdmUoKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJYOlwiK2l0ZW0uY2VudGVyWCtcIitZOlwiK2l0ZW0uY2VudGVyWSlcbiAgICAgICAgICAgIHdpbmRvdy5jb250ZXh0LnRyYW5zbGF0ZShpdGVtLmNlbnRlclgsIGl0ZW0uY2VudGVyWSk7XG4gICAgICAgICAgICB3aW5kb3cuY29udGV4dC5yb3RhdGUoYW5nbGVJblJhZGlhbnMpO1xuICAgICAgICAgICAgd2luZG93LmNvbnRleHQuZHJhd0ltYWdlKHRpbGVTaGVldCwgYW5pbUZyYW1lLnNvdXJjZUR4LCBhbmltRnJhbWUuc291cmNlRHksIGFuaW1GcmFtZS5zb3VyY2VXLCBhbmltRnJhbWUuc291cmNlSCwgLWl0ZW0uZGVzdFcgLyAyLCAtaXRlbS5kZXN0SCAvIDIsIGl0ZW0uZGVzdFcsIGl0ZW0uZGVzdEgpO1xuICAgICAgICAgICAgd2luZG93LmNvbnRleHQucmVzdG9yZSgpO1xuICAgICAgICBcbiAgICB9LFxuICAgIGRyYXdNYXA6IGZ1bmN0aW9uICh0aWxlU2hlZXQpIHtcbiAgICAgICAgLy9kcmF3IGEgYmFja2dyb3VuZCBzbyB3ZSBjYW4gc2VlIHRoZSBDYW52YXMgZWRnZXMgXG5cbiAgICAgd2luZG93LmNvbnRleHQuZHJhd0ltYWdlKG9mZnNjcmVlbkNhbnZhcywgMCwgMCxcbiAgICAgICAgICAgICBvZmZzY3JlZW5DYW52YXMud2lkdGgsIG9mZnNjcmVlbkNhbnZhcy5oZWlnaHQpO1xuXG4gICAgfVxufTtcblxuc2V0dXBHYW1lKCk7XG5cbmV4cG9ydCBkZWZhdWx0IHNldHVwR2FtZTsiXSwic291cmNlUm9vdCI6IiJ9