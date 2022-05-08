import './css/style.css'

import * as THREE from 'three'
import gsap from 'gsap'
import { easePack } from 'gsap'
import { WebGLRenderer } from "three";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
// JS DIRECTORY
import { SelectiveBloom } from "./js/SelectiveBloom";
// POST-PROCESSING
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { LuminosityShader } from 'three/examples/jsm/shaders/LuminosityShader.js';
import { SobelOperatorShader } from 'three/examples/jsm/shaders/SobelOperatorShader.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
import { Water } from 'three/examples/jsm/objects/Water2.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js';
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';


////////////////////////////////////////////////////////////////////
// SHOW MODAL INFO
///////////////

const modalContainer = document.getElementsByClassName('modal-container')[0];
const showBtn = document.getElementById('show-btn');
const modalBtn = modalContainer.querySelector('button');


const toggleModal = () => {
  modalContainer.classList.toggle('visible');
};

showBtn.addEventListener('click', toggleModal);
modalBtn.addEventListener('click', toggleModal);


////////////////////////////////////////////////////////////////////
// Canvas & UI
///////////////

const canvas = document.querySelector('canvas.webgl')

////////////////////////////////////////////////////////////////////
// Audio
///////////////

const sound = document.getElementById('sound');
const bar01 = document.getElementById('bar01');
const bar02 = document.getElementById('bar02');
const bar03 = document.getElementById('bar03');
const bar04 = document.getElementById('bar04');

window.onload = () => {

  const audioElement = document.getElementById('music');
  const play = document.getElementById('play');
  const pause = document.getElementById('pause');
  const loading = document.getElementById('loading');

  function displayControls() {
    loading.style.display = "none";
  }

  // check that the media is ready before displaying the controls
  if (audioElement.paused) {
    displayControls();
  } else {
    // not ready yet - wait for canplay event
    audioElement.addEventListener('canplay', function() {
      displayControls();
    });
  }

  play.addEventListener('click', function() {
    audioElement.play()
    play.style.display = "none";
    pause.style.display = "block";
  });

  pause.addEventListener('click', function() {
    audioElement.pause();
    pause.style.display = "none";
    play.style.display = "block";
  });

  audioElement.volume = 0.5;
}

sound.onmousemove = (e) => {
  const colors = [
    'MintCream',
    'DodgerBlue',
    'Aqua',
    'Chartreuse',
    'Coral',
    'GoldenRod',
    'GhostWhite',
    'DarkSalmon',
    'DarkTurquoise',
    'HotPink',
    'MediumSpringGreen',
    'PeachPuff',
    'Teal'
  ]
  const random = () => colors[Math.floor(Math.random() * colors.length)];
  document.documentElement.style.cssText = ` --yellow: ${random()}; `
}

////////////////////////////////////////////////////////////////////
// SCENE & CONSTS
///////////////

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })

////////////////////////////////////////////////////////////////////
// LIGHTS 
///////////////

// RectAreaLightUniformsLib.init(); // Initiator Rect Area Lights

// ROTATING LIGHT POINTS

const light1 = new THREE.PointLight('DodgerBlue', 10.0, 1000, 0.5);
scene.add(light1);
const light2 = new THREE.PointLight('Aqua', 10.0, 1000, 0.5);
scene.add(light2);
const light3 = new THREE.PointLight('Chartreuse', 10.0, 1000, 0.5);
scene.add(light3);
const light4 = new THREE.PointLight('GhostWhite', 10.0, 1000, 0.5);
scene.add(light4);

// GOD'S LIGHT



//////////////////////////////////////////////////////////// Lightning Scene Space Launcher

const ambiLight = new THREE.AmbientLight(new THREE.Color('Black'));
scene.add(ambiLight);

const dirLight = new THREE.DirectionalLight('MintCream', 4.8);
dirLight.position.set(0, 1, 0.5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight)


////////////////////////////////////////////////////////////////////
// PARTICLES 
///////////////

// Geometry base for the particles
const particlesGeometry = new THREE.BufferGeometry()
const count = 390

const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 1.2
particlesMaterial.sizeAttenuation = true
particlesMaterial.color = new THREE.Color('#31FF9C').convertSRGBToLinear() //#31FF9C Green Particles

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

const positions = new Float32Array(count * 3) // Multiply by 3 because each position is composed of 3 values (x, y, z)
const colors = new Float32Array(count * 3)

particlesMaterial.size = 0.2

for (let i = 0; i < count * 3; i++) // Multiply by 3 for same reason
{
  positions[i] = (Math.random() - 0.5) * 10 // Math.random() - 0.5 to have a random value between -0.5 and +0.5
  // colors[i] = Math.random()
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)) // Create the Three.js BufferAttribute and specify that each information is composed of 3 values
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors))

const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/stars/star_0.png')

particlesMaterial.map = particleTexture

particlesMaterial.transparent = true
particlesMaterial.alphaMap = particleTexture
// particlesMaterial.alphaTest = 0.001
// particlesMaterial.depthTest = false
particlesMaterial.depthWrite = false
particlesMaterial.blending = THREE.AdditiveBlending
// particlesMaterial.vertexColors = true


////////////////////////////////////////////////////////////////////
// EQUIRECTANGULAR HDR
///////////////

// prefilter the equirectangular environment map for irradiance
function equirectangularToPMREMCube(texture, renderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()

  const cubeRenderTarget = pmremGenerator.fromEquirectangular(texture)

  pmremGenerator.dispose() // dispose PMREMGenerator
  texture.dispose() // dispose original texture
  texture.image.data = null // remove image reference

  return cubeRenderTarget.texture
}

const textureLoad = new RGBELoader()
textureLoad.setPath('textures/equirectangular/')
const textureCube = textureLoad.load('mayoris.hdr', function(texture) {
  textureCube.mapping = THREE.EquirectangularReflectionMapping;
})
scene.background = textureCube;
scene.environment = textureCube;

// textureLoad.setPath( 'textures/equirectangular/' )
// const texture2 = textureLoad.load( 'studio.hdr', function (texture) {
//   texture2.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = texture2;
//   scene.environment = texture2;
// })


////////////////////////////////////////////////////////////////////
// Enviroment Cube
///////////////

// const cubeTextureLoader = new THREE.CubeTextureLoader()
// cubeTextureLoader.setPath('textures/environmentMap/level-4/');
// const environmentMap = cubeTextureLoader.load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);
// environmentMap.encoding = THREE.sRGBEncoding;
// environmentMap.mapping = THREE.CubeRefractionMapping
// scene.environment = environmentMap
// scene.background = environmentMap


////////////////////////////////////////////////////////////////////
// Enviroment & Background alternatives
///////////////

////////////////////
// scene.environment = environmentMap
// scene.background = new THREE.Color( 0xf020f0 );
////////////////////

// scene.environment = environmentMap
// scene.background = new THREE.Color( 0xf020f0 );

////////////////////

// scene.environment = environmentMap
// scene.background = new THREE.Color( 0xf020f0 );
// scene.fog = new THREE.FogExp2( 0xfafafa, 0.72);
////////////////////

// scene.fog = new THREE.FogExp2( 0xf020f0, 0.72);
////////////////////

// LOAD PERLIN NOISE
//////////////////


// HELPERS
///////////////

const axisHelp = new THREE.AxesHelper()

// scene.add( axisHelp )

////////////////////////////////////////////////////////////////////
// MODEL LOADERS
///////////////

const fbxLoader = new FBXLoader()
const gltfLoader = new GLTFLoader()

////////////////////////////////////////////////////////////////////
// VIDEO TEXTURE - VIDEO TEXTURE - VIDEO TEXTURE - VIDEO TEXTURE
///////////////////////////////////////////////////////////////////

// const irisGif = new THREE.ComposedTexture()

// const video = document.getElementById('video');
// const videoTex = new THREE.VideoTexture(video);

const videoWebm = document.getElementById('video2');
const webmTex = new THREE.VideoTexture(videoWebm);
webmTex.minFilter = THREE.LinearFilter;
webmTex.magFilter = THREE.LinearFilter;
webmTex.format = THREE.RGBAFormat;

const paramWebm = {
  side: THREE.DoubleSide,
  emissive: 0xfff0dd,
  emissiveIntensity: 0.1,
  transparent: true,
  alphaTest: 0.5,
  map: webmTex,
};

const geoWebm = new THREE.PlaneGeometry(0.4, 0.2)
const materialWebm = new THREE.MeshStandardMaterial(paramWebm);
const webmObject = new THREE.Mesh(geoWebm, materialWebm)
webmObject.position.set(0, 0.25, 0.25)
webmObject.rotation.y = -1 * Math.PI
webmObject.lookAt(0, 0.3, 0)
scene.add(webmObject)

const startVideoBtn = document.getElementById('start-btn');
startVideoBtn.addEventListener('click', function() { videoWebm.play(); });
videoWebm.addEventListener('play', function() {
  this.currentTime = 3;
});


/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> CURIOUS_KID
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

let kidMixer;
let kidMaterial;

fbxLoader.load(
  'models/fbx/curiousKid/animations/Petting.fbx', (object) => {
    kidMixer = new THREE.AnimationMixer(object);
    const action = kidMixer.clipAction(object.animations[0]);
    action.play();

    kidMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff,
      emissive: 0x000,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 1,
      reflectivity: 0.2,
      // wireframe: true, 
      // vertexColors: true,
      roughness: 0.7,
      metalness: 1,
      map: textureLoader.load("models/fbx/curiousKid/tex/skin003/map.png"),
      metalnessMap: textureLoader.load("models/fbx/curiousKid/tex/skin003/metalnessMap.png"),
      roughnessMap: textureLoader.load("models/fbx/curiousKid/tex/skin003/roughnessMap.png"),
      envMap: textureCube,
    })


    object.traverse(function(object) {
      if (object.isMesh) {
        object.material = kidMaterial;
        object.envMapIntensity = 4.0
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    scene.add(object)

    object.scale.set(.0014, .0014, .0014)
    object.position.set(-0.07, 0.11, -0.11)
    object.rotation.set(0, 45, 0)
  });


/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> SPACE_SHIP: GLASS_SPHERE
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

const radius = 0.6
const segments = 160
const rings = 160

const geometry = new THREE.SphereGeometry(radius, segments, rings)
const glassMaterial = new THREE.MeshPhysicalMaterial({
  side: THREE.BackSide,
  map: textureLoader.load('/textures/water/water.jpg'),
  reflectivity: 0.2,
  transmission: 1.0,
  roughness: 0,
  metalness: 0.1,
  clearcoat: 0.2,
  clearcoatRoughness: 0.6,
  ior: 1.2,
  normalMap: textureLoader.load('/textures/water/Water_2_M_Normal.jpg'),
  normalScale: new THREE.Vector2(0.8, 0.8),
  dithering: true,
  precision: "highp",
  envMap: textureCube,
  envMapIntensity: 1,

});
glassMaterial.thickness = 15.0


const shader = {
uniforms: {
  mRefractionRatio: { value: 0.2 },
  mFresnelBias: { value: 0.2 },
  mFresnelPower: { value: 4.3 },
  mFresnelScale: { value: 4.0 },
  tCube: { value: null }
},
vertexShader: document.querySelector("#shader-vertex").textContent,
fragmentShader: document.querySelector("#shader-fragment").textContent
};

const uniforms = THREE.UniformsUtils.clone(shader.uniforms);

uniforms["tCube"].value = textureCube;

const shaderMaterial = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: shader.vertexShader,
  fragmentShader: shader.fragmentShader
});

shaderMaterial.side = THREE.BackSide
shaderMaterial.color = new THREE.Color('GhostWhite')

const glassphere = new THREE.Mesh(geometry, shaderMaterial);
glassphere.position.set(0, 0, 0)
glassphere.rotation.y = Math.sin * 0.3 
scene.add(glassphere);


/*/*/
/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> LONE_WOLF
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

let loneWolfMixer = null
let lineWolfMaterial;
let loneWolf;

gltfLoader.load('/models/glTF/loneWolf/glTF-Embedded/loneWolf.gltf', (gltf) => {
  loneWolf = gltf.scene
  loneWolf.scale.set(0.0019, 0.0019, 0.0019)
  loneWolf.position.set(0, 0.11, -0.08)
  loneWolf.rotation.set(0, 0, 0)

  lineWolfMaterial = new THREE.LineBasicMaterial( {
  color: 0x0fddbd,
  linewidth: 1,
  linecap: 'round', //ignored by WebGLRenderer
  linejoin:  'round' //ignored by WebGLRenderer
} );
    
  loneWolf.traverse(function(object) {
    if (object.isMesh) {
      object.material = lineWolfMaterial
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  scene.add(loneWolf)

  loneWolfMixer = new THREE.AnimationMixer(gltf.scene)
  const loneWolfAction = loneWolfMixer.clipAction(gltf.animations[0])
  loneWolfAction.play()
})


/*/*/
/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> ROTATOR
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

// gltfLoader.load('models/glTF/rotator.gltf', (gltf) => {
//   gltf.scene.scale.set(0.018, 0.018, 0.018)
//   gltf.scene.position.set(0, 0, 0)
//   gltf.scene.rotation.set(0, 0, 0)
//   scene.add(gltf.scene)

//   let rotator = gltf.scene;
//   let rotatorMaterial = new THREE.MeshPhysicalMaterial(
//   {
//     roughness: 0.7,
//     reflectivity: 1.0,
//     transmission: 1.0,
//     thickness: 1,
//     metalness: 0,
//     clearcoat: 0.3,
//     clearcoatRoughness: 0.25,
//     color: 0xfff,
//     precision: "highp",
//     emissive: 0xfff,
//     emissiveIntensity: 0.5,
//     ior: 2.42,
//     normalMap: textureLoader.load('/textures/water/Water_1_M_Normal.jpg'),
//     normalScale: new THREE.Vector2(3, 3),
//     // index of refraction (IOR) of our fast medium —air— divided by the IOR of our slow medium —glass. 
//     // In this case that will be 1.0 / 1.5, but you can tweak this value to achieve your desired result. 
//     //For example the IOR of water is 1.33 and diamond has an IOR of 2.42
//   }
//   );

//   rotator.traverse((o) => {
//     if (o.isMesh) o.material = rotatorMaterial;
//   });

//   // Animations
//   gsap.to(rotator.rotation, {
//     duration: 1000,
//     ease: "none",
//     y: "+=180",
//     x: "+=180",
//     z: "+=180",
//     repeat: -1
//   });
// })

/*/*/
/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> G.O.D (GRAPHIC_OPERATOR_DECIFER)
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/



/*/*/
/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> CREATIVE_FLOW
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

let creativeFlow;
let cFlowMixer = null

gltfLoader.load('models/glTF/cFlow/cFlow4.glb', (gltf) => {
  creativeFlow = gltf.scene
  creativeFlow.scale.set(0.002, 0.002, 0.002)
  creativeFlow.position.set(0.12, 0.25, 0.15)
  creativeFlow.rotation.set(0, 0, 0)
  scene.add(creativeFlow)

  creativeFlow.traverse(function(object) {
    if (object.isMesh) {
      object.material = glassMaterial;
      object.material.envMap = textureCube;
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  cFlowMixer = new THREE.AnimationMixer(gltf.scene)
  const cFlowAction = cFlowMixer.clipAction(gltf.animations[0])
  cFlowAction.play()
  // cFlowAction.setLoop( THREE.LoopOnce )
  // cFlowAction.setDuration(20).play()
})

/*/*/
/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> ATREZZO: PODIUM
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

let podium;

gltfLoader.load('models/glTF/Podium/podium.gltf', (gltf) => {
  podium = gltf.scene
  podium.scale.set(0.4, 0.4, 0.4)
  podium.position.set(0, 0, -0.1)
  podium.rotation.set(0, 0, 0)

  podium.traverse(function(o) {
    if (o.isMesh) {
      o.material.envmap = textureCube
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  scene.add(podium)
})

/*/*/
/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> ATREZZO: GROUND_MIRROR
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

// const planeC = new THREE.CylinderGeometry(0.4, 0.4, 0.02, 64, 8, false)
// const planeMat = new THREE.MeshPhysicalMaterial({
//   reflectivity: 0.2,
//   transmission: 1.0,
//   roughness: 0,
//   metalness: 0.3,
//   clearcoat: 0.3,
//   ior: 1.33,
//   clearcoatRoughness: 0.25,
//   color: 0x000,
//   ior: 1.5,
// })
// planeMat.thickness = 50.0

// const plane = new THREE.Mesh(planeC, planeMat)
// plane.position.set(0, -0.02, 0)
// plane.receiveShadow = true
// scene.add(plane)

// const planeGeometry = new THREE.CircleGeometry(0.4, 64);
// const groundMirror = new Reflector(planeGeometry, {
//   clipBias: 0.003,
//   textureWidth: window.innerWidth * window.devicePixelRatio,
//   textureHeight: window.innerHeight * window.devicePixelRatio,
//   color: 0x777777,
// });

// groundMirror.position.y = 0;
// groundMirror.rotateX(-Math.PI / 2);
// scene.add( groundMirror );

/*/*/
/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> NATURAL_ELEMENTS: WATER
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

const waterGeometry = new THREE.CircleGeometry(0.5, 80);
const groundGeometry = new THREE.CircleGeometry(0.5, 64);

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x000,
  roughness: 0.6,
  metalness: 0.1,
  normalMap: textureLoader.load('/textures/water/Water_2_M_Normal.jpg'),
  normalScale: new THREE.Vector2(3, 3),
  // map.repeat.set( 4, 4 );
});

const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = Math.PI * -0.5;
scene.add(ground);

const water = new Water(waterGeometry, {
  color: 'GoldenRod',
  scale: 1,
  flowDirection: new THREE.Vector2(-1, 0.8),
  textureWidth: 2048,
  textureHeight: 2048,
  wrapS: THREE.RepeatWrapping,
  wrapT: THREE.RepeatWrapping,
  anisotropy: 16,
  needsUpdate: true,
});
water.position.y = 0.01
water.rotation.x = Math.PI * -0.5

scene.add(water)



////////////////////////////////////////////////////////////////////
// WINDOW SIZES + ASPECT
///////////////

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

  // Sobel Effect
  // effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
  // effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;
})

////////////////////////////////////////////////////////////////////
// CAMERA
///////////////

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.set(-2, -1, 3);
scene.add(camera)

////////////////////////////////////////////////////////////////////
// CONTROLS 
///////////////

const controls = new OrbitControls(camera, canvas)
controls.enable = true
controls.enableDamping = true
controls.dampingFactor = 0.05;
controls.enablePan = true
controls.autoRotate = true
controls.enableZoom = true
controls.autoRotateSpeed = 1
controls.minDistance = 0.3;
controls.maxDistance = 5.0;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2.1
controls.target.set(0, 0, 0);


const resetBtn = document.getElementById('reset-btn')
resetBtn.addEventListener("click", function() {
  camera.position.set(0.3, 0, 0.3);
  controls.update();
});


////////////////////////////////////////////////////////////////////
// Renderer
///////////////

renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.5
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor('#211d20')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


////////////////////////////////////////////////////////////////////
// EFFECT COMPOSER -> POST-PRODUCTION
///////////////

const finalComposer = new EffectComposer(renderer);
const renderScene = new RenderPass(scene, camera);
finalComposer.addPass(renderScene);

/////////////////////////////////////////////////////////////////////////////////// strength, Radius, Threshold
const bloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 1, 1, 0.23);
finalComposer.addPass(bloomPass);

const effectCopy = new ShaderPass(CopyShader);
finalComposer.addPass(effectCopy);

// const effectGrayScale = new ShaderPass( LuminosityShader );
// finalComposer.addPass( effectGrayScale );

// let effectSobel = new ShaderPass( SobelOperatorShader );
// effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
// effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;
// finalComposer.addPass( effectSobel );


const effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.uniforms['resolution'].value.set(1 / sizes.width, 1 / sizes.height);
finalComposer.addPass(effectFXAA);

// const glitchPass = new GlitchPass();
// finalComposer.addPass( glitchPass );

////////////////////////////////////////////////////////////////////
// TWEAK PANE
///////////////////////////////////////////////////////////////////

// const PARAMS = {
//   color: '#0040ff',
//   light5,
//   percentage: 50,
// }


// const pane = new Pane();
// const f = pane.addFolder({
//   title: 'Lights',
//   expanded: true,
// });

// pane.addInput(PARAMS, 'color');
// pane.addInput(
//   PARAMS, 'percentage', { min: 0, max: 100, step: 10 }
// );




////////////////////////////////////////////////////////////////////
// ANIMATION 
///////////////

const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Update controls
  controls.update()


  // Update Particles
  particles.rotation.y = elapsedTime * 0.024
  particles.rotation.x = elapsedTime * 0.008
  particles.rotation.z = elapsedTime * 0.048

  for (let i = 0; i < count; i++) {
    let i3 = i * 1
    const x = particlesGeometry.attributes.position.array[i3]
    particlesGeometry.attributes.position.array[i3 + 0.01] = Math.sin(elapsedTime + x)

  }
  particlesGeometry.attributes.position.needsUpdate = true


  // LIGHT ANIMATIONS
  light1.position.x = Math.sin(elapsedTime * 0.7) * 30
  light1.position.y = Math.cos(elapsedTime * 0.5) * 40;
  light1.position.z = Math.cos(elapsedTime * 0.3) * 30;

  light2.position.x = Math.cos(elapsedTime * 0.3) * 30;
  light2.position.y = Math.sin(elapsedTime * 0.5) * 40;
  light2.position.z = Math.sin(elapsedTime * 0.7) * 30;

  light3.position.x = Math.sin(elapsedTime * 0.7) * 30;
  light3.position.y = Math.cos(elapsedTime * 0.3) * 40;
  light3.position.z = Math.sin(elapsedTime * 0.5) * 30;

  light4.position.x = Math.sin(elapsedTime * 0.3) * 30;
  light4.position.y = Math.cos(elapsedTime * 0.7) * 40;
  light4.position.z = Math.sin(elapsedTime * 0.5) * 30;

  // Glassphere Rotation
  glassphere.rotation.y = Math.sin(elapsedTime * 0.3) * 10.5

  // loneWolf animation
  if (loneWolfMixer) { loneWolfMixer.update(deltaTime) }
  if (cFlowMixer) { cFlowMixer.update(deltaTime) }
  // if (orbitMixer) { orbitMixer.update(deltaTime) }

  // Kid animation
  if (kidMixer) { kidMixer.update(deltaTime) };

  // Render
  finalComposer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()