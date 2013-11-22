/**
 * #author whtoo
 * #Date 2013-11-20
 */

window.addEventListener('load', eventWindowLoaded, false); 

function eventWindowLoaded() {
	canvasApp();
}

function canvasSupport () {
	return Modernizr.canvas; 
}

function canvasApp(){
	if (!canvasSupport()) {
 		return;
	}
	else{
  	var theCanvas = document.getElementById("canvas");
  	window.context = theCanvas.getContext("2d");
  	window.gameManager = new GameObjManager();
  	
  	window.render = new Render();
  	window.render.init();
  	window.apControl = new APWatcher();
  	
  	}
}

function APWatcher(){
	var body = $('body')[0];
	this.keyWatcher = function(e){
	var player = window.gameManager.gameObjects[0];
		switch(e.which){
			case 119:
				console.log('press w');
				if(player.destY > 0){
					player.rotationAP('w');
				}
				break;
			case 115:
				console.log('press s');
				if(player.destY < 13){
					player.rotationAP('s');
				}
				break;
			case 97:
				console.log('press a');
				if(player.destX > 0){
					player.rotationAP('a');
				}
				break;
			case 100:
				console.log('press d');
				if(player.destX < 24){
					player.rotationAP('d');
				}
				break;
			default:
				console.log('press other');
				break;
		}
	};
	
	body.onkeypress = this.keyWatcher;

}



function GameObjManager (){
	var objList = new Array();
	for(var i = 0;i<1;i++){
		var player = new TankPlayer('Tank'+i,'w',0);
		player.animSheet = new SpriteAnimSheet(3,9,16);
		objList.push(player);
	}
	this.gameObjects = objList;
	this.isInited = 0;
}
//动画图册
function SpriteAnimSheet(startAnim,stopAnim,X){
	this.animationFrames = new Array();
	this.animLength = stopAnim - startAnim + 1;
	this.orderIndex = 0;
	
	for(var i = 0;i<this.animLength;i++){
		var item = new SpriteAnimation(X,i+startAnim);
		this.animationFrames.push(item);
	}
}

SpriteAnimSheet.prototype.getFrames = function(){
	if(this.orderIndex < this.animLength){
		this.orderIndex++;
	}
	else{
		this.orderIndex=0;
	}
	
	var index = (parseInt(this.orderIndex) % parseInt(this.animLength));
	return this.animationFrames[index];
};

//单桢动画
function SpriteAnimation(sX,sY){
	this.sourceDx = sX * 33;
	this.sourceDy = sY * 33;
	this.sourceW = 33;
	this.sourceH = 33;
}

function Player(){
	this.sourceDx = 528;
	this.sourceDy = 99;
	this.sourceW = 33;
	this.sourceH = 33;
	this.animSheet = null;
}

function TankPlayer(tankID,initDirection,isUser){
	//w 4,d 1,s 2,a 3
	
	this.direction = initDirection;
	
	this.tankName = tankID;
	this.isPlayer = isUser;
	// this.destX = (Math.floor(Math.random()*100) % 23) * 33;
// 	this.destY = (Math.floor(Math.random()*100) % 13) * 33;
	this.destCook = 33;
	this.destX = 6 ;
	this.destY = 4 ;
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
TankPlayer.prototype.rotationAP = function(direction){
	console.log("dr"+direction + "===" + this.direction);
	if(direction != this.direction){
		switch(direction){
			case 'w':
				console.log('press wT');
				this.arc = 270;
				break;
			case 's':
				console.log('press sT');
				this.arc = 90;
				break;
			case 'a':
				console.log('press aT');
				this.arc = 180;
				break;
			case 'd':
				console.log('press dT');
				this.arc = 0;
				break;
			default:
				console.log('press otherT');
				break;
		}
		this.direction = direction;
	}
	
};

function Animator(){
	
	
}


//Render Object Def
function Render() {
	this.context = window.context;
	var tileSheet = new Image();
	this.tileSheet = tileSheet;
	
	tileSheet.addEventListener('load',eventShipLoaded , false);
	tileSheet.src = '../Resource/tankbrigade.png';
	
	var that = this;
	
	function eventShipLoaded(){
		that.init();
	}
}
//Render Object prototype Def
Render.prototype = {
	constructor:Render,
	init : function(){
		setInterval(this.drawScreen,100);
//		this.drawScreen();
//		this.drawScreen();
	},
	drawScreen:function(){
		var tileSheet = window.render.tileSheet;
		this.context.clearRect(0, 0, 800, 500);
		window.render.drawMap(tileSheet);
		window.render.drawPlayer(tileSheet);
	},
	drawPlayer:function(tileSheet){
		var players = window.gameManager.gameObjects;
		var item;
		for(var i = 0;i<players.length;i++){
			item = players[i];
			console.log(item);
			var angleInRadians = item.arc / 180 * Math.PI;
			var animFrame = item.animSheet.getFrames();
			console.log(animFrame);
			this.context.save();
			this.context.translate(item.centerX , item.centerY);
			this.context.rotate(angleInRadians);
			this.context.drawImage(tileSheet, animFrame.sourceDx, animFrame.sourceDy,animFrame.sourceW,animFrame.sourceH, -item.destW / 2 , -item.destH / 2 ,item.destW,item.destH);
			
			this.context.restore();
		};
	},
	drawMap : function(tileSheet) {
	//draw a background so we can see the Canvas edges 
		
		this.context.fillStyle = "#aaaaaa";
		this.context.fillRect(0,0,23*33,13*33);
	  
		var mapRows = 13; 
		var mapCols = 23;
		
		var mapIndexOffset = -1;
		var mapTitle = [[78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,78,55,78,78,78,78],
  [102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,55,102,102,102,102],
  [102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,55,102,102,102,102],
  [102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,55,102,102,102,102],
  [102,102,102,102,102,102,102,102,102,102,102,102,102,102,100,100,100,100,55,102,102,102,102],
  [102,102,102,102,102,102,102,102,102,102,102,102,102,102,100,100,100,100,55,102,102,102,102],
  [102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,55,102,102,102,102],
  [102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,102,55,102,102,102,102],
  [102,102,100,100,102,102,102,102,102,102,102,102,102,102,102,102,102,102,55,102,102,102,102],
  [102,102,100,100,102,102,102,102,102,102,102,102,102,102,102,102,102,102,55,102,102,102,102],
  [102,102,100,100,102,102,102,102,60,60,60,60,102,102,102,102,102,102,55,102,102,102,102],
  [102,102,102,102,102,102,102,102,60,74,74,60,102,102,102,102,102,102,102,102,102,102,102],
  [102,102,102,102,102,102,102,102,60,74,74,60,102,102,102,102,102,102,102,102,102,102,102]];

	  for (var rowCtr=0;rowCtr<mapRows;rowCtr++) { 
		for (var colCtr=0;colCtr<mapCols;colCtr++){
			var tileId = mapTitle[rowCtr][colCtr]+mapIndexOffset; 
			var sourceX = Math.floor(tileId % 24) * 33;//tmx use line-based count
			var sourceY = Math.floor(tileId / 24) * 33;
			this.context.drawImage(tileSheet, sourceX, sourceY,32,32,colCtr*33,rowCtr*33,32,32);
		} 
	   }
	
	}
 };