import React, { useRef, useEffect } from 'react';
import { Renderer, Camera, Transform, Plane, Program, Texture, Mesh } from 'ogl';

// Basic vertex shader for curving the gallery
const vertex = `
  attribute vec3 position;
  attribute vec2 uv;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform float bend;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Apply a curved bending effect based on the x position in camera space
    mvPosition.z -= pow(mvPosition.x, 2.0) * bend;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// Basic fragment shader
const fragment = `
  precision highp float;
  uniform sampler2D tMap;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(tMap, vUv);
    gl_FragColor = color;
  }
`;

export default function CircularGallery({ 
  videos = [], 
  bend = 0.05, 
  itemWidth = 3, 
  itemHeight = 5.3, 
  gap = 0.5 
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio, 2) });
    const gl = renderer.gl;
    containerRef.current.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 45 });
    camera.position.z = 10;

    const scene = new Transform();

    // High segment count for smooth bending
    const geometry = new Plane(gl, { width: itemWidth, height: itemHeight, widthSegments: 30, heightSegments: 30 });

    const items = [];
    const videoElements = [];

    videos.forEach((src, i) => {
      // Create hidden video element
      const video = document.createElement('video');
      video.src = src;
      video.crossOrigin = 'anonymous';
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.style.position = 'fixed';
      video.style.top = '0px';
      video.style.left = '0px';
      video.style.width = '1px';
      video.style.height = '1px';
      video.style.opacity = '0.001';
      video.style.pointerEvents = 'none';
      video.style.zIndex = '-1';
      document.body.appendChild(video);
      video.play().catch(e => {
        if (e.name !== 'AbortError') {
          console.warn('Video autoplay blocked:', e);
        }
      });
      
      videoElements.push(video);

      // Create an empty texture first to avoid WebGL "no video" error
      const texture = new Texture(gl, {
        generateMipmaps: false,
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
        minFilter: gl.LINEAR,
      });

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          tMap: { value: texture },
          bend: { value: bend },
        },
      });

      const mesh = new Mesh(gl, { geometry, program });
      mesh.setParent(scene);
      
      items.push({
        mesh,
        texture,
        video,
        index: i,
        imageSet: false, // track if image is attached
      });
    });

    const totalWidth = items.length * (itemWidth + gap);
    
    // Scroll state
    let scroll = {
      current: 0,
      target: 0,
      last: 0,
    };

    let isDown = false;
    let startX = 0;

    const onDown = (e) => {
      isDown = true;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
    };

    const onMove = (e) => {
      if (!isDown) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const distance = (startX - x) * 0.02; // Increased from 0.01 for faster sliding
      scroll.target += distance;
      startX = x;
    };

    const onUp = () => {
      isDown = false;
    };

    const onWheel = (e) => {
      scroll.target += e.deltaY * 0.004 + e.deltaX * 0.004; // Increased from 0.002 for faster scrolling
    };

    const container = containerRef.current;
    container.addEventListener('mousedown', onDown);
    container.addEventListener('mousemove', onMove);
    container.addEventListener('mouseup', onUp);
    container.addEventListener('mouseleave', onUp);
    container.addEventListener('touchstart', onDown, { passive: true });
    container.addEventListener('touchmove', onMove, { passive: true });
    container.addEventListener('touchend', onUp);
    container.addEventListener('wheel', onWheel, { passive: true });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    };
    window.addEventListener('resize', resize);
    resize();

    let animationId;
    const update = () => {
      animationId = requestAnimationFrame(update);

      // Inertia
      scroll.current += (scroll.target - scroll.current) * 0.08; // Increased from 0.05 for snappier feeling

      items.forEach((item, i) => {
        // Update video texture if playing
        if (item.video.readyState >= item.video.HAVE_CURRENT_DATA) {
          if (!item.imageSet) {
            item.texture.image = item.video;
            item.imageSet = true;
          }
          if (item.lastTime !== item.video.currentTime) {
            item.texture.needsUpdate = true;
            item.lastTime = item.video.currentTime;
          }
        }

        // Wrap logic
        const xOffset = i * (itemWidth + gap);
        let xPos = xOffset - scroll.current;
        
        // Wrap items to create infinite scroll
        const halfTotal = totalWidth / 2;
        if (xPos > halfTotal) xPos -= totalWidth;
        if (xPos < -halfTotal) xPos += totalWidth;

        item.mesh.position.x = xPos;
      });

      renderer.render({ scene, camera });
    };
    update();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      container.removeEventListener('mousedown', onDown);
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseup', onUp);
      container.removeEventListener('mouseleave', onUp);
      container.removeEventListener('touchstart', onDown);
      container.removeEventListener('touchmove', onMove);
      container.removeEventListener('touchend', onUp);
      container.removeEventListener('wheel', onWheel);
      
      videoElements.forEach(v => {
        v.pause();
        v.src = '';
        v.load();
        if (v.parentNode) {
          v.parentNode.removeChild(v);
        }
      });
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }
    };
  }, [videos, bend, itemWidth, itemHeight, gap]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    />
  );
}
