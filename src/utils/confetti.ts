import confetti from 'canvas-confetti';

export function fireJackpotConfetti() {
  const count = 200;
  const defaults = {
    origin: { y: 0.6 },
    zIndex: 99999,
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: ['#ffd700', '#f59e0b', '#22c55e', '#10b981', '#ffffff', '#eab308'],
    });
  }

  fire(0.25, {
    spread: 26,
    startVelocity: 55,
  });
  fire(0.2, {
    spread: 60,
  });
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 1.2,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 25,
    decay: 0.92,
    scalar: 1.4,
  });
  fire(0.1, {
    spread: 120,
    startVelocity: 45,
  });
}

export function fireCoinCelebration() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    zIndex: 99999,
    colors: ['#ffd700', '#fbbf24', '#f59e0b', '#4ade80', '#22c55e'],
    scalar: 1.1,
  });
}
