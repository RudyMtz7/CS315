"use strict";

var camera, renderer, gui, objects, canvasWidth, canvasHeight, params;
var yellowBall, blueBall, ball1, ball2, ball3, ball4;
var INTERSECTED, SELECTED;

var clock = new THREE.Clock();
var scene = new THREE.Scene();
var intersection = new THREE.Vector3();
var mouse = new THREE.Vector2();
var plane = new THREE.Plane();
var offset = new THREE.Vector3();
var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();

function fillScene() {
    scene.fog = new THREE.Fog(0x808080, 2000, 4000);
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        yellow: 100,
        blue: -100,
        t: 0.5,
    };
    gui.add(params, 'yellow').min(-150).max(150).step(5).name('Yellow');
    gui.add(params, 'blue').min(-150).max(150).step(5).name('Blue');
    gui.add(params, 't').min(0.0).max(1.0).step(0.01).name('Yellow To Blue');
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "-400px";
    gui.domElement.style.left = "350px";
    scene.add(new THREE.AmbientLight(0x222222));
    var light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(200, 500, 500);
    scene.add(light);
    light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(-200, -100, -400);
    scene.add(light);
    var gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
    scene.add(gridXZ);
    var axes = new THREE.AxisHelper(150);
    axes.scale.set(7, 7, 7);
    scene.add(axes);
    drawSmoothStep();
}

function drawSmoothStep() {
    yellowBall = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 12),
        new THREE.MeshLambertMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.7
        }));
    scene.add(yellowBall);
    yellowBall.position.x = -250;
    yellowBall.position.y = params.yellow;
    blueBall = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 12),
        new THREE.MeshLambertMaterial({
            color: 0x0000ff,
            transparent: true,
            opacity: 0.7
        }));
    scene.add(blueBall);
    blueBall.position.x = 250;
    blueBall.position.y = params.blue
    // This ball should move according to the least smooth interpolation (linear)
    ball1 = new THREE.Mesh(new THREE.SphereGeometry(10, 12, 12), new THREE.MeshLambertMaterial({ color: 0x006600 }));
    scene.add(ball1);
    // This ball should move according to the smoother interpolation
    ball2 = new THREE.Mesh(new THREE.SphereGeometry(10, 12, 12), new THREE.MeshLambertMaterial({ color: 0x339933 }));
    scene.add(ball2);
    // This ball should move according to the second smoothest interpolation (slightly smoother than ball 2)
    ball3 = new THREE.Mesh(new THREE.SphereGeometry(10, 12, 12), new THREE.MeshLambertMaterial({ color: 0x66cc66 }));
    scene.add(ball3);
    // This ball should move according to the smoothest interpolation
    ball4 = new THREE.Mesh(new THREE.SphereGeometry(10, 12, 12), new THREE.MeshLambertMaterial({ color: 0x99ff99 }));
    scene.add(ball4);
    animate();
}

function init() {
    canvasWidth = 600;
    canvasHeight = 400;
    var canvasRatio = canvasWidth / canvasHeight;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);
    camera = new THREE.OrthographicCamera(canvasWidth / -2, canvasWidth / 2, canvasHeight / 2, canvasHeight / -2, 1, 1000);
    camera.position.set(0, 0, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function calculateSmoothStep() {
    /*
    TODO:
    Set the four green(ish) balls locations based upon the three different interpolation
    functions: linear interpolation, cubic Hermite smoothstep interpolation, cosine
    interpolation, and Ken Perlin's smoothing interpolation.
    The cubic Hermite smoothstep function is described from 3D Math Primer,
    pages 665-670. Cosine interpolation and Ken Perlin's smoothing function is described
    on the assignment web page.
    The greenest ball should be the least smooth (also the least varied in speed from
    end to end). The whitest ball should be the most smooth (also the one that speeds
    up most in the middle and slows down most at the ends). So, the lighter the ball,
    the smoother the interpolation.
    */
    // BEGIN CHANGES
    ball1.position.addVectors(
        yellowBall.position.clone().multiplyScalar(1 - params.t),
        blueBall.position.clone().multiplyScalar(params.t)
    );
    var hermiteThing = 3 * params.t ** 2 - 2 * params.t ** 3;
    ball2.position.addVectors(
        yellowBall.position.clone().multiplyScalar(1 - hermiteThing),
        blueBall.position.clone().multiplyScalar(hermiteThing)
    );
    var cosThing = (1 - Math.cos(Math.PI * params.t)) / 2
    ball3.position.addVectors(
        yellowBall.position.clone().multiplyScalar(1 - cosThing),
        blueBall.position.clone().multiplyScalar(cosThing)
    );
    var perlinThing = 6 * params.t ** 5 - 15 * params.t ** 4 + 10 * params.t ** 3;
    ball4.position.addVectors(
        yellowBall.position.clone().multiplyScalar(1 - perlinThing),
        blueBall.position.clone().multiplyScalar(perlinThing)
    );
    // END CHANGES
}

function animate() {
    yellowBall.position.y = params.yellow;
    blueBall.position.y = params.blue;
    calculateSmoothStep();
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    var delta = clock.getDelta();
    renderer.render(scene, camera);
}
try {
    init();
    fillScene();
    addToDOM();
} catch (error) {
    console.log("Your program encounteyellow an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
