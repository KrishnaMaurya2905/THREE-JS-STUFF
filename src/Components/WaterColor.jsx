import React, { useEffect } from "react";
import * as T from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const WaterColor = () => {
  const canvasRef = React.useRef(null);

  const yiwenlFractalNoies = `

const int NUM_OCTAVES = 4;

float rand(vec2 n) { 
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);
	
	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}

float fbm(vec2 x) {
	float v = 0.0;
	float a = 0.5;
	vec2 shift = vec2(100);
	// Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
	for (int i = 0; i < NUM_OCTAVES; ++i) {
		v += a * noise(x);
		x = rot * x * 2.0 + shift;
		a *= 0.5;
	}
	return v;
}

  `;

  const hsl = `
 float hue2rgb(float f1, float f2, float hue) {
    if (hue < 0.0)
        hue += 1.0;
    if (hue > 1.0)
        hue -= 1.0;

    float res;
    if ((6.0 * hue) < 1.0)
        res = f1 + (f2 - f1) * 6.0 * hue;
    else if ((2.0 * hue) < 1.0)
        res = f2;
    else if ((3.0 * hue) < 2.0)
        res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
    else
        res = f1;

    return res;
}

vec3 hsl2rgb(vec3 hsl) {
    vec3 rgb;

    if (hsl.y == 0.0) {
        rgb = vec3(hsl.z); // Luminance
    } else {
        float f2;

        if (hsl.z < 0.5)
            f2 = hsl.z * (1.0 + hsl.y);
        else
            f2 = hsl.z + hsl.y - hsl.y * hsl.z;

        float f1 = 2.0 * hsl.z - f2;

        rgb.r = hue2rgb(f1, f2, hsl.x + (1.0 / 3.0));
        rgb.g = hue2rgb(f1, f2, hsl.x);
        rgb.b = hue2rgb(f1, f2, hsl.x - (1.0 / 3.0));
    }

    return rgb;
}

vec3 hsl2rgb(float h, float s, float l) {
    return hsl2rgb(vec3(h, s, l));
}

`;

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fboFragment = `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform sampler2D tPrev;
    uniform vec4 resolution;
    uniform float time;
    ${yiwenlFractalNoies}
    ${hsl}

    float blendDarken(float base, float blend) {
      return min(base, blend);
    }

    vec3 blendDarken(vec3 base, vec3 blend) {
      return vec3(blendDarken(base.r, blend.r), blendDarken(base.g, blend.g), blendDarken(base.b, blend.b));

    }

    vec3 blendDarken(vec3 base, vec3 blend, float opacity ) {
    return (blendDarken (base, blend) * opacity + base * (1.0 - opacity));
    }

    vec3 bgColor = vec3(1.0, 1.0, 1.0);

    void main() {
      vec4 color = texture2D(tDiffuse, vUv); // mouse movement
      vec4 prev = texture2D(tPrev, vUv); // previous frame

      vec2 aspect = vec2(1., resolution.y / resolution.x);

      vec2 disp = fbm(vUv * 22.0) * aspect * 0.01;


    vec4 texel = texture2D(tPrev, vUv );
    vec4 texel2 = texture2D(tPrev, vec2(vUv.x + disp.x, vUv.y));
    vec4 texel3 = texture2D(tPrev, vec2(vUv.x + disp.x, vUv.y));
    vec4 texel4 = texture2D(tPrev, vec2(vUv.x, vUv.y + disp.y));
    vec4 texel5 = texture2D(tPrev, vec2(vUv.x, vUv.y - disp.y));


    vec3 floodColor = texel3.rgb;
    floodColor = blendDarken(floodColor, texel2.rgb);
    floodColor = blendDarken(floodColor, texel3.rgb);
    floodColor = blendDarken(floodColor, texel4.rgb);
    floodColor = blendDarken(floodColor, texel5.rgb); 


    vec3 gradient = hsl2rgb(fract(time* 10.1) , 0.5, 0.5);
    vec3 lcolor = mix(vec3(1.0), gradient , color.r);
    vec3 pink = vec3(0.8, 0.2, 0.5);
    vec3 waterColor = blendDarken(prev.rgb, floodColor*(1.+ 0.01), 0.9);

    vec3 finalColor = blendDarken(waterColor, lcolor, .9);

      gl_FragColor = vec4(
        min(bgColor, finalColor *(1. + 0.01) + 0.001 ),
        1.
      );

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
        this.scene.background = new T.Color(0x000000);

        this.renderer = new T.WebGLRenderer({
          canvas: this.canvas,
          alpha: false,
          antialias: true,
        });
        this.renderer.setSize(this.device.width, this.device.height);
        this.renderer.setPixelRatio(Math.min(this.device.pixelRatio, 2));

        this.controls = new OrbitControls(this.camera, this.canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.update();

        this.clock = new T.Clock();

        this.raycaster = new T.Raycaster();
        this.pointer = new T.Vector2();
        this.pointerPos = new T.Vector3();

        this.setupPipeline();
        this.mouseEvent();
        this.setLights();

        this.render();
        this.setResize();
      }

      mouseEvent() {
        this.raycastPlane = new T.Mesh(
          new T.PlaneGeometry(100, 100),
          new T.MeshBasicMaterial({ color: 0xff0000, side: T.DoubleSide })
        );

        this.dummy = new T.Mesh(
          // new T.PlaneGeometry(0.5, 0.5, 20, 20),
          new T.SphereGeometry(0.05, 20, 20),
          new T.MeshBasicMaterial({
            color: 0xffffff,
            // transparent: true,
            // map: new T.TextureLoader().load(ballT),
          })
        );

        // this.scene.add(this.raycastPlane)
        this.scene.add(this.dummy);

        window.addEventListener("mousemove", (e) => {
          this.pointer.x = (e.clientX / this.device.width) * 2 - 1;
          this.pointer.y = -(e.clientY / this.device.height) * 2 + 1;
        });
      }

      setupPipeline() {
        this.whiteTarget = new T.WebGLRenderTarget(
          this.device.width,
          this.device.height
        );
        this.whiteScene = new T.Scene();
        this.whiteBg = new T.Mesh(
          new T.PlaneGeometry(100, 100),
          new T.MeshBasicMaterial({ color: 0xffffff })
        );
        this.whiteScene.add(this.whiteBg);

        this.box = new T.Mesh(
          new T.BoxGeometry(0.3, 0.3, 0.3),
          new T.MeshBasicMaterial({ color: 0x00ff00 })
        );
        // this.whiteScene.add(this.box);

        this.sourceTarget = new T.WebGLRenderTarget(
          this.device.width,
          this.device.height
        );

        this.targetA = new T.WebGLRenderTarget(
          this.device.width,
          this.device.height
        );
        this.targetB = new T.WebGLRenderTarget(
          this.device.width,
          this.device.height
        );

        this.renderer.setRenderTarget(this.whiteTarget);
        this.renderer.render(this.whiteScene, this.camera);

        this.fboScene = new T.Scene();
        this.fboCamera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.fboMaterial = new T.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            tDiffuse: { value: null },
            tPrev: { value: this.whiteTarget.texture },
            resolution: {
              value: new T.Vector4(this.device.width, this.device.height, 1, 1),
            },
          },
          vertexShader: vertexShader,
          fragmentShader: fboFragment,
        });

        this.fboQuad = new T.Mesh(new T.PlaneGeometry(2, 2), this.fboMaterial);
        this.fboScene.add(this.fboQuad);

        this.finalScene = new T.Scene();
        this.finalQuad = new T.Mesh(
          new T.PlaneGeometry(2, 2),
          new T.MeshBasicMaterial({ map: this.targetA.texture })
        );
        this.finalScene.add(this.finalQuad);
      }

      render() {
        this.time = this.clock.getElapsedTime() * 0.005;
        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersects = this.raycaster.intersectObjects([this.raycastPlane]);

        if (intersects.length > 0) {
          this.dummy.position.copy(intersects[0].point);
        }

        requestAnimationFrame(this.render.bind(this));

        // rendering the source
        this.renderer.setRenderTarget(this.sourceTarget);

        this.renderer.render(this.scene, this.camera);

        // running ping-pong
        this.renderer.setRenderTarget(this.targetA);
        this.renderer.render(this.fboScene, this.fboCamera);

        this.fboMaterial.uniforms.tDiffuse.value = this.sourceTarget.texture;
        this.fboMaterial.uniforms.tPrev.value = this.targetA.texture;
        this.fboMaterial.uniforms.time.value = this.time;

        // final output
        this.finalQuad.material.map = this.targetA.texture;
        this.renderer.setRenderTarget(null);

        this.renderer.render(this.finalScene, this.fboCamera);

        // swap
        let temp = this.targetA;
        this.targetA = this.targetB;
        this.targetB = temp;

        this.controls.update();
      }

      setLights() {
        this.ambientLight = new T.AmbientLight(0xffffff);
        this.scene.add(this.ambientLight);
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

export default WaterColor;
