// -------------------------------------------------------------
// Ultra-Low Latency Synthesized Mechanical Keyboard Audio Engine
// Built using Web Audio API nodes (zero external audio file latency)
// -------------------------------------------------------------

export type SoundProfile = 'thock' | 'clicky' | 'typewriter' | 'muted';

export interface SoundEngineConfig {
  profile: SoundProfile;
  volume: number; // 0.0 to 1.0
  muted: boolean;
}

const STORAGE_KEY_SOUND = 'auratype_sound_config_v1';

class MechanicalSoundEngine {
  private ctx: AudioContext | null = null;
  private profile: SoundProfile = 'thock';
  private volume: number = 0.45;
  private isMuted: boolean = false;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    this.loadPersistedConfig();
  }

  private loadPersistedConfig() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SOUND);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) this.profile = parsed.profile;
        if (typeof parsed.volume === 'number') this.volume = parsed.volume;
        if (typeof parsed.muted === 'boolean') this.isMuted = parsed.muted;
      }
    } catch {
      // ignore
    }
  }

  private persistConfig() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        STORAGE_KEY_SOUND,
        JSON.stringify({
          profile: this.profile,
          volume: this.volume,
          muted: this.isMuted,
        })
      );
    } catch {
      // ignore
    }
  }

  /**
   * Lazily initialize and resume AudioContext upon first user interaction
   */
  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    // Pre-generate noise buffer for tactile housing acoustics
    if (this.ctx && !this.noiseBuffer) {
      const bufferSize = this.ctx.sampleRate * 0.06; // 60ms noise buffer
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Decaying white-to-brown noise
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }
      this.noiseBuffer = buffer;
    }

    return this.ctx;
  }

  public setProfile(profile: SoundProfile) {
    this.profile = profile;
    this.persistConfig();
  }

  public getProfile(): SoundProfile {
    return this.profile;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.persistConfig();
  }

  public getVolume(): number {
    return this.volume;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    this.persistConfig();
  }

  public isSoundMuted(): boolean {
    return this.isMuted || this.profile === 'muted';
  }

  public playKeypress(isSpace: boolean = false, isError: boolean = false) {
    this.playKey(isSpace, isError);
  }

  /**
   * Primary entry point: plays a tactile keystroke sound instantaneously
   */
  public playKey(isSpace: boolean = false, isError: boolean = false) {
    if (this.isMuted || this.profile === 'muted') return;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Master gain node with smooth anti-clipping ramping
    const masterGain = ctx.createGain();
    const effectiveVolume = this.volume * (isError ? 0.35 : 0.5);
    masterGain.gain.setValueAtTime(effectiveVolume, now);
    masterGain.connect(ctx.destination);

    // Subtle pitch randomization (±3%) to emulate physical finger strike variance
    const pitchJitter = 1 + (Math.random() * 0.06 - 0.03);

    // -------------------------------------------------------------
    // Subdued error click
    // -------------------------------------------------------------
    if (isError) {
      const errorOsc = ctx.createOscillator();
      const errorGain = ctx.createGain();
      errorOsc.type = 'triangle';
      errorOsc.frequency.setValueAtTime(120, now);
      errorOsc.frequency.exponentialRampToValueAtTime(55, now + 0.08);

      errorGain.gain.setValueAtTime(0.3, now);
      errorGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      errorOsc.connect(errorGain);
      errorGain.connect(masterGain);

      errorOsc.start(now);
      errorOsc.stop(now + 0.09);
      return;
    }

    // -------------------------------------------------------------
    // Profile 1: Thock (Lubed Linear / Topre Switch)
    // -------------------------------------------------------------
    if (this.profile === 'thock') {
      const baseFreq = (isSpace ? 135 : 240) * pitchJitter;

      // 1. Deep fundamental bottom-out thump
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, now + 0.045);

      oscGain.gain.setValueAtTime(0.65, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(oscGain);
      oscGain.connect(masterGain);

      // 2. Plastic housing acoustic resonance (filtered noise burst)
      if (this.noiseBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(isSpace ? 480 : 720, now);
        noiseFilter.Q.setValueAtTime(1.8, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        noise.start(now);
        noise.stop(now + 0.04);
      }

      osc.start(now);
      osc.stop(now + 0.05);
      return;
    }

    // -------------------------------------------------------------
    // Profile 2: Clicky (Cherry MX Blue / Kailh Box White)
    // -------------------------------------------------------------
    if (this.profile === 'clicky') {
      const clickFreq = (isSpace ? 1900 : 2550) * pitchJitter;

      // 1. Sharp tactile click leaf snap
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(clickFreq, now);
      clickOsc.frequency.exponentialRampToValueAtTime(clickFreq * 0.45, now + 0.015);

      clickGain.gain.setValueAtTime(0.7, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

      clickOsc.connect(clickGain);
      clickGain.connect(masterGain);

      // 2. Secondary metal contact bounce (8ms later)
      const bounceOsc = ctx.createOscillator();
      const bounceGain = ctx.createGain();
      bounceOsc.type = 'triangle';
      bounceOsc.frequency.setValueAtTime(clickFreq * 1.25, now + 0.008);
      bounceGain.gain.setValueAtTime(0.001, now);
      bounceGain.gain.setValueAtTime(0.35, now + 0.008);
      bounceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

      bounceOsc.connect(bounceGain);
      bounceGain.connect(masterGain);

      // 3. Bottom out thump
      const thumpOsc = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(isSpace ? 110 : 170, now);
      thumpOsc.frequency.exponentialRampToValueAtTime(50, now + 0.035);

      thumpGain.gain.setValueAtTime(0.4, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(masterGain);

      clickOsc.start(now);
      bounceOsc.start(now + 0.008);
      thumpOsc.start(now);

      clickOsc.stop(now + 0.02);
      bounceOsc.stop(now + 0.026);
      thumpOsc.stop(now + 0.04);
      return;
    }

    // -------------------------------------------------------------
    // Profile 3: Typewriter (Vintage Cast-Metal Mechanical Striker)
    // -------------------------------------------------------------
    if (this.profile === 'typewriter') {
      const strikeFreq = (isSpace ? 750 : 1150) * pitchJitter;

      // 1. Cast metal type bar impact
      const strikeOsc = ctx.createOscillator();
      const strikeGain = ctx.createGain();
      strikeOsc.type = 'triangle';
      strikeOsc.frequency.setValueAtTime(strikeFreq, now);
      strikeOsc.frequency.exponentialRampToValueAtTime(300, now + 0.035);

      strikeGain.gain.setValueAtTime(0.65, now);
      strikeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

      strikeOsc.connect(strikeGain);
      strikeGain.connect(masterGain);

      // 2. High metallic ring overtone
      const pingOsc = ctx.createOscillator();
      const pingGain = ctx.createGain();
      pingOsc.type = 'sine';
      pingOsc.frequency.setValueAtTime(strikeFreq * 2.8, now);
      pingGain.gain.setValueAtTime(0.2, now);
      pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      pingOsc.connect(pingGain);
      pingGain.connect(masterGain);

      strikeOsc.start(now);
      pingOsc.start(now);
      strikeOsc.stop(now + 0.045);
      pingOsc.stop(now + 0.045);

      // 3. Occasional bell chime on spacebar (carriage advancement)
      if (isSpace && Math.random() < 0.22) {
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(2150, now);
        bellGain.gain.setValueAtTime(0.18, now);
        bellGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.26);

        bellOsc.connect(bellGain);
        bellGain.connect(masterGain);

        bellOsc.start(now);
        bellOsc.stop(now + 0.28);
      }
    }
  }
}

// Singleton audio engine export
export const soundEngine = new MechanicalSoundEngine();
