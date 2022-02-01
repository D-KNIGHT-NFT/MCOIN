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

// Scene
const scene = new THREE.Scene()

/*** Update all materials */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            child.material.envMap = debugObject.envMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/*** Environment maps */
const cubeTextureLoader = new THREE.CubeTextureLoader()
cubeTextureLoader.setPath('textures/environmentMap/');
const environmentMap = cubeTextureLoader.load(['px.jpg','nx.jpg','py.jpg','ny.jpg','pz.jpg','nz.jpg']);
environmentMap.encoding = THREE.sRGBEncoding;
environmentMap.envMapIntensity = 0.5

// const hdrEquirect = new THREE.RGBELoader().load(
//     "/empty_warehouse_01_2k.hdr",
//     () => {
//       hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
//     }
//   );

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
        gltf.scene.scale.set(0.003, 0.002, 0.002)
        gltf.scene.position.set(0, 1.1, -0.3)
        gltf.scene.rotation.set(0, 0,  0)
        scene.add(gltf.scene)

        // Animation
        foxMixer = new THREE.AnimationMixer(gltf.scene)
        const foxAction = foxMixer.clipAction(gltf.animations[0])
        foxAction.play()

        // Update materials
        updateAllMaterials()
    }
)
const textureLoader = new THREE.TextureLoader();
const normalMapTexture = textureLoader.load('textures/tile/nm.png');
normalMapTexture.wrapS = THREE.RepeatWrapping;
normalMapTexture.wrapT = THREE.RepeatWrapping;

/*** Load HTDI Logo model **/
gltfLoader.load('models/logo/glTF/logo.gltf', (gltf) =>
    {
        // Model

        gltf.scene.scale.set(0.0015, 0.0015, 0.0015)
        gltf.scene.position.set(0, -0.5, 0)
        gltf.scene.rotation.set(0, 0,  0)
        scene.add(gltf.scene)

        let logo = gltf.scene;
        let logoMaterial= new THREE.MeshPhysicalMaterial( 
        {
          transmission: 1,
          color: 0x8800ff,
          roughness: 0.2,  
          thickness: 0.9,
          clearcoat: 0.8,
          metalness: 0.1,
          reflectivity: 0.5,
          ior: 1.65,
          clearcoatRoughness: 0.4,
          envMap: environmentMap,
          envMapIntensity: 1.6,
          normalMap: normalMapTexture,
          normalRepeat: 3,  
          clearcoatNormalScale: 2.62,
          attenuationTint: 0xffffff,
          attenuationDistance: 3.5,
          // bloomThreshold: 0.85,
          // bloomStrength: 0.35,
          // bloomRadius: 0.33,
        });

        logo.traverse((o) => {
          if (o.isMesh) o.material = logoMaterial;
        });
    }
)

const bgTexture = textureLoader.load("src/texture.jpg");
  const bgGeometry = new THREE.PlaneGeometry(1, 1);
  const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });
  const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
  bgMesh.position.set(0, 0, 0);
  scene.add(bgMesh);

const geometry = new THREE.IcosahedronGeometry(1, 15);
const glassmaterial = new THREE.MeshPhysicalMaterial({roughness: 0.2, transmission: 1, thickness: 1});
const glassphere = new THREE.Mesh(geometry, glassmaterial);
glassphere.position.set(0, 1.2, -0.3)
glassphere.scale.set(0.2, 0.2, 0.2)
scene.add(glassphere);

/*** Lights */

const ambient = new THREE.AmbientLight( 0x8800ff, 10);
ambient.position.set(0, 0 ,-0.1)
scene.add(ambient)

const hemisphericLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 10);
hemisphericLight.position
scene.add( hemisphericLight );

const directionalLight = new THREE.DirectionalLight( 0xffffff, 1, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 500
directionalLight.position.set(0, 0, -1)
scene.add( directionalLight )



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

const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.01, 100)
camera.position.set(0, 1, 5)

scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/** POST-PROCESSING */



/** Renderer */

const renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true})
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.CineonToneMapping
renderer.toneMappingExposure = 1.75
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