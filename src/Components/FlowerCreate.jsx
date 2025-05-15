// // import React, { useEffect, useRef } from "react";
// // import * as THREE from "three";
// // import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// // import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// // import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
// // import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
// // import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

// // const FlowerCreate = () => {
// //   const canvasRef = useRef(null);

// //   useEffect(() => {
// //     class ThreeScene {
// //       constructor(canvas) {
// //         this.canvas = canvas;

// //         this.device = {
// //           width: window.innerWidth,
// //           height: window.innerHeight,
// //           pixelRatio: Math.min(window.devicePixelRatio, 2),
// //         };

// //         this.scene = new THREE.Scene();
// //         this.scene.background = new THREE.Color(0x000000);

// //         this.camera = new THREE.PerspectiveCamera(
// //           75,
// //           this.device.width / this.device.height,
// //           0.1,
// //           100
// //         );
// //         this.camera.position.set(0, 1.5, 5);
// //         this.scene.add(this.camera);

// //         this.renderer = new THREE.WebGLRenderer({
// //           canvas: this.canvas,
// //           alpha: true,
// //           antialias: true,
// //         });
// //         this.renderer.setSize(this.device.width, this.device.height);
// //         this.renderer.setPixelRatio(this.device.pixelRatio);
// //         this.renderer.outputColorSpace = THREE.SRGBColorSpace;
// //         this.renderer.shadowMap.enabled = true;
// //         this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// //         this.controls = new OrbitControls(
// //           this.camera,
// //           this.renderer.domElement
// //         );
// //         this.controls.enableDamping = true;

// //         const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
// //         this.scene.add(ambientLight);

// //         const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
// //         dirLight.position.set(5, 10, 7.5);
// //         dirLight.castShadow = true;
// //         this.scene.add(dirLight);

// //         this.raycaster = new THREE.Raycaster();
// //         this.pointer = new THREE.Vector2();

// //         this.loader = new GLTFLoader();
// //         const dracoLoader = new DRACOLoader();
// //         dracoLoader.setDecoderPath(
// //           "https://www.gstatic.com/draco/v1/decoders/"
// //         );
// //         this.loader.setDRACOLoader(dracoLoader);

// //         this.count = 1000;
// //         this.ages = new Float32Array(this.count);
// //         this.scales = new Float32Array(this.count);
// //         this.growthSpeed = new Float32Array(this.count);
// //         this.dummy = new THREE.Object3D();
// //         this._position = new THREE.Vector3();
// //         this.positions = [];
// //         this.normals = [];
// //         this._normal = new THREE.Vector3();

// //         this.currentPoint = new THREE.Vector3();
// //         this.loadModels();

// //         this.animate = this.animate.bind(this);
// //         this.frameId = requestAnimationFrame(this.animate);

// //         this.setResize();
// //       }

// //       async loadModels() {
// //         // Load Burnt Car
// //         const carGltf = await this.loader.loadAsync("/Burnt Car.glb");
// //         const model = carGltf.scene;
// //         model.scale.set(1, 1, 1);
// //         model.rotation.z = Math.PI / 2;
// //         model.position.set(10, 0, 0);

// //         let geometries = [];
// //         let material = null;

// //         model.traverse((child) => {
// //           if (child.isMesh) {
// //             child.castShadow = true;
// //             child.receiveShadow = true;
// //             child.updateMatrix();
// //             const clonedGeometry = child.geometry.clone();
// //             clonedGeometry.applyMatrix4(child.matrix);
// //             geometries.push(clonedGeometry);
// //             if (!material) {
// //               material = child.material;
// //             }
// //           }
// //         });

// //         const mergedGeometry = BufferGeometryUtils.mergeGeometries(
// //           geometries,
// //           true
// //         );
// //         const mergedMesh = new THREE.Mesh(mergedGeometry, material);
// //         mergedMesh.castShadow = true;
// //         mergedMesh.receiveShadow = true;

// //         this.model = mergedMesh;
// //         this.scene.add(this.model);

// //         // Load Flower
// //         const flowerGltf = await this.loader.loadAsync("/alien_flower.glb");

// //         const flowerMesh = flowerGltf.scene.getObjectByProperty("type", "Mesh");

// //         if (!flowerMesh) {
// //           console.error("No mesh found inside flower glb");
// //           return;
// //         }

// //         this.flowerGeometry = flowerMesh.geometry;
// //         this.flowerMaterial = flowerMesh.material;

// //         this.addSamplerObjects();
// //         this.addEvents();
// //       }

// //       addSamplerObjects() {
// //         if (!this.model || !this.flowerGeometry || !this.flowerMaterial) return;

// //         const sampler = new MeshSurfaceSampler(this.model)
// //           .setWeightAttribute(null)
// //           .build();
// //         this.flowerGeometry.rotateX(Math.PI / 2);
// //         this.flowerGeometry.scale(0.1, 0.1, 0.1);

// //         this.flowers = new THREE.InstancedMesh(
// //           this.flowerGeometry,
// //           this.flowerMaterial,
// //           this.count
// //         );

// //         for (let i = 0; i < this.count; i++) {
// //           this.ages[i] = Math.random();
// //           this.scales[i] = this.ages[i];
// //           this.growthSpeed[i] = 0;

// //           this.positions.push(this._position.clone());
// //           this.normals.push(this._normal.clone());
// //           sampler.sample(this._position, this._normal);

// //           this._normal.add(this._position);

// //           this.dummy.position.copy(this._position);
// //           this.dummy.scale.set(this.scales[i], this.scales[i], this.scales[i]);
// //           this.dummy.lookAt(this._normal);
// //           this.dummy.updateMatrix();

// //           this.flowers.setMatrixAt(i, this.dummy.matrix);
// //         }

// //         this.flowers.instanceMatrix.needsUpdate = true;
// //         this.scene.add(this.flowers);
// //       }

// //       addEvents() {
// //         this.onPointerMove = (event) => {
// //           this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
// //           this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

// //           this.raycaster.setFromCamera(this.pointer, this.camera);

// //           if (this.model) {
// //             const intersects = this.raycaster.intersectObject(this.model, true);
// //             if (intersects.length > 0) {
// //               this.currentPoint = intersects[0].point;
// //             }
// //           }
// //         };

// //         window.addEventListener("pointermove", this.onPointerMove);
// //       }

// //       reScale(i) {
// //         this.dummy.position.copy(this.positions[i]);

// //         let d = this.currentPoint.distanceTo(this.positions[i]);

// //         if (d < 0.1) {
// //           this.growthSpeed[i] = 0.01;
// //         } else if (d > 0.1) {
// //           this.growthSpeed[i] = -0.01;
// //         }

// //         this.scales[i] += this.growthSpeed[i];
// //         this.scales[i] = Math.min(1, this.scales[i]);

// //         this.dummy.scale.set(this.scales[i], this.scales[i], this.scales[i]);

// //         this.dummy.lookAt(this.normals[i]);
// //         this.dummy.updateMatrix();

// //         this.flowers.setMatrixAt(i, this.dummy.matrix);
// //       }

// //       animate() {
// //         this.controls.update();

// //         for (let i = 0; i < this.count; i++) {
// //           this.reScale(i);
// //         }

// //         this.renderer.render(this.scene, this.camera);
// //         this.frameId = requestAnimationFrame(this.animate);
// //       }

// //       setResize() {
// //         this.onResize = () => {
// //           this.device.width = window.innerWidth;
// //           this.device.height = window.innerHeight;
// //           this.camera.aspect = this.device.width / this.device.height;
// //           this.camera.updateProjectionMatrix();
// //           this.renderer.setSize(this.device.width, this.device.height);
// //           this.renderer.setPixelRatio(this.device.pixelRatio);
// //         };
// //         window.addEventListener("resize", this.onResize);
// //       }

// //       dispose() {
// //         cancelAnimationFrame(this.frameId);
// //         this.controls.dispose();
// //         this.renderer.dispose();
// //         window.removeEventListener("resize", this.onResize);
// //         window.removeEventListener("pointermove", this.onPointerMove);
// //       }
// //     }

// //     const scene = new ThreeScene(canvasRef.current);

// //     return () => scene.dispose();
// //   }, []);

// //   return (
// //     <canvas
// //       ref={canvasRef}
// //       width={window.innerWidth}
// //       height={window.innerHeight}
// //       style={{
// //         width: "100%",
// //         height: "100%",
// //         display: "block",
// //         backgroundColor: "black",
// //       }}
// //     />
// //   );
// // };

// // export default FlowerCreate;












import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

const FlowerCreate = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    class ThreeScene {
      constructor(canvas) {
        this.canvas = canvas;

        this.device = {
          width: window.innerWidth,
          height: window.innerHeight,
          pixelRatio: Math.min(window.devicePixelRatio, 2),
        };

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        this.camera = new THREE.PerspectiveCamera(
          75,
          this.device.width / this.device.height,
          0.1,
          100
        );
        this.camera.position.set(0, 1.5, 5);
        this.scene.add(this.camera);

        this.renderer = new THREE.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: true,
        });
        this.renderer.setSize(this.device.width, this.device.height);
        this.renderer.setPixelRatio(this.device.pixelRatio);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(5, 10, 7.5);
        dirLight.castShadow = true;
        this.scene.add(dirLight);

        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();

        this.loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
        this.loader.setDRACOLoader(dracoLoader);

        this.count = 5000;
        this.ages = new Float32Array(this.count);
        this.scales = new Float32Array(this.count);
        this.targetScales = new Float32Array(this.count);
        this.growthSpeed = new Float32Array(this.count);
        this.dummy = new THREE.Object3D();
        this._position = new THREE.Vector3();
        this.positions = [];
        this.normals = [];
        this._normal = new THREE.Vector3();

        this.currentPoint = new THREE.Vector3();
        this.loadModels();

        this.animate = this.animate.bind(this);
        this.frameId = requestAnimationFrame(this.animate);

        this.setResize();
      }

      async loadModels() {
        const carGltf = await this.loader.loadAsync("/Burnt Car.glb");
        const model = carGltf.scene;
        model.scale.set(1, 1, 1);
        model.rotation.z = Math.PI / 2;
        model.position.set(10, 0, 0);

        let geometries = [];
        let material = null;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.updateMatrix();
            const clonedGeometry = child.geometry.clone();
            clonedGeometry.applyMatrix4(child.matrix);
            geometries.push(clonedGeometry);
            if (!material) {
              material = child.material;
            }
          }
        });

        const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, true);
        const mergedMesh = new THREE.Mesh(mergedGeometry, material);
        mergedMesh.castShadow = true;
        mergedMesh.receiveShadow = true;

        this.model = mergedMesh;
        this.scene.add(this.model);

        // Load Flower
        const flowerGltf = await this.loader.loadAsync("/grass_vegitation_mix.glb");
        const flowerMesh = flowerGltf.scene.getObjectByProperty("type", "Mesh");

        if (!flowerMesh) {
          console.error("No mesh found inside flower glb");
          return;
        }

        this.flowerGeometry = flowerMesh.geometry;
        this.flowerMaterial = flowerMesh.material;

        this.addSamplerObjects();
        this.addEvents();
      }

      addSamplerObjects() {
        if (!this.model || !this.flowerGeometry || !this.flowerMaterial) return;

        const sampler = new MeshSurfaceSampler(this.model)
          .setWeightAttribute(null)
          .build();
        this.flowerGeometry.rotateX(Math.PI / 2);
        this.flowerGeometry.scale(0.1, 0.1, 0.1);

        this.flowers = new THREE.InstancedMesh(
          this.flowerGeometry,
          this.flowerMaterial,
          this.count
        );

        for (let i = 0; i < this.count; i++) {
          this.ages[i] = Math.random();
          this.scales[i] = 0;
          this.targetScales[i] = 0;
          this.growthSpeed[i] = 0;

          sampler.sample(this._position, this._normal);
          this.positions.push(this._position.clone());
          this.normals.push(this._normal.clone());

          this._normal.add(this._position);

          this.dummy.position.copy(this._position);
          this.dummy.scale.set(0, 0, 0);
          this.dummy.lookAt(this._normal);
          this.dummy.updateMatrix();

          this.flowers.setMatrixAt(i, this.dummy.matrix);
        }

        this.flowers.instanceMatrix.needsUpdate = true;
        this.scene.add(this.flowers);
      }

      addEvents() {
        this.onPointerMove = (event) => {
          this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
          this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

          this.raycaster.setFromCamera(this.pointer, this.camera);

          if (this.model) {
            const intersects = this.raycaster.intersectObject(this.model, true);
            if (intersects.length > 0) {
              this.currentPoint.copy(intersects[0].point);
            } else {
              this.currentPoint.set(9999, 9999, 9999);
            }
          }
        };

        window.addEventListener("pointermove", this.onPointerMove);
      }

      reScale(i) {
        if (!this.positions[i] || !this.normals[i]) return;

        this.dummy.position.copy(this.positions[i]);

        const d = this.currentPoint.distanceTo(this.positions[i]);

        if (d < 0.5) {
          this.targetScales[i] = 0.1; // Grow to full
        } else {
          this.targetScales[i] = 0.0; // Shrink back
        }

        // Smoothly interpolate scale
        this.scales[i] = THREE.MathUtils.lerp(this.scales[i], this.targetScales[i], 0.1);

        this.dummy.scale.set(this.scales[i], this.scales[i], this.scales[i]);
        this.dummy.lookAt(this.normals[i]);
        this.dummy.updateMatrix();

        this.flowers.setMatrixAt(i, this.dummy.matrix);
      }

      animate() {
        this.controls.update();

        if (this.flowers) {
          for (let i = 0; i < this.count; i++) {
            this.reScale(i);
          }
          this.flowers.instanceMatrix.needsUpdate = true;
        }

        this.renderer.render(this.scene, this.camera);
        this.frameId = requestAnimationFrame(this.animate);
      }

      setResize() {
        this.onResize = () => {
          this.device.width = window.innerWidth;
          this.device.height = window.innerHeight;
          this.camera.aspect = this.device.width / this.device.height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(this.device.width, this.device.height);
          this.renderer.setPixelRatio(this.device.pixelRatio);
        };
        window.addEventListener("resize", this.onResize);
      }

      dispose() {
        cancelAnimationFrame(this.frameId);
        this.controls.dispose();
        this.renderer.dispose();
        window.removeEventListener("resize", this.onResize);
        window.removeEventListener("pointermove", this.onPointerMove);
      }
    }

    const scene = new ThreeScene(canvasRef.current);

    return () => scene.dispose();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        backgroundColor: "black",
      }}
    />
  );
};

export default FlowerCreate;








