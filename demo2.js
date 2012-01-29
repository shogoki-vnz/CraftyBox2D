window.onload = function () {
    gameInit();
};

gameInit = function(){
	//start crafty
        var stageW = 500;
        var stageH = 400;
        Crafty.init(stageW, stageH);
        Crafty.canvas.init();
        Crafty.box2D.init(0, 10, 32, true);
        Crafty.background("#eee");
        
        Crafty.c("PowerBar", {

                init: function() {
                        this.attr({ x: (stageW-b_size*6)/2, y: 20, z: 1, w:1, h:b_size })
                        .color("#fff") 
                },
                

                PowerBar: function(speed, bar) {
                        bar.attr({ x: (stageW-b_size*6)/2, y: 20, z: 1, w:speed, h:b_size })
                        return this;
                }
        });
             
        var floor = Crafty.e("2D, Canvas, Box2D")
                                    .attr({ x: 0, y: 0})
                                    .box2d({
                                            bodyType: 'static',
                                            shape: [
                                                                    [0, stageH],
                                                                    [stageW, stageH]
                                                            ]
                                            });
        var blck_cnt = 20;
        var b_size = 10;
        var speed = 1;
        var speedMax = b_size*6;
        var speedUp = false;
        
        
        for (var x =0; x<blck_cnt/2; x++){
                for (var y =0; y<blck_cnt/2; y++){ 
                var box = Crafty.e("2D, Canvas, Color, Box2D")
                                .attr({ x: (stageW-(x*b_size))/2, y: stageH-(y*b_size)-10, w:b_size, h:b_size})
                                .color("#FF0000")
                                .box2d({
                                                   bodyType: 'dynamic',
                                                   density : 10,
                                                   friction : 30,
                                                   restitution : 0
                                });
                }
        }
        
        var PBar = Crafty.e("2D, Canvas, Color, PowerBar")   
        
        var dropper = Crafty.e("2D, Canvas, Color, Mouse")
                .attr({ x: (stageW-(b_size*6))/2, y: 0, z: 3, w:b_size*6, h:b_size*2 })
                .color("#ccc")
                .bind("EnterFrame", function(){
                        if(speedUp===true){
                                if(speed<speedMax){
                                        speed++;
                                }
                                else{
                                        speed =1;
                                }
                        PBar.PowerBar(speed, PBar);
                        }
                })
                .bind("MouseDown", function() {
                        console.log("start at"+speed);
                        speedUp = true;        
                })
                .bind("MouseUp", function() {
                        console.log("release at"+speed);
                        var size = Math.ceil((speed/speedMax)*4);
                        var drop = Crafty.e("2D, Canvas, Color, Box2D")
                                        .attr({ x: (stageW-b_size*2)/2, y: 0, z: 1, w:size*b_size, h:size*b_size })
                                        .color("#0ff")
                                        .box2d({
                                                        bodyType: 'dynamic',
                                                        density : speed,
                                                        friction : 30,
                                                        restitution : 0.5
                                                });
                        speedUp = false;
                })
                ;
                
                
        var txt = Crafty.e("2D, Canvas, Text")
                .attr({ x: (stageW-(b_size*6)+15)/2, y: -5, z: 3, w:b_size*2, h:b_size*2 })
                .text("Click Here")
                
}