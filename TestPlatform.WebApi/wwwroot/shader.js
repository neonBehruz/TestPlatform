/**
 * TestPlatform - Luxury Quantum Aurora & Neural Plasma WebGL Shader Engine
 * Ultra-smooth 60fps organic fluid waves, dynamic mouse interactions, and starry particle nebula
 */

(function () {
  const canvas = document.getElementById('bg-shader-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { alpha: false, antialias: true, powerPreference: 'high-performance' }) ||
             canvas.getContext('experimental-webgl');

  if (!gl) {
    console.warn('WebGL not supported, using fallback gradient.');
    return;
  }

  // Vertex Shader
  const vsSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Fragment Shader - Luxury Cosmic Quantum Aurora & Fluid Neon Plasma
  const fsSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;

    // Fast Pseudo-Random / Hash
    vec2 hash2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }

    // Value Noise with smooth hermite interpolation
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                     dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                 mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                     dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
    }

    // 4-Octave Domain Warped Fractal Brownian Motion
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      mat2 rot = mat2(cos(0.52), sin(0.52), -sin(0.52), cos(0.52));
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = rot * p * 2.05 + vec2(50.0);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // Normalized screen coordinates (centered at 0.0)
      vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      vec2 mouse = (u_mouse * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      float mouseDist = length(uv - mouse);

      float t = u_time * 0.28;

      // Deep Obsidian Core Space (#07080f)
      vec3 col = vec3(0.028, 0.032, 0.055);

      // Luxury Vivid Color Palette
      vec3 colElectricBlue = vec3(0.12, 0.45, 0.98); // #1f73fa
      vec3 colNeonCyan     = vec3(0.04, 0.85, 0.96); // #0ad9f5
      vec3 colDeepViolet   = vec3(0.55, 0.15, 0.95); // #8c26f2
      vec3 colRoyalIndigo  = vec3(0.28, 0.22, 0.90); // #4738e6
      vec3 colMagentaGlow  = vec3(0.92, 0.18, 0.65); // #eb2ea6

      // Domain Warping / Organic Liquid Swirl
      vec2 q = vec2(
        fbm(uv + vec2(0.0, t * 0.18)),
        fbm(uv + vec2(5.2, 1.3 - t * 0.14))
      );

      vec2 r = vec2(
        fbm(uv + 3.8 * q + vec2(1.7, 9.2) + 0.14 * t),
        fbm(uv + 3.8 * q + vec2(8.3, 2.8) + 0.11 * t)
      );

      float f = fbm(uv + 3.2 * r + vec2(0.0, t * 0.22));

      // Interactive mouse ripple & energy shockwave
      float mouseWave = sin(mouseDist * 10.0 - u_time * 3.5) * exp(-mouseDist * 2.8);
      f += mouseWave * 0.25;

      // Color composition using warped coordinates
      vec3 auroraColor = mix(colRoyalIndigo, colElectricBlue, clamp(f * f * 3.2, 0.0, 1.0));
      auroraColor = mix(auroraColor, colNeonCyan, clamp(length(q) * 1.2, 0.0, 1.0));
      auroraColor = mix(auroraColor, colDeepViolet, clamp(length(r.x) * 1.1, 0.0, 1.0));
      auroraColor = mix(auroraColor, colMagentaGlow, clamp(pow(f, 4.0) * 1.5, 0.0, 1.0));

      // Dynamic Aurora Intensity Waves
      float auroraIntensity = pow(clamp(f + 0.42, 0.0, 2.0), 3.4) * 1.05;
      col += auroraColor * auroraIntensity;

      // Center Ambient Energy Core
      float centerGlow = 1.0 - clamp(length(uv * vec2(0.8, 1.2) - vec2(0.0, -0.05)), 0.0, 1.0);
      col += colElectricBlue * pow(centerGlow, 2.2) * 0.45;
      col += colDeepViolet * pow(centerGlow, 3.2) * 0.35;

      // Dynamic Mouse Light Beacon
      float mouseAura = smoothstep(0.9, 0.0, mouseDist);
      col += colNeonCyan * pow(mouseAura, 2.0) * 0.38;

      // Glowing Quantum Star Dust / Sparkles
      vec2 starUv = uv * 7.5;
      vec2 starId = floor(starUv);
      vec2 starF = fract(starUv) - 0.5;
      vec2 sHash = hash2(starId);
      float sBright = fract(sin(dot(starId, vec2(127.1, 311.7))) * 43758.5453);
      if (sBright > 0.80) {
        float sDist = length(starF - sHash * 0.35);
        float starGlow = exp(-sDist * 18.0);
        float starTwinkle = 0.5 + 0.5 * sin(u_time * 2.5 + sBright * 25.0);
        col += mix(colNeonCyan, colMagentaGlow, sBright) * starGlow * starTwinkle * 0.55;
      }

      // Smooth Edge Vignette
      vec2 screenUv = gl_FragCoord.xy / u_resolution.xy;
      float vignette = screenUv.x * (1.0 - screenUv.x) * screenUv.y * (1.0 - screenUv.y) * 16.0;
      col *= clamp(pow(vignette, 0.22), 0.0, 1.0);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    return;
  }

  gl.useProgram(program);

  // Screen quad buffer
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.0, -1.0,
     1.0, -1.0,
    -1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
     1.0,  1.0
  ]), gl.STATIC_DRAW);

  const posAttr = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(posAttr);
  gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

  const resLoc = gl.getUniformLocation(program, 'u_resolution');
  const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
  const timeLoc = gl.getUniformLocation(program, 'u_time');

  let mouseX = window.innerWidth * 0.5;
  let mouseY = window.innerHeight * 0.5;
  let targetMouseX = mouseX;
  let targetMouseY = mouseY;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = window.innerHeight - e.clientY;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      targetMouseX = e.touches[0].clientX;
      targetMouseY = window.innerHeight - e.touches[0].clientY;
    }
  }, { passive: true });

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  let startTime = performance.now();

  function render() {
    // Smooth mouse interpolation
    mouseX += (targetMouseX - mouseX) * 0.06;
    mouseY += (targetMouseY - mouseY) * 0.06;

    const currentTime = (performance.now() - startTime) * 0.001;

    gl.uniform2f(resLoc, canvas.width, canvas.height);
    gl.uniform2f(mouseLoc, mouseX * (canvas.width / window.innerWidth), mouseY * (canvas.height / window.innerHeight));
    gl.uniform1f(timeLoc, currentTime);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
