import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MouseTextDisp = () => {
  const containerRef = useRef();

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    const cameraDistance = 8;
    const camera = new THREE.OrthographicCamera(
      -cameraDistance * aspect,
      cameraDistance * aspect,
      cameraDistance,
      -cameraDistance,
      0.01,
      1000
    );
    camera.position.set(0, -10, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    scene.background = new THREE.Color(0xffffff);

    // Sphere setup
    const sphereGeometry = new THREE.SphereGeometry(0.25, 32, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // Hit plane for raycasting
    const hitGeometry = new THREE.PlaneGeometry(500, 500, 10, 10);
    const hitMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const hit = new THREE.Mesh(hitGeometry, hitMaterial);
    hit.name = 'hit';
    scene.add(hit);

    // Load your textures
    const texture = new THREE.TextureLoader().load('/happydays.png');
    const shadowTexture = new THREE.TextureLoader().load('/happydays_shadow.png');

    // Plane and shadow material with displacement
    const baseUniforms = {
      uTexture: { value: texture },
      uDisplacement: { value: new THREE.Vector3(0, 0, 0) },
    };

    const displacementVert = `
      varying vec2 vUv;
      uniform vec3 uDisplacement;

      float easeInOutCubic(float x) {
        return x < 0.5 ? 4. * x * x * x : 1. - pow(-2. * x + 2., 3.) / 2.;
      }

      float map(float value, float min1, float max1, float min2, float max2) {
        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
      }

      void main() {
        vUv = uv;
        vec3 new_position = position;

        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        float dist = length(uDisplacement - worldPosition.rgb);
        float min_distance = 3.0;

        if (dist < min_distance) {
          float distance_mapped = map(dist, 0.0, min_distance, 1.0, 0.0);
          float val = easeInOutCubic(distance_mapped);
          new_position.z += val;
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4(new_position, 1.0);
      }
    `;

    const baseFrag = `
      varying vec2 vUv;
      uniform sampler2D uTexture;
      void main() {
        vec4 color = texture2D(uTexture, vUv);
        gl_FragColor = vec4(color);
      }
    `;

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(baseUniforms),
      vertexShader: displacementVert,
      fragmentShader: baseFrag,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const planeGeometry = new THREE.PlaneGeometry(15, 15, 100, 100);
    const plane = new THREE.Mesh(planeGeometry, shaderMaterial);
    plane.rotation.z = Math.PI / 4;
    scene.add(plane);

    // Shadow plane
    const shadowUniforms = {
      uTexture: { value: shadowTexture },
      uDisplacement: { value: new THREE.Vector3(0, 0, 0) },
    };

    const shadowVert = `
      varying vec2 vUv;
      varying float dist;
      uniform vec3 uDisplacement;

      void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        dist = length(uDisplacement - worldPosition.rgb);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const shadowFrag = `
      varying vec2 vUv;
      varying float dist;
      uniform sampler2D uTexture;

      float map(float value, float min1, float max1, float min2, float max2) {
        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
      }

      void main() {
        vec4 color = texture2D(uTexture, vUv);
        float min_distance = 3.0;

        if (dist < min_distance) {
          float alpha = map(dist, min_distance, 0.0, color.a, 0.0);
          color.a = alpha;
        }

        gl_FragColor = vec4(color);
      }
    `;

    const shaderMaterialShadow = new THREE.ShaderMaterial({
      uniforms: shadowUniforms,
      vertexShader: shadowVert,
      fragmentShader: shadowFrag,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const planeShadow = new THREE.Mesh(planeGeometry, shaderMaterialShadow);
    planeShadow.rotation.z = Math.PI / 4;
    scene.add(planeShadow);

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObject(hit);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        sphere.position.copy(point);
        shaderMaterial.uniforms.uDisplacement.value = point;
        shaderMaterialShadow.uniforms.uDisplacement.value = point;
      }
    };

    window.addEventListener('pointermove', onPointerMove);

    const onWindowResize = () => {
      const newAspect = window.innerWidth / window.innerHeight;
      camera.left = -cameraDistance * newAspect;
      camera.right = cameraDistance * newAspect;
      camera.top = cameraDistance;
      camera.bottom = -cameraDistance;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onWindowResize);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onWindowResize);
      containerRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default MouseTextDisp;
