/**
 * #author whtoo
 * #Date 2013-11-20
 */

window.addEventListener('load', eventWindowLoaded, false);

function eventWindowLoaded() {
    canvasApp();
}

function canvasSupport() {
    return Modernizr.canvas;
}

function canvasApp() {
    if (!canvasSupport()) {
        return;
    }
    else {
        var theCanvas = document.getElementById("canvas");
        window.context = theCanvas.getContext("2d");
        window.gameManager = new GameObjManager();

        window.render = new Render();
        window.render.init();
        window.apControl = new APWatcher();

    }
}

function APWatcher() {
    var gm = window.gameManager;

    var body = $('body')[0];
    
    this.keyWatcher = function (e) {
        var player = gm.gameObjects[0];
        if(gm.commandList.stop){
            gm.commandList.stop = false;
        }
        console.log(player.destY +"==="+player.destX);
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
        gm.commandList.nextX =  gm.commandList.nextY = 0;
        
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
    this.commandList = {nextX:0,nextY:0,stop:true};
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
    this.X = this.destX * this.destCook;
    this.Y = this.destY * this.destCook;
    this.centerX = this.X + this.destW * 0.5;
    this.centerY = this.Y + this.destH * 0.5;
}

TankPlayer.prototype = new Player();
TankPlayer.prototype.constructor = TankPlayer;
TankPlayer.prototype.speed = 2.4;
TankPlayer.prototype.speedM = 6;

TankPlayer.prototype.updateSelfCoor = function () {
    this.X = this.destX * this.destCook;
    this.Y = this.destY * this.destCook;
    this.centerX = this.X + this.destW * 0.5;
    this.centerY = this.Y + this.destH * 0.5;
};

var per = 0;
per = TankPlayer.prototype.speed / 60;
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
    }
    else {
        if(cmd.stop === false){
           
            this.animSheet.orderIndex++;
            switch (direction) {
                case 'w':
                   // console.log('press wT');
                   cmd.nextY -= per * this.speedM;
                    //this.destY -= this.speed;
                    break;
                case 's':
                    //console.log('press sT');
                     cmd.nextY += per * this.speedM;
                    //this.destY += this.speed;
                    break;
                case 'a':
                   // console.log('press aT');
                    cmd.nextX -= per * this.speedM;
                    //this.destX -= this.speed;
                    break;
                case 'd':
                     cmd.nextX += per * this.speedM;
                    //console.log('press dT');
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

};


//Render Object Def
function Render() {
    this.context = window.context;
    var tileSheet = new Image();
    this.tileSheet = tileSheet;

    tileSheet.addEventListener('load', eventShipLoaded, false);
    tileSheet.src = '../Resource/tankbrigade.png';

    var that = this;

    function eventShipLoaded() {
        that.init();
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


lastTime = new Date();
offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = 800;
offscreenCanvas.height = 500;
offscreenContext = offscreenCanvas.getContext('2d');

function calculateFps() {
	   var now = (+new Date),
	       fps = 1000 / (now - lastTime);
	   lastTime = now;
	return fps; 
}


function offscreenCache(contextRef){
	offscreenContext.fillStyle = "#aaaaaa";
	offscreenContext.fillRect(0, 0, 23 * 33, 13 * 33);
    var mapTitle = contextRef.mapTitle;
    var mapRows = 13;
    var mapCols = 23;

    var mapIndexOffset = -1;
   

    for (var rowCtr = 0; rowCtr < mapRows; rowCtr++) {
        for (var colCtr = 0; colCtr < mapCols; colCtr++) {
            var tileId = mapTitle[rowCtr][colCtr] + mapIndexOffset;
            var sourceX = Math.floor(tileId % 24) * 33;//tmx use line-based count
            var sourceY = Math.floor(tileId / 24) * 33;
            offscreenContext.drawImage(contextRef.tileSheet, sourceX, sourceY, 32, 32, colCtr * 33, rowCtr * 33, 32, 32);
        }
    }
}
//Render Object prototype Def
Render.prototype = {
    constructor: Render,
    mapTitle : [[78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 55, 78, 78, 78, 78],
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
                    [102, 102, 102, 102, 102, 102, 102, 102, 60, 74, 74, 60, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102, 102]],
    init: function () {
    	offscreenCache(this);
        window.requestAnimFrame(this.drawScreen);
        //		this.drawScreen();
    },
    drawScreen: function () {
        var tileSheet = window.render.tileSheet;
        this.context.clearRect(0, 0, 800, 500);
        
        window.render.drawMap(tileSheet);
        
        window.render.drawPlayer(tileSheet);
        context.fillStyle = 'cornflowerblue';
        context.fillText(calculateFps().toFixed() + ' fps', 20, 60);
        window.requestAnimFrame(Render.prototype.drawScreen.bind(this));

    },
    drawPlayer: function (tileSheet) {
        var cl = window.gameManager.commandList;
        
        var players = window.gameManager.gameObjects;
        var item;
       
        for (var i = 0; i < players.length; i++) {
                item = players[i];
                if(cl.stop === false){
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
            var animFrame = item.animSheet.getFrames();
//            console.log(animFrame);

            this.context.save();
            //console.log("X:"+item.centerX+"+Y:"+item.centerY)
            this.context.translate(item.centerX, item.centerY);
            this.context.rotate(angleInRadians);
            this.context.drawImage(tileSheet, animFrame.sourceDx, animFrame.sourceDy, animFrame.sourceW, animFrame.sourceH, -item.destW / 2, -item.destH / 2, item.destW, item.destH);
            this.context.restore();
        
    },
    drawMap: function (tileSheet) {
        //draw a background so we can see the Canvas edges 

     this.context.drawImage(offscreenCanvas, 0, 0,
             offscreenCanvas.width, offscreenCanvas.height);

    }
};