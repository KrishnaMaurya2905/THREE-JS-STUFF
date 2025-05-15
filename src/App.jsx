import React, { useEffect } from "react";
// import FlowerCreate from "./Components/FlowerCreate";
// import Mirror from "./Components/Mirror";
// import Interplolation from "./Components/Interpolation";
import TechbasedB from "./Components/TechbasedBg";
import SceneTransition from "./Components/Scenetransition";
import Lenis from "@studio-freight/lenis";
import Ganesha from "./Components/Ganesha";
import Auora from "./Components/Auora";
import ParallaxSlide from "./Components/ParallaxSlide";
import CosmicRays from "./Components/CosmicRays";
import CuttingSphere from "./Components/CuttingSphere";
import TubeScene from "./Components/TubeScene";
import WaterColor from "./Components/WaterColor";
import HorizontalScroll from "./Components/HorizontalScroll";
import LVHM from "./Components/LVHM";
import Ripple from "./Components/Ripple";
import MeshImages from "./Components/MeshImages";
import ParaSlider from "./Components/ParaSlider";
import MouseTextDisp from "./Components/MouseTextDisp";
import NoomoValentine from "./Components/NoomoValentine";
import SplashCursor from "./Components/SplashCursor";
import MouseTrail from "./Components/MouseTrail";
import LoaderManager from "./utils/LoaderManager";
import LoaderWrapper from "./utils/LoaderWrapper";
import ImageDisplacement from "./Components/ImageDisplacement";
const App = () => {
  // useEffect(() => {
  //   const lenis = new Lenis({
  //     duration: 1.5,
  //     easing: (t) => Math.min(1, 1.001 - Math.pow(2, -5 * t)),
  //     smooth: true,
  //   });

  //   function raf(time) {
  //     lenis.raf(time);
  //     requestAnimationFrame(raf);
  //   }

  //   requestAnimationFrame(raf);
  // }, []);

  //    const slides = [
  //     {image:"/img1.avif",title:"title1",subtitle:"subtitle1"},
  //     {image:"/img1.avif",title:"title2",subtitle:"subtitle2"},
  //     {image:"/img1.avif",title:"title3",subtitle:"subtitle3"},
  //     {image:"/img1.avif",title:"title4",subtitle:"subtitle4"},
  //     {image:"/img1.avif",title:"title5",subtitle:"subtitle5"},
  //     {image:"/img1.avif",title:"title6",subtitle:"subtitle6"},
  //     {image:"/img1.avif",title:"title7",subtitle:"subtitle7"},
  //     {image:"/img1.avif",title:"title8",subtitle:"subtitle8"},
  //  ]

  return (
    <div className=" w-full bg-black relative">
      {/* <FlowerCreate /> */}
      {/* <Ganesha/> */}
      {/* <Mirror /> */}
      {/* <Interplolation /> */}
      {/* <SceneTransition /> */}
      {/* <Auora /> */}
      {/* <ParallaxSlide /> */}
      {/* <CosmicRays /> */}
      {/* <CuttingSphere  /> */}
      {/* <TubeScene /> */}
      {/* <WaterColor /> */}
      {/* <HorizontalScroll /> */}
      {/* <LVHM /> */}
      {/* <Ripple /> */}
      {/* <MeshImages /> */}
      {/* <ParaSlider slides={slides} /> */}
      {/* <MouseTextDisp /> */}
       <SplashCursor /> 
      {/* <MouseTrail /> */}
      {/* <TechbasedB /> */}
      {/* <NoomoValentine /> */}
      <ImageDisplacement />
    </div>
  );
};

export default App;

// import React, { useEffect, useRef } from "react";
// import * as T from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// const App = () => {
//   const canvasRef = useRef(null);

//   const vertexShader = `
// attribute float instanceId;
// varying vec2 vUv;
// varying float vInstanceId;

// void main() {
//   vUv = uv;
//   vInstanceId = instanceId;

//   vec3 transformed = position;

//   // Create wave effect along y-axis (height)
//   float frequency = 3.0;
//   float amplitude = 0.1;
//   float phase = instanceId * 0.5; // each instance slightly offset

//   transformed.y += sin(transformed.x * frequency + phase) * amplitude;

//   gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(transformed, 1.0);
// }

//   `;

//   const fragmentShader = `
//     varying vec2 vUv;
//     varying float vInstanceId;

//     void main() {
//       vec3 color = vec3(
//         0.5 + 0.5 * sin(vInstanceId),
//         0.5 + 0.5 * cos(vInstanceId),
//         0.8
//       );
//       gl_FragColor = vec4(color, 1.0);
//     }
//   `;

//   useEffect(() => {
//     class Three {
//       constructor(canvas) {
//         this.canvas = canvas;
//         this.device = {
//           width: window.innerWidth,
//           height: window.innerHeight,
//           pixelRatio: window.devicePixelRatio,
//         };

//         this.scene = new T.Scene();
//         this.camera = new T.PerspectiveCamera(
//           75,
//           this.device.width / this.device.height,
//           0.1,
//           100
//         );
//         this.camera.position.set(0, 0, 5);
//         this.scene.add(this.camera);

//         this.renderer = new T.WebGLRenderer({
//           canvas: this.canvas,
//           alpha: true,
//           antialias: true,
//         });
//         this.renderer.setSize(this.device.width, this.device.height);
//         this.renderer.setPixelRatio(Math.min(this.device.pixelRatio, 2));

//         this.controls = new OrbitControls(this.camera, this.canvas);
//         this.controls.enableDamping = true;

//         this.setInstancedBoxes();
//         this.render();
//         this.setResize();
//       }

//       pxToWorld(px, isHeight, camera, bounds) {
//         const fov = (camera.fov * Math.PI) / 180;
//         const z = camera.position.z;
//         const screenHeight = 2 * Math.tan(fov / 2) * z;
//         const screenWidth = screenHeight * (bounds.width / bounds.height);
//         return isHeight
//           ? (px / bounds.height) * screenHeight
//           : (px / bounds.width) * screenWidth;
//       }

//       setInstancedBoxes() {
//         const count = 25;
//         const spacing = 0.52;
//        const bounds =  this.canvas.getBoundingClientRect()
//         const boxGeometry = new T.BoxGeometry(0.5, this.pxToWorld(bounds.height , true , this.camera, bounds), 0.1);
//         const instancedGeometry = new T.InstancedBufferGeometry().copy(
//           boxGeometry
//         );

//         const instanceIds = new Float32Array(count);
//         for (let i = 0; i < count; i++) {
//           instanceIds[i] = i;
//         }

//         instancedGeometry.setAttribute(
//           "instanceId",
//           new T.InstancedBufferAttribute(instanceIds, 1)
//         );

//         const material = new T.ShaderMaterial({
//           vertexShader,
//           fragmentShader,
//           side: T.DoubleSide,
//         });

//         const mesh = new T.InstancedMesh(instancedGeometry, material, count);

//         const dummy = new T.Object3D();
//         for (let i = 0; i < count; i++) {
//           dummy.position.set((i - (count - 1) / 2) * spacing, 0, 0);
//           dummy.updateMatrix();
//           mesh.setMatrixAt(i, dummy.matrix);
//         }

//         // mesh.rotateX(Math.PI / 2);
//         // mesh.position.set(0, -1, 0);
//         this.scene.add(mesh);
//       }

//       render = () => {
//         this.controls.update();
//         this.renderer.render(this.scene, this.camera);
//         requestAnimationFrame(this.render);
//       };

//       setResize() {
//         window.addEventListener("resize", this.onResize.bind(this));
//       }

//       onResize() {
//         this.device.width = window.innerWidth;
//         this.device.height = window.innerHeight;
//         this.camera.aspect = this.device.width / this.device.height;
//         this.camera.updateProjectionMatrix();
//         this.renderer.setSize(this.device.width, this.device.height);
//       }
//     }

//     const three = new Three(canvasRef.current);
//     return () => {
//       three.renderer.dispose();
//       three.controls.dispose();
//     };
//   }, []);

//   return (
//     <div>
//       <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} />
//     </div>
//   );
// };

// export default App;
