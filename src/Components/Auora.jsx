import React, { useEffect } from "react";
import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const Auora = () => {
  const canvasRef = React.useRef(null);

  const vertexShader = `
   varying vec2 vUv;
uniform float uTime;

void main() {
  vUv = uv;
  vec3 pos = position;

  // Base smooth curtain bend (center dip)
  float bendAmount = sin(vUv.x * 3.14159) * 0.3;
  pos.z += bendAmount;

  // Layered wave patterns with varying frequencies and amplitudes
  float wave1 = sin((pos.x + uTime * 0.5) * 20.0) * 0.03;
  float wave2 = sin((pos.x * 10.0 + uTime) + cos(pos.y * 5.0)) * 0.05;
  float wave3 = sin((pos.x * 80.0 + uTime * 10.0) * sin(pos.y * 2.0)) * 0.015;

  // Combine waves — some tight, some slow
  pos.z += wave1 + wave2 + wave3;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
  `;

  const fragmentShader = `
varying vec2 vUv;

void main() {
  // Base colors for vertical blend
  vec3 green = vec3(0.1, 0.8, 0.5);
  vec3 blue = vec3(0.0, 0.1, 0.4);
  vec3 color = mix(green, blue, vUv.y+0.1);

  // Horizontal center glow (strong at center, fades to edge)
  float centerGlow = smoothstep(0.9, 0.0, abs(vUv.x - 0.5));

  // Vertical darkening (vignette from bottom and top)
  float topFade = smoothstep(1.0, 0.8, vUv.y);     // top edge darker
  float bottomFade = smoothstep(0.1, 0.3, vUv.y);  // bottom edge darker
  float verticalVignette = topFade * bottomFade;

  // Final intensity modulation
  float glow = centerGlow * verticalVignette;

  // Apply glow to base color
  color *= glow;

  gl_FragColor = vec4(color, 1.0);
}

  `;

  useEffect(() => {
    class ThreeScene {
      constructor(canvas) {
        this.canvas = canvas;
        this.materials = [];

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
        this.camera.position.set(0, 0, 5);
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

        this.clock = new T.Clock();

        this.setLights();
        this.setGeometry();
        this.setResize();
        this.render();
      }

      setLights() {
        const ambient = new T.AmbientLight(0xffffff, 1.5);
        this.scene.add(ambient);
      }

      setGeometry() {
        const configs = [
          { size: [1.4, 2.5], position: [0, 1, 0] },
          { size: [1.2, 2.2], position: [1.5, 1.2, -1] },
          { size: [1.3, 2.0], position: [-1.2, 1, -0.5] },
          { size: [1.6, 2.0], position: [2.8, 1.3, -0.8] },
          { size: [1.5, 2.3], position: [-2.5, 1.2, -1] },
        ];

        configs.forEach(({ size, position }) => {
          const geometry = new T.PlaneGeometry(size[0], size[1], 128, 128);
          const material = new T.ShaderMaterial({
            vertexShader,
            fragmentShader,
            side: T.DoubleSide,
            uniforms: {
              uTime: { value: 0 },
            },
            depthWrite: false,
            blending: T.AdditiveBlending,
            transparent: true,
          });

          const mesh = new T.Mesh(geometry, material);
          mesh.position.set(...position);
          //   mesh.lookAt(0, 0, 0); // Still looks at the center
          this.scene.add(mesh);
          this.materials.push(material);
        });
      }

      render = () => {
        const elapsed = this.clock.getElapsedTime();
        this.materials.forEach((mat) => {
          mat.uniforms.uTime.value = elapsed;
        });

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render);
      };

      setResize() {
        window.addEventListener("resize", this.onResize);
      }

      onResize = () => {
        this.device.width = window.innerWidth;
        this.device.height = window.innerHeight;

        this.camera.aspect = this.device.width / this.device.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.device.width, this.device.height);
        this.renderer.setPixelRatio(Math.min(this.device.pixelRatio, 2));
      };
    }

    const three = new ThreeScene(canvasRef.current);

    return () => {
      three.renderer.dispose();
      three.controls.dispose();
    };
  }, []);

  return (
    <div>
      <canvas className="h-screen w-full bg-zinc-800" ref={canvasRef}></canvas>
    </div>
  );
};

export default Auora;
