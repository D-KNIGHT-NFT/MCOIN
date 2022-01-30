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



/*** Loaders */
const gltfLoader = new GLTFLoader()
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()


/*** Base */

// Debug
const gui = new dat.GUI()
const debugObject = {}

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
            child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/*** Environment maps */


const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMap/px.jpg',
    '/textures/environmentMap/nx.jpg',
    '/textures/environmentMap/py.jpg',
    '/textures/environmentMap/ny.jpg',
    '/textures/environmentMap/pz.jpg',
    '/textures/environmentMap/nz.jpg'
])



environmentMap.encoding = THREE.sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap

debugObject.envMapIntensity = 0.4


/*** Raycaster */

const raycaster = new THREE.Raycaster()
const rayOrigin = new THREE.Vector3(-3, 0 , 0)

/*** Models */

let foxMixer = null

gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf) =>
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

gltfLoader.load(
    '/models/logo/glTF/logo.gltf',
    (gltf) =>
    {
        // Model

        gltf.scene.scale.set(0.0015, 0.0015, 0.0015)
        gltf.scene.position.set(0, -0.5, 0)
        gltf.scene.rotation.set(0, 0,  0)
        scene.add(gltf.scene)

        let logo = gltf.scene;
        let newMaterial = new THREE.MeshPhysicalMaterial( 
        {
          transmission: 1, 
          roughness: 0.15,  
          thickness: 0.5,
          envMap: environmentMap
        });

        logo.traverse((o) => {
          if (o.isMesh) o.material = newMaterial;
        });

    }
)

const geometry = new THREE.IcosahedronGeometry(1, 15);
const glassmaterial = new THREE.MeshPhysicalMaterial({roughness: 0.7, transmission: 1, thickness: 1});
const glassphere = new THREE.Mesh(geometry, glassmaterial);
glassphere.position.set(0, 0, 1)
glassphere.scale.set(0.05, 0.05, 0.05)
scene.add(glassphere);

/*** Lights */

const directionalLight = new THREE.DirectionalLight('#B9FD02', 16)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(2048, 2048)

const directionalLight2 = new THREE.DirectionalLight('#ED75B2', 16)
directionalLight2.castShadow = true
directionalLight2.shadow.camera.far = 15
directionalLight2.shadow.mapSize.set(2048, 2048)

const directionalLight3 = new THREE.DirectionalLight('#00B0FF', 16)
directionalLight3.castShadow = true
directionalLight3.shadow.camera.far = 15
directionalLight3.shadow.mapSize.set(2048, 2048)

const directionalLight4 = new THREE.DirectionalLight('#7AC74D', 16)
directionalLight4.castShadow = true
directionalLight4.shadow.camera.far = 15
directionalLight4.shadow.mapSize.set(2048, 2048)

directionalLight.position.set(0, -4, -2)
directionalLight2.position.set(0, 4, 2)
directionalLight3.position.set(2, 4, 0)
directionalLight4.position.set(-2, -4, 0)

scene.add(directionalLight, directionalLight2, directionalLight3, directionalLight4)



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

const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.01, 100)
camera.position.set(0, 0, 5)

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