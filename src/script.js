import './css/style.css'
import $ from "jquery";
import * as THREE from 'three'
import gsap from 'gsap'
import { WebGLRenderer } from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
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
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';


/*** Base */

// Debug
// const gui = new dat.GUI()
// const debugObject = {}

////////////////////////////////////////////////////////////////////
// Canvas & UI
///////////////

const canvas = document.querySelector('canvas.webgl')

////////////////////////////////////////////////////////////////////
// Audio
///////////////

window.onload = function(){

   var audioElement = document.getElementById('music');
   var play = document.getElementById('play');
   var pause = document.getElementById('pause');
   var loading = document.getElementById('loading');

   function displayControls() {
      loading.style.display = "none";
      play.style.display = "block";
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
      audioElement.play();
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

////////////////////////////////////////////////////////////////////
// SCENE
///////////////

const scene = new THREE.Scene()

////////////////////////////////////////////////////////////////////
// LIGHTS 
///////////////

// const light = new THREE.PointLight( 0x7A7194, 0.001, 1000)
// light.intensity = 104.0
// light.power = 200
// light.distance = 10.0
// light.decay = 0.3
// light.castShadow = false
// light.shadow.camera.zoom = 4;
// light.position.set(0, -0.2, 0)
// scene.add( light )

// const light2 = new THREE.PointLight( 0x7A7194, 0.001, 1000)
// light2.intensity = 104.0
// light2.power = 200
// light2.distance = 10.0
// light2.decay = 0.3
// light2.castShadow = false
// light2.shadow.camera.zoom = 4;
// light2.position.set(0, 0.2, 0)
// scene.add( light2 )

// RectAreaLightUniformsLib.init();

// const rectLight1 = new THREE.RectAreaLight( 0x000000, 56, 104, 104 );
// rectLight1.position.set( -1, 0, 0 );
// rectLight1.rotation.set( 0, -45, 0 )
// scene.add( rectLight1 );

// // const rectLight2 = new THREE.RectAreaLight( 0xD93B27 , 104, 24, 24 );
// // rectLight2.position.set( 0, 0, -1 );
// // rectLight2.rotation.set( 0, -60 ,0 )
// // scene.add( rectLight2 );

// // const rectLight3 = new THREE.RectAreaLight( 0xB9FD02, 16, 24, 24 );
// // rectLight3.position.set( 0, 0, 1 );
// // rectLight3.rotation.set( 0, 60 ,0 )
// // scene.add( rectLight3 );

// const rectLight4 = new THREE.RectAreaLight( 0xffffff , 56, 104, 104 );
// rectLight4.position.set( 1, 0, 0 );
// rectLight4.rotation.set( 0, 45 ,0 )
// scene.add( rectLight4 );

// scene.add( new RectAreaLightHelper( rectLight1 ) );
// scene.add( new RectAreaLightHelper( rectLight2 ) );
// scene.add( new RectAreaLightHelper( rectLight3 ) );

////////////////////////////////////////////////////////////////////
// PARTICLES 
///////////////

// Geometry
const particlesGeometry = new THREE.BufferGeometry()
const count = 50000
const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 0.02
particlesMaterial.sizeAttenuation = true
particlesMaterial.color = new THREE.Color('#ff88cc')

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

const positions = new Float32Array(count * 3) // Multiply by 3 because each position is composed of 3 values (x, y, z)

// particlesMaterial.size = 0.1

for(let i = 0; i < count * 3; i++) // Multiply by 3 for same reason
{
    positions[i] = (Math.random() - 0.5) * 10 // Math.random() - 0.5 to have a random value between -0.5 and +0.5
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)) // Create the Three.js BufferAttribute and specify that each information is composed of 3 values

const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/stars/star_07.png')

// particlesMaterial.map = particleTexture

particlesMaterial.transparent = true
particlesMaterial.alphaMap = particleTexture
// particlesMaterial.alphaTest = 0.001
// particlesMaterial.depthTest = false
particlesMaterial.depthWrite = false




////////////////////////////////////////////////////////////////////
// Enviroment Cube
///////////////

const cubeTextureLoader = new THREE.CubeTextureLoader()
cubeTextureLoader.setPath('textures/environmentMap/level-2/');
const environmentMap = cubeTextureLoader.load(['px.png','nx.png','py.png','ny.png','pz.png','nz.png']);
environmentMap.encoding = THREE.sRGBEncoding;
environmentMap.mapping = THREE.CubeRefractionMapping
environmentMap.envMapIntensity = 1.0

scene.environment = environmentMap
scene.background = environmentMap

scene.fog = new THREE.FogExp2( 0xffffff, 0.13);

////////////////////////////////////////////////////////////////////
// HTML FOG
///////////////

let object = {
  el: '.fog-cloud',
  duration: 20
}

gsap.fromTo(object.el, object.duration, {
  opacity: 5,
  y: '+=180',
  x: 0,
  scale: 2.5,
  transformOrigin: 'left'
}, {
  opacity: 0,
  y: '-=180',
  x: Math.PI * 2,
  modifiers: {
    x: function(x) {
      return Math.sin(parseFloat(x)) * -30 + "px";
    }
  },
  scale: 0,
  stagger: {
    each: object.duration / document.querySelectorAll(object.el).length, 
    repeat: -1
  }
});


////////////////////////////////////////////////////////////////////
// MESHES + LOADERS
///////////////

const geometry = new THREE.IcosahedronGeometry(1, 24);
const glassmaterial = new THREE.MeshPhysicalMaterial(
    { 
      side: THREE.DoubleSide,
      precision: "highp",
      alphaTest: 1.0,
      color: 0xeaeaea,
      fog: false,
      transmission: 1,
      opacity: 1,
      metalness: 0,
      roughness: 0,
      ior: 2.0,
      thickness: 0.01,
      specularIntensity: 1,
      specularColor: 0xffffff,
      envMap: environmentMap,
      envMapIntensity: 1.0
});

const geoFloor = new THREE.BoxGeometry( 1, 0.1, 1 );
const matStdFloor = new THREE.MeshStandardMaterial( { 
    color: 0x0C08F0, 
    roughness: 0.1, 
    metalness: 0.6,
    shadowSide: 8
});
const mshStdFloor = new THREE.Mesh( geoFloor, matStdFloor );
mshStdFloor.position.set(0, -0.79, 0)
scene.add( mshStdFloor );


const glassphere = new THREE.Mesh(geometry, glassmaterial);
glassphere.position.set(0, 0, 0)
glassphere.scale.set(0.4, 0.4, 0.4)
scene.add(glassphere);


/*** Load Fox model **/
const gltfLoader = new GLTFLoader()


let foxMixer = null

gltfLoader.load('/models/Fox/glTF/Fox.gltf', (gltf) =>
    {
        // Model
        const fox = gltf.scene
        fox.scale.set(0.0019, 0.0019, 0.0019)
        fox.position.set(0, -0.1, 0)
        fox.rotation.set(0, 0,  0)

        fox.traverse( function ( object ) {
            if ( object.isMesh ) {
                object.material.envMap = environmentMap;
                object.castShadow = true;
            }
        } );
        scene.add( fox)

        // Animation
        foxMixer = new THREE.AnimationMixer(gltf.scene)
        const foxAction = foxMixer.clipAction(gltf.animations[0])
        foxAction.play()
    }
)

// /*** Load HTDI Logo model **/
gltfLoader.load('models/logo/glTF/logo.gltf', (gltf) =>
    {
        // Model

        gltf.scene.scale.set(0.0015, 0.0015, 0.0015)
        gltf.scene.position.set(0, -0.8, 0.28)
        gltf.scene.rotation.set(0, 0,  0)
        scene.add(gltf.scene)

        let logo = gltf.scene;
        let logoMaterial= new THREE.MeshPhysicalMaterial( 
        { 
        side: THREE.BackSide,    
        color: 0xffffff,
        transmission: 1,
        vertexColors: true,
        opacity: 0.55,
        metalness: 0,
        roughness: 0.01,
        ior: 4.0,
        thickness: 0,
        specularIntensity: 1,
        specularColor: 0xffffff,
        envMapIntensity: 1.0
        });

        logo.traverse((o) => {
          if (o.isMesh) o.material = logoMaterial;
        });
    }
)

gltfLoader.load('models/HTDI/glTF/HTDI-SINGLE2.gltf', (gltf) =>
    {
        // Model BIG SIZE
        // gltf.scene.scale.set(0.0055, 0.0055, 0.0055)
        const htdi = gltf.scene
        htdi.scale.set(0.0005, 0.0005, 0.0005)
        htdi.position.set(0, 0, 0.5)
        htdi.rotation.set(0, 0,  0)
        scene.add(htdi)

    
        let singleMaterial= new THREE.MeshPhysicalMaterial( 
        { 
          side: THREE.DoubleSide, 
          transmission: 1,
          roughness: 0.01,  
          thickness: 0.01,
          clearcoat: 0.1,
          metalness: 0,
          reflectivity: 0.2,
          ior: 2,
          refractionRatio: 2,
          envMap: environmentMap,
          envMapIntensity: 0.7,
        });

        htdi.traverse((o) => {
          if (o.isMesh) o.material = singleMaterial;
        });

        // Animations

        gsap.to( htdi.rotation, {
            duration: 100, 
            ease: "none", 
            y: "+=180",
            repeat: -1});

    }
)


////////////////////////////////////////////////////////////////////
// WINDOW SIZES + ASPECT
///////////////

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

////////////////////////////////////////////////////////////////////
// CAMERA
///////////////

const camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height, 0.2, 100)
camera.position.set( 0, 0, -0.01)

scene.add(camera)

////////////////////////////////////////////////////////////////////
// CONTROLS 
///////////////

const controls = new OrbitControls(camera, canvas)
controls.enable = false
controls.enableDamping = true
controls.autoRotate= true
// controls.enableZoom = false
controls.autoRotateSpeed = 0.7
controls.minDistance = 0.5;
controls.maxDistance = 3.5;
controls.target.set( 0, 0, 0 );

////////////////////////////////////////////////////////////////////
// Renderer
///////////////

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

////////////////////////////////////////////////////////////////////
// EFFECT COMPOSER -> POST-PRODUCTION
///////////////

const clock = new THREE.Clock()
let previousTime = 0

////////////////////////////////////////////////////////////////////
// ANIMATION 
///////////////

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Update controls
    controls.update()

    // LITTLE GUY ANIMATION

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



////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////
///////////////