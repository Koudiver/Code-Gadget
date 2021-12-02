import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxBufferGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )
// scene.add(cube)



/**
 * Galaxy
 */
const parameters = {};
parameters.count = 1000; // 粒子的数量
parameters.size = 0.1;
parameters.insideColor = '#ff6030';
parameters.outsideColor = '#87ceeb';

const colorInside = new THREE.Color(parameters.insideColor);
const colorOutside = new THREE.Color(parameters.outsideColor);

const dt = 0.3;
parameters.a = 0.03;
parameters.b = 0.05;


const geometry = new THREE.BufferGeometry();
let positions = new Float32Array(parameters.count * 3);
let colors = new Float32Array(parameters.count * 3);

const initXY = () => {
    positions = new Float32Array(parameters.count * 3);
    colors = new Float32Array(parameters.count * 3);
    for (let i = 0; i < parameters.count; i++) {
        let i3 = i * 3;
        positions[i3 + 0] = Math.random() * 40 - 20;
        positions[i3 + 1] = Math.random() * 40 - 20;
        positions[i3 + 2] = 0;
    }
}

const generateGalaxy = () => {
    /**
     * Geometry
     */

    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3;
        let xi = positions[i3 + 0];
        let yi = positions[i3 + 1];
        // let dx = dt * Math.sin(parameters.a * yi * 10) * Math.sin(parameters.b * xi * 10);
        // let dy = dt * Math.sin(parameters.b * xi * 10) * Math.sin(parameters.a * yi * 10);
        // let dx = dt * Math.sin(parameters.a * yi * 20 + 10);
        // let dy = dt * Math.sin(parameters.b * xi * 20 + 10);
        // let dx = dt * 2 * (1 - 1.5 * Math.sin(yi)) * Math.cos(yi);
        // let dy = dt * 2 * (1 - 1.5 * Math.sin(xi)) * Math.cos(xi);
        let dx = dt * Math.sin(parameters.a * yi) * Math.cos(parameters.b * yi) * 10;
        let dy = dt * Math.sin(parameters.a * xi) * Math.cos(parameters.b * xi) * 10;
        // let dx = Math.sqrt(Math.pow(dt, 2) * Math.sin(parameters.a) * yi);
        // let dy = Math.sqrt(Math.pow(dt, 2) * Math.sin(parameters.b) * xi);
        xi = xi + dx;
        yi = yi + dy;
        positions[i3 + 0] = xi;
        positions[i3 + 1] = yi;

        let radius = Math.sqrt(Math.pow(positions[i3 + 0], 2) + Math.pow(positions[i3 + 1], 2));

        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / 50);
        colors[i * 3 + 0] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    /**
     * Material
     */
    const material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    });

    /**
     * Points
     */
    const points = new THREE.Points(geometry, material);
    scene.add(points);
}
initXY();
generateGalaxy(); console.log(positions);

gui.add(parameters, 'count').min(0).max(2000).step(1).onChange(initXY);
gui.add(parameters, 'a').step(0.01).onFinishChange(initXY);
gui.add(parameters, 'b').step(0.01).onFinishChange(initXY);
gui.addColor(parameters, 'insideColor').onFinishChange(initXY);
gui.addColor(parameters, 'outsideColor').onFinishChange(initXY);

window.addEventListener('keydown', e => {
    if (e.key == 'a') {
        initXY();
    }
});

/**
 * Sizes
 */
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
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100000)
camera.position.set(0, 0, 200);
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()


    generateGalaxy();

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()