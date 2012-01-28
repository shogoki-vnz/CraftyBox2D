# CraftyBox2D
It's a component that facilitates the use of the Physics Engine Box2D in [Crafty](http://craftyjs.com/). The Box2D implementation 
that the component use is [box2dweb](http://code.google.com/p/box2dweb/).

***

##Using CraftyBox2D
First you must init the box2dWorld as follow
<code>
	Crafty.box2D.init(0, 10, 32, true);
</code>

The above code initialize the world with 0 for the world gravity in the x-axis, 10 for the world gravity in the y-axis
32 for the pixel-to-meter ratio, and allow the world sleep. The init method also attach the world.steep() function tho
the stage "EnterFrame" event

Once the world has been initialized, you can start to add entitys with the Box2D component
<code>
	 var floor = Crafty.e("2D, Canvas, Box2D")
		.attr({ x: 0, y: 0})
		.box2d({
			bodyType: 'static',
			shape: [
					[0, 300],
					[400, 300]
				]
		});
						
    var box = Crafty.e("2D, Canvas, Color, Box2D")
		 .attr({ x: 0, y: 0, w:20, h:20})
		 .color("#FF0000")
		 .box2d({
				bodyType: 'dynamic'
		 });
</code>

Above first we create the floor, set the bodyType to static, and set the collition box in the botom of the stage
then we create a box with 20x20 pixels, red color and set the body type to dynamic and left the collition area to
the default values. Running the game a see the box falling to the floor.

the are more options that you can set, please see the demo game code for more.