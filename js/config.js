var settings = {
  drawBoundBoxes: false,
  drawSprites: true,
  drawBg: true,
  drawGui: true, //does nothing yet
  generateSmoke: false,
  smokeFactor: 3,
  generateExplosions: true,
  generateShrapnel: true,
  shrapnelFactor: 10,
  interval: 20,
  canvasWidth: 480,
  canvasHeight: 320,
  canvasColor: "white",
};

var playerShipProperties = {
  //state
  active: true,
  age: 0,
  //position
  width: 55,
  height: 28,
  rotate: false,
  angle: null,
  //display
  color: "green",
  image: "./img/ship_sprite_sheet.png",
  offsetX: 0,
  offsetY: 4,
  srcWidth: 100,
  srcHeight: 90,
  index: 15,
  rescaleX: 0.75,
  rescaleY: 0.75,
  //extended properties not in prototype
  acceleration: 35,
  maxSpeed: 130,
};

var playerMissileProperties = {
  //state
  active: true,
  age: 0,
  //position
  width: 33,
  height: 12,
  rotate: true,
  angle: 0,
  //display
  color: "blue",
  image: "./img/missile_sprite_sheet.png",
  offsetX: 15,
  offsetY: 0,
  srcWidth: 50,
  srcHeight: 20,
  index: 0,
  rescaleX: 0.68,
  rescaleY: 0.68,
  //extended properties not in prototype
  acceleration: 0.3,
  thrust: 0,
};

var enemyBasicProperties = {
  //state
  active: true,
  age: 0,
  //position
  width: 30,
  height: 30,
  rotate: false,
  angle: null,
  //display
  color: "red",
  image: "./img/drone_sprite_sheet.png",
  offsetX: 0,
  offsetY: 0,
  srcWidth: 120,
  srcHeight: 120,
  index: 0,
  rescaleX: 0.35,
  rescaleY: 0.35,
};

var cursorProperties = {
  //state
  active: true,
  age: 0,
  //position
  width: null,
  height: null,
  rotate: false,
  angle: null,
  //display
  color: "black",
  image: "./img/cursor_sprite_sheet.png",
  offsetX: 0,
  offsetY: 0,
  srcWidth: 200,
  srcHeight: 200,
  index: 0,
  rescaleX: 0.2,
  rescaleY: 0.2,
  //extended properties not in prototype
  widthMouse: 10,
  heightMouse: 10,
  widthTouch: 40,
  heightTouch: 40,
};

var crosshairProperties = {
  //state
  active: true,
  age: 0,
  //position
  width: 100,
  height: 100,
  rotate: true,
  angle: 0,
  //display
  color: "#005500",
  image: "",
  offsetX: "",
  offsetY: "",
  srcWidth: "",
  srcHeight: "",
  index: "",
  rescaleX: "",
  rescaleY: "",
  //extended properties not in prototype
  minSize: 45,
};

var exhaustProperties = {
  //state
  active: true,
  age: 0,
  //position
  width: 50,
  height: 50,
  rotate: true,
  angle: null,
  //display
  color: "white",
  image: "./img/ship_sprite_sheet.png",
  offsetX: 0,
  offsetY: 0,
  srcWidth: 100,
  srcHeight: 100,
  index: 15,
  rescaleX: 0.75,
  rescaleY: 0.75,
  //extended properties not in prototype
  radius: 0,
  acceleration: -0.1,
};

var explosionProperties = {
  //state
  active: true,
  age: 0,
  //position
  width: 5,
  height: 5,
  rotate: false,
  angle: null,
  //display
  color: "yellow",
  image: "./img/explosion_sprite_sheet.png",
  offsetX: 0,
  offsetY: 0,
  srcWidth: 64,
  srcHeight: 64,
  index: 15,
  rescaleX: 1.2,
  rescaleY: 1.2,
};

var explodyBitProperties = {
  //state
  active: true,
  age: 0,
  //position
  width: 5,
  height: 5,
  rotate: false,
  angle: null,
  //display
  color: "#262626",
  image: "",
  offsetX: 0,
  offsetY: 0,
  srcWidth: "",
  srcHeight: "",
  index: "",
  rescaleX: "",
  rescaleY: "",
  //extended properties not in prototype
  acceleration: -0.3,
  vSpeed: 0,
};
