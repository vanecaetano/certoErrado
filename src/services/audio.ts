import successSound from '@/assets/success.mp3';
import errorSound from '@/assets/error.mp3';

class AudioService {
  private successAudio = new Audio(successSound);
  private errorAudio = new Audio(errorSound);



  playCorrect(): void {
    this.successAudio.currentTime = 0;
    this.successAudio.play().catch(() => {});
  }

  playCorrectVibrant(): void {
    this.successAudio.currentTime = 0;
    this.successAudio.play().catch(() => {});
  }

  playWrong(): void {
    this.errorAudio.currentTime = 0;
    this.errorAudio.play().catch(() => {});
  }

  vibrate(pattern: number | number[] = 200): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
}

export const audioService = new AudioService();
