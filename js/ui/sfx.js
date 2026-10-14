// Efectos de sonido sintetizados (sin archivos de audio).
// Cada tipo de evento tiene su timbre; las producciones seguidas suben de nota
// por una escala pentatónica, para que una racha suene a racha.
(function () {
  const MUTE_KEY = 'cheese-miner-muted';
  let ctx = null;
  let master = null;
  let noiseBuf = null;
  let muted = false;
  try {
    muted = localStorage.getItem(MUTE_KEY) === '1';
  } catch (e) {}

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      // Un compresor evita que muchos sonidos a la vez saturen.
      const comp = ctx.createDynamicsCompressor();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(comp).connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function envelope(gain, t, dur, vol) {
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  function tone(freq, dur, opts) {
    if (muted) return;
    const ac = audio();
    if (!ac) return;
    const o = opts || {};
    const t = ac.currentTime + (o.delay || 0);
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(freq, t);
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
    envelope(gain, t, dur, o.vol || 0.06);
    osc.connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  // Ráfaga de ruido filtrado: golpes, chispas y derrumbes.
  function noise(dur, opts) {
    if (muted) return;
    const ac = audio();
    if (!ac) return;
    const o = opts || {};
    const t = ac.currentTime + (o.delay || 0);
    const src = ac.createBufferSource();
    const filter = ac.createBiquadFilter();
    const gain = ac.createGain();
    src.buffer = noiseBuf;
    filter.type = o.filter || 'lowpass';
    filter.frequency.value = o.freq || 1200;
    envelope(gain, t, dur, o.vol || 0.1);
    src.connect(filter).connect(gain).connect(master);
    src.start(t, Math.random() * 0.3, dur + 0.02);
  }

  const arp = (notes, step, opts) => notes.forEach((f, i) => tone(f, (opts && opts.len) || 0.13, Object.assign({}, opts, { delay: ((opts && opts.delay) || 0) + i * step })));

  // Do pentatónico: cualquier combinación de notas suena bien junta.
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
  let streak = 0;
  let lastChime = 0;
  function chime(octave) {
    const t = performance.now();
    streak = t - lastChime < 1600 ? Math.min(streak + 1, PENTA.length - 1) : 0;
    lastChime = t;
    const f = PENTA[streak] * octave;
    tone(f, 0.18, { type: 'triangle', vol: 0.1 });
    tone(f * 2, 0.1, { type: 'sine', vol: 0.035, delay: 0.03 });
  }

  CM.sfx = {
    isMuted: () => muted,
    toggleMute() {
      muted = !muted;
      try {
        localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
      } catch (e) {}
      return muted;
    },
    click: () => tone(700, 0.03, { type: 'square', vol: 0.02 }),
    // Latido suave de la fábrica cuando trabajan los ratones: notas graves y redondas, sin subir
    // de tono por racha, para que se pueda escuchar durante horas.
    soft(kind) {
      const f = { raw: 196, base: 247, lot: 294, coin: 784 }[kind] || 220;
      if (kind === 'coin') {
        tone(f, 0.12, { type: 'triangle', vol: 0.03 });
        tone(f * 1.25, 0.16, { type: 'triangle', vol: 0.025, delay: 0.09 });
        return;
      }
      tone(f, 0.16, { type: 'triangle', vol: 0.035 });
      tone(f * 1.5, 0.12, { type: 'sine', vol: 0.015, delay: 0.04 });
    },
    // El golpe sube de tono con el combo.
    hit(combo) {
      const c = Math.min(combo || 0, 20);
      noise(0.05, { freq: 900 + c * 70, vol: 0.11 });
      tone(150 + c * 11, 0.08, { type: 'triangle', vol: 0.12, slideTo: 70 });
    },
    crit() {
      noise(0.14, { filter: 'highpass', freq: 2600, vol: 0.07 });
      arp([784, 1175, 1568], 0.04, { vol: 0.06 });
    },
    reveal() {
      noise(0.5, { filter: 'highpass', freq: 3500, vol: 0.05 });
      arp([392, 523, 659, 784, 1047, 1319], 0.07, { type: 'triangle', vol: 0.09, len: 0.2 });
    },
    start: () => tone(110, 0.2, { type: 'sawtooth', vol: 0.035, slideTo: 240 }),
    boost: () => tone(340 + Math.random() * 90, 0.04, { type: 'square', vol: 0.028 }),
    raw: () => chime(0.5),
    base: () => chime(0.75),
    lot: () => chime(1),
    coin() {
      noise(0.03, { filter: 'highpass', freq: 5000, vol: 0.04 });
      tone(1319, 0.08, { type: 'square', vol: 0.045 });
      tone(1760, 0.2, { type: 'square', vol: 0.045, delay: 0.07 });
    },
    jackpot() {
      noise(0.04, { filter: 'highpass', freq: 5000, vol: 0.05 });
      arp([1047, 1319, 1568, 2093, 1568, 2093], 0.06, { type: 'square', vol: 0.05 });
    },
    bell() {
      tone(1047, 0.35, { type: 'sine', vol: 0.07 });
      tone(784, 0.45, { type: 'sine', vol: 0.07, delay: 0.18 });
    },
    walkout: () => tone(300, 0.28, { type: 'triangle', vol: 0.06, slideTo: 150 }),
    upgrade: () => arp([523, 659, 784, 1047], 0.06, { type: 'square', vol: 0.045 }),
    build() {
      noise(0.16, { freq: 320, vol: 0.16 });
      arp([392, 523, 784], 0.07, { type: 'triangle', vol: 0.09, delay: 0.1, len: 0.2 });
    },
    goal() {
      arp([523, 659, 784, 1047, 1319], 0.08, { type: 'triangle', vol: 0.09, len: 0.2 });
      tone(1568, 0.45, { type: 'triangle', vol: 0.08, delay: 0.42 });
    },
    denied: () => tone(150, 0.12, { type: 'sawtooth', vol: 0.04, slideTo: 95 }),
    // Fanfarria de legendario: sube, se queda arriba y remata.
    legend() {
      noise(0.3, { freq: 900, vol: 0.12 });
      arp([392, 523, 659, 784, 1047, 1319, 1568], 0.09, { type: 'square', vol: 0.07, len: 0.22 });
      arp([1047, 1319, 1568, 2093], 0.12, { type: 'triangle', vol: 0.09, delay: 0.7, len: 0.5 });
      tone(2093, 0.9, { type: 'triangle', vol: 0.08, delay: 1.2 });
    },
    // Te ha tocado una manía.
    quirk() {
      tone(220, 0.25, { type: 'sawtooth', vol: 0.06, slideTo: 110 });
      tone(104, 0.4, { type: 'square', vol: 0.05, delay: 0.22, slideTo: 70 });
    },
    newRock() {
      noise(0.3, { freq: 220, vol: 0.2 });
      tone(80, 0.3, { type: 'triangle', vol: 0.14, slideTo: 45 });
    },
  };
})();
