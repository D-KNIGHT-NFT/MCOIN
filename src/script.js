import './css/style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { ParallaxBarrierEffect } from 'three/examples/jsm/effects/ParallaxBarrierEffect.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js';
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';



/*** Base */

// Debug
// const gui = new dat.GUI()
// const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

const audioElement = document.getElementById( 'music' );
audioElement.play();

const logo = document.getElementById( 'logo' );
logo.addEventListener( 'click', audioElement );


// CARD FLIP
var card = document.querySelector('.card');
card.addEventListener( 'click', function() {
  card.classList.toggle('is-flipped');
});

// CUBE ROTATION
var cube = document.querySelector('.cube');
var radioGroup = document.querySelector('.radio-group');
var currentClass = '';

function changeSide() {
  var checkedRadio = radioGroup.querySelector(':checked');
  var showClass = 'show-' + checkedRadio.value;
  if ( currentClass ) {
    cube.classList.remove( currentClass );
  }
  cube.classList.add( showClass );
  currentClass = showClass;
}
// set initial side
changeSide();

radioGroup.addEventListener( 'change', changeSide );

////////////////////////////////////////////////////////////////////

// Scene
const scene = new THREE.Scene()


/*** Environment maps */
const cubeTextureLoader = new THREE.CubeTextureLoader()
cubeTextureLoader.setPath('textures/environmentMap/level-1/');
const environmentMap = cubeTextureLoader.load(['px.jpg','nx.jpg','py.jpg','ny.jpg','pz.jpg','nz.jpg']);
environmentMap.encoding = THREE.sRGBEncoding;
environmentMap.mapping = THREE.CubeRefractionMapping
environmentMap.envMapIntensity = 1.9

scene.background = environmentMap
scene.environment = environmentMap


/*** Raycaster */

/*** Models */

/*** Load Fox model **/
const gltfLoader = new GLTFLoader()

/*** Models */

let foxMixer = null

gltfLoader.load('/models/Fox/glTF/Fox.gltf', (gltf) =>
    {
        // Model
        gltf.scene.scale.set(0.0019, 0.0019, 0.0019)
        gltf.scene.position.set(0, -0.1, 0)
        gltf.scene.rotation.set(0, 0,  0)
        scene.add(gltf.scene)

        // Animation
        foxMixer = new THREE.AnimationMixer(gltf.scene)
        const foxAction = foxMixer.clipAction(gltf.animations[0])
        foxAction.play()
    }
)


// /*** Load HTDI Logo model **/
// gltfLoader.load('models/logo/glTF/logo.gltf', (gltf) =>
//     {
//         // Model

//         gltf.scene.scale.set(0.0015, 0.0015, 0.0015)
//         gltf.scene.position.set(0, -0.8, 0.38)
//         gltf.scene.rotation.set(0, 0,  0)
//         scene.add(gltf.scene)

//         let logo = gltf.scene;
//         let logoMaterial= new THREE.MeshPhysicalMaterial( 
//         { 
//           side: THREE.BackSide,
//           transmission: 1.4,
//           roughness: 0.01,  
//           thickness: 0.001,
//           clearcoat: 0.1,
//           metalness: 0,
//           reflectivity: 1.9,
//           ior: 5,
//           // clearcoatRoughness: 0.4,
//           envMap: environmentMap,
//           envMapIntensity: 1.4,
//           normalMap: normalMapTexture,
//           normalRepeat: 3,  
//           clearcoatNormalScale: 2.62,
//           // attenuationTint: 0x000000,
//           // attenuationDistance: 3.5,
//           // bloomThreshold: 0.85,
//           // bloomStrength: 0.35,
//           // bloomRadius: 0.33,
//         });

//         logo.traverse((o) => {
//           if (o.isMesh) o.material = logoMaterial;
//         });

//     }
// )


const geometry = new THREE.IcosahedronGeometry(1, 24);
const glassmaterial = new THREE.MeshPhysicalMaterial(
    { 
      side: THREE.DoubleSide,  
      // normalMap: normalMapTexture,
      // normalRepeat: 9,  
      // clearcoatNormalScale: 9.62, 
      reflectivity: 0.9, 
      refractionRatio: 0.985,
      roughness: 0.02, 
      transmission: 1, 
      thickness: 1,
      envMap: environmentMap,
      envMapIntensity: 1.4
  }
);

const glassphere = new THREE.Mesh(geometry, glassmaterial);
glassphere.position.set(0, 0, 0)
glassphere.scale.set(0.34, 0.34, 0.34)
scene.add(glassphere);


/*** Lights */

scene.add( new THREE.AmbientLight( 0x222244 ) )

const light = new THREE.PointLight( 0x7A7194, 0.001, 1000)
light.intensity = 24
light.power = 18
light.distance = 888
light.decay = 2
light.castShadow = true
light.shadow.camera.zoom = 4;
light.position.set(0, -0.2, 0)
scene.add( light )

/*** Sizes */

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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

/*** Cameras */// Base camera

const camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height,0.2, 100)
camera.position.set( 0, 0, -0.01)

scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enable = false
controls.enableDamping = true
controls.autoRotate= true
// controls.enableZoom = false
controls.autoRotateSpeed = 0.7
controls.minDistance = 0.37;
controls.maxDistance = 1.6;
controls.target.set( 0, 0, 0 );

/** POST-PROCESSING */



/** Renderer */

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true})
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.CineonToneMapping
renderer.toneMappingExposure = 0.3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor('#211d20')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/*** Animate */

const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update()

    // Fox animation
    if(foxMixer)
    {
        foxMixer.update(deltaTime)
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()