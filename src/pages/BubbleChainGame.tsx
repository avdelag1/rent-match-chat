import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type GameMode = 'normal' | 'zen';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  color: string;
  active: boolean;
  isPlayer: boolean;
  growTime?: number;
  maxRadius?: number;
}

interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  color: string;
  life: number;
  maxLife: number;
  radius: number;
}

const COLORS = [
  '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
  '#E0BBE4', '#FFDFD3', '#C9E4DE', '#F7CAC9', '#B4F8C8'
];

export default function BubbleChainGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [mode, setMode] = useState<GameMode | null>(null);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [tapsRemaining, setTapsRemaining] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);

  // Game state refs (not in React state to avoid re-renders)
  const gameStateRef = useRef({
    bubbles: [] as Bubble[],
    particles: [] as Particle[],
    animationId: 0,
    isPointerDown: false,
    pointerX: 0,
    pointerY: 0,
    playerBubble: null as Bubble | null,
    canvasWidth: 0,
    canvasHeight: 0,
    chainCount: 0,
    currentCombo: 0,
    gameStarted: false,
    lastFrameTime: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem('bubbleChainHighScore');
    if (stored) setHighScore(parseInt(stored, 10));
  }, []);

  useEffect(() => {
    if (!mode || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Setup canvas dimensions
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      gameStateRef.current.canvasWidth = rect.width;
      gameStateRef.current.canvasHeight = rect.height;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize game
    initializeGame();

    // Pointer events
    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      gameStateRef.current.isPointerDown = true;
      gameStateRef.current.pointerX = e.clientX - rect.left;
      gameStateRef.current.pointerY = e.clientY - rect.top;

      if (gameOver) {
        restartGame();
        return;
      }

      if (mode === 'normal' && tapsRemaining <= 0) {
        setGameOver(true);
        return;
      }

      // Create player bubble
      createPlayerBubble(gameStateRef.current.pointerX, gameStateRef.current.pointerY);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!gameStateRef.current.isPointerDown) return;
      const rect = canvas.getBoundingClientRect();
      gameStateRef.current.pointerX = e.clientX - rect.left;
      gameStateRef.current.pointerY = e.clientY - rect.top;
    };

    const handlePointerUp = () => {
      if (gameStateRef.current.playerBubble && gameStateRef.current.isPointerDown) {
        activatePlayerBubble();
        if (mode === 'normal') {
          setTapsRemaining(prev => prev - 1);
        }
      }
      gameStateRef.current.isPointerDown = false;
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    // Start game loop
    gameStateRef.current.gameStarted = true;
    gameStateRef.current.lastFrameTime = performance.now();
    gameLoop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      if (gameStateRef.current.animationId) {
        cancelAnimationFrame(gameStateRef.current.animationId);
      }
    };
  }, [mode, gameOver, tapsRemaining]);

  const initializeGame = () => {
    const bubbleCount = mode === 'zen' ? 15 : 5 + level * 2;
    const speed = mode === 'zen' ? 0.5 : 1 + level * 0.2;
    gameStateRef.current.bubbles = [];
    gameStateRef.current.particles = [];

    for (let i = 0; i < bubbleCount; i++) {
      createRandomBubble(speed);
    }
  };

  const createRandomBubble = (speedMultiplier = 1) => {
    const { canvasWidth, canvasHeight } = gameStateRef.current;
    const radius = 15 + Math.random() * 25;
    const x = radius + Math.random() * (canvasWidth - radius * 2);
    const y = radius + Math.random() * (canvasHeight - radius * 2);
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.5 + Math.random() * 1.5) * speedMultiplier;
    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    gameStateRef.current.bubbles.push({
      x,
      y,
      radius,
      velocityX,
      velocityY,
      color,
      active: true,
      isPlayer: false,
    });
  };

  const createPlayerBubble = (x: number, y: number) => {
    const bubble: Bubble = {
      x,
      y,
      radius: 8,
      velocityX: 0,
      velocityY: 0,
      color: '#FF6B9D',
      active: false,
      isPlayer: true,
      growTime: 0,
      maxRadius: 60,
    };
    gameStateRef.current.playerBubble = bubble;
  };

  const activatePlayerBubble = () => {
    const bubble = gameStateRef.current.playerBubble;
    if (!bubble) return;

    bubble.active = true;
    gameStateRef.current.bubbles.push(bubble);
    gameStateRef.current.playerBubble = null;
    gameStateRef.current.chainCount = 0;
    gameStateRef.current.currentCombo = 0;

    // Start explosion chain
    setTimeout(() => {
      explodeBubble(bubble);
    }, 50);
  };

  const explodeBubble = (bubble: Bubble) => {
    if (!bubble.active) return;

    bubble.active = false;
    gameStateRef.current.chainCount++;
    gameStateRef.current.currentCombo++;

    // Update combo in React state
    setCombo(gameStateRef.current.currentCombo);

    // Create particles
    createExplosionParticles(bubble);

    // Update score
    if (mode === 'normal') {
      const points = 10 * gameStateRef.current.currentCombo;
      setScore(prev => {
        const newScore = prev + points;

        // Check for level up
        const scorePerLevel = 500;
        const newLevel = Math.floor(newScore / scorePerLevel) + 1;
        if (newLevel > level) {
          setLevel(newLevel);
          setTapsRemaining(prev => Math.max(prev + 3, 10 - newLevel));
          // Add more bubbles
          const speed = 1 + newLevel * 0.2;
          for (let i = 0; i < 3; i++) {
            createRandomBubble(speed);
          }
        }

        return newScore;
      });
    }

    // Check for chain reactions
    const { bubbles } = gameStateRef.current;
    const explosionRadius = bubble.radius * 1.5;

    bubbles.forEach(other => {
      if (!other.active || other === bubble) return;

      const dx = other.x - bubble.x;
      const dy = other.y - bubble.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < explosionRadius + other.radius) {
        // Push bubble away
        const angle = Math.atan2(dy, dx);
        const force = (explosionRadius + other.radius - distance) * 0.3;
        other.velocityX += Math.cos(angle) * force;
        other.velocityY += Math.sin(angle) * force;

        // Trigger explosion
        setTimeout(() => explodeBubble(other), 100);
      }
    });

    // Remove bubble after a frame
    setTimeout(() => {
      gameStateRef.current.bubbles = gameStateRef.current.bubbles.filter(b => b !== bubble);

      // Refill bubbles in zen mode
      if (mode === 'zen' && gameStateRef.current.bubbles.length < 15) {
        createRandomBubble(0.5);
      }
    }, 16);
  };

  const createExplosionParticles = (bubble: Bubble) => {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 2;
      gameStateRef.current.particles.push({
        x: bubble.x,
        y: bubble.y,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        color: bubble.color,
        life: 1,
        maxLife: 1,
        radius: 3 + Math.random() * 3,
      });
    }
  };

  const updatePhysics = (deltaTime: number) => {
    const { bubbles, particles, canvasWidth, canvasHeight, playerBubble } = gameStateRef.current;
    const dt = Math.min(deltaTime / 16.67, 2); // Cap at 2 frames worth

    // Update player bubble (growing)
    if (playerBubble && gameStateRef.current.isPointerDown) {
      playerBubble.growTime = (playerBubble.growTime || 0) + deltaTime;
      const growthRate = 0.15;
      playerBubble.radius = Math.min(
        8 + playerBubble.growTime * growthRate,
        playerBubble.maxRadius || 60
      );
      playerBubble.x = gameStateRef.current.pointerX;
      playerBubble.y = gameStateRef.current.pointerY;
    }

    // Update bubbles
    bubbles.forEach(bubble => {
      if (!bubble.active) return;

      bubble.x += bubble.velocityX * dt;
      bubble.y += bubble.velocityY * dt;

      // Wall collisions
      if (bubble.x - bubble.radius < 0) {
        bubble.x = bubble.radius;
        bubble.velocityX = Math.abs(bubble.velocityX);
      }
      if (bubble.x + bubble.radius > canvasWidth) {
        bubble.x = canvasWidth - bubble.radius;
        bubble.velocityX = -Math.abs(bubble.velocityX);
      }
      if (bubble.y - bubble.radius < 0) {
        bubble.y = bubble.radius;
        bubble.velocityY = Math.abs(bubble.velocityY);
      }
      if (bubble.y + bubble.radius > canvasHeight) {
        bubble.y = canvasHeight - bubble.radius;
        bubble.velocityY = -Math.abs(bubble.velocityY);
      }

      // Bubble-to-bubble collisions
      bubbles.forEach(other => {
        if (other === bubble || !other.active) return;
        const dx = other.x - bubble.x;
        const dy = other.y - bubble.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDist = bubble.radius + other.radius;

        if (distance < minDist && distance > 0) {
          // Separate bubbles
          const overlap = minDist - distance;
          const angle = Math.atan2(dy, dx);
          const moveX = Math.cos(angle) * overlap * 0.5;
          const moveY = Math.sin(angle) * overlap * 0.5;
          bubble.x -= moveX;
          bubble.y -= moveY;
          other.x += moveX;
          other.y += moveY;

          // Elastic collision
          const nx = dx / distance;
          const ny = dy / distance;
          const dvx = other.velocityX - bubble.velocityX;
          const dvy = other.velocityY - bubble.velocityY;
          const dot = dvx * nx + dvy * ny;
          if (dot > 0) {
            bubble.velocityX += dot * nx * 0.5;
            bubble.velocityY += dot * ny * 0.5;
            other.velocityX -= dot * nx * 0.5;
            other.velocityY -= dot * ny * 0.5;
          }
        }
      });
    });

    // Update particles
    gameStateRef.current.particles = particles.filter(particle => {
      particle.x += particle.velocityX * dt;
      particle.y += particle.velocityY * dt;
      particle.life -= deltaTime / 1000;
      return particle.life > 0;
    });
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const { canvasWidth, canvasHeight, bubbles, particles, playerBubble } = gameStateRef.current;

    // Clear canvas
    ctx.fillStyle = mode === 'zen' ? '#1a1a2e' : '#0f0f23';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw particles
    particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw bubbles
    bubbles.forEach(bubble => {
      if (!bubble.active) return;

      const gradient = ctx.createRadialGradient(
        bubble.x - bubble.radius * 0.3,
        bubble.y - bubble.radius * 0.3,
        0,
        bubble.x,
        bubble.y,
        bubble.radius
      );
      gradient.addColorStop(0, bubble.color + 'ff');
      gradient.addColorStop(1, bubble.color + '66');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fill();

      // Bubble highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(
        bubble.x - bubble.radius * 0.3,
        bubble.y - bubble.radius * 0.3,
        bubble.radius * 0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Draw player bubble (growing)
    if (playerBubble) {
      const gradient = ctx.createRadialGradient(
        playerBubble.x - playerBubble.radius * 0.3,
        playerBubble.y - playerBubble.radius * 0.3,
        0,
        playerBubble.x,
        playerBubble.y,
        playerBubble.radius
      );
      gradient.addColorStop(0, '#FF6B9D');
      gradient.addColorStop(1, '#FF6B9D66');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(playerBubble.x, playerBubble.y, playerBubble.radius, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing ring
      ctx.strokeStyle = 'rgba(255, 107, 157, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(playerBubble.x, playerBubble.y, playerBubble.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  };

  const gameLoop = () => {
    const currentTime = performance.now();
    const deltaTime = currentTime - gameStateRef.current.lastFrameTime;
    gameStateRef.current.lastFrameTime = currentTime;

    updatePhysics(deltaTime);
    render();

    gameStateRef.current.animationId = requestAnimationFrame(gameLoop);
  };

  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setTapsRemaining(10);
    setCombo(0);
    gameStateRef.current.bubbles = [];
    gameStateRef.current.particles = [];
    gameStateRef.current.playerBubble = null;
    gameStateRef.current.chainCount = 0;
    gameStateRef.current.currentCombo = 0;
    initializeGame();
  };

  const startGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setScore(0);
    setLevel(1);
    setTapsRemaining(10);
    setGameOver(false);
    setCombo(0);
  };

  useEffect(() => {
    if (score > highScore && mode === 'normal') {
      setHighScore(score);
      localStorage.setItem('bubbleChainHighScore', score.toString());
    }
  }, [score, highScore, mode]);

  if (!mode) {
    return (
      <div className="relative w-full h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-8">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="absolute top-4 left-4 text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Bubble Chain</h1>
          <p className="text-xl text-purple-200">Reaction Game</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button
            onClick={() => startGame('normal')}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-6 px-8 rounded-2xl text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            <div className="text-2xl mb-1">Normal Mode</div>
            <div className="text-sm opacity-90">Limited taps, high scores</div>
          </button>

          <button
            onClick={() => startGame('zen')}
            className="bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold py-6 px-8 rounded-2xl text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            <div className="text-2xl mb-1">Zen Mode</div>
            <div className="text-sm opacity-90">Infinite bubbles, pure relaxation</div>
          </button>
        </div>

        {highScore > 0 && (
          <div className="mt-8 text-white text-lg">
            High Score: <span className="font-bold text-yellow-300">{highScore}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="flex justify-between items-start">
          <Button
            onClick={() => setMode(null)}
            variant="ghost"
            className="pointer-events-auto text-white bg-black/30 hover:bg-black/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="text-right">
            {mode === 'normal' && (
              <>
                <div className="text-white text-2xl font-bold bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm mb-2">
                  Score: {score}
                </div>
                <div className="text-white text-lg bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm mb-2">
                  Level: {level}
                </div>
                <div className="text-white text-lg bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                  Taps: {tapsRemaining}
                </div>
                {combo > 1 && (
                  <div className="text-yellow-300 text-xl font-bold bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm mt-2 animate-pulse">
                    Combo x{combo}
                  </div>
                )}
              </>
            )}
            {mode === 'zen' && (
              <div className="text-white text-xl font-light bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm">
                Zen Mode
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-sm">
          <div className="text-white text-center">
            <h2 className="text-5xl font-bold mb-4">Game Over</h2>
            <div className="text-3xl mb-2">Score: {score}</div>
            <div className="text-xl mb-8">Level: {level}</div>
            {score >= highScore && score > 0 && (
              <div className="text-yellow-300 text-2xl mb-4 animate-pulse">New High Score!</div>
            )}
            <button
              onClick={restartGame}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all"
            >
              Tap to Restart
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <div className="text-white text-sm bg-black/30 px-4 py-2 rounded-lg backdrop-blur-sm inline-block">
          {mode === 'normal'
            ? 'Tap and hold to grow bubble • Release to explode • Create chain reactions!'
            : 'Tap and hold to create bubbles • Watch them dance and explode'}
        </div>
      </div>
    </div>
  );
}
