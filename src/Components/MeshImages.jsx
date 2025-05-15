
import { useEffect, useRef } from "react";
import * as T from "three";
import { useScroll, useTransform } from "framer-motion";

const ranges = [
  { start: 0.0, end: 0.33 },  
  { start: 0.34, end: 0.66 }, 
  { start: 0.64, end: 1.0 } 
];

const MeshImages = () => {
  const canvasRef = useRef(null);
  const threeRef = useRef(null);
  const wrapperRef = useRef(null);
  const data = ["/img1.avif", "/img2.avif", "/img3.avif"];

  const vertexShader = `
    varying vec2 vUv;
    uniform float progress;
    void main() {
      vUv = uv;
      vec3 newPosition = position;
      float bendStrength = 5.0;
      float curve = smoothstep(0.001, progress,  1.0 - vUv.y);
      float bend = -pow((1.0 - vUv.y), 2.0) * bendStrength * curve;
      newPosition.z -= bend;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec2 vUv;
    uniform sampler2D uTexture;
    void main() {
      gl_FragColor = texture2D(uTexture, vUv);
    }
  `;

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start end", "end start"],
  });

  // Prepare per-mesh transforms
  const transforms = ranges.map(({ start, end }) => {
    // scale from start->start+0.05, from 1.2 to 1.0
    const scale = useTransform(
      scrollYProgress,
      [start, start + 0.05],
      [1.2, 1.0]
    );
    // progress from start+0.05->end, from 0.005 to 10.0
    const progress = useTransform(
      scrollYProgress,
      [start + 0.01, end],
      [0.01, 10.0],
      { clamp: true }
    );
    return { scale, progress };
  });

  useEffect(() => {
    class Three {
      constructor(canvas) {
        this.canvas = canvas;
        const bounds = canvas.getBoundingClientRect();
        this.device = {
          width: bounds.width,
          height: bounds.height,
          pixelRatio: window.devicePixelRatio,
        };
        this.scene = new T.Scene();
        this.camera = new T.PerspectiveCamera(
          75,
          this.device.width / this.device.height,
          0.1,
          100
        );
        this.camera.position.set(0, 0, 10);
        this.scene.add(this.camera);
        this.renderer = new T.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
        });
        this.renderer.setSize(this.device.width, this.device.height);
        this.renderer.setPixelRatio(Math.min(this.device.pixelRatio, 2));
        this.meshes = [];
        this.setLights();
        this.render();
        this.setResize();
      }

      setLights() {
        const light = new T.AmbientLight(0xffffff, 1);
        this.scene.add(light);
      }

      addPlane(size, position, imgSrc) {
        const geometry = new T.PlaneGeometry(size[0], size[1], 64, 64);
        const material = new T.ShaderMaterial({
          side: T.DoubleSide,
          fragmentShader,
          vertexShader,
          uniforms: {
            uTexture: { value: new T.TextureLoader().load(imgSrc) },
            progress: { value: 0.01 },
          },
        });
        const mesh = new T.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, 0);
        mesh.scale.set(1.2, 1.2, 1);
        this.scene.add(mesh);
        this.meshes.push(mesh);
      }

      render() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
      }

      setResize() {
        window.addEventListener("resize", () => {
          const bounds = this.canvas.getBoundingClientRect();
          this.device.width = bounds.width;
          this.device.height = bounds.height;
          this.camera.aspect = this.device.width / this.device.height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(this.device.width, this.device.height);
        });
      }
    }

    const threeInstance = new Three(canvasRef.current);
    threeRef.current = threeInstance;

    // subscribe each mesh transform
    const unsubscribes = transforms.map(({ scale, progress }, i) => {
      const unsubScale = scale.onChange(v => {
        threeRef.current.meshes[i].scale.set(v, v, 1);
      });
      const unsubProg = progress.onChange(v => {
        threeRef.current.meshes[i].material.uniforms.progress.value = v;
      });
      return [unsubScale, unsubProg];
    });

    return () => {
      unsubscribes.forEach(([u1, u2]) => { u1(); u2(); });
      threeInstance.renderer.dispose();
    };
  }, [transforms]);

  useEffect(() => {
    const imgs = document.querySelectorAll("img");
    let loaded = 0;
    const pxToWorld = (px, isHeight, camera, bounds) => {
      const fov = (camera.fov * Math.PI) / 180;
      const z = camera.position.z;
      const screenHeight = 2 * Math.tan(fov / 2) * z;
      const screenWidth = screenHeight * (bounds.width / bounds.height);
      return isHeight
        ? (px / bounds.height) * screenHeight
        : (px / bounds.width) * screenWidth;
    };
    const checkRects = () => {
      const bounds = canvasRef.current.getBoundingClientRect();
      imgs.forEach((img, idx) => {
        const rect = img.getBoundingClientRect();
        const size = [
          pxToWorld(rect.width, false, threeRef.current.camera, bounds),
          pxToWorld(rect.height, true, threeRef.current.camera, bounds),
        ];
        const centerX = rect.left + rect.width / 2 - bounds.left;
        const centerY = rect.top + rect.height / 2 - bounds.top;
        const position = {
          x: pxToWorld(
            centerX - bounds.width / 2,
            false,
            threeRef.current.camera,
            bounds
          ),
          y: -pxToWorld(
            centerY - bounds.height / 2,
            true,
            threeRef.current.camera,
            bounds
          ),
        };
        threeRef.current.addPlane(size, position, img.src);
      });
    };
    imgs.forEach(img => {
      if (img.complete) loaded++;
      else img.onload = () => { loaded++; if (loaded === imgs.length) checkRects(); };
    });
    if (loaded === imgs.length) checkRects();
  }, []);

  return (
    <div className="w-full h-full">
      <div className="h-screen w-full bg-black" />
      <div ref={wrapperRef} className=" py-40 w-full relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full absolute top-0 left-0 z-[1]"
        />
        <div className="w-full h-full flex flex-col gap-40 justify-center items-center">
          {data.map((img, i) => (
            <div key={i} className="h-screen w-[80%]">
              <div className="relative h-full overflow-hidden w-full">
                <img
                  src={img}
                  alt={`img-${i}`}
                  className="w-full opacity-0 h-full object-cover"
                />
                <h1 className="absolute bottom-0 leading-none z-[10] left-5">
                  img {i}
                </h1>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-screen w-full bg-black" />
    </div>
  );
};

export default MeshImages;
