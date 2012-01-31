/* Author: @shogoki_vnz
*/
var world,
	PTM_RATIO = 32,
	w = 600,
	h = 400,
	hw = w/2,
	hh = h/2,
	mouseJoint,	
	ctx = this,
	isMouseDown = false,
	mouseX,
	mouseY,
	mousePVec,
	selectedBody;
	
window.onload = function () {
    gameInit();
};

gameInit = function(){
	//start crafty
    Crafty.init(w, h);
    Crafty.canvas.init();
	//Init the box2d world, gx = 0, gy = 10
	Crafty.box2D.init(0, 10, PTM_RATIO, true);
	world = Crafty.box2D.world;
	//Start the Box2D debugger
	Crafty.box2D.showDebugInfo();  
	
	Crafty.scene("main", function () {				
        generateWorld();     
    });
	
	Crafty.scene("main");
}

generateWorld = function() {	
					
   var walls = Crafty.e("2D, Canvas, Box2D")
				.attr({ x: 0, y: 0})
				.box2d({
						bodyType: 'static',
						density : 1.0,
						friction : 10,
						restitution : 0,
						shape: [
									[0, 0],
									[w, 0],
									[w, 10],
									[0, 10]
								]
						});	
	
	walls.addFixture(
						{
							bodyType: 'static',
							density : 1.0,
							friction : 10,
							restitution : 0,
							shape: [
										[0, 0],
										[10, 0],
										[10, h],
										[0, h]
									]
							
						}
					);
					
	walls.addFixture(
						{
							bodyType: 'static',
							density : 1.0,
							friction : 10,
							restitution : 0,
							shape: [
										[(w-10), 0],
										[w, 0],
										[w, h],
										[(w-10), h],
									]
							
						}
					);
					
	walls.addFixture(
						{
							bodyType: 'static',
							density : 1.0,
							friction : 10,
							restitution : 0,
							shape: [
										[0, (h-10)],
										[w, (h-10)],
										[w, h],
										[0, h]
									]
							
						}
					);
	
	
	genterateChars();	
}

genterateChars = function(){	 
	 for(var i = 0; i < 10; ++i) {
		var _w, _h, shape;
		
		if(Math.random() > 0.5) {
			_w = Crafty.math.randomInt(PTM_RATIO, PTM_RATIO*2);
			_h = Crafty.math.randomInt(PTM_RATIO, PTM_RATIO*2);
			shape = "box";
		}else{
			_w = Crafty.math.randomInt(PTM_RATIO, PTM_RATIO*2);
			_h = _w;
			shape = "circle";
		}
		
		var fallingElement =  Crafty.e("2D, Canvas, Color, Mouse, Box2D")
							.origin("center")
							.color("#fff")
							.attr({ 
								x: Crafty.math.randomInt(30, w-100), 
								y: 0, 
								h: _w, 
								w: _h
							})
							.box2d({
									bodyType: 'dynamic',
									density : 1.0,
									friction : 2,
									restitution : 0.2,
									shape: shape
							});	
	 }
	 
	Crafty.addEvent(ctx, "mousedown", 
									function(e) {
										isMouseDown = true;
										mousemoved(e);
										Crafty.addEvent(ctx, "mousemove", mousemoved)
									 });
         
    Crafty.addEvent(ctx, "mouseup", function(){
									Crafty.removeEvent(ctx, "mousemove", mousemoved);
									isMouseDown = false;
									mouseX = undefined;
									mouseY = undefined;
								});
								
	Crafty.bind("EnterFrame", onEnterFrame);
}

mousemoved = function(e) {
	mouseX = e.clientX / PTM_RATIO;
	mouseY = e.clientY / PTM_RATIO;
};

getBodyAtMouse = function() {
	mousePVec = new b2Vec2(mouseX, mouseY);
	var aabb = new Box2D.Collision.b2AABB();
	aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
	aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
	
	// Query the world for overlapping shapes.

	selectedBody = null;
	world.QueryAABB(getBodyCB, aabb);
	return selectedBody;
 }

getBodyCB = function(fixture) {
	if(fixture.GetBody().GetType() !== b2Body.b2_staticBody) {
	   if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
		  selectedBody = fixture.GetBody();
		  return false;
	   }
	}
	return true;
 }

onEnterFrame = function() {
	if(isMouseDown && (!mouseJoint)) {
               var body = getBodyAtMouse();
               if(body) {
                  var md = new b2MouseJointDef();
                  md.bodyA = world.GetGroundBody();
                  md.bodyB = body;
                  md.target.Set(mouseX, mouseY);
                  md.collideConnected = true;
                  md.maxForce = 300.0 * body.GetMass();
                  mouseJoint = world.CreateJoint(md);
                  body.SetAwake(true);
               }
            }
            
	if(mouseJoint) {
	   if(isMouseDown) {
		  mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
	   } else {
		  world.DestroyJoint(mouseJoint);
		  mouseJoint = null;
	   }
	}
}
