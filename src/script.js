import './css/style.css'

// Main Libraries
import $ from "jquery";
import preloadFonts from "../js/utils"
import * as THREE from 'three'
import * as PIXI from "pixi.js"
import { SVG, extend as SVGextend, Element as SVGElement } from '@svgdotjs/svg.js'
import gsap from 'gsap'
import { easePack } from 'gsap'
import { WebGLRenderer } from "three";
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
// LOADERS
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import Proton from "proton-engine";
import { ParallaxBarrierEffect } from 'three/examples/jsm/effects/ParallaxBarrierEffect.js';
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
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare.js';
import { Water } from 'three/examples/jsm/objects/Water2.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js';
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { KawaseBlurFilter } from "@pixi/filter-kawase-blur";
import SimplexNoise from "simplex-noise";
import hsl from "hsl-to-hex";
import debounce from "debounce";
 



////////////////////////////////////////////////////////////////////
// HOVER 3D 
// https://github.com/PavelLaptev/Hover3D.js
///////////////

class Hover3D 
{
    constructor(id)
    {
        this.id = id;
        this.xOffset = 10;
        this.yOffset = 10;
        this.attack = 0.1;
        this.release = 0.5;
        this.perspective = 500;
        this.create();
    }

    create()
    {
        document.querySelectorAll(this.id).forEach(element => 
        {
            const rectTransform = element.getBoundingClientRect();
            const perspective = "perspective(" + this.perspective + "px) ";
            element.style.setProperty("transform-style", "preserve-3d");
            
            element.addEventListener("mouseenter", e =>
            {
                element.style.setProperty("transition", "transform " + this.attack + "s");
            })

            element.addEventListener("mousemove", e => 
            {
                let dy = e.clientY - rectTransform.top;
                let dx = e.clientX - rectTransform.left;
                let xRot = this.map(dx, 0, rectTransform.width, -this.xOffset, this.xOffset);
                let yRot = this.map(dy, 0, rectTransform.height, this.yOffset, -this.yOffset);
                let propXRot = "rotateX(" + yRot + "deg) ";
                let propYRot = "rotateY(" + xRot + "deg)";

                element.style.setProperty("transform", perspective + propXRot + propYRot);
            })

            element.addEventListener("mouseleave", e => 
            {
                element.style.setProperty("transition", "transform " + this.release + "s");
                element.style.setProperty("transform", perspective + "rotateX(0deg) rotateY(0deg)");
            })
        })
    }
    // Processing map() function
    map(value, istart, istop, ostart, ostop) 
    {
        return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
    }
}

let myHover3D = new Hover3D(".div1");


////////////////////////////////////////////////////////////////////
// svg / Pixie 
///////////////

// Create PixiJS app
const pixieApp = new PIXI.Application({
  view: document.querySelector(".orb-canvas"),
  resizeTo: window
});

pixieApp.stage.filters = [new KawaseBlurFilter(30, 10, true)];

// JS UTILITY FUNCTIONS

// return a random number within a range
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// map a number from 1 range to another
function map(n, start1, end1, start2, end2) {
  return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
}

// Create a new simplex noise instance
const simplex = new SimplexNoise();

// Orb class
class Orb {
  // Pixi takes hex colors as hexidecimal literals (0x rather than a string with '#')
  constructor(fill = 0x000000) {
    // bounds = the area an orb is "allowed" to move within
    this.bounds = this.setBounds();
    // initialise the orb's { x, y } values to a random point within it's bounds
    this.x = random(this.bounds["x"].min, this.bounds["x"].max);
    this.y = random(this.bounds["y"].min, this.bounds["y"].max);

    // how large the orb is vs it's original radius (this will modulate over time)
    this.scale = 0.5;

    // what color is the orb?
    this.fill = fill;

    // the original radius of the orb, set relative to window height
    this.radius = random(window.innerHeight / 1, window.innerHeight / 1);

    // starting points in "time" for the noise/self similar random values
    this.xOff = random(0, 1000);
    this.yOff = random(0, 1000);
    // how quickly the noise/self similar random values step through time
    this.inc = 0.002;

    // PIXI.Graphics is used to draw 2d primitives (in this case a circle) to the canvas
    this.graphics = new PIXI.Graphics();
    this.graphics.alpha = 0.6;

    // 250ms after the last window resize event, recalculate orb positions.
    window.addEventListener(
      "resize",
      debounce(() => {
        this.bounds = this.setBounds();
      }, 250)
    );
  }
  setBounds() {
    // how far from the { x, y } origin can each orb move
    const maxDist =
        window.innerWidth < 1000 ? window.innerWidth / 4 : window.innerWidth / 4;
    // the { x, y } origin for each orb (the bottom right of the screen)
    const originX = window.innerWidth / 4;
    const originY =
        window.innerWidth < 1000
        ? window.innerHeight
        : window.innerHeight / 8;

    // allow each orb to move x distance away from it's { x, y }origin
    return {
        x: {
        min: originX - maxDist,
        max: originX + maxDist
        },
        y: {
        min: originY - maxDist,
        max: originY + maxDist
        }
    };
  }
  update() {
    // self similar "psuedo-random" or noise values at a given point in "time"
    const xNoise = simplex.noise2D(this.xOff, this.xOff);
    const yNoise = simplex.noise2D(this.yOff, this.yOff);
    const scaleNoise = simplex.noise2D(this.xOff, this.yOff);

    // map the xNoise/yNoise values (between -1 and 1) to a point within the orb's bounds
    this.x = map(xNoise, -1, 1, this.bounds["x"].min, this.bounds["x"].max);
    this.y = map(yNoise, -1, 1, this.bounds["y"].min, this.bounds["y"].max);
    // map scaleNoise (between -1 and 1) to a scale value somewhere between half of the orb's original size, and 100% of it's original size
    this.scale = map(scaleNoise, -1, 1, 0, 1);

    // step through "time"
    this.xOff += this.inc;
    this.yOff += this.inc;
  }
  render() {
    // update the PIXI.Graphics position and scale values
    this.graphics.x = this.x;
    this.graphics.y = this.y;
    this.graphics.scale.set(this.scale);

    // clear anything currently drawn to graphics
    this.graphics.clear();
    this.graphics.backgroundAlpha;

    // tell graphics to fill any shapes drawn after this with the orb's fill color
    this.graphics.beginFill(this.fill);
    // draw a circle at { 0, 0 } with it's size set by this.radius
    this.graphics.drawCircle(0, 0, this.radius);
    // let graphics know we won't be filling in any more shapes
    this.graphics.endFill();
  }
}

class ColorPalette {
  constructor() {
    this.setColors();
    this.setCustomProperties();
  }

  setColors() {
    this.hue = ~~random(0, 660);
    this.complimentaryHue1 = this.hue + 30;
    this.complimentaryHue2 = this.hue + 60;

    this.saturation = 80;
    this.lightness = 50;

    this.baseColor = hsl(this.hue, this.saturation, this.lightness);

    this.complimentaryColor1 = hsl(
      this.complimentaryHue1,
      this.saturation,
      this.lightness
    );

    this.complimentaryColor2 = hsl(
      this.complimentaryHue2,
      this.saturation,
      this.lightness
    );

    this.colorChoices = [
      this.baseColor,
      this.complimentaryColor1,
      this.complimentaryColor2
    ];
  }

  randomColor() {
    // pick a random color
    return this.colorChoices[~~random(0, this.colorChoices.length)].replace(
      "#",
      "0x"
    );
  }

  setCustomProperties() {
    // set CSS custom properties so that the colors defined here can be used throughout the UI
    document.documentElement.style.setProperty("--hue", this.hue);
    document.documentElement.style.setProperty(
      "--hue-complimentary1",
      this.complimentaryHue1
    );
    document.documentElement.style.setProperty(
      "--hue-complimentary2",
      this.complimentaryHue2
    );
  }
}

const colorPalette = new ColorPalette();

// Create orbs
const orbs = [];

for (let i = 0; i < 60; i++) {
  // each orb will be black, just for now
  const orb = new Orb(colorPalette.randomColor());
  pixieApp.stage.addChild(orb.graphics);

  orbs.push(orb);
}

// ACCESIBILITY
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  pixieApp.ticker.add(() => {
    // update and render each orb, each frame. app.ticker attempts to run at 60fps
    orbs.forEach((orb) => {
      orb.update();
      orb.render();
    });
  });
} else {
  // perform one update and render per orb, do not animate
  orbs.forEach((orb) => {
    orb.update();
    orb.render();
  });
}

let object = {
  el: '.orb-canvas',
  duration: 8
}

gsap.fromTo(object.el, object.duration, {
  opacity: 5,
  y: '+=180',
  x: 0,
  scale: 2,
  transformOrigin: 'center'
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
    repeat: 0
  }
});

////////////////////////////////////////////////////////////////////
// DEBUGGER 
///////////////


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

   audioElement.volume = 0.6;
}

sound.onmousemove = (e) => {
  const colors = [ 'MintCream', 'DodgerBlue', 'Aqua', 'Chartreuse', 'Coral', 'GoldenRod', 'GhostWhite', 'DarkSalmon', 'DarkTurquoise', 'HotPink', 'MediumSpringGreen',
                   'PeachPuff', 'Teal']
  const random = () => colors[Math.floor(Math.random() * colors.length)];
  document.documentElement.style.cssText=`
  --yellow: ${random()};
  `
}

////////////////////////////////////////////////////////////////////
// UI
///////////////

const doorsGrid = document.getElementById("grid");

document.getElementById("cross--close").onclick = () => {
    document.getElementById("overlay").style.display = "none";
}

document.getElementById("icon-door").onclick = () => {
  if (doorsGrid.style.display === "none") {
    doorsGrid.style.display = "grid";
  } else {
    doorsGrid.style.display = "none";
  }
}

////////////////////////////////////////////////////////////////////
// SCENE & CONSTS
///////////////

const scene = new THREE.Scene()

////////////////////////////////////////////////////////////////////
// LIGHTS 
///////////////

// Common Lights Between Scenes

RectAreaLightUniformsLib.init(); // Initiator Rect Area Lights

// Lights Inside Glass Bubble 

const light1 = new THREE.PointLight( 0xff0040, 20.0, 1000, 2 );
scene.add( light1 );
const light2 = new THREE.PointLight( 0x0040ff, 20.0, 1000, 2 );
scene.add( light2 );
const light3 = new THREE.PointLight( 0x80ff80, 20.0, 1000, 2 );
scene.add( light3 );
const light4 = new THREE.PointLight( 0xffaa00, 20.0, 1000, 2 );
scene.add( light4 );


//////////////////////////////////////////////////////////// Lightning Scene Space Launcher

const ambientLight = new THREE.AmbientLight( 0x8322c9, 10.0);
scene.add(ambientLight);

const rectLight2 = new THREE.RectAreaLight( 0x18FEFE, 10.0 );
rectLight2.lookAt( 0, 0, 0 );
rectLight2.position.set( 3, 0, -3 );
scene.add( rectLight2 );

const rectLight4 = new THREE.RectAreaLight( 0xffffff , 10.0 );
rectLight4.lookAt( 0, 0, 0 );
rectLight4.position.set( -3, 0, 3 );
scene.add( rectLight4 );

///////////////////////////////////////////////////////////// Lightning Scene Gold Dreams

// const ambientLight = new THREE.AmbientLight( 0xD6B201, 0.6)
// ambientLight.position.set( 0, 8, 0 );
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

// const directionaLight = new THREE.DirectionalLight( 0xD6B201, 0.6 );
// directionaLight.position.set( 0, 0.5, -1 );
// directionaLight.castShadow = true;
// directionaLight.shadow.mapSize.width = 2048;
// directionaLight.shadow.mapSize.height = 2048;

// const d = 10;

// directionaLight.shadow.camera.left = - d;
// directionaLight.shadow.camera.right = d;
// directionaLight.shadow.camera.top = d;
// directionaLight.shadow.camera.bottom = - d;
// directionaLight.shadow.camera.far = 2000;
// scene.add( directionaLight );

////////////////////////////////////////////////////////////////////
// PARTICLES 
///////////////

// Geometry base for the particles
const particlesGeometry = new THREE.BufferGeometry()
const count = 777

const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 2.2
particlesMaterial.sizeAttenuation = true
particlesMaterial.color = new THREE.Color('#f0040').convertSRGBToLinear() //#31FF9C Green Particles

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

const positions = new Float32Array(count * 3) // Multiply by 3 because each position is composed of 3 values (x, y, z)
const colors = new Float32Array(count * 3)

particlesMaterial.size = 0.2

for(let i = 0; i < count * 3; i++) // Multiply by 3 for same reason
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
// Enviroment Cube
///////////////

const cubeTextureLoader = new THREE.CubeTextureLoader()
cubeTextureLoader.setPath('textures/environmentMap/level-1/');
const environmentMap = cubeTextureLoader.load(['px.png','nx.png','py.png','ny.png','pz.png','nz.png']);
environmentMap.encoding = THREE.sRGBEncoding;
environmentMap.mapping = THREE.CubeRefractionMapping

scene.environment = environmentMap
scene.background = environmentMap

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


const uniforms = {

'amplitude': { value: 1.0 },
'color': { value: new THREE.Color( 0xff2200 ) },
'colorTexture': { value: new THREE.TextureLoader().load( 'textures/water/water.jpg' ) }

};

uniforms[ 'colorTexture' ].value.wrapS = uniforms[ 'colorTexture' ].value.wrapT = THREE.RepeatWrapping;

const shaderMaterial = new THREE.ShaderMaterial( {

uniforms: uniforms,
vertexShader: document.getElementById( 'vertexshader' ).textContent,
fragmentShader: document.getElementById( 'fragmentshader' ).textContent

} );

const radius = 0.5, segments = 128, rings = 128;

const geometry = new THREE.SphereGeometry(radius, segments, rings);

const glassmaterial = new THREE.MeshPhysicalMaterial(
    { 
      reflectivity: 1.0,
      transmission: 1.0,
      roughness: 0,
      metalness: 0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.25,
      color: new THREE.Color('#ffffff').convertSRGBToLinear(),
      ior: 1.5,
      // side: THREE.DoubleSide,
      // precision: "highp",
      // alphaTest: 1.0,
      // color: 0xffffff,
      // fog: false,
      // transmission: 1.0,
      // opacity: 1,
      // metalness: 0.1,
      // roughness: 0,
      // ior: 2.0,
      // thickness: 0.01,
      // specularIntensity: 1,
      // specularColor: 0xffffff,
      // envMap: environmentMap,
      // envMapIntensity: 2.0
});
glassmaterial.thickness = 30.0

const displacement = new Float32Array( geometry.attributes.position.count );
const noise = new Float32Array( geometry.attributes.position.count ); 
for ( let i = 0; i < displacement.length; i ++ ) {

  noise[ i ] = Math.random() * 5;

}
geometry.setAttribute( 'displacement', new THREE.BufferAttribute( displacement, 1 ) );

const glassphere = new THREE.Mesh(geometry, shaderMaterial);
glassphere.position.set(0, 0, 0)
scene.add(glassphere);


// FBX LOADER
///////////////

const fbxLoader = new FBXLoader()
fbxLoader.load(
    'models/FBX/stickman.fbx',
    (object) => {
        object.traverse( function ( object ) {
            if ( object.isMesh ) {
                object.material.envMap = environmentMap;
                object.castShadow = true;
            }
        } );
        object.scale.set(.0014, .0014, .0014)
        object.position.set(-0.1, 0, 0)
        scene.add(object)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

// GLTF  LOADER
///////////////

const gltfLoader = new GLTFLoader()
let foxMixer = null

gltfLoader.load('/models/Fox/glTF/Fox.gltf', (gltf) =>
    {
        // Model
        const fox = gltf.scene
        fox.scale.set(0.0019, 0.0019, 0.0019)
        fox.position.set(0, 0, 0)
        fox.rotation.set(0, 0,  0)

        fox.traverse( function ( object ) {
            if ( object.isMesh ) {
                object.material.envMap = environmentMap;
                object.castShadow = true;
            }
        } );
        scene.add( fox )

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

        gltf.scene.scale.set(0.018, 0.018, 0.018)
        gltf.scene.position.set(0, 0, 0)
        gltf.scene.rotation.set(0, 0,  0)
        scene.add(gltf.scene)

        let logo = gltf.scene;
        let logoMaterial= new THREE.MeshPhysicalMaterial( 
        { 
          reflectivity: 1.0,
          transmission: 1.0,
          roughness: 0,
          metalness: 0,
          clearcoat: 0.3,
          clearcoatRoughness: 0.25,
          color: new THREE.Color('#ffffff').convertSRGBToLinear(),
          ior: 1.5,
        // side: THREE.DoubleSide,
        // precision: "highp",
        // emissive: 0.4,
        // alphaTest: 1.0,
        // color: 0xffffff,
        // fog: false,
        // transmission: 1.0,
        // metalness: 0,
        // roughness: 0,
        // ior: 1.0,
        // thickness: 0.01,
        // specularIntensity: 1,
        // specularColor: 0xffffff,
        // envMap: environmentMap,
        // envMapIntensity: 2.0
        });
        logoMaterial.thickness =   50.0

        logo.traverse((o) => {
          if (o.isMesh) o.material = logoMaterial;
        });

        // Animations
        gsap.to( logo.rotation, {
            duration: 1000, 
            ease: "none", 
            y: "+=180",
            x: "+=180",
            z: "+=180",
            repeat: -1});
        
    }
)

let htdi;

gltfLoader.load('models/HTDI/glTF/HTDI-SINGLE2.gltf', (gltf) =>
    {
        htdi = gltf.scene
        htdi.scale.set(0.004, 0.004, 0.004)
        htdi.position.set(0.1, 0.07, 0)
        htdi.rotation.set(0, 0, 0)
        scene.add(htdi)
        
    
        let singleMaterial= new THREE.MeshLambertMaterial( 
        { 
          side: THREE.DoubleSide, 
          reflectivity: 0.2,
          refractionRatio: 0.4,

        });

        htdi.traverse((o) => {
          if (o.isMesh) o.material = singleMaterial;
        });

        // Animations

        gsap.to( htdi.rotation, {
            duration: 100, 
            ease: "none", 
            y: "+=180",
            repeat: -1})

      
    }
)

const planeC = new THREE.CylinderGeometry(0.4, 0.4, 0.02, 64, 8, false)
const planeMat = new THREE.MeshPhysicalMaterial({
    reflectivity: 1.0,
    transmission: 1.0,
    roughness: 0,
    metalness: 0.3,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
    color: new THREE.Color('#000000').convertSRGBToLinear(),
    ior: 1.5,
})

planeMat.thickness = 50.0
const plane =  new THREE.Mesh( planeC, planeMat)
plane.position.set(0, -0.02, 0)
plane.receiveShadow = true
scene.add(plane)

const planeGeometry = new THREE.CircleGeometry( 0.4, 64 );
const groundMirror = new Reflector( planeGeometry, {
clipBias: 0.003,
textureWidth: window.innerWidth * window.devicePixelRatio,
textureHeight: window.innerHeight * window.devicePixelRatio,
color: new THREE.Color('#777777').convertSRGBToLinear()
} );

groundMirror.position.y = 0;
groundMirror.rotateX( - Math.PI / 2 );
// scene.add( groundMirror );

// water
const groundGeometry = new THREE.CircleGeometry( 0.4, 64 );
const groundMaterial = new THREE.MeshStandardMaterial( { roughness: 0.8, metalness: 0.4 } );
const ground = new THREE.Mesh( groundGeometry, groundMaterial );
ground.rotation.x = Math.PI * - 0.5;
scene.add( ground );

const textureLoader2 = new THREE.TextureLoader()
textureLoader2.load('textures/grid.png', function (map) {
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 16;
  // map.repeat.set( 4, 4 );
  groundMaterial.map = map;
  groundMaterial.needsUpdate = true;
})

const waterGeometry = new THREE.CircleGeometry( 0.5, 48 );
const water = new Water( waterGeometry, {
color: '#ffffff',
scale: 1,
flowDirection: new THREE.Vector2( -1, 0.8),
textureWidth: 1024,
textureHeight: 1024
} );

water.position.y = 0.01;
water.rotation.x = Math.PI * - 0.5;
scene.add( water );

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

    // Sobel Effect
    // effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
    // effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;
})

////////////////////////////////////////////////////////////////////
// CAMERA
///////////////

const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 1000)
camera.position.set( 8, 0, 8)
scene.add(camera)

// Ortographic Camera
// const ortoCamera = new THREE.OrthographicCamera( sizes.width/-2, sizes.width/2, sizes.height / 2, sizes.height / -2, 0.1, 10000 );
// ortoCamera.rotation.x = 50*Math.PI/180;
// ortoCamera.rotation.y = 20*Math.PI/180;
// ortoCamera.rotation.z = 10*Math.PI/180;

// const distance = 300
// const initialCameraPositionY = -Math.tan(ortoCamera.rotation.x)*distance;
// const initialCameraPositionX = Math.tan(ortoCamera.rotation.y)*Math.sqrt(distance**2 + initialCameraPositionY**2);
// ortoCamera.position.y = initialCameraPositionY;
// ortoCamera.position.x = initialCameraPositionX;
// ortoCamera.position.z = distance;
// scene.add(ortoCamera)

////////////////////////////////////////////////////////////////////
// CONTROLS 
///////////////

const controls = new OrbitControls(camera, canvas)
controls.enable = true
controls.enableDamping = true
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.autoRotate= true
controls.enableZoom = true
controls.autoRotateSpeed = 1
controls.minDistance = 0.3;
controls.maxDistance = 4.5;
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

const finalComposer = new EffectComposer( renderer );
const renderScene = new RenderPass( scene, camera );
finalComposer.addPass( renderScene );

/////////////////////////////////////////////////////////////////////////////////// strength, Radius, Threshold
const bloomPass = new UnrealBloomPass( new THREE.Vector2( sizes.width, sizes.height ), 0.15 , 0.0011, 0.05 );
finalComposer.addPass( bloomPass );


// const effectGrayScale = new ShaderPass( LuminosityShader );
// finalComposer.addPass( effectGrayScale );

// let effectSobel = new ShaderPass( SobelOperatorShader );
// effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
// effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;
// finalComposer.addPass( effectSobel );


const effectFXAA = new ShaderPass( FXAAShader );
effectFXAA.uniforms[ 'resolution' ].value.set( 1 / sizes.width, 1 / sizes.height );
finalComposer.addPass( effectFXAA );

// const glitchPass = new GlitchPass();
// finalComposer.addPass( glitchPass );

////////////////////////////////////////////////////////////////////
// RAYCASTER + MOUSE
///////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////
// ANIMATION 
///////////////

const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
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

    // Update Glassphere
    glassphere.rotation.y = glassphere.rotation.z = 0.01 * elapsedTime;

    uniforms[ 'amplitude' ].value = 2.5 * Math.sin( glassphere.rotation.y * 0.005 );
    uniforms[ 'color' ].value.offsetHSL( 0.025, 0, 0 );

    for ( let i = 0; i < displacement.length; i ++ ) {

      displacement[ i ] = Math.sin( 0.1 * i + elapsedTime );

      noise[ i ] += 0.5 * ( 0.5 - Math.random() );
      noise[ i ] = THREE.MathUtils.clamp( noise[ i ], - 5, 5 );

      displacement[ i ] += noise[ i ];

    }
    glassphere.geometry.attributes.displacement.needsUpdate = true;

    // LIGHT ANIMATIONS
    light1.position.x = Math.sin( elapsedTime * 0.7 ) * 30
    light1.position.y = Math.cos( elapsedTime * 0.5 ) * 40;
    light1.position.z = Math.cos( elapsedTime * 0.3 ) * 30;

    light2.position.x = Math.cos( elapsedTime * 0.3 ) * 30;
    light2.position.y = Math.sin( elapsedTime * 0.5 ) * 40;
    light2.position.z = Math.sin( elapsedTime * 0.7 ) * 30;

    light3.position.x = Math.sin( elapsedTime * 0.7 ) * 30;
    light3.position.y = Math.cos( elapsedTime * 0.3 ) * 40;
    light3.position.z = Math.sin( elapsedTime * 0.5 ) * 30;

    light4.position.x = Math.sin( elapsedTime * 0.3 ) * 30;
    light4.position.y = Math.cos( elapsedTime * 0.7 ) * 40;
    light4.position.z = Math.sin( elapsedTime * 0.5 ) * 30;


    // Fox animation
    if(foxMixer)
    {
        foxMixer.update(deltaTime)
    }
    // Render
    finalComposer.render(scene, camera)

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