import { useEffect, useRef } from 'react';
import { gameEvents } from './EventBus';

class SoundSynth {
  ctx: AudioContext;

  constructor() {
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  private playTone(freq: number, type: OscillatorType, duration: number, vol: number = 0.1) {
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playDiceRoll() {
    // Rapid clicks to simulate rolling
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this.playTone(300 + Math.random() * 400, 'triangle', 0.05, 0.05);
      }, i * 80 + Math.random() * 20);
    }
  }

  playDiceSettle() {
    // Solid thud
    this.playTone(150, 'square', 0.15, 0.1);
    setTimeout(() => this.playTone(100, 'sine', 0.1, 0.1), 20);
  }

  playResource() {
    // Pleasant chime (Major third)
    this.playTone(880, 'sine', 0.3, 0.05); // A5
    setTimeout(() => this.playTone(1108.73, 'sine', 0.4, 0.05), 50); // C#6
  }

  playBuild() {
    // Heavy crunch/thud
    this.playTone(100, 'sawtooth', 0.2, 0.1);
    this.playTone(80, 'square', 0.3, 0.1);
    setTimeout(() => this.playTone(60, 'sine', 0.2, 0.1), 50);
  }

  playRobber() {
    // Ominous descending tone
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.6);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  playTrade() {
    // Cash register / coin jingle
    this.playTone(1200, 'square', 0.1, 0.05);
    setTimeout(() => this.playTone(1600, 'sine', 0.2, 0.05), 80);
  }

  playClick() {
    // UI Click
    this.playTone(600, 'sine', 0.05, 0.02);
  }
}

export function AudioSystem() {
  const synthRef = useRef<SoundSynth | null>(null);

  useEffect(() => {
    // Initialize synth on first user interaction to comply with browser autoplay policies
    const initAudio = () => {
      if (!synthRef.current) {
        synthRef.current = new SoundSynth();
      }
    };

    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });

    // Global click listener for UI sounds
    const handleGlobalClick = (e: MouseEvent) => {
      if (!synthRef.current) return;
      const target = e.target as HTMLElement;
      // Play click sound if a button or interactive element was clicked
      if (target.closest('button') || target.closest('.cursor-pointer')) {
        synthRef.current.playClick();
      }
    };
    window.addEventListener('click', handleGlobalClick);

    // Subscribe to game events
    const unsub = gameEvents.subscribe((event) => {
      if (!synthRef.current) return;

      switch (event.type) {
        case 'DICE_ROLL_STARTED':
          synthRef.current.playDiceRoll();
          break;
        case 'DICE_SETTLED':
          synthRef.current.playDiceSettle();
          break;
        case 'RESOURCE_GAINED':
          synthRef.current.playResource();
          break;
        case 'BUILDING_PLACED':
          synthRef.current.playBuild();
          break;
        case 'ROBBER_MOVED':
          synthRef.current.playRobber();
          break;
        case 'TRADE_COMPLETED':
          synthRef.current.playTrade();
          break;
      }
    });

    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
      window.removeEventListener('click', handleGlobalClick);
      unsub();
    };
  }, []);

  return null;
}
