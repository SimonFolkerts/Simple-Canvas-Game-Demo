(function () {
  // INIT ============================================================================
  var canvas = document.getElementById("canvas");

  $("#canvas, #modal, #playbutton").on("tap touchstart click", function (
    event
  ) {
    event.preventDefault();
    if (!gameArea.canvas) {
      $("#modal").addClass("hidden");
      showSplash(canvas);
      loadAssets();
      $(canvas).addClass("no-cursor");
    } else if (!gameArea.active) {
      gameArea.interval = setInterval(updateGameArea, settings.interval);
      gameArea.active = true;
      $(canvas).addClass("no-cursor");
    }
  });
  $(window).on("tap touchstart click", function (event) {
    console.log(event.target);
    if (!gameArea.canvas) {
      return null;
    } else if (event.target !== gameArea.canvas && gameArea.active) {
      gameArea.pause();
      // $("#canvas").removeClass("no-cursor");
    }
  });
  //  these event listeners trigger the setup/pausing/unpausing of the game
  //  --------------------------------------------------------------------------------

  //
  function showSplash(target) {
    target.width = settings.canvasWidth;
    target.height = settings.canvasHeight;
    var ctx = target.getContext("2d");
    ctx.font = "20px Arial";
    ctx.fillText("LOADING ASSETS...", 10, 30, 400);
  }
  //  this function displays a loading screen
  //  --------------------------------------------------------------------------------

  function loadAssets() {
    //player ship
    assetPool.playerShipImg.src = playerShipProperties.image;
    //player missile
    assetPool.playerMissileImg.src = playerMissileProperties.image;
    //enemyBasic
    assetPool.enemyBasicImg.src = enemyBasicProperties.image;
    //explosion
    assetPool.explosionImg.src = explosionProperties.image;
    //background
    assetPool.backgroundImg.src = "./img/background.jpg";
    //cursor
    assetPool.cursorImg.src = cursorProperties.image;
  }
  //  this function specifies the files to load for each asset
  //  --------------------------------------------------------------------------------

  var assetPool = new (function () {
    this.playerShipImg = new Image();
    this.playerMissileImg = new Image();
    this.enemyBasicImg = new Image();
    this.explosionImg = new Image();
    this.backgroundImg = new Image();
    this.cursorImg = new Image();

    this.loadedAssets = 0;
    this.assets = [
      this.playerShipImg,
      this.playerMissileImg,
      this.enemyBasicImg,
      this.explosionImg,
      this.backgroundImg,
    ];
    this.assets.forEach(function (asset) {
      asset.onload = function () {
        assetPool.checkAssetsLoaded();
      };
    });
    this.checkAssetsLoaded = function () {
      assetPool.loadedAssets++;
      if (assetPool.loadedAssets === assetPool.assets.length) {
        startGame();
      }
    };
  })();
  //  this object initialises the assets for each object that needs one, and assigns
  //  an event listener to each asset to determine when it is loaded. When all assets are loaded
  //  it triggers the start of the game loop

  function startGame() {
    gameArea.start();
    playerShip = new playerShip(40, 120, playerShipProperties);
    cursor = new cursor(0, 0, cursorProperties);
  }
  //  this function calls the necessary methods and functions to set up the game world
  //  --------------------------------------------------------------------------------

  //  OBJECTS AND OBJECT CONSTRUCTORS ================================================

  var gameArea = {
    start: function () {
      this.active = true;
      this.terminate = false;

      this.enemies = [];
      this.playerMissiles = [];
      this.explodyBits = [];
      this.exhausts = [];
      this.crosshairs = [];
      this.explosions = [];
      this.entities = [
        [this.enemies],
        [this.playerMissiles],
        [this.explodyBits],
        [this.exhausts],
        [this.crosshairs],
        [this.explosions],
      ];
      this.frameNo = 0;
      this.canvas = document.getElementById("canvas");
      this.canvas.width = settings.canvasWidth;
      this.canvas.height = settings.canvasHeight;
      $(this.canvas).css("background-color", settings.canvasColor);
      this.context = this.canvas.getContext("2d");
      this.interval = setInterval(updateGameArea, settings.interval);
      this.mouseX = 0;
      this.mouseY = 0;
      this.mouseDown = false;
      this.score = 0;

      this.bgImg = assetPool.backgroundImg;
      this.bgCounter = 0;

      this.canvas.addEventListener("touchmove", function (event) {
        gameArea.getTouchPos(event);
        cursor.visible = false;
      });
      this.canvas.addEventListener("mousemove", function (event) {
        gameArea.getMousePos(event);
        cursor.visible = true;
      });
      this.canvas.addEventListener("touchstart", function (event) {
        event.preventDefault();
        event.stopPropagation();
        gameArea.getTouchPos(event);
        if (gameArea.terminate) {
          gameArea.start();
        }
        gameArea.mouseDown = true;
        cursor.visible = false;
      });
      this.canvas.addEventListener("mousedown", function (event) {
        event.preventDefault(); //to prevent text on page highlighting if spamming click
        if (gameArea.terminate) {
          gameArea.start();
        }
        gameArea.mouseDown = true;
        cursor.visible = true;
      });
      ["mouseup", "touchend"].forEach(function (event) {
        gameArea.canvas.addEventListener(event, function () {
          gameArea.mouseDown = false;
        });
      });
    },
    getMousePos: function (mouseEvent) {
      var rect = this.canvas.getBoundingClientRect();
      gameArea.mouseX = Math.round(mouseEvent.clientX) - rect.left;
      gameArea.mouseY = Math.round(mouseEvent.clientY) - rect.top;
    },
    getTouchPos: function (touchEvent) {
      var rect = this.canvas.getBoundingClientRect();
      gameArea.mouseX = touchEvent.touches[0].clientX - rect.left;
      gameArea.mouseY = touchEvent.touches[0].clientY - rect.top;
      if (event.target === gameArea.canvas) {
        event.preventDefault();
      }
    },
    background: function () {
      if (this.bgCounter < 615) {
        this.bgCounter++;
      } else {
        this.bgCounter = 0;
      }
      this.context.drawImage(
        this.bgImg,
        0,
        0,
        this.bgImg.width,
        320,
        0 - this.bgCounter,
        0,
        this.bgImg.width,
        320
      );
    },
    clear: function () {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    pause: function () {
      clearInterval(this.interval);
      this.active = false;
      this.updateScore();
    },
    stop: function () {
      clearInterval(this.interval);
      this.active = false;
      this.terminate = true;
      this.killEntities();
    },
    killEntities: function () {
      playerShip.targetsLocked = [];
      this.entities.forEach(function (entityList) {
        entityList.forEach(function (entity) {
          if (entity.active) {
            entity.active = false;
          }
        });
      });
    },
    updateScore: function () {
      ctx = gameArea.context;
      ctx.font = "20px Arial";
      ctx.fillStyle = "black";
      if (!this.active && !this.terminate) {
        ctx.fillText(this.score + " - PAUSED", 5, 20);
      } else {
        ctx.fillText(this.score, 5, 20);
      }
    },
  };
  //  this object stores the game state and objects and contains the functionality
  //  necesary to initialize, interface with and update/display the game world.
  //  ----- methods:
  //  start()         - initialise the game area
  //  getMousePos()   - get the mouse position
  //  getTouchPos()   - get touch position
  //  background()    - adjust and draw the background
  //  clear()         - empty the canvas
  //  pause()         - halt the game, preserving state
  //  stop()          - halt the game, initiate cleanup
  //  killEntities()  - set all extant active objects to inactive
  //  updateScore()   - update the score readout
  //  --------------------------------------------------------------------------------

  function component(x, y, params) {
    if (!params) {
      console.log("no object data passed");
    }
    //basic attributes
    this.active = params.active;
    this.age = 0;
    //position and dimension info
    this.x = x;
    this.y = y;
    this.width = params.width;
    this.height = params.height;
    this.topLeftBoundary = function () {
      //this determines the top left coordinate
      //of the entity for collision detection
      return {
        x: this.x - this.width / 2,
        y: this.y - this.height / 2,
      };
    };
    this.topLeftSprite = function () {
      //this determines the top left coordinate
      //of the entity for drawing
      return {
        x: this.x - this.destWidth / 2,
        y: this.y - this.destHeight / 2,
      };
    };
    this.rotate = params.rotate;
    this.angle = params.angle;
    //bounding box info
    this.color = params.color;
    //rendering info
    this.offsetX = params.offsetX;
    this.offsetY = params.offsetY;
    this.srcWidth = params.srcWidth;
    this.srcHeight = params.srcHeight;
    this.index = params.index;
    this.destWidth = this.srcWidth * params.rescaleX;
    this.destHeight = this.srcHeight * params.rescaleY;
    //draw bounding box
    this.drawBox = function () {
      //this function checks if rotation is enabled for this object, and if so,
      //runs the code necessary to draw the rotated image. Otherwise is skips the
      //save/rotate/restore actions to improve performance and merely draws a rect
      ctx = gameArea.context;
      if (this.rotate) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = this.color;
        ctx.fillRect(
          -this.width / 2,
          -this.height / 2,
          this.width,
          this.height
        );
        ctx.restore();
      } else {
        ctx.fillStyle = this.color;
        ctx.fillRect(
          this.topLeftBoundary().x,
          this.topLeftBoundary().y,
          this.width,
          this.height
        );
      }
    };
    //draw sprite
    this.drawSprite = function () {
      //this function uses the same logic as the one above, but instead of a rect
      //it draws a specified sprite frame.
      if (this.rotate) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        gameArea.context.drawImage(
          this.image, //source file
          this.index * this.srcWidth, //source x
          0, //source y
          this.srcWidth, //sub-image width
          this.srcHeight, //sub-image height
          -this.destWidth / 2 + this.offsetX,
          -this.destHeight / 2 + this.offsetY,
          this.destWidth, //destination width
          this.destHeight
        ); //destination height
        ctx.restore();
      } else {
        gameArea.context.drawImage(
          this.image, //source file
          this.index * this.srcWidth, //source x
          0, //source y
          this.srcWidth, //sub-image width
          this.srcHeight, //sub-image height
          this.topLeftSprite().x + this.offsetX,
          this.topLeftSprite().y + this.offsetY,
          this.destWidth, //destination width
          this.destHeight
        ); //destination height
      }
    };
    this.render = function () {
      if (settings.drawBoundBoxes) {
        this.drawBox();
      }
      if (settings.drawSprites) {
        this.drawSprite();
      }
    };
  }
  //  this serves as the prototype for the entities on the board. It contains information
  //  necessary to position and render the entities at various locations, orientations and so on.
  //  ----- external methods:
  //  drawBox()       - draw bounding box
  //  drawSprite()    - draw sprite
  //  render()        - draw according to config rule
  //  --------------------------------------------------------------------------------

  function playerShip(x, y, params) {
    //run component()'s initialization logic - playerShip extends component
    component.call(this, x, y, params);

    this.image = assetPool.playerShipImg;

    this.acceleration = params.acceleration;
    this.maxSpeed = params.maxSpeed;
    this.targetsLocked = [];

    //if mouse is not pressed and there are targets locked, fire a missile at and
    //unlock each target in sequence until no targets are locked
    this.fireControl = function () {
      if (!gameArea.mouseDown && this.targetsLocked.length >= 1) {
        if (gameArea.frameNo % 3 === 0) {
          this.fire(this.targetsLocked[0]);
          this.targetsLocked.splice(0, 1);
        }
      }
    };

    //fire a missile at a target
    this.fire = function (target) {
      gameArea.playerMissiles.push(
        new playerMissile(
          playerShip.x,
          playerShip.y,
          playerMissileProperties,
          target
        )
      );
    };

    //update position with respect to user input
    this.newPos = function (targetY) {
      this.y +=
        clamp(targetY - this.y, -this.maxSpeed, this.maxSpeed) /
        this.acceleration;
    };

    //run necessary logic to prepare for the next frame
    this.update = function () {
      this.fireControl();
      this.index = Math.round(
        clamp((this.y - gameArea.mouseY) / 13 + 15, 0, 29)
      );
    };
  }
  //  playerShip extends component. This constructs the player character.
  //  ----- external methods:
  //  newPos()        - update position
  //  update()        - controller that prepares for next frame and draws object
  //  drawBox()       - draw bounding box
  //  drawSprite()    - draw sprite
  //  render()        - draw according to config rule
  //  --------------------------------------------------------------------------------

  function playerMissile(x, y, params, target) {
    //run component()'s initialization logic - playerMissile extends component
    component.call(this, x, y, params);

    this.image = assetPool.playerMissileImg;

    this.acceleration = params.acceleration;

    this.velocityX;
    this.velocityY;
    this.thrust = params.thrust;
    this.target = target;
    this.target.tracked = true;
    this.path = [[this.x, this.y]];

    //get angle to target
    this.getAngle = function () {
      var x = this.x - this.target.x;
      var y = this.y - this.target.y;
      this.angle = Math.atan2(y, x) - Math.PI;
    };
    //update position with respect to target
    this.newPos = function () {
      var tx = this.target.x - this.x;
      var ty = this.target.y - this.y;
      var dist = Math.sqrt(tx * tx + ty * ty);

      this.thrust = this.thrust + this.acceleration;

      this.velocityX = (tx / dist) * this.thrust;
      this.velocityY = (ty / dist) * this.thrust;

      this.x += this.velocityX;
      this.y += this.velocityY;
    };
    //run necessary logic to prepare for the next frame
    this.update = function () {
      this.age++;
      this.getAngle();
      if (this.index <= 18) {
        this.index++;
      } else {
        this.index = 1;
      }
      if (this.age > 75) {
        this.active = false;
      }
      if (settings.generateSmoke) {
        for (var i = 0; i <= settings.smokeFactor; i++) {
          gameArea.exhausts.push(
            new exhaust(
              Math.random() * 10 + this.x,
              this.y,
              exhaustProperties,
              this.angle
            )
          );
        }
      } else {
        this.drawLine();
      }
    };
    this.drawLine = function () {
      this.path.push([this.x + this.age * 5, this.y]);
      ctx = gameArea.context;
      for (var i = 1; i < this.path.length; i++) {
        ctx.beginPath();
        ctx.moveTo(this.path[i - 1][0] - this.age * 5, this.path[i - 1][1]);
        ctx.lineTo(this.path[i][0] - this.age * 5, this.path[i][1]);
        lineVar = (i - (this.path.length - 30)) / 5;
        ctx.lineWidth = lineVar;
        if (lineVar > 0) {
          ctx.strokeStyle =
            "rgb(200, " +
            (200 - 15 * (i - (this.path.length - 8))) +
            ", " +
            (200 - 50 * (i - (this.path.length - 8))) +
            ")";
          ctx.globalAlpha = clamp((i - (this.path.length - 15)) / 10, 0, 0.9);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    };
  }
  //  playerMissile extends component. This constructs a missile object.
  //  ----- external methods:
  //  newPos()        - update position
  //  update()        - controller that prepares for next frame and draws object
  //  drawBox()       - draw bounding box
  //  drawSprite()    - draw sprite
  //  render()        - draw according to config rule
  //  --------------------------------------------------------------------------------

  function exhaust(x, y, params, angle) {
    //run component()'s initialization logic - exhaust extends component
    component.call(this, x, y, params);

    this.radius = params.radius;
    this.angle = Math.random() * 0.25 + angle - Math.PI;
    this.acceleration = params.acceleration;
    this.thrust = Math.random() * 1 + 2;
    this.velocityX;
    this.velocityY;
    this.lifetime = Math.random() * 50 + 10;
    //
    this.fadeEffect = function () {
      this.radius = 8 * (this.age / this.lifetime) + 3;
      if (this.x < 0 || this.age > this.lifetime) {
        this.active = false;
      }
    };
    //update position with respect to angle
    this.newPos = function () {
      this.thrust = this.thrust + this.acceleration;

      this.velocityX = Math.cos(this.angle) * this.thrust;
      this.velocityY = Math.sin(this.angle) * this.thrust;

      this.x += this.velocityX - 4;
      this.y += this.velocityY;
    };
    //run necessary logic to prepare for the next frame
    this.update = function () {
      this.age++;
      this.drawCustom();
      this.fadeEffect();
    };
    //custom draw function that draws a radial gradient with transparency
    //proportional to the age of the particle
    this.drawCustom = function () {
      ctx = gameArea.context;
      ctx.globalAlpha = 1 - this.age / (this.lifetime + 1);
      gradient = ctx.createRadialGradient(
        this.x,
        this.y,
        this.radius / 2,
        this.x,
        this.y,
        this.radius
      );
      gradient.addColorStop(0, params.color);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.fillRect(
        this.topLeftBoundary().x,
        this.topLeftBoundary().y,
        this.width,
        this.height
      );
      ctx.globalAlpha = 1.0;
    };
  }
  //  exhaust extends component. This constructs an exhaust object.
  //  ----- external methods:
  //  newPos()        - update position
  //  update()        - controller that prepares for next frame and draws object
  //  NB this object assumes control of its own rendering, no draw or render calls necessary
  //  --------------------------------------------------------------------------------

  function enemyBasic(x, y, params, speed) {
    //run component()'s initialization logic - enemyBasic extends component
    component.call(this, x, y, params);

    this.image = assetPool.enemyBasicImg;

    this.speed = speed;
    this.locked = false;
    this.tracked = false;

    //run necessary logic to prepare for the next frame
    this.update = function () {
      //sprite animation loop
      if (this.index <= 117) {
        this.index++;
      } else {
        this.index = 0;
      }
      //if object leaves left side of gameArea then self-destruct
      if (this.x <= -100) {
        this.active = false;
      }
      //if touched by cursor whilst not locked, set self to locked
      if (cursor.hoverEnemy === this && !this.locked) {
        if (gameArea.mouseDown) {
          this.locked = true;
          playerShip.targetsLocked.push(this);
          //create new crosshair over this enemyBasic with a set size
          gameArea.crosshairs.push(
            new crosshair(this.x, this.y, crosshairProperties, this)
          );
        }
      }
    };
    //update position
    this.newPos = function () {
      this.x += this.speed;
    };
  }
  //  enemyBasic extends component. This object is the most basic enemy.
  //  ----- external methods:
  //  newPos()        - update position
  //  update()        - controller that prepares for next frame and draws object
  //  drawBox()       - draw bounding box
  //  drawSprite()    - draw sprite
  //  render()        - draw according to config rule
  //  --------------------------------------------------------------------------------

  function explosion(x, y, params) {
    //run component()'s initialization logic - explosion extends component
    component.call(this, x, y, params);

    this.image = assetPool.explosionImg;

    //run necessary logic to prepare for the next frame
    this.update = function () {
      this.age++;
      this.index = this.age * 2;
      if (this.index > 25) {
        this.active = false;
      }
    };
  }
  //  explosion extends component. This creates an explosion effect object.
  //  ----- external methods:
  //  update()        - controller that prepares for next frame and draws object
  //  drawBox()       - draw bounding box
  //  drawSprite()    - draw sprite
  //  render()        - draw according to config rule
  //  --------------------------------------------------------------------------------

  function explodyBit(x, y, params) {
    //run component()'s initialization logic - explodyBit extends component
    component.call(this, x, y, params);

    this.width = Math.random() * 4;
    this.height = Math.random() * 4;

    this.acceleration = params.acceleration;
    this.vSpeed = params.vSpeed;
    this.velocityX;
    this.velocityY;
    this.thrust = Math.random() * 3 + 5;
    this.angle = Math.random() * 360 - 180;
    //update position with respect to gravity
    this.newPos = function () {
      this.thrust = clamp(this.thrust + this.acceleration, 2, 100);

      this.velocityX = Math.cos(this.angle) * this.thrust;
      this.velocityY = Math.sin(this.angle) * this.thrust;

      this.vSpeed += 0.3;

      this.x += this.velocityX;
      this.y += this.velocityY + this.vSpeed;
    };
    //run necessary logic to prepare for the next frame
    this.update = function () {
      this.age++;
      this.drawBox();
      if (this.age > 150) {
        this.active = false;
      }
    };
  }
  //  explodyBit extends component. This creates a shrapnel object.
  //  ----- external methods:
  //  newPos()        - update position
  //  update()        - controller that prepares for next frame and draws object
  //  NB this object assumes control of its own rendering, no draw or render calls necessary
  //  --------------------------------------------------------------------------------

  function cursor(x, y, params) {
    //run component()'s initialization logic - cursor extends component
    component.call(this, x, y, params);

    this.image = assetPool.cursorImg;

    this.visible = true;
    this.hoverEnemy = false;

    //update position with respect to user input
    this.newPos = function () {
      this.x = gameArea.mouseX;
      this.y = gameArea.mouseY;
    };
    this.update = function () {
      if (gameArea.mouseDown) {
        //sprite animation increments to maximum and holds if mouseDown
        if (this.index < 10) {
          this.index += 2;
        } else {
          this.index = 10;
        }
      } else if (this.index > 0) {
        //else decrements to minimum and holds if !mouseDown
        this.index -= 2;
      } else {
        this.index = 0;
      }

      if (this.visible) {
        this.width = params.widthMouse;
        this.height = params.heightMouse;
        this.drawSprite();
      } else {
        this.width = params.widthTouch;
        this.height = params.heightTouch;
      }
    };
  }
  //  cursor extends component. This constructs the cursor object.
  //  external methods:
  //  newPos()        - update position
  //  update()        - controller that prepares for next frame and draws object
  //  drawBox()       - draw bounding box
  //  render()        - draw according to config rule
  //  NB this object assumes control of its own sprite drawing, no drawSprite() call necessary
  //  --------------------------------------------------------------------------------

  function crosshair(x, y, params, parent) {
    //run component()'s initialization logic - cursor extends component
    component.call(this, x, y, params);

    //the size to shrink to
    this.minSize = params.minSize;

    //object this crosshair is slaved to
    this.parent = parent;

    //toggle the box color at a regular interval if at min size
    this.flashLockBox = function () {
      this.angle = 0;
      if (this.age % 4 === 0 && this.width <= this.minSize) {
        if (this.color === "red") {
          this.color = "transparent";
        } else {
          this.color = "red";
        }
      }
    };
    //update position based on parent
    this.newPos = function () {
      this.x = this.parent.x;
      this.y = this.parent.y;
    };
    //custom draw function using stroke. Prototype uses rect
    this.drawCustom = function () {
      ctx = gameArea.context;
      ctx.save();
      ctx.translate(this.parent.x, this.parent.y);
      ctx.rotate(this.angle);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(
        0 - this.width / 2,
        0 - this.width / 2,
        this.width,
        this.height
      );
      ctx.restore();
    };
    this.update = function () {
      this.age++;

      if ((this.width > this.minSize) & (this.age > 5)) {
        //if crosshair has existed for a set time and is above a set size, begin shrinking
        this.width -= 10;
        this.height -= 10;
      }
      if (!this.parent.tracked) {
        //if not tracked by missile, rotate red
        this.color = "#005500";
        this.angle -= 0.1;
      } else {
        this.flashLockBox();
      }
      //custom draw function uses stroke
      this.drawCustom();
      //existence is tied to the parent
      if (!this.parent.active) {
        this.active = false;
      }
    };
  }
  //  crosshair extends component. This constructs crosshair objects.
  //  external methods:
  //  newPos()        - update position
  //  update()        - controller that prepares for next frame and draws object
  //  drawBox()       - draw bounding box
  //  NB this object assumes control of its own canvas based drawing, no draw calls necessary
  //  --------------------------------------------------------------------------------

  //  UTILITY FUNCTIONS  =============================================================

  function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  }
  //  this function clamps the first argument using the second and third arguments as
  //  minimum and maximum values respectively
  //  --------------------------------------------------------------------------------

  function collision(a, b) {
    return (
      a.topLeftBoundary().x < b.topLeftBoundary().x + b.width &&
      a.topLeftBoundary().x + a.width > b.topLeftBoundary().x &&
      a.topLeftBoundary().y < b.topLeftBoundary().y + b.height &&
      a.topLeftBoundary().y + a.height > b.topLeftBoundary().y
    );
  }
  //  this function checks the positions and dimensions of two objects for overlap
  //  --------------------------------------------------------------------------------

  function collisionHandler() {
    cursor.hoverEnemy = null;
    //consequences of enemyBasics colliding with other objects
    $(gameArea.enemies).each(function () {
      enemy = this;
      //with playerShip
      if (collision(playerShip, enemy)) {
        gameArea.score = "FAILED AT " + gameArea.score + " - CLICK TO RESTART";
        gameArea.stop();
      }
      //with cursor
      if (collision(cursor, enemy)) {
        cursor.hoverEnemy = enemy;
      }
    });
    //consequences of playerMissiles colliding with their targets
    $(gameArea.playerMissiles).each(function () {
      if (collision(this.target, this)) {
        gameArea.score += 10;
        this.target.active = false;
        this.active = false;
        if (settings.generateShrapnel) {
          for (var i = 0; i < settings.shrapnelFactor; i++) {
            gameArea.explodyBits.push(
              new explodyBit(this.x, this.y, explodyBitProperties)
            );
          }
        }
        if (settings.generateExplosions) {
          gameArea.explosions.push(
            new explosion(this.target.x, this.target.y, explosionProperties)
          );
        }
      }
    });
  }
  // this function describes the events to be carried out in the case of a collision between
  // various objects
  //  --------------------------------------------------------------------------------

  //  THE LOOP #######################################################################

  function updateGameArea() {
    gameArea.clear();
    gameArea.frameNo++;

    //BACKGROUND ===============================================================
    if (settings.drawBg) {
      gameArea.background();
    }

    //EXHAUST SMOKE ============================================================
    //filter exhaust
    if (settings.generateSmoke) {
      gameArea.exhausts = gameArea.exhausts.filter(function (exhaust) {
        return exhaust.active;
      });
      //update exhaust
      $(gameArea.exhausts).each(function () {
        this.newPos();
        this.update();
      });
    }

    //PLAYERMISSILES ===========================================================
    //filter missiles
    gameArea.playerMissiles = gameArea.playerMissiles.filter(function (
      playerMissile
    ) {
      return playerMissile.active;
    });
    //update and render missiles
    $(gameArea.playerMissiles).each(function () {
      this.newPos();
      this.update();
      this.render();
    });

    //ENEMIES ==================================================================
    //filter enemies
    gameArea.enemies = gameArea.enemies.filter(function (enemyBasic) {
      return enemyBasic.active;
    });
    //spawn enemies
    if (Math.random() * 1000 > 990 - gameArea.frameNo / 100) {
      gameArea.enemies.push(
        new enemyBasic(
          490,
          Math.random() * (settings.canvasHeight - 50) + 25,
          enemyBasicProperties,
          Math.random() * -1.5 - 1
        )
      );
    }
    //update and render enemies
    $(gameArea.enemies).each(function () {
      this.newPos();
      this.update();
      this.render();
    });

    //EXPLOSIONS ===============================================================
    //filter explosions
    gameArea.explosions = gameArea.explosions.filter(function (explosion) {
      return explosion.active;
    });
    //update and render explosions
    $(gameArea.explosions).each(function () {
      this.update();
      this.render();
    });

    //EXPLODY BITS =============================================================
    //filter bits
    gameArea.explodyBits = gameArea.explodyBits.filter(function (explodyBit) {
      return explodyBit.active;
    });
    //update bits
    $(gameArea.explodyBits).each(function () {
      this.newPos();
      this.update();
    });

    //PLAYER SHIP ==============================================================
    playerShip.update();
    playerShip.newPos(gameArea.mouseY);
    playerShip.render();

    //CROSSHAIRS ===============================================================
    //filter crosshairs
    gameArea.crosshairs = gameArea.crosshairs.filter(function (crosshair) {
      return crosshair.active;
    });
    //update crosshairs (they are self rendering)
    $(gameArea.crosshairs).each(function () {
      this.newPos();
      this.update();
    });

    //CURSOR ===================================================================
    cursor.update();
    cursor.newPos();

    //Utilities ================================================================
    collisionHandler();
    gameArea.updateScore();
  }
  //  --------------------------------------------------------------------------------
})();
