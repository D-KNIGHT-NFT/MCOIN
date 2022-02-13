import './css/style.css'
import $ from "jquery";
import jPlayer from "jplayer";
import * as THREE from 'three'
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

// const audioElement = document.getElementById( 'music' );

// if (audioElement.canPlayType('audio/mpeg')) {
//   audioElement.play();
//   audioElement.volume = 0.5;
//   console.log("music on")
// }

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
   // // display progress

   // audioElement.addEventListener('timeupdate', function() {
   //    //sets the percentage
   //    bar.style.width = parseInt(((audioElement.currentTime / audioElement.duration) * 100), 10) + "%";
   // });

   // progress.addEventListener('click', function(e) {

   //   // calculate the normalized position clicked
   //   var clickPosition = (e.pageX  - this.offsetLeft) / this.offsetWidth;
   //   var clickTime = clickPosition * audioElement.duration;

   //   // move the playhead to the correct position
   //   audioElement.currentTime = clickTime;
   // });
}

////////////////////////////////////////////////////////////////////
// SCENE
///////////////

const scene = new THREE.Scene()

////////////////////////////////////////////////////////////////////
// LIGHTS 
///////////////

const light = new THREE.PointLight( 0x7A7194, 0.001, 1000)
light.intensity = 104.0
light.power = 200
light.distance = 10.0
light.decay = 2
light.castShadow = false
light.shadow.camera.zoom = 4;
light.position.set(0, -0.2, 0)
scene.add( light )

const light2 = new THREE.PointLight( 0x7A7194, 0.001, 1000)
light2.intensity = 104.0
light2.power = 200
light2.distance = 10.0
light2.decay = 2
light2.castShadow = false
light2.shadow.camera.zoom = 4;
light2.position.set(0, 0.2, 0)
scene.add( light2 )

RectAreaLightUniformsLib.init();

const rectLight1 = new THREE.RectAreaLight( 0x000000, 16, 24, 24 );
rectLight1.position.set( -1, 0, 0 );
rectLight1.rotation.set( 0, -45, 0 )
scene.add( rectLight1 );

const rectLight2 = new THREE.RectAreaLight( 0xD93B27 , 104, 24, 24 );
rectLight2.position.set( 0, 0, -1 );
rectLight2.rotation.set( 0, -60 ,0 )
scene.add( rectLight2 );

const rectLight3 = new THREE.RectAreaLight( 0xB9FD02, 16, 24, 24 );
rectLight3.position.set( 0, 0, 1 );
rectLight3.rotation.set( 0, 60 ,0 )
scene.add( rectLight3 );

const rectLight4 = new THREE.RectAreaLight( 0xc3c3c3 , 16, 24, 24 );
rectLight4.position.set( 1, 0, 0 );
rectLight4.rotation.set( 0, 45 ,0 )
scene.add( rectLight4 );

// scene.add( new RectAreaLightHelper( rectLight1 ) );
// scene.add( new RectAreaLightHelper( rectLight2 ) );
// scene.add( new RectAreaLightHelper( rectLight3 ) );


const cubeTextureLoader = new THREE.CubeTextureLoader()
cubeTextureLoader.setPath('textures/environmentMap/level-1/');
const environmentMap = cubeTextureLoader.load(['px.png','nx.png','py.png','ny.png','pz.png','nz.png']);
environmentMap.encoding = THREE.sRGBEncoding;
environmentMap.mapping = THREE.CubeRefractionMapping
environmentMap.envMapIntensity = 1.0

scene.environment = environmentMap
scene.background = environmentMap

scene.fog = new THREE.FogExp2( 0x000000, 0.53);

////////////////////////////////////////////////////////////////////
// MESHES + LOADERS
///////////////

const geometry = new THREE.IcosahedronGeometry(1, 24);
const glassmaterial = new THREE.MeshPhysicalMaterial(
    { 
      side: THREE.DoubleSide,  
      // normalMap: normalMapTexture,
      // normalRepeat: 9,  
      // clearcoatNormalScale: 9.62, 
      reflectivity: 0.4, 
      refractionRatio: 5.985,
      roughness: 0.02, 
      transmission: 1, 
      thickness: 1.5,
      envMap: environmentMap,
      // envMapIntensity: 1
  }
)

const geoFloor = new THREE.BoxGeometry( 1, 0.1, 1 );
const matStdFloor = new THREE.MeshStandardMaterial( { color: 0x8CB8F1, roughness: 0.4, metalness: 0.8 } );
const mshStdFloor = new THREE.Mesh( geoFloor, matStdFloor );
mshStdFloor.position.set(0, -0.79, 0)
scene.add( mshStdFloor );


const glassphere = new THREE.Mesh(geometry, glassmaterial);
glassphere.position.set(0, 0, 0.08)
glassphere.scale.set(0.34, 0.34, 0.34)
scene.add(glassphere);
/*** Load Fox model **/
const gltfLoader = new GLTFLoader()

/*** Models */

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
          side: THREE.DoubleSide, 
          transmission: 1,
          roughness: 0.01,  
          thickness: 0.01,
          clearcoat: 1.0,
          metalness: 0,
          reflectivity: 1,
          ior: 3.4,
          refractionRatio: 4,
          clearcoatRoughness: 0.2,
          envMap: environmentMap,
          envMapIntensity: 1.4,
          // normalMap: normalMapTexture,
          // normalRepeat: 3,  
          // clearcoatNormalScale: 2.62,
          // attenuationTint: 0x000000,
          // attenuationDistance: 3.5,
          // bloomThreshold: 0.85,
          // bloomStrength: 0.35,
          // bloomRadius: 0.33,
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
          ior: 5,
          refractionRatio: 4,
          // clearcoatRoughness: 0.4,
          envMap: environmentMap,
          envMapIntensity: 1.4,
          // normalMap: normalMapTexture,
          // normalRepeat: 3,  
          // clearcoatNormalScale: 2.62,
          // attenuationTint: 0x000000,
          // attenuationDistance: 3.5,
          // bloomThreshold: 0.85,
          // bloomStrength: 0.35,
          // bloomRadius: 0.33,
        });

        htdi.traverse((o) => {
          if (o.isMesh) o.material = singleMaterial;
        });

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
controls.minDistance = 1.6;
controls.maxDistance = 2;
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
    // htdi.rotation.y += 0.01

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