import { useEffect, useRef } from "react";
import * as T from "three";

const Ripple = () => {
  const canvasRef = useRef(null);
  const threeRef = useRef(null);

  const data = [
    "/img1.avif",
    "/img2.avif",
    // "/img3.avif",
    // "/img4.avif",
  ];

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
    uniform sampler2D uDisplacement;
    uniform float time;
    uniform float useRipple;
    float PI = 3.141592653589793;

    void main() {
      vec2 uv = vUv;
      if (useRipple > .1) {
        vec4 disp = texture2D(uDisplacement, uv);
        float theta = disp.r * 2.0 * PI;
        vec2 dir = vec2(sin(theta), cos(theta));
        uv += dir * disp.r * 0.01;
      }
      gl_FragColor = texture2D(uTexture, uv);
    }
  `;

  useEffect(() => {
    class Three {
      constructor(canvas) {
        // -- setup canvas & sizes
        this.canvas = canvas;
        const bounds = canvas.getBoundingClientRect();
        this.device = {
          width: bounds.width,
          height: bounds.height,
          pixelRatio: window.devicePixelRatio,
        };

        // -- scenes & camera
        this.scene = new T.Scene(); // sparks → displacement
        this.scene1 = new T.Scene(); // image planes
        this.camera = new T.PerspectiveCamera(
          75,
          this.device.width / this.device.height,
          0.1,
          100
        );
        this.camera.position.set(0, 0, 3);
        this.scene.add(this.camera);
        this.scene1.add(this.camera);

        // -- renderer
        this.renderer = new T.WebGLRenderer({
          canvas: this.canvas,
          alpha: true,
          antialias: true,
        });
        this.renderer.setSize(this.device.width, this.device.height);
        this.renderer.setPixelRatio(Math.min(this.device.pixelRatio, 2));

        // -- utilities
        this.clock = new T.Clock();
        this.raycaster = new T.Raycaster();
        this.ndcMouse = new T.Vector2();
        this.rawMouse = new T.Vector2(); // raw pixel coords
        this.meshes = []; // sparks
        this.planes = []; // image planes
        this.currentWave = 0;
        this.max = 50;
        this.time = 0;

        // -- render target for displacement
        this.baseTexture = new T.WebGLRenderTarget(
          this.device.width,
          this.device.height
        );

        // -- an infinite plane at z=0 to intersect with
        this.zeroPlane = new T.Plane(new T.Vector3(0, 0, 1), 0);

        // build
        this.setLights();
        this._bindEvents();
        this.render();
        this.setResize();
      }

      setLights() {
        const light = new T.AmbientLight(0xffffff, 1);
        this.scene.add(light);
        this.scene1.add(light.clone());
      }

      addPlane(size, position, imgSrc) {
        // image plane
        const geom = new T.PlaneGeometry(size[0], size[1], 64, 64);
        const tex = new T.TextureLoader().load(imgSrc);
        const mat = new T.ShaderMaterial({
          side: T.DoubleSide,
          vertexShader,
          fragmentShader,
          uniforms: {
            uTexture: { value: tex },
            uDisplacement: { value: this.baseTexture.texture },
            time: { value: 0 },
            useRipple: { value: 0 },
          },
        });
        const mesh = new T.Mesh(geom, mat);
        mesh.position.set(position.x, position.y, 0);
        this.scene1.add(mesh);
        this.planes.push(mesh);

        // sparks
        const sparkGeo = new T.PlaneGeometry(0.3, 0.3);
        const sparkTex = new T.TextureLoader().load("/burash.png");
        for (let i = 0; i < this.max; i++) {
          const sparkMat = new T.MeshBasicMaterial({
            map: sparkTex,
            transparent: true,
            blending: T.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
          });
          const spark = new T.Mesh(sparkGeo, sparkMat);
          spark.visible = false;
          spark.rotation.z = Math.random() * Math.PI * 2;
          this.scene.add(spark);
          this.meshes.push(spark);
        }
      }

/*************  ✨ Windsurf Command ⭐  *************/
      /**
       * Bind events to canvas element.
       *
       * Listens for mousemove on canvas, and updates:
       * - rawMouse: raw pixel coordinates relative to canvas
       * - ndcMouse: normalized device coordinates for raycaster
       */
/*******  eec95349-6e69-4690-965b-343e4770a0e1  *******/
      _bindEvents() {

        document.querySelectorAll("")
        canvasRef.current.addEventListener("mousemove", (e) => {
          const r = this.canvas.getBoundingClientRect();
          // raw pixel coords relative to canvas
          this.rawMouse.set(e.clientX - r.left, e.clientY - r.top);
          // NDC for raycaster
          this.ndcMouse.set(
            (this.rawMouse.x / r.width) * 2 - 1,
            -(this.rawMouse.y / r.height) * 2 + 1
          );
        });
      }

      setNewWave(x, y, idx) {
        const spark = this.meshes[idx];
        spark.visible = true;
        spark.position.set(x, y, 0);
        spark.scale.set(1, 1, 1);
        spark.material.opacity = 1;
      }

      render() {
        // 1) compute world-point under cursor on z=0
        this.raycaster.setFromCamera(this.ndcMouse, this.camera);
        const worldPt = new T.Vector3();
        this.raycaster.ray.intersectPlane(this.zeroPlane, worldPt);

        // 2) spawn a new spark whenever the pointer has moved enough
        if (!this.prevPt) this.prevPt = worldPt.clone();
        if (worldPt.distanceTo(this.prevPt) > 0.02) {
          this.setNewWave(worldPt.x, worldPt.y, this.currentWave);
          this.currentWave = (this.currentWave + 1) % this.max;
          this.prevPt.copy(worldPt);
        }

        // 3) update ripple‐mask render‐target
        this.time += 0.05;
        this.planes.forEach((pl) => {
          pl.material.uniforms.useRipple.value = 0;
          pl.material.uniforms.time.value = this.time;
        });
        const hits = this.raycaster.intersectObjects(this.planes);
        if (hits.length) hits[0].object.material.uniforms.useRipple.value = 1;

        // 4) render sparks into displacement texture
        this.renderer.setRenderTarget(this.baseTexture);
        this.renderer.render(this.scene, this.camera);

        // 5) render final scene
        this.renderer.setRenderTarget(null);
        this.renderer.clear();
        this.renderer.render(this.scene1, this.camera);

        // 6) animate sparks
        this.meshes.forEach((s) => {
          if (!s.visible) return;
          s.rotation.z += 0.02;
          s.material.opacity *= 0.94;
          s.scale.x = 0.98 * s.scale.x + 0.2;
          s.scale.y = s.scale.x;
          if (s.material.opacity < 0.01) s.visible = false;
        });

        requestAnimationFrame(this.render.bind(this));
      }

      setResize() {
        window.addEventListener("resize", () => {
          const b = this.canvas.getBoundingClientRect();
          this.device.width = b.width;
          this.device.height = b.height;
          this.camera.aspect = b.width / b.height;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(b.width, b.height);
        });
      }
    }

    const three = new Three(canvasRef.current);
    threeRef.current = three;
    return () => three.renderer.dispose();
  }, []);

  // map your DOM <img> tags onto Three planes
  useEffect(() => {
    const imgs = document.querySelectorAll("img");
    let loaded = 0;

    const toWorld = (px, isH, cam, b) => {
      const fov = (cam.fov * Math.PI) / 180;
      const z = cam.position.z;
      const H = 2 * Math.tan(fov / 2) * z;
      const W = H * (b.width / b.height);
      return isH ? (px / b.height) * H : (px / b.width) * W;
    };

    const place = () => {
      const b = canvasRef.current.getBoundingClientRect();
      imgs.forEach((img) => {
        const r = img.getBoundingClientRect();
        const size = [
          toWorld(r.width, false, threeRef.current.camera, b),
          toWorld(r.height, true, threeRef.current.camera, b),
        ];
        const cx = r.left + r.width / 2 - b.left;
        const cy = r.top + r.height / 2 - b.top;
        const pos = {
          x: toWorld(cx - b.width / 2, false, threeRef.current.camera, b),
          y: -toWorld(cy - b.height / 2, true, threeRef.current.camera, b),
        };
        threeRef.current.addPlane(size, pos, img.src);
      });
    };

    imgs.forEach((img) =>
      img.complete
        ? loaded++
        : (img.onload = () => {
            loaded++;
            loaded === imgs.length && place();
          })
    );
    loaded === imgs.length && place();
  }, []);

  return (
    <div className="w-full h-full">
      <div className="h-screen w-full bg-black" />
      <div className=" w-full relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full absolute top-0 left-0 z-[1]"
        />
        <div className="w-full flex flex-wrap  justify-center items-center relative z-[0]">
          {data.map((img, i) => (
            <div
              key={i}
              className="h-screen imgContainer pointer-events-auto w-full"
            >
              <img
                src={img}
                alt={`img-${i}`}
                className="w-full opacity-0 h-[100%] object-cover img"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="h-screen w-full bg-black" />
    </div>
  );
};

export default Ripple;
