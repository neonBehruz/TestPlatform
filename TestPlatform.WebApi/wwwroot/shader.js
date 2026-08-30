/**
 * TestPlatform - Luxury Cosmic Neural Wave & Glowing Aurora WebGL Shader Engine
 * Silk-smooth organic fluid waves, dynamic mouse interactions, and starry particle nebula
 */

(function () {
  const canvas = document.getElementById('bg-shader-canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl', { alpha: false, antialias: true, powerPreference: 'high-performance' }) ||
             canvas.getContext('experimental-webgl');

  if (!gl) {
    console.warn('WebGL not supported, falling back to CSS background.');
    return;
  }

  // Vertex Shader
  const vsSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // Fragment Shader - Luxury Organic Neural Aurora & Fluid Glow
  const fsSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;

    // Simplex Noise / Hash helper
    vec2 hash2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(dot(hash2(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
                     dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
                 mix(dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
                     dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), u.y);
    }

    // Fractal Brownian Motion
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = rot * p * 2.0 + vec2(100.0);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // Normalized coordinates centered at origin
      vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      vec2 mouse = (u_mouse * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      float mouseDist = length(uv - mouse);

      float t = u_time * 0.25;

      // Deep Dark Luxury Obsidian Space
      vec3 col = vec3(0.035, 0.04, 0.065); // #090a11

      // Harmonious Modern Color Palette
      vec3 colBlue   = vec3(0.12, 0.42, 0.98); // #1f6bff Electric Sapphire
      vec3 colCyan   = vec3(0.06, 0.82, 0.96); // #0fd1f5 Vivid Cyan
      vec3 colPurple = vec3(0.52, 0.18, 0.92); // #852eeb Deep Ultraviolet
      vec3 colIndigo = vec3(0.25, 0.22, 0.85); // #4038d9 Royal Indigo

      // 1. Organic Fluid Distortion & Waves
      vec2 q = vec2(fbm(uv + vec2(0.0, t * 0.15)), fbm(uv + vec2(5.2, 1.3 - t * 0.12)));
      vec2 r = vec2(fbm(uv + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t), fbm(uv + 4.0 * q + vec2(8.3, 2.8) + 0.12 * t));
      float f = fbm(uv + 3.5 * r + vec2(0.0, t * 0.2));

      // Mouse interactive wave ripple
      float mouseWave = sin(mouseDist * 8.0 - u_time * 3.0) * exp(-mouseDist * 2.5);
      f += mouseWave * 0.2;

      // Color blending based on fluid FBM
      vec3 fluidColor = mix(colIndigo, colBlue, clamp(f * f * 3.5, 0.0, 1.0));
      fluidColor = mix(fluidColor, colCyan, clamp(length(q), 0.0, 1.0));
      fluidColor = mix(fluidColor, colPurple, clamp(length(r.x), 0.0, 1.0));

      // Soft Aurora Glow Intensity
      float auroraIntensity = pow(f + 0.35, 3.2) * 0.85;
      col += fluidColor * auroraIntensity;

      // 2. Center & Ambient Floating Glow Orbs
      float centerGlow = 1.0 - clamp(length(uv * vec2(0.85, 1.15) - vec2(0.0, -0.1)), 0.0, 1.0);
      col += colBlue * pow(centerGlow, 2.5) * 0.35;
      col += colPurple * pow(centerGlow, 3.5) * 0.25;

      // Mouse Aura Glow
      float mouseAura = smoothstep(0.8, 0.0, mouseDist);
      col += colCyan * pow(mouseAura, 2.0) * 0.3;

      // 3. Smooth Star Dust / Glowing Bokeh Points (No Blocky Pixels)
      vec2 starUv = uv * 6.0;
      vec2 starId = floor(starUv);
      vec2 starF = fract(starUv) - 0.5;
      vec2 sHash = hash2(starId);
      float sBright = fract(sin(dot(starId, vec2(127.1, 311.7))) * 43758.5453);
      if (sBright > 0.82) {
        float sDist = length(starF - sHash * 0.3);
        float starGlow = exp(-sDist * 16.0);
        float starTwinkle = 0.5 + 0.5 * sin(u_time * 2.0 + sBright * 20.0);
        col += mix(colCyan, colBlue, sBright) * starGlow * starTwinkle * 0.45;
      }

      // 4. Subtle Cinematic Vignette
      vec2 screenUv = gl_FragCoord.xy / u_resolution.xy;
      float vignette = screenUv.x * (1.0 - screenUv.x) * screenUv.y * (1.0 - screenUv.y) * 16.0;
      col *= clamp(pow(vignette, 0.18), 0.0, 1.0);

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

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  let startTime = performance.now();

  function render() {
    if (document.body.classList.contains('auth-page') || canvas.style.display === 'block') {
      // Smooth mouse interpolation
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      const currentTime = (performance.now() - startTime) * 0.001;

      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform2f(mouseLoc, mouseX * (canvas.width / window.innerWidth), mouseY * (canvas.height / window.innerHeight));
      gl.uniform1f(timeLoc, currentTime);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
