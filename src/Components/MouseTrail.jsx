import { useEffect, useRef } from 'react';

const MouseTrail = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);

  class Star {
    constructor(x, y, velocityX, velocityY) {
      this.x = x;
      this.y = y;
      this.finalSize = Math.random() * 2;
      this.size = this.finalSize * 2;
      this.alpha = 1;
      this.velocityX = velocityX * 0.05;
      this.velocityY = 1 + Math.random() + velocityY * 0.05;
      this.gravity = 0.02;
      this.drag = 0.97;
      this.turbulence = () => Math.random() * 0.5 - 0.25;
      this.timeElapsed = 0;
    }

    draw(ctx) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    update(deltaTime) {
      this.x += this.velocityX + this.turbulence();
      this.velocityX *= this.drag;
      this.y += this.velocityY;
      this.velocityY += this.gravity;
      this.alpha = Math.max(0, this.alpha - 0.005);

      this.timeElapsed += deltaTime;
      if (this.timeElapsed < 2000) {
        this.size = this.finalSize * 2 - (this.finalSize * this.timeElapsed) / 2000;
      } else {
        this.size = this.finalSize;
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const addStar = (e) => {
      const currentX = e.clientX;
      const currentY = e.clientY;

      const velX = currentX - lastMouseRef.current.x;
      const velY = currentY - lastMouseRef.current.y;

      velocityRef.current = { x: velX, y: velY };
      lastMouseRef.current = { x: currentX, y: currentY };

      const randomOffsetX = (Math.random() - 0.5) * 100;
      const randomOffsetY = (Math.random() - 0.5) * 100;

      starsRef.current.push(
        new Star(
          currentX,
          currentY,
          velX + randomOffsetX,
          velY + randomOffsetY
        )
      );
    };

    canvas.addEventListener('mousemove', addStar);

    const update = (time = 0) => {
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach((star) => star.update(deltaTime));
      starsRef.current.forEach((star) => star.draw(ctx));

      starsRef.current = starsRef.current.filter(
        (star) =>
          star.alpha > 0 &&
          star.y < canvas.height &&
          star.x > 0 &&
          star.x < canvas.width
      );

      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', addStar);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        // position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9,
        width: '100%',
        height: '80vh',
        backgroundColor:"black"
        // pointerEvents: 'none',
      }}
    />
  );
};

export default MouseTrail;
