import gsap from "gsap";
import React, { useEffect } from "react";
import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const Interpolation = () => {
  const canvasRef = React.useRef(null);

  //   const vertexShader = `
  //  uniform float uTime;
  // uniform float uRotationStrength;
  // varying vec2 vUv;
  // varying vec3 vPosition;

  // void main() {
  //   vUv = uv;

  //   vec3 pos = position;

  //   float wave1 = sin(pos.x * 4.0 + uTime) * 0.05;
  //   float wave2 = sin(pos.y * 6.0 + uTime * 1.5) * 0.05;
  //   float wave3 = sin((pos.z + pos.y) * 3.0 + uTime * 0.8) * 0.05;

  //   float combinedWave = (wave1 + wave2 + wave3);

  //   //  float bendAmount =  -sin(vUv.x * 3.14) * 0.09;
  //     pos.z += combinedWave  * uRotationStrength;

  //   // pos.z += combinedWave  * uRotationStrength;
  //   // vPosition = pos;
  //   gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  // }

  // `;

  const vertexShader = `
uniform float uTime;
uniform float uRotationStrength;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;

  vec3 pos = position;

  // Optional: wave distortion (you can remove if you only want bend)
  float wave1 = sin(pos.x * 4.0 + uTime) * 0.05;
  float wave2 = sin(pos.y * 6.0 + uTime * 1.5) * 0.05;
  float wave3 = sin((pos.z + pos.y) * 3.0 + uTime * 0.8) * 0.05;
  float combinedWave = (wave1 + wave2 + wave3);

  pos.z += combinedWave * uRotationStrength;

  // ✅ Now apply bend using vUv.x
  float bendAmount = sin(vUv.x * 3.14) * 0.05;
  pos.z -= bendAmount;

  vPosition = pos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

  const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
void main() {

  gl_FragColor = vec4(1.0, .0, 1.0, 1.0);
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
        this.camera.position.set(0, 0, 3);
        this.scene.add(this.camera);

        this.renderer = new T.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
        });
        this.renderer.setSize(this.device.width, this.device.height);
        this.renderer.setPixelRatio(Math.min(this.device.pixelRatio, 2));
        this.renderer.setClearColor(0x000000, 1);

        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.enabled = true;
        // this.controls.enableRotate = false; // We don't want camera rotation
        this.controls.update();

        this.clock = new T.Clock();

        this.previousRotation = 0;
        this.rotationStrength = 0;

        this.isDragging = false;
        this.lastMouseX = 0;

        this.setLights();
        this.setGeometry();
        this.gsapAnimation();
        this.addListeners();
        this.render();
        this.setResize();
      }

      setGeometry() {
        this.planeGroup = new T.Group();
        this.scene.add(this.planeGroup);

        this.planeMaterial = new T.ShaderMaterial({
          side: T.DoubleSide,
          fragmentShader: fragmentShader,
          vertexShader: vertexShader,
          uniforms: {
            uTime: { value: 0 },
            uRotationStrength: { value: 0 },
          },
        });

        const numPlanes = 10;
        const radius = 1.4;

        for (let i = 0; i < numPlanes; i++) {
          const angle = (i / numPlanes) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          const planeGeometry = new T.PlaneGeometry(0.8, 0.5, 32, 32);
          const planeMesh = new T.Mesh(planeGeometry, this.planeMaterial);

          planeMesh.position.set(x, 0, z);
          planeMesh.lookAt(0, 0, 0);

          this.planeGroup.add(planeMesh);
        }
      }

      gsapAnimation() {
        gsap.from(this.planeGroup.position, {
          y: -1,
          duration: 2,
          ease: "power4.out",
        });

        gsap.from(this.planeGroup.rotation, {
          y: Math.PI * 0.5,
          duration: 2,
          ease: "power4.out",
        });

        gsap.from(this.planeGroup, {
          opacity: 0,
          duration: 2,
          ease: "power4.out",
        });
      }

      addListeners() {
        window.addEventListener("mousedown", (e) => {
          this.isDragging = true;
          this.lastMouseX = e.clientX;
        });

        window.addEventListener("mouseup", () => {
          this.isDragging = false;
        });

        window.addEventListener("mousemove", (e) => {
          if (this.isDragging) {
            const deltaX = e.clientX - this.lastMouseX;
            this.lastMouseX = e.clientX;

            // Rotate planeGroup based on mouse move
            this.planeGroup.rotation.y += deltaX * 0.005;
          }
        });
      }

      render() {
        const elapsedTime = this.clock.getElapsedTime();
        this.planeMaterial.uniforms.uTime.value = elapsedTime;

        // Detect group rotation speed
        const rotationSpeed = Math.abs(
          this.planeGroup.rotation.y - this.previousRotation
        );
        this.previousRotation = this.planeGroup.rotation.y;

        // If rotating, distortion active
        const targetStrength = rotationSpeed > 0.0001 ? 1.0 : 0.0;

        // Smooth transition
        this.rotationStrength += (targetStrength - this.rotationStrength) * 0.1;
        this.planeMaterial.uniforms.uRotationStrength.value =
          this.rotationStrength;

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
      }

      setLights() {
        const ambientLight = new T.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);
      }

      setResize() {
        window.addEventListener("resize", this.onResize.bind(this));
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

export default Interpolation;
