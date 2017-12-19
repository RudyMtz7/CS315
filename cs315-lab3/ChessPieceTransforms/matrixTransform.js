////////////////////////////////////////////////////////////////////////////////
/*global THREE, document, window  */
var camera, scene, renderer, gui;
var cameraControls;

var clock = new THREE.Clock();

var knight;

// Define the transformation matrices we'll use later
var xTransMatrix = new THREE.Matrix4();
var yTransMatrix = new THREE.Matrix4();
var zTransMatrix = new THREE.Matrix4();

var xRotMatrix = new THREE.Matrix4();
var yRotMatrix = new THREE.Matrix4();
var zRotMatrix = new THREE.Matrix4();

var xScaleMatrix = new THREE.Matrix4();
var yScaleMatrix = new THREE.Matrix4();
var zScaleMatrix = new THREE.Matrix4();

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );
  

// Set up gui sliders
	gui = new dat.GUI({
		autoPlace: false,
    height : (32 * 3)- 1
	});

  params = {
    xtrans: 0,
    ytrans: 0,
    ztrans: 1,
  	xrot: 0,
  	yrot: 0,
  	zrot: 0,
    xscale: 1,
    yscale: 1,
    zscale: 1,
  };
  
  gui.add(params, 'xtrans').min(-50).max(50).step(5).name('X translation');
	gui.add(params, 'ytrans').min(-50).max(50).step(5).name('Y translation');
  gui.add(params, 'ztrans').min(-50).max(50).step(5).name('Z translation');
	gui.add(params, 'xrot').min(0).max(180).step(10).name('X rotation');
	gui.add(params, 'yrot').min(0).max(180).step(10).name('Y rotation');
  gui.add(params, 'zrot').min(0).max(180).step(10).name('Z rotation');
  gui.add(params, 'xscale').min(0.5).max(2).step(0.1).name('X scale');
	gui.add(params, 'yscale').min(0.5).max(2).step(0.1).name('Y scale');
  gui.add(params, 'zscale').min(0.5).max(2).step(0.1).name('Z scale');

	gui.domElement.style.position = "relative";
	gui.domElement.style.top = "-400px";
	gui.domElement.style.left = "350px";

	// LIGHTS

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set( 200, 500, 500 );

	scene.add( light );

	light = new THREE.DirectionalLight( 0xffffff, 0.9 );
	light.position.set( -200, -100, -400 );

	scene.add( light );

	//grid xz
	var gridXZ = new THREE.GridHelper(2000, 100,  new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
	scene.add(gridXZ);

	//axes
	var axes = new THREE.AxisHelper(150);
  axes.scale.set(7,7,7);
	scene.add(axes);

	drawKnight();
}

function drawKnight() {
  // Set up load manager and load image and obj file. 
	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};
	var onError = function ( xhr ) {
	};

	var knightTex = new THREE.Texture();
  
	var loader = new THREE.ImageLoader( manager );
	loader.load( 'KnightTexture2.png', function ( image ) {
		knightTex.image = image;
		knightTex.needsUpdate = true;
	} );

	loader = new THREE.OBJLoader( manager );
		loader.load( 'chessknightexport.obj', function ( object ) {
			object.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					child.material.map = knightTex;
				}
			} );
      knight = object;
      knight.matrixAutoUpdate = false; // Necessary to set the matrix manually
			scene.add( knight );
		}, onProgress, onError );
}

function init() {
	var canvasWidth = 600;
	var canvasHeight = 400;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( 0xAAAAAA, 1.0 );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 45, canvasRatio, 1, 4000 );
	// CONTROLS
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	camera.position.set( -1200, 1000, 1200);
	cameraControls.target.set(250,-50,250);
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
  if (knight) { // This is to prevent a crash when the obj file is still loading
    knight.matrix.identity();

    // START CHANGES
    // translation along x
    xTransMatrix.set( 
        1, 0, 0, params.xtrans,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1 
       );
    // translation along y
    yTransMatrix.set( 
        1, 0, 0, 0,
        0, 1, 0, params.ytrans,
        0, 0, 1, 0,
        0, 0, 0, 1 
       );
    // translation along z
    zTransMatrix.set( 
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, params.ztrans,
        0, 0, 0, 1 
       );
    // scaling along x
    xScaleMatrix.set( 
        params.xscale, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1 
       );
    // scaling along y
    yScaleMatrix.set( 
        1, 0, 0, 0,
        0, params.yscale, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1 
       );
    // scaling along z
    zScaleMatrix.set( 
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, params.zscale, 0,
        0, 0, 0, 1 
       );
    // rotation around x
    xRotMatrix.set( 
        1, 0, 0, 0,
        0, Math.cos(THREE.Math.degToRad(params.xrot)), -Math.sin(THREE.Math.degToRad(params.xrot)), 0,
        0, Math.sin(THREE.Math.degToRad(params.xrot)), Math.cos(THREE.Math.degToRad(params.xrot)), 0,
        0, 0, 0, 1 
       );
    // rotation around y
    yRotMatrix.set(
        Math.cos(THREE.Math.degToRad(params.yrot)), 0, Math.sin(THREE.Math.degToRad(params.yrot)), 0,
        0, 1, 0, 0,
        -Math.sin(THREE.Math.degToRad(params.yrot)), 0, Math.cos(THREE.Math.degToRad(params.yrot)), 0,
        0, 0, 0, 1 
        );
    // rotation around z
    zRotMatrix.set(
        Math.cos(THREE.Math.degToRad(params.zrot)), -Math.sin(THREE.Math.degToRad(params.zrot)), 0, 0,
        Math.sin(THREE.Math.degToRad(params.zrot)), Math.cos(THREE.Math.degToRad(params.zrot)), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1 
       );
    // END CHANGES
    
    // Multiply all transformation matrices
    knight.matrix.multiply(zTransMatrix).multiply(yTransMatrix).multiply(xTransMatrix)
                  .multiply(zRotMatrix).multiply(yRotMatrix).multiply(xRotMatrix)
                  .multiply(zScaleMatrix).multiply(yScaleMatrix).multiply(xScaleMatrix);
  }
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);
	renderer.render(scene, camera);
}

try {
  init();
  fillScene();
  addToDOM();
  animate();
} catch(error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
