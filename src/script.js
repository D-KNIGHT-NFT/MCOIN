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



/**
POST-PROCESSING
*/


/**
 * Loaders
 * 
 */
const gltfLoader = new GLTFLoader()
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Base
 */
// Debug
// const gui = new dat.GUI()
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Update all materials
 */
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

/**
 * Environment map
 */
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

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()
const rayOrigin = new THREE.Vector3(-3, 0 , 0)
/**
 * Models
 */
let foxMixer = null

// gltfLoader.load(
//     '/models/robot/glTF/robot.gltf',
//     (gltf) =>
//     {
//         // Model
//         gltf.scene.scale.set(0.009, 0.009, 0.009)
//         gltf.scene.position.set(0, 3, 0)
//         gltf.scene.rotation.set(1.55, 0,  0)
//         scene.add(gltf.scene)


//         // Update materials
//         updateAllMaterials()
//     }
// )

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

        // Animation
        // logoMixer = new THREE.AnimationMixer(gltf.scene)
        // const logoAction = logoMixer.clipAction(gltf.animations[1])
        // logoAction.play()

        // Update materials
        updateAllMaterials()
    }
)

/**
 * Floor
 */
// const floorColorTexture = textureLoader.load('textures/dirt/color.png')
// floorColorTexture.encoding = THREE.sRGBEncoding
// floorColorTexture.repeat.set(1, 1)
// floorColorTexture.wrapS = THREE.RepeatWrapping
// floorColorTexture.wrapT = THREE.RepeatWrapping

// const floorNormalTexture = textureLoader.load('textures/dirt/normal.png')
// floorNormalTexture.repeat.set(1, 1)
// floorNormalTexture.wrapS = THREE.RepeatWrapping
// floorNormalTexture.wrapT = THREE.RepeatWrapping

// const floorGeometry = new THREE.CircleGeometry(1, 64)
// const floorMaterial = new THREE.MeshStandardMaterial({
//     map: floorColorTexture,
//     normalMap: floorNormalTexture
// })
// const floor = new THREE.Mesh(floorGeometry, floorMaterial)
// floor.rotation.x = - Math.PI * 0.5
// scene.add(floor)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 4)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(3.5, 3, - 1.25)
scene.add(directionalLight)



/**
 * Sizes
 */
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

/**
 * Camera
 */
// Base camera
const camera = new CinematicCamera( 50, window.innerWidth / window.innerHeight, 0.01, 2000 );
camera.setLens( 5);
camera.setFocalLength(10);
camera.position.set( 0, 1, 2.5);

scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.CineonToneMapping
renderer.toneMappingExposure = 1.75
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setClearColor('#211d20')
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
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