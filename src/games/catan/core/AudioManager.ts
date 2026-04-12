import { gameEvents, GameEvent } from './EventBus';

class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled = true;

  constructor() {
    // In a full AAA setup, we would preload actual audio files here.
    // this.loadSound('dice_roll', '/sounds/dice_roll.mp3');
    // this.loadSound('build', '/sounds/build.mp3');
    // this.loadSound('resource', '/sounds/resource.mp3');
  }

  private loadSound(id: string, url: string) {
    if (typeof window === 'undefined') return;
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.sounds.set(id, audio);
  }

  play(id: string, volume = 1.0) {
    if (!this.enabled || typeof window === 'undefined') return;
    const sound = this.sounds.get(id);
    if (sound) {
      sound.volume = volume;
      sound.currentTime = 0;
      sound.play().catch(e => console.warn('Audio play failed (autoplay policy):', e));
    }
  }

  init() {
    gameEvents.subscribe((event: GameEvent) => {
      switch (event.type) {
        case 'DICE_ROLL_STARTED':
          this.play('dice_roll');
          break;
        case 'BUILDING_PLACED':
          this.play('build');
          break;
        case 'RESOURCE_GAINED':
          this.play('resource', 0.5);
          break;
      }
    });
  }
}

export const audioManager = new AudioManager();
