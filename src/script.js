import './css/style.css'

import * as THREE from 'three'
import gsap from 'gsap'
import { easePack } from 'gsap'
import { WebGLRenderer } from "three";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
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
// DEBUGGER- TWEAK PANE
///////////////


// HELPERS
///////////////

// const axisHelp = new THREE.AxesHelper()
//scene.add( axisHelp )


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
  const colors = 
  [
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

RectAreaLightUniformsLib.init(); // Initiator Rect Area Lights

// ROTATING LIGHT POINTS

const light1 = new THREE.PointLight(0x800040, 20.0, 1000, 2);
scene.add(light1);
const light2 = new THREE.PointLight(0x0040ff, 20.0, 1000, 2);
scene.add(light2);
const light3 = new THREE.PointLight(0x80ff80, 20.0, 1000, 2);
scene.add(light3);
const light4 = new THREE.PointLight(0xffaa00, 20.0, 1000, 2);
scene.add(light4);

// GOD'S LIGHT

const light5 = new THREE.PointLight(0x0040ff, 1.0, 1000, 2);
light5.position.set(0.2, 0.25, -0.1)
light5.castShadow = true
scene.add(light5);

//////////////////////////////////////////////////////////// Lightning Scene Space Launcher

// const ambientLight = new THREE.AmbientLight(0x8322c9, 10.0);
// scene.add(ambientLight);

// const rectLight2 = new THREE.RectAreaLight(0x18FEFE, 10.0);
// rectLight2.lookAt(0, 0, 0);
// rectLight2.position.set(10, 0, -10);
// scene.add(rectLight2);

// const rectLight4 = new THREE.RectAreaLight(0xffffff, 10.0);
// rectLight4.lookAt(0, 0, 0);
// rectLight4.position.set(-10, 0, 10);
// scene.add(rectLight4);

///////////////////////////////////////////////////////////// Lightning Scene Gold Dreams

// const ambientLight = new THREE.AmbientLight( 0x0040ff, 2.6)
// ambientLight.position.set( 0, 1, 0 );
// scene.add(ambientLight);

// const rectLight2 = new THREE.RectAreaLight( 0xD6B201 , 1.2 );
// rectLight2.position.set( 1, 0, -1 );
// rectLight2.rotation.set( 0, 360 ,0 )
// scene.add( rectLight2 );

// const rectLight4 = new THREE.RectAreaLight( 0xffffff , 1.2, 56, 56);
// rectLight4.position.set( -1, 0, 1 );
// rectLight4.rotation.set( 0, 0 ,0 )
// scene.add( rectLight4 );

// scene.add( new RectAreaLightHelper( rectLight1 ) );
// scene.add( new RectAreaLightHelper( rectLight2 ) );

const directionaLight = new THREE.DirectionalLight( 0xD6B201, 0.6 );
directionaLight.position.set( 0, 0.5, -1 );
directionaLight.castShadow = true;
directionaLight.shadow.mapSize.width = 2048;
directionaLight.shadow.mapSize.height = 2048;

const d = 10;

directionaLight.shadow.camera.left = - d;
directionaLight.shadow.camera.right = d;
directionaLight.shadow.camera.top = d;
directionaLight.shadow.camera.bottom = - d;
directionaLight.shadow.camera.far = 2000;
scene.add( directionaLight );

////////////////////////////////////////////////////////////////////
// PARTICLES 
///////////////

// Geometry base for the particles
const particlesGeometry = new THREE.BufferGeometry()
const count = 39

const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 2.2
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
const particleTexture = textureLoader.load('/textures/particles/stars/star_07.png')

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
textureLoad.setPath( 'textures/equirectangular/' )
const texture = textureLoad.load( 'mayoris.hdr', function (texture) {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
})
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
// VIDEO TEXTURE & OBJECT
///////////////

const normalTexture2 = textureLoader.load('/textures/water/Water_2_M_Normal.jpg')
const normalTexture1 = textureLoader.load('/textures/water/Water_1_M_Normal.jpg')
const alphaTextureTv = textureLoader.load('/textures/videoObject/alphaMap/frameTv.png')
const emissiveTextureTv = textureLoader.load('/textures/videoObject/emissiveMap/frameTv.png')
const aoTextureTv = textureLoader.load('/textures/videoObject/aoMap/frameTv.png')

const vNormal = new THREE.Vector2( 3, 3 );
const video = document.getElementById('video');
const vTexture = new THREE.VideoTexture(video);
const startButton = document.getElementById('start-btn');
const parameters = { 
emissive: 0xffffff,
alphaMap: alphaTextureTv,
aoMap: aoTextureTv,
aoMapIntensity: 1, 
map: vTexture,
emissiveMap : emissiveTextureTv,
emissiveIntensity : 1.0,
envMap: texture,
};
const geometryV = new THREE.BoxGeometry(0.4, 0.2, 0.001);
const materialV = new THREE.MeshStandardMaterial(parameters);
const videoObject = new THREE.Mesh(geometryV, materialV);

videoObject.position.set(0, 0.25, 0.25)
scene.add(videoObject)

startButton.addEventListener('click', function() { video.play(); });

video.addEventListener('play', function() {
  this.currentTime = 3;
});
////////////////////////////////////////////////////////////////////
// Enviroment & Background alternatives
///////////////

////////////////////
// scene.environment = environmentMap
// scene.background = new THREE.Color( 0xf020f0 );
////////////////////

// scene.environment = environmentMap
// scene.background = new THREE.Color( 0xf020f0 );
// scene.fog = new THREE.Fog( scene.background, 0.1, 1 );
////////////////////

// scene.environment = environmentMap
// scene.background = new THREE.Color( 0xf020f0 );
// scene.fog = new THREE.FogExp2( 0xfafafa, 0.72);
////////////////////

// scene.fog = new THREE.FogExp2( 0xf020f0, 0.72);
////////////////////

////////////////////////////////////////////////////////////////////
// MESHES + LOADERS
///////////////

const radius = 0.5,segments = 128,rings = 128;
const geometry = new THREE.SphereGeometry(radius, segments, rings)
const glassMaterial = new THREE.MeshPhysicalMaterial({
  reflectivity: 0.2,
  transmission: 1.0,
  roughness: 0,
  metalness: 0,
  clearcoat: 0.3,
  clearcoatRoughness: 0.45,
  color: new THREE.Color('#ffffff').convertSRGBToLinear(),
  ior: 1.2,
  precision: "highp",
  alphaTest: 1,
  envMap: texture,
});
glassMaterial.thickness = 10.0

// LOAD PERLIN NOISE
//////////////////

let materialShade;

materialShade = new THREE.ShaderMaterial( {
vertexShader: document.getElementById( 'vertexShader' ).textContent,
fragmentShader: document.getElementById( 'fragmentShader' ).textContent, parameters
} );

const glassphere = new THREE.Mesh(geometry, glassMaterial);
glassphere.position.set(0, 0, 0)
scene.add(glassphere);


// FBX LOADER
///////////////

let kidMixer;

const fbxLoader = new FBXLoader()
fbxLoader.load(
  'models/fbx/curiousKid/Petting.fbx', (object) => {
    kidMixer = new THREE.AnimationMixer(object);
    const action = kidMixer.clipAction(object.animations[0]);
    action.play();

    object.traverse(function(object) {
      if (object.isMesh) {
        object.material.envMap = texture;
        object.envMapIntensity = .0
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    scene.add(object)
    object.scale.set(.0014, .0014, .0014)
    object.position.set(-0.07, 0.11, -0.11)
    object.rotation.set(0, 45, 0)
  });

/*const baseColorMap = textureLoader.load("models/fbx/Rainbow_baseColor.png");
const metallicMap = textureLoader.load("models/fbx/Rainbow_metallic.png");
const roughnessMap = textureLoader.load("models/fbx/Rainbow_roughness.png");
  map: baseColorMap;
  metalnessMap: metallicMap;
  roughnessMap;
*/


// GLTF  LOADER
///////////////

const gltfLoader = new GLTFLoader()
let foxMixer = null

gltfLoader.load('/models/glTF/Fox/glTF/Fox.gltf', (gltf) => {
  // Model
  const fox = gltf.scene
  fox.scale.set(0.0019, 0.0019, 0.0019)
  fox.position.set(0, 0.11, -0.08)
  fox.rotation.set(0, 0, 0)

  fox.traverse(function(object) {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });
  scene.add(fox)

  // Animation
  foxMixer = new THREE.AnimationMixer(gltf.scene)
  const foxAction = foxMixer.clipAction(gltf.animations[0])
  foxAction.play()
})




// /*** Load Rotator model **/
gltfLoader.load('models/glTF/rotator.gltf', (gltf) => {
  gltf.scene.scale.set(0.018, 0.018, 0.018)
  gltf.scene.position.set(0, 0, 0)
  gltf.scene.rotation.set(0, 0, 0)
  scene.add(gltf.scene)

  let rotator = gltf.scene;
  let rotatorMaterial = new THREE.MeshPhysicalMaterial({
    reflectivity: 1.0,
    transmission: 1.0,
    metalness: 0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
    color: new THREE.Color('#ffffff').convertSRGBToLinear(),
    side: THREE.FrontSide,
    precision: "highp",
    emissive: 0.01,
    roughness: 0,
    ior: 2.42, 
    normalMap: normalTexture1,
    normalType: 1,
    normalScale: vNormal,
    // index of refraction (IOR) of our fast medium —air— divided by the IOR of our slow medium —glass. 
    // In this case that will be 1.0 / 1.5, but you can tweak this value to achieve your desired result. 
    //For example the IOR of water is 1.33 and diamond has an IOR of 2.42
  });
  rotatorMaterial.thickness = 10.0

  rotator.traverse((o) => {
    if (o.isMesh) o.material = rotatorMaterial;
  });

  // Animations
  gsap.to(rotator.rotation, {
    duration: 1000,
    ease: "none",
    y: "+=180",
    x: "+=180",
    z: "+=180",
    repeat: -1
  });
})

// GLTF LOADER FOR Creative Flow 
//////////////////////
let creativeFlow;
let cFlowMixer = null

gltfLoader.load('models/glTF/cFlow/cFlow4.glb', (gltf) => {
  creativeFlow = gltf.scene
  creativeFlow.scale.set( 0.002, 0.002, 0.002)
  creativeFlow.position.set(0.12, 0.25, 0.15)
  creativeFlow.rotation.set(0, 0, 0)
  scene.add(creativeFlow)

  creativeFlow.traverse(function(object) {
    if (object.isMesh) {
      object.material= glassMaterial;
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

// OBJ + MTL LOADER FOR CFLOW+BUBBLE
//////////////////////

// let orbit;

// let mtlLoader = new MTLLoader();
// let objLoader = new OBJLoader();
// mtlLoader.load('models/obj/orbit/orbit.mtl', function(materials)
// {
//     materials.preload();
//     objLoader.setMaterials(materials);
//     objLoader.load('models/obj/orbit/orbit.obj', function(object)
//     {    
//         orbit = object;
//         orbit.scale.set(1, 1, 1)
//         orbit.position.set(0,0, 0)
//         orbit.rotation.set(0, 0, 0)
//         scene.add( orbit );
//     });
// });

// GLTF LOADER FOR PODIUM
//////////////////////
let podium;

gltfLoader.load('models/glTF/Podium/podium.gltf', (gltf) => {
  podium = gltf.scene
  podium.scale.set(0.4, 0.4, 0.4)
  podium.position.set(0, 0, -0.1)
  podium.rotation.set(0, 0, 0)

  podium.traverse(function(o) {
    if (o.isMesh) {
      o.material.envmap = texture
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  scene.add(podium)
})

// GLTF LOADER FOR GOD
//////////////////////
let god;

gltfLoader.load('models/glTF/god/g-o-d.gltf', (gltf) => {
  god = gltf.scene
  god.scale.set(0.03, 0.03, 0.03)
  god.position.set(0.2, 0.1867, -0.1)
  god.rotation.set(0, 45, 0)

  god.traverse(function(o) {
    if (o.isMesh) {
      o.material.envmap = texture
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  scene.add(god)
})


// GROUND MIRROR
//////////////////////

const planeC = new THREE.CylinderGeometry(0.4, 0.4, 0.02, 64, 8, false)
const planeMat = new THREE.MeshPhysicalMaterial({
  reflectivity: 1.0,
  transmission: 1.0,
  roughness: 0,
  metalness: 0.3,
  clearcoat: 0.3,
  ior: 1.33,
  clearcoatRoughness: 0.25,
  color: new THREE.Color('#000000').convertSRGBToLinear(),
  ior: 1.5,
})

planeMat.thickness = 50.0
const plane = new THREE.Mesh(planeC, planeMat)
plane.position.set(0, -0.02, 0)
plane.receiveShadow = true
scene.add(plane)

const planeGeometry = new THREE.CircleGeometry(0.4, 64);
const groundMirror = new Reflector(planeGeometry, {
  clipBias: 0.003,
  textureWidth: window.innerWidth * window.devicePixelRatio,
  textureHeight: window.innerHeight * window.devicePixelRatio,
  color: new THREE.Color('#777777').convertSRGBToLinear()
});

groundMirror.position.y = 0;
groundMirror.rotateX(-Math.PI / 2);
// scene.add( groundMirror );

// WATER TEXTURE
//////////////////
const groundGeometry = new THREE.CircleGeometry(0.4, 64);
const groundMaterial = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.4 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = Math.PI * -0.5;
scene.add(ground);

const textureLoader2 = new THREE.TextureLoader()
textureLoader2.load('textures/grid03.png', function(map) {
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 16;
  // map.repeat.set( 4, 4 );
  groundMaterial.map = map;
  groundMaterial.needsUpdate = true;
})

const waterGeometry = new THREE.CircleGeometry(0.5, 48);
const water = new Water(waterGeometry, {
  color: '#ffffff',
  scale: 1,
  flowDirection: new THREE.Vector2(-1, 0.8),
  textureWidth: 2048,
  textureHeight: 2048
});

water.position.y = 0.01;
water.rotation.x = Math.PI * -0.5;
scene.add(water);


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

const camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 0.5, 0.3, 0.3);
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
controls.maxDistance = 10;
controls.target.set(0, 0.3, 0);


const resetBtn = document.getElementById('reset-btn')
resetBtn.addEventListener("click", function() {
camera.position.set( 0.5, 0.3, 0.33);
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
const bloomPass = new UnrealBloomPass(new THREE.Vector2(sizes.width, sizes.height), 0.4, 0.001, 0.02);
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

const PARAMS = {
  color: '#0040ff', light5,
  percentage: 50,
}


const pane = new Pane();
const f = pane.addFolder({
  title: 'Lights',
  expanded: true,
});

pane.addInput(PARAMS, 'color');
pane.addInput(
  PARAMS, 'percentage',
  {min: 0, max: 100, step: 10}
);




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


  // Fox animation
  if (foxMixer) { foxMixer.update(deltaTime) }
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