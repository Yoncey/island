// import * as THREE from "../node_modules/three/build/three.module.js";
import * as THREE from "three";
// 导入控制器
// import { OrbitControls } from "../node_modules/three/examples/jsm/controls/OrbitControls.js";
import { OrbitControls } from "OrbitControls";
// 导入水面
import { Water } from "Water";
// 导入gltf载入库
import { GLTFLoader } from "GLTFLoader";
import { DRACOLoader } from "DRACOLoader";
// 导入天空纹理的HDR
import { RGBELoader } from "RGBELoader";
// 初始化场景
const scene = new THREE.Scene();

// 初始化相机
const camera = new THREE.PerspectiveCamera(
  85,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
// 设置相机位置
camera.position.set(-50, 50, 130);
// camera.position.z(10)
// 更新相机宽高比
camera.aspect = window.innerWidth / window.innerHeight;
// 更新相机投影矩阵
camera.updateProjectionMatrix();
// 将相机添加到场景
scene.add(camera);

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({
  // 抗锯齿
  antialias: true,
  // 对数深度缓冲区
  logarithmicDepthBuffer: true,
});
// 设置渲染器输出环境编码
renderer.outputEncoding = THREE.sRGBEncoding;
// 设置渲染器宽高
renderer.setSize(window.innerWidth, window.innerHeight);

// 监听屏幕的大小改变，修改渲染器的宽高、相机的比例
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 将渲染器添加到页面
document.body.appendChild(renderer.domElement);

// 实例化控制器
const controls = new OrbitControls(camera, renderer.domElement);

// 渲染
function render() {
  // 渲染场景
  renderer.render(scene, camera);
  // 引擎自动更新渲染器
  requestAnimationFrame(render);
}
render();

// 添加平面
// const planeGeometry = new THREE.PlaneGeometry(100, 100);
// const planeMaterial = new THREE.MeshBasicMaterial({
//   color: 0xffffff,
// });
// const plane = new THREE.Mesh(planeGeometry, planeMaterial);
// scene.add(plane);

// 创建天空球
let texture = new THREE.TextureLoader().load("../models/textures/sky.jpg");
const skyGeometry = new THREE.SphereGeometry(1000, 60, 60);
const skyMaterial = new THREE.MeshBasicMaterial({
  map: texture,
});
// 将球体翻转，即内部能看到，外部为黑
skyGeometry.scale(1, 1, -1);
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// 创建视频纹理
const video = document.createElement("video");
video.src = "../models/textures/sky.mp4";
video.loop = true;
window.addEventListener("mousemove", (e) => {
  // 当鼠标移动时，播放视频
  if (video.paused) {
    video.play();
    let texture = new THREE.VideoTexture(video);
    skyMaterial.map = texture;
    skyMaterial.map.needsUpdate = true;
  }
});

// 载入环境纹理hdr
const hdrLoader = new RGBELoader();
hdrLoader.loadAsync("./textures/050.hdr").then((texture) => {
  // 设置纹理映射：整个天空球面的映射原理
  texture.mapping = THREE.EquirectangularReflectionMapping;
  // 添加环境纹理
  scene.background = texture;
  scene.environment = texture;
});

// 创建平行光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(-100, 100, 10);
scene.add(light);

// 创建水面
const waterGeometry = new THREE.CircleGeometry(300, 64);
const water = new Water(waterGeometry, {
  textureWidth: 1024,
  textureHeight: 1024,
  color: 0xeeeeff,
  flowDirection: new THREE.Vector2(1, 1),
  scale: 1,
});
// 水面旋转至水平
water.rotation.x = -Math.PI / 2;
// 抬高水面
water.position.y = 3;
scene.add(water);

// 添加小岛模型
// 实例化gltf载入库
const loader = new GLTFLoader();
// 实例化draco载入库
const dracoLoader = new DRACOLoader();
// 添加draco载入库
dracoLoader.setDecoderPath("./draco/");
loader.setDRACOLoader(dracoLoader);

loader.load("../models/textures/island.glb", (gltf) => {
  scene.add(gltf.scene);
});
