/**
 * CHINOISERIE - THREE.JS LIQUID FLUID SIMULATION & INTERACTIVE EFFECTS
 */

// 1. Interactive Cursor Blob
const cursorBlob = document.getElementById('cursor-blob');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let blobX = mouseX;
let blobY = mouseY;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateBlob() {
  blobX += (mouseX - blobX) * 0.08;
  blobY += (mouseY - blobY) * 0.08;
  if (cursorBlob) {
    cursorBlob.style.transform = `translate(${blobX}px, ${blobY}px)`;
  }
  requestAnimationFrame(animateBlob);
}
animateBlob();

// 2. Liquid 3D Background with Three.js (Tea Liquor Waves & Shimmer)
(function initThreeLiquid() {
  const canvas = document.getElementById('liquid-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  // Custom Liquid Shader Material
  const liquidGeometry = new THREE.PlaneGeometry(14, 10, 80, 80);

  const customUniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uGoldColor: { value: new THREE.Color(0xd4af37) },
    uJadeColor: { value: new THREE.Color(0x1a7f5a) },
    uDarkBg: { value: new THREE.Color(0x08090a) }
  };

  const vertexShader = `
    uniform float uTime;
    uniform vec2 uMouse;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      vUv = uv;
      vec3 pos = position;

      float dist = distance(uv, uMouse);
      float mouseWave = sin(dist * 12.0 - uTime * 2.5) * exp(-dist * 3.5) * 0.35;

      float wave1 = sin(pos.x * 1.5 + uTime * 0.6) * cos(pos.y * 1.2 + uTime * 0.4) * 0.4;
      float wave2 = sin(pos.x * 2.8 - uTime * 0.8) * sin(pos.y * 2.2 + uTime * 0.5) * 0.2;
      
      float totalElevation = wave1 + wave2 + mouseWave;
      pos.z += totalElevation;
      vElevation = totalElevation;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uGoldColor;
    uniform vec3 uJadeColor;
    uniform vec3 uDarkBg;
    varying vec2 vUv;
    varying float vElevation;

    void main() {
      // Fluid caustic gradient
      float depth = smoothstep(-0.6, 0.6, vElevation);
      vec3 waterColor = mix(uDarkBg, uJadeColor, depth * 0.45);
      
      // Specular golden highlights on wave peaks
      float specular = pow(depth, 3.2);
      vec3 finalColor = mix(waterColor, uGoldColor, specular * 0.65);

      // Edge fading
      float edgeAlpha = smoothstep(0.0, 0.25, vUv.x) * smoothstep(1.0, 0.75, vUv.x) *
                        smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y);

      gl_FragColor = vec4(finalColor, 0.42 * edgeAlpha);
    }
  `;

  const liquidMaterial = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: customUniforms,
    transparent: true,
    wireframe: false
  });

  const mesh = new THREE.Mesh(liquidGeometry, liquidMaterial);
  scene.add(mesh);

  // Track normalized mouse
  window.addEventListener('mousemove', (e) => {
    customUniforms.uMouse.value.x = e.clientX / window.innerWidth;
    customUniforms.uMouse.value.y = 1.0 - (e.clientY / window.innerHeight);
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  function render() {
    customUniforms.uTime.value = clock.getElapsedTime();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
})();

// 3. Dynamic Specular Reflection on Liquid Glass Cards
document.addEventListener('DOMContentLoaded', () => {
  const glassCards = document.querySelectorAll('.liquid-glass');

  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Card 3D tilt
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });

  // Lucide icons initialize
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});
