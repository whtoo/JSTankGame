/**
 * @author whtoo
 * @create_date 2013-11-20
 * @revise_date 2021-04-13
 */
import tankbrigade from '../resources/tankbrigade.png';
import '../css/main.css';
import { fromEvent } from 'rxjs';
class GameManager {
    constructor(render,options) {

    }
}

class GraphicRender {
    constructor(dom,options) {
        this._dom = dom || null;
        this._options = options || null;
    }
    static instance = new GraphicRender(document.getElementById('canvas'),{});

    set dom(dom) {
        this._dom = dom;
    }
    get dom() { return this._dom; }

    set options(options) {
        this._options = options;
    }

    get options() { return this._options; }

    render(renderTree) {

    }
}

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
            window.apControl = new APWatcher();
        }
    }
}

function KeyInputEvent(key,code) {
    this.key = key;
    this.code = code;
}

function APWatcher() {
    var gm = window.gameManager;
    var body = document.querySelector('body');
    let keyWatchDown = function (e) {
        // let player = gm.gameObjects[0]; // Player access removed for direct manipulation decoupling
        // let cmd = gm.cmd; // cmd access removed for direct manipulation decoupling
        // if (cmd.stop) { // Direct cmd manipulation removed
        //     cmd.stop = false;
        // }

        switch (e.which) {
            case 119: // w
                // console.log('press w');
                gm.inputState.direction = 'w';
                gm.inputState.action = 'move';
                // if (player.destY > 0) { // Direct player state check removed
                //     player.rotationAP('w',cmd); // Direct call to rotationAP removed
                // }
                break;
            case 115: // s
                // console.log('press s');
                gm.inputState.direction = 's';
                gm.inputState.action = 'move';
                // if (player.destY < 13) { // Direct player state check removed
                //     player.rotationAP('s',cmd); // Direct call to rotationAP removed
                // }
                break;
            case 97: // a
                // console.log('press a');
                gm.inputState.direction = 'a';
                gm.inputState.action = 'move';
                // if (player.destX > 0) { // Direct player state check removed
                //     player.rotationAP('a',cmd); // Direct call to rotationAP removed
                // }
                break;
            case 100: // d
                // console.log('press d');
                gm.inputState.direction = 'd';
                gm.inputState.action = 'move';
                // if (player.destX < 24) { // Direct player state check removed
                //     player.rotationAP('d',cmd); // Direct call to rotationAP removed
                // }
                break;
            default:
                //console.log('press other');
                break;
        }
    };
    let keyWatcherUp = function (e) {
        gm.inputState.action = null; // Update inputState instead of cmd
        // gm.cmd.stop = true; // Direct cmd manipulation removed
        // gm.cmd.nextX = gm.cmd.nextY = 0; // Direct cmd manipulation removed

    };

    body.onkeyup = keyWatcherUp;
    body.onkeypress = keyWatchDown;
}

function GameObjManager() {
    var objList = [];
    for (var i = 0; i < 1; i++) {
        var player = new TankPlayer('Tank' + i, 'w', 0);
        player.animSheet = new SpriteAnimSheet(3, 9, 16);
        objList.push(player);
    }
    this.gameObjects = objList;
    this.cmd = {
        nextX: 0,
        nextY: 0,
        stop: true
    };
    this.inputState = {
        direction: null,
        action: null
    };
    this.isInited = 0;
}

//动画图册
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
    return this.animationFrames[this.orderIndex % this.animLength];
};

//单桢动画
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
    this.isPlayer = isUser;
    // this.destX = (Math.floor(Math.random()*100) % 23) * 33;
    // 	this.destY = (Math.floor(Math.random()*100) % 13) * 33;
    this.destCook = 33;
    this.destX = 6;
    this.destY = 4;
    this.destW = 33;
    this.destH = 33;
    this.arc = 0;
    this.angleInRadians = 0; // Initialize angleInRadians
    this.halfDestW = -this.destW / 2; // Pre-calculate halfDestW
    this.halfDestH = -this.destH / 2; // Pre-calculate halfDestH
    this.X = this.destX * this.destCook;
    this.Y = this.destY * this.destCook;
    this.centerX = this.X + this.destW * 0.5;
    this.centerY = this.Y + this.destH * 0.5;
}

TankPlayer.prototype = new Player();
TankPlayer.prototype.constructor = TankPlayer;
TankPlayer.prototype.speedM = 6;

TankPlayer.prototype.updateSelfCoor = function () {
    this.X = this.destX * this.destCook;
    this.Y = this.destY * this.destCook;
    this.centerX = this.X + this.destW * 0.5;
    this.centerY = this.Y + this.destH * 0.5;
};

let per = 0;
per = TankPlayer.prototype.speedM / 60;
TankPlayer.prototype.rotationAP = function (direction,cmd) {
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
        this.angleInRadians = this.arc / 180 * Math.PI; // Update angleInRadians when arc changes
    } else {
        if (cmd.stop === false) {
            this.animSheet.orderIndex++;
            switch (direction) {
                case 'w':
                    // console.log('press wT');
                    // cmd.nextY -= per * this.speedM; // Removed
                    //this.destY -= this.speed;
                    break;
                case 's':
                    //console.log('press sT');
                    // cmd.nextY += per * this.speedM; // Removed
                    //this.destY += this.speed;
                    break;
                case 'a':
                    // console.log('press aT');
                    // cmd.nextX -= per * this.speedM; // Removed
                    //this.destX -= this.speed;
                    break;
                case 'd':
                    // cmd.nextX += per * this.speedM; // Removed
                    //console.log('press dT');
                    //this.destX +=  this.speed;
                    break;
                default:
                    //console.log('press otherT');
                    break;
            }
        }
        this.direction = direction;
        // this.updateSelfCoor(); // Removed: Redundant as updateGame calls it after all state changes.
    }

};


class ImageResouce {

    constructor(url) {
        this.url = url;
        this.img = new Image();

        fromEvent(this.img, 'load').subscribe((evt) => {
            this._onLoad(evt);
        });
        this.img.src = this.url;
    }

    _onLoad(evt) {
        if (this.cb) {
            this.cb(this.img);
        }
    }

    onLoad(func) {
        this.cb = func;
    }

    image() {
        return this.img;
    }
}
//Render Object Def
function Render() {

    let _ = new ImageResouce(tankbrigade).onLoad(eventShipLoaded.bind(this));

    function eventShipLoaded(res) {
        this.tileSheet = res;
        this.init();
    }

}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback, element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var lastTime = new Date();
var offscreenCanvas = document.createElement('canvas');

offscreenCanvas.width = 800;
offscreenCanvas.height = 500;
var offscreenContext = offscreenCanvas.getContext('2d');

function calculateFps() {
    var now = (+new Date),
        fps = 1000 / (now - lastTime);
    lastTime = now;
    return fps;
}


function offscreenCache(contextRef) {
    offscreenContext.fillStyle = "#aaaaaa";
    var mapRows = 13;
    var mapCols = 24;
	offscreenContext.fillRect(0, 0, (mapCols - 1) * 33, mapRows * 33);

    var mapTitle = contextRef.mapTitle;

    var mapIndexOffset = -1;

    for (var rowCtr = 0; rowCtr < mapRows; rowCtr++) {
        for (var colCtr = 0; colCtr < mapCols; colCtr++) {
            var tileId = mapTitle[rowCtr][colCtr] + mapIndexOffset;
            var sourceX = parseInt(tileId % mapCols) * 33; //tmx use line-based count
            var sourceY = parseInt(tileId / mapCols) * 33;
            // stretch tile will earase line.
            offscreenContext.drawImage(contextRef.tileSheet, sourceX, sourceY, 32, 32, colCtr * 33, rowCtr * 33, 33, 33);
        }
    }
}
//Render Object prototype Def
Render.prototype = {
    constructor: Render,
    mapTitle: [
        [78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 55, 78, 78, 78, 78],
        [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
        [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
        [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
        [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 100, 100, 100, 100, 55, 102, 102, 102, 102],
        [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 100, 100, 100, 100, 55, 102, 102, 102, 102],
        [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
        [102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
        [102, 102, 100, 100, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
        [102, 102, 100, 100, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
        [102, 102, 100, 100, 102, 102, 102, 102, 60, 60, 60, 60, 102, 102, 102, 102, 102, 102, 55, 102, 102, 102, 102],
        [102, 102, 102, 102, 102, 102, 102, 102, 60, 74, 74, 60, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102],
        [102, 102, 102, 102, 102, 102, 102, 102, 60, 74, 74, 60, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102]
    ],
    init: function () {
        offscreenCache(this);
        window.requestAnimFrame(this.drawScreen);
        //		this.drawScreen();
    },
    updateGame: function() {
        var gm = window.gameManager;
        var player = gm.gameObjects[0]; // Assuming single player for now

        // Input Processing
        if (gm.inputState.action === 'move' && gm.inputState.direction) {
            gm.cmd.stop = false;
            player.rotationAP(gm.inputState.direction, gm.cmd);
        } else {
            gm.cmd.stop = true;
            gm.cmd.nextX = 0;
            gm.cmd.nextY = 0;
        }

        // Player State Update Logic
        var players = gm.gameObjects;
        var item;
        for (var i = 0; i < players.length; i++) {
            item = players[i];
            if (gm.cmd.stop === false) { // This check might need to be coupled with inputState as well
                switch (item.direction) { // This direction is player's current facing direction
                    case 'w':
                        // console.log('press wT - updateGame'); // Logging for debug
                        item.destY -= per * item.speedM; // Incorporate item.speedM
                        break;
                    case 's':
                        // console.log('press sT - updateGame');
                        item.destY += per * item.speedM; // Incorporate item.speedM
                        break;
                    case 'a':
                        // console.log('press aT - updateGame');
                        item.destX -= per * item.speedM; // Incorporate item.speedM
                        break;
                    case 'd':
                        // console.log('press dD - updateGame'); // Corrected log from aD to dD
                        item.destX += per * item.speedM; // Incorporate item.speedM
                        break;
                    default:
                        // console.log('press otherT - updateGame');
                        break;
                }
            }
            item.updateSelfCoor();
        }
    },
    drawScreen: function () {
        this.updateGame(); // Call updateGame before drawing
        var tileSheet = window.render.tileSheet;
        window.context.clearRect(0, 0, 800, 600);

        window.render.drawMap(tileSheet);

        window.render.drawPlayer(tileSheet,gameManager.cmd);
        context.fillStyle = 'cornflowerblue';
        context.fillText(calculateFps().toFixed() + ' fps', 20, 60);
        window.requestAnimFrame(Render.prototype.drawScreen.bind(this));

    },
    drawPlayer: function (tileSheet /* cmd is no longer needed here directly */) {
        var players = window.gameManager.gameObjects;
        var item; // Should pick the correct player, assuming players[0] for now or loop if multiple visible
        
        // For simplicity, assuming we draw all players or the first player.
        // If drawing multiple players, this needs to be a loop.
        // For now, focusing on the first player as per previous logic.
        if (players.length > 0) {
            item = players[0]; // Or iterate if multiple players need individual drawing logic from here

            // The state update logic has been moved to updateGame.
            // This function now only handles drawing the player.

            // var angleInRadians = item.arc / 180 * Math.PI; // Now pre-calculated as item.angleInRadians
            var animFrame = item.animSheet.getFrames();
            //            console.log(animFrame);

            window.context.save();
            //console.log("X:"+item.centerX+"+Y:"+item.centerY)
            window.context.translate(item.centerX, item.centerY);
        window.context.rotate(item.angleInRadians); // Use pre-calculated item.angleInRadians
        window.context.drawImage(tileSheet, animFrame.sourceDx, animFrame.sourceDy, animFrame.sourceW, animFrame.sourceH, item.halfDestW, item.halfDestH, item.destW, item.destH); // Use pre-calculated item.halfDestW and item.halfDestH
        window.context.restore();

    },
    drawMap: function (tileSheet) {
        //draw a background so we can see the Canvas edges 

        window.context.drawImage(offscreenCanvas, 0, 0,
            offscreenCanvas.width, offscreenCanvas.height);

    }
};

setupGame();

export default setupGame;