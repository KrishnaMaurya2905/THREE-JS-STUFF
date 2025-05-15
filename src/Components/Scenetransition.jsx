// // import React, { useEffect, useRef } from "react";
// // import * as THREE from "three";
// // import VirtualScroll from "virtual-scroll";

// // const SceneTransition = () => {
// //   const canvasRef = useRef(null);

// //   const vertexShader = `
// //     varying vec2 vUv;
// //     void main() {
// //       vUv = uv;
// //       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
// //     }
// //   `;

// //   const fragmentShader = `
// //     varying vec2 vUv;
// //     uniform sampler2D uTexture1;
// //     uniform sampler2D uTexture2;
// //     uniform float progress;
// //     uniform float sineStrength;

// //     void main() {
// //       vec2 uv = vUv;
// //       float distortPower = sineStrength * (1.0 - abs(0.5 - progress) * 2.0);
// //       uv += 0.02 * sin(uv.yx * 10.0 + progress * 5.0) * distortPower;
// //       uv = clamp(uv, 0.0, 6.0);
// //       vec4 texture1 = texture2D(uTexture1, uv);
// //       vec4 texture2 = texture2D(uTexture2, uv);
// //       float sweep = smoothstep(progress, progress + 0.03, (1.5 - vUv.x + vUv.y) / 2.0);
// //       vec4 finalTexture = mix(texture1, texture2, sweep);
// //       gl_FragColor = finalTexture;
// //     }
// //   `;

// //   useEffect(() => {
// //     class ThreeScene {
// //       constructor(canvas) {
// //         this.canvas = canvas;
// //         this.device = {
// //           width: window.innerWidth,
// //           height: window.innerHeight,
// //           pixelRatio: window.devicePixelRatio,
// //         };
// //         this.scene = new THREE.Scene();
// //         this.camera = new THREE.PerspectiveCamera(
// //           75,
// //           this.device.width / this.device.height,
// //           0.1,
// //           100
// //         );
// //         this.camera.position.z = 2;

// //         this.renderer = new THREE.WebGLRenderer({
// //           canvas: this.canvas,
// //           alpha: true,
// //           antialias: true,
// //         });
// //         this.renderer.setSize(this.device.width, this.device.height);
// //         this.renderer.setPixelRatio(Math.min(this.device.pixelRatio, 2));

// //         this.clock = new THREE.Clock();
// //         this.scenes = [];
// //         this.settings = { progress: 0 };

// //         this.initPost();
// //         this.setResize();

// //         this.currentState = 0;
// //         this.targetState = 0;
// //         this.isTransitioning = false;

// //         this.scroller = new VirtualScroll();
// //         this.scroller.on((event) => {
// //           if (this.isTransitioning) return;
// //           this.targetState =
// //             (this.targetState +
// //               (event.deltaY > 0 ? 1 : -1) +
// //               this.scenes.length) %
// //             this.scenes.length;
// //           this.isTransitioning = true;
// //         });

// //         this.loadAssets();
// //       }

// //       loadAssets() {
// //         this.scenes = [
// //           {
// //             images: [
// //               "/ground-01.webp",
// //               "/ground-02.webp",
// //               "/ground-03.webp",
// //               "/sky.webp",
// //             ],
// //           },
// //           {
// //             images: [
// //               "/level-01.webp",
// //               "/level-02.webp",
// //               "/level-03-tree.webp",
// //               "/level-moon.webp",
// //               "/level-03.webp",
// //               "/level-04.webp",
// //               "/level-sky.webp",
// //             ],
// //           },
// //           {
// //             images: [
// //               "/doors-01.webp",
// //               "/aurora.webp",
// //               "/doors-02.webp",
// //               "/doors-03.webp",
// //               "/ground-03-1.webp",
// //               "/ground-02 -1.webp",
// //               "/ground-01-1.webp",
// //               "/sky-1.webp",
// //               "/aurora.webp",
// //             ],
// //           },
// //           {
// //             images: ["/back.webp", "/front.webp", "/sky-2.webp"],
// //           },
// //         ];

// //         this.scenes.forEach((item) => {
// //           item.scene = this.createScene(item.images);
// //           this.renderer.compile(item.scene, this.camera);
// //           item.target = new THREE.WebGLRenderTarget(
// //             this.device.width,
// //             this.device.height,
// //             { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
// //           );
// //         });

// //         this.activeScene = 0;
// //         this.animate();
// //       }

// //       createScene(images) {
// //         const scene = new THREE.Scene();
// //         const planeGeometry = new THREE.PlaneGeometry(2, 2);

// //         images.forEach((image, index) => {
// //           const texture = new THREE.TextureLoader().load(image);
// //           const material = new THREE.ShaderMaterial({
// //             uniforms: {
// //               uTexture: { value: texture },
// //               uTime: { value: 0.0 },
// //             },
// //             vertexShader: `
// //               varying vec2 vUv;
// //               void main() {
// //                 vUv = uv;
// //                 gl_Position = vec4(position, 1.0);
// //               }
// //             `,
// //             fragmentShader: `
// //               varying vec2 vUv;
// //               uniform sampler2D uTexture;
// //               void main() {
// //                 vec4 color = texture2D(uTexture, vUv);
// //                 gl_FragColor = color;
// //               }
// //             `,
// //             transparent: true,
// //           });

// //           const plane = new THREE.Mesh(planeGeometry, material);
// //           plane.position.z = -index * 0.01;
// //           scene.add(plane);
// //         });

// //         return scene;
// //       }

// //       initPost() {
// //         this.postScene = new THREE.Scene();
// //         this.postCamera = new THREE.OrthographicCamera(
// //           -0.5,
// //           0.5,
// //           0.5,
// //           -0.5,
// //           -1,
// //           1
// //         );

// //         this.material = new THREE.ShaderMaterial({
// //           uniforms: {
// //             uTexture1: { value: null },
// //             uTexture2: { value: null },
// //             progress: { value: 0 },
// //             sineStrength: { value: 0.2 },
// //           },
// //           vertexShader,
// //           fragmentShader,
// //         });

// //         const quad = new THREE.Mesh(
// //           new THREE.PlaneGeometry(1, 1),
// //           this.material
// //         );
// //         this.postScene.add(quad);
// //       }

// //       animate = () => {
// //         if (!this.scenes.length) return;

// //         if (this.isTransitioning) {
// //           this.currentState += 0.05;
// //           if (this.currentState >= 1) {
// //             this.currentState = 0;
// //             this.activeScene = this.targetState;
// //             this.isTransitioning = false;
// //           }
// //         }

// //         const nextScene = (this.activeScene + 1) % this.scenes.length;
// //         const progress = this.currentState;

// //         this.renderer.setRenderTarget(this.scenes[this.activeScene].target);
// //         this.renderer.render(this.scenes[this.activeScene].scene, this.camera);

// //         this.renderer.setRenderTarget(this.scenes[nextScene].target);
// //         this.renderer.render(this.scenes[nextScene].scene, this.camera);

// //         this.renderer.setRenderTarget(null);
// //         this.material.uniforms.uTexture1.value =
// //           this.scenes[this.activeScene].target.texture;
// //         this.material.uniforms.uTexture2.value =
// //           this.scenes[nextScene].target.texture;
// //         this.material.uniforms.progress.value = progress;

// //         this.renderer.render(this.postScene, this.postCamera);
// //         requestAnimationFrame(this.animate);
// //       };

// //       setResize() {
// //         this.onResize = this.onResize.bind(this);
// //         window.addEventListener("resize", this.onResize);
// //       }

// //       onResize() {
// //         this.device.width = window.innerWidth;
// //         this.device.height = window.innerHeight;
// //         this.camera.aspect = this.device.width / this.device.height;
// //         this.camera.updateProjectionMatrix();
// //         this.renderer.setSize(this.device.width, this.device.height);
// //       }

// //       dispose() {
// //         this.renderer.dispose();
// //         window.removeEventListener("resize", this.onResize);
// //         this.scroller.destroy();
// //       }
// //     }

// //     const threeInstance = new ThreeScene(canvasRef.current);
// //     return () => {
// //       threeInstance.dispose();
// //     };
// //   }, []);

// //   return (
// //     <div>
// //       <canvas
// //         ref={canvasRef}
// //         style={{ width: "100%", height: "100vh", display: "block" }}
// //       />
// //     </div>
// //   );
// // };

// // export default SceneTransition;

// import React, { useEffect, useRef } from "react";
// import * as THREE from "three";
// import VirtualScroll from "virtual-scroll";
// import { Refractor } from "three/addons/objects/Refractor.js";
// import { WaterRefractionShader } from "../WaterRefractionShader";
// const SceneTransition = () => {
//   const canvasRef = useRef(null);

//   const vertexShader = `
//     varying vec2 vUv;
//     void main() {
//       vUv = uv;
//       gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
//     }
//   `;

//   const fragmentShader = `
//     varying vec2 vUv;
//     uniform sampler2D uTexture1;
//     uniform sampler2D uTexture2;
//     uniform float progress;
//     uniform float sineStrength;

//     void main() {
//       vec2 uv = vUv;
//       float distortPower = sineStrength * (1.0 - abs(0.5 - progress) * 2.0);
//       uv += 0.02 * sin(uv.yx * 10.0 + progress * 5.0) * distortPower;
//       uv = clamp(uv, 0.0, 6.0);
//       vec4 texture1 = texture2D(uTexture1, uv);
//       vec4 texture2 = texture2D(uTexture2, uv);
//       float sweep = smoothstep(progress, progress + 0.03, (1.5 - vUv.x + vUv.y) / 2.0);
//       vec4 finalTexture = mix(texture1, texture2, sweep);
//       gl_FragColor = finalTexture;
//     }
//   `;

//   useEffect(() => {
//     class ThreeScene {
//       constructor(canvas) {
//         this.canvas = canvas;
//         this.device = {
//           width: window.innerWidth,
//           height: window.innerHeight,
//           pixelRatio: window.devicePixelRatio,
//         };
//         this.scene = new THREE.Scene();
//         this.camera = new THREE.PerspectiveCamera(
//           75,
//           this.device.width / this.device.height,
//           0.1,
//           100
//         );
//         this.camera.position.z = 2;

//         this.renderer = new THREE.WebGLRenderer({
//           canvas: this.canvas,
//           alpha: true,
//           antialias: true,
//         });
//         this.renderer.setSize(this.device.width, this.device.height);
//         this.renderer.setPixelRatio(Math.min(this.device.pixelRatio, 2));

//         this.clock = new THREE.Clock();
//         this.scenes = [];
//         this.settings = { progress: 0 };

//         this.initPost();
//         this.setResize();

//         this.progress = 0;
//         this.currentState = 0;

//         this.currentState = 0;
//         this.targetState = 0;
//         this.isTransitioning = false;
//         this.scrollAccumulator = 0;
//         this.scrollThreshold = 200; // Tune this (e.g., 100px of scroll)

//         this.scroller = new VirtualScroll();

//         this.scroller.on((event) => {
//           if (this.isTransitioning) return;

//           this.scrollAccumulator += event.deltaY;

//           if (this.scrollAccumulator > this.scrollThreshold) {
//             this.targetState = (this.targetState + 1) % this.scenes.length;
//             this.isTransitioning = true;
//             this.scrollAccumulator = 0; // Reset after trigger
//           } else if (this.scrollAccumulator < -this.scrollThreshold) {
//             this.targetState =
//               (this.targetState - 1 + this.scenes.length) % this.scenes.length;
//             this.isTransitioning = true;
//             this.scrollAccumulator = 0; // Reset after trigger
//           }
//         });

//         this.loadAssets();
//       }

//       loadAssets() {
//         this.scenes = [
//           {
//             images: [
//               "/ground-01.webp",
//               "/ground-02.webp",
//               "/ground-03.webp",
//               "/sky.webp",
//             ],
//           },
//           {
//             images: [
//               "/level-01.webp",
//               "/level-02.webp",
//               "/level-03-tree.webp",
//               "/level-moon.webp",
//               "/level-03.webp",
//               "/level-04.webp",
//               "/level-sky.webp",
//             ],
//           },
//           {
//             images: [
//               "/doors-01.webp",
//               "/aurora.webp",
//               "/doors-02.webp",
//               "/doors-03.webp",
//               "/ground-03-1.webp",
//               "/ground-02 -1.webp",
//               "/ground-01-1.webp",
//               "/sky-1.webp",
//               "/aurora.webp",
//             ],
//           },
//           {
//             images: ["/back.webp", "/front.webp", "/sky-2.webp"],
//           },
//         ];

//         this.scenes.forEach((item, index) => {
//           item.scene = this.createScene(item.images, index);
//           this.renderer.compile(item.scene, this.camera);
//           item.target = new THREE.WebGLRenderTarget(
//             this.device.width,
//             this.device.height,
//             { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter }
//           );
//         });

//         this.activeScene = 0;
//         this.animate();
//       }

//    createScene(images, index) {
//         const scene = new THREE.Scene();
//         const planeGeometry = new THREE.PlaneGeometry(2, 2);

//         // Regular image planes
//         images.forEach((image, i) => {
//           const texture = textureLoader.load(image);
//           const material = new THREE.ShaderMaterial({
//             uniforms: {
//               uTexture: { value: texture },
//               uTime: { value: 0.0 },
//             },
//             vertexShader: `
//               varying vec2 vUv;
//               void main() {
//                 vUv = uv;
//                 gl_Position = vec4(position, 1.0);
//               }
//             `,
//             fragmentShader: `
//               varying vec2 vUv;
//               uniform sampler2D uTexture;
//               void main() {
//                 vec4 color = texture2D(uTexture, vUv);
//                 gl_FragColor = color;
//               }
//             `,
//             transparent: true,
//           });

//           const plane = new THREE.Mesh(planeGeometry, material);
//           plane.position.z = -i * 0.01;
//           scene.add(plane);
//         });

//         // If index === 3, add water reflection scene
//         if (index === 3) {
//           // === Full-Screen Background Plane ===
//           const planeGeo = new THREE.PlaneGeometry(200, 200);
//           const planeMaterial = new THREE.MeshBasicMaterial({ color: "red" });
//           const planeBack = new THREE.Mesh(planeGeo, planeMaterial);
//           planeBack.position.set(0, 50, -150);
//           scene.add(planeBack);

//           // === Water Reflector ===
//           const dudvMap = await textureLoader.loadAsync("/water-normals.webp");
//           dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;

//           const refractorGeometry = new THREE.PlaneGeometry(200, 200);
//           const refractor = new Refractor(refractorGeometry, {
//             color: 0xcbcbcb,
//             textureWidth: 1024,
//             textureHeight: 1024,
//             shader: WaterRefractionShader,
//             clipBias: 0.003,
//           });

//           refractor.material.uniforms.tDudv.value = dudvMap;
//           refractor.material.uniforms.reflectivity = { value: 0.7 };
//           refractor.material.uniforms.mirror = { value: 1.0 };
//           refractor.position.set(0, 5, 0);
//           refractor.rotation.x = -Math.PI / 2;
//           scene.add(refractor);

//           // === Floating Sphere ===
//           const geometry = new THREE.IcosahedronGeometry(5, 0);
//           const material = new THREE.MeshPhongMaterial({
//             color: 0xffffff,
//             emissive: 0x333333,
//             flatShading: true,
//           });
//           const smallSphere = new THREE.Mesh(geometry, material);
//           smallSphere.position.y = 10;
//           scene.add(smallSphere);
//           scene.userData.sphere = smallSphere; // Store for animation

//           // === Lights ===
//           const mainLight = new THREE.PointLight(0xffffff, 2.5, 250, 0);
//           mainLight.position.set(0, 100, 50);
//           scene.add(mainLight);

//           const hemiLight = new THREE.HemisphereLight(0xffcccc, 0x333333, 1.2);
//           scene.add(hemiLight);
//         }

//         return scene;
//       }

//       initPost() {
//         this.postScene = new THREE.Scene();
//         this.postCamera = new THREE.OrthographicCamera(
//           -0.5,
//           0.5,
//           0.5,
//           -0.5,
//           -1,
//           1
//         );

//         this.material = new THREE.ShaderMaterial({
//           uniforms: {
//             uTexture1: { value: null },
//             uTexture2: { value: null },
//             progress: { value: 0 },
//             sineStrength: { value: 0.2 },
//           },
//           vertexShader,
//           fragmentShader,
//         });

//         const quad = new THREE.Mesh(
//           new THREE.PlaneGeometry(1, 1),
//           this.material
//         );
//         this.postScene.add(quad);
//       }

//       animate = () => {
//         this.time += 0.05;

//         if (this.isTransitioning) {
//           this.progress += 0.06;
//           if (this.progress >= 1) {
//             this.progress = 0;
//             this.currentState = 0;
//             this.activeScene = this.targetState;
//             this.isTransitioning = false;
//           }
//         }
//         const progress = this.progress;

//         const nextScene = (this.activeScene + 1) % this.scenes.length;

//         this.renderer.setRenderTarget(this.scenes[this.activeScene].target);
//         this.renderer.render(this.scenes[this.activeScene].scene, this.camera);

//         this.renderer.setRenderTarget(this.scenes[nextScene].target);
//         this.renderer.render(this.scenes[nextScene].scene, this.camera);

//         this.renderer.setRenderTarget(null);
//         this.material.uniforms.uTexture1.value =
//           this.scenes[this.activeScene].target.texture;
//         this.material.uniforms.uTexture2.value =
//           this.scenes[nextScene].target.texture;
//         this.material.uniforms.progress.value = progress;

//         this.renderer.render(this.postScene, this.postCamera);
//         requestAnimationFrame(this.animate);
//       };

//       setResize() {
//         this.onResize = this.onResize.bind(this);
//         window.addEventListener("resize", this.onResize);
//       }

//       onResize() {
//         this.device.width = window.innerWidth;
//         this.device.height = window.innerHeight;
//         this.camera.aspect = this.device.width / this.device.height;
//         this.camera.updateProjectionMatrix();
//         this.renderer.setSize(this.device.width, this.device.height);
//       }

//       dispose() {
//         this.renderer.dispose();
//         window.removeEventListener("resize", this.onResize);
//         this.scroller.destroy();
//       }
//     }

//     const threeInstance = new ThreeScene(canvasRef.current);
//     return () => {
//       threeInstance.dispose();
//     };
//   }, []);

//   return (
//     <div>
//       <canvas
//         ref={canvasRef}
//         style={{ width: "100%", height: "100vh", display: "block" }}
//       />
//     </div>
//   );
// };

// export default SceneTransition;

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import VirtualScroll from "virtual-scroll";

const SceneTransition = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

//     const fragmentShader = `
//   varying vec2 vUv;

//   uniform sampler2D uTexture1;
//   uniform sampler2D uTexture2;
//   uniform float progress;
//   uniform float sineStrength;
//   uniform sampler2D uDisplacement;

//   // GLSL version of easeInOutCubic
//   float easeInOutCubic(float t) {
//     return t < 0.5
//       ? 4.0 * t * t * t
//       : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
//   }

//   // GLSL version of easeInOutElastic
//   float easeInOutElastic(float x) {
//     float c5 = (2.0 * 3.14159265359) / 20.0;

//     if (x == 0.0) return 0.0;
//     if (x == 1.0) return 1.0;

//     if (x < 0.5) {
//       return -0.5 * pow(2.0, 20.0 * x - 10.0) * sin((20.0 * x - 11.125) * c5);
//     } else {
//       return 0.5 * pow(2.0, -20.0 * x + 10.0) * sin((20.0 * x - 11.125) * c5) + 1.0;
//     }
//   }

//     // GLSL version of easeOutElastic
//   float easeOutElastic(float x) {
//     float c4 = (2.0 * 3.14159265359) / 3.0;

//     return x == 0.0
//       ? 0.0
//       : x == 1.0
//       ? 1.0
//       : pow(2.0, -10.0 * x) * sin((x * 10.0 - 0.75) * c4) + 1.0;
//   }

//   void main() {
//     vec2 uv = vUv;

//     // Change this line to use either easing function:
//     float easedProgress = easeInOutElastic(progress); // or easeInOutCubic(progress)

//     // Sine wave distortion
//     float distortPower = sineStrength * (1.0 - abs(0.5 - easedProgress) * 2.0);
//     uv += 0.02 * sin(uv.yx * 15.0 + easedProgress * 5.0) * distortPower;

//     // Displacement map distortion
//     vec4 disp = texture2D(uDisplacement, vUv);
//     vec2 dispVec = (disp.rg - 0.5) * 2.0;
//     uv += dispVec * (easedProgress * (1.0 - easedProgress)) * 0.2;

//     uv = clamp(uv, 0.0, 1.0);

//     vec4 texture1 = texture2D(uTexture1, uv);
//     vec4 texture2 = texture2D(uTexture2, uv);

//     float sweep = step(easedProgress, 1.0 - vUv.x);
//     gl_FragColor = mix(texture1, texture2, sweep);
//   }
// `;


const fragmentShader = `
  varying vec2 vUv;

  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform float progress;
  uniform float sineStrength;
  uniform sampler2D uDisplacement;
  uniform sampler2D uDisplacement2;

  // GLSL version of easeInOutCubic
  float easeInOutCubic(float t) {
    return t < 0.5
      ? 4.0 * t * t * t
      : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  // GLSL version of easeInOutElastic
  float easeInOutElastic(float x) {
    float c5 = (2.0 * 3.14159265359) / 20.0;
    if (x == 0.0) return 0.0;
    if (x == 1.0) return 1.0;

    if (x < 0.5) {
      return -0.5 * pow(2.0, 20.0 * x - 10.0) * sin((20.0 * x - 11.125) * c5);
    } else {
      return 0.5 * pow(2.0, -20.0 * x + 10.0) * sin((20.0 * x - 11.125) * c5) + 1.0;
    }
  }

  // GLSL version of easeOutElastic
  float easeOutElastic(float x) {
    float c4 = (2.0 * 3.14159265359) / 30.0;

    return x == 0.0
      ? 0.0
      : x == 1.0
      ? 1.0
      : pow(2.0, -10.0 * x) * sin((x * 10.0 - 0.75) * c4) + 1.0;
  }

  void main() {
    vec2 uv = vUv;

    float easedProgress = easeInOutCubic(progress ); // Use your desired easing

    // Sine wave distortion applied across the screen
    float distortPower = sineStrength * (1.0 - abs(0.5 - easedProgress) * 2.0);
    uv += 0.02 * sin(uv.yx * 15.0 + easedProgress * 5.0) * distortPower;

      vec4 disp = texture2D(uDisplacement, vUv);
      vec4 disp2 = texture2D(uDisplacement2, vUv);
      vec4 displacment = mix(disp, disp2, easedProgress * (1.0 - easedProgress));
      vec2 dispVec = (displacment.rg - 0.5) * 2.0;
      uv += dispVec * (easedProgress * (1.0 - easedProgress)) * 0.2;

    uv = clamp(uv, 0.0, 1.0);

    vec4 texture1 = texture2D(uTexture1, uv);
    vec4 texture2 = texture2D(uTexture2, uv);

    float sweep = step(easedProgress, 1.0 - vUv.x);
    gl_FragColor = mix(texture1, texture2, sweep);
  }
`;

    class ThreeScene {
      constructor(canvas) {
        this.canvas = canvas;
        this.device = {
          width: window.innerWidth,
          height: window.innerHeight,
          pixelRatio: window.devicePixelRatio,
        };

        this.cameraStartZ = 2;
        this.cameraZoomZ = 1.4;
        this.zoomProgress = 0;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
          75,
          this.device.width / this.device.height,
          0.1,
          100
        );
        this.camera.position.z = 2;

        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: true,
        });
        this.renderer.setSize(this.device.width, this.device.height);
        this.renderer.setPixelRatio(Math.min(this.device.pixelRatio, 2));

        this.clock = new THREE.Clock();
        this.scenes = [];
        this.textureLoader = new THREE.TextureLoader();

        this.progress = 0;
        this.currentState = 0;
        this.targetState = 0;
        this.isTransitioning = false;
        this.scrollAccumulator = 0;
        this.scrollThreshold = 200;

        this.initPost();
        this.setResize();

        this.scroller = new VirtualScroll();
        this.scroller.on((event) => {
          if (this.isTransitioning) return;
          this.scrollAccumulator += event.deltaY;

          if (this.scrollAccumulator > this.scrollThreshold) {
            this.targetState = (this.targetState + 1) % this.scenes.length;
            this.isTransitioning = true;
            this.scrollAccumulator = 0;
          } else if (this.scrollAccumulator < -this.scrollThreshold) {
            this.targetState =
              (this.targetState - 1 + this.scenes.length) % this.scenes.length;
            this.isTransitioning = true;
            this.scrollAccumulator = 0;
          }
        });

        this.loadAssets();
      }

      async loadAssets() {
        this.scenes = [
          {
            images: [
              "/ground-01.webp",
              "/ground-02.webp",
              "/ground-03.webp",
              "/sky.webp",
            ],
          },
          {
            images: [
              "/level-01.webp",
              "/level-02.webp",
              "/level-03-tree.webp",
              "/level-moon.webp",
              "/level-03.webp",
              "/level-04.webp",
              "/level-sky.webp",
            ],
          },
          {
            images: [
              "/doors-01.webp",
              "/aurora.webp",
              "/doors-02.webp",
              "/doors-03.webp",
              "/ground-03-1.webp",
              "/ground-02 -1.webp",
              "/ground-01-1.webp",
              "/sky-1.webp",
              "/aurora.webp",
            ],
          },
          { images: ["/back.webp", "/front.webp", "/sky-2.webp"] },
        ];

        for (let i = 0; i < this.scenes.length; i++) {
          const item = this.scenes[i];
          item.scene = await this.createScene(item.images, i);
          this.renderer.compile(item.scene, this.camera);
          item.target = new THREE.WebGLRenderTarget(
            this.device.width,
            this.device.height,
            {
              minFilter: THREE.LinearFilter,
              magFilter: THREE.LinearFilter,
            }
          );
        }

        this.activeScene = 0;
        this.animate();
      }

      async createScene(images) {
        const scene = new THREE.Scene();
        const planeGeometry = new THREE.PlaneGeometry(2, 2);

        for (let i = 0; i < images.length; i++) {
          const texture = await this.textureLoader.loadAsync(images[i]);
          const material = new THREE.ShaderMaterial({
            uniforms: {
              uTexture: { value: texture },
              uDisplacement: {
                value: new THREE.TextureLoader().load(
                  "/cloud-displacement.webp"
                ),
              },
               uDisplacement2: {
                value: new THREE.TextureLoader().load(
                  "/boreal-displacement.webp"
                ),
              },
              uTime: { value: 0 },
              sineStrength: { value: 0.4 },
            },
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`,
            fragmentShader: `varying vec2 vUv; uniform sampler2D uTexture; void main() { gl_FragColor = texture2D(uTexture, vUv); }`,
            transparent: true,
          });

          const plane = new THREE.Mesh(planeGeometry, material);
          plane.position.z = -i * 0.01;
          scene.add(plane);
        }
        return scene;
      }

      initPost() {
        this.postScene = new THREE.Scene();
        this.postCamera = new THREE.OrthographicCamera(
          -0.5,
          0.5,
          0.5,
          -0.5,
          -1,
          1
        );

        this.material = new THREE.ShaderMaterial({
          uniforms: {
            uTexture1: { value: null },
            uTexture2: { value: null },
            progress: { value: 0 },
            sineStrength: { value: 0.2 },
            uDisplacement: {
              value: new THREE.TextureLoader().load(
                "/transition-displacement.webp"
              ),
            },
          },
          vertexShader,
          fragmentShader,
        });

        this.postScene.add(
          new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.material)
        );
      }

      animate = () => {
        const delta = this.clock.getDelta();

        if (this.isTransitioning) {
          this.progress += 0.03;
          // Smooth zooming in
          this.zoomProgress = Math.min(this.zoomProgress + delta * 2, 1);
        } else {
          // Smooth zooming out
          this.zoomProgress = Math.max(this.zoomProgress - delta * 2, 0);
        }

        // Eased interpolation for zoom
        const easeInOut = (t) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        const easedZoom = easeInOut(this.zoomProgress);
        this.camera.position.z =
          this.cameraStartZ * (1 - easedZoom) + this.cameraZoomZ * easedZoom;

        if (this.progress >= 1) {
          this.progress = 0;
          this.currentState = this.targetState;
          this.activeScene = this.targetState;
          this.isTransitioning = false;
        }

        const progress = this.progress;
        const nextScene = (this.activeScene + 1) % this.scenes.length;

        this.renderer.setRenderTarget(this.scenes[this.activeScene].target);
        this.renderer.render(this.scenes[this.activeScene].scene, this.camera);

        this.renderer.setRenderTarget(this.scenes[nextScene].target);
        this.renderer.render(this.scenes[nextScene].scene, this.camera);

        this.renderer.setRenderTarget(null);
        this.material.uniforms.uTexture1.value =
          this.scenes[this.activeScene].target.texture;
        this.material.uniforms.uTexture2.value =
          this.scenes[nextScene].target.texture;
        this.material.uniforms.progress.value = progress;

        this.renderer.render(this.postScene, this.postCamera);
        requestAnimationFrame(this.animate);
      };

      setResize() {
        this.onResize = this.onResize.bind(this);
        window.addEventListener("resize", this.onResize);
      }

      onResize() {
        this.device.width = window.innerWidth;
        this.device.height = window.innerHeight;
        this.camera.aspect = this.device.width / this.device.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.device.width, this.device.height);
      }

      dispose() {
        this.renderer.dispose();
        window.removeEventListener("resize", this.onResize);
        this.scroller.destroy();
      }
    }

    const instance = new ThreeScene(canvasRef.current);
    return () => instance.dispose();
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default SceneTransition;
