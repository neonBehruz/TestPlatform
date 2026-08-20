/**
 * Modern High-Tech Perspective Grid & Cyber Waveform WebGL Engine
 * Replaces blotchy plasma with crisp, sleek neon wireframe horizon & ambient nebula glow
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

  // Fragment Shader
  const fsSource = `
    precision highp float;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;

    void main() {
      vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      vec2 mouse = (u_mouse * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      float mouseDist = length(uv - mouse);

      // Deep Dark Obsidian Background
      vec3 col = vec3(0.04, 0.045, 0.065); // #0a0b10

      // Color definitions
      vec3 glowSapphire = vec3(0.12, 0.38, 0.95); // #1f61f2
      vec3 glowCyan     = vec3(0.04, 0.78, 0.96); // #0ac7f5
      vec3 glowIndigo   = vec3(0.42, 0.16, 0.85); // #6b29d9

      // 1. Soft Ambient Radial Horizon Light
      float horizon = smoothstep(0.6, -0.6, uv.y);
      float centerGlow = 1.0 - clamp(length(uv * vec2(0.8, 1.2) - vec2(0.0, -0.2)), 0.0, 1.0);
      centerGlow = pow(centerGlow, 2.0);

      col += glowSapphire * centerGlow * 0.45;
      col += glowIndigo * horizon * 0.2;

      // Mouse interactive radial aura
      float mouseAura = smoothstep(0.7, 0.0, mouseDist);
      col += glowCyan * mouseAura * 0.22;

      // 2. Perspective Camera Raycasting for Floor Grid
      vec3 ro = vec3(0.0, 1.1, -1.6); // Camera position
      vec3 rd = normalize(vec3(uv.x * 0.85, uv.y - 0.15, 1.0)); // Camera ray

      // Render the perspective futuristic ground lattice
      if (rd.y < -0.02) {
        float t = ro.y / -rd.y;
        vec3 p = ro + rd * t;

        // Wave dynamics
        float wave = sin(p.x * 1.8 + u_time * 0.7) * cos(p.z * 1.6 - u_time * 0.5) * 0.12;
        wave += sin(length(p.xz - mouse * 2.5) * 4.0 - u_time * 2.5) * 0.06;

        // Smooth Cyber Grid
        vec2 gridCoord = p.xz * 1.1 + vec2(0.0, -u_time * 0.35);
        vec2 gridUv = abs(fract(gridCoord) - 0.5);
        float lineDist = min(gridUv.x, gridUv.y);
        float gridLine = smoothstep(0.045, 0.01, lineDist);

        // Glowing Dots at Grid Crossings
        float dotDist = length(gridUv);
        float gridDots = smoothstep(0.09, 0.02, dotDist) * 1.4;

        // Perspective Fog / Depth attenuation
        float fog = clamp(1.0 - t * 0.17, 0.0, 1.0);
        fog = pow(fog, 1.7);

        // Cyber Grid Lighting
        vec3 gridCol = mix(glowSapphire, glowCyan, sin(p.z * 0.4 + u_time * 0.8) * 0.5 + 0.5);
        col = mix(col, gridCol * 1.5, (gridLine + gridDots) * fog);
        col += glowCyan * (wave + 0.1) * fog * 0.35;
      }

      // 3. Floating Digital Sparkles / Stars
      vec2 pGrid = floor(uv * 26.0);
      float pHash = fract(sin(dot(pGrid, vec2(12.9898, 78.233))) * 43758.5453);
      if (pHash > 0.965) {
        float pFade = 0.5 + 0.5 * sin(u_time * 2.2 + pHash * 25.0);
        col += glowCyan * pFade * 0.45;
      }

      // 4. Subtle Screen Vignette
      vec2 screenUv = gl_FragCoord.xy / u_resolution.xy;
      float vig = screenUv.x * (1.0 - screenUv.x) * screenUv.y * (1.0 - screenUv.y) * 16.0;
      col *= clamp(pow(vig, 0.2), 0.0, 1.0);

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
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

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
