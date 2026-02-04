class AudioService {
  private audioContext: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('AudioContext não disponível:', error);
        return null;
      }
    }
    return this.audioContext;
  }

  private async ensureAudioContext(): Promise<AudioContext | null> {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (error) {
        console.warn('Não foi possível retomar AudioContext:', error);
      }
    }
    return ctx;
  }

  playCorrect(): void {
    this.playTone(800, 0.2, 'sine');
  }

  playWrong(): void {
    this.playTone(300, 0.3, 'sawtooth');
  }

  private async playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<void> {
    try {
      const audioContext = await this.ensureAudioContext();
      if (!audioContext) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Não foi possível reproduzir som:', error);
    }
  }

  vibrate(pattern: number | number[] = 200): void {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
}

export const audioService = new AudioService();
