"use strict";

var camera, scene, renderer, gui, params, cameraControls, canvasWidth, canvasHeight;
var handle1, handle1Geom, handle2, handle2Geom, handleMat
var v0, v1, v2, v3, v0label, v1label, v2label, v3label;
var t_ball, tlabel, plabel;
var curve, curveGeometry, curveObject;
var INTERSECTED, SELECTED;
var objects = [];
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
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);
    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);
    renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
    renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 4000);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(-800, 600, -500);
    cameraControls.target.set(4, 200, 92);
    v0label = document.createElement('div');
    v0label.style.position = 'absolute';
    v0label.style['pointer-events'] = 'none';
    v0label.style.width = 100;
    v0label.style.height = 50;
    v1label = document.createElement('div');
    v1label.style.position = 'absolute';
    v1label.style['pointer-events'] = 'none';
    v1label.style.width = 100;
    v1label.style.height = 50;
    v2label = document.createElement('div');
    v2label.style.position = 'absolute';
    v2label.style['pointer-events'] = 'none';
    v2label.style.width = 100;
    v2label.style.height = 50;
    v3label = document.createElement('div');
    v3label.style.position = 'absolute';
    v3label.style['pointer-events'] = 'none';
    v3label.style.width = 100;
    v3label.style.height = 50;
    tlabel = document.createElement('div');
    tlabel.style.position = 'absolute';
    tlabel.style['pointer-events'] = 'none';
    tlabel.style.width = 100;
    tlabel.style.height = 50;
}

function fillScene() {
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        t: 0.5
    }
    gui.add(params, 't').min(0).max(1).step(0.05).name('T');
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
    var axes = new THREE.AxisHelper(150);
    axes.position.y = 1;
    scene.add(axes);
    drawBezierCurve();
}

function drawBezierCurve() {
    v0 = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0x000000 }));
    v0.position.x = 0;
    v0.position.y = 0;
    v0.position.z = -200;
    scene.add(v0);
    v1 = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0xff0000 }));
    v1.position.x = 0;
    v1.position.y = 500;
    v1.position.z = -100;
    scene.add(v1);
    v2 = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0xff0000 }));
    v2.position.x = 0;
    v2.position.y = 500;
    v2.position.z = 100;
    scene.add(v2);
    v3 = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0x000000 }));
    v3.position.x = 0;
    v3.position.y = 0;
    v3.position.z = 200;
    scene.add(v3);
    t_ball = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0x55ff22 }));
    t_ball.position.x = 0;
    t_ball.position.y = 0;
    t_ball.position.z = 0;
    scene.add(t_ball);
    handleMat = new THREE.LineBasicMaterial({
        color: 0xff0000
    });
    handle1Geom = new THREE.Geometry();
    handle1Geom.vertices.push(
        v0.position,
        v1.position
    );
    handle1 = new THREE.Line(handle1Geom, handleMat);
    scene.add(handle1);
    handle2Geom = new THREE.Geometry();
    handle2Geom.vertices.push(
        v3.position,
        v2.position
    );
    handle2 = new THREE.Line(handle2Geom, handleMat);
    scene.add(handle2);
    curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(v0.position.x, v0.position.y, v0.position.z),
        new THREE.Vector3(v1.position.x, v1.position.y, v1.position.z),
        new THREE.Vector3(v2.position.x, v2.position.y, v2.position.z),
        new THREE.Vector3(v3.position.x, v3.position.y, v3.position.z)
    );
    curveGeometry = new THREE.Geometry();
    curveGeometry.vertices = curve.getPoints(50);
    var material = new THREE.LineBasicMaterial({
        linewidth: 3,
        color: 0x000000
    });
    curveObject = new THREE.Line(curveGeometry, material);
    scene.add(curveObject);
    objects = [v0, v1, v2, v3];
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
    setTBallPosition();
    window.requestAnimationFrame(animate);
    render();
}

function setTBallPosition() {
    // BEGIN CHANGES
    // Parameter
    var t = params.t;

    // Points
    var p0 = v0.position;
    var p1 = v1.position;
    var p2 = v2.position;
    var p3 = v3.position;

    // Linear
    var p01 = p0.clone().multiplyScalar(t).add(p1.clone().multiplyScalar(1 - t));
    var p12 = p1.clone().multiplyScalar(t).add(p2.clone().multiplyScalar(1 - t));
    var p23 = p2.clone().multiplyScalar(t).add(p3.clone().multiplyScalar(1 - t));

    // Quadratic
    var p012 = p01.clone().multiplyScalar(t).add(p12.clone().multiplyScalar(1 - t));
    var p123 = p12.clone().multiplyScalar(t).add(p23.clone().multiplyScalar(1 - t));

    // Cubic
    var p0123 = p012.clone().multiplyScalar(t).add(p123.clone().multiplyScalar(1 - t));

    // Ball
    t_ball.position.set(0, 0, 0).add(p0123);
    // END CHANGES
}

function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    camera.updateMatrixWorld();
    v0label.style.top = (toXYCoords(v0.position).y + $("#canvas").offset().top + 10) + 'px';
    v0label.style.left = (toXYCoords(v0.position).x + $("#canvas").offset().left + 10) + 'px';
    v0label.innerHTML =
        Math.round(v0.position.x) + ", " +
        Math.round(v0.position.y) + ", " +
        Math.round(v0.position.z);
    document.body.appendChild(v0label);
    v1label.style.top = (toXYCoords(v1.position).y + $("#canvas").offset().top + 10) + 'px';
    v1label.style.left = (toXYCoords(v1.position).x + $("#canvas").offset().left + 10) + 'px';
    v1label.innerHTML =
        Math.round(v1.position.x) + ", " +
        Math.round(v1.position.y) + ", " +
        Math.round(v1.position.z);
    document.body.appendChild(v1label);
    v2label.style.top = (toXYCoords(v2.position).y + $("#canvas").offset().top + 10) + 'px';
    v2label.style.left = (toXYCoords(v2.position).x + $("#canvas").offset().left + 10) + 'px';
    v2label.innerHTML =
        Math.round(v2.position.x) + ", " +
        Math.round(v2.position.y) + ", " +
        Math.round(v2.position.z);
    document.body.appendChild(v2label);
    v3label.style.top = (toXYCoords(v3.position).y + $("#canvas").offset().top + 10) + 'px';
    v3label.style.left = (toXYCoords(v3.position).x + $("#canvas").offset().left + 10) + 'px';
    v3label.innerHTML =
        Math.round(v3.position.x) + ", " +
        Math.round(v3.position.y) + ", " +
        Math.round(v3.position.z);
    document.body.appendChild(v3label);
    tlabel.style.top = (toXYCoords(t_ball.position).y + $("#canvas").offset().top + 10) + 'px';
    tlabel.style.left = (toXYCoords(t_ball.position).x + $("#canvas").offset().left + 10) + 'px';
    tlabel.innerHTML =
        Math.round(t_ball.position.x) + ", " +
        Math.round(t_ball.position.y) + ", " +
        Math.round(t_ball.position.z);
    document.body.appendChild(tlabel);
    renderer.render(scene, camera);
}

function toXYCoords(pos) {
    var vector = pos.clone().project(camera);
    vector.x = (vector.x + 1) / 2 * canvasWidth;
    vector.y = -(vector.y - 1) / 2 * canvasHeight;
    return vector;
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
            SELECTED.position.copy(intersection.sub(offset));
            curve.v0.set(v0.position.x, v0.position.y, v0.position.z);
            curve.v1.set(v1.position.x, v1.position.y, v1.position.z);
            curve.v2.set(v2.position.x, v2.position.y, v2.position.z);
            curve.v3.set(v3.position.x, v3.position.y, v3.position.z);
            curveGeometry.vertices = curve.getPoints(50);
            curveGeometry.verticesNeedUpdate = true;
            handle1Geom.vertices = [v0.position, v1.position];
            handle1Geom.verticesNeedUpdate = true;
            handle2Geom.vertices = [v3.position, v2.position];
            handle2Geom.verticesNeedUpdate = true;
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
        cameraControls.enabled = false;
        SELECTED = intersects[0].object;
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            offset.copy(intersection).sub(SELECTED.position);
        }
        canvas.style.cursor = 'move';
    }
}

function onDocumentMouseUp(event) {
    event.preventDefault();
    cameraControls.enabled = true;
    if (INTERSECTED) {
        SELECTED = null;
    }
    canvas.style.cursor = 'auto';
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
