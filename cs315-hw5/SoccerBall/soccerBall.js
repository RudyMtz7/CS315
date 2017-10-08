"use strict";

var camera, scene, renderer, light, gridXZ, axes, canvasRatio, cameraControls, mouseDown, INTERSECTED, SELECTED;
var objects = [];
var plane = new THREE.Plane();
var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();
var intersection = new THREE.Vector3();
var swipe = new THREE.Vector3();
var swipeStart = new THREE.Vector3();
var swipeEnd = new THREE.Vector3();
var raycaster = new THREE.Raycaster();
var cameraControls;
var canvasWidth = 600;
var canvasHeight = 400;
var canvas = document.getElementById('canvas');
var clock = new THREE.Clock();
var ball = new THREE.Object3D();
var spinSpeed = 0;
var spinAxis = new THREE.Vector3(0, 1, 0);
var spinAngle = 0;
var time = 0;
var swiping = false;

function init() {
    canvasRatio = canvasWidth / canvasHeight;
    addMouseHandler(canvas);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 4000);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(800, 800, -800);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function addMouseHandler(canvas) {
    canvas.addEventListener('mousemove', function(e) {
        onDocumentMouseMove(e);
    }, false);
    canvas.addEventListener('mousedown', function(e) {
        onDocumentMouseDown(e);
    }, false);
    canvas.addEventListener('mouseup', function(e) {
        onDocumentMouseUp(e);
    }, false);
    canvas.addEventListener("mouseout", function(e) {
        e.preventDefault();
        mouseDown = false;
    }, false);
}

function getMousePoint(clientX, clientY) {
    var vector = new THREE.Vector3();
    vector.set((clientX / window.innerWidth) * 2 - 1, -(clientY / window.innerHeight) * 2 + 1, 0.5);
    vector.unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = -camera.position.y / dir.y;
    return camera.position.clone().add(dir.multiplyScalar(distance));
}

function onDocumentMouseMove(event) {
    if (mouseDown) {
        event.preventDefault();
        raycaster.setFromCamera(mouse, camera);
        if (SELECTED) {
            swipeEnd = getMousePoint(event.clientX, event.clientY);
            // BEGIN CHANGES
            swipe = swipeEnd.clone().sub(swipeStart);
            spinAxis = swipe.clone().cross(camera.position.clone()).normalize();
            var elapsedtime = clock.getDelta();
            if (swipe.length() > 20) {
                const speedCoefficient = 1 / 5000;
                spinSpeed = speedCoefficient * swipe.length() / elapsedtime;
            }
            // END CHANGES
        }
    }
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    mouse.set(
        ((event.clientX / window.innerWidth) * 2 - 1) *
        (window.innerWidth / canvasWidth),
        (-((event.clientY - ($("#canvas").position().top + (canvasHeight / 2))) / window.innerHeight) * 2) *
        (window.innerHeight / canvasHeight)
    );
    mouseDown = true
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        cameraControls.enabled = false;
        SELECTED = intersects[0].object;
        canvas.style.cursor = 'move';
        // BEGIN CHANGES
        clock.getElapsedTime();
        // END CHANGES
        swipeStart = getMousePoint(event.clientX, event.clientY);
    } else {
        SELECTED = null;
    }
}

function onDocumentMouseUp(event) {
    event.preventDefault();
    cameraControls.enabled = true;
    if (INTERSECTED) {
        SELECTED = null;
    }
    canvas.style.cursor = 'auto';
    swiping = false;
    mouseDown = false;
}

function fillScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x808080, 2000, 4000);
    scene.add(new THREE.AmbientLight(0x222222));
    light = new THREE.SpotLight(0xffffdd, 0.7);
    light.position.set(0, 600, -200);
    scene.add(light);
    light = new THREE.SpotLight(0xffdddd, 0.5, 0.0, Math.PI / 2, 1.0);
    console.log(light.penumbra);
    light.position.set(100, -300, 500);
    scene.add(light);
    gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
    scene.add(gridXZ);
    axes = new THREE.AxisHelper(150);
    axes.position.y = 1;
    scene.add(axes);
    drawSoccerBall();
}

function drawSoccerBall() {
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
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.load('soccer_ball.mtl', function(materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load('soccer_ball.obj', function(object) {
            ball = object.children[0];
            objects.push(ball);
            scene.add(ball);
        }, onProgress, onError);
    });
}

function addToDOM() {
    canvas.appendChild(renderer.domElement);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    // BEGIN CHANGES
    const deceleration = 0.02;
    const spinFloor = 0.005;
    spinAngle = spinSpeed % (Math.PI * 2);
    spinAngle = spinAngle + spinSpeed;
    if (Math.abs(spinSpeed) < spinFloor) spinSpeed = 0;
    spinSpeed = spinSpeed * (1 - deceleration);
    // END CHANGES
    var quaternion = new THREE.Quaternion().setFromAxisAngle(spinAxis, spinSpeed);
    ball.rotation.setFromQuaternion(quaternion);
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
