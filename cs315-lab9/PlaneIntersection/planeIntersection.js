"use strict";
var camera, scene, renderer, cameraControls, canvasWidth, canvasHeight,
    greenBall, redCone, redConeObj, plane, rayObject,
    surfacePointBall, center, lineIn, lineInGeom,
    lineMat, greenBalllabel, redConelabel, gui, params,
    intersects, INTERSECTED, SELECTED;
var objects = [];
var iplane = new THREE.Plane(),
    mouse = new THREE.Vector2(),
    offset = new THREE.Vector3(),
    intersection = new THREE.Vector3();
var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();

function fillScene() {
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        planeAngleX: 0,
        planeAngleY: 0,
        planePosition: -400,
        rayAngleX: 0,
        rayAngleY: 0,
    }
    gui.add(params, "planeAngleX").min(-25.0).max(25.0).step(1).name("Plane Rot X");
    gui.add(params, "planeAngleY").min(-25.0).max(25.0).step(1).name("Plane Rot Y");
    gui.add(params, "planePosition").min(-600).max(-100).step(5).name("Plane Pos");
    gui.add(params, "rayAngleX").min(-25.0).max(25.0).step(1).name("Ray Rot X");
    gui.add(params, "rayAngleY").min(-25.0).max(25.0).step(1).name("Ray Rot Y");
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
    var imagePrefix = "../../images/airport/sky-";
    var imageSuffix = ".png";
    var urls = [imagePrefix + "xpos" + imageSuffix, imagePrefix + "xneg" + imageSuffix,
        imagePrefix + "ypos" + imageSuffix, imagePrefix + "yneg" + imageSuffix,
        imagePrefix + "zpos" + imageSuffix, imagePrefix + "zneg" + imageSuffix
    ];
    var textureLoader = new THREE.CubeTextureLoader();
    textureLoader.load(urls, function(texture) {
        drawObjects(texture);
        addToDOM();
        animate();
    });
}

function drawObjects(reflectionCube) {
    rayObject = new THREE.Object3D();
    surfacePointBall = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0xffff00 }));
    surfacePointBall.name = "surfacePoint";
    scene.add(surfacePointBall);
    var material = new THREE.MeshPhongMaterial({
        shininess: 100,
        transparent: true,
        opacity: 0.5,
        envMap: reflectionCube,
        side: THREE.DoubleSide,
        combine: THREE.MixOperation,
        reflectivity: 0.3
    });
    material.color.setRGB(0.3, 0, 0.3);
    material.specular.setRGB(1, 1, 1);
    var geo = new THREE.PlaneGeometry(10000, 10000);
    geo.computeFaceNormals();
    plane = new THREE.Mesh(geo, material)
    plane.name = "plane";
    scene.add(plane);
    greenBall = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
    rayObject.add(greenBall);
    greenBall.userData.parent = rayObject;
    redCone = new THREE.Mesh(new THREE.ConeGeometry(50, 100, 32),
        new THREE.MeshLambertMaterial({ color: 0xff0000 }));
    redCone.rotateX(-Math.PI / 2);
    redConeObj = new THREE.Object3D();
    redConeObj.add(redCone);
    redConeObj.position.z = -600;
    rayObject.add(redConeObj);
    lineMat = new THREE.LineBasicMaterial({
        color: 0x000000
    });
    lineInGeom = new THREE.Geometry();
    lineInGeom.vertices.push(
        greenBall.position,
        redConeObj.position
    );
    lineIn = new THREE.Line(lineInGeom, lineMat);
    rayObject.add(lineIn);
    scene.add(rayObject);
    objects = [greenBall];
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
    renderer.domElement.addEventListener("mousemove", onDocumentMouseMove, false);
    renderer.domElement.addEventListener("mousedown", onDocumentMouseDown, false);
    renderer.domElement.addEventListener("mouseup", onDocumentMouseUp, false);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 8000);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(-500, 600, 800);
    cameraControls.target.set(4, 301, 92);
}

function addToDOM() {
    var canvas = document.getElementById("canvas");
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
    updateScene();
    window.requestAnimationFrame(animate);
    render();
}

function updateScene() {
    calculateIntersection()
    plane.rotation.x = params.planeAngleX * Math.PI / 180;
    plane.rotation.y = params.planeAngleY * Math.PI / 180;
    plane.position.z = params.planePosition;
    rayObject.rotation.x = params.rayAngleX * Math.PI / 180;
    rayObject.rotation.y = params.rayAngleY * Math.PI / 180;
    lineInGeom.vertices = [greenBall.position, redConeObj.position];
    lineInGeom.verticesNeedUpdate = true;
    redConeObj.lookAt(greenBall.position);
}

function calculateIntersection() {
    plane.updateMatrixWorld();
    // BEGIN CHANGES
    var worldBall = greenBall.position.clone().applyMatrix4(rayObject.matrixWorld);
    var worldCone = redConeObj.position.clone().applyMatrix4(rayObject.matrixWorld);

    var direction = new THREE.Vector3().subVectors(worldCone, worldBall).normalize();

    var planeNormalMatrix = new THREE.Matrix3().getNormalMatrix(plane.matrixWorld);
    var planeNormal = plane.geometry.faces[0].normal.clone().applyMatrix3(planeNormalMatrix).negate();
    var planePoint = plane.geometry.vertices[0].clone().applyMatrix4(plane.matrixWorld);
    var planeVec = new THREE.Vector3().subVectors(planePoint, worldBall);

    var dotPlaneVec = planeNormal.dot(planeVec);
    var dotDirection = planeNormal.dot(direction);

    surfacePointBall.position.set(0, 0, 0)
        .add(direction)
        .multiplyScalar(dotPlaneVec / dotDirection)
        .add(worldBall);
    // END OF CHANGES
}

function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    camera.updateMatrixWorld();
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
        if (raycaster.ray.intersectPlane(iplane, intersection)) {
            var prevPos = SELECTED.position.clone();
            SELECTED.position.copy(intersection.sub(offset));
        }
        return;
    }
    intersects = raycaster.intersectObjects(objects, true);
    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            INTERSECTED = intersects[0].object;
            iplane.setFromNormalAndCoplanarPoint(
                camera.getWorldDirection(iplane.normal),
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
        if (raycaster.ray.intersectPlane(iplane, intersection)) {
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
} catch (error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}