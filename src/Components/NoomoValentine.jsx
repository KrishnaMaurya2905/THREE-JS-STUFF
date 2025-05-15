import {
  Color,
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  DirectionalLight,
  AmbientLight,
  CircleGeometry,
  RepeatWrapping,
  ACESFilmicToneMapping,
  sRGBEncoding,
  EquirectangularReflectionMapping,
} from "three";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import React from "react";
import LoaderManager from "../utils/LoaderManager.js";
import { vertexShader, fragmentShader } from "../utils/WaterShader.js";

class NoomoValentine extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.raf = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.controls = null;
    this.groundMirror = null;
  }

  componentDidMount() {
    this.initScene();
    window.addEventListener("resize", this.handleResize, { passive: true });
  }

  componentWillUnmount() {
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.handleResize);
    this.dispose();
  }

  dispose() {
    this.renderer?.dispose();
    this.controls?.dispose();
  }

  initScene = async () => {
    const canvas = this.canvasRef.current;
    const assets = [
      { name: "waterdudv", texture: "/noomoValentine/water0399normal.jpg" },
    ];
    await LoaderManager.load(assets);

    this.scene = new Scene();
    this.scene.background = new Color(0xededec);

    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setClearColor(0xededec, 1);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.outputEncoding = sRGBEncoding;

    this.setSize();
    this.initCamera();
    this.initControls();
    this.initLights();
    this.initReflector();
    this.loadModels();
    this.draw();
  };

  setSize = () => {
    const DPR = window.devicePixelRatio || 1;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if (this.renderer) {
      this.renderer.setPixelRatio(DPR);
      this.renderer.setSize(this.width, this.height);
    }

    if (this.camera) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    }
  };

  handleResize = () => {
    this.setSize();
  };

  initCamera() {
    this.camera = new PerspectiveCamera(40, this.width / this.height, 0.1, 250);
    this.camera.position.set(0, 2, 100);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
  }

  initLights() {
    const dirLight = new DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 1, 1);
    this.scene.add(dirLight);

    const ambLight = new AmbientLight(0xffffff, 1);
    this.scene.add(ambLight);
  }

  initReflector() {
    const dudvMap = LoaderManager.assets["waterdudv"].texture;
    dudvMap.wrapS = dudvMap.wrapT = RepeatWrapping;

    const customShader = Reflector.ReflectorShader;
    customShader.vertexShader = vertexShader;
    customShader.fragmentShader = fragmentShader;
    customShader.uniforms.tDudv = { value: dudvMap };
    customShader.uniforms.time = { value: 0 };

    const geometry = new CircleGeometry(100, 64);
    this.groundMirror = new Reflector(geometry, {
      shader: customShader,
      clipBias: 0.03,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      transparent: true,
    });

    this.groundMirror.material.transparent = true;
    this.groundMirror.material.depthWrite = false;
    this.groundMirror.material.blending = THREE.NormalBlending;
    this.groundMirror.position.set(0, 0, 0);
    this.groundMirror.rotateX(-Math.PI / 2);

    this.scene.add(this.groundMirror);
  }

  loadModels() {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    loader.setDRACOLoader(dracoLoader);

    const modelPaths = [
      "/noomoValentine/iskand1n.glb",
      "/noomoValentine/iskand2n.glb",
      "/noomoValentine/iskand3n.glb",
      "/noomoValentine/iskand4n.glb",
      "/noomoValentine/pillarsNw.glb",
    ];

    new RGBELoader().load("/noomoValentine/hdri3.hdr", (hdrTexture) => {
      hdrTexture.mapping = EquirectangularReflectionMapping;
      this.scene.environment = hdrTexture;

      modelPaths.forEach((path, index) => {
        loader.load(
          path,
          (gltf) => {
            const model = gltf.scene;
            model.position.set(0, 0, 120);
            model.scale.set(1, 1, 1);

            model.traverse((child) => {
              if (child.isMesh) {
                child.material.envMapIntensity =  0.7;
                child.material.needsUpdate = true;
              }
            });

            this.scene.add(model);
          },
          (xhr) => {
            console.log(
              `Model ${index + 1} Loading: ${(xhr.loaded / xhr.total) * 100}%`
            );
          },
          (error) => {
            console.error(`Error loading model ${index + 1}:`, error);
          }
        );
      });
    });
  }

  draw = () => {
    if (this.groundMirror?.material?.uniforms?.time) {
      this.groundMirror.material.uniforms.time.value += 0.02;
    }

    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    this.raf = requestAnimationFrame(this.draw);
  };

  render() {
    return (
      <div className="w-full">
        <canvas ref={this.canvasRef} className="scene w-full h-screen"></canvas>
      </div>
    );
  }
}

export default NoomoValentine;
