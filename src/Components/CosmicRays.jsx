import React, { useEffect } from "react";
import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as dat from "dat.gui";

const CosmicRays = () => {
  const canvasRef = React.useRef(null);

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
          1000
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
        this.renderer.setClearColor(0x000000, 1);
        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.update();

        this.clock = new T.Clock();

        this.setLights();
        this.setGeometry();
        this.setGUI();
        this.render();
        this.setResize();
      }

      setLights() {
        this.ambientLight = new T.AmbientLight(0xffffff);
        this.scene.add(this.ambientLight);
      }

      setGeometry() {
        let stripeTexture = new T.TextureLoader().load("/water-normals.webp");
        stripeTexture.wrapS = T.RepeatWrapping;
        stripeTexture.wrapT = T.RepeatWrapping;
        let noise = new T.TextureLoader().load(
          "/noise04-312x315-2c5fc18dd925408af996369a0ac032bbe63a25f1.jpg"
        );
        noise.wrapS = T.RepeatWrapping;
        noise.wrapT = T.RepeatWrapping;
        let geo = new T.PlaneGeometry(10, 10);

        this.cau = new T.ShaderMaterial({
          side: T.FrontSide,
          transparent: true,
          vertexShader: `
            varying vec2 vUv;
            varying vec3 vWorldPosition;
            void main() {
              vUv = uv;
              vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, .6);
            }
          `,
          fragmentShader: `
            varying vec2 vUv;
            uniform float time;
            varying vec3 vWorldPosition;
            uniform sampler2D uTexture;
            uniform vec3 uColor;
            uniform float uIntensity;
            void main() {
              vec2 newUV = vUv;
              vec4 tt = texture2D(uTexture, vUv);

              vec2 godray = vWorldPosition.xy - vec2(0., 6.);
              float uvDirection = atan(godray.y, godray.x);

              float c = texture2D(uTexture, vec2(uvDirection, 0.) + 0.04 * time).x;
              float c1 = texture2D(uTexture, vec2(0.1, uvDirection) + 0.04 * time * 1.5).x;

              float alpha = min(c, c1);

              float fade = smoothstep(0.0, 0.5, abs(vUv.y));
              vec3 color = uColor * uIntensity;
              gl_FragColor = vec4(color * alpha * fade, alpha * 2.9 * fade);
            }
          `,
          uniforms: {
            time: { value: 0 },
            uColor: { value: new T.Color(1.0, 0.0, 0.0) },
            uIntensity: { value: 1.0 },
            uTexture: { value: noise },
            uStripes: { value: stripeTexture },
          },
        });

        this.quad = new T.Mesh(geo, this.cau);
        this.scene.add(this.quad);
      }

      setGUI() {
        this.gui = new dat.GUI();
        const colorController = {
          r: 255,
          g: 0,
          b: 0,
          intensity: 1.0,
        };

        this.gui
          .add(colorController, "r", 0, 255)
          .name("Red")
          .onChange((value) => {
            this.cau.uniforms.uColor.value.r = value / 255;
          });

        this.gui
          .add(colorController, "g", 0, 255)
          .name("Green")
          .onChange((value) => {
            this.cau.uniforms.uColor.value.g = value / 255;
          });

        this.gui
          .add(colorController, "b", 0, 255)
          .name("Blue")
          .onChange((value) => {
            this.cau.uniforms.uColor.value.b = value / 255;
          });

        this.gui
          .add(colorController, "intensity", 0.0, 5.0)
          .name("Intensity")
          .onChange((value) => {
            this.cau.uniforms.uIntensity.value = value;
          });
      }

      render() {
        this.cau.uniforms.time.value = this.clock.getElapsedTime();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
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
      if (threeInstance.gui) threeInstance.gui.destroy();
    };
  }, []);

  return <canvas className=" w-full h-screen " ref={canvasRef}></canvas>;
};

export default CosmicRays;
