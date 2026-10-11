// Efectos de sonido sintetizados (sin archivos de audio).
(function () {
  const MUTE_KEY = 'cheese-miner-muted';
  let ctx = null;
  let muted = false;
  try {
    muted = localStorage.getItem(MUTE_KEY) === '1';
  } catch (e) {}

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
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
    gain.gain.setValueAtTime(o.vol || 0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  const arp = (notes, step, opts) => notes.forEach((f, i) => tone(f, 0.12, Object.assign({ delay: i * step }, opts)));

  CM.sfx = {
    isMuted: () => muted,
    toggleMute() {
      muted = !muted;
      try {
        localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
      } catch (e) {}
      return muted;
    },
    // El tono sube con el combo: cada golpe suena un poco más agudo.
    hit: (combo) => tone(150 + Math.min(combo, 20) * 14, 0.07, { type: 'triangle', vol: 0.12, slideTo: 70 }),
    crit: () => arp([520, 780], 0.05, { vol: 0.07 }),
    reveal: () => arp([392, 523, 659, 784, 1047], 0.08, { vol: 0.07 }),
    start: () => tone(110, 0.18, { type: 'sawtooth', vol: 0.04, slideTo: 220 }),
    boost: () => tone(300, 0.04, { type: 'square', vol: 0.03 }),
    raw: () => arp([660, 880], 0.06, { vol: 0.06 }),
    base: () => arp([523, 659, 988], 0.07, { type: 'triangle', vol: 0.12 }),
    coin: () => arp([988, 1319, 1568], 0.06, { vol: 0.06 }),
    upgrade: () => arp([440, 554, 659, 880], 0.06, { vol: 0.06 }),
    denied: () => tone(140, 0.12, { type: 'sawtooth', vol: 0.04, slideTo: 90 }),
    newRock: () => tone(90, 0.25, { type: 'triangle', vol: 0.14, slideTo: 50 }),
  };
})();
