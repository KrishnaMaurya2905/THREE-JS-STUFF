import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const Mirror = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let camera, scene, renderer, cameraControls;
    let verticalMirror;
    let textureLoader = new THREE.TextureLoader();

    const init = () => {
      const container = canvasRef.current;

      // Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setAnimationLoop(animate);
      container.appendChild(renderer.domElement);

      // Scene
      scene = new THREE.Scene();

      // Camera
      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        500
      );
      camera.position.set(0, 75, 160);

      cameraControls = new OrbitControls(camera, renderer.domElement);
      cameraControls.target.set(0, 40, 0);
      cameraControls.maxDistance = 400;
      cameraControls.minDistance = 10;
      cameraControls.update();

      // Load texture
      const mirrorTexture = textureLoader.load(
        "/FloorsCheckerboard_S_Normal (1).jpg"
      ); // <<== your texture image path here

      // Create a simple plane and apply texture
      const geometry = new THREE.PlaneGeometry(100, 100);
      const material = new THREE.MeshBasicMaterial({
        map: mirrorTexture,
        side: THREE.DoubleSide,
      });
      verticalMirror = new THREE.Mesh(geometry, material);
      verticalMirror.position.y = 50;
      verticalMirror.position.z = -50;
      scene.add(verticalMirror);

      // Bottom plane
      const planeGeo = new THREE.PlaneGeometry(100.1, 100.1);
      const planeBottom = new THREE.Mesh(
        planeGeo,
        new THREE.MeshPhongMaterial({ color: 0xffffff })
      );
      planeBottom.rotateX(-Math.PI / 2);
      scene.add(planeBottom);

      // Front plane with custom shader
      const vertexShader = `
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
      const fragmentShader = `
        void main() {
          gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
        }
      `;
      const planeFront = new THREE.Mesh(
        planeGeo,
        new THREE.ShaderMaterial({
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
        })
      );
      planeFront.position.z = 50;
      planeFront.position.y = 50;
      planeFront.rotateY(Math.PI);
      scene.add(planeFront);

      // Lights
      const mainLight = new THREE.PointLight(0xe7e7e7, 2.5, 250, 0);
      mainLight.position.y = 60;
      scene.add(mainLight);

      const greenLight = new THREE.PointLight(0x00ff00, 0.5, 1000, 0);
      greenLight.position.set(550, 50, 0);
      scene.add(greenLight);

      const redLight = new THREE.PointLight(0xff0000, 0.5, 1000, 0);
      redLight.position.set(-550, 50, 0);
      scene.add(redLight);

      const blueLight = new THREE.PointLight(0xbbbbfe, 0.5, 1000, 0);
      blueLight.position.set(0, 50, 550);
      scene.add(blueLight);

      window.addEventListener("resize", onWindowResize);
    };

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const animate = () => {
      renderer.render(scene, camera);
    };

    init();

    return () => {
      // Cleanup
      window.removeEventListener("resize", onWindowResize);
      renderer.dispose();
      cameraControls.dispose();
    };
  }, []);

  return (
    <div>
      <div id="container" ref={canvasRef}></div>
    </div>
  );
};

export default Mirror;
