THREE.DeviceOrientationControls = function(object) {

    var scope = this;

    this.object = object;
    this.object.rotation.reorder("YXZ");

    this.enabled = true;

    this.deviceOrientation = {};
    this.screenOrientation = 0;

    this.alpha = 0;
    this.alphaOffsetAngle = 0;

    //非陀螺仪控制器所需参数
    this.lon = 90;
    this.lat = 0;
    this.phi = 0;
    this.theta = 0;
    this.target = new THREE.Vector3();

    //竖直方向上的限制
    var limitLat = 60;

    //判断是否调用陀螺仪
    this.isGyro = true;

    var onDeviceOrientationChangeEvent = function(event) {

        scope.deviceOrientation = event;

    };

    var onScreenOrientationChangeEvent = function() {

        scope.screenOrientation = window.orientation || 0;

    };

    // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

    var setObjectQuaternion = function() {

        var zee = new THREE.Vector3(0, 0, 1);

        var euler = new THREE.Euler();

        var q0 = new THREE.Quaternion();

        var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

        return function(quaternion, alpha, beta, gamma, orient) {

            euler.set(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us

            quaternion.setFromEuler(euler); // orient the device

            quaternion.multiply(q1); // camera looks out the back of the device, not the top

            quaternion.multiply(q0.setFromAxisAngle(zee, -orient)); // adjust for screen orientation

        }

    }();


    function onDocumentMouseDown(event) {

        // event.preventDefault();

        scope.isGyro = false;
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('mouseup', onDocumentMouseUp, false);

    }

    function onDocumentMouseMove(event) {

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        scope.lon -= movementX * 0.1;
        scope.lat += movementY * 0.1;
    }

    function onDocumentMouseUp(event) {
        scope.isGyro = true;
        document.removeEventListener('mousemove', onDocumentMouseMove);
        document.removeEventListener('mouseup', onDocumentMouseUp);

    }

    function onDocumentMouseWheel(event) {

        object.fov += event.deltaY * 0.05;
        object.updateProjectionMatrix();

    }

    function onDocumentTouchStart(event) {

        // event.preventDefault();

        var touch = event.touches[0];

        touchX = touch.screenX;
        touchY = touch.screenY;

    }

    function onDocumentTouchMove(event) {

        // event.preventDefault();

        var touch = event.touches[0];

        scope.lon -= (touch.screenX - touchX) * 0.1;
        scope.lat += (touch.screenY - touchY) * 0.1;

        touchX = touch.screenX;
        touchY = touch.screenY;


    }



    this.connect = function() {

        onScreenOrientationChangeEvent(); // run once on load

        window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);
        window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

        scope.enabled = true;

        //非陀螺仪控制器
        document.addEventListener('mousedown', onDocumentMouseDown, false);
        // document.addEventListener('wheel', onDocumentMouseWheel, false);

        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);

    };

    this.disconnect = function() {

        window.removeEventListener('orientationchange', onScreenOrientationChangeEvent, false);
        window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

        scope.enabled = false;

    };

    this.update = function() {

        if (scope.enabled === false) return;

        if (this.isGyro) {
            //默认值为竖屏，alpha = 0, beta = 90, gamma = 0;
            var alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad(scope.deviceOrientation.alpha) + this.alphaOffsetAngle : 0; // Z
            var beta = scope.deviceOrientation.beta ? THREE.Math.degToRad(scope.deviceOrientation.beta) : THREE.Math.degToRad(90); // X'
            var gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad(scope.deviceOrientation.gamma) : 0; // Y''
            var orient = scope.screenOrientation ? THREE.Math.degToRad(scope.screenOrientation) : 0; // O

            alpha += this.lon - gamma;
            beta += this.lat;

            setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);
            this.alpha = alpha;

            if (scope.deviceOrientation.alpha) {
                this.lon = scope.deviceOrientation.alpha + scope.deviceOrientation.gamma;
                this.lat = scope.deviceOrientation.beta;
            }

        }


        if (!this.isGyro) {

            this.lat = Math.max(-limitLat, Math.min(limitLat, this.lat));
            this.phi = THREE.Math.degToRad(90 - this.lat);
            this.theta = THREE.Math.degToRad(this.lon);
            this.target.x = Math.sin(this.phi) * Math.cos(this.theta);
            this.target.y = Math.cos(this.phi);
            // 加负号，往右滑动，相机看向右边
            this.target.z = -Math.sin(this.phi) * Math.sin(this.theta);

            // console.log(this.target);
            scope.object.lookAt(this.target);
        }

        recordData(document.getElementById('quaternion'), scope.object.quaternion);
        recordData(document.getElementById('mouse_pos'), this);
        recordData(document.getElementById('ori_pos'), scope.deviceOrientation);
    };

    this.updateAlphaOffsetAngle = function(angle) {

        this.alphaOffsetAngle = angle;
        this.update();

    };

    this.dispose = function() {

        this.disconnect();

    };

    this.connect();

    function recordData(dom, obj) {
        var str = dom.getAttribute('id') + '<br>';

        for (v in obj) {
            var tmp = typeof obj[v];
            if ((tmp !== 'function' && tmp !== 'object') && v.indexOf('_') < 0) {
                str += v + ':' + obj[v] + '<br>';
            }
        }
        dom.innerHTML = str;
    }

};