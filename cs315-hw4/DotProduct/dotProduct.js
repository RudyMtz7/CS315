"use strict";
var camera, scene, renderer, cameraControls, canvasWidth, canvasHeight,
    redCone, redConeObj, blueCone, blueConeObj, redLine, blueLine, lineMat,
    redLineGeom, blueLineGeom, redBall, blueBall, grayBall,
    redTriangle, blueTriangle, redConeLabel, blueConeLabel,
    redBallLabel, blueBallLabel, grayBallLabel, redCylinderLabel, blueCylinderLabel,
    gui, params;
var INTERSECTED, SELECTED;
var SPHERE_SIZE = 200;
var objects = [];
var plane = new THREE.Plane();
var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();
var redToGreenRay = new THREE.Vector3();
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
    camera.position.set(-500, 400, -900);
    cameraControls.target.set(4, 0, 92);
    redBallLabel = document.createElement("div");
    redBallLabel.style.position = "absolute";
    redBallLabel.style["pointer-events"] = "none";
    redBallLabel.style.width = 100;
    redBallLabel.style.height = 50;
    blueBallLabel = document.createElement("div");
    blueBallLabel.style.position = "absolute";
    blueBallLabel.style["pointer-events"] = "none";
    blueBallLabel.style.width = 100;
    blueBallLabel.style.height = 50;
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
    grayBallLabel = document.createElement("div");
    grayBallLabel.style.position = "absolute";
    grayBallLabel.style["pointer-events"] = "none";
    grayBallLabel.style.width = 100;
    grayBallLabel.style.height = 50;
}

function fillScene() {
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        redLength: 0.1,
        blueLength: 0.1,
        cosine: 0.01,
        dotProduct: 0.1
    };
    gui.add(params, "redLength").name("Red Length:").listen();
    gui.add(params, "blueLength").name("Blue Length:").listen();
    gui.add(params, "cosine").name("Cosine:").listen();
    gui.add(params, "dotProduct").name("Dot Product:").listen();
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
    axes.scale.set(1, 1, 1);
    scene.add(axes);
    drawVectors();
}

function drawVectors() {
    redBall = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 12),
        new THREE.MeshLambertMaterial({
            color: 0xff0000
        }));
    redBall.position.x = 0;
    redBall.position.y = 0;
    redBall.position.z = -15;
    scene.add(redBall);
    blueBall = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 12),
        new THREE.MeshLambertMaterial({
            color: 0x0000ff
        }));
    blueBall.position.x = 0;
    blueBall.position.y = 0;
    blueBall.position.z = 15;
    scene.add(blueBall);
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
    redConeObj.position.y = -200;
    redConeObj.position.z = -400;
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
    blueConeObj.position.y = 400;
    blueConeObj.position.z = 200;
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
    var redTriangleMaterial = new THREE.MeshPhongMaterial({
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    redTriangleMaterial.color.setRGB(1, 0, 0);
    var geo = new THREE.Geometry();
    geo.vertices = [redBall.position, redConeObj.position, grayBall.position];
    geo.faces = [new THREE.Face3(0, 1, 2)];
    geo.computeFaceNormals();
    redTriangle = new THREE.Mesh(geo, redTriangleMaterial);
    scene.add(redTriangle);
    var blueTriangleMaterial = new THREE.MeshPhongMaterial({
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide
    });
    blueTriangleMaterial.color.setRGB(0, 0, 1);
    geo = new THREE.Geometry();
    geo.vertices = [blueBall.position, blueConeObj.position, grayBall.position];
    geo.faces = [new THREE.Face3(0, 1, 2)];
    geo.computeFaceNormals();
    blueTriangle = new THREE.Mesh(geo, blueTriangleMaterial);
    scene.add(blueTriangle);
    updateObjects();
    objects = [grayBall, redCone, blueCone];
}

function updateObjects() {
    redConeObj.lookAt(grayBall.position);
    blueConeObj.lookAt(grayBall.position);
    redLineGeom.vertices = [grayBall.position, redConeObj.position];
    redLineGeom.verticesNeedUpdate = true;
    blueLineGeom.vertices = [grayBall.position, blueConeObj.position];
    blueLineGeom.verticesNeedUpdate = true;
    redTriangle.geometry.vertices = [redBall.position, redConeObj.position, grayBall.position];
    redTriangle.geometry.verticesNeedUpdate = true;
    blueTriangle.geometry.vertices = [blueBall.position, blueConeObj.position, grayBall.position];
    blueTriangle.geometry.verticesNeedUpdate = true;
    calculateDotProductAndProjections();
}

function calculateDotProductAndProjections() {
    // BEGIN CHANGES
    function dotProduct(a, b) {
        return (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
    }

    function projection(a, b) {
        var scalar = dotProduct(a, b) / dotProduct(b, b);
        return {
            x: scalar * b.x,
            y: scalar * b.y,
            z: scalar * b.z
        };
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
    var theDotProduct = dotProduct(redVector, blueVector);
    var redLength = Math.sqrt(dotProduct(redVector, redVector));
    var blueLength = Math.sqrt(dotProduct(blueVector, blueVector));
    var blueOnRed = projection(blueVector, redVector);
    var redOnBlue = projection(redVector, blueVector);
    params.dotProduct = theDotProduct;
    params.redLength = redLength;
    params.blueLength = blueLength;
    params.cosine = theDotProduct / (redLength * blueLength);
    redBall.position.x = redOnBlue.x + grayBall.position.x;
    redBall.position.y = redOnBlue.y + grayBall.position.y;
    redBall.position.z = redOnBlue.z + grayBall.position.z;
    blueBall.position.x = blueOnRed.x + grayBall.position.x;
    blueBall.position.y = blueOnRed.y + grayBall.position.y;
    blueBall.position.z = blueOnRed.z + grayBall.position.z;
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
    redBallLabel.style.top = (toXYCoords(redBall.position).y + $("#canvas").offset().top + 10) + "px";
    redBallLabel.style.left = (toXYCoords(redBall.position).x + $("#canvas").offset().left + 10) + "px";
    redBallLabel.innerHTML =
        Math.round(redBall.position.x) + ", " +
        Math.round(redBall.position.y) + ", " +
        Math.round(redBall.position.z);
    document.body.appendChild(redBallLabel);
    blueBallLabel.style.top = (toXYCoords(blueBall.position).y + $("#canvas").offset().top + 10) + "px";
    blueBallLabel.style.left = (toXYCoords(blueBall.position).x + $("#canvas").offset().left + 10) + "px";
    blueBallLabel.innerHTML =
        Math.round(blueBall.position.x) + ", " +
        Math.round(blueBall.position.y) + ", " +
        Math.round(blueBall.position.z);
    document.body.appendChild(blueBallLabel);
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

function toXYCoords(pos) {
    var vector = pos.clone().project(camera);
    vector.x = (vector.x + 1) / 2 * canvasWidth;
    vector.y = -(vector.y - 1) / 2 * canvasHeight;
    return vector;
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

try {
    init();
    fillScene();
    addToDOM();
    animate();
} catch (error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
