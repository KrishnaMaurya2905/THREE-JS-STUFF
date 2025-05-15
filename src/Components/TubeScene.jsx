// import React, { useEffect, useRef } from "react";
// import * as THREE from "three";
// import { OrbitControls } from "three/addons/controls/OrbitControls";

// const TubeScene = () => {
//   const canvasRef = useRef();

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const scene = new THREE.Scene();

//     const camera = new THREE.PerspectiveCamera(
//       50,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       100
//     );
//     camera.position.set(0, 0, 10);

//     const renderer = new THREE.WebGLRenderer({
//       canvas,
//       alpha: true,
//       antialias: true,
//     });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//     const controls = new OrbitControls(camera, renderer.domElement);
//     controls.enableDamping = true;

//     const clock = new THREE.Clock();

//     // Shader material for glowing animated strands
//     const vertexShader = `
//   uniform float uTime;
//   varying float vZ;

//   void main() {
//     vec3 pos = position;

//     gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
//   }
// `;

//     const fragmentShader = `
//   varying float vZ;
//   void main() {
//     gl_FragColor = vec4(0.7, 0.4, 1.0, 1.0);
//   }
// `;

//     const strandMaterial = new THREE.ShaderMaterial({
//       vertexShader,
//       fragmentShader,
//       uniforms: {
//         uTime: { value: 0 },
//       },
//       // transparent: true,
//       blending: THREE.AdditiveBlending,
//       depthWrite: false,
//       side: THREE.DoubleSide,

//     });

//     const tubeCount = 400;
//     const tubeSegments = 5000;
//     const radius = 0.01;
//     const strands = [];

//     for (let i = 0; i < tubeCount; i++) {
//       const points = [];
//       const offsetX = (Math.random() - 0.5) * 2;
//       const offsetZ = (Math.random() - 0.5) * 2;

//       for (let j = 0; j < tubeSegments; j++) {
//         const t = j / (tubeSegments - 1);
//         const y = THREE.MathUtils.lerp(-4, 4, t);
//         const x = offsetX + Math.sin(t * Math.PI * 2 + i) * 0.1;
//         const z = offsetZ + Math.cos(t * Math.PI * 2 + i) * 0.1;
//         points.push(new THREE.Vector3(x, y, z));
//       }

//       const curve = new THREE.CatmullRomCurve3(points);
//       const geometry = new THREE.TubeGeometry(
//         curve,
//         tubeSegments,
//         radius,
//         8,
//         false
//       );
//       const mesh = new THREE.Mesh(geometry, strandMaterial);
//       mesh.rotateY(Math.PI / 2);
//       scene.add(mesh);
//       strands.push(mesh);
//     }

//     const animate = () => {
//       requestAnimationFrame(animate);
//       controls.update();
//       strandMaterial.uniforms.uTime.value = clock.getElapsedTime();
//       renderer.render(scene, camera);
//     };

//     animate();

//     window.addEventListener("resize", () => {
//       camera.aspect = window.innerWidth / window.innerHeight;
//       camera.updateProjectionMatrix();
//       renderer.setSize(window.innerWidth, window.innerHeight);
//     });

//     return () => {
//       renderer.dispose();
//       controls.dispose();
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{ width: "100vw", height: "100vh", display: "block" }}
//     />
//   );
// };

// export default TubeScene;





import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";

const TubeScene = () => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const clock = new THREE.Clock();

    const instanceCount = 200;
    const tubeRadius = 0.01;
    const radialSegments = 40;
    const tubularSegments = 500;

    const baseCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -5, 0),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 5, 0)
    ]);
    const baseGeometry = new THREE.TubeGeometry(baseCurve, tubularSegments, tubeRadius, radialSegments, false);

    const vertexShader = `
      uniform float uTime;
      attribute vec3 instanceOffset;
      attribute float instanceSeed;
      varying float vAlpha;

      void main() {
        vec3 pos = position;

        float yFactor = (pos.y + 5.0) / 10.0;
        float bulge = sin(yFactor * 3.1415) * 1.0;
        float twist = sin(uTime + instanceSeed + pos.y * 2.0) * 0.5;

        pos.x += instanceOffset.x * bulge + twist * 0.2;
        pos.z += instanceOffset.z * bulge + twist * 0.2;

        pos.y += instanceOffset.y;

        vAlpha = 1.0 - abs(pos.y) / 6.0;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `;

    const fragmentShader = `
      varying float vAlpha;

      void main() {
        vec3 color = vec3(0.6, 0.4, 1.0);
        gl_FragColor = vec4(color, vAlpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide,
      // depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const instancedMesh = new THREE.InstancedMesh(baseGeometry, material, instanceCount);

    const offsets = [];
    const seeds = [];

    for (let i = 0; i < instanceCount; i++) {
      const x = (Math.random() - 0.5) * 1.0;
      const y = (Math.random() - 0.5) * 0.1;
      const z = (Math.random() - 0.5) * 1.0;
      offsets.push(x, y, z);
      seeds.push(Math.random() * Math.PI * 2);
    }

    const offsetAttr = new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3);
    const seedAttr = new THREE.InstancedBufferAttribute(new Float32Array(seeds), 1);

    instancedMesh.geometry.setAttribute("instanceOffset", offsetAttr);
    instancedMesh.geometry.setAttribute("instanceSeed", seedAttr);
    instancedMesh.rotateZ(Math.PI / 2);
    scene.add(instancedMesh);

    const animate = () => {
      material.uniforms.uTime.value = clock.getElapsedTime();
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return () => {
      renderer.dispose();
      baseGeometry.dispose();
      material.dispose();
      controls.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh", display: "block" }} />;
};

export default TubeScene;
