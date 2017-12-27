canvas = document.getElementById('game');
ctx = canvas.getContext('2d');
var coinsnd = new Audio("audio/coin.wav");
var deathsnd = new Audio("audio/death.wav");
var jumpOnEnemySound = new Audio("audio/jump_on_enemy.mp3");
var maintheme = new Audio("audio/maintheme.mp3");

maintheme.volume = 0.3;
maintheme.loop = true;

function restart() {
  if (game.state != 'playing') {
    sprites = [];
    monsters = [];
    coins = [];
    player.x =50;
    player.y =100;
    init();
    game.state = playing;
    gameLoop();
  }
}

// awa images
img = new Image();
img.src = 'tile.png';
img.onload = function() {
  init();
  gameLoop();
}

img2 = new Image();
img2.src = 'spritesheet/sprite.png';

// the size of the world
var gameWorld = {
  x: 0,
  y: 0,
  width: map.width * map.tilewidth, // 100 * 32
  height: map.height * map.tileheight // 80 * 32
};

// the size of the canvas
// we'll be moving the camera inside the world...smartass 3:)
var camera = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height
};


// globs
var tileSize = 64;       // The size of a tile (32�32)


var movement = {
  left: false,
  right: false,
  up: false,
};

var sprites = [];

// jumping vars
var isOnGround = undefined;
var jumpForce = -8.5;

// collision arrays
var collisionObjects = [];
var coins = [];
var monsters = [];
var s7ab = [];

var score = 0;

var SpriteObject = {
    killable: true,
    movable: true,
    name: "",
    img,
    x: 0,
    y: 0,
    vx: -2,
    vy: 0,
    sx: 0,
    sy: 0,
    sw: 0,
    sh: 0,
    width: 0,
    height: 0,
    accelerationX: 1.5,
    accelerationY: 0,
    speedLimit: 7,
    gravity: 0.5,
    bounce: 7,
    animation: {},
    animationName: "",
    lastAnimationName: "",
    scale: 1,
    currAnimEnd: 0,
    currAnimationSpeed: 120,
    animInteval: undefined,
    lastDirection: undefined,
    play: function() {
      var i = -1;

      this.animInteval = setInterval(() => {
        if (this.lastAnimationName !== this.animationName) {          
          this.lastAnimationName = this.animationName;
          this.currAnimEnd = this.animation[this.animationName].length - 1;
          i = -1;
        }        
        
        i++;
        this.sx = this.animation[this.animationName][i].frame.x;
        this.sy = this.animation[this.animationName][i].frame.y;
        this.sw = this.animation[this.animationName][i].frame.w;
        this.sh = this.animation[this.animationName][i].frame.h;
        this.width = this.animation[this.animationName][i].frame.w * this.scale;
        this.height = this.animation[this.animationName][i].frame.h * this.scale;
        if (i >= this.currAnimEnd) i = -1;
      }, this.currAnimationSpeed);
      
      
    },
    centerX: function() { return this.x + (this.width / 2); },
    centerY: function() { return this.y + (this.height / 2); },
    halfWidth: function() { return this.width / 2; },
    halfHeight: function() { return this.height / 2; }
};

var game = {
  state: 'playing'
}

// the player
var player;

function init() {
  // map variables
  background_height = map.height;
  background_width = map.width;
  tile_width = map.tilesets[0].tileheight;
  tile_height = map.tilesets[0].tileheight;
  image_width = map.tilesets[0].columns;
  margin = map.tilesets[0].margin;
  space = map.tilesets[0].spacing;
  first = map.tilesets[0].firstgid;

  // create the player
  player = Object.create(SpriteObject);
  player.x = 10;
  player.y = 100;
  player.scale = 0.17;

  // add animations to the player
  addAnimation("idle", player);
  addAnimation("run", player);
  addAnimation("jump up", player);
  addAnimation("jump fall", player);
  addAnimation("dizzy", player);

  // assign playah image
  player.img = img2;

  // play the playa animation
  player.animationName = "idle";
  player.play();

  // create teh map
  createMap();

  // push the player to the game sprites
  sprites.push(player);

  // create the collision objects
  createCollisionObjects();
}


function createCollisionObjects() {
  for (j=0;j<6;j++)
  if (map.layers[j].name === "ground" || map.layers[j].name === "box")
    for(i=0;i<map.layers[j].data.length;i++) {
    var content=map.layers[j].data[i]-first;//1
      if (content > 0) {
        var mapx = Math.floor(i%background_width)*tile_width;
        var mapy = Math.floor(i/background_width)*tile_height;
        var col = Object.create(SpriteObject);
        col.x = mapx;
        col.y = mapy;
        col.width = 64;
        col.height = 64;
        collisionObjects.push(col);
      }
    }
}

function createMap() {
  for (j=0; j < map.layers.length; j++) {
    if (map.layers[j].type === "objectgroup") {
      for(i=0 ; i < map.layers[j].objects.length; i++) { 
          var obj = map.layers[j].objects[i];
          var monster = Object.create(SpriteObject);
            monster.img = img2;
            monster.x = obj.x;
            monster.y = obj.y;
            monster.currAnimationSpeed = 120;
            switch(obj.name) {
              case "dragon":
                addAnimation('dragon', monster);
                monster.animationName = "dragon";
                monster.scale = 0.09;
                monster.play();
                monster.movable = false;
                break;
              case "flower": 
                addAnimation('flower', monster);
                monster.animationName = "flower";
                monster.scale = 0.12;
                monster.movable = false;
                monster.play();
                break;
              case "pink": 
                addAnimation('pink', monster);
                monster.animationName = "pink";
                monster.scale = 0.12;
                monster.play();
                break;
              case "green": 
                addAnimation('green', monster);
                monster.animationName = "green";
                monster.scale = 0.1;
                monster.play();
                break;
              case "spike": 
                addAnimation('spike', monster);
                monster.animationName = "spike";
                monster.scale = 0.25;
                monster.movable = false;
                monster.play();
                monster.name = "spike";
                break;
              case "blue": 
                addAnimation('blue', monster);
                monster.animationName = "blue";
                monster.scale = 0.1;
                monster.play();
                break;
            }
            
            
            sprites.push(monster);
            
            monsters.push(monster);

      }
    } else {
      for(i=0 ; i < map.layers[j].data.length; i++) {
        content=  map.layers[j].data[i]-first; //1
        var sprite = Object.create(SpriteObject);
        
        sprite.sx = Math.floor(content % image_width) * (tile_width + space) + margin;
        sprite.sy = Math.floor(content / image_width) * (tile_width+ space) + margin;
        sprite.sw = tileSize;
        sprite.sh = tileSize;
        sprite.width = tileSize;
        sprite.height = tileSize;
        sprite.x = Math.floor(i % background_width) * tile_width;
        sprite.y = Math.floor(i / background_width) * tile_height;
        if (map.layers[j].name === 'coin' && content > 0) {
          coins.push(sprite);
        }

        if (map.layers[j].name === 's7ab' && content > 0) {
          s7ab.push(sprite);
          console.log(s7ab);
        }

        sprites.push(sprite);
      }
    }
  }
}

function draw() {
  for (var i = 0; i < sprites.length; i++) {
    var sprite = sprites[i];
    //console.log(sprite.img);
    ctx.drawImage(sprite.img, sprite.sx, sprite.sy, sprite.sw, sprite.sh, sprite.x, sprite.y, sprite.width, sprite.height);
  }
}

function gameLoop() {
  if (game.state === 'playing') {
    requestAnimationFrame(gameLoop);
    handlePlayer();
    for (var i = 0; i < s7ab.length; i++) {
      s7ab[i].vx = -1;
      s7ab[i].x += s7ab[i].vx;
    }
    render();
  }
}

function render() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  draw();
  ctx.restore();
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText(score, canvas.width - 100, 50);
}

function handlePlayer() {

  // collision with ground
  for (var i =0; i < collisionObjects.length; i++) {
    var colObj = collisionObjects[i];
    if (blockRectangle(player, colObj) === 'bottom' && player.vy >= 0) {
      player.vy = 0;
      isOnGround = true;
    }
  }
  // // // collision with coins
  for (var j =0; j < coins.length; j++) {
    var coinObj = coins[j];
    if (hitTestRectangle(coinObj, player)) {
      console.log('touched a coina');
      const cs = coinsnd.cloneNode();
      cs.volume = 0.2;
      cs.play();
      var index = sprites.indexOf(coinObj);
      sprites.splice(index, 1);
      coins.splice(j, 1);
      score += 100;
    }
  }



  // // // collision with monster
  for (var k =0; k < monsters.length; k++) {
    var monsterObj = monsters[k];
    if (monsterObj.movable)
      monsterObj.x += monsterObj.vx;
    for (var i =0; i < collisionObjects.length; i++) {
      var colObj = collisionObjects[i];
      var direction = blockRectangle(monsterObj, colObj)
      if ( direction === 'left') {
        monsterObj.vx = 2;
      }
      if ( direction === 'right') {
        monsterObj.vx = -2;
      }
    }

    var collision = blockRectangle(player, monsterObj,  true);
    if (collision !== 'none') {
      if (collision === "bottom" && monsterObj.name !== "spike") {
        console.log('kill monster');
        var en = jumpOnEnemySound.cloneNode();
        en.play();
        var index = sprites.indexOf(monsterObj);
        sprites.splice(index, 1);
        monsters.splice(k, 1);
        delete monsterObj;
      } else {
        killPlayer();
      }
    }
  }

  // Up
  if(movement.up && isOnGround) {
    player.animationName = "jump up";
    player.vy += jumpForce;
    isOnGround = false;
  }

  if (!isOnGround && player.vy > 0) {
    player.animationName = "jump fall";
  }

  // Left
  if(movement.left && !movement.right) {
    player.accelerationX = -0.8;
    if (isOnGround) player.animationName="run";
    player.lastDirection="left";
  }

  // Right
  if(movement.right && !movement.left) {
    player.accelerationX = 0.8;
    if (isOnGround) player.animationName="run";
    player.lastDirection="right";
  }

  if(!movement.left && !movement.right) {
    player.accelerationX = 0;
    player.vx = 0;
    if (isOnGround) player.animationName = "idle";
  }

  if(movement.up && !movement.down) {
    player.accelerationY = -0.2;
  }

  // move the camera
  // Center the camera to follow the player
  camera.x = Math.floor(player.x + (player.width / 2) - (camera.width / 2));
  camera.y = Math.floor(player.y + (player.height / 2) - (camera.height / 2));

  //Keep the camera inside the gameWorld boundaries
  if(camera.x < gameWorld.x) camera.x = gameWorld.x;
  if(camera.y < gameWorld.y) camera.y = gameWorld.y;
  if(camera.x + camera.width > gameWorld.x + gameWorld.width)
    camera.x = gameWorld.x + gameWorld.width - camera.width;
  if(camera.y + camera.height > gameWorld.height)
    camera.y = gameWorld.height - camera.height;

  // apply acceleration to velocity
  player.vx += player.accelerationX;
  player.vy += player.accelerationY;

  player.vy += player.gravity;

  // apply speed limin 3:)
  if (player.vx > player.speedLimit) player.vx = player.speedLimit;
  if (player.vx < -player.speedLimit) player.vx = -player.speedLimit;

  // move the player
  player.x += player.vx;
  player.y += player.vy;


  


}

function killPlayer() {
  // playe death sound
  deathsnd.play();
  
  // change game state
  game.state = 'dead';

  // change player animation to dead
  player.animationName = "dizzy";

  // 
  ctx.fillStyle = "black";
  ctx.globalAlpha = 0.2;
  ctx.fillRect(0,0,canvas.width, canvas.height);
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("You Are Dead , Your Score is " + score, canvas.width / 3, 100);

}

// blocks two colliding rectangles
function blockRectangle(r1, r2, bounce) {

    //Set bounce to a default value of false if it's not specified
    if(typeof bounce === "undefined") {
      bounce = false;
    }
    
    //Create an optional collision vector object to represent the bounce surface
    var s = {};
    
    //A variable to tell us which side the collision is occurring on
    var collisionSide = "";
    
    //Calculate the distance vector
    var vx = r1.centerX() - r2.centerX();
    var vy = r1.centerY() - r2.centerY();
    
    //Figure out the combined half-widths and half-heights
    var combinedHalfWidths = r1.halfWidth() + r2.halfWidth();
    var combinedHalfHeights = r1.halfHeight() + r2.halfHeight();
    
    //Check whether vx is less than the combined half widths
    if(Math.abs(vx) < combinedHalfWidths) {
      //A collision might be occurring!
      //Check whether vy is less than the combined half heights
      if(Math.abs(vy) < combinedHalfHeights) {
        //A collision has occurred! This is good!
        //Find out the size of the overlap on both the X and Y axes
        var overlapX = combinedHalfWidths - Math.abs(vx);
        var overlapY = combinedHalfHeights - Math.abs(vy);
        //The collision has occurred on the axis with the
        //*smallest* amount of overlap. Let's figure out which
        //axis that is
        if(overlapX >= overlapY) {
          //The collision is happening on the X axis, but on which side? vy can tell us
          if(vy > 0) {
            collisionSide = "top";
            //Move the rectangle out of the collision
            r1.y = r1.y + overlapY;
          } else {
            collisionSide = "bottom";
            //Move the rectangle out of the collision
            r1.y = r1.y - overlapY;
          }
        
          //Bounce
          if(bounce) {
            r1.vy = -r1.bounce;
          }
        } else {
        
        //The collision is happening on the Y axis, but on which side? vx can tell us
        if(vx > 0) {
          collisionSide = "left";
        
          //Move the rectangle out of the collision
          r1.x = r1.x + overlapX;
        }    else {
      collisionSide = "right";
      //Move the rectangle out of the collision
      r1.x = r1.x - overlapX;
    } //Bounce
    
    if(bounce) {
      r1.vx *= -1;
    }
    }
    }
    else
    {
    //No collision
    collisionSide = "none";
    }
    }
    else
    {
    //No collision
    collisionSide = "none";
    }
    return collisionSide;
}

// physics functions
function hitTestRectangle(r1, r2) {
    //A variable to determine whether there's a collision
    var hit = false;

    //Calculate the distance vector
    var vx = r1.centerX() - r2.centerX();
    var vy = r1.centerY() - r2.centerY();

    //Figure out the combined half-widths and half-heights
    var combinedHalfWidths = r1.halfWidth() + r2.halfWidth();
    var combinedHalfHeights = r1.halfHeight() + r2.halfHeight();

    //Check for a collision on the X axis
    if(Math.abs(vx) < combinedHalfWidths) {
        //A collision might be occurring. Check for a collision on the Y axis
        if(Math.abs(vy) < combinedHalfHeights) {
            //There's definitely a collision happening
            hit = true;
        } else {
            //There's no collision on the Y axis
            hit = false;
        }
    } else {
        //There's no collision on the X axis
        hit = false;
    }

    return hit;
}

// keyboard events
document.addEventListener('keydown', function(e) {
  if (e.keyCode == 39) movement.right = true;
  if (e.keyCode == 37) movement.left = true;
  if (e.keyCode == 38) movement.up = true;
});

document.addEventListener('keyup',function(e) {
  if (e.keyCode == 39) movement.right = false;
  if (e.keyCode == 37) movement.left = false;
  if (e.keyCode == 38) movement.up = false;
});

function addAnimation(name, object) {
  object.animation[name] = [];
  for (var i = 0; i < animations.frames.length; i++) {
    var frame = animations.frames[i];
    if (frame.filename.indexOf(name) != -1) {
      object.animation[name].push(frame);
    }
  }
}
