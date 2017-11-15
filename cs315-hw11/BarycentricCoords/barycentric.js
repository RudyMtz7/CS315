"use strict";
var camera, scene, renderer, cameraControls, canvasWidth, canvasHeight;
var v1, v2, v3, p, t1, t2, t3, tri, b1, b2, b3, triNormal, center, inTriangle;
var v1label, v2label, v3label, plabel;
var objects = [];
var plane = new THREE.Plane(),
    mouse = new THREE.Vector2(),
    offset = new THREE.Vector3(),
    intersection = new THREE.Vector3(),
    INTERSECTED, SELECTED;
var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var clock = new THREE.Clock();

function init() {
    canvasWidth = 600;
    canvasHeight = 400;
    var canvasRatio = canvasWidth / canvasHeight;
    b1 = 0.33;
    b2 = 0.33;
    b3 = 0.33;
    inTriangle = true;
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
    cameraControls.target.set(4, 301, 92);
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
    plabel = document.createElement('div');
    plabel.style.position = 'absolute';
    plabel.style['pointer-events'] = 'none';
    plabel.style.width = 100;
    plabel.style.height = 50;
}

function fillScene() {
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
    drawTriangle();
}

function drawTriangle() {
    v1 = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0xff0000 }));
    v1.position.x = 100;
    v1.position.y = 520;
    v1.position.z = 200;
    scene.add(v1);
    v2 = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0x00ff00 }));
    v2.position.x = 100;
    v2.position.y = 300;
    v2.position.z = -200;
    scene.add(v2);
    v3 = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 12),
        new THREE.MeshLambertMaterial({ color: 0x0000ff }));
    v3.position.x = -50;
    v3.position.y = -50;
    v3.position.z = 300;
    scene.add(v3);
    center = new THREE.Vector3((v1.position.x + v2.position.x + v3.position.x) / 3,
        (v1.position.y + v2.position.y + v3.position.y) / 3,
        (v1.position.z + v2.position.z + v3.position.z) / 3);
    p = new THREE.Mesh(new THREE.SphereGeometry(40, 12, 12),
        new THREE.MeshLambertMaterial());
    p.position.copy(center);
    p.material.color.setRGB(b1, b2, b3);
    scene.add(p);
    var geo = new THREE.Geometry();
    geo.vertices = [v1.position, v2.position, v3.position];
    geo.faces = [new THREE.Face3(0, 1, 2)];
    tri = new THREE.Mesh(geo,
        new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            wireframeLinewidth: 2,
            side: THREE.DoubleSide
        }));
    scene.add(tri);
    triNormal = new THREE.Line(new THREE.Geometry(),
        new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 2
        }));
    scene.add(triNormal);
    geo = new THREE.Geometry();
    geo.vertices = [v2.position, v3.position, p.position];
    geo.faces = [new THREE.Face3(0, 1, 2)];
    t1 = new THREE.Mesh(geo,
        new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        }));
    scene.add(t1);
    geo = new THREE.Geometry();
    geo.vertices = [v1.position, p.position, v3.position];
    geo.faces = [new THREE.Face3(0, 1, 2)];
    t2 = new THREE.Mesh(geo,
        new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        }));
    scene.add(t2);
    geo = new THREE.Geometry();
    geo.vertices = [v2.position, p.position, v1.position];
    geo.faces = [new THREE.Face3(0, 1, 2)];
    t3 = new THREE.Mesh(geo,
        new THREE.MeshBasicMaterial({
            color: 0x0000ff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        }));
    scene.add(t3);
    objects = [v1, v2, v3, p];
}

function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
}

function animate() {
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    var delta = clock.getDelta();
    cameraControls.update(delta);
    tri.geometry.vertices = [v1.position, v2.position, v3.position]
    tri.geometry.verticesNeedUpdate = true;
    t1.geometry.vertices = [v2.position, v3.position, p.position];
    t1.geometry.verticesNeedUpdate = true;
    t2.geometry.vertices = [v1.position, p.position, v3.position];;
    t2.geometry.verticesNeedUpdate = true;
    t3.geometry.vertices = [v2.position, p.position, v1.position];
    t3.geometry.verticesNeedUpdate = true;
    t1.visible = t2.visible = t3.visible = inTriangle;
    center.set((v1.position.x + v2.position.x + v3.position.x) / 3,
        (v1.position.y + v2.position.y + v3.position.y) / 3,
        (v1.position.z + v2.position.z + v3.position.z) / 3);
    tri.geometry.computeFaceNormals();
    triNormal.geometry.vertices = [
        center.clone(),
        center.clone().add(tri.geometry.faces[0].normal.multiplyScalar(250))
    ];
    triNormal.geometry.verticesNeedUpdate = true;
    if (inTriangle) {
        p.material.color.setRGB(b1, b2, b3);
    } else {
        p.material.color.setRGB(0, 0, 0);
    }
    camera.updateMatrixWorld();
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
    plabel.style.top = (toXYCoords(p.position).y + $("#canvas").offset().top + 10) + 'px';
    plabel.style.left = (toXYCoords(p.position).x + $("#canvas").offset().left + 10) + 'px';
    plabel.innerHTML =
        Math.round(p.position.x) + ", " +
        Math.round(p.position.y) + ", " +
        Math.round(p.position.z);
    document.body.appendChild(plabel);
    renderer.render(scene, camera);
}

function toXYCoords(pos) {
    var vector = pos.clone().project(camera);
    vector.x = (vector.x + 1) / 2 * canvasWidth;
    vector.y = -(vector.y - 1) / 2 * canvasHeight;
    return vector;
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

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.set(
        ((event.clientX / window.innerWidth) * 2 - 1) *
        (window.innerWidth / canvasWidth),
        (-((event.clientY - ($("#canvas").position().top + (canvasHeight / 2))) / window.innerHeight) * 2) *
        (window.innerHeight / canvasHeight));
    raycaster.setFromCamera(mouse, camera);
    if (SELECTED) {
        if (SELECTED === p) {
            plane.setFromCoplanarPoints(
                tri.geometry.vertices[0],
                tri.geometry.vertices[1],
                tri.geometry.vertices[2]);
            recalculateBarycentricCoords();
        }
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            SELECTED.position.copy(intersection.sub(offset));
        }
        if (SELECTED != p) {
            p.position.x = (v1.position.x * b1 + v2.position.x * b2 + v3.position.x * b3);
            p.position.y = (v1.position.y * b1 + v2.position.y * b2 + v3.position.y * b3);
            p.position.z = (v1.position.z * b1 + v2.position.z * b2 + v3.position.z * b3);
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

function recalculateBarycentricCoords() {
    // BEGIN CHANGES
    var boundary1 = v3.position.clone().sub(v2.position);
    var boundary2 = v1.position.clone().sub(v3.position);
    var boundary3 = v2.position.clone().sub(v1.position);

    var edge1 = p.position.clone().sub(v1.position);
    var edge2 = p.position.clone().sub(v2.position);
    var edge3 = p.position.clone().sub(v3.position);

    var b13Cross = boundary1.clone().cross(edge3.clone());
    var b21Cross = boundary2.clone().cross(edge1.clone());
    var b32Cross = boundary3.clone().cross(edge2.clone());

    var other = boundary1.clone().cross(boundary2.clone());

    var total = other.clone().normalize();

    var triangle1 = total.dot(other) / 2;
    var triangle2 = total.dot(b13Cross) / 2;
    var triangle3 = total.dot(b21Cross) / 2;
    var triangle4 = total.dot(b32Cross) / 2;

    b1 = triangle2 / triangle1;
    b2 = triangle3 / triangle1;
    b3 = triangle4 / triangle1;

    if (b1 < 0 || b2 < 0 || b3 < 0 || b1 > 1 || b2 > 1 || b3 > 1) inTriangle = false;
    else inTriangle = true;
    // END CHANGES
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