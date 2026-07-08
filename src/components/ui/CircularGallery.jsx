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
  uniform sampler2D tOverlay;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(tMap, vUv);
    vec4 overlay = texture2D(tOverlay, vUv);
    gl_FragColor = vec4(mix(color.rgb, overlay.rgb, overlay.a), color.a);
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

      // Create WebGL texture for the video
      const texture = new Texture(gl, {
        generateMipmaps: false,
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
        minFilter: gl.LINEAR,
      });

      // Create an offscreen canvas for the stats overlay
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      // Match the canvas aspect ratio precisely to the WebGL plane aspect ratio
      // to prevent the text and icons from getting squished/distorted when mapped!
      canvas.height = Math.round(1024 * (itemHeight / itemWidth));
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Bottom shadow gradient for readability
      const gradient = ctx.createLinearGradient(0, canvas.height - 350, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - 350, canvas.width, 350);

      // Text settings
      ctx.fillStyle = 'white';
      ctx.font = '600 36px sans-serif'; // slightly larger font
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;

      const views = (Math.random() * 200 + 50).toFixed(0) + 'K';
      const likes = (Math.random() * 40 + 10).toFixed(1) + 'K';
      
      const bottomY = canvas.height - 90;
      const rightX = canvas.width - 60;
      
      // Draw Likes
      ctx.fillText(likes, rightX, bottomY);
      const likesWidth = ctx.measureText(likes).width;
      
      // Draw Heart
      const heartPath = new Path2D("M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z");
      ctx.save();
      const heartX = rightX - likesWidth - 42;
      const heartY = bottomY - 18; 
      ctx.translate(heartX, heartY);
      ctx.scale(1.5, 1.5);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'white';
      ctx.stroke(heartPath);
      ctx.fillStyle = 'white';
      ctx.fill(heartPath);
      ctx.restore();
      
      // Draw Views
      const viewsRightX = heartX - 30;
      ctx.fillText(views, viewsRightX, bottomY);
      const viewsWidth = ctx.measureText(views).width;
      
      // Draw Play Icon (Triangle)
      const playPath = new Path2D("M5 3 L19 12 L5 21 Z");
      ctx.save();
      const playX = viewsRightX - viewsWidth - 42;
      const playY = bottomY - 18;
      ctx.translate(playX, playY);
      ctx.scale(1.5, 1.5);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2.5;
      ctx.stroke(playPath);
      ctx.restore();

      const overlayTexture = new Texture(gl, {
        image: canvas,
        generateMipmaps: true,
      });

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          tMap: { value: texture },
          tOverlay: { value: overlayTexture },
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
        imageSet: false,
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
      className="w-full h-full cursor-grab active:cursor-grabbing relative"
      style={{ touchAction: 'none' }}
    />
  );
}
