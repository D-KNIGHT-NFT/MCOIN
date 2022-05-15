import './css/style.css'
import * as THREE from 'three'
import { WebGLRenderer } from "three";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane';
import Stats from 'stats.js'
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { SelectiveBloom } from "./js/SelectiveBloom";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
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
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import Snd from 'snd-lib';


  

const snd = new Snd({preloadSoundKit: Snd.KITS.SND01})
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
// SCENE & CONSTS
///////////////

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })

////////////////////////////////////////////////////////////////////
// Audio
///////////////

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

//////////////////////////////////////////////////////////// Lightning Scene Space Launcher

const ambiLight = new THREE.AmbientLight(new THREE.Color( 0x808080 ));
scene.add(ambiLight);


////////////////////////////////////////////////////////////////////
// PARTICLES 
///////////////

// Geometry base for the particles
const particlesGeometry = new THREE.BufferGeometry()
const count = 590

const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 1.8
particlesMaterial.sizeAttenuation = true
particlesMaterial.color = new THREE.Color('#ffffff').convertSRGBToLinear() //#31FF9C Green Particles

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

const textureLoad = new RGBELoader()
textureLoad.setPath('textures/equirectangular/')
const textureCube = textureLoad.load('omega.hdr', function(texture) {
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


////////////////////////////////////////////////////////////////////
// Enviroment Cube
///////////////

// const cubeTextureLoader = new THREE.CubeTextureLoader()
// cubeTextureLoader.setPath('textures/environmentMap/level-5/');
// const environmentMap = cubeTextureLoader.load(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']);
// environmentMap.encoding = THREE.sRGBEncoding;
// environmentMap.mapping = THREE.CubeRefractionMapping
// // scene.environment = environmentMap
// // // scene.background = environmentMap

// scene.fog = new THREE.FogExp2( 0xff0, 0.2);
////////////////////


////////////////////////////////////////////////////////////////////
// MODEL LOADERS
///////////////

const fbxLoader = new FBXLoader()
const gltfLoader = new GLTFLoader()

////////////////////////////////////////////////////////////////////
// VIDEO TEXTURE - VIDEO TEXTURE - VIDEO TEXTURE - VIDEO TEXTURE
///////////////////////////////////////////////////////////////////

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
      color: 0xf0f0f0,
      map: textureLoader.load("models/fbx/curiousKid/tex/skin000/map.png"),
      metalnessMap: textureLoader.load("models/fbx/curiousKid/tex/skin000/metalnessMap.png"),
      metalness: 1.1,
      roughness: 0.16,
      envMap:textureCube,
    })
    object.traverse(function(object) {
      if (object.isMesh) {
        object.material = kidMaterial;
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
const segments = 80
const rings = 80

const geometry = new THREE.SphereGeometry(radius, segments, rings)
const glassMaterial = new THREE.MeshPhysicalMaterial({
  side: THREE.BackSide, 
  map: textureLoader.load('/textures/bubbleShip/JSp-v1-4K/JSp_v1_basecolor.png'),
  displacementMap: textureLoader.load('/textures/bubbleShip/JSp-v1-4K/JSp_v1_height.png'),
  emissive: '#C161C9',
  emissiveMap: textureLoader.load('/textures/bubbleShip/JSp-v1-4K/JSp_v1_emissive.png'),
  emissiveIntensity:1,
  aoMap: textureLoader.load('/textures/bubbleShip/JSp-v1-4K/JSp_v1_ambientocclusion.png'),
  aoMapIntensity: 1,
  reflectivity: 0.8,
  transmission: 1.0,
  roughnessMap: textureLoader.load('/textures/bubbleShip/JSp-v1-4K/JSp_v1_roughness.png'),
  roughness: 0.5,
  metalnessMap: textureLoader.load('/textures/bubbleShip/JSp-v1-4K/JSp_v1_metallic.png'),
  metalness: 0.01,
  clearcoat: 0.4,
  clearcoatRoughness: 0.6,
  ior: 1.5,
  normalMap: textureLoader.load('/textures/bubbleShip/JSp-v1-4K/JSp_v1_normal.png'),
  normalScale: new THREE.Vector2(0.8, 0.8),
  dithering: true,
  precision: "highp",
  envMap: textureCube
});
glassMaterial.thickness = 8.5

const glassphere = new THREE.Mesh(geometry, glassMaterial);
scene.add(glassphere);

/*/*/
/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> LONE_WOLF
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

let loneWolfMixer = null
let loneWolf;

gltfLoader.load('/models/glTF/loneWolf/glTF-Embedded/loneWolf.gltf', (gltf) => {
  loneWolf = gltf.scene
  loneWolf.scale.set(0.0019, 0.0019, 0.0019)
  loneWolf.position.set(0, 0.11, -0.08)
  loneWolf.rotation.set(0, 0, 0)
 
  loneWolf.traverse(function(object) {
    if (object.isMesh) {
      object.material.environment = textureCube
      object.castShadow = false;
      object.receiveShadow = false;
    }
  })
  scene.add(loneWolf)

  loneWolfMixer = new THREE.AnimationMixer(gltf.scene)
  const loneWolfAction = loneWolfMixer.clipAction(gltf.animations[0])
  loneWolfAction.play()
})
 

/*/*/
/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> Raven_Sham
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

// let ravenMixer = null
let raven;

gltfLoader.load('/models/glTF/raven/scene.gltf', (gltf) => {
  raven = gltf.scene
  raven.scale.set(0.10, 0.10, 0.10)
  raven.position.set(0, 0, 3)
  raven.rotation.set(90, 90, 90)
    
  raven.traverse(function(object) {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  scene.add(raven)
})

// let wall;

// gltfLoader.load('/models/glTF/wall/wall.gltf', (gltf) => {
//   wall = gltf.scene
//   wall.scale.set(1, 1, 1)
//   wall.position.set(0, -0.5, -2)
//   wall.rotation.set(90, 0, 0)
    
//   wall.traverse(function(object) {
//     if (object.isMesh) {
//       object.castShadow = true;
//       object.receiveShadow = true;
//     }
//   });
//   scene.add(wall)
// })

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
      object.material.envMap = textureCube;
      object.castShadow = false;
      object.receiveShadow = true;
    }
  });

  cFlowMixer = new THREE.AnimationMixer(gltf.scene)
  const cFlowAction = cFlowMixer.clipAction(gltf.animations[0])
  cFlowAction.play()
})

/*/*/
/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> ATREZZO: PODIUM
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

let podium;

gltfLoader.load('models/glTF/podium/podium.gltf', (gltf) => {
  podium = gltf.scene
  podium.scale.set(0.4, 0.4, 0.4)
  podium.position.set(0, 0, -0.1)
  podium.rotation.set(0, 0, 0)

  podium.traverse(function(o) {
    if (o.isMesh) {
      o.castShadow = false;
      o.receiveShadow = true;
    }
  });
  scene.add(podium)
})

/*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/ /*/*/
//> NATURAL_ELEMENTS: WATER
//*/*//*/*//*/*//*/*//*/*//*/*/*/*//*/*//*/*//*/*//*/*/

const waterGeometry = new THREE.CircleGeometry(0.5, 80);
const groundGeometry = new THREE.CircleGeometry(0.5, 64);

const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x0a0a0a,
  roughness: 0.3,
  metalness: 0.1,
  normalMap: textureLoader.load('/textures/water/Water_2_M_Normal.jpg'),
  normalScale: new THREE.Vector2(3, 3),
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
})

////////////////////////////////////////////////////////////////////
// CAMERA
///////////////

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.0001, 10000);
camera.position.set(-2, 0, 2);
scene.add(camera)

////////////////////////////////////////////////////////////////////
// CONTROLS 
///////////////

const controls = new OrbitControls(camera, canvas)
controls.enable = true
controls.enableDamping = true
controls.dampingFactor = 0.05;
controls.autoRotate = true
controls.enableZoom = true
controls.autoRotateSpeed = 1
controls.minDistance = 0.3;
controls.maxDistance = 3;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2.1
controls.target.set(0, 0, 0);

////////////////////////////////////////////////////////////////////
// RESET CAMERA VIEW (to refactor asap) 
///////////////
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
renderer.toneMappingExposure = 1
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor( 0x808080 )
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

////////////////////////////////////////////////////////////////////
// EFFECT COMPOSER -> POST-PRODUCTION
///////////////

const finalComposer = new EffectComposer(renderer);
const renderScene = new RenderPass(scene, camera);
finalComposer.addPass(renderScene);

/////////////////////////////////////////////////////////////////////////////////// strength, Radius, Threshold
const bloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 0.8, 1, 0.23);
finalComposer.addPass(bloomPass);

// const effectGrayScale = new ShaderPass( LuminosityShader );
// finalComposer.addPass( effectGrayScale );

const effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.uniforms['resolution'].value.set(1 / sizes.width, 1 / sizes.height);
finalComposer.addPass(effectFXAA);

// const glitchPass = new GlitchPass();
// finalComposer.addPass( glitchPass );

////////////////////////////////////////////////////////////////////
// TWEAK PANE
///////////////////////////////////////////////////////////////////


// DEBUGGING
///////////////

// const stats = new Stats()
// stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
// document.body.appendChild(stats.dom)

// console.log(renderer.info)
// // const axisHelp = new THREE.AxesHelper()
// // scene.add( axisHelp )

////////////////////////////////////////////////////////////////////
// ANIMATION 
///////////////

const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
  // stats.begin()
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


  // loneWolf animation
  if (loneWolfMixer) { loneWolfMixer.update(deltaTime) }
  if (cFlowMixer) { cFlowMixer.update(deltaTime) }
  // if (orbitMixer) { orbitMixer.update(deltaTime) }

  // Kid animation
  if (kidMixer) { kidMixer.update(deltaTime) };
  // if (ravenMixer) { ravenMixer.update(deltaTime) };

  // Render
  finalComposer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
  // stats.end()
}

tick()