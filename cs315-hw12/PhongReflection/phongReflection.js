"use strict";
var camera, scene, renderer, cameraControls, canvasWidth, canvasHeight,
    yellowCone, yellowConeObj, sphereObj, sphere, surfacePointBall, lighting,
    sun, eye, blackCone, blackConeObj, normalLine, normalLineGeom, material,
    lineIn, lineInGeom, lineOut, lineOutGeom, lineMat, sunlabel, gui, params,
    intersects;
var SPHERE_SIZE = 200;
var objects = [];
var loaded = false;
var plane = new THREE.Plane(),
    mouse = new THREE.Vector2(),
    offset = new THREE.Vector3(),
    intersection = new THREE.Vector3(),
    INTERSECTED, SELECTED;
var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();
var diffuseColor = new THREE.Color("darkslategray");
var color = new THREE.Color();

function fillScene() {
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        scale: 1,
        shininess: 10,
        lighting: "diffuse"
    }
    gui.add(params, "scale").min(0.5).max(2).step(0.1).name("Sphere Scale");
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "-400px";
    gui.domElement.style.left = "350px";
    gui.add(params, "lighting", ["diffuse", "specular", ]).name("Lighting Component");
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "-400px";
    gui.domElement.style.left = "350px";
    gui.add(params, "shininess").min(1).max(100).step(1).name("Shininess");
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "-400px";
    gui.domElement.style.left = "350px";
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x808080, 2000, 4000);
    var light = new THREE.HemisphereLight(0xffffff, 0x000008, 1);
    light.position.set(-200, 500, 100);
    camera.add(light);
    light = new THREE.AmbientLight(0x404040);
    scene.add(light);
    var gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
    scene.add(gridXZ);
    var axes = new THREE.AxisHelper(150);
    axes.scale.set(1, 1, 1);
    scene.add(axes);
    scene.add(camera);
    drawSphereIntersection();
}

function drawSphereIntersection() {
    var sphereMaterial = new THREE.MeshPhongMaterial();
    sphereMaterial.color.copy(diffuseColor);
    sphereObj = new THREE.Object3D();
    sphereObj.position.x = 400;
    sphereObj.position.y = 100;
    sphere = new THREE.Mesh(new THREE.SphereGeometry(SPHERE_SIZE, 16, 16),
        sphereMaterial);
    sphere.name = "sphere";
    sphere.userData.parent = sphereObj;
    sphereObj.add(sphere);
    material = new THREE.MeshBasicMaterial({ color: 0x888888 })
    surfacePointBall = new THREE.Mesh(new THREE.SphereGeometry(35, 12, 12),
        material);
    surfacePointBall.position.x = -SPHERE_SIZE * params.scale;
    surfacePointBall.name = "surfacePoint";
    sphereObj.add(surfacePointBall);
    scene.add(sphereObj);
    yellowCone = new THREE.Mesh(new THREE.ConeGeometry(50, 100, 32),
        new THREE.MeshLambertMaterial({ color: 0xeecc00 }));
    yellowCone.rotateX(-Math.PI / 2);
    yellowConeObj = new THREE.Object3D();
    yellowConeObj.add(yellowCone);
    scene.add(yellowConeObj);
    lineMat = new THREE.LineBasicMaterial({
        color: 0x000000
    });
    lineOutGeom = new THREE.Geometry();
    lineOutGeom.vertices.push(
        surfacePointBall.position.clone().add(sphereObj.position),
        yellowConeObj.position
    );
    lineOut = new THREE.Line(lineOutGeom, lineMat);
    scene.add(lineOut);
    blackCone = new THREE.Mesh(new THREE.ConeGeometry(25, 50, 32),
        new THREE.MeshLambertMaterial({ color: 0x000000 }));
    blackCone.rotateX(-Math.PI / 2);
    blackConeObj = new THREE.Object3D();
    blackConeObj.add(blackCone);
    scene.add(blackConeObj);
    normalLineGeom = new THREE.Geometry();
    normalLineGeom.vertices.push(
        surfacePointBall.position.clone().add(sphereObj.position),
        blackConeObj.position
    );
    normalLine = new THREE.Line(normalLineGeom, lineMat);
    scene.add(normalLine);
    var manager = new THREE.LoadingManager();
    manager.onProgress = function(item, loaded, total) {
        console.log(item, loaded, total);
    };
    var onProgress = function(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + "% downloaded");
        }
    };
    var onError = function(xhr) {};
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.load("eye_and_sun.mtl", function(materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader(manager);
        objLoader.setMaterials(materials);
        objLoader.load("eye_and_sun.obj", function(eye_and_sun) {
            sun = eye_and_sun.children[0];
            eye = eye_and_sun.children[1];
            sun.position.x = -100;
            sun.position.y = 200;
            sun.position.z = 300;
            scene.add(sun);
            objects.push(sun);
            eye.position.x = -400;
            eye.position.y = 100;
            eye.position.z = 400;
            scene.add(eye);
            objects.push(eye);
            lineInGeom = new THREE.Geometry();
            lineInGeom.vertices.push(
                sun.position,
                surfacePointBall.position.clone().add(sphereObj.position)
            );
            lineIn = new THREE.Line(lineInGeom, lineMat);
            scene.add(lineIn);
            loaded = true;
        }, onProgress, onError);
    }, onProgress, onError);
    objects = objects.concat([surfacePointBall, sphere]);
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
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 4000);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(-600, 400, -900);
    cameraControls.target.set(10, 100, 100);
}

function addToDOM() {
    var canvas = document.getElementById("canvas");
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
    if (loaded) {
        positionObjects();
        calculateReflectionAndSpec();
        drawLines();
    }
    window.requestAnimationFrame(animate);
    render();
}

function positionObjects() {
    sphere.scale.set(params.scale, params.scale, params.scale);
    surfacePointBall.position.setLength(SPHERE_SIZE * params.scale);
    blackConeObj.position.addVectors(
        surfacePointBall.position.clone().add(sphereObj.position),
        surfacePointBall.position.clone().normalize().multiplyScalar(200)
    )
    sun.lookAt(camera.position);
    eye.lookAt(surfacePointBall.position.clone().add(sphereObj.position));
    blackConeObj.lookAt(sphereObj.position);
    yellowConeObj.lookAt(surfacePointBall.position.clone().add(sphereObj.position))
}

function calculateReflectionAndSpec() {
    // BEGIN CHANGES
    var point = new THREE.Vector3().addVectors(surfacePointBall.position, sphereObj.position);
    var light = new THREE.Vector3().subVectors(sun.position, point);
    var normal = new THREE.Vector3().subVectors(point, sphereObj.position).normalize();

    if (normal.dot(light) > 0) {
        var ray = normal.clone().multiplyScalar(2 * normal.dot(light)).sub(light);

        yellowConeObj.position.addVectors(point, ray);

        if (params.lighting == "diffuse") {
            surfacePointBall.material.color.copy(diffuseColor);
            surfacePointBall.material.color.offsetHSL(0, 0, -0.2 * normal.angleTo(light));
        } else {
            surfacePointBall.material.color.set("white");

            var relativeEye = new THREE.Vector3().subVectors(eye.position, point);
            var deg = ray.angleTo(relativeEye);

            if (params.shininess / 10 > 1) {
                surfacePointBall.material.color.offsetHSL(0, 0, -deg * params.shininess / 10);
            } else {
                surfacePointBall.material.color.offsetHSL(0, 0, -deg);
            }
        }

        yellowConeObj.visible = true;
        lineOut.visible = true;
        lineIn.visible = true;
    } else {
        lineIn.visible = false;
        lineOut.visible = false;
        yellowConeObj.visible = false;
    }
    // END CHANGES
}

function drawLines() {
    lineInGeom.vertices = [sun.position, surfacePointBall.position.clone().add(sphereObj.position)];
    lineInGeom.verticesNeedUpdate = true;
    lineOutGeom.vertices = [surfacePointBall.position.clone().add(sphereObj.position), yellowConeObj.position];
    lineOutGeom.verticesNeedUpdate = true;
    normalLineGeom.vertices = [surfacePointBall.position.clone().add(sphereObj.position), blackConeObj.position];
    normalLineGeom.verticesNeedUpdate = true;
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
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            if (SELECTED.name === "surfacePoint") {
                var sphereRaycaster = new THREE.Raycaster();
                sphereRaycaster.setFromCamera(mouse, camera);
                var surfPoint = new THREE.Vector3();
                var sph = new THREE.Sphere(sphereObj.position, SPHERE_SIZE * params.scale);
                if (sphereRaycaster.ray.intersectSphere(sph, surfPoint)) {
                    SELECTED.position.copy(surfPoint.sub(sphereObj.position));
                }
            } else {
                SELECTED.position.copy(intersection.sub(offset));
            }
        }
        return;
    }
    intersects = raycaster.intersectObjects(objects, true);
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