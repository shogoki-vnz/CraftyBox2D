/* Author: @shogoki_vnz
	this game is based in http://www.raywenderlich.com/475/how-to-create-a-simple-breakout-game-with-box2d-and-cocos2d-tutorial-part-12	
*/
var world,
	PTM_RATIO = 32,
	w = 800,
	h = 600,
	hw = w/2,
	hh = h/2,
	walls,
	ball,
	paddle,
	jointDef,
	_contacts = [],
	toDestroy = [],
	totalBlocks,	
	ctx = this;
	
window.onload = function () {
    gameInit();
};

gameInit = function(){
	//start crafty
    Crafty.init(w, h);
    Crafty.canvas.init();
	Crafty.box2D.init(0, 0, PTM_RATIO, true);
	world = Crafty.box2D.world;
	//Uncoment this tho see the Box2D DebugInfo
	//Crafty.box2D.showDebugInfo();
	
	
	Crafty.sprite(15, "img/ball.png", {
		ball: [0, 0]
	});
	
	
    Crafty.scene("loading", function () {        
        Crafty.load(["img/ball.png"], function () {	
			createPlayerComponents();             
        });       
        Crafty.background("#000");
        Crafty.e("2D, DOM, Text").attr({ w: 100, h: 20, x: hw-50, y: hh-10 })
                .text("Loading")
                .css({ "text-align": "center", "color": "#ffffff"});
    });   
    Crafty.scene("loading");
	
	Crafty.scene("main", function () {				
        generateWorld();     
    });
	
	Crafty.scene("gameover", function () {		
        Crafty.e("2D, DOM, Text").attr({ w: 180, h: 20, x: hw-80, y: hh-10 })
                .text("Sorry Game Over Bro...<br/>Click on the stage to restart")
                .css({ "text-align": "center", "color": "#ffffff"});
		destroyWorld();
		Crafty.addEvent(ctx, "click", restartgame)
    }); 

	Crafty.scene("gamecomplete", function () {		
        Crafty.e("2D, DOM, Text").attr({ w: 180, h: 20, x: hw-80, y: hh-10 })
                .text("Congratulations You Win!<br/>Click on the stage to restart")
                .css({ "text-align": "center", "color": "#ffffff"});
		destroyWorld();
		Crafty.addEvent(ctx, "click", restartgame)
    }); 
}



createPlayerComponents = function(){
	Crafty.c("PaddleControls", {
		init: function() {
		  this.requires("Keyboard");		  
		  return this.speed = 3;
		},
		paddleControls: function(speed) {			
		  if (speed) {
			this.speed = speed;
		  }
		  this.bind("EnterFrame", function() {			
			if (this.disableControls) {
			  return;
			}
			var dx = 0;
			
			if (this.isDown("D")) {
			  //this.x += this.speed;
			  dx = this.speed;
			}
			if (this.isDown("A")) {
			  //this.x -= this.speed;
			  dx = -1 * this.speed;
			}
			
			if (dx !== 0) {
			  return this.body.ApplyImpulse(new b2Vec2(dx/PTM_RATIO, 0), this.body.GetWorldCenter());			  
			}
		  });
		  return this;
		}
	  });
	  
	Crafty.c("Colorme", {
		colors : null,
		init: function() {
		  this.requires("Color");
		  this.colors = ["#fff", "#00FF00", "#0000FF" ,"#FF0000"];
		},
		colorme: function(index) {	
		  this.color(this.colors[index]);
		  return this;
		}
	  });

	Crafty.c("GameBlock", {
		isBlock : true,
		id : '',
		remain : 0,
		gameBlock: function(_id, _remain) {	
		  this.id = _id;
		  this.remain = _remain;
		  return this;
		}
	 });
	  
	Crafty.scene("main");
}

generateWorld = function() {	
					
    walls = Crafty.e("2D, Canvas, Color, Box2D, walls")
				.attr({ x: 0, y: 0})
				.box2d({
						bodyType: 'static',
						density : 1.0,
						friction : 0,
						restitution : 0,
						shape: [
									[0, 0],
									[w, 0]
								]
						});	
	
	walls.addFixture(
						{
							bodyType: 'static',
							density : 1.0,
							friction : 0,
							restitution : 0,
							shape: [
										[0, 0],
										[0, h]
									]
							
						}
					);
					
	walls.addFixture(
						{
							bodyType: 'static',
							density : 1.0,
							friction : 0,
							restitution : 0,
							shape: [
										[w, 0],
										[w, h]
									]
							
						}
					);
					
	walls.addFixture(
						{
							bodyType: 'static',
							density : 1.0,
							friction : 0,
							restitution : 0,
							shape: [
										[0, h],
										[w, h]
									]
							
						}
					);
	
	
	genterateChars();	
}

genterateChars = function(){
	//create our ball
	 ball = Crafty.e("2D, Canvas, ball, Box2D")
			.attr({ x: hw-15, y: 575, z: 1, isBall:true})
			.box2d({
					bodyType: 'dynamic',
					density : 1,
					friction : 0.2,
					restitution : 1,
					shape : 'circle'
				})
			.onContact("GameBlock", 
							function(data){
								var block = data[0].obj;								
								block.remain--;
								if(block.remain <= 0){								
									world.DestroyBody(block.body);
									block.destroy();
								}else{	
									block.colorme(block.remain-1);
								}
							})
			.onContact("walls", 
							function(data){
								if(data[0].contact.fixtureA === data[0].obj.fixtures[3] ||
									data[0].contact.fixtureB === data[0].obj.fixtures[3]){
									Crafty.scene("gameover");
								}																							
							});	
					
	ball.body.SetBullet(true);
	var	fx = (Math.random() > 0.5) ? 2 : -2;
	var force = new b2Vec2(fx, 1.5);
	ball.body.ApplyImpulse(force, ball.body.GetWorldCenter());
	
	paddle = Crafty.e("2D, Canvas, Color, Box2D, PaddleControls")
		  .attr({ x: hw-35, y: 580, z: 1, w:70, h:5 })
		  .color("#fff")		  
		  .box2d({
						bodyType: 'dynamic',
						density : 8,
						friction : 1,
						restitution : 0
					})
		  .paddleControls(75)
		  .bind("EnterFrame", 
						function() {
							var maxSpeed = 10;							
 
							var velocity = this.body.GetLinearVelocity();
							var speed = velocity.Length();							
							if (speed > maxSpeed) {
								this.body.SetLinearDamping(0.5);
							} else if (speed < maxSpeed) {
								this.body.SetLinearDamping(0.0);
							}
						}			
					);
	
	// Restrict paddle along the x axis
	jointDef = new b2PrismaticJointDef;
	var worldAxis = new b2Vec2(1, 0);
	jointDef.collideConnected = true;
	jointDef.Initialize(paddle.body, walls.body, 
	  paddle.body.GetWorldCenter(), worldAxis);
	world.CreateJoint(jointDef);
	
	//Adding some blocks to play
	var blocksByColumns = 13;
	totalBlocks = 0;
	for(var i = 0; i < 8; i++) {
		var padding=5;
		var blockw = 50;
		blocksByColumns--;
		for(var j = 0; j < blocksByColumns; ++j){	
			totalBlocks++
			var xOffset = (hw-(blocksByColumns*((blockw+padding)/2)))+((blockw+padding)*j);
			var rand = Math.random();
			var maxTouchs = Crafty.math.randomInt(1, 4);
			var posy = 70+(15*i);
			var block = Crafty.e("2D, Canvas, Colorme, Box2D, GameBlock")
			  .attr({ x: xOffset, y: posy, w:blockw, h:5})
			  .colorme(maxTouchs-1)
			  .gameBlock("block"+j+'_'+i, maxTouchs)
			  .box2d({
							bodyType: 'solid',
							density : 10,
							friction : 0,
							restitution : 1
						});
		}	 
	}
}

destroyWorld = function (){	
	for(var b = world.GetBodyList(); b; b=b.GetNext()) {
		world.DestroyBody(b);      
	}
}

restartgame = function(){
	Crafty.removeEvent(ctx, "click", restartgame)
	Crafty.scene("main");
}