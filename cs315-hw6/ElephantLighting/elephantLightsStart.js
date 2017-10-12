var camera, scene, renderer;
var cameraControls, controls, gui;

var clock = new THREE.Clock();
var camX, camZ;
var rot = 0;
var camDistance = 1200;

// Lights
var redLight = new THREE.SpotLight(0xff0000);
var greenLight = new THREE.SpotLight(0x00ff00);
var blueLight = new THREE.SpotLight(0x0000ff);

function fillScene() {
    scene = new THREE.Scene();
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 1) - 1
    });
    controls = {
        lightSeparation: 1.0,
        target: 0.0
    };

    gui.add(controls, 'lightSeparation', 0, 1.0);
    gui.add(controls, 'target', 0, 1.0);

    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "-400px";
    gui.domElement.style.left = "350px";


    /*
    TODO: Here's where the light gets set up for the first time.
    You'll need to set up each of your colored lights similarly, to
    replace the current white light.
    */

    redLight.position.set(0, 1500, 800);
    redLight.angle = 25 * Math.PI / 180;
    redLight.penumbra = 0.20;
    redLight.distance = 2500;
    redLight.intensity = 3;
    redLight.castShadow = true;

    redLight.shadow.mapSize.width = 1024;
    redLight.shadow.mapSize.height = 1024;

    redLight.shadow.camera.near = 1;
    redLight.shadow.camera.far = 2000;


    /*
    TODO: Here's where the light gets set up for the first time.
    You'll need to set up each of your colored lights similarly, to
    replace the current white light.
    */

    greenLight.position.set(0, 1500, 800);
    greenLight.angle = 25 * Math.PI / 180;
    greenLight.penumbra = 0.20;
    greenLight.distance = 2500;
    greenLight.intensity = 3;
    greenLight.castShadow = true;

    greenLight.shadow.mapSize.width = 1024;
    greenLight.shadow.mapSize.height = 1024;

    greenLight.shadow.camera.near = 1;
    greenLight.shadow.camera.far = 2000;


    /*
    TODO: Here's where the light gets set up for the first time.
    You'll need to set up each of your colored lights similarly, to
    replace the current white light.
    */

    blueLight.position.set(0, 1500, 800);
    blueLight.angle = 25 * Math.PI / 180;
    blueLight.penumbra = 0.20;
    blueLight.distance = 2500;
    blueLight.intensity = 3;
    blueLight.castShadow = true;

    blueLight.shadow.mapSize.width = 1024;
    blueLight.shadow.mapSize.height = 1024;

    blueLight.shadow.camera.near = 1;
    blueLight.shadow.camera.far = 2000;

    scene.add(redLight);
    scene.add(greenLight);
    scene.add(blueLight);

    scene.add(redLight.target);
    scene.add(greenLight.target);
    scene.add(blueLight.target);

    /*
     * These helpers are useful to see the spotlight and
     * shadow camera's location, angle, and dimensions. Uncomment
     * them to see how they work.
     */

    var helpedLight = redLight;
    var spotLightHelper = new THREE.SpotLightHelper(helpedLight);
    scene.add(spotLightHelper);
    var shadowHelper = new THREE.CameraHelper(helpedLight.shadow.camera);
    scene.add(shadowHelper);

    var gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
    scene.add(gridXZ);

    drawElephant();
}

function drawElephant() {
    var manager = new THREE.LoadingManager();
    manager.onProgress = function(item, loaded, total) {
        console.log(item, loaded, total);
    };

    var onProgress = function(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };
    var onError = function(xhr) {};

    var elephantTex = new THREE.Texture();
    var planeTex = new THREE.Texture();

    var loader = new THREE.ImageLoader(manager);
    loader.load('elephantColor.jpg', function(image) {
        elephantTex.image = image;
        elephantTex.needsUpdate = true;
    });

    loader = new THREE.OBJLoader(manager);
    loader.load('elephantcomplete.obj', function(object) {
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material.map = elephantTex;
                child.castShadow = true;
            }
        });
        object.position.y = 500;
        scene.add(object);
    }, onProgress, onError);

    loader = new THREE.ImageLoader(manager);
    loader.load('tex.jpg', function(image) {
        planeTex.image = image;
        planeTex.needsUpdate = true;
    });

    loader = new THREE.OBJLoader(manager);
    loader.load('plane.obj', function(object) {
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                child.material.map = planeTex;
                child.receiveShadow = true;
            }
        });
        object.position.y = 500;
        scene.add(object);
    }, onProgress, onError);

}

function init() {
    var canvasWidth = 600;
    var canvasHeight = 400;
    var canvasRatio = canvasWidth / canvasHeight;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0x000000);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 10000);
    camera.position.set(-camDistance, 1000, camDistance);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.target.set(0, 480, 0);
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    var delta = clock.getDelta();

    /*
    TODO: You can animate the positioning of your lights here.
    Use the controls.lightSeparation property to make your light positions
    dependent on values from the gui controller. Use controls.target (which
    you also need to create) to change the position of the target up and down
    along the y axis (the target shouldn't move on other dimensions).

    Each light object and target object has a position attribute which can be
    set using the set() method. Use that method to (re) position your lights and
    target on each render call.
    */

    greenLight.target.position.setX(800 * (- controls.lightSeparation));
    redLight.target.position.setX(800 * (controls.lightSeparation));

    redLight.target.position.setY(controls.target * 1200);
    greenLight.target.position.setY(controls.target * 1200);
    blueLight.target.position.setY(controls.target * 1200);

    cameraControls.update(delta);
    renderer.render(scene, camera);
}

try {
    init();
    fillScene();
    addToDOM();
    animate();
} catch (error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
