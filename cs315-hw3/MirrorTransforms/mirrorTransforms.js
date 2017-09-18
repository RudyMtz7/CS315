"use strict";
var knight, camera, scene, renderer, gui, params, cameraControls;
var clock = new THREE.Clock();
var posx = -300;
var posy = 450;
var posz = -300;
var xMirrorMatrix = new THREE.Matrix4();
var yMirrorMatrix = new THREE.Matrix4();
var zMirrorMatrix = new THREE.Matrix4();
var multiAxisTransformMatrix = new THREE.Matrix4();
var xCopy, yCopy, zCopy, multiCopy;

function init() {
    var canvasWidth = 600;
    var canvasHeight = 400;
    var canvasRatio = canvasWidth / canvasHeight;
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 4000);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(-1000, 1400, 1900);
    cameraControls.target.set(450, 150, 400);
}

function fillScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x808080, 3000, 5000);
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        xtrans: 0,
        ytrans: 0,
        ztrans: 0,
        xrot: 0,
        yrot: 0,
        zrot: 0,
        xmir: false,
        ymir: false,
        zmir: false,
        multitrans: false
    };
    gui.add(params, "xtrans").min(-100).max(100).step(5).name("X translation");
    gui.add(params, "ytrans").min(-100).max(100).step(5).name("Y translation");
    gui.add(params, "ztrans").min(-100).max(100).step(5).name("Z translation");
    gui.add(params, "xrot").min(-180).max(180).step(10).name("X rotation");
    gui.add(params, "yrot").min(-180).max(180).step(10).name("Y rotation");
    gui.add(params, "zrot").min(-180).max(180).step(10).name("Z rotation");
    gui.add(params, "xmir").name("X mirror");
    gui.add(params, "ymir").name("Y mirror");
    gui.add(params, "zmir").name("Z mirror");
    gui.add(params, "multitrans").name("Multi-axis");
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "-400px";
    gui.domElement.style.left = "350px";
    gui.__controllers.forEach(function (ct) {
        ct.onChange(function (val) {
            xCopy.visible = params.xmir;
            yCopy.visible = params.ymir;
            zCopy.visible = params.zmir;
            multiCopy.visible = params.multitrans;
            calculateMirrorTransforms();
        });
    });
    scene.add(new THREE.AmbientLight(0x222222));
    var light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(200, 500, 500);
    scene.add(light);
    light = new THREE.DirectionalLight(0xdddddd, 0.9);
    light.position.set(-200, -100, -400);
    scene.add(light);
    var gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC),
        new THREE.Color(0x888888));
    scene.add(gridXZ);
    var axes = new THREE.AxisHelper(150);
    axes.scale.set(7, 7, 7);
    scene.add(axes);
    drawKnight();
}

function drawKnight() {
    var manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
        console.log(item, loaded, total);
    };
    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete) + "% downloaded");
        }
    };
    var onError = function (xhr) {
    };
    var loader = new THREE.OBJLoader(manager);
    loader.load("chessknightexport.obj", function (object) {
        knight = object.children[0];
        knight.position.x = posx;
        knight.position.y = posy;
        knight.position.z = posz;
        scene.add(knight);
        createCopies();
    }, onProgress, onError);
}

function createCopies() {
    xCopy = new THREE.Mesh(
        knight.geometry,
        new THREE.MeshLambertMaterial({
            color: 0xff0000,
            side: THREE.DoubleSide
        })
    );
    xCopy.visible = params.xmir;
    scene.add(xCopy);
    yCopy = new THREE.Mesh(
        knight.geometry,
        new THREE.MeshLambertMaterial({
            color: 0x00ff00,
            side: THREE.DoubleSide
        })
    );
    yCopy.visible = params.ymir;
    scene.add(yCopy);
    zCopy = new THREE.Mesh(
        knight.geometry,
        new THREE.MeshLambertMaterial({
            color: 0x0000ff,
            side: THREE.DoubleSide
        })
    );
    zCopy.visible = params.zmir;
    scene.add(zCopy);
    var tgTexture = new TG.Texture(256, 256).add(
        new TG.CheckerBoard().size(6, 6).tint(1, 0, 0))
        .add(new TG.CheckerBoard().size(6, 6).offset(2, 2).tint(0, 1, 0))
        .add(new TG.CheckerBoard().size(6, 6).offset(4, 4).tint(0, 0, 1))
        .sub(new TG.CheckerBoard().size(3, 3));
    var texture = new THREE.Texture(tgTexture.toCanvas());
    texture.needsUpdate = true;
    multiCopy = new THREE.Mesh(
        knight.geometry,
        new THREE.MeshLambertMaterial({
            map: texture,
            side: THREE.DoubleSide
        })
    );
    multiCopy.visible = params.multitrans;
    scene.add(multiCopy);
    xCopy.matrixAutoUpdate = false;
    yCopy.matrixAutoUpdate = false;
    zCopy.matrixAutoUpdate = false;
    multiCopy.matrixAutoUpdate = false;
    calculateMirrorTransforms();
}

function calculateMirrorTransforms() {
    // BEGIN CHANGES
    xMirrorMatrix.set(
        -1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    xCopy.matrix.identity().multiply(xMirrorMatrix).multiply(knight.matrix);
    yMirrorMatrix.set(
        1, 0, 0, 0,
        0, -1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    );
    yCopy.matrix.identity().multiply(yMirrorMatrix).multiply(knight.matrix);
    zMirrorMatrix.set(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, -1, 0,
        0, 0, 0, 1
    );
    zCopy.matrix.identity().multiply(zMirrorMatrix).multiply(knight.matrix);
    multiAxisTransformMatrix.set(
        0, 1, 0, 0,
        0, 0, -1, 0,
        -1, 0, 0, 0,
        0, 0, 0, 1
    );
    multiCopy.matrix.identity().multiply(multiAxisTransformMatrix).multiply(knight.matrix);
    // END CHANGES
}

function addToDOM() {
    var canvas = document.getElementById("canvas");
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
    update();
    window.requestAnimationFrame(animate);
    render();
}

function update() {
    if (knight) {
        knight.rotation.x = params.xrot / 180 * Math.PI;
        knight.rotation.y = params.yrot / 180 * Math.PI;
        knight.rotation.z = params.zrot / 180 * Math.PI;
        knight.position.x = posx + params.xtrans;
        knight.position.y = posy + params.ytrans;
        knight.position.z = posz + params.ztrans;
    }
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
    animate();
} catch (error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
