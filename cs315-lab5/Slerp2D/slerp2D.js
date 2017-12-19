"use strict";
var camera, renderer, gui;
var objects;
var params;
var clock = new THREE.Clock();
var scene = new THREE.Scene();
var intersection = new THREE.Vector3(),
    mouse = new THREE.Vector2(),
    canvasWidth, canvasHeight, INTERSECTED, SELECTED;
var plane = new THREE.Plane(),
    offset = new THREE.Vector3();
var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();
var blueBall, redBall, middleBall;

function fillScene() {
    scene.fog = new THREE.Fog(0x808080, 2000, 4000);
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        t: 0.5,
    };
    gui.add(params, 't').min(0.0).max(1.0).step(0.1).name('Red To Blue');
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
    drawCircle();
}

function drawCircle() {
    var geometry = new THREE.CircleGeometry(150, 32);
    var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    var circle = new THREE.Mesh(geometry, material);
    circle.position.z = -50;
    scene.add(circle);
    redBall = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 12),
        new THREE.MeshLambertMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.7
        }));
    scene.add(redBall);
    redBall.position.x = 150;
    blueBall = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 12),
        new THREE.MeshLambertMaterial({
            color: 0x0000ff,
            transparent: true,
            opacity: 0.7
        }));
    scene.add(blueBall);
    blueBall.position.y = 150;
    middleBall = new THREE.Mesh(new THREE.SphereGeometry(10, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0xffff00 }));
    scene.add(middleBall);
    objects = [blueBall, redBall];
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
    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
    camera = new THREE.OrthographicCamera(canvasWidth / -2, canvasWidth / 2, canvasHeight / 2, canvasHeight / -2, 1, 1000);
    camera.position.set(0, 20, 100);
    camera.lookAt(new THREE.Vector3(0, 20, 0));
    scene.add(camera);
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function calculateInterpolation() {
    // BEGIN CHANGES
    var left = blueBall.position.clone();
    var right = redBall.position.clone();
    var omega = left.angleTo(right);
    var kOne = Math.sin(params.t * omega);
    var kNot = Math.sin((1 - params.t) * omega);
    var yellowBall = (left.multiplyScalar(kOne)).add(right.multiplyScalar(kNot)).divideScalar(Math.sin(omega));
    middleBall.position.x = yellowBall.x;
    middleBall.position.y = yellowBall.y;
    // END CHANGES
}

function animate() {
    calculateInterpolation();
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    var delta = clock.getDelta();
    renderer.render(scene, camera);
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.set(
        ((event.clientX / window.innerWidth) * 2 - 1) *
        (window.innerWidth / canvasWidth),
        (-((event.clientY - ($("#canvas").position().top + (canvasHeight / 2))) / window.innerHeight) * 2) *
        (window.innerHeight / canvasHeight));
    raycaster.setFromCamera(mouse, camera);
    if (SELECTED) {
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            SELECTED.position.copy(intersection.sub(offset).clone().normalize().multiplyScalar(150));
        }
        return;
    }
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            INTERSECTED = intersects[0].object;
            plane.setFromNormalAndCoplanarPoint(
                camera.getWorldDirection(plane.normal),
                INTERSECTED.position);
        }
        canvas.style.cursor = 'pointer';
    } else {
        INTERSECTED = null;
        canvas.style.cursor = 'auto';
    }
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        SELECTED = intersects[0].object;
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            offset.copy(intersection).sub(SELECTED.position);
        }
        canvas.style.cursor = 'move';
    }
}

function onDocumentMouseUp(event) {
    event.preventDefault();
    if (INTERSECTED) {
        SELECTED = null;
    }
    canvas.style.cursor = 'auto';
}
try {
    init();
    fillScene();
    addToDOM();
} catch (error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
