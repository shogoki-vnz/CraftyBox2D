/* Author: @shogoki_vnz	
*/
var world,
	PTM_RATIO = 32,	
	stage_w = 1500,
	stage_h = 300,
	canvas_w = 800,
	canvas_h = stage_h,
	HW = canvas_w/2,
	HH = canvas_h/2,	
	text,
	ctx = this,
	goBackward = false,
	canShot = false,
	speedMax = 80,
	speedUp = false,
	speed,
	PBar,
	turret,
	shotPos,
	rotation = 0,
	currentShape,
	numOfSquares,
	numOfTriangles,
	numOfPentagons,
	floor,
	squareBTN,
	pentBTN,
	triangleBTN,
	selectedShape;
	
window.onload = function () {
    gameInit();
};

gameInit = function(){
	//start crafty
    Crafty.init(canvas_w, canvas_h);
    Crafty.canvas.init();
	Crafty.box2D.init(0, 10, PTM_RATIO, true);
	world = Crafty.box2D.world;
	//Uncoment this tho see the Box2D DebugInfo
	//Crafty.box2D.showDebugInfo();
		
	Crafty.sprite(65, "img/turret.png", {
		turret: [0, 0, 1, 0.7846]
	});
	
	Crafty.sprite(20, "img/shapes.png", {
		square: [0, 0],
		penta: [1, 0],
		triangle: [2, 0]
	});
	
	Crafty.sprite(102, "img/shapesBig.png", {
		squareOut: [0, 0],
		pentaOut: [0, 1],
		triangleOut: [0, 2]
	});
	
	
    Crafty.scene("loading", function () {
        Crafty.load({
            images: ["img/turret.png", "img/shapesBig.png"]
        }, function () {
			createPlayerComponents();             
        });
        Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: HW-50, y: HH-10 })
                .text("Loading")
                .css({ "text-align": "center", "color": "#000000"});
    });   
    Crafty.scene("loading");
	
	Crafty.scene("main", function () {	
		numOfSquares = 3,
		numOfTriangles = 2,
		numOfPentagons = 2
        generateWorld();     
    });
	
	Crafty.scene("gameover", function () {		
        Crafty.e("2D, DOM, Text").attr({ w: 180, h: 20, x: HW-80, y: HH-10 })
                .text("No more shapes remain...<br/>Click on the stage to restart")
                .css({ "text-align": "center"});
		destroyWorld();
		Crafty.addEvent(ctx, "click", restartgame)
    }); 
}

createPlayerComponents = function(){
	Crafty.c("PowerBar", {
			init: function() {
				this.requires("2D, Color");
				this.attr({ x: HW - 30, y: 20, z: 1, w:0, h:10 })
				.color("#000000");
			},			

			powerBar: function(speed, bar) {
				this.attr({ x: HW - 30, y: 20, z: 1, w:speed, h:10 })
				return this;
			}
	});
		
	Crafty.scene("main");
}

generateWorld = function() {	
	/*var wall = Crafty.e("2D, Canvas, Color, Box2D")
				.attr({ x: stage_w-4, y: 0, w:4, h:stage_h})
				.color("#000")
				.box2d({
						bodyType: 'static',
						density : 1.0,
						friction : 10,
						restitution : 0
						});	*/
					
	floor = Crafty.e("2D, Canvas, Color, Box2D, floor")
				.attr({ x: 0, y: stage_h-4, w:stage_w, h:4})
				.color("#000000")
				.box2d(
						{
							bodyType: 'static',
							density : 1.0,
							friction : 10,
							restitution : 0
							
						}
					);
	var copy = Crafty.e("2D, DOM, Text")
					.attr({ x: HW-60, y: 0, w:150})			
					.textFont({ size: '20px', weight: 'bold' })			
					.text("Hold mouse click to shot");
			
	PBar = Crafty.e("Canvas, PowerBar") 
	
	turret = Crafty.e("2D, Canvas, turret")
		  .origin("center")
		  .attr({ x: 40, y: stage_h-60});
		  
	var base = Crafty.e("2D, Canvas, Color")
		  .attr({ x: 35, y: stage_h-20, w: 60, h:20})
		  .color("#000000");
		  
	var stonehenge = Crafty.e("2D, Canvas, Color, Box2D")
		  .attr({ x: stage_w - 400, y: stage_h-100, w: 20, h:100})
		  .color("#000000")
		  .box2d(
						{
							bodyType: 'dynamic',
							density : 20.0,
							friction : 10,
							restitution : 0
							
						}
					);
					
	stonehenge = Crafty.e("2D, Canvas, Color, Box2D")
		  .attr({ x: stage_w - 500, y: stage_h-100, w: 20, h:100})
		  .color("#000000")
		  .box2d(
						{
							bodyType: 'dynamic',
							density : 20.0,
							friction : 10,
							restitution : 0
							
						}
					);
					
	stonehenge = Crafty.e("2D, Canvas, Color, Box2D")
		  .attr({ x: stage_w - 515, y: stage_h-110, w: 150, h:10})
		  .color("#000000")
		  .box2d(
						{
							bodyType: 'dynamic',
							density : 8.0,
							friction : 10,
							restitution : 0
							
						}
					);
					
	Crafty.bind("EnterFrame", onEnterFrame);
	Crafty.addEvent(ctx, "mousemove", onMouseMove);
	Crafty.addEvent(ctx, "mousedown", onDown);
	Crafty.addEvent(ctx, "mouseup", onUp);
	
	squareBTN = Crafty.e("2D, Canvas, Mouse, squareOut")
			.attr({ x: HW - 145, y: HH-57})
			.bind('MouseOver', 
						function() {
							this.sprite(1, 0);
							text.text(numOfSquares+" Squares remaining");
						})
			.bind('MouseOut', 
						function() {
							this.sprite(0, 0);
							text.text("Select a shape to trow");
						})
			.bind('Click', 
						function() {
							if(numOfSquares > 0){
								hideBTNS();
								selectedShape = 1;
								canShot = true;
								numOfSquares--;
							}
						});						
						 
			
	pentBTN = Crafty.e("2D, Canvas, Mouse, pentaOut")
			.attr({ x: HW - 35, y: HH-57})
			.bind('MouseOver', 
						function() {
							this.sprite(1, 1);
							text.text(numOfPentagons+" Pentagons remaining");
						})
			.bind('MouseOut', 
						function() {
							this.sprite(0, 1)
							text.text("Select a shape to trow");
						})
			.bind('Click', 
						function() {
							if(numOfPentagons > 0){
								hideBTNS();
								selectedShape = 2;
								canShot = true;
								numOfPentagons--;	
							}
						});	
	
	triangleBTN = Crafty.e("2D, Canvas, Mouse, triangleOut")
			.attr({ x: HW+60, y: HH-57})
			.bind('MouseOver', 
						function() {
							this.sprite(1, 2);
							text.text(numOfTriangles+" Triangles remaining");
						})
			.bind('MouseOut', 
						function() {
							this.sprite(0, 2)
							text.text("Select a shape to trow");
						})
			.bind('Click', 
						function() {
							if(numOfTriangles > 0){
								hideBTNS();
								selectedShape = 3;
								canShot = true;
								numOfTriangles--;
							}
						});	
	
	text = Crafty.e("2D, DOM, Text")
			.attr({ x: HW-145, y: HH+60, w:150})			
			.textFont({ size: '20px', weight: 'bold' })			
			.text("Select a shape to trow");
}

hideBTNS = function(){
	squareBTN.visible = false;
	pentBTN.visible = false;
	triangleBTN.visible = false;
	text.visible = false;
}

showBTNS = function(){
	if(numOfSquares === 0 && numOfTriangles === 0 && numOfPentagons === 0){
		Crafty.scene("gameover");
	}else{
		squareBTN.visible = true;
		pentBTN.visible = true;
		triangleBTN.visible = true;
		text.visible = true;
	}
}


onMouseMove = function(e){
	if(canShot){
		shotPos = Crafty.DOM.translate(e.clientX, e.clientY);
		rotation = (Math.atan2(shotPos.y - turret.y, shotPos.x - turret.x) * (180 / Math.PI));
		if(rotation > 0){
			rotation = 0; 
		}else if(rotation < -90){
			rotation = -90;
		}
		
		turret.rotation = rotation;	
	}
}

onDown = function(e){
	if(canShot){
		speedUp = true;
	}
}

onUp = function(e){
	if(canShot){
		speedUp = false;
		shotShape();
	}
}

shotShape = function(){
	if(canShot){
		var box2d
		var sprite;
		if(selectedShape === 1){
			sprite = 'square'
			box2d = {
						bodyType: 'dynamic',
						density : 12,
						friction : 0.01,
						restitution : 0.3,
					}			
		}
		else if(selectedShape === 2){
			sprite = 'penta'
			box2d = {
						bodyType: 'dynamic',
						density : 20,
						friction : 0.5,
						restitution : 0.3,
						shape: [
									[10, 0],
									[20, 8],
									[16, 20],
									[4, 20],
									[0, 8]									
								]
					}			
		}else if(selectedShape === 3){
			sprite = 'triangle'
			box2d = {
						bodyType: 'dynamic',
						density : 25,
						friction : 0.2,
						restitution : 0.3,
						shape: [
										[20, 0],
										[20, 20],
										[0, 20]								
									]
					}
		}
		
		currentShape = Crafty.e("Box2D, Canvas,"+sprite)
			  .attr({ x: (40+25.5)-10, y: (stage_h-30)-10, z: 0})		  
			  .box2d(box2d)
			 .onContact("floor", 
							function(data){
								if(data[0].contact.fixtureA === floor.fixtures[0] ||
									data[0].contact.fixtureB === floor.fixtures[0]){
										console.log("hit floor");
									}
							});
		
/*

*/
		currentShape.body.SetBullet(true);
		
		var angleInRadians = (rotation*Math.PI)/200;		
		
		var vx = Math.cos(angleInRadians) * (speed+40);
		var vy = Math.sin(angleInRadians) * (speed+40);
		var impulse = new b2Vec2(vx, vy);
		currentShape.body.ApplyImpulse(impulse, currentShape.body.GetWorldCenter());
		
		currentShape.bind("EnterFrame", onShapeEnterFrame);
		canShot = false;
	}
}

onShapeEnterFrame = function(){
	if(!this.body.IsAwake() || (this.x > stage_w+20 && this.y > stage_h)){
		world.DestroyBody(this.body);		
		speed = 0;
		PBar.powerBar(speed);
		
		this.unbind("EnterFrame", onShapeEnterFrame);		
		
		currentShape.destroy();
		currentShape = null;	
		goBackward = true;
	}
}

onEnterFrame = function() {
	if(speedUp===true){
		if(speed<speedMax){
			speed++;
		}else{
			speed = 0;
		}
		PBar.powerBar(speed);
	}
	
	if(currentShape){
		var vpx = (currentShape._x - HW)
				
		//Max x in map * 32 - Crafty.viewport.width = 1164
		if(vpx > 300) {	
			if(Crafty.viewport.x > -760){
				Crafty.viewport.x -= 20;				
			}
		}		
	}
	
	if(goBackward){
		if(Crafty.viewport.x < 0){
			Crafty.viewport.x += 10;				
		}else{
			goBackward = false;
			showBTNS()
		}
	}
}

destroyWorld = function (){	
	for(var b = world.GetBodyList(); b; b=b.GetNext()) {
		world.DestroyBody(b);      
	}
}

restartgame = function(){
	Crafty.unbind("EnterFrame", onEnterFrame);
	Crafty.removeEvent(ctx, "mousemove", onMouseMove);
	Crafty.removeEvent(ctx, "mousedown", onDown);
	Crafty.removeEvent(ctx, "mouseup", onUp);
	Crafty.removeEvent(ctx, "click", restartgame)
	Crafty.scene("main");
}
