"use client";

import { useRef, useEffect, useMemo } from "react";

const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const interpolateColor = (start: any, end: any, factor: number) => {
  const r = Math.round(start.r + (end.r - start.r) * factor);
  const g = Math.round(start.g + (end.g - start.g) * factor);
  const b = Math.round(start.b + (end.b - start.b) * factor);
  return `rgb(${r}, ${g}, ${b})`;
};

const calculateGrid = (width: number, height: number, charWidth: number, charHeight: number) => {
  const columns = Math.ceil(width / charWidth);
  const rows = Math.ceil(height / charHeight);
  return { columns, rows };
};

const LetterGlitch = ({
  glitchColors = ["#b6182b", "#ff2436", "#c47c2e", "#5c1018"],
  className = "",
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ01",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const letters = useRef<any[]>([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchTime = useRef(Date.now());
  const activeLetters = useRef(new Set<number>());

  const lettersAndSymbols = useMemo(() => Array.from(characters), [characters]);
  const parsedColors = useMemo(
    () => glitchColors.map((c) => ({ hex: c, rgb: hexToRgb(c) })).filter((c) => c.rgb),
    [glitchColors]
  );

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const getRandomChar = () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];
  const getRandomColor = () => parsedColors[Math.floor(Math.random() * parsedColors.length)];

  const initializeLetters = (columns: number, rows: number) => {
    grid.current = { columns, rows };
    const totalLetters = columns * rows;
    letters.current = Array.from({ length: totalLetters }, () => {
      const colorObj = getRandomColor();
      const targetObj = getRandomColor();
      return {
        char: getRandomChar(),
        color: colorObj.hex,
        startRgb: colorObj.rgb,
        targetColor: targetObj.hex,
        targetRgb: targetObj.rgb,
        colorProgress: 1,
      };
    });
    activeLetters.current.clear();
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context.current) {
      context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const { columns, rows } = calculateGrid(rect.width, rect.height, charWidth, charHeight);
    initializeLetters(columns, rows);
    drawLetters();
  };

  const drawLetters = () => {
    if (!context.current || letters.current.length === 0 || !canvasRef.current) return;
    const ctx = context.current;
    const { width, height } = canvasRef.current.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";

    letters.current.forEach((letter, index) => {
      const x = (index % grid.current.columns) * charWidth;
      const y = Math.floor(index / grid.current.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });
  };

  const drawLetter = (index: number) => {
    if (!context.current || !canvasRef.current) return;
    const ctx = context.current;
    const letter = letters.current[index];
    const x = (index % grid.current.columns) * charWidth;
    const y = Math.floor(index / grid.current.columns) * charHeight;
    ctx.clearRect(x, y, charWidth, charHeight);
    ctx.fillStyle = letter.color;
    ctx.fillText(letter.char, x, y);
  };

  const updateLetters = () => {
    if (!letters.current || letters.current.length === 0) return;

    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.05));

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length);
      const letterObj = letters.current[index];
      if (!letterObj) continue;

      const newTarget = getRandomColor();
      letterObj.char = getRandomChar();
      
      if (!smooth) {
        letterObj.color = newTarget.hex;
        letterObj.startRgb = newTarget.rgb;
        letterObj.targetColor = newTarget.hex;
        letterObj.targetRgb = newTarget.rgb;
        letterObj.colorProgress = 1;
        drawLetter(index);
      } else {
        letterObj.startRgb = letterObj.targetRgb; // previous target becomes new start
        letterObj.targetColor = newTarget.hex;
        letterObj.targetRgb = newTarget.rgb;
        letterObj.colorProgress = 0;
        activeLetters.current.add(index);
      }
    }
  };

  const handleSmoothTransitions = () => {
    for (const index of activeLetters.current) {
      const letter = letters.current[index];
      if (!letter) {
        activeLetters.current.delete(index);
        continue;
      }
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.05;
        if (letter.colorProgress >= 1) {
          letter.colorProgress = 1;
          activeLetters.current.delete(index);
        }

        if (letter.startRgb && letter.targetRgb) {
          letter.color = interpolateColor(letter.startRgb, letter.targetRgb, letter.colorProgress);
          drawLetter(index);
        }
      }
    }
  };

  const animate = () => {
    const now = Date.now();
    if (now - lastGlitchTime.current >= glitchSpeed) {
      updateLetters();
      lastGlitchTime.current = now;
    }

    if (smooth) {
      handleSmoothTransitions();
    }

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    context.current = canvas.getContext("2d");
    resizeCanvas();
    animate();

    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cancelAnimationFrame(animationRef.current);
        resizeCanvas();
        animate();
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glitchSpeed, smooth, lettersAndSymbols, parsedColors]);

  const containerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    overflow: "hidden",
    zIndex: -1,
  };

  const canvasStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    height: "100%",
    opacity: 0.15,
  };

  const outerVignetteStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    background: "radial-gradient(circle, rgba(10,9,8,0) 40%, rgba(10,9,8,1) 100%)",
  };

  const centerVignetteStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    background: "radial-gradient(circle, rgba(10,9,8,0.8) 0%, rgba(10,9,8,0) 60%)",
  };

  return (
    <div style={containerStyle} className={className}>
      <canvas ref={canvasRef} style={canvasStyle} />
      {outerVignette && <div style={outerVignetteStyle}></div>}
      {centerVignette && <div style={centerVignetteStyle}></div>}
    </div>
  );
};

export default LetterGlitch;
