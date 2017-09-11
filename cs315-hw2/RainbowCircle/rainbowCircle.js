// Basics
var scene;
var camera;
var renderer;
// Canvas
var canvasHeight;
var canvasWidth;
// Rainbow
var rainbow;
var rainbowGeometry;
var rainbowMaterial;
// Colors
var black;
var red;
var orange;
var yellow;
var green;
var blue;
var indigo;
var violet;
// Counters
var degree;
var radial;
var radian;
// Customization
var angularStep;
var radialStep;
var ringCount;
var scale;
var wired;

function initializeScene() {
    "use strict";

    // Set number of rings (values of 8n+1 work best)
    ringCount = 9;

    // Is the rainbow wire-framed?
    wired = false;

    // Set the angular step size (in degrees)
    angularStep = 1;

    // Set the radial step size
    radialStep = 0.25;

    // Set the scale (multiple of radial measure)
    scale = 1;

    if (Detector.webgl) {
        renderer = new THREE.WebGLRenderer({antialias: true});
    } else {
        renderer = new THREE.CanvasRenderer();
    }

    canvasWidth = 600;
    canvasHeight = 400;

    renderer.setClearColor(0x000000, 1);

    renderer.setSize(canvasWidth, canvasHeight);

    document.getElementById("canvas").appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 100);

    camera.position.set(0, 0, 10);

    camera.lookAt(scene.position);

    scene.add(camera);

    rainbowGeometry = new THREE.Geometry();

    // Colors
    black = new THREE.Color(0x000000);
    red = new THREE.Color(0xff0000);
    orange = new THREE.Color(0xff7f00);
    yellow = new THREE.Color(0xffff00);
    green = new THREE.Color(0x00ff00);
    blue = new THREE.Color(0x0000ff);
    indigo = new THREE.Color(0x4b0082);
    violet = new THREE.Color(0x9400d3);

    // Return color given radial count.
    function colormap(number) {
        number = number % 8;
        if (number === 0) return black;
        if (number === 1) return red;
        if (number === 2) return orange;
        if (number === 3) return yellow;
        if (number === 4) return green;
        if (number === 5) return blue;
        if (number === 6) return indigo;
        if (number === 7) return violet;
    }

    for (degree = 0; degree <= 360; degree += angularStep) {
        radian = Math.PI * (degree / 180);

        // Vertex 0 (Innermost)
        rainbowGeometry.vertices.push(new THREE.Vector3(
            Math.sin(radian) * scale,
            Math.cos(radian) * scale,
            0)
        );

        // Vertex i in [1..7]
        for (radial = 1; radial < ringCount; radial++) {
            // Vertex i
            rainbowGeometry.vertices.push(new THREE.Vector3(
                Math.sin(radian) * (1 + radial * radialStep) * scale,
                Math.cos(radian) * (1 + radial * radialStep) * scale,
                0
            ));

            // Faces Adjacent to Vertex i (after first spoke)
            if (rainbowGeometry.vertices.length > ringCount) {
                // Lower Face
                rainbowGeometry.faces.push(new THREE.Face3(
                    rainbowGeometry.vertices.length - 1,
                    rainbowGeometry.vertices.length - 2,
                    rainbowGeometry.vertices.length - (ringCount + 2)
                ));
                rainbowGeometry.faces[rainbowGeometry.faces.length - 1].vertexColors[0] = colormap(radial);
                rainbowGeometry.faces[rainbowGeometry.faces.length - 1].vertexColors[1] = colormap(radial-1);
                rainbowGeometry.faces[rainbowGeometry.faces.length - 1].vertexColors[2] = colormap(radial-1);
                // Upper Face
                rainbowGeometry.faces.push(new THREE.Face3(
                    rainbowGeometry.vertices.length - 1,
                    rainbowGeometry.vertices.length - (ringCount + 1),
                    rainbowGeometry.vertices.length - (ringCount + 2))
                );
                rainbowGeometry.faces[rainbowGeometry.faces.length - 1].vertexColors[0] = colormap(radial);
                rainbowGeometry.faces[rainbowGeometry.faces.length - 1].vertexColors[1] = colormap(radial);
                rainbowGeometry.faces[rainbowGeometry.faces.length - 1].vertexColors[2] = colormap(radial-1);
            }

        }
    }

    rainbowMaterial = new THREE.MeshBasicMaterial({
        vertexColors: THREE.VertexColors,
        wireframe: wired,
        side: THREE.DoubleSide
    });

    rainbow = new THREE.Mesh(rainbowGeometry, rainbowMaterial);

    scene.add(rainbow);
}

function renderScene() {
    renderer.render(scene, camera);
}

initializeScene();
renderScene();
