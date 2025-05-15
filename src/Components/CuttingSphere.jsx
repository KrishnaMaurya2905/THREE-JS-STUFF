import React, { useEffect } from 'react';
import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const App = () => {
  const canvasRef = React.useRef(null);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `;

  useEffect(() => {
    class Three {
      constructor(canvas) {
        this.canvas = canvas;

        this.device = {
          width: window.innerWidth,
          height: window.innerHeight,
          pixelRatio: window.devicePixelRatio,
        };

        this.scene = new T.Scene();

        this.camera = new T.PerspectiveCamera(
          75,
          this.device.width / this.device.height,
          0.1,
          100
        );
        this.camera.position.set(0, 0, 2);
        this.scene.add(this.camera);

        this.renderer = new T.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
        });
        this.renderer.setSize(this.device.width, this.device.height);
        this.renderer.setPixelRatio(Math.min(this.device.pixelRatio, 2));

        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.update();

        this.clock = new T.Clock();

        this.setLights();
        this.setGeometry();
        this.render();
        this.setResize();
      }

      setLights() {
        this.ambientLight = new T.AmbientLight(0xffffff);
        this.scene.add(this.ambientLight);
      }

      setGeometry() {
        this.planeGeometry = new T.PlaneGeometry(1, 1, 128, 128);
        this.planeMaterial = new T.ShaderMaterial({
          side: T.DoubleSide,
          wireframe: true,
          fragmentShader: fragmentShader,
          vertexShader: vertexShader,
        });

        this.planeMesh = new T.Mesh(this.planeGeometry, this.planeMaterial);
        this.scene.add(this.planeMesh);
      }

      render() {
        this.planeMesh.rotation.y = 0.5 * this.clock.getElapsedTime();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
      }

      setResize() {
        window.addEventListener('resize', this.onResize.bind(this));
      }

      onResize() {
        this.device.width = window.innerWidth;
        this.device.height = window.innerHeight;

        this.camera.aspect = this.device.width / this.device.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.device.width, this.device.height);
        this.renderer.setPixelRatio(Math.min(this.device.pixelRatio, 2));
      }
    }

    const threeInstance = new Three(canvasRef.current);

    return () => {
      threeInstance.renderer.dispose();
      threeInstance.controls.dispose();
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default App;

