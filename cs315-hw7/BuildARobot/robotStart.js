var scene, renderer, canvas;
var camera, cameraControls;
var light, gridXZ, axes;
var canvasWidth = 600;
var canvasHeight = 400;
var canvasRatio = canvasWidth / canvasHeight;
var clock = new THREE.Clock();
var delta;

function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setClearColor(0xAAAAAA, 1.0);
    camera = new THREE.PerspectiveCamera(45, canvasRatio, 1, 40000);
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    camera.position.set(800, 600, 500);
    cameraControls.target.set(4, 301, 92);
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
    // Basic Material
    var basicMaterial = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 5,
        emissiveMap: scene.background,
        envMap: scene.background,
        wireframe: false
    });

    // Metal Material
    var metalMaterial = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        color: 0x00ff00
    });

    // Matte Material
    var matteMaterial = new THREE.MeshLambertMaterial({
        side: THREE.DoubleSide,
        color: 0x0000ff
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

    // The body
    var bodySphere, bodySphereGeometry, bodySphereMaterial;
    bodySphereGeometry = new THREE.SphereGeometry(100, 16, 16);
    bodySphereMaterial = metalMaterial;
    bodySphere = new THREE.Mesh(bodySphereGeometry, bodySphereMaterial);
    bodySphere.position.x = 0;
    bodySphere.position.y = 250;
    bodySphere.position.z = 0;
    scene.add(bodySphere);

    // The neck
    var neckCylinder, neckCylinderGeometry, neckCylinderMaterial;
    neckCylinderGeometry = new THREE.CylinderGeometry(5, 15, 60, 16, 16);
    neckCylinderMaterial = matteMaterial;
    neckCylinder = new THREE.Mesh(neckCylinderGeometry, neckCylinderMaterial);
    neckCylinder.position.x = 0;
    neckCylinder.position.y = 375;
    neckCylinder.position.z = 0;
    scene.add(neckCylinder);

    // The head ring
    var head, headGeometry, headMaterial;
    headGeometry = new THREE.TorusGeometry(50, 10, 16, 100);
    headMaterial = metalMaterial;
    head = new THREE.Mesh(headGeometry, headMaterial);
    head.rotateY(Math.PI / 2);
    head.position.x = 0;
    head.position.y = 450;
    head.position.z = 0;
    scene.add(head);

    // The back of the head
    var head, headGeometry, headMaterial;
    headGeometry = new THREE.TorusGeometry(50, 10, 16, 100, Math.PI);
    headMaterial = metalMaterial;
    head = new THREE.Mesh(headGeometry, headMaterial);
    head.rotateZ(Math.PI / 2);
    head.position.x = 0;
    head.position.y = 450;
    head.position.z = 0;
    scene.add(head);

    // The eye
    var eye, eyeGeometry, eyeMaterial;
    eyeGeometry = new THREE.SphereGeometry(40, 16, 16);
    eyeMaterial = glassMaterial;
    eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.position.x = 0;
    eye.position.y = 450;
    eye.position.z = 0;
    scene.add(eye);

    // The innerEye
    var innerEye, innerEyeGeometry, innerEyeMaterial;
    innerEyeGeometry = new THREE.SphereGeometry(20, 16, 16);
    innerEyeMaterial = basicMaterial;
    innerEye = new THREE.Mesh(innerEyeGeometry, innerEyeMaterial);
    innerEye.position.x = 0;
    innerEye.position.y = 450;
    innerEye.position.z = 0;
    scene.add(innerEye);

    // The legs
    var leg, legGeometry, legMaterial;
    legGeometry = new THREE.CylinderGeometry(15, 5, 200, 16, 16);
    legMaterial = matteMaterial;
    leg = new THREE.Mesh(legGeometry, legMaterial);
    var leftLeg, rightLeg;
    leftLeg = leg.clone();
    rightLeg = leg.clone();
    leftLeg.position.y = 100;
    leftLeg.position.z = -50;
    scene.add(leftLeg);
    rightLeg.position.y = 100;
    rightLeg.position.z = 50;
    scene.add(rightLeg);

    // The feet
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
    var geometry = new THREE.ExtrudeGeometry(footShape, extrudeSettings);
    var material = metalMaterial;
    var foot = new THREE.Mesh(geometry, material);
    foot.rotateX(Math.PI / 2);
    var leftFoot = foot.clone();
    leftFoot.position.x = -2 * extrudeSettings.bevelSize;
    leftFoot.position.y = extrudeSettings.amount;
    leftFoot.position.z = -50 - footWidth / 2;
    var rightFoot = foot.clone();
    rightFoot.position.x = -2 * extrudeSettings.bevelSize;
    rightFoot.position.y = extrudeSettings.amount;
    rightFoot.position.z = 50 - footWidth / 2;
    scene.add(leftFoot);
    scene.add(rightFoot);

    // Shoulder
    var shoulder, shoulderGeometry, shoulderMaterial;
    shoulderGeometry = new THREE.SphereGeometry(25, 16, 16);
    shoulderMaterial = matteMaterial;
    shoulder = new THREE.Mesh(shoulderGeometry, shoulderMaterial);
    shoulder.position.x = 100;
    shoulder.position.y = 250;
    shoulder.position.z = 0;
    scene.add(shoulder);

    // Upper Arm
    var upperArm, upperArmGeometry, upperArmMaterial;
    upperArmGeometry = new THREE.CylinderGeometry(15, 5, 100, 16, 16);
    upperArmMaterial = metalMaterial;
    upperArm = new THREE.Mesh(upperArmGeometry, upperArmMaterial);
    upperArm.rotateZ(Math.PI / 2);
    upperArm.position.x = 150;
    upperArm.position.y = 250;
    upperArm.position.z = 0;
    scene.add(upperArm);

    // Elbow
    var elbow, elbowGeometry, elbowMaterial;
    elbowGeometry = new THREE.SphereGeometry(15, 16, 16);
    elbowMaterial = matteMaterial;
    elbow = new THREE.Mesh(elbowGeometry, elbowMaterial);
    elbow.position.x = 200;
    elbow.position.y = 250;
    elbow.position.z = 0;
    scene.add(elbow);

    // Lower Arm
    var lowerArm, lowerArmGeometry, lowerArmMaterial;
    lowerArmGeometry = new THREE.CylinderGeometry(5, 15, 100, 16, 16);
    lowerArmMaterial = metalMaterial;
    lowerArm = new THREE.Mesh(lowerArmGeometry, lowerArmMaterial);
    lowerArm.rotateZ(Math.PI / 2);
    lowerArm.position.x = 250;
    lowerArm.position.y = 250;
    lowerArm.position.z = 0;
    scene.add(lowerArm);

    // Wrist
    var wrist, wristGeometry, wristMaterial;
    wristGeometry = new THREE.SphereGeometry(25, 16, 16);
    wristMaterial = matteMaterial;
    wrist = new THREE.Mesh(wristGeometry, wristMaterial);
    wrist.position.x = 300;
    wrist.position.y = 250;
    wrist.position.z = 0;
    scene.add(wrist);

    // The claws
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
    var clawGeometry = new THREE.ExtrudeGeometry(clawShape, clawExtrudeSettings);
    var clawMaterial = metalMaterial;
    var claw = new THREE.Mesh(clawGeometry, clawMaterial);

    var topClaw = claw.clone();
    topClaw.rotateZ(Math.PI / 8);
    topClaw.position.x = 300;
    topClaw.position.y = 250;
    topClaw.position.z = -clawExtrudeSettings.amount / 2;

    var bottomClaw = claw.clone();
    bottomClaw.rotateX(Math.PI);
    bottomClaw.rotateZ(Math.PI / 8);
    bottomClaw.position.x = 300;
    bottomClaw.position.y = 250;
    bottomClaw.position.z = clawExtrudeSettings.amount / 2;

    scene.add(topClaw);
    scene.add(bottomClaw);
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
