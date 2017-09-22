"use strict";
var scene, renderer;
var camera, cameraControls;
var canvasWidth, canvasHeight;
var line, lineGeom, lineMat;
var redBall, blueBall, yellowBall;
var redBalllabel, blueBalllabel;
var gui, params;
var INTERSECTED;
var SELECTED;
var reflectionCube;
var objects = [];
var SPHERE_SIZE = 200;
var redToGreenRay = new THREE.Vector3;
var plane = new THREE.Plane();
var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();
var intersection = new THREE.Vector3();
var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();

function init() {
    canvasWidth = 600;
    canvasHeight = 400;
    var canvasRatio = canvasWidth / canvasHeight;
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);
    renderer.domElement.addEventListener("mousemove", onDocumentMouseMove, false);
    renderer.domElement.addEventListener("mousedown", onDocumentMouseDown, false);
    renderer.domElement.addEventListener("mouseup", onDocumentMouseUp, false);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 4000);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(-800, 600, -500);
    cameraControls.target.set(4, 0, 92);
    redBalllabel = document.createElement("div");
    redBalllabel.style.position = "absolute";
    redBalllabel.style["pointer-events"] = "none";
    redBalllabel.style.width = 100;
    redBalllabel.style.height = 50;
    blueBalllabel = document.createElement("div");
    blueBalllabel.style.position = "absolute";
    blueBalllabel.style["pointer-events"] = "none";
    blueBalllabel.style.width = 100;
    blueBalllabel.style.height = 50;
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.set(
        (( event.clientX / window.innerWidth ) * 2 - 1) *
        (window.innerWidth / canvasWidth),
        (-((event.clientY - ($("#canvas").position().top + (canvasHeight / 2))) / window.innerHeight) * 2 )
        * (window.innerHeight / canvasHeight));
    raycaster.setFromCamera(mouse, camera);
    if (SELECTED) {
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            SELECTED.position.copy(intersection.sub(offset));
            lineGeom.vertices = [redBall.position, blueBall.position];
            lineGeom.verticesNeedUpdate = true;
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
        canvas.style.cursor = "pointer";
    } else {
        INTERSECTED = null;
        canvas.style.cursor = "auto";
    }
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        cameraControls.enabled = false;
        SELECTED = intersects[0].object;
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            offset.copy(intersection).sub(SELECTED.position);
        }
        canvas.style.cursor = "move";
    }
}

function onDocumentMouseUp(event) {
    event.preventDefault();
    cameraControls.enabled = true;
    if (INTERSECTED) {
        SELECTED = null;
    }
    canvas.style.cursor = "auto";
}

function fillScene() {
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        t: 0.5
    };
    gui.add(params, "t").min(0.0).max(1.0).step(0.1).name("Interpolation");
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "-400px";
    gui.domElement.style.left = "350px";
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x808080, 2000, 4000);
    scene.add(new THREE.AmbientLight(0x222222));
    var light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(-200, 500, 500);
    scene.add(light);
    light = new THREE.DirectionalLight(0xffffff, 0.6);
    light.position.set(100, 100, -400);
    scene.add(light);
    var gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
    scene.add(gridXZ);
    drawLinearInterpolation();
}

function drawLinearInterpolation() {
    redBall = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.7
        }));
    redBall.position.x = 0;
    redBall.position.y = 0;
    redBall.position.z = -300;
    scene.add(redBall);
    blueBall = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({
            color: 0x0000ff,
            transparent: true,
            opacity: 0.7
        }));
    blueBall.position.x = 0;
    blueBall.position.y = 0;
    blueBall.position.z = 300;
    scene.add(blueBall);
    yellowBall = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 12),
        new THREE.MeshLambertMaterial({color: 0xffff00}));
    scene.add(yellowBall);
    lineMat = new THREE.LineBasicMaterial({
        color: 0x000000
    });
    lineGeom = new THREE.Geometry();
    lineGeom.vertices.push(
        redBall.position,
        blueBall.position
    );
    line = new THREE.Line(lineGeom, lineMat);
    scene.add(line);
    objects = [redBall, blueBall];
}

function addToDOM() {
    var canvas = document.getElementById("canvas");
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
    positionYellowBall();
    window.requestAnimationFrame(animate);
    render();
}

function positionYellowBall() {
    // BEGIN CHANGES
    yellowBall.position.x = params.t * blueBall.position.x + (1 - params.t) * redBall.position.x;
    yellowBall.position.y = params.t * blueBall.position.y + (1 - params.t) * redBall.position.y;
    yellowBall.position.z = params.t * blueBall.position.z + (1 - params.t) * redBall.position.z;
    // END CHANGES
}

function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    camera.updateMatrixWorld();
    redBalllabel.style.top = (toXYCoords(redBall.position).y + $("#canvas").offset().top + 10) + "px";
    redBalllabel.style.left = (toXYCoords(redBall.position).x + $("#canvas").offset().left + 10) + "px";
    redBalllabel.innerHTML =
        Math.round(redBall.position.x) + ", " +
        Math.round(redBall.position.y) + ", " +
        Math.round(redBall.position.z);
    document.body.appendChild(redBalllabel);
    blueBalllabel.style.top = (toXYCoords(blueBall.position).y + $("#canvas").offset().top + 10) + "px";
    blueBalllabel.style.left = (toXYCoords(blueBall.position).x + $("#canvas").offset().left + 10) + "px";
    blueBalllabel.innerHTML =
        Math.round(blueBall.position.x) + ", " +
        Math.round(blueBall.position.y) + ", " +
        Math.round(blueBall.position.z);
    document.body.appendChild(blueBalllabel);
    renderer.render(scene, camera);
}

function toXYCoords(pos) {
    var vector = pos.clone().project(camera);
    vector.x = (vector.x + 1) / 2 * canvasWidth;
    vector.y = -(vector.y - 1) / 2 * canvasHeight;
    return vector;
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
