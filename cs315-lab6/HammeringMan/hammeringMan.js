"use strict";

var camera, cameraControls, scene, renderer, gui, params, man, arm, armRot, manRot;
var canvasWidth = 600;
var canvasHeight = 400;
var canvasRatio = canvasWidth / canvasHeight;
var cycle = 0;
var clock = new THREE.Clock();

function fillScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x808080, 2000, 4000);
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        yrot: 0
    };
    gui.add(params, 'yrot').min(0).max(180).step(10).name('Y rotation');
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
    loadObjects();
}

function loadObjects() {
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
    mtlLoader.load('hammeringman.mtl', function(materials) {
        materials.preload();
        var objLoader = new THREE.OBJLoader(manager);
        objLoader.setMaterials(materials);
        objLoader.load('hammeringman.obj', function(obj) {
            man = obj;
            objLoader.load('hammeringman_arm.obj', function(obj) {
                arm = obj;
                drawHammeringMan();
            }, onProgress, onError);
        }, onProgress, onError);
    })
}

function drawHammeringMan() {
    armRot = new THREE.Object3D();
    manRot = new THREE.Object3D();
    const yOffset = 380;
    const zOffset = 100;
    arm.position.y = -yOffset;
    armRot.position.y = yOffset;
    arm.position.z = zOffset;
    armRot.position.z = -zOffset;
    manRot.position.y = 600;
    armRot.add(arm);
    manRot.add(man);
    manRot.add(armRot);
    scene.add(manRot);
    animate();
}

function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 4000);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(-1200, 1000, 1000);
    cameraControls.target.set(250, 600, 250);
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
    cycle = cycle === 360 ? 1 : ++cycle;
    armRot.rotation.x = Math.cos(cycle * (Math.PI / 180)) - 0.5;
    manRot.rotation.y = params.yrot * (Math.PI / 180);
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    renderer.render(scene, camera);
}

try {
    init();
    fillScene();
    addToDOM();
} catch (error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
