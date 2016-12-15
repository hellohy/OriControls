# 陀螺仪控制器开发 #

## 两种事件 ##

1. orientationchange(翻转屏幕时触发)
    - window.orientation：0-竖屏 90-右旋转 -90-左旋转
    - 获取屏幕横竖屏状态
2. deviceorientation + devicemotion(重力感应与陀螺仪) [MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Detecting_device_orientation)
    - deviceorientation-处理方向事件（移动的角度）

        - DeviceOrientationEvent.alpha 表示设备沿z轴上的旋转角度，范围为0~360。

            ![示意图alpha](https://developer.mozilla.org/@api/deki/files/5695/=alpha.png)
        - DeviceOrientationEvent.beta 表示设备在x轴上的旋转角度，范围为-180~180。它描述的是设备由前向后旋转的情况。

            ![示意图beta](https://developer.mozilla.org/@api/deki/files/5696/=beta.png)
        - DeviceOrientationEvent.gamma 表示设备在y轴上的旋转角度，范围为-90~90。它描述的是设备由左向右旋转的情况。 

            ![示意图gamma](https://developer.mozilla.org/@api/deki/files/5697/=gamma.png)
        ```
        window.addEventListener('deviceorientation', function(e){
            console.log('absolute: ' + e.absolute)
            console.log('alpha: ' + e.alpha)
            console.log('beta: ' + e.beta)
            console.log('gamma: ' + e.gamma)
        });
        ```
        [w3c API 网址](http://w3c.github.io/deviceorientation/spec-source-orientation.html)
        [MDN Orientation and motion data explained](https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Orientation_and_motion_data_explained)

    - devicemotion-监听加速度的变化
        - DeviceMotionEvent.acceleration
            - x: 西向东
            - y: 南向北
            - z: 垂直地面
        - DeviceMotionEvent.accelerationIncludingGravity
            - x: 西向东
            - y: 南向北
            - z: 垂直地面
        - DeviceMotionEvent.rotationRate
            - alpha: 设备沿着垂直屏幕的轴的旋转速率 (桌面设备相对于键盘)
            - beta: 设备沿着屏幕左至右方向的轴的旋转速率(桌面设备相对于键盘)
            - gamma: 设备沿着屏幕下至上方向的轴的旋转速率(桌面设备相对于键盘)
        - DeviceMotionEvent.interval
            - 从设备获取数据的频率，单位是毫秒。


## chrome调试 ##

### 打开方式

1. console--More tools--Sensors


## 四元数 ##
### 简单概念 ###
1. threejs中的方法
```javascript
	var quaternion = new THREE.Quaternion();
	quaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );

	var vector = new THREE.Vector3( 1, 0, 0 );
	vector.applyQuaternion( quaternion );
```
2. 欧拉角
	- 蓝色是起始坐标系，而红色的是旋转之后的坐标系。
	![示意图旋转](http://images.cnitblog.com/blog/394589/201307/10221945-bf5af8ec672247bbba9cde3bcd5c7afa.png)
		1. 绕z轴旋转α，使x轴与N轴重合，N轴是旋转前后两个坐标系x-y平面的交线
		2. 绕x轴（也就是N轴）旋转β，使z轴与旋转后的z轴重合
		3. 绕z轴旋转γ，使坐标系与旋转后的完全重合
