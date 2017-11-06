"use strict";
var scene, renderer, gui, params;
var camera, cameraControls;
var plane0, plane1, plane2, plane3;
var wf0, wf1, wf2, wf3;
var clock = new THREE.Clock();

// Useful Points
var AA = new THREE.Vector2(0, 0);
var AB = new THREE.Vector2(0, 0.5);
var AC = new THREE.Vector2(0, 1);
var BA = new THREE.Vector2(0.5, 0);
var BB = new THREE.Vector2(0.5, 0.5);
var BC = new THREE.Vector2(0.5, 1);
var CA = new THREE.Vector2(1, 0);
var CB = new THREE.Vector2(1, 0.5);
var CC = new THREE.Vector2(1, 1);

function init() {
    var canvasWidth = 600;
    var canvasHeight = 400;
    var canvasRatio = canvasWidth / canvasHeight;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 4000);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(-300, 300, 1200);
    cameraControls.target.set(0, 50, 0);
}

function fillScene() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x808080, 2000, 4000);
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        gap: 20,
        angle: 0,
        wire: false
    };
    gui.add(params, 'angle').min(0).max(90).step(5).name('Rotation');
    gui.add(params, 'gap').min(0).max(40).step(1).name('Gap');
    gui.add(params, 'wire').name('Wireframe');
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "-400px";
    gui.domElement.style.left = "350px";
    var light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(200, 500, 500);
    scene.add(light);
    light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(-200, -100, -400);
    scene.add(light);
    var axes = new THREE.AxisHelper(150);
    axes.scale.set(7, 7, 7);
    scene.add(axes);
    drawPlanes();
}

function drawPlanes() {
    var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 30,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 5,
        polygonOffsetUnits: 5,
        map: new THREE.TextureLoader().load("yoda.jpg")
    });
    plane0 = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), material);
    plane1 = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), material);
    plane2 = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), material);
    plane3 = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), material);
    plane0.position.z = plane1.position.z = plane2.position.z = plane3.position.z = -50;

    // BEGIN CHANGES

    /* Bottom Left */
    plane0.geometry.faceVertexUvs[0][0] = [AB.clone(), AA.clone(), BB.clone()];
    plane0.geometry.faceVertexUvs[0][1] = [AA.clone(), BA.clone(), BB.clone()];

    /* Top Left */
    plane1.geometry.faceVertexUvs[0][0] = [AC.clone(), AB.clone(), BC.clone()];
    plane1.geometry.faceVertexUvs[0][1] = [AB.clone(), BB.clone(), BC.clone()];

    /* Top Right */
    plane2.geometry.faceVertexUvs[0][0] = [BC.clone(), BB.clone(), CC.clone()];
    plane2.geometry.faceVertexUvs[0][1] = [BB.clone(), CB.clone(), CC.clone()];

    /* Bottom Right */
    plane3.geometry.faceVertexUvs[0][0] = [BB.clone(), BA.clone(), CB.clone()];
    plane3.geometry.faceVertexUvs[0][1] = [BA.clone(), CA.clone(), CB.clone()];

    // END CHANGES

    scene.add(plane0);
    scene.add(plane1);
    scene.add(plane2);
    scene.add(plane3);
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
    updatePlanes();
    window.requestAnimationFrame(animate);
    render();
}

function updatePlanes() {
    if (params.wire) {
        var wfMat = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 2
        });
        wf0 = new THREE.LineSegments(plane0.geometry, wfMat);
        plane0.add(wf0);
        wf1 = new THREE.LineSegments(plane1.geometry, wfMat);
        plane1.add(wf1);
        wf2 = new THREE.LineSegments(plane2.geometry, wfMat);
        plane2.add(wf2);
        wf3 = new THREE.LineSegments(plane3.geometry, wfMat);
        plane3.add(wf3);
    } else {
        var i;
        for (i = plane0.children.length - 1; i >= 0; i--) {
            plane0.remove(plane0.children[i]);
            plane1.remove(plane1.children[i]);
            plane2.remove(plane2.children[i]);
            plane3.remove(plane3.children[i]);
        }
    }
    plane0.position.x = -(250 + params.gap / 2);
    plane0.position.y = -(250 + params.gap / 2);
    plane1.position.x = -(250 + params.gap / 2);
    plane1.position.y = (250 + params.gap / 2);
    plane2.position.x = (250 + params.gap / 2);
    plane2.position.y = (250 + params.gap / 2);
    plane3.position.x = (250 + params.gap / 2);
    plane3.position.y = -(250 + params.gap / 2);

    // BEGIN CHANGES

    var t = params.angle / 90;

    /* Upper Bottom Left */
    plane0.geometry.faceVertexUvs[0][0][0].set(0, 0)
        .addVectors(AB.clone().multiplyScalar(1 - t), BA.clone().multiplyScalar(t));
    plane0.geometry.faceVertexUvs[0][0][1].set(0, 0)
        .addVectors(AA.clone().multiplyScalar(1 - t), CA.clone().multiplyScalar(t));
    plane0.geometry.faceVertexUvs[0][0][2].set(0, 0)
        .addVectors(BB.clone().multiplyScalar(1 - t), BB.clone().multiplyScalar(t));

    /* Lower Bottom Left */
    plane0.geometry.faceVertexUvs[0][1][0].set(0, 0)
        .addVectors(AA.clone().multiplyScalar(1 - t), CA.clone().multiplyScalar(t));
    plane0.geometry.faceVertexUvs[0][1][1].set(0, 0)
        .addVectors(BA.clone().multiplyScalar(1 - t), CB.clone().multiplyScalar(t));
    plane0.geometry.faceVertexUvs[0][1][2].set(0, 0)
        .addVectors(BB.clone().multiplyScalar(1 - t), BB.clone().multiplyScalar(t));

    /* Update Bottom Left */
    plane0.geometry.uvsNeedUpdate = true;

    /* Upper Top Left */
    plane1.geometry.faceVertexUvs[0][0][0].set(0, 0)
        .addVectors(AC.clone().multiplyScalar(1 - t), AA.clone().multiplyScalar(t));
    plane1.geometry.faceVertexUvs[0][0][1].set(0, 0)
        .addVectors(AB.clone().multiplyScalar(1 - t), BA.clone().multiplyScalar(t));
    plane1.geometry.faceVertexUvs[0][0][2].set(0, 0)
        .addVectors(BC.clone().multiplyScalar(1 - t), AB.clone().multiplyScalar(t));

    /* Lower Top Left */
    plane1.geometry.faceVertexUvs[0][1][0].set(0, 0)
        .addVectors(AB.clone().multiplyScalar(1 - t), BA.clone().multiplyScalar(t));
    plane1.geometry.faceVertexUvs[0][1][1].set(0, 0)
        .addVectors(BB.clone().multiplyScalar(1 - t), BB.clone().multiplyScalar(t));
    plane1.geometry.faceVertexUvs[0][1][2].set(0, 0)
        .addVectors(BC.clone().multiplyScalar(1 - t), AB.clone().multiplyScalar(t));

    /* Update Top Left */
    plane1.geometry.uvsNeedUpdate = true;

    /* Upper Top Right */
    plane2.geometry.faceVertexUvs[0][0][0].set(0, 0)
        .addVectors(BC.clone().multiplyScalar(1 - t), AB.clone().multiplyScalar(t));
    plane2.geometry.faceVertexUvs[0][0][1].set(0, 0)
        .addVectors(BB.clone().multiplyScalar(1 - t), BB.clone().multiplyScalar(t));
    plane2.geometry.faceVertexUvs[0][0][2].set(0, 0)
        .addVectors(CC.clone().multiplyScalar(1 - t), AC.clone().multiplyScalar(t));

    /* Lower Top Right */
    plane2.geometry.faceVertexUvs[0][1][0].set(0, 0)
        .addVectors(BB.clone().multiplyScalar(1 - t), BB.clone().multiplyScalar(t));
    plane2.geometry.faceVertexUvs[0][1][1].set(0, 0)
        .addVectors(CB.clone().multiplyScalar(1 - t), BC.clone().multiplyScalar(t));
    plane2.geometry.faceVertexUvs[0][1][2].set(0, 0)
        .addVectors(CC.clone().multiplyScalar(1 - t), AC.clone().multiplyScalar(t));

    /* Update Top Right */
    plane2.geometry.uvsNeedUpdate = true;

    /* Upper Bottom Right */
    plane3.geometry.faceVertexUvs[0][0][0].set(0, 0)
        .addVectors(BB.clone().multiplyScalar(1 - t), BB.clone().multiplyScalar(t));
    plane3.geometry.faceVertexUvs[0][0][1].set(0, 0)
        .addVectors(BA.clone().multiplyScalar(1 - t), CB.clone().multiplyScalar(t));
    plane3.geometry.faceVertexUvs[0][0][2].set(0, 0)
        .addVectors(CB.clone().multiplyScalar(1 - t), BC.clone().multiplyScalar(t));

    /* Lower Bottom Right */
    plane3.geometry.faceVertexUvs[0][1][0].set(0, 0)
        .addVectors(BA.clone().multiplyScalar(1 - t), CB.clone().multiplyScalar(t));
    plane3.geometry.faceVertexUvs[0][1][1].set(0, 0)
        .addVectors(CA.clone().multiplyScalar(1 - t), CC.clone().multiplyScalar(t));
    plane3.geometry.faceVertexUvs[0][1][2].set(0, 0)
        .addVectors(CB.clone().multiplyScalar(1 - t), BC.clone().multiplyScalar(t));

    /* Update Bottom Right */
    plane3.geometry.uvsNeedUpdate = true;

    // END CHANGES
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
