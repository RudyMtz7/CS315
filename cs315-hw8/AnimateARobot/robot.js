var axes, camera, cameraControls, canvas, delta, gridXZ, gui, light, params, renderer, scene;
var robot, robotArm, robotClaw, robotForearm, robotHead, robotEye, robotLeftLeg, robotRightLeg, robotTorso;
var upperClaw, lowerClaw, innerGroup, outterGroup;
var canvasWidth = 600;
var canvasHeight = 400;
var canvasRatio = canvasWidth / canvasHeight;
var clock = new THREE.Clock();
var keyboard = new KeyboardState();

function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 40000);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(1000, 500, 500);
    cameraControls.target.set(4, 301, 92);
}

function createGUI() {
    gui = new dat.GUI({
        autoPlace: false
    });
    params = {
        swivel: 0,
        bend: 0,
        grab: 0
    };
    gui.add(params, 'swivel').min(-180).max(180).step(10).name('Swivel');
    gui.add(params, 'bend').min(-90).max(90).step(5).name('Bend');
    gui.add(params, 'grab').min(0).max(30).step(1).name('Grab');
    gui.domElement.style.position = "relative";
    gui.domElement.style.top = "-400px";
    gui.domElement.style.left = "350px";
}

function fillScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.CubeTextureLoader()
        .setPath('../../images/airport/')
        .load([
            'sky-xpos.png',
            'sky-xneg.png',
            'sky-ypos.png',
            'sky-yneg.png',
            'sky-zpos.png',
            'sky-zneg.png'
        ]);
    scene.fog = new THREE.Fog(0x808080, 2000, 4000);
    scene.add(new THREE.AmbientLight(0x222222));
    light = new THREE.DirectionalLight(0xffffff, 0.7);
    light.position.set(200, 500, 500);
    scene.add(light);
    light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(-200, -100, -400);
    scene.add(light);
    gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
    scene.add(gridXZ);
    axes = new THREE.AxisHelper(150);
    axes.position.y = 1;
    scene.add(axes);
    drawRobot();
}

function drawRobot() {
    ///////////////
    // MATERIALS //
    ///////////////

    // Basic Material
    var basicMaterial = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        color: 0xff0000,
        shininess: 120,
        reflectivity: 1,
        // opacity: 0.5,
        emissive: 0xff0000,
        emissiveIntensity: 5,
        emissiveMap: scene.background,
        envMap: scene.background,
        wireframe: false
    });

    // Metal Material
    var metalMaterial = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        color: 0x7118C4
    });

    // Matte Material
    var matteMaterial = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        color: 0x6CC417
    })

    // Glass Material
    var glassMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 100,
        transparent: true,
        opacity: 0.4,
        envMap: scene.background,
        combine: THREE.MixOperation,
        reflectivity: 0.8
    })

    //////////
    // BODY //
    //////////

    // The body
    var body, bodyGeometry, bodyMaterial;
    bodyGeometry = new THREE.SphereGeometry(100, 16, 16);
    bodyMaterial = metalMaterial;
    body = new THREE.Mesh(bodyGeometry, bodyMaterial);

    // The neck
    var neck, neckGeometry, neckMaterial;
    neckGeometry = new THREE.CylinderGeometry(5, 15, 60, 16, 16);
    neckMaterial = matteMaterial;
    neck = new THREE.Mesh(neckGeometry, neckMaterial);
    neck.position.y = 125;

    //////////
    // HEAD //
    //////////

    // The head ring
    var head, headGeometry, headMaterial;
    headGeometry = new THREE.TorusGeometry(50, 10, 16, 100);
    headMaterial = metalMaterial;
    head = new THREE.Mesh(headGeometry, headMaterial);
    head.rotateY(Math.PI / 2);


    // The back of the head
    var headBack, headBackGeometry, headBackMaterial;
    headBackGeometry = new THREE.TorusGeometry(50, 10, 16, 100, Math.PI);
    headBackMaterial = metalMaterial;
    headBack = new THREE.Mesh(headBackGeometry, headBackMaterial);
    headBack.rotateZ(Math.PI / 2);

    // The eye
    var eye, eyeGeometry, eyeMaterial;
    eyeGeometry = new THREE.SphereGeometry(40, 16, 16);
    eyeMaterial = glassMaterial;
    eye = new THREE.Mesh(eyeGeometry, eyeMaterial);

    // The left inner eye
    var innerLeftEye, innerLeftEyeGeometry, innerLeftEyeMaterial;
    innerLeftEyeGeometry = new THREE.SphereGeometry(10, 16, 16);
    innerLeftEyeMaterial = basicMaterial;
    innerLeftEye = new THREE.Mesh(innerLeftEyeGeometry, innerLeftEyeMaterial);
    innerLeftEye.position.z = 15;

    // The right inner eye
    var innerRightEye, innerRightEyeGeometry, innerRightEyeMaterial;
    innerRightEyeGeometry = new THREE.SphereGeometry(10, 16, 16);
    innerRightEyeMaterial = basicMaterial;
    innerRightEye = new THREE.Mesh(innerRightEyeGeometry, innerRightEyeMaterial);
    innerRightEye.position.z = -15;

    var innerLeftGlow = new THREE.PointLight(0xff7777, 1, 0, 2);
    innerLeftGlow.position.z = 15;

    var innerRightGlow = new THREE.PointLight(0xff7777, 1, 0, 2);
    innerRightGlow.position.z = -15;


    //////////
    // LEGS //
    //////////

    // The legs
    var leg, legGeometry, legMaterial;
    legGeometry = new THREE.CylinderGeometry(15, 5, 200, 16, 16);
    legMaterial = matteMaterial;
    leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.y = -150;

    var leftLeg = leg.clone();
    leftLeg.position.z = -50;

    var rightLeg = leg.clone();
    rightLeg.position.z = 50;

    // The feet
    var foot, footGeometry, footMaterial;
    var footLength = 60;
    var footWidth = 40;
    var footShape = new THREE.Shape();
    footShape.moveTo(0, 0);
    footShape.lineTo(0, footWidth);
    footShape.lineTo(footLength, footWidth);
    footShape.lineTo(footLength, 0);
    footShape.lineTo(0, 0);

    var extrudeSettings = {
        steps: 2,
        amount: 20,
        bevelEnabled: true,
        bevelThickness: 5,
        bevelSize: 5,
        bevelSegments: 1
    };

    footGeometry = new THREE.ExtrudeGeometry(footShape, extrudeSettings);
    footMaterial = metalMaterial;
    foot = new THREE.Mesh(footGeometry, footMaterial);
    foot.rotateX(Math.PI / 2);
    foot.position.y = extrudeSettings.amount - 250;
    foot.position.x = -2 * extrudeSettings.bevelSize;

    var leftFoot = foot.clone();
    leftFoot.position.z = -50 - footWidth / 2;

    var rightFoot = foot.clone();
    rightFoot.position.z = 50 - footWidth / 2;

    /////////
    // ARM //
    /////////

    // Shoulder
    var shoulder, shoulderGeometry, shoulderMaterial;
    shoulderGeometry = new THREE.SphereGeometry(25, 16, 16);
    shoulderMaterial = matteMaterial;
    shoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);

    // Upper Arm
    var upperArm, upperArmGeometry, upperArmMaterial;
    upperArmGeometry = new THREE.CylinderGeometry(15, 5, 100, 16, 16);
    upperArmMaterial = metalMaterial;
    upperArm = new THREE.Mesh(upperArmGeometry, upperArmMaterial);
    upperArm.rotateZ(Math.PI / 2);
    upperArm.position.x = 50;

    /////////////
    // FOREARM //
    /////////////

    // Elbow
    var elbow, elbowGeometry, elbowMaterial;
    elbowGeometry = new THREE.SphereGeometry(15, 16, 16);
    elbowMaterial = matteMaterial;
    elbow = new THREE.Mesh(elbowGeometry, elbowMaterial);

    // Lower Arm
    var lowerArm, lowerArmGeometry, lowerArmMaterial;
    lowerArmGeometry = new THREE.CylinderGeometry(5, 15, 100, 16, 16);
    lowerArmMaterial = metalMaterial;
    lowerArm = new THREE.Mesh(lowerArmGeometry, lowerArmMaterial);
    lowerArm.rotateZ(Math.PI / 2);
    lowerArm.position.x = 50;

    //////////
    // CLAW //
    //////////

    // Wrist
    var wrist, wristGeometry, wristMaterial;
    wristGeometry = new THREE.SphereGeometry(25, 16, 16);
    wristMaterial = matteMaterial;
    wrist = new THREE.Mesh(wristGeometry, wristMaterial);

    // The claws
    var claw, clawGeometry, clawMaterial;
    var clawScale = 25;
    var clawShape = new THREE.Shape();
    clawShape.moveTo(0, 0);
    clawShape.lineTo(clawScale, 2 * clawScale);
    clawShape.lineTo(2 * clawScale, 2 * clawScale);
    clawShape.lineTo(3 * clawScale, 0);
    clawShape.lineTo(2 * clawScale, 1.5 * clawScale);
    clawShape.lineTo(clawScale, 1.5 * clawScale);
    clawShape.lineTo(0, 0);

    var clawExtrudeSettings = {
        steps: 2,
        amount: 10,
        bevelEnabled: true,
        bevelThickness: 5,
        bevelSize: 5,
        bevelSegments: 1
    };

    clawGeometry = new THREE.ExtrudeGeometry(clawShape, clawExtrudeSettings);
    clawMaterial = metalMaterial;
    claw = new THREE.Mesh(clawGeometry, clawMaterial);

    upperClaw = claw.clone();
    upperClaw.rotation.z = Math.PI / 8;
    upperClaw.position.z = -clawExtrudeSettings.amount / 2;

    lowerClaw = claw.clone();
    lowerClaw.rotation.x = Math.PI;
    lowerClaw.rotation.z = Math.PI / 8;
    lowerClaw.position.z = clawExtrudeSettings.amount / 2;

    ////////////////
    // Assembling //
    ////////////////
    robotClaw = new THREE.Group()
        .add(lowerClaw)
        .add(upperClaw)
        .add(wrist);
    robotForearm = new THREE.Group()
        .add(robotClaw)
        .add(lowerArm)
        .add(elbow);
    robotArm = new THREE.Group()
        .add(robotForearm)
        .add(upperArm)
        .add(shoulder);
    robotLeftLeg = new THREE.Group()
        .add(leftFoot)
        .add(leftLeg);
    robotRightLeg = new THREE.Group()
        .add(rightFoot)
        .add(rightLeg);
    robotEye = new THREE.Group()
        .add(innerLeftEye)
        .add(innerRightEye)
        .add(innerLeftGlow)
        .add(innerRightGlow);
    robotHead = new THREE.Group()
        .add(head)
        .add(headBack)
        .add(eye)
        .add(robotEye);
    robotTorso = new THREE.Group()
        .add(body)
        .add(neck);
    robot = new THREE.Group()
        .add(robotTorso)
        .add(robotHead)
        .add(robotLeftLeg)
        .add(robotRightLeg)
        .add(robotArm);

    innerGroup = new THREE.Group().add(robot);
    outerGroup = new THREE.Group().add(innerGroup);

    robot.position.y = 250;
    robotHead.position.y = 200;
    robotArm.position.x = 100;
    robotForearm.position.x = 100;
    robotClaw.position.x = 100;

    //////////////////
    // Add to Scene //
    //////////////////
    scene.add(outerGroup);
}


function addToDOM() {
    canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
    canvas.appendChild(gui.domElement);
}

function animate() {
    // Sliders
    robotArm.rotation.x = (params.swivel * Math.PI / 180);
    robotForearm.rotation.z = (params.bend * Math.PI / 180);
    upperClaw.rotation.z = (35 * Math.PI / 180) - (params.grab * Math.PI / 180);
    lowerClaw.rotation.z = (35 * Math.PI / 180) - (params.grab * Math.PI / 180);
    // Keyboard Movement
    keyboard.update();
    // Movement Constants
    var eyeSpeed = 0.1;
    var moveSpeed = 5;
    var rotateSpeed = 2.5;
    rotateSpeed *= Math.PI / 180;
    // Forward vector
    var forward = new THREE.Vector3(1, 0, 0);
    forward.applyQuaternion(innerGroup.quaternion).normalize();
    // Moving Forward
    if (keyboard.pressed("W")) {
        outerGroup.translateOnAxis(forward, moveSpeed);
    }
    // Moving Back
    if (keyboard.pressed("S")) {
        outerGroup.translateOnAxis(forward.multiplyScalar(-1), moveSpeed);
    }
    // Strafing Left
    if (keyboard.pressed("Q")) {
        var forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(innerGroup.quaternion).normalize();
        outerGroup.translateOnAxis(forward.multiplyScalar(-1), moveSpeed);
    }
    // Strafing Right
    if (keyboard.pressed("E")) {
        var forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(innerGroup.quaternion).normalize();
        outerGroup.translateOnAxis(forward, moveSpeed);
    }
    // Rotate Left
    if (keyboard.pressed("A")) {
        outerGroup.rotateY(rotateSpeed);
    }
    // Rotate Right
    if (keyboard.pressed("D")) {
        outerGroup.rotateY(-rotateSpeed);
    }
    // Move Legs
    if (
        keyboard.pressed("W") ||
        keyboard.pressed("A") ||
        keyboard.pressed("S") ||
        keyboard.pressed("D") ||
        keyboard.pressed("Q") ||
        keyboard.pressed("E")
    ) {
        moveLegs();
    }
    robotEye.rotateOnAxis(forward, eyeSpeed);
    window.requestAnimationFrame(animate);
    render();
}

var legOffset = 0;
var legStride = true;

function moveLegs() {
    var legSpeed = 3;
    legSpeed *= Math.PI / 180;

    if (keyboard.pressed("Q")) {
        robotLeftLeg.rotation.y = Math.PI / 2;
        robotRightLeg.rotation.y = Math.PI / 2;
    }
    if (keyboard.pressed("E")) {
        robotLeftLeg.rotation.y = -Math.PI / 2;
        robotRightLeg.rotation.y = -Math.PI / 2;
    }
    if (!(keyboard.pressed("Q") || keyboard.pressed("E"))) {
        robotLeftLeg.rotation.y = 0;
        robotRightLeg.rotation.y = 0;
    }

    if (legStride) {
        legOffset += legSpeed;
    } else {
        legOffset -= legSpeed;
    }
    if (legOffset > Math.PI / 4) {
        legStride = false;
    }
    if (legOffset < -Math.PI / 4) {
        legStride = true;
    }

    robotLeftLeg.rotation.z = legOffset;
    robotRightLeg.rotation.z = -legOffset;
}

function render() {
    delta = clock.getDelta();
    cameraControls.update(delta);
    renderer.render(scene, camera);
}
try {
    init();
    createGUI();
    fillScene();
    addToDOM();
    animate();
} catch (error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
