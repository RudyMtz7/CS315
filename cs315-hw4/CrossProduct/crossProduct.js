"use strict";
var gui, params;
var canvasHeight, canvasWidth;
var renderer, scene, camera, cameraControls;
var INTERSECTED, SELECTED;

var redCone, redConeLabel, redConeObj;
var blueCone, blueConeLabel, blueConeObj;
var purpleCone, purpleConeLabel, purpleConeObj;

var redLine, redLineGeom;
var blueLine, blueLineGeom;
var purpleLine, purpleLineGeom;
var lineMat, grayBall, grayBallLabel;

var SPHERE_SIZE = 200;
var objects = [];

var offset = new THREE.Vector3();
var crossProduct = new THREE.Vector3;
var vRed = new THREE.Vector3();
var vBlue = new THREE.Vector3();
var u = new THREE.Vector3();
var v = new THREE.Vector3();
var intersection = new THREE.Vector3();

var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
var projector = new THREE.Projector();
var plane = new THREE.Plane();
var clock = new THREE.Clock();

function fillScene() {
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        redLength: 0.1,
        blueLength: 0.1,
        display: 200,
        magnitude: 0.1,
        handed: "right"
    };
    gui.add(params, "redLength").name("Red Length:").listen();
    gui.add(params, "blueLength").name("Blue Length:").listen();
    gui.add(params, "magnitude").name("CP Magnitude:").listen();
    var controller1 = gui.add(params, "display").name("CP Display:").min(50).max(300);
    var controller2 = gui.add(params, "handed", ["right", "left"]).name("Handedness:");
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "-400px";
    gui.domElement.style.left = "350px";
    controller1.onChange(function (value) {
        updateObjects();
    });
    controller2.onChange(function (value) {
        updateObjects();
    });
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
    var axes = new THREE.AxisHelper(150);
    axes.scale.set(1, 1, 1);
    scene.add(axes);
    drawVectors();
}

function drawVectors() {
    grayBall = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({
            color: 0xdddddd
        }));
    grayBall.position.x = -300;
    scene.add(grayBall);
    redCone = new THREE.Mesh(new THREE.ConeGeometry(50, 100, 32),
        new THREE.MeshLambertMaterial({color: 0xff0000}));
    redCone.rotateX(-Math.PI / 2);
    redConeObj = new THREE.Object3D();
    redConeObj.add(redCone);
    redConeObj.position.x = 300;
    redConeObj.position.y = 300;
    redConeObj.position.z = -20;
    scene.add(redConeObj);
    redCone.userData.parent = redConeObj;
    lineMat = new THREE.LineBasicMaterial({
        color: 0xff0000
    });
    redLineGeom = new THREE.Geometry();
    redLineGeom.vertices.push(
        grayBall.position,
        redConeObj.position
    );
    redLine = new THREE.Line(redLineGeom, lineMat);
    scene.add(redLine);
    blueCone = new THREE.Mesh(new THREE.ConeGeometry(50, 100, 32),
        new THREE.MeshLambertMaterial({color: 0x0000ff}));
    blueCone.rotateX(-Math.PI / 2);
    blueConeObj = new THREE.Object3D();
    blueConeObj.add(blueCone);
    blueConeObj.position.x = 300;
    blueConeObj.position.y = -300;
    blueConeObj.position.z = 20;
    scene.add(blueConeObj);
    blueCone.userData.parent = blueConeObj;
    lineMat = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });
    blueLineGeom = new THREE.Geometry();
    blueLineGeom.vertices.push(
        grayBall.position,
        blueConeObj.position
    );
    blueLine = new THREE.Line(blueLineGeom, lineMat);
    scene.add(blueLine);
    purpleCone = new THREE.Mesh(new THREE.ConeGeometry(50, 100, 32),
        new THREE.MeshLambertMaterial({color: 0xff00ff}));
    purpleCone.rotateX(-Math.PI / 2);
    purpleConeObj = new THREE.Object3D();
    purpleConeObj.add(purpleCone);
    scene.add(purpleConeObj);
    purpleCone.userData.parent = purpleConeObj;
    lineMat = new THREE.LineBasicMaterial({
        color: 0xff00ff
    });
    purpleLineGeom = new THREE.Geometry();
    purpleLineGeom.vertices.push(
        grayBall.position,
        purpleConeObj.position
    );
    purpleLine = new THREE.Line(purpleLineGeom, lineMat);
    scene.add(purpleLine);
    objects = [grayBall, redCone, blueCone];
    updateObjects();
}

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
    camera.position.set(-600, 450, -550);
    cameraControls.target.set(4, 0, 92);
    redConeLabel = document.createElement("div");
    redConeLabel.style.position = "absolute";
    redConeLabel.style["pointer-events"] = "none";
    redConeLabel.style.width = 100;
    redConeLabel.style.height = 50;
    blueConeLabel = document.createElement("div");
    blueConeLabel.style.position = "absolute";
    blueConeLabel.style["pointer-events"] = "none";
    blueConeLabel.style.width = 100;
    blueConeLabel.style.height = 50;
    purpleConeLabel = document.createElement("div");
    purpleConeLabel.style.position = "absolute";
    purpleConeLabel.style["pointer-events"] = "none";
    purpleConeLabel.style.width = 100;
    purpleConeLabel.style.height = 50;
    grayBallLabel = document.createElement("div");
    grayBallLabel.style.position = "absolute";
    grayBallLabel.style["pointer-events"] = "none";
    grayBallLabel.style.width = 100;
    grayBallLabel.style.height = 50;
}

function updateObjects() {
    calculateCrossProduct();
    redConeObj.lookAt(grayBall.position);
    blueConeObj.lookAt(grayBall.position);
    purpleConeObj.lookAt(grayBall.position);
    redLineGeom.vertices = [grayBall.position, redConeObj.position];
    redLineGeom.verticesNeedUpdate = true;
    blueLineGeom.vertices = [grayBall.position, blueConeObj.position];
    blueLineGeom.verticesNeedUpdate = true;
    purpleLineGeom.vertices = [grayBall.position, purpleConeObj.position];
    purpleLineGeom.verticesNeedUpdate = true;
}

function calculateCrossProduct() {
    // BEGIN CHANGES
    function dotProduct(a, b) {
        return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
    }

    function crossProduct(a, b) {
        var cross = {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
        cross.mag = Math.sqrt(dotProduct(cross, cross));
        cross.x = cross.x / cross.mag;
        cross.y = cross.y / cross.mag;
        cross.z = cross.z / cross.mag;
        return cross;
    }

    var redVector = {
        x: redConeObj.position.x - grayBall.position.x,
        y: redConeObj.position.y - grayBall.position.y,
        z: redConeObj.position.z - grayBall.position.z
    };
    var blueVector = {
        x: blueConeObj.position.x - grayBall.position.x,
        y: blueConeObj.position.y - grayBall.position.y,
        z: blueConeObj.position.z - grayBall.position.z
    };
    var redLength = Math.sqrt(dotProduct(redVector, redVector));
    var blueLength = Math.sqrt(dotProduct(blueVector, blueVector));
    params.redLength = redLength;
    params.blueLength = blueLength;

    if (params.handed === "right") {
        var redCrossBlue = crossProduct(redVector, blueVector);
        params.magnitude = redCrossBlue.mag;
        purpleConeObj.position.x = grayBall.position.x + (params.display * redCrossBlue.x);
        purpleConeObj.position.y = grayBall.position.y + (params.display * redCrossBlue.y);
        purpleConeObj.position.z = grayBall.position.z + (params.display * redCrossBlue.z);
    } else if (params.handed === "left") {
        var blueCrossRed = crossProduct(blueVector, redVector);
        params.magnitude = blueCrossRed.mag;
        purpleConeObj.position.x = grayBall.position.x + (params.display * blueCrossRed.x);
        purpleConeObj.position.y = grayBall.position.y + (params.display * blueCrossRed.y);
        purpleConeObj.position.z = grayBall.position.z + (params.display * blueCrossRed.z);
    }
    purpleLineGeom.vertices = [grayBall.position, purpleConeObj.position];
    purpleLineGeom.verticesNeedUpdate = true;
    // END CHANGES
}

function addToDOM() {
    var canvas = document.getElementById("canvas");
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    camera.updateMatrixWorld();
    redConeLabel.style.top = (toXYCoords(redConeObj.position).y + $("#canvas").offset().top + 10) + "px";
    redConeLabel.style.left = (toXYCoords(redConeObj.position).x + $("#canvas").offset().left + 10) + "px";
    redConeLabel.innerHTML =
        Math.round(redConeObj.position.x) + ", " +
        Math.round(redConeObj.position.y) + ", " +
        Math.round(redConeObj.position.z);
    document.body.appendChild(redConeLabel);
    blueConeLabel.style.top = (toXYCoords(blueConeObj.position).y + $("#canvas").offset().top + 10) + "px";
    blueConeLabel.style.left = (toXYCoords(blueConeObj.position).x + $("#canvas").offset().left + 10) + "px";
    blueConeLabel.innerHTML =
        Math.round(blueConeObj.position.x) + ", " +
        Math.round(blueConeObj.position.y) + ", " +
        Math.round(blueConeObj.position.z);
    document.body.appendChild(blueConeLabel);
    grayBallLabel.style.top = (toXYCoords(grayBall.position).y + $("#canvas").offset().top + 10) + "px";
    grayBallLabel.style.left = (toXYCoords(grayBall.position).x + $("#canvas").offset().left + 10) + "px";
    grayBallLabel.innerHTML =
        Math.round(grayBall.position.x) + ", " +
        Math.round(grayBall.position.y) + ", " +
        Math.round(grayBall.position.z);
    document.body.appendChild(grayBallLabel);
    renderer.render(scene, camera);
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
            SELECTED.position.x = Math.round(SELECTED.position.x);
            SELECTED.position.y = Math.round(SELECTED.position.y);
            SELECTED.position.z = Math.round(SELECTED.position.z);
            updateObjects();
        }
        return;
    }
    var intersects = raycaster.intersectObjects(objects);
    if (intersects.length > 0) {
        if (INTERSECTED !== intersects[0].object) {
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
        SELECTED = intersects[0].object.userData.parent || intersects[0].object;
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
