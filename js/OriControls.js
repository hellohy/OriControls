var GyroControls = function (object) {
  var scope = this
  var touchX, touchY

  this.object = object
  this.object.rotation.reorder('YXZ')

  this.enabled = true

  this.deviceOrientation = {}
  this.screenOrientation = 0

  this.alpha = 0
  this.alphaOffsetAngle = 0

  // 非陀螺仪控制器所需参数
  this.lon = 90
  this.lat = 0

  this.phi = 0
  this.theta = 0
  this.target = new THREE.Vector3()

  this.lastLon = 90
  this.lastLat = 0

  // 竖直方向上的限制
  var limitLat = 20

  // 判断是否调用陀螺仪
  this.isGyro = true
  this.gyroReady = false

  // 获取陀螺仪的初始参数,开发中模拟alpha,beta,gamma分别为0,90,0
  // this.upGyroInfo = this.getGyroInfo()
  this.upGyroInfo = [0, 90, 0]

  var onDeviceOrientationChangeEvent = function (event) {
    scope.deviceOrientation = event
    if (!scope.gyroReady) {
      scope.upGyroInfo = scope.getGyroInfo()
      console.log(scope.upGyroInfo)

      // scope.lastLon = scope.upGyroInfo[0]
      // scope.lastLat = scope.upGyroInfo[1]
    }
    scope.gyroReady = true
  }

  var onScreenOrientationChangeEvent = function () {
    scope.screenOrientation = window.orientation || 0
  }

  // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

  var setObjectQuaternion = (function () {
    var zee = new THREE.Vector3(0, 0, 1)

    var euler = new THREE.Euler()

    var q0 = new THREE.Quaternion()

    var q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)) // - PI/2 around the x-axis

    return function (quaternion, alpha, beta, gamma, orient) {
      euler.set(beta, alpha, -gamma, 'YXZ') // 'ZXY' for the device, but 'YXZ' for us

      quaternion.setFromEuler(euler) // orient the device

      quaternion.multiply(q1) // camera looks out the back of the device, not the top

      quaternion.multiply(q0.setFromAxisAngle(zee, -orient)) // adjust for screen orientation
    }
  }())

  function onDocumentMouseDown(event) {
    // event.preventDefault()

    scope.isGyro = false

    if (scope.getGyroInfo().length && scope.upGyroInfo.length) {
      var downGyroInfo = scope.getGyroInfo()
      console.log(downGyroInfo, scope.upGyroInfo)
      scope.deltaAlpha = downGyroInfo[0] - scope.upGyroInfo[0]
      scope.deltaBeta = downGyroInfo[1] - scope.upGyroInfo[1]
      scope.lat += downGyroInfo[1] - scope.upGyroInfo[1]
      scope.lon += downGyroInfo[0] - scope.upGyroInfo[0]
    }

    scope.downNoGyroInfo = scope.getNoGyroInfo()

    document.addEventListener('mousemove', onDocumentMouseMove, false)
    document.addEventListener('mouseup', onDocumentMouseUp, false)
  }

  function onDocumentMouseMove(event) {
    var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
    var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0

    scope.lon -= movementX * 0.1
    scope.lat += movementY * 0.1
  }

  function onDocumentMouseUp(event) {
    scope.isGyro = true

    var noGyroInfo = scope.getNoGyroInfo()

    scope.lastLon += noGyroInfo[0] - scope.downNoGyroInfo[0]
    scope.lastLat += noGyroInfo[1] - scope.downNoGyroInfo[1]
    console.log(scope.lastLon, scope.lastLat)
    scope.upGyroInfo = scope.getGyroInfo()

    document.removeEventListener('mousemove', onDocumentMouseMove, false)
    document.removeEventListener('mouseup', onDocumentMouseUp, false)
  }

  function onDocumentTouchStart(event) {
    // event.preventDefault()
    scope.isGyro = false

    if (scope.getGyroInfo().length && scope.upGyroInfo.length) {
      var downGyroInfo = scope.getGyroInfo()
      console.log(downGyroInfo, scope.upGyroInfo)
      scope.deltaAlpha = downGyroInfo[0] - scope.upGyroInfo[0]
      scope.deltaBeta = downGyroInfo[1] - scope.upGyroInfo[1]
      scope.lat += downGyroInfo[1] - scope.upGyroInfo[1]
      scope.lon += downGyroInfo[0] - scope.upGyroInfo[0]
    }

    scope.downNoGyroInfo = scope.getNoGyroInfo()

    var touch = event.touches[0]

    touchX = touch.screenX
    touchY = touch.screenY
    document.addEventListener('touchmove', onDocumentTouchMove, false)
    document.addEventListener('touchend', onDocumentTouchEnd, false)
  }

  function onDocumentTouchMove(event) {
    // event.preventDefault()
    var touch = event.touches[0]

    scope.lon -= (touch.screenX - touchX) * 0.1
    scope.lat += (touch.screenY - touchY) * 0.1

    touchX = touch.screenX
    touchY = touch.screenY
  }

  function onDocumentTouchEnd(event) {
    scope.isGyro = true

    var noGyroInfo = scope.getNoGyroInfo()

    scope.lastLon += noGyroInfo[0] - scope.downNoGyroInfo[0]
    scope.lastLat += noGyroInfo[1] - scope.downNoGyroInfo[1]
    console.log(scope.lastLon, scope.lastLat)
    scope.upGyroInfo = scope.getGyroInfo()
    document.removeEventListener('touchmove', onDocumentTouchMove, false)
    document.removeEventListener('touchend', onDocumentTouchEnd, false)
  }

  this.connect = function () {
    onScreenOrientationChangeEvent() // run once on load

    window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false)
    window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false)

    scope.enabled = true

    // 非陀螺仪控制器
    document.addEventListener('mousedown', onDocumentMouseDown, false)
    document.addEventListener('touchstart', onDocumentTouchStart, false)
  }

  this.disconnect = function () {
    window.removeEventListener('orientationchange', onScreenOrientationChangeEvent, false)
    window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false)

    scope.enabled = false
  }

  this.update = function () {
    if (scope.enabled === false) return
    if (this.isGyro) {
      // 默认值为竖屏，alpha = 0, beta = 90, gamma = 0
      var a = scope.deviceOrientation.alpha
      var b = scope.deviceOrientation.beta
        // var g = scope.deviceOrientation.gamma
      var gamma = 0

      var lastAlpha = THREE.Math.degToRad(this.lastLon - 90 - gamma)
      var alpha = a ? THREE.Math.degToRad(a) + this.alphaOffsetAngle + lastAlpha : lastAlpha

      var beta
      var lastBeta = this.lastLat
      if (b) {
        beta = THREE.Math.degToRad(Math.max(-limitLat + 90, Math.min(limitLat + 90, b + lastBeta)))
      } else {
        beta = THREE.Math.degToRad(90 + lastBeta)
      }

      var orient = scope.screenOrientation ? THREE.Math.degToRad(scope.screenOrientation) : 0

      setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient)
      this.alpha = alpha
    }

    if (!this.isGyro) {
      this.lat = Math.max(-limitLat, Math.min(limitLat, this.lat))
      this.phi = THREE.Math.degToRad(90 - this.lat)
      this.theta = THREE.Math.degToRad(this.lon)
      this.target.x = Math.sin(this.phi) * Math.cos(this.theta)
      this.target.y = Math.cos(this.phi)
        // 加负号，往右滑动，相机看向右边
      this.target.z = -Math.sin(this.phi) * Math.sin(this.theta)
        // console.log(this.target)
      scope.object.lookAt(this.target)
    }
  }

  this.updateAlphaOffsetAngle = function (angle) {
    this.alphaOffsetAngle = angle
    this.update()
  }

  this.dispose = function () {
    this.disconnect()
  }

  this.getGyroInfo = function () {
    var arr = []
    var tmp = this.deviceOrientation
    if (tmp.alpha !== undefined && tmp.alpha !== null) {
      arr = [tmp.alpha, tmp.beta, tmp.gamma]
    }
    return arr
  }

  this.getNoGyroInfo = function () {
    return [this.lon, this.lat]
  }

  this.connect()
}
