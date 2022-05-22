////////////////////////////////////////////////////////////////////
// PARTICLES 
///////////////

// Geometry base for the particles
const particlesGeometry = new THREE.BufferGeometry()
const count = 590

const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 1.8
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
particlesMaterial.vertexColors = true

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