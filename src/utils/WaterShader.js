const vertexShader = `uniform mat4 textureMatrix;
		varying vec4 vUv;

		void main() {

			vUv = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#include <logdepthbuf_vertex>

		}`;

const fragmentShader = `
uniform sampler2D tDiffuse;
uniform sampler2D tDudv;
uniform float time;

varying vec4 vUv;

void main() {
    float waveStrength = 0.7;
    float waveSpeed = 0.10;

    vec2 distortedUv = texture2D(tDudv, vec2(vUv.x + time * waveSpeed, vUv.y)).rg * waveStrength;
    distortedUv = vUv.xy + vec2(distortedUv.x, distortedUv.y + time * waveSpeed);
    vec2 distortion = (texture2D(tDudv, distortedUv).rg * 2.0 - 1.0) * waveStrength;

    vec4 uv = vec4(vUv);
    uv.xy += distortion;

    vec4 base = texture2DProj(tDiffuse, uv);
    vec3 blended = base.rgb; // No overlay blend

    // Optional gamma correction
    blended = pow(blended, vec3(1.0 / 2.2));

    gl_FragColor = vec4(blended, 0.8); // Semi-transparent water
}

`;

export { vertexShader, fragmentShader };