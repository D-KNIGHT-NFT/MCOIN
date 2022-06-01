console.clear();

import './css/style.css'
import * as THREE from 'three'
import { WebGLRenderer } from "three";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import SimplexNoise from 'simplex-noise';
import { Pane } from 'tweakpane';
// import * as TweakpaneImagePlugin from 'tweakpane/dist/tweakpane-image-plugin.min.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import Stats from 'stats.js'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
import gsap from "gsap";
// import { normalizeWheel } from './js/normalize-wheel/normalizewheel.js'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader.js';
import { SobelOperatorShader } from 'three/examples/jsm/shaders/SobelOperatorShader.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
import { Water } from 'three/examples/jsm/objects/Water2.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

////////////////////////////////////////////////////////////////////
// Normalize-wheel
///////////////

// document.addEventListener('mousewheel', function (event) {
//     const normalized = normalizeWheel(event);

//     console.log(normalized.pixelX, normalized.pixelY);
// });

//addEventListener('input', e => {
 // let _t = e.target;

  //t.parentNode.parentNode.style.setProperty(`--${_t.id}val`, +_t.value);
//});

////////////////////////////////////////////////////////////////////
// Audio
///////////////

window.onload = () => {
  const audioTrack = document.getElementById('music');
  const play = document.getElementById('play');
  const pause = document.getElementById('pause');

  play.addEventListener('click', function() {
    audioTrack.play()
    play.style.display = "none";
    pause.style.display = "block";
  });

  pause.addEventListener('click', function() {
    audioTrack.pause();
    pause.style.display = "none";
    play.style.display = "block";
  });

  audioTrack.volume = 0.5;
}

const kbllr = document.getElementById('KBLLR')
kbllr.onmousemove = (e) => {
  const hues = [
    'mintcream',
    'dodgerblue',
    'aqua',
    'chartreuse',
    'coral',
    'goldenRod',
    'ghostwhite',
    'darksalmon',
    'darkturquoise',
    'hotpink',
    'mediumspringgreen',
    'peachpuff',
    'teal'
  ]
  const random = () => hues[Math.floor(Math.random() * hues.length)];
  document.documentElement.style.cssText = ` --hue: ${random()}; `
}


////////////////////////////////////////////////////////////////////
// SHOW MODAL INFO
///////////////

const modalContainer = document.getElementsByClassName('modal')[0];
const showBtn = document.getElementById('show-btn');
const modalBtn = modalContainer.querySelector('button');


const toggleModal = () => {
  modalContainer.classList.toggle('visible');
};

showBtn.addEventListener('click', toggleModal);

modalBtn.addEventListener('click', toggleModal);

var canvas2 = document.getElementById("noiseContainer");

canvas2.width = window.innerWidth;
canvas2.height = window.innerHeight;

// Initialize the GL context
var gl = canvas2.getContext('webgl');
if(!gl){
  console.error("Unable to initialize WebGL.");
}

//Time
var time = 0.0;

//************** Shader sources **************

var vertexSource = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

var fragmentSource = `
precision highp float;

uniform float width;
uniform float height;
vec2 resolution = vec2(width, height);

uniform float time;

// See https://www.shadertoy.com/view/3s3GDn for comments on the glow
float getWaveGlow(vec2 pos, float radius, float intensity, float speed, float amplitude, float frequency, float shift){
  
  float dist = abs(pos.y + amplitude * sin(shift + speed * time + pos.x * frequency));
  dist = 1.0/dist;
  dist *= radius;
  dist = pow(dist, intensity);
  return dist;
}

void main(){
    
  vec2 uv = gl_FragCoord.xy/resolution.xy;
  float widthHeightRatio = resolution.x/resolution.y;
  vec2 centre = vec2(0.5, 0.5);
  vec2 pos = centre - uv;
  pos.y /= widthHeightRatio;
    
  float intensity = 1.5;
  float radius = 0.22;
    
  vec3 col = vec3(0.0);
  float dist = 0.0;

  //Use time varying colours from the basic template
  //Add it to vec3(0.1) to always have a bright core
  dist = getWaveGlow(pos, radius,intensity, 2.0, 0.018, 3.7, 0.0);
  col += dist * (vec3(0.1) + 0.5 + 0.5*cos(3.14+time+vec3(0,2,4)));

  dist = getWaveGlow(pos, radius, intensity, 4.0, 0.018, 6.0, 2.0);
  col += dist * (vec3(0.1) + 0.5 + 0.5*cos(1.57+time+vec3(0,2,4)));

  dist = getWaveGlow(pos, radius*0.5, intensity, -5.0, 0.018, 4.0, 1.0);
  col += dist * (vec3(0.1) + 0.5 + 0.5*cos(time+vec3(0,2,4)));

  //Tone mapping function to stop the sharp cutoff of values above 1, leading to smooth uniform fade
  col = 1.0 - exp(-col);

  //Gamma
  col = pow(col, vec3(1));

  // Output to screen
  gl_FragColor = vec4(col, 1.0);
}
`;

//************** Utility functions **************

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform1f(widthHandle, window.innerWidth);
  gl.uniform1f(heightHandle, window.innerHeight);
}


//Compile shader and combine with source
function compileShader(shaderSource, shaderType){
  var shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
  if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
    throw "Shader compile failed with: " + gl.getShaderInfoLog(shader);
  }
  return shader;
}

//From https://codepen.io/jlfwong/pen/GqmroZ
//Utility to complain loudly if we fail to find the attribute/uniform
function getAttribLocation(program, name) {
  var attributeLocation = gl.getAttribLocation(program, name);
  if (attributeLocation === -1) {
    throw 'Cannot find attribute ' + name + '.';
  }
  return attributeLocation;
}

function getUniformLocation(program, name) {
  var attributeLocation = gl.getUniformLocation(program, name);
  if (attributeLocation === -1) {
    throw 'Cannot find uniform ' + name + '.';
  }
  return attributeLocation;
}

//************** Create shaders **************

//Create vertex and fragment shaders
var vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
var fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);

//Create shader programs
var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

gl.useProgram(program);

//Set up rectangle covering entire canvas 
var vertexData = new Float32Array([
  -1.0,  1.0,   // top left
  -1.0, -1.0,   // bottom left
   1.0,  1.0,   // top right
   1.0, -1.0,   // bottom right
]);

//Create vertex buffer
var vertexDataBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexDataBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

// Layout of our data in the vertex buffer
var positionHandle = getAttribLocation(program, 'position');

gl.enableVertexAttribArray(positionHandle);
gl.vertexAttribPointer(positionHandle,
  2,        // position is a vec2 (2 values per component)
  gl.FLOAT, // each component is a float
  false,    // don't normalize values
  2 * 4,    // two 4 byte float components per vertex (32 bit float is 4 bytes)
  0         // how many bytes inside the buffer to start from
  );

//Set uniform handle
var timeHandle = getUniformLocation(program, 'time');
var widthHandle = getUniformLocation(program, 'width');
var heightHandle = getUniformLocation(program, 'height');

gl.uniform1f(widthHandle, window.innerWidth);
gl.uniform1f(heightHandle, window.innerHeight);

var lastFrame = Date.now();
var thisFrame;

function draw(){
  
  //Update time
  thisFrame = Date.now();
  time += (thisFrame - lastFrame)/3000; 
  lastFrame = thisFrame;

  //Send uniforms to program
  gl.uniform1f(timeHandle, time);
  //Draw a triangle strip connecting vertices 0-4
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(draw);
}

draw();


////////////////////////////////////////////////////////////////////
// WEBGL-THREEJS -->CANVAS -->EXPERIENCE
////////////////////////////////////////////////////////////////////

const canvas1 = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()
const paramRender = {
  canvas: canvas1,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance",
}
const renderer = new WebGLRenderer(paramRender);

const textureLoader = new THREE.TextureLoader()

const eyeGroup = new THREE.Group();

const eyeRadius = 0.03;

const eyeAddonGeometry = new THREE.SphereGeometry(eyeRadius, 32, 32);

const eyeAddonMaterial = new THREE.MeshPhongMaterial({
  opacity: 0.5,
  shininess: 1,
  transparent: true
});

const eyeAddon = new THREE.Mesh(eyeAddonGeometry, eyeAddonMaterial);
eyeGroup.add(eyeAddon);

let config = {
  zoomLevel: 0,
  zoomLevelBounds: [10, 10],
  shrink: 0,
  fstBaseColor: 0xA9A9A9,
  scdBaseColor: 0x696969,
  midColor: 0xD2691E,
  vignette: .55,
  brightness: .1,
  darkness: .1,
};

const eyeGeometry = new THREE.SphereGeometry(eyeRadius, 32, 32);
const eyeShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    u_shrink: { type: 'f', value: config.shrink },
    u_base_color_1: { type: 'v3', value: new THREE.Color(config.fstBaseColor) },
    u_base_color_2: { type: 'v3', value: new THREE.Color(config.scdBaseColor) },
    u_mid_color: { type: 'v3', value: new THREE.Color(config.midColor) },
    u_vignette: { type: 'f', value: config.vignette },
    u_brightness: { type: 'f', value: config.brightness },
    u_darkness: { type: 'f', value: config.darkness },
  },
  vertexShader: document.getElementById('vertexShader').textContent,
  fragmentShader: document.getElementById('fragmentShader').textContent,
});

const eye = new THREE.Mesh(eyeGeometry, eyeShaderMaterial);
eye.rotation.y = -Math.PI / 2;
eyeGroup.add(eye);
eyeGroup.position.set(0.1, 0.03, 0.1)
eyeGroup.rotation.set(0, 48, 0)

scene.add(eyeGroup);

//*//
// CAMERA
//*//

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 0, 3);

scene.add(camera)

////////////////////////////////////////////////////////////////////
// CONTROLS 
///////////////

const controls = new OrbitControls(camera, canvas1)
controls.enable = true
controls.enableDamping = true
controls.dampingFactor = 0.05;
controls.autoRotate = true
controls.enableZoom = false
controls.autoRotateSpeed = 1.5
controls.minDistance = 0.3;
controls.maxDistance = 3;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2.1
controls.target.set(0, 0, 0);

////////////////////////////////////////////////////////////////////
// RESET CAMERA - Enter / Leave Room
///////////////
const resetBtn = document.getElementById('reset-btn')
const exitBtn = document.getElementById('exit-btn')

resetBtn.addEventListener("click", function() {
  camera.position.set(0.42, 0.05, 0);
  controls.target.set(0, 0.05, 0);
  controls.update();
});

exitBtn.addEventListener("click", function() {
  camera.position.set(2, 0.2, 4);
  controls.target.set(0, 0, 0);
  controls.update();
});


//*//
// WINDOW SIZES + ASPECT
//*//

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})


////////////////////////////////////////////////////////////////////
// LIGHTS 
///////////////

// ROTATING LIGHT POINTS

const light1 = new THREE.PointLight('dodgerblue', 10.0, 100, 0.5);
const light2 = new THREE.PointLight('aqua', 10.0, 100, 0.5);
const light3 = new THREE.PointLight('chartreuse', 10.0, 100, 0.5);
const light4 = new THREE.PointLight('ghostwhite', 10.0, 100, 0.5);
scene.add(light1, light2, light3, light4);

//////////////////////////////////////////////////////////// Lightning Scene Space Launcher


//==================================================
//https://threejs.org/docs/#api/en/constants/Textures
//===================================================
// EQUIRECTANGULAR HDR
//===================================================

const textureLoad = new RGBELoader()

textureLoad.setPath('textures/equirectangular/')
const textureCube = textureLoad.load('mayoris.hdr', function(texture) {
  textureCube.mapping = THREE.EquirectangularReflectionMapping;
})

// prefilter the equirectangular environment map for irradiance
function equirectangularToPMREMCube(textureCube, renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()

  const cubeRenderTarget = pmremGenerator.fromEquirectangular(textureCube)

  pmremGenerator.dispose() // dispose PMREMGenerator
  texture.dispose() // dispose original texture
  texture.image.data = null // remove image reference

  return cubeRenderTarget.textureCube
}

scene.environment = textureCube;
scene.fog = new THREE.FogExp2(0x556B2F, 0.2);
// scene.background = new THREE.Color( 0x9400D3 );

////////////////////////////////////////////////////////////////////
// MODEL LOADERS
///////////////

const fbxLoader = new FBXLoader()
const gltfLoader = new GLTFLoader()

/////////////////////////////////////////////////////////////////////////////
// VIDEO TEXTURE TV - VIDEO TEXTURE TV - VIDEO TEXTURE TV  - VIDEO TEXTURE TV 
////////////////////////////////////////////////////////////////////////////


// const videoWebm = document.getElementById('videoFrame');
// const webmTex = new THREE.VideoTexture(videoWebm);

// webmTex.minFilter = THREE.LinearFilter;
// webmTex.magFilter = THREE.LinearFilter;
// webmTex.wrapS = THREE.ClampToEdgeWrapping;
// webmTex.wrapT = THREE.ClampToEdgeWrapping;

// const paramWebm = {
//   side: THREE.DoubleSide,
//   emissive: 0x9ACD32,
//   emissiveIntensity: 0.25,
//   transparent: true,
//   opacity: 0.8,
//   alphaTest: 0.5,
//   map: webmTex,
// };

// const materialWebm = new THREE.MeshStandardMaterial(paramWebm);
// materialWebm.emissive.convertSRGBToLinear()

const startVideoBtn = document.getElementById('start-btn');
const spinVideo = document.getElementById('spin')
startVideoBtn.addEventListener('click', function() { spin.play(); });


/////////////////////////////////////////////////////////////////////////////
// VIDEO TEXTURE 👁- VIDEO TEXTURE 👁 - VIDEO TEXTURE 👁  - VIDEO TEXTURE 👁
////////////////////////////////////////////////////////////////////////////


// const videoEye = document.getElementById('eye')
// const webmEye = new THREE.VideoTexture(videoEye)

// webmEye.minFilter = THREE.LinearFilter;
// webmEye.magFilter = THREE.LinearFilter;
// webmEye.offsetY = 0.030
// webmEye.repeat = 0.940

// webmEye.format = THREE.RGBAFormat

// const paramEye = {
//   side: THREE.DoubleSide,
//   emissive: 0xEE82EE,
//   emissiveIntensity: .5,
//   transparent: true,
//   opacity: 0.98,
//   precision: "highp",
//   map: webmEye,
//   fog: true,
//   envMap: textureCube,
//   // blending: THREE.SubtractiveBlending,
//   // blending: THREE.MultiplyBlending,

// };

// const materialEye = new THREE.MeshLambertMaterial(paramEye);
// materialEye.emissive.convertSRGBToLinear()


/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> SPACE_SHIP: ORBITEYE
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

// const radius = 0.7
// const segments = 104
// const rings = 104

// const geometry = new THREE.SphereGeometry(radius, segments, rings)
// const orbitEye = new THREE.Mesh(geometry, materialEye);
// scene.add(orbitEye);

/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> CURIOUS_KID
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

let kidMixer;
let kidMaterial;

fbxLoader.load(
  'models/fbx/curiousKid/animations/sitting1.fbx', (object) => {
    kidMixer = new THREE.AnimationMixer(object);
    const action = kidMixer.clipAction(object.animations[0]);
    action.play();

    kidMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xDA70D6, //0xFAFAD2,lightgoldenrodyellow 0xC71585, mediumVioletRed
      transmission: 0.3,
      opacity: 1.0,
      metalnessMap: textureLoader.load("models/fbx/curiousKid/tex/skin000/metalnessMap.png"),
      metalness: 0.8,
      roughnessMap: textureLoader.load("models/fbx/curiousKid/tex/skin004/roughness.png"),
      roughness: 0.1,
      ior: 1.5,
      thickness: 4,
      specularIntensity: 10,
      specularColor: 0xB0C4DE,
      envMap: textureCube,
      envMapIntensity: 1.5,
      map: textureLoader.load("models/fbx/curiousKid/tex/skin004/map.png")
    })
    kidMaterial.color.convertSRGBToLinear()

    object.traverse(function(object) {
      if (object.isMesh) {
        object.material = kidMaterial;
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    scene.add(object)

    object.scale.set(.0014, .0014, .0014)
    // object.position.set(-0.07, 0.11, -0.11)
    object.position.set(-0.07, 0, -0.11)
    object.rotation.set(0, 45, 0)
  });


/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> CREATIVE_FLOW
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

let creativeFlow;
let cFlowMixer = null

gltfLoader.load('models/glTF/cFlow/cFlow4.glb', (gltf) => {
  creativeFlow = gltf.scene
  creativeFlow.scale.set(0.002, 0.002, 0.002)
  creativeFlow.position.set(0, 0.08, 0)
  creativeFlow.rotation.set(0, 0, 0)
  scene.add(creativeFlow)

  creativeFlow.traverse(function(object) {
    if (object.isMesh) {
      object.material.envMap = textureCube;
      object.castShadow = false;
      object.receiveShadow = true;
    }
  });

  cFlowMixer = new THREE.AnimationMixer(gltf.scene)
  const cFlowAction = cFlowMixer.clipAction(gltf.animations[0])
  cFlowAction.play()
})


/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> NATURAL_ELEMENTS: WATER
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

const waterGeometry = new THREE.CircleGeometry(0.5, 80);
const groundGeometry = new THREE.CircleGeometry(0.5, 64);

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x4682B4,
  roughness: 0.05,
  metalness: 0.1,
  normalMap: textureLoader.load('/textures/water/Water_2_M_Normal.jpg'),
  normalScale: new THREE.Vector2(3, 3),
});
groundMaterial.color.convertSRGBToLinear()

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = Math.PI * -0.5;
scene.add(ground);

const water = new Water(waterGeometry, {
  color: 0xDDA0DD,
  scale: 0.5,
  flowDirection: new THREE.Vector2(-1, 1),
  textureWidth: 1024,
  textureHeight: 1024,
  wrapS: THREE.RepeatWrapping,
  wrapT: THREE.RepeatWrapping,
  anisotropy: 16,
  needsUpdate: true,
});
water.position.set(0,0.015,0)
water.rotation.x = Math.PI * -0.5

scene.add(water)


////////////////////////////////////////////////////////////////////
// Renderer
///////////////

renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.LinearEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.100
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor(0x000000, 0.6)
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

////////////////////////////////////////////////////////////////////
// FX COMPOSSER - POST-PRODUCTION
///////////////

const composer = new EffectComposer(renderer)
composer.addPass(new RenderPass(scene, camera))
composer.addPass(new EffectPass(camera, new BloomEffect()));

/////////////////////////////////////////////////////////////////////// strength, Radius, Threshold
// const bloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 0.8, 0.5, 0.03)
// composer.addPass(new EffectPass(camera, bloomPass))

// const effectGrayScale = new ShaderPass( LuminosityShader );
// composer.addPass( effectGrayScale );

// const effectFXAA = new ShaderPass(FXAAShader)
// effectFXAA.uniforms['resolution'].value.set(1 / sizes.width, 1 / sizes.height)

// const glitchPass = new GlitchPass();
// composer.addPass( glitchPass );

////////////////////////////////////////////////////////////////////
// TWEAK PANE
///////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
// CLOCK - UPDATE 
///////////////

const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Update controls

  controls.update()

  // Update Panes

  // LIGHT ANIMATIONS

  light1.position.x = Math.sin(elapsedTime * 0.7) * 30
  light1.position.y = Math.cos(elapsedTime * 0.9) * 40;
  light1.position.z = Math.cos(elapsedTime * 0.3) * 30;

  light2.position.x = Math.cos(elapsedTime * 0.9) * 30;
  light2.position.y = Math.sin(elapsedTime * 0.5) * 40;
  light2.position.z = Math.sin(elapsedTime * 0.7) * 30;

  light3.position.x = Math.sin(elapsedTime * 0.7) * 30;
  light3.position.y = Math.cos(elapsedTime * 0.3) * 40;
  light3.position.z = Math.sin(elapsedTime * 0.9) * 30;

  light4.position.x = Math.sin(elapsedTime * 0.3) * 30;
  light4.position.y = Math.cos(elapsedTime * 0.7) * 40;
  light4.position.z = Math.sin(elapsedTime * 0.9) * 30;


  // Update Animation Mixers

  // if (loneWolfMixer) { loneWolfMixer.update(deltaTime) }
  if (cFlowMixer) { cFlowMixer.update(deltaTime) }
  if (kidMixer) { kidMixer.update(deltaTime) };

  // Render
  composer.render(scene, camera);

  // Update PARAMS

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)

}

tick()