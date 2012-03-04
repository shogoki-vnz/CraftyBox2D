var   b2Vec2 = Box2D.Common.Math.b2Vec2
         	,	b2BodyDef = Box2D.Dynamics.b2BodyDef
         	,	b2Body = Box2D.Dynamics.b2Body
         	,	b2FixtureDef = Box2D.Dynamics.b2FixtureDef
         	,	b2Fixture = Box2D.Dynamics.b2Fixture
         	,	b2World = Box2D.Dynamics.b2World
         	,	b2MassData = Box2D.Collision.Shapes.b2MassData
         	,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
         	,	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
         	,	b2DebugDraw = Box2D.Dynamics.b2DebugDraw
			,	b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef
			,	b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef
			,	b2ContactListener = Box2D.Dynamics.b2ContactListener
            ;
			
/**@
* #Box2D
* @category Box2D
* Component that adds the Box2D physics engine capabilities to the entities.
*/
Crafty.c("Box2D", {	
	/**@
	* #.body
	* The 'b2Body' element of the entity.	
	*/
	body : null,
	
	/**@
	* #.fixtures
	* Array than contains the b2Fixtures of the entity.	
	*/
	fixtures : null,
	
	init: function () {
		this.requires("2D");
		
		if (!Crafty.box2D.world) {
			Crafty.box2D.init(0, 10, 55, true);
		}
	},
	/**@
	* #.box2d
	* @comp Box2D		
	* @sign public void .box2d(Object obj)
	* @param obj - Object with the bodyType(dynamic, static, kinematic) and fixture data to make
	* the fist fixture of the body
	*
	* Create the b2Body and link to the crafty entity, it only need the bodyType
	* ie: .box2d({bodyType: 'solid'}) 
	* this will create a b2Body and make a fixture with the default, the other params of the object,
	* are the same of the method .addFixture
	* 
	*/
	box2d: function(obj){
		var world = Crafty.box2D.world;
		var PTM_RATIO =	Crafty.box2D.PTM_RATIO;
		var fixDef;
		var vertexCount = 0;
		this.fixtures = [];
		
		var BodyDef = new b2BodyDef;
		
		if(obj.bodyType === "dynamic"){
			BodyDef.type = b2Body.b2_dynamicBody;
		}else if (obj.bodyType === "static"){
			BodyDef.type = b2Body.b2_staticBody;
		}else{
			BodyDef.type = b2Body.b2_kinematicBody;
		}
		
		
		BodyDef.position.Set(this._x/PTM_RATIO, this._y/PTM_RATIO);
		BodyDef.userData = this;
		
		this.body = world.CreateBody(BodyDef);
		
		this.addFixture(obj);
		
		return this;
	},
	/**@
	* #.addFixture
	* @comp Box2D		
	* @sign public void .addFixture(Object fixture)
	* @param fixture - Object with the B2FixtureDef or the propierties to make 
	*	a B2Fixture (Density, Friction, Restitution, Shape, etc)
	*
	* Add a fixture to te body of the entity, you can pass a complete B2FixtureDef for more control
	* ie: .addFixture({fixDef: B2FixtureDef}) or pass the propierties what you want 
    * ie: .addFixture(
	*				  {
	*					density: Number, 
	*					friction: Number, 
	*					restitution: Number, 
	*					shape: Array with the shape or String with the shape you want('circle', 'box')
    *				  }) 	
	*
	* If you pass a empty obj, the metod will create a fixture with default values, when the 
	* fixture is made, it's attached to the body and add to the fixtures Array
	*/
	addFixture : function(fixtureDef){
		var PTM_RATIO =	Crafty.box2D.PTM_RATIO;
		
		if(fixtureDef.fixDef){
			fixDef = obj.fixDef;
		}else{
			fixDef = new b2FixtureDef;
			fixDef.density = (!isNaN(fixtureDef.density)) ? fixtureDef.density : 1;
			fixDef.friction = (!isNaN(fixtureDef.friction)) ? fixtureDef.friction : 0.5;
			fixDef.restitution = (!isNaN(fixtureDef.restitution)) ? fixtureDef.restitution : 0.2;
			fixDef.shape = new b2PolygonShape;
			
			//console.log(fixDef);
			if(!fixtureDef.shape || typeof fixtureDef.shape === "string"){
				if(fixtureDef.shape === "circle"){
					fixDef.shape = new b2CircleShape(
											 this._w/PTM_RATIO/2
										   );
					
					fixDef.shape.SetLocalPosition(
								new b2Vec2(
										this._w/PTM_RATIO/2, 
										this._h/PTM_RATIO/2
									  )
							);
				
				}else{
					vertexCount = 2;
					fixDef.shape.SetAsOrientedBox(
											this._w/PTM_RATIO/2, 
											this._h/PTM_RATIO/2, 
											new b2Vec2(
														this._w/PTM_RATIO/2, 
														this._h/PTM_RATIO/2
													  )
											);
				}
			}else{
				vertexCount = fixtureDef.shape.length;
				var shapeArray = [];
				for(var i = 0; i < vertexCount; i++){
					var vector = fixtureDef.shape[i]
					shapeArray.push(new b2Vec2(vector[0]/PTM_RATIO, vector[1]/PTM_RATIO));
				}
				fixDef.shape.SetAsArray(
									shapeArray, vertexCount
								);
			}
			
			this.fixtures.push(this.body.CreateFixture(fixDef));
			
			return this;
		}
	},
	contact:function(comp){
		var finalresult = [];
		var entitys = Crafty(comp);		
		for(entity in entitys){			
			if(!isNaN(entity)){					
				var obj = Crafty(entitys[entity]);
				if(!obj.__c["Box2D"]){
					return false;
				}else{					
					for(_contact in Crafty.box2D.contacts){							
						var contact = Crafty.box2D.contacts[_contact];							
						for(i in this.fixtures){
							var fixtureA = this.fixtures[i];							
							for(j in obj.fixtures){
								var fixtureB = obj.fixtures[j];
								if ((contact.fixtureA === fixtureA && contact.fixtureB === fixtureB) ||
									(contact.fixtureA === fixtureB && contact.fixtureB === fixtureA)) {
									
									finalresult.push(
														{ 
															obj: obj, 															
															contact : contact
														});							
								}
							}
						}
					}
				}
			}
		}
		
		return (finalresult.length) ? finalresult : false;
	},
	onContact: function (comp, fn) {
		this.bind("EnterFrame", function () {
			var hitdata = this.contact(comp);
			if (hitdata) {				
				fn.call(this, hitdata);
			} 
		});
		return this;
	},
});

/**@
* #Crafty.box2D
* @category Box2D
* Collection of methods to init Box2D World.
*/
Crafty.extend({
	box2D: {
		ShowBox2DDebug : false,
		contacts : null,
	/**@
		* #Crafty.box2D.world
		* @comp Crafty.box2D
		* This will return the b2World element.
		*/
		world : null,
		
	/**@
		* #Crafty.box2D.PTM_RATIO
		* @comp Crafty.box2D
		* This will return the pixel-to-meter ratio used to draw the b2World.
		*/
		PTM_RATIO : null,
		
		/**@
		* #Crafty.box2D.init
		* @comp Crafty.box2D		
		* @sign public void Crafty.box2D.init(Number gx, Number gy, Number ptm_ratio, Boolean doSleep)
		* @param gx - gravity force of the x-axis
		* @param gy - gravity force of the y-axis
		* @param ptm_ratio - pixel-to-meter ratio
		* @param doSleep permit the Box2D world sleep
		* Creates a b2World element and bind the Box2D 'step' to Crafty EnterFrame funct
		* Must be called before any entities with the Box2D component can be drawn.
		*
		* This method will automatically be called if no `Crafty.canvas.b2World` is
		* found.
		*/
		init: function (gx, gy, ptm_ratio, doSleep) {
			var _world = new b2World(
							   new b2Vec2(gx, gy)    //gravity
							,  doSleep                 //allow sleep
						 );
		 
			var _PTM_RATIO = ptm_ratio;
			
			var _contacts = [];
			
			//Add the contactlistener and bind the Crafty EnterFrame	
			var contactListener = new b2ContactListener;
			contactListener.BeginContact = function(contact)
										   {
												var myContact = { 
																	fixtureA: contact.GetFixtureA(), 
																	fixtureB: contact.GetFixtureB() 
																};
												
												//don't add if contact is already in the list
												for(contact in _contacts){
													if ((_contacts[contact].fixtureA == myContact.fixtureA) && 
														(_contacts[contact].fixtureB == myContact.fixtureB)) {													
															return;
													}
												}
												_contacts.push(myContact);												
										   };
										   
			contactListener.EndContact = function(contact)
										   {													
												var myContact = { 
																	fixtureA: contact.GetFixtureA(), 
																	fixtureB: contact.GetFixtureB() 
																};
																								
												for(contact in _contacts){
													if ((_contacts[contact].fixtureA == myContact.fixtureA) && 
														(_contacts[contact].fixtureB == myContact.fixtureB)) {
														_contacts.splice(contact, 1);
														return;
													}
												}
										   };
										   
			_world.SetContactListener(contactListener);
			
			Crafty.bind("EnterFrame", function() {
				_world.Step(
					   1 / 30   //frame-rate
					,  8       //velocity iterations
					,  3       //position iterations
				 );
				 
				for(var b = _world.GetBodyList(); b; b=b.GetNext()) {    
					if (b.GetUserData()) {
						var sprite = b.GetUserData(); 
						sprite.attr(
									{
										x: b.GetPosition().x * _PTM_RATIO, 
										y:b.GetPosition().y * _PTM_RATIO
									}					
							);
						sprite.rotation = Crafty.math.radToDeg(b.GetAngle());
									
					}        
				}	
					
				if(Crafty.box2D.ShowBox2DDebug){
					_world.DrawDebugData();
				}
				_world.ClearForces();
				
			});
			
			Crafty.box2D.world = _world;
			Crafty.box2D.PTM_RATIO = _PTM_RATIO;
			Crafty.box2D.contacts = _contacts;
		},
		
		showDebugInfo : function(){
			var _world = Crafty.box2D.world;
			var _PTM_RATIO = Crafty.box2D.PTM_RATIO;
			
			if (Crafty.support.canvas) {				
				var c = document.createElement("canvas");
				c.id = "Box2DCanvasDebug";
				c.width = Crafty.viewport.width;
				c.height = Crafty.viewport.height;
				c.style.position = 'absolute';
				c.style.left = "0px";
				c.style.top = "0px";

				Crafty.stage.elem.appendChild(c);
				
				var debugDraw = new b2DebugDraw();
				debugDraw.SetSprite(c.getContext('2d'));
				debugDraw.SetDrawScale(_PTM_RATIO);
				debugDraw.SetFillAlpha(0.7);
				debugDraw.SetLineThickness(1.0);
				debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
				_world.SetDebugDraw(debugDraw);				
				Crafty.box2D.ShowBox2DDebug = true;
			}else{
				Crafty.box2D.ShowBox2DDebug = false;
			}
		}
	}
});