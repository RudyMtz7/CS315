"use strict";

// CORE VARIABLES
var canvas, context, imageBuffer;
var DEBUG = false; // whether to show debug messages
var EPSILON = 0.00001; // error margins

// scene to render
var scene, camera, surfaces, materials, lights; // etc...

var Camera = function(eye, at, up, fovy, aspect) {
    this.eye = new THREE.Vector3().fromArray(eye);
    this.at = new THREE.Vector3().fromArray(at);
    this.up = new THREE.Vector3().fromArray(up);
    // wVec points backwards from the camera
    this.wVec = new THREE.Vector3().subVectors(this.eye, this.at).normalize();
    // uVec points to the side of the camera
    this.uVec = new THREE.Vector3().crossVectors(this.up, this.wVec).normalize();
    // vVec points upwards local to the camera
    this.vVec = new THREE.Vector3().crossVectors(this.wVec, this.uVec).normalize();
    this.fovy = fovy;
    this.aspect = aspect;
    this.halfCameraHeight = Math.tan(rad(this.fovy / 2.0));
    this.halfCameraWidth = this.halfCameraHeight * this.aspect;
    this.cameraWidth = 2 * this.halfCameraWidth;
    this.cameraHeight = 2 * this.halfCameraHeight;
    // The size of individual pixels in 3d space;
    // to position the points for the rays to pass through.
    this.pixelHeight = this.cameraHeight / (canvas.height - 1);
    this.pixelWidth = this.cameraWidth / (canvas.width - 1);
}

Camera.prototype.castRay = function(x, y) {
    // compute parametric line from eye point to pixel point
    var u = (x * this.pixelWidth) - this.halfCameraWidth;
    var v = this.halfCameraHeight - (y * this.pixelHeight);
    // the u (side) component to the pixel
    var uComp = this.uVec.clone().multiplyScalar(u);
    // the v (up) component to the pixel
    var vComp = this.vVec.clone().multiplyScalar(v);
    var vSum1 = new THREE.Vector3().addVectors(uComp, vComp);
    // ray.direction
    var ray = {
        "origin": this.eye,
        "direction": new THREE.Vector3().addVectors(
            vSum1,
            this.wVec.clone().multiplyScalar(-1)
        )
    }
    var color = [0, 0, 0];
    for (var i = 0; i < surfaces.length; i++) {
        if (surfaces[i].intersects(ray)) color = [1, 1, 1];
    }
    // TODO - calculate the intersection of that ray with the scene
    // TODO - set the pixel to be the color of that intersection (using setPixel() method)
    // render the pixels that have been set
    // color = trace(ray, ... );
    setPixel(x, y, color);
}

var Light = function(source, color) {
    this.source = source;
    this.color = color;
}

var Material = function(name, shininess, ka, kd, ks, kr) {
    this.name = name;
    this.shininess = shininess;
    this.ka = ka;
    this.kd = kd;
    this.ks = ks;
    this.kr = kr;
}

var Surface = function(mat, objname, transforms) {
    this.mat = mat;
    this.objname = objname;
    this.transforms = transforms;
}

var Sphere = function(mat, center, radius, objname, transforms) {
    Surface.call(this, mat, objname, transforms);
    this.center = new THREE.Vector3().fromArray(center);
    this.radius = radius;
}

Sphere.prototype.intersects = function(ray) {
    if (DEBUG) console.log(ray);
    if (DEBUG) console.log(this);
    var farRay = new THREE.Vector3().addVectors(ray.origin, ray.direction.clone().normalize().multiplyScalar(5000));
    var radius = this.radius;
    var end, direction, t;
    end = new THREE.Vector3().subVectors(this.center, ray.origin);
    direction = new THREE.Vector3().subVectors(ray.origin, farRay).normalize();
    t = end.dot(direction) - Math.sqrt(radius * radius - end.dot(end) + end.dot(direction) * end.dot(direction));
    var intersect1 = new THREE.Vector3().copy(direction).multiplyScalar(t).add(ray.origin);
    end = new THREE.Vector3().subVectors(this.center, farRay);
    direction = new THREE.Vector3().subVectors(farRay, ray.origin).normalize();
    t = end.dot(direction) - Math.sqrt(radius * radius - end.dot(end) + end.dot(direction) * end.dot(direction));
    var intersect2 = new THREE.Vector3().copy(direction).multiplyScalar(t).add(farRay);
    if (intersect1.distanceTo(this.center) < this.radius + EPSILON || intersect2.distanceTo(this.center) < this.radius + EPSILON) return true;
    else return false;
}

var Triangle = function(mat, p1, p2, p3, objname, transforms) {
    Surface.call(this, mat, objname, transforms);
    this.p1 = new THREE.Vector3().fromArray(p1);
    this.p2 = new THREE.Vector3().fromArray(p2);
    this.p3 = new THREE.Vector3().fromArray(p3);
}

Triangle.prototype.intersects = function(ray) {
    // Möller–Trumbore intersection algorithm
    // https://en.wikipedia.org/wiki/M%C3%B6ller%E2%80%93Trumbore_intersection_algorithm
    // https://www.scratchapixel.com/lessons/3d-basic-rendering/ray-tracing-rendering-a-triangle/moller-trumbore-ray-triangle-intersection
    var edge1 = new THREE.Vector3().subVectors(this.p2, this.p1);
    var edge2 = new THREE.Vector3().subVectors(this.p3, this.p1);
    var h = new THREE.Vector3().crossVectors(ray.direction, edge2);
    var a = edge1.dot(h);
    if (-EPSILON < a && a < EPSILON) return false;
    var f = 1 / a;
    var s = new THREE.Vector3().subVectors(ray.origin, this.p1);
    var u = s.dot(h) * f;
    if (1 < u || u < 0) return false;
    var q = new THREE.Vector3().crossVectors(s, edge1);
    var v = f * ray.direction.dot(q);
    if (1 < u + v || v < 0) return false;
    var t = f * edge2.dot(q);
    if (EPSILON < t) return true;
    else return false;
}

// initializes the canvas and drawing buffers
function init() {
    canvas = $('#canvas')[0];
    context = canvas.getContext("2d");
    imageBuffer = context.createImageData(canvas.width, canvas.height); // buffer for pixels
    loadSceneFile("assets/SphereTest.json");
}

// loads and "parses" the scene file at the given path
function loadSceneFile(filepath) {
    scene = Utils.loadJSON(filepath); // load the scene
    // Setup camera.
    camera = new Camera(scene.camera.eye, scene.camera.at, scene.camera.up, scene.camera.fovy, scene.camera.aspect);
    // Setup lights.
    lights = [];
    for (var i = 0; i < scene.lights.length; i++) {
        var current = scene.lights[i];
        lights.push(new Light(
            current.source,
            current.color
        ));
        if (current.source === "Point") lights[lights.length - 1].position = current.position;
        if (current.source === "Directional") lights[lights.length - 1].direction = current.direction;
    }
    // Setup materials.
    materials = [];
    for (var i = 0; i < scene.materials.length; i++) {
        var current = scene.materials[i];
        materials.push(new Material(
            current.name,
            current.shininess,
            current.ka,
            current.kd,
            current.ks,
            current.kr
        ));
    }
    // Setup surfaces.
    surfaces = [];
    for (var i = 0; i < scene.surfaces.length; i++) {
        var current = scene.surfaces[i];
        if (current.shape === "Sphere") {
            surfaces.push(new Sphere(
                current.material,
                current.center,
                current.radius,
                current.name,
                current.transforms
            ));
        } else if (current.shape === "Triangle") {
            surfaces.push(new Triangle(
                current.material,
                current.p1,
                current.p2,
                current.p3,
                current.name,
                current.transforms
            ));
        } else {
            console.log("Invalid shape: " + current.shape);
        }
    }
    render(); // render the scene
}

// renders the scene
function render() {
    var start = Date.now(); // for logging
    // TODO - fire a ray though each pixel
    for (var x = 0; x < canvas.width; x++) {
        for (var y = 0; y < canvas.height; y++) {
            camera.castRay(x, y);
        }
    }
    context.putImageData(imageBuffer, 0, 0);
    var end = Date.now(); // for logging
    $('#log').html("Rendered in: " + (end - start) + "ms");
    console.log("Rendered in: " + (end - start) + "ms");
}

// Sets the pixel at the given (x, y) screen coordinates to the given color.
// @param {int} x           The x-coordinate of the pixel.
// @param {int} y           The y-coordinate of the pixel.
// @param {float[3]} color  A length-3 array (or a vec3) representing the color.
//                          Color values should floating point values between 0 and 1.
function setPixel(x, y, color) {
    var i = (y * imageBuffer.width + x) * 4;
    imageBuffer.data[i] = (color[0] * 255) | 0;
    imageBuffer.data[i + 1] = (color[1] * 255) | 0;
    imageBuffer.data[i + 2] = (color[2] * 255) | 0;
    imageBuffer.data[i + 3] = 255; // (color[3] * 255) | 0; // switch to include transparency
}

// converts degrees to radians
function rad(degrees) {
    return degrees * Math.PI / 180;
}

// on document load, run the application
$(document).ready(function() {
    init();
    render();
    // load and render new scene
    $('#load_scene_button').click(function() {
        var filepath = 'assets/' + $('#scene_file_input').val() + '.json';
        loadSceneFile(filepath);
    });
    // debugging - cast a ray through the clicked pixel with DEBUG messaging on
    $('#canvas').click(function(e) {
        var x = e.pageX - $('#canvas').offset().left;
        var y = e.pageY - $('#canvas').offset().top;
        DEBUG = true;
        camera.castRay(x, y); // cast a ray through the point
        DEBUG = false;
    });
});
