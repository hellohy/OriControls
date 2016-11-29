var camera, controls, Devices;
var renderer, effect;
var scene;
var isDeviceing = 0; //默认开启

var lon = 90,
    lat = 0;
var phi = 0,
    theta = 0;
var target = new THREE.Vector3();

//竖直方向上的限制
var limitLat = 60;



init();
animate();

function initDevices() {
    Devices = new GyroControls(camera);
}

// function initControls() {
//     controls = new THREE.OrbitControls(camera);
// }

function init() {

    var container = document.getElementById('container');

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 100);
    // camera = new THREE.OrthographicCamera(-50, 50, 50, -50);
    // camera.position.z = 0.01;

    var cameraHelper = new THREE.CameraHelper(camera);
    // scene.add(cameraHelper);

    // initControls();
    initDevices();
    Devices.connect();
    //controls = new THREE.DeviceOrientationControls(camera);
    //controls = new THREE.OrbitControls( camera );
    //        controls.enableZoom = false;
    //        controls.enablePan = false;

    var textures = getTexturesFromAtlasFile("resources/sun_temple_stripe.jpg", 6);
    // var textures = getTexturesFromAtlasFile("textures/cube/py.jpg", 6);

    var materials = [];

    for (var i = 0; i < 6; i++) {

        materials.push(new THREE.MeshBasicMaterial({
            map: textures[i]
        }));

    }

    var skyBox = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), new THREE.MeshFaceMaterial(materials));
    skyBox.applyMatrix(new THREE.Matrix4().makeScale(1, 1, -1));
    scene.add(skyBox);

    var loader = new THREE.TextureLoader();
    loader.load(
        'resources/test.jpg',
        function(texture) {
            var building = createBuilding(texture);
            scene.add(building);
            addListeners(renderer.domElement, building, camera);
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(xhr) {
            console.log('An error happened');
        }
    );

    window.addEventListener('resize', onWindowResize, false);
    container.addEventListener('touchstart', function() {
        isDeviceing = 0;

        requestAnimationFrame(animate);
    }, false);
    container.addEventListener('touchend', function() {
        isDeviceing = 1;
        initDevices();
    }, false);

}

function createBuilding(texture) {
    var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
    });
    var plane = new THREE.PlaneGeometry(0.5, 0.5);
    var building = new THREE.Mesh(plane, material);
    building.position.set(0, 0, 0.4);
    building.name = 'BUILDING';
    return building;
}

function addListeners(dom, obj, camera) {
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    dom.addEventListener('click', function(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects([obj]);

        for (var i = 0; i < intersects.length; i++) {

            alert('test building clicked')

        }
    });
}

function getTexturesFromAtlasFile(atlasImgUrl, tilesNum) {

    var textures = [];

    for (var i = 0; i < tilesNum; i++) {

        textures[i] = new THREE.Texture();

    }

    var imageObj = new Image();

    imageObj.onload = function() {

        var canvas, context;
        var tileWidth = imageObj.height;

        for (var i = 0; i < textures.length; i++) {

            canvas = document.createElement('canvas');
            context = canvas.getContext('2d');
            canvas.height = tileWidth;
            canvas.width = tileWidth;
            context.drawImage(imageObj, tileWidth * i, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth);
            textures[i].image = canvas
            textures[i].needsUpdate = true;

        }

    };

    imageObj.src = atlasImgUrl;

    return textures;

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}


function animate() {

    //controls.update();
    // isDeviceing === 0 ? controls.update() : Devices.update();

    // lon += 0.1;

    // lat = Math.max(-limitLat, Math.min(limitLat, lat));
    // phi = THREE.Math.degToRad(90 - lat);
    // theta = THREE.Math.degToRad(lon);
    // target.x = Math.sin(phi) * Math.cos(theta);
    // target.y = Math.cos(phi);
    // target.z = Math.sin(phi) * Math.sin(theta);

    // camera.lookAt(target);

    Devices.update();
    renderer.render(scene, camera);

    // recordData(cameraP, camera.position);
    requestAnimationFrame(animate);

}