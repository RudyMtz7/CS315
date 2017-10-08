var camera, scene, renderer;
var cameraControls;
var canvasWidth = 600;
var canvasHeight = 400;
var canvasPad = 15;
var canvas = document.getElementById('canvas');
var clock = new THREE.Clock();
var spinner;
var loaded = false;
var spinSpeed = 0;
var spinAngle = 0;
var spinAxis = new THREE.Vector3(0, 1, 0);
var swipeCross = new THREE.Vector3();
var deceleration = 0.02;
var spinFloor = 0.005;
var speedCoefficient = 0.05;

function fillScene() {
    var imagePrefix = "../../images/airport/sky-";
    var imageSuffix = ".png";
    var urls = [imagePrefix + "xpos" + imageSuffix, imagePrefix + "xneg" + imageSuffix,
        imagePrefix + "ypos" + imageSuffix, imagePrefix + "yneg" + imageSuffix,
        imagePrefix + "zpos" + imageSuffix, imagePrefix + "zneg" + imageSuffix
    ];
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x808080, 2000, 4000);
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 2);
    scene.add(light);
    var light = new THREE.DirectionalLight(0xffffff, 0.8);
    light.position.set(-300, 1000, -300);
    scene.add(light);
    light = new THREE.DirectionalLight(0xffffff, 0.3);
    light.position.set(-200, -100, -400);
    scene.add(light);
    var gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
    scene.add(gridXZ);
    var axes = new THREE.AxisHelper(600);
    axes.position.y = 50;
    scene.add(axes);
    var textureLoader = new THREE.CubeTextureLoader();
    textureLoader.load(urls, function(texture) {
        drawFidgetSpinner(texture);
        addToDOM();
        animate();
    });
}

function drawFidgetSpinner(reflectionCube) {
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
    var spinnerTex = new THREE.Texture();
    var loader = new THREE.ImageLoader(manager);
    loader.load('spinnerTexture.png', function(image) {
        spinnerTex.image = image;
        spinnerTex.needsUpdate = true;
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.load('fidgetspinner.mtl', function(materials) {
            materials.preload();
            var objLoader = new THREE.OBJLoader();
            objLoader.setMaterials(materials);
            materials.materials.Metal.combine = THREE.MixOperation;
            materials.materials.Metal.envMap = reflectionCube;
            materials.materials.Metal.reflectivity = 0.75;
            materials.materials.Metal.shininess = 40;
            objLoader.load('fidgetspinner.obj', function(object) {
                object.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.material.map = spinnerTex;
                    }
                });
                spinner = object;
                spinner.position.y = 200;
                spinner.children[0].geometry.computeFaceNormals();
                loaded = true;
                scene.add(spinner);
            }, onProgress, onError);
        });
    });
}

function init() {
    var canvasRatio = canvasWidth / canvasHeight;
    addMouseHandler(canvas);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 4000);
    camera.position.set(0, 1500, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function addToDOM() {
    canvas.appendChild(renderer.domElement);
}

function animate() {
    window.requestAnimationFrame(animate);
    spinSpinner();
    renderer.render(scene, camera);
}

function spinSpinner() {
    // BEGIN CHANGES
    if (loaded) {
        spinSpeed = spinSpeed * (1 - deceleration);
        if (Math.abs(spinSpeed) < spinFloor) spinSpeed = 0;
        spinAngle = spinSpeed % Math.PI * 2;
        spinner.rotateOnAxis(spinAxis, spinAngle);
    }
    // END CHANGES
}
var mouseDown;
var swipeStart;
var swipe = new THREE.Vector3();

function getMousePoint(clientX, clientY) {
    var vector = new THREE.Vector3();
    vector.set(
        (clientX / window.innerWidth) * 2 - 1, -(clientY / (canvasHeight + canvasPad)) * 2 + 1,
        0.5);
    vector.unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = -camera.position.y / dir.y;
    return camera.position.clone().add(dir.multiplyScalar(distance));
}

function onMouseDown(evt) {
    evt.preventDefault();
    mouseDown = true;
    clock.getElapsedTime();
    swipeStart = getMousePoint(evt.clientX, evt.clientY);
}

function onMouseMove(evt) {
    if (mouseDown) {
        evt.preventDefault();
        swipeEnd = getMousePoint(evt.clientX, evt.clientY);
        swipe.subVectors(swipeEnd, swipeStart);
        if (swipe.length() > 20) {
            // BEGIN CHANGES
            swipeCross.crossVectors(swipe, swipeStart).normalize();
            if (swipeCross.y > 0) {
                var orientation = -1;
            } else {
                var orientation = 1;
            }
            var clockDelta = clock.getDelta();
            spinSpeed = swipe.length() * clockDelta * speedCoefficient * orientation;
            // END CHANGES
        }
    }
}

function addMouseHandler(canvas) {
    canvas.addEventListener('mousemove', function(e) {
        onMouseMove(e);
    }, false);
    canvas.addEventListener('mousedown', function(e) {
        onMouseDown(e);
    }, false);
    canvas.addEventListener('mouseup', function(e) {
        e.preventDefault();
        mouseDown = false;
    }, false);
    canvas.addEventListener("mouseout", function(e) {
        e.preventDefault();
        mouseDown = false;
    }, false);
}

try {
    init();
    fillScene();
} catch (error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
