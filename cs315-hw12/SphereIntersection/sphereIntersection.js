"use strict";
var camera, scene, renderer, cameraControls, canvasWidth, canvasHeight,
    redBall, greenBall, sphere, intersect1, intersect2, intersect3,
    line, lineGeom, lineMat, redBalllabel, greenBalllabel, gui, params;
var SPHERE_SIZE = 200;
var objects = [];
var plane = new THREE.Plane(),
    mouse = new THREE.Vector2(),
    offset = new THREE.Vector3(),
    redToGreenRay = new THREE.Vector3,
    intersection = new THREE.Vector3(),
    INTERSECTED, SELECTED;
var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();

function fillScene() {
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        scale: 1
    }
    gui.add(params, 'scale').min(0.5).max(2).step(0.1).name('Sphere Scale');
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "-400px";
    gui.domElement.style.left = "350px";
    scene = new THREE.Scene();
    scene.background = new THREE.CubeTextureLoader()
        .setPath("../../images/airport/sky-")
        .load(["xpos.png", "xneg.png", "ypos.png", "yneg.png", "zpos.png", "zneg.png"]);
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
    drawSphereIntersection();
}

function drawSphereIntersection() {
    var sphereMaterial = new THREE.MeshPhongMaterial({
        color: 0xFFFFFF,
        shininess: 100,
        transparent: true,
        opacity: 0.5,
        envMap: scene.background,
        combine: THREE.MixOperation,
        reflectivity: 0.3
    });
    sphereMaterial.color.setRGB(0.2, 0, 0.2);
    sphereMaterial.specular.setRGB(1, 1, 1);
    sphere = new THREE.Mesh(new THREE.SphereGeometry(SPHERE_SIZE, 16, 16),
        sphereMaterial);
    scene.add(sphere);
    redBall = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0xff0000 }));
    redBall.position.x = 0;
    redBall.position.y = 0;
    redBall.position.z = -300;
    scene.add(redBall);
    greenBall = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
    greenBall.position.x = 0;
    greenBall.position.y = 0;
    greenBall.position.z = 300;
    scene.add(greenBall);
    intersect1 = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0xff0000 }));
    intersect1.position.x = 0;
    intersect1.position.y = 0;
    intersect1.position.z = -50;
    scene.add(intersect1);
    intersect2 = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
    intersect2.position.x = 0;
    intersect2.position.y = 0;
    intersect2.position.z = 50;
    scene.add(intersect2);
    intersect3 = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0xffff00 }));
    scene.add(intersect3);
    lineMat = new THREE.LineBasicMaterial({
        color: 0x000000
    });
    lineGeom = new THREE.Geometry();
    lineGeom.vertices.push(
        redBall.position,
        greenBall.position
    );
    line = new THREE.Line(lineGeom, lineMat);
    scene.add(line);
    objects = [redBall, greenBall, sphere];
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
    renderer.setPixelRatio(window.devicePixelRatio);
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 4000);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(-800, 600, -500);
    cameraControls.target.set(4, 0, 92);
    redBalllabel = document.createElement('div');
    redBalllabel.style.position = 'absolute';
    redBalllabel.style['pointer-events'] = 'none';
    redBalllabel.style.width = 100;
    redBalllabel.style.height = 50;
    greenBalllabel = document.createElement('div');
    greenBalllabel.style.position = 'absolute';
    greenBalllabel.style['pointer-events'] = 'none';
    greenBalllabel.style.width = 100;
    greenBalllabel.style.height = 50;
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
    sphere.scale.set(params.scale, params.scale, params.scale);
    placeIntersects();
    window.requestAnimationFrame(animate);
    render();
}

function placeIntersects() {
    // BEGIN CHANGES
    var radius = SPHERE_SIZE * params.scale;
    var end, direction, t;
    end = new THREE.Vector3().subVectors(sphere.position, greenBall.position);
    direction = new THREE.Vector3().subVectors(greenBall.position, redBall.position).normalize();
    t = end.dot(direction) - Math.sqrt(radius * radius - end.dot(end) + end.dot(direction) * end.dot(direction));
    intersect1.position.copy(direction).multiplyScalar(t).add(greenBall.position);
    end = new THREE.Vector3().subVectors(sphere.position, redBall.position);
    direction = new THREE.Vector3().subVectors(redBall.position, greenBall.position).normalize();
    t = end.dot(direction) - Math.sqrt(radius * radius - end.dot(end) + end.dot(direction) * end.dot(direction));
    intersect2.position.copy(direction).multiplyScalar(t).add(redBall.position);
    intersect3.position.addVectors(intersect1.position, intersect2.position).multiplyScalar(0.5);
    if (intersect1.position.distanceTo(intersect3.position) < 20) {
        intersect3.visible = true;
        intersect1.visible = false;
        intersect2.visible = false;
    } else {
        intersect3.visible = false;
        intersect1.visible = true;
        intersect2.visible = true;
    }
    // END CHANGES
}

function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    camera.updateMatrixWorld();
    redBalllabel.style.top = (toXYCoords(redBall.position).y + $("#canvas").offset().top + 10) + 'px';
    redBalllabel.style.left = (toXYCoords(redBall.position).x + $("#canvas").offset().left + 10) + 'px';
    redBalllabel.innerHTML =
        Math.round(redBall.position.x) + ", " +
        Math.round(redBall.position.y) + ", " +
        Math.round(redBall.position.z);
    document.body.appendChild(redBalllabel);
    greenBalllabel.style.top = (toXYCoords(greenBall.position).y + $("#canvas").offset().top + 10) + 'px';
    greenBalllabel.style.left = (toXYCoords(greenBall.position).x + $("#canvas").offset().left + 10) + 'px';
    greenBalllabel.innerHTML =
        Math.round(greenBall.position.x) + ", " +
        Math.round(greenBall.position.y) + ", " +
        Math.round(greenBall.position.z);
    document.body.appendChild(greenBalllabel);
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
            SELECTED.position.copy(intersection.sub(offset));
            lineGeom.vertices = [redBall.position, greenBall.position];
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