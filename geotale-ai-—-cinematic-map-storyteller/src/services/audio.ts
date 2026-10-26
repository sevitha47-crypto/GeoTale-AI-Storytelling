// Ambient audio soundscape synthesizer using Web Audio API

class AmbientAudioService {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private gainNode: GainNode | null = null;
  private nodes: (OscillatorNode | AudioNode)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(soundType: 'ocean-breeze' | 'ambient-drift' | 'gentle-acoustic' | 'none' = 'ambient-drift') {
    if (soundType === 'none') {
      this.stop();
      return;
    }

    try {
      this.initContext();
      if (!this.ctx) return;

      this.stop(); // Stop any existing sounds
      this.isPlaying = true;

      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 3);
      masterGain.connect(this.ctx.destination);
      this.gainNode = masterGain;

      if (soundType === 'ocean-breeze') {
        // Pinkish noise with low-pass sweep
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          output[i] = (b0 + b1 + b2) * 0.1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, this.ctx.currentTime);

        // LFO to simulate rolling ocean waves
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 0.15; // 7 second wave period
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 280;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        whiteNoise.connect(filter);
        filter.connect(masterGain);

        whiteNoise.start();
        lfo.start();
        this.nodes.push(whiteNoise, filter, lfo, lfoGain);
      } else {
        // Ambient chord drone (warm fifths / major 9th pads)
        const freqs = soundType === 'gentle-acoustic' 
          ? [146.83, 220.00, 293.66, 440.00] // D chord
          : [130.81, 196.00, 261.63, 392.00]; // Cmaj9 pad

        freqs.forEach((freq, idx) => {
          if (!this.ctx || !this.gainNode) return;
          const osc = this.ctx.createOscillator();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
          if (panner) {
            panner.pan.value = (idx - 1.5) * 0.4;
          }

          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800 + idx * 200, this.ctx.currentTime);

          const subGain = this.ctx.createGain();
          subGain.gain.value = 0.18 / (idx + 1);

          osc.connect(filter);
          filter.connect(subGain);
          if (panner) {
            subGain.connect(panner);
            panner.connect(this.gainNode);
          } else {
            subGain.connect(this.gainNode);
          }

          osc.start();
          this.nodes.push(osc, filter, subGain);
        });
      }
    } catch (e) {
      console.warn('Audio playback not permitted or unavailable:', e);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1);
        setTimeout(() => {
          this.nodes.forEach(n => {
            if ('stop' in n && typeof (n as OscillatorNode).stop === 'function') {
              try { (n as OscillatorNode).stop(); } catch { /* ignore */ }
            }
            try { n.disconnect(); } catch { /* ignore */ }
          });
          this.nodes = [];
        }, 1100);
      } catch {
        this.nodes = [];
      }
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}

export const ambientAudio = new AmbientAudioService();
