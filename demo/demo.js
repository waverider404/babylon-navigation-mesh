"use strict";

//dungeon algorithm

// get the canvas DOM element
var canvas = document.getElementById('renderCanvas');

// load the 3D engine
var engine = new BABYLON.Engine(canvas, true);

var navigation = new Navigation();
var line = null;

var loadScene = function() {
    //load babylon scene of museum
    var onLoaded = function(loadedScene) {
        var navmesh = scene.getMeshByName("navigator");
      console.log(scene.meshes)
       var mesh = scene.getMeshByName("Cube.001");
      mesh.dispose()
        navmesh.material = new BABYLON.StandardMaterial("navMaterial", scene);
        navmesh.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
        navmesh.material.alpha = 0.5;
        navmesh.material.wireframe = true;
        for (var i = 0; i < scene.meshes.length; i++) {
            scene.meshes[i].convertToFlatShadedMesh();
        }

        var zoneNodes = navigation.buildNodes(navmesh);
        navigation.setZoneData('level', zoneNodes);
    };

    BABYLON.SceneLoader.Append("./demo/mesh/", "level.babylon", scene, onLoaded.bind(this));
};

// Set the basics
var scene = new BABYLON.Scene(engine);
 // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());
    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);
var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), scene);
light.intensity = 0.5;


var map = [],
    width = 64,
    height = 64;

for(var y = 0; y < height; y++){
    map[y] = [];
    for(var x = 0; x < width; x++){
        map[y][x] = 0;
    }        
}
    
//How many rooms?
var minimum_rooms = 5,
    maximum_rooms = 10,
    room_count = Math.floor(Math.random()*maximum_rooms) + minimum_rooms;   

//Room sizes?
var width_root = Math.sqrt(width * 2),
    height_root = Math.sqrt(height * 2),
    minimum_width = 4,
    maximum_width = 10,
    minimum_height = 4,
    maximum_height = 10;

//Create rooms
var roomList = [];

for (var i = 0 ; i < room_count; i++){
   var ok = false;
       
   //This while loop runs until we find somewhere the room fits
   //There are faster ways of doing this but for the map sizes I'm
   //using, it serves my needs and is fast enough.

    while (!ok)
    {
        var room = {};
    
        room.x = ~~(Math.random() * width);
        room.y = ~~(Math.random() * height);
        room.w = ~~(Math.random()*maximum_width) + minimum_width;
        room.h = ~~(Math.random()*maximum_height) + minimum_height;

        
        // check bounds    
        if(room.x + room.w >= width || room.y + room.h >= height){
                continue
        }
    

        // check against other rooms
        for(var r = 0; r < roomList.length; r++){
            if(room.x > roomList[r].x && 
                room.x < roomList[r].x + room.w && 
                room.y > roomList[r].y && 
                room.y < roomList[r].y + room.h){
                    ok = false;
                    break;
            }
        }
        
        
        ok = true;        
        roomList.push(room);
   }
}

//Connect Rooms
var connectionCount = roomList.length,
    connectedCells = [];

for (i = 0; i < connectionCount; i++)
{
   var roomA = roomList[i],
       roomNum = i;
    
       while(roomNum == i){
           roomNum = ~~(Math.random()*roomList.length);
       }
    
       var roomB = roomList[roomNum];
    
   //Increasing this number will make hallways straighter
   //Decreasing this number will make halways skewer
   var sidestepChance = 10,
       pointA = {x : ~~(Math.random()*roomA.w) + roomA.x,
                 y : ~~(Math.random()*roomA.h) + roomA.y},
       pointB = {x : ~~(Math.random()*roomB.w) + roomB.x,
                 y : ~~(Math.random()*roomB.h) + roomB.y};

   //This is a type of drunken/lazy walk algorithm    
    while (pointB.x !== pointA.x || pointB.y !== pointA.y){
        var num = Math.random()*100;
      
        if (num < sidestepChance){
            if (pointB.x !== pointA.x){
                if(pointB.x > pointA.x){
                    pointB.x--;
                }else{
                    pointB.x++;                   
                }
            }
        }else if(pointB.y !== pointA.y){
                if(pointB.y > pointA.y){
                    pointB.y--;
                }else{
                    pointB.y++;                   
                }
        }
        
        if(pointB.x < width && pointB.y < height){
            connectedCells.push({x:pointB.x, y:pointB.y});
        }
    }
}

// set the room fill data
for(i = 0; i < roomList.length; i++){
    for(var y = roomList[i].y; y < roomList[i].y + roomList[i].h; y++){
        for(var x = roomList[i].x; x < roomList[i].x + roomList[i].w; x++){
            //console.log(y + " : " + x);
            map[y][x] = 1;
        }        
    }
}

// set the connection data
for(i = 0; i < connectedCells.length; i++)
{
      map[connectedCells[i].y][connectedCells[i].x] = 2;
}

// color the walls
for(var y = 0; y < height; y++){
    for(var x = 0; x < width; x++){
        if(map[y][x] == 0){
            var wall = false;
            for(var yy = y-2; yy < y+2;yy++){
                for(var xx = x-2; xx < x+2;xx++){ 
                    if(xx > 0 && yy > 0 && xx < width && yy < height){
                        if(map[yy][xx] == 1 || map[yy][xx] == 2){
                            map[y][x] = 3;
                            wall = true;
                        }
                    }
                }
                if(wall){ 
                    break;
                }                    
            }
        }
    }        
}

// Create a minimoi
var minimoi = BABYLON.Mesh.CreateBox("Me", 4, scene);
minimoi.material = new BABYLON.StandardMaterial("navMaterial", scene);
minimoi.material.diffuseColor = new BABYLON.Color3(1., 0., 0);

//the player
var emojimat = new BABYLON.StandardMaterial("mat1",scene)
    emojimat.diffuseTexture = new BABYLON.Texture("https://raw.githubusercontent.com/waverider404/game-assets/master/depositphotos_50151419-stock-illustration-vector-cartoon-orange-monster-face.jpg", scene)
    emojimat.diffuseTexture.vOffset = .8;//Repeat 5 times on the Vertical Axes
    emojimat.diffuseTexture.uOffset = .2;//Repeat 5 times on the Horizontal Axes

      var createEmoji = function(){  
        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
    var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 5, scene);
    sphere.material = emojimat
    // Move the sphere upward 1/2 its height
    sphere.position.y = 1;
    sphere.scaling.z = -sphere.scaling.z
    sphere.scaling.x = -sphere.scaling.x
    sphere.rotation.set(-2.6666656494140626, 0.92222900390625, 0)
    this.emoji = sphere
      }
      createEmoji.prototype.instanceModel = function(){
          return this.emoji
      }
      createEmoji.prototype.setInitials = function(x, y, z){
         this.emoji.position.set(x, y, z);
        // camera.lockedTarget = this.emoji
         camera.position.x = this.emoji.position.x
         camera.position.z = this.emoji.position.z + 69
         camera.position.y = this.emoji.position.y + 84
         camera.rotation.y = Math.PI
      }
    createEmoji.prototype.locomotion = function(x, z){
        camera.setTarget(this.emoji.absolutePosition)
           camera.position.x = this.emoji.position.x
         camera.position.z = this.emoji.position.z + 69
         camera.position.y = this.emoji.position.y + 84
        this.emoji.position = BABYLON.Vector3.Lerp(this.emoji.position, new BABYLON.Vector3(x, 0, z), .005)
        this.emoji.rotation.y = Math.atan2(x-this.emoji.position.x, z-this.emoji.position.z)
    }
      var emoji1 = new createEmoji()
        var model = emoji1.instanceModel()
//Dungeon
var scaler = canvas.width / width;
var fact = .5
var baseblock = BABYLON.Mesh.CreateBox("sphere1", 2, scene);
var floormat = new BABYLON.StandardMaterial("mat1",scene)
floormat.diffuseTexture = new BABYLON.Texture("https://raw.githubusercontent.com/waverider404/game-assets/master/Floor_Texture_Sci-Fi_Picture_2_001.jpg", scene)

var wallmat = new BABYLON.StandardMaterial("mat1",scene)
wallmat.diffuseTexture = new BABYLON.Texture("https://raw.githubusercontent.com/waverider404/game-assets/master/tech-floors-by-neil-blevins-cghub-artist-s-ments-e-of-a-for-spaceship-wall-texture-2018-of-spaceship-wall-texture.jpg", scene)
var floor = []
var fences = []
for(var y = 0; y < height; y++){
    for(var x = 0; x < width; x++){
        switch(map[y][x]){
            case 0:   
                break;                
            case 1:
                var blocks = baseblock.clone();
                blocks.scaling.x = scaler*fact
                
                blocks.scaling.z = scaler*fact
                blocks.position.x = x*scaler
                blocks.position.z = y*scaler
                floor.push(blocks)
                break;
            case 2:   
                var blocks = baseblock.clone();
                blocks.scaling.x = scaler*fact
                blocks.scaling.z = scaler*fact
                blocks.position.x = x*scaler
                blocks.position.z = y*scaler
         
                minimoi.position.set(x*scaler, 1, y*scaler)
                emoji1.setInitials(x*scaler, 1, y*scaler)
                floor.push(blocks)
                break;
            case 3:   
                var blocks = baseblock.clone();
                blocks.scaling.x = scaler*.5
                blocks.scaling.z = scaler*.5
                blocks.scaling.y = 2.5
                blocks.position.x = x*scaler
                blocks.position.z = y*scaler;
                blocks.material = wallmat
                fences.push(blocks)
                break;
        }

    }        
}

var groundfloor = new BABYLON.Mesh.MergeMeshes(floor)
groundfloor.material = floormat
groundfloor.name = "navigator"
 

        var vel = new BABYLON.Vector3.Zero()
        var move = false
        scene.onPointerDown = function(ev, pick){
        if(pick.hit){
            move = true
                vel.copyFrom(pick.pickedPoint)
            }
        }

        scene.registerBeforeRender(function(){
            if(move)
            emoji1.locomotion(vel.x, vel.z)
        })

setInterval(function(){

    var path = navigation.findPath(minimoi.position, new BABYLON.Vector3(model.absolutePosition.x, 1, model.absolutePosition.z), 'level', navigation.getGroup('level', minimoi.position)) || [];
    if (path && path.length > 0) {
        var length = 0;
        var direction = [{
            frame: 0,
            value: minimoi.position
        }];
        for (var i = 0; i < path.length; i++) {
            length += BABYLON.Vector3.Distance(direction[i].value, path[i]);
            direction.push({
                frame: length*100,
                value: path[i]
            });
        }

        for (var i = 0; i < direction.length; i++) {
            direction[i].frame /= length;
        }

        var moveCamera = new BABYLON.Animation("CameraMove", "position", 180/length+10, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        moveCamera.setKeys(direction);
        minimoi.animations.push(moveCamera);

        if (line) line.dispose();
        line = BABYLON.Mesh.CreateLines("lines", [minimoi.position].concat(path), scene);
        line.color = new BABYLON.Color3(1, 0, 0);
        line.position.y = 0.001;

        scene.beginAnimation(minimoi, 0, 100);
    }

}, 1000);


loadScene();


// run the render loop
engine.runRenderLoop(function(){
    scene.render();
});

// the canvas/window resize event handler
window.addEventListener('resize', function(){
    engine.resize();
});

