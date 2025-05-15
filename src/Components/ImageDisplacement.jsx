
import React, { useEffect, useRef } from 'react';
import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const ImageDisplacement = () => {
  const canvasRef = useRef(null);

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec2 uMouse;
    uniform float uTime;
    uniform float uStrength;

    void main() {
      vec2 center = uMouse;
      vec2 dir = vUv - center;
      float dist = length(dir * 2.0);
      // Time-based wave ripple
      float ripple = sin(dist * 20.0 - 10.0 * 5.0) * 0.02;
      // Mouse proximity falloff
      float falloff = exp(-dist * 10.0);
      // Combined effect
      vec2 offset = normalize(dir) * ripple * falloff * uStrength * 0.5;
      vec2 uv = vUv + offset;

      gl_FragColor = texture2D(uTexture, uv);
    }
  `;

  useEffect(() => {
    class ThreeScene {
      constructor(canvas) {
        this.canvas = canvas;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.scene = new T.Scene();
        this.camera = new T.PerspectiveCamera(75, this.width / this.height, 0.1, 100);
        this.camera.position.set(0, 0, 2);
        this.scene.add(this.camera);

        this.renderer = new T.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;

        this.clock = new T.Clock();

        this.uniforms = {
          uTexture: { value: new T.TextureLoader().load('/photo-1746469410708-493e86266c05.avif') },
          uMouse: { value: new T.Vector2(0.5, 0.5) },
          uTime: { value: 0 },
          uStrength: { value: 1.0 },
        };

        this.init();
      }

      init() {
        this.setLights();
        this.setGeometry();
        this.addEventListeners();
        this.onWindowResize();
        this.render();
      }

      setLights() {
        this.scene.add(new T.AmbientLight(0xffffff, 0.8));
        const dirLight = new T.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(1, 1, 1);
        this.scene.add(dirLight);
      }

      setGeometry() {
        const geom = new T.PlaneGeometry(6, 3, 256, 256);
        const mat = new T.ShaderMaterial({
          side: T.DoubleSide,
          uniforms: this.uniforms,
          vertexShader,
          fragmentShader,
        });
        this.plane = new T.Mesh(geom, mat);
        this.scene.add(this.plane);
      }

      addEventListeners() {
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.canvas.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('resize', this.onWindowResize);
      }

      onMouseMove(e) {
        const x = e.clientX / this.width;
        const y = 1 - e.clientY / this.height;
        this.uniforms.uMouse.value.set(x, y);
      }

      onWindowResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
      }

      render = () => {
        const elapsed = this.clock.getElapsedTime();
        this.uniforms.uTime.value = elapsed;

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render);
      }

      dispose() {
        this.renderer.dispose();
        this.controls.dispose();
        this.canvas.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('resize', this.onWindowResize);
      }
    }

    const scene = new ThreeScene(canvasRef.current);
    return () => scene.dispose();
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
};

export default ImageDisplacement;