"use strict";

var camera, scene, renderer, cameraControls, canvasWidth, canvasHeight, sphereObj, sphere, surfacePointBall, pointer, blackPuck, whitePuck, gui, params, reflectionCube, intersects, loaded, INTERSECTED, SELECTED;
var SPHERE_SIZE = 300;
var objects = [];
var plane = new THREE.Plane();
var mouse = new THREE.Vector2();
var offset = new THREE.Vector3();
var intersection = new THREE.Vector3();
var center = new THREE.Vector3().set(0, 0, 0);
var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();

function calculateInterpolation() {
    // BEGIN CHANGES
    var blackQ = blackPuck.quaternion.clone().normalize();
    var whiteQ = whitePuck.quaternion.clone().normalize();
    var slerpQ = new THREE.Quaternion();

    function dotProduct(a, b) {
        return (a.w * b.w) + (a.x * b.x) + (a.y * b.y) + (a.z * b.z);
    }
    var dotProduct = dotProduct(blackQ, whiteQ);
    const dotProduct_THRESHOLD = 0.9999;
    if (Math.abs(dotProduct) > dotProduct_THRESHOLD) {
        slerpQ.w = (1 - params.t) * blackQ.w + params.t * whiteQ.w;
        slerpQ.x = (1 - params.t) * blackQ.x + params.t * whiteQ.x;
        slerpQ.y = (1 - params.t) * blackQ.y + params.t * whiteQ.y;
        slerpQ.z = (1 - params.t) * blackQ.z + params.t * whiteQ.z;
    } else {
        if (dotProduct < 0) {
            whiteQ.w *= -1;
            whiteQ.x *= -1;
            whiteQ.y *= -1;
            whiteQ.z *= -1;
            dotProduct *= -1;
        }
        dotProduct = Math.min(Math.max(dotProduct, -1), 1);
        var theta = Math.acos(dotProduct) * params.t;
        var tempQ = new THREE.Quaternion();
        tempQ.w = whiteQ.w - blackQ.w * dotProduct;
        tempQ.x = whiteQ.x - blackQ.x * dotProduct;
        tempQ.y = whiteQ.y - blackQ.y * dotProduct;
        tempQ.z = whiteQ.z - blackQ.z * dotProduct;
        tempQ.normalize();
        slerpQ.w = blackQ.w * Math.cos(theta) + tempQ.w * Math.sin(theta);
        slerpQ.x = blackQ.x * Math.cos(theta) + tempQ.x * Math.sin(theta);
        slerpQ.y = blackQ.y * Math.cos(theta) + tempQ.y * Math.sin(theta);
        slerpQ.z = blackQ.z * Math.cos(theta) + tempQ.z * Math.sin(theta);
    }
    slerpQ.normalize();
    pointer.matrix.makeRotationFromQuaternion(slerpQ);
    // END CHANGES
}

function fillScene() {
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        blackRot: 0,
        whiteRot: 0,
        t: 0.5
    }
    gui.add(params, 'blackRot').min(-180).max(180).step(2).name('Black Twist');
    gui.add(params, 'whiteRot').min(-180).max(180).step(2).name('White Twist');
    gui.add(params, 't').min(0).max(1.0).step(0.1).name('Interpolation');
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "-400px";
    gui.domElement.style.left = "350px";
    var imagePrefix = "../../images/airport/sky-";
    var imageSuffix = ".png";
    var urls = [imagePrefix + "xpos" + imageSuffix, imagePrefix + "xneg" + imageSuffix,
        imagePrefix + "ypos" + imageSuffix, imagePrefix + "yneg" + imageSuffix,
        imagePrefix + "zpos" + imageSuffix, imagePrefix + "zneg" + imageSuffix
    ];
    reflectionCube = new THREE.ImageUtils.loadTextureCube(urls);
    reflectionCube.format = THREE.RGBFormat;
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
    loadObjects();
}

function loadObjects() {
    var sphereMaterial = new THREE.MeshPhongMaterial({
        shininess: 100,
        transparent: true,
        opacity: 0.5,
        envMap: reflectionCube,
        combine: THREE.MixOperation,
        reflectivity: 0.3
    });
    sphereMaterial.color.setRGB(0.2, 0, 0.2);
    sphereMaterial.specular.setRGB(1, 1, 1);
    sphere = new THREE.Mesh(new THREE.SphereGeometry(SPHERE_SIZE, 16, 16),
        sphereMaterial);
    sphere.name = 'sphere';
    scene.add(sphere);
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
    mtlLoader.load('va.mtl', function(materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader(manager);
        objLoader.setMaterials(materials);
        objLoader.load('pointer.obj', function(va) {
            pointer = va;
            pointer.matrixAutoUpdate = false;
            scene.add(pointer);
            objLoader.load('WhitePuck.obj', function(wp) {
                whitePuck = wp.children[0];
                whitePuck.position.z = -300;
                whitePuck.lookAt(center);
                scene.add(whitePuck);
                objects.push(whitePuck);
                objLoader.load('BlackPuck.obj', function(bp) {
                    blackPuck = bp.children[0];
                    blackPuck.position.x = -300;
                    loaded = true;
                    blackPuck.lookAt(center);
                    scene.add(blackPuck);
                    objects.push(blackPuck);
                }, onProgress, onError);
            }, onProgress, onError);
        }, onProgress, onError);
    })
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
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
    if (loaded) {
        positionObjects();
        calculateInterpolation();
    }
    window.requestAnimationFrame(animate);
    render();
}

function positionObjects() {
    blackPuck.rotation.z = params.blackRot * Math.PI / 180
    whitePuck.rotation.z = params.whiteRot * Math.PI / 180
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
            var sphereRaycaster = new THREE.Raycaster();
            sphereRaycaster.setFromCamera(mouse, camera);
            var surfPoint = new THREE.Vector3();
            var sph = new THREE.Sphere(sphere.position, SPHERE_SIZE);
            if (sphereRaycaster.ray.intersectSphere(sph, surfPoint)) {
                SELECTED.position.copy(surfPoint.sub(sphere.position));
                SELECTED.lookAt(center);
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
        SELECTED = intersects[0].object.userData.parent || intersects[0].object;
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
