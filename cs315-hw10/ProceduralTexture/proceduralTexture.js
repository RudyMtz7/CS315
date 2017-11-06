"use strict";
var canvas, canvasWidth, canvasHeight, canvasRatio;
var light, gridXZ, axes, geometry;
var camera, cameraControls;
var scene, renderer, delta;
var cube1, cube2, cube3, cube4, cube5;
var tgTex1, tgTex2, tgTex3, tgTex4, yourTex;
var texture1, texture2, texture3, texture4, texture5;
var material1, material2, material3, material4, material5;
var clock = new THREE.Clock();
var size = 256;

function init() {
    canvasWidth = 600;
    canvasHeight = 400;
    canvasRatio = canvasWidth / canvasHeight;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 4000);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(30, 10, 30);
}

function fillScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x808080, 2000, 4000);
    scene.add(new THREE.AmbientLight(0x222222));
    light = new THREE.HemisphereLight(0xffffff, 0.9);
    light.position.set(20, 50, 50);
    scene.add(light);
    light = new THREE.DirectionalLight(0xffffff, 0.6);
    light.position.set(-10, 10, -40);
    scene.add(light);
    gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
    scene.add(gridXZ);
    axes = new THREE.AxisHelper(150);
    axes.scale.set(1, 1, 1);
    scene.add(axes);
    drawCubes();
}

function drawCubes() {
    /* TODO:
    For texture 1, you'll want green and black vertical stripes. You'll
    Need to use a TG.SinX generator and set appropriate frequencey and tint
    values. Check out the examples for how to do this.
    */
    // BEGIN CHANGES
    tgTex1 = new TG.Texture(size, size)
        .add(new TG.SinX().frequency(0.1).tint(0, 1, 0));
    // END CHANGES
    /* TODO:
    For texture 2, You'll have three checkerboards overlaid and offset. The
    checkerboards are red (and black), blue (and black) and green (and black). You'll
    need to set the size, offset, and tints of each checkerboard and also decide what
    function to use to combine them.
    */
    // BEGIN CHANGES
    tgTex2 = new TG.Texture(size, size)
        .add(new TG.CheckerBoard().size(64, 64).tint(0, 0, 1).offset(0, 0))
        .add(new TG.CheckerBoard().size(64, 64).tint(1, 0, 0).offset(24, 24))
        .add(new TG.CheckerBoard().size(64, 64).tint(0, 1, 0).offset(48, 48));
    // END CHANGES
    /* TODO:
    For texture 3, you'll need a couple of circles and some other components to
    generate the horizontal stripes. The larger circle is red, and the smaller circle
    is cyan. Think of what operations could be used to quickly generate a cyan overlay
    on red (the default color for a TG object is white: 1.0, 1.0, 1.0).
    */
    // BEGIN CHANGES
    tgTex3 = new TG.Texture(size, size)
        .add(new TG.Circle().position(size / 2, size / 2).tint(1, 0, 0).radius(size / 2))
        .add(new TG.Circle().position(size / 2, size / 2).tint(-1, 1, 1).radius(size / 4))
        .min(new TG.SinY().offset(-8).frequency(0.1).tint(-1, -2, -2));
    // END CHANGES
    /* TODO:
    Use TG.LinearGradient to generate a rainbow gradient using red,
    magenta, blue, cyan, green, and yellow.
    */
    // BEGIN CHANGES
    tgTex4 = new TG.Texture(size, size)
        .add(
            new TG.LinearGradient().interpolation(1)
            .point(0, [1, 0, 0, 1])
            .point(0.2, [1, 1, 0, 1])
            .point(0.4, [0, 1, 0, 1])
            .point(0.6, [0, 1, 1, 1])
            .point(0.8, [0, 0, 1, 1])
            .point(1, [1, 0, 1, 1])
        )
    // END CHANGES
    /* TODO:
    Define your own original texture. Use at least three operations or objects
    from the examples files that haven't been used in other textures in this file.
    */
    // BEGIN CHANGES
    yourTex = new TG.Texture(size, size)
        .set(new TG.FractalNoise().baseFrequency(size / 16).octaves(1).amplitude(1).tint(0, 1, 0))
        .add(new TG.XOR())
        .add(new TG.CheckerBoard().size(size / 16, size / 16).tint(1, 0, 1))
        .set(new TG.Twirl().radius(size / 2).strength(100).position(size / 2, size / 2))
        .min(new TG.Circle().position(size / 2, size / 2).radius(size / 2).delta(size / 32));
    // END CHANGES
    texture1 = new THREE.Texture(tgTex1.toCanvas());
    texture1.needsUpdate = true;
    texture2 = new THREE.Texture(tgTex2.toCanvas());
    texture2.needsUpdate = true;
    texture3 = new THREE.Texture(tgTex3.toCanvas());
    texture3.needsUpdate = true;
    texture4 = new THREE.Texture(tgTex4.toCanvas());
    texture4.needsUpdate = true;
    texture5 = new THREE.Texture(yourTex.toCanvas());
    texture5.needsUpdate = true;
    geometry = new THREE.BoxGeometry(10, 10, 10);
    material1 = new THREE.MeshLambertMaterial({
        map: texture1
    });
    material2 = new THREE.MeshLambertMaterial({
        map: texture2
    });
    material3 = new THREE.MeshLambertMaterial({
        map: texture3
    });
    material4 = new THREE.MeshLambertMaterial({
        map: texture4
    });
    material5 = new THREE.MeshLambertMaterial({
        map: texture5
    });
    cube1 = new THREE.Mesh(geometry, material1);
    scene.add(cube1);
    cube1.position.x = -8;
    cube1.position.y = 8;
    cube1.position.z = 8;
    cube2 = new THREE.Mesh(geometry, material2);
    scene.add(cube2);
    cube2.position.x = 8;
    cube2.position.y = 8;
    cube2.position.z = -8;
    cube3 = new THREE.Mesh(geometry, material3);
    scene.add(cube3);
    cube3.position.x = -8;
    cube3.position.y = -8;
    cube3.position.z = 8;
    cube4 = new THREE.Mesh(geometry, material4);
    scene.add(cube4);
    cube4.position.x = 8;
    cube4.position.y = -8;
    cube4.position.z = -8;
    cube5 = new THREE.Mesh(geometry, material5);
    scene.add(cube5);
}

function addToDOM() {
    canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    delta = clock.getDelta();
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
