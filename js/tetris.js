/*
 *  Created on 17 september 2015
 *  @author: vkl
 */

var score;
var level;
var timeout;
var Matrix = ["010:111,10:11:10,111:010,01:11:01",
              "110:011,01:11:10",
              "011:110,10:11:01",
              "11:11",
              "100:111,11:10:10,111:001,01:01:11",
              "001:111,10:10:11,111:100,11:01:01",
              "1111,1:1:1:1"];

var currentShape;
var currentIndex;
var timer;
var maxLines= 20;
var maxCells = 10;
var rows;
var startGame = false;

function fillField() {
	var x, y, xPos, yPos = 0;
	var data = '<svg class="stack">'; 
	for ( x=0; x<10; x++ ) {
		for ( y=0; y<20; y++ ) {
			xPos = x * 20 + 2 + x * 2;
			yPos = y * 20 + 2 + y * 2;
			data += '<rect class="off" width="20" height="20" x="' + xPos + '" y="' + yPos + '" />';
		}
	}
	data += '<text style="text-anchor: middle; font-size: 45; fill: #000;" x="111" y="200"></text></svg>';
	document.getElementsByClassName("main")[0].innerHTML = data;
}

function Shape( matrix, x, y ) {
	this.currentPos = 0;
	this.x = 1;
	this.y = 1;
	this.ismoving = true;
	this.visible = false;
	if ( x != undefined ) this.x = x;
	if ( y != undefined ) this.y = y;
	if ((this.x > 10) || (this.y > 20) || (this.x <= 0) || (this.y <= 0))
		throw "Coordinates out of range";
	if ( matrix == undefined )
		throw "Matrix was not defined";
	this.position = matrix.split(",");
	this.maxPos = this.position.length;
}

Shape.prototype.show = function() {
	var lines = this.position[this.currentPos].split(":");
	var i, j, l, cell;
	var cells = [];
	if ((this.x > 10) || (this.y > 20) || (this.x <= 0) || (this.y <= 0)) return false;
	for (j=0; j<lines.length; j++){
		l = lines[j].length;
		for ( i=0; i<l; i++ ) {
			cell = document.getElementsByTagName("rect")[(((this.x+i)-1)*20) + ((this.y+j)-1)];
			if (lines[j].substr(i, 1) === "1") {
				cells.push(cell);
				if ( cell == undefined ) return false;
				if (cell.getAttribute("class") == "on")	return false;
				if (((this.x+i) > 10) || ((this.y+j) > 20)) return false;
			}
		}
	}
	cells.map(function( item ){ item.setAttribute("class", "on"); })
	this.visible = true;
	return true;
}

Shape.prototype.hide = function(){
	var lines = this.position[this.currentPos].split(":");
	var i, j, l, cell;
	for (j=0; j<lines.length; j++){
		l = lines[j].length;
		for ( i=0; i<l; i++ ) {
			cell = document.getElementsByTagName("rect")[(((this.x+i)-1)*20) + ((this.y+j)-1)];
			if ( cell == undefined ) return;
			if (lines[j].substr(i, 1) === "1") cell.setAttribute("class", "off");
		}
	}
}

Shape.prototype.turn = function(){
	if (this.ismoving == false) return;
	this.hide();
	if (this.currentPos >= (this.maxPos - 1))
		this.currentPos = 0;
	else
		this.currentPos++;
	res = this.show();
	if (res == false) {
		this.currentPos--;
		this.show();
	}
}

Shape.prototype.moveRight = function(){
	var res;
	if (this.ismoving == false) return;
	this.hide();
	this.x++;
	res = this.show();
	if (res == false) {
		this.x--; 
		this.show()
	}
}

Shape.prototype.moveLeft = function(){
	var res;
	if (this.ismoving == false) return;
	this.hide();
	this.x--;
	res = this.show();
	if (res == false) {
		this.x++;
		this.show();
	}
}

Shape.prototype.moveDown = function(faster){
	var res;
	if (this.ismoving == false) return;
	this.hide();
	this.y++;
	res = this.show();
	if (res == false) { 
		this.y--;
		this.show();
		this.ismoving = false; 
	}
	if (faster == true)
		this.moveDown(faster);
}

function checkLine(index) {
	var x;
	var result = 0;
	for (x=1; x<=maxCells; x++) {
		if (document.getElementsByTagName("rect")[((x-1) * 20) + (index-1)].getAttribute("class") == "on") 
			result++;
	}
	return result;
}

function removeLine(index) {
	var x;
	for (x=1; x<=maxCells; x++) {
		document.getElementsByTagName("rect")[((x-1) * 20) + (index-1)].setAttribute("class", "off"); 
	}
}

function copyLines(toIndex) {
	var x, y;
	var val;
	var fromIndex;
	for (y=toIndex; y>=1; y--){
	    for (x=1; x<=maxCells; x++) {
	    	fromIndex = y - 2;  
	    	if (fromIndex <= 0) break;
	    	val = document.getElementsByTagName("rect")[((x-1) * 20) + fromIndex].getAttribute("class"); 
	    	document.getElementsByTagName("rect")[((x-1) * 20) + (y-1)].setAttribute("class", val);
	    }
	}
}

function main() {
	
	fillField();
	
	document.getElementById("startGame").onclick = function(){
		clearTimeout(timer);
		timer = 0;
		score = 0;
		level = 0;
		timeout = 800; 
		document.getElementsByClassName("score")[0]
		    .children[0]
		    .innerText = score;
		document.getElementsByClassName("level")[0]
		    .children[0]
		    .innerText = level;
		if (currentShape) currentShape = undefined;
		var rects = document.getElementsByTagName("rect");
		var i;
		for (i=0; i<rects.length; i++) {
			rects[i].setAttribute("class", "off");
		}
		document.getElementsByTagName("text")[0].innerHTML = "";
		startGame = true;
		Action();
	};
	
	// pause
	document.getElementsByClassName("main").onclick = function(){
		if (startGame) {
			if (timer) {
				clearTimeout(timer);
				timer = 0;
				document.getElementsByTagName("text")[0].innerHTML = "Pause";
			} else {
				document.getElementsByTagName("text")[0].innerHTML = "";
				Action();
			}
		}
	};
	
	document.getElementById("turnBtn").onclick = function(){
		if (currentShape && timer) {
			clearTimeout(timer);
			currentShape.turn();
			Action();
		}
	};
	
	document.getElementById("leftBtn").onclick = function(){
		if (currentShape && timer) {
			clearTimeout(timer);
			currentShape.moveLeft();
			Action();
		}
	};
	
	document.getElementById("rightBtn").onclick = function(){
		if (currentShape && timer) {
			clearTimeout(timer);
			currentShape.moveRight();
			Action();
		}
	};
	
	document.getElementById("downBtn").onclick = function(){
		if (currentShape && timer) {
			currentShape.moveDown(true);
		}
	};
	
	document.getElementById("game").onkeydown = function( event ){
	  if (startGame) { 
		switch ( event.keyCode ){
			case 38: // turn
				if (currentShape && timer) {
					clearTimeout(timer);
					currentShape.turn();
					Action();
				}
				break;
			case 39: // right
				if (currentShape && timer) {
					clearTimeout(timer);
					currentShape.moveRight();
					Action();
				}
				break;
			case 37: // left
				if (currentShape && timer) {
					clearTimeout(timer);
					currentShape.moveLeft();
					Action();
				}
				break
			case 40: // down
				if (currentShape && timer) {
					currentShape.moveDown(true);
				}
				break
			case 32: // pause
				if (timer) {
					clearTimeout(timer);
					timer = 0;
					document.getElementsByTagName("text")[0].innerHTML = "Pause";
				} else {
					document.getElementsByTagName("text")[0].innerHTML = "";
					Action();
				}
				break
			default:
				console.log( event.keyCode );
		}
	  }	
	};
	
	function Action() {
		if ( currentShape == undefined ) {
			currentIndex = Math.floor(Math.random() * 7);
			currentShape = new Shape( Matrix[currentIndex], 4, 1 );
			currentShape.show();
			if (currentShape.visible == false) {
				clearTimeout(timer);
				document.getElementsByTagName("text")[0].innerHTML = "Game over";
				startGame = false;
				return;
			}
		} else {
			currentShape.moveDown();
			if (currentShape.ismoving == false) {
				currentShape = undefined;
				rows = [];
				var index;
				var result;
				for ( index=maxLines; index>0; index-- ) {
					result = checkLine(index)
					if (result === 0) break; else rows.push(result);
					if (result === 10) {
						score += 10;
						console.log(score);
						document.getElementsByClassName("score")[0]
						    .children[0]
						    .innerText = score;
						removeLine( index );
						copyLines( index );
						index++;
						if ( score >= (100 + (100 * level)) ) {
							level++;
							timeout = timeout - (level * 10);
							document.getElementByClassName("level" )
							    .children[0]
							    .innerText = level;
						}
					}
				}
			}
		}
		timer = setTimeout(Action, timeout);
	}
};
