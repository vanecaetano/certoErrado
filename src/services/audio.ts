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

  playCorrectVibrant(): void {
    // play a short arpeggio with envelope to feel more vibrant
    const ctx = this.getAudioContext();
    if (!ctx) {
      this.playTone(880, 0.18, 'sine');
      return;
    }

    const now = ctx.currentTime;
    try {
      const master = ctx.createGain();
      master.connect(ctx.destination);
      master.gain.setValueAtTime(0.001, now);
      master.gain.exponentialRampToValueAtTime(0.25, now + 0.01);

      const freqs = [880, 1100, 1320];
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = f;
        osc.connect(gain);
        gain.connect(master);
        const start = now + i * 0.05;
        const dur = 0.18;
        gain.gain.setValueAtTime(0.0, start);
        gain.gain.linearRampToValueAtTime(0.25 / freqs.length, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.start(start);
        osc.stop(start + dur + 0.02);
      });

      // smooth master down
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    } catch (e) {
      // fallback
      this.playTone(880, 0.18, 'sine');
    }
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
