"use strict";
var camera, renderer, params, gui;
var segment, segmentGeo, segmentMat;
var endPoint1, endPoint2;
var objects;
var canvasWidth, canvasHeight;
var INTERSECTED, SELECTED;
var INSIDE = 0; // 0000
var LEFT = 1;   // 0001
var RIGHT = 2;  // 0010
var BOTTOM = 4; // 0100
var TOP = 8;    // 1000
var xmin = -150;
var xmax = 150;
var ymin = -100;
var ymax = 100;
var red = new THREE.Color(0xff0000);
var green = new THREE.Color(0x00ff00);
var yellow = new THREE.Color(0xffff00);
var clock = new THREE.Clock();
var plane = new THREE.Plane();
var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var scene = new THREE.Scene();
var mouse = new THREE.Vector2();
var intersection = new THREE.Vector3();
var offset = new THREE.Vector3();

function checkForClipping() {
    // BEGIN CHANGES
    if (!(endPoint1.code | endPoint2.code)) { // If neither code has any bits set
        segment.material = new THREE.LineBasicMaterial({color: green}); // Green
        segment.visible = true; // Visible
    } else if (endPoint1.code & endPoint2.code) { // If there is some bit set in both
        segment.material = new THREE.LineBasicMaterial({color: red}); // Red
        if (params.clipping) segment.visible = false; // Hidden if clipping
    } else { // Otherwise, they may go through the middle
        segment.material = new THREE.LineBasicMaterial({color: yellow}); // Yellow
        segment.visible = true; // Visible
        if (params.clipping) doClipping(); // Clip if required
    }
    // END CHANGES
}

function doClipping() {
    /* TODO:
    Here you'll clip one endpoint at the nearest intersection with an edge by calculating
    the intersection and setting the point's position to that point.
    This function will only calculate one clipping point, then it will check again whether
    further clipping is needed.
    In order to determine which endpoint to clip, check them one at a time. If endPoint1
    needs clipping, clip it. If it doesn't, clip endPoint2. If they both do, the
    recursive call to checkForClipping() will handle both cases one at a time.
    When you have set the clipped endpoint's coordinates to the intersection point,
    be sure to update the line segment's geometry with these lines:
    segment.geometry.vertices = [endPoint1.position, endPoint2.position];
    segment.geometry.verticesNeedUpdate = true;
    Also, be sure that you re-set the code for the newly clipped endpoint, or the
    recursive checkForClipping() call will blow up the stack.
    */
    // BEGIN CHANGES
    var oldx, oldy;
    var slope = ((endPoint1.position.y - endPoint2.position.y)/(endPoint1.position.x - endPoint2.position.x));
    if (params.clipping){
        // Update endPoint1
        if (endPoint1.code !== INSIDE) {
            oldx = endPoint1.position.x;
            oldy = endPoint1.position.y;
            if (endPoint1.code & LEFT) {
                endPoint1.position.x = xmin;
                endPoint1.position.y = oldy - (oldx - xmin) * slope;
            } else if (endPoint1.code & RIGHT) {
                endPoint1.position.x = xmax;
                endPoint1.position.y = oldy - (oldx - xmax) * slope;
            }
            oldx = endPoint1.position.x;
            oldy = endPoint1.position.y;
            if (endPoint1.code & BOTTOM) {
                endPoint1.position.y = ymin;
                endPoint1.position.x = oldx - (oldy - ymin) * slope;
            } else if (endPoint1.code & TOP) {
                endPoint1.position.y = ymax;
                endPoint1.position.x = oldx - (oldy - ymax) * slope;
            }
            segment.geometry.vertices = [endPoint1.position, endPoint2.position];
            segment.geometry.verticesNeedUpdate = true;
            setCode(endPoint1);
        }
        // Update endPoint2
        else if (endPoint2.code !== INSIDE) {
            oldx = endPoint2.position.x;
            oldy = endPoint2.position.y;
            if (endPoint2.code & LEFT) {
                endPoint2.position.x = xmin;
                endPoint2.position.y = oldy - (oldx - xmin) * slope;
            } else if (endPoint2.code & RIGHT) {
                endPoint2.position.x = xmax;
                endPoint2.position.y = oldy - (oldx - xmax) * slope;
            }
            oldx = endPoint2.position.x;
            oldy = endPoint2.position.y;
            if (endPoint2.code & BOTTOM) {
                endPoint2.position.y = ymin;
                endPoint2.position.x = oldx - (oldy - ymin) * slope;
            } else if (endPoint2.code & TOP) {
                endPoint2.position.y = ymax;
                endPoint2.position.x = oldx - (oldy - ymax) * slope;
            }
            segment.geometry.vertices = [endPoint1.position, endPoint2.position];
            segment.geometry.verticesNeedUpdate = true;
            setCode(endPoint2);
        }
    }
    // END CHANGES
}

function setCode(endpoint) {
    // BEGIN CHANGES
    var code = INSIDE;
    if (endpoint.position.x < xmin) code = code | LEFT;
    if (endpoint.position.x > xmax) code = code | RIGHT;
    if (endpoint.position.y < ymin) code = code | BOTTOM;
    if (endpoint.position.y > ymax) code = code | TOP;
    endpoint.code = code;
    // END CHANGES
}

function init() {
    canvasWidth = 600;
    canvasHeight = 400;
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);
    renderer.domElement.addEventListener("mousemove", onDocumentMouseMove, false);
    renderer.domElement.addEventListener("mousedown", onDocumentMouseDown, false);
    renderer.domElement.addEventListener("mouseup", onDocumentMouseUp, false);
    camera = new THREE.OrthographicCamera(canvasWidth / -2, canvasWidth / 2, canvasHeight / 2, canvasHeight / -2, 1, 1000);
    camera.position.set(0, 0, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);
}

function fillScene() {
    scene.fog = new THREE.Fog(0x808080, 2000, 4000);
    gui = new dat.GUI({
        autoPlace: false,
        height: (32 * 3) - 1
    });
    params = {
        clipping: false
    };
    gui.add(params, "clipping").name("Clipping");
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
    drawClippingFrame();
}

function drawClippingFrame() {
    var lineMat = new THREE.LineBasicMaterial({
        color: 0xffffff
    });
    var edge1Geo = new THREE.Geometry();
    edge1Geo.vertices.push(
        new THREE.Vector3().set(xmin, ymax, 0),
        new THREE.Vector3().set(xmax, ymax, 0)
    );
    var edge1 = new THREE.Line(edge1Geo, lineMat);
    var edge2Geo = new THREE.Geometry();
    edge2Geo.vertices.push(
        new THREE.Vector3().set(xmin, ymax, 0),
        new THREE.Vector3().set(xmin, ymin, 0)
    );
    var edge2 = new THREE.Line(edge2Geo, lineMat);
    var edge3Geo = new THREE.Geometry();
    edge3Geo.vertices.push(
        new THREE.Vector3().set(xmax, ymax, 0),
        new THREE.Vector3().set(xmax, ymin, 0)
    );
    var edge3 = new THREE.Line(edge3Geo, lineMat);
    var edge4Geo = new THREE.Geometry();
    edge4Geo.vertices.push(
        new THREE.Vector3().set(xmin, ymin, 0),
        new THREE.Vector3().set(xmax, ymin, 0)
    );
    var edge4 = new THREE.Line(edge4Geo, lineMat);
    scene.add(edge1);
    scene.add(edge2);
    scene.add(edge3);
    scene.add(edge4);
    endPoint1 = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 12),
        new THREE.MeshLambertMaterial({
            color: 0x777777
        }));
    scene.add(endPoint1);
    endPoint1.position.x = 150;
    setCode(endPoint1);
    endPoint2 = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 12),
        new THREE.MeshLambertMaterial({
            color: 0x777777
        }));
    scene.add(endPoint2);
    endPoint2.position.y = 150;
    setCode(endPoint2);
    segmentMat = new THREE.LineBasicMaterial({
        color: 0x000000
    });
    segmentGeo = new THREE.Geometry();
    segmentGeo.vertices.push(
        new THREE.Vector3().copy(endPoint1.position),
        new THREE.Vector3().copy(endPoint2.position)
    );
    segment = new THREE.Line(segmentGeo, segmentMat);
    scene.add(segment);
    objects = [endPoint1, endPoint2];
    animate();
}

function animate() {
    checkForClipping();
    window.requestAnimationFrame(animate);
    render();
}

function render() {
    var delta = clock.getDelta();
    renderer.render(scene, camera);
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
            segment.geometry.vertices = [endPoint1.position, endPoint2.position];
            segment.geometry.verticesNeedUpdate = true;
            setCode(SELECTED);
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
        SELECTED = intersects[0].object;
        if (raycaster.ray.intersectPlane(plane, intersection)) {
            offset.copy(intersection).sub(SELECTED.position);
        }
        canvas.style.cursor = "move";
    }
}

function onDocumentMouseUp(event) {
    event.preventDefault();
    if (INTERSECTED) {
        SELECTED = null;
    }
    canvas.style.cursor = "auto";
}

function addToDOM() {
    var canvas = document.getElementById("canvas");
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

try {
    init();
    fillScene();
    addToDOM();
} catch (error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
