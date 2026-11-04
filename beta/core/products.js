// ECONOMY 2.0 · S3-R · Proveedor de producto (recetas).
// El motor pregunta aquí qué cocina CHEESE y cuánto vale, tarda y cuesta: currentKey(s), formula(key) y recipeKey(style).
// formula devuelve { value, timeMs, coin, combo } (combo.base = estilo, con el que el precio busca su estrato).
// Los multiplicadores de la economía (maestría, compradores, árbol, «más rico»…) siguen en model.price.
// Proveedor por defecto: 'fixed', la receta fija de S1–S2.5 (PARAMS.recipe, con el estilo del estrato al llegar,
// styleOnEntry PROV, o el estilo pagado del experimento styleGate de S2). Otro sistema de recetas (LAB) se registra con
// register(id, proveedor) y se elige con PARAMS.product = id.
var E2 = globalThis.E2 || (globalThis.E2 = {});

E2.products = (function () {
  const R = () => E2.REAL, P = () => E2.PARAMS;
  const providers = {};
  function register(id, provider) { providers[id] = provider; }
  const get = () => providers[P().product || 'fixed'];

  register('fixed', {
    recipeKey(style) { const r = P().recipe; return style + '+' + r.ingredient + '+' + r.treatment + '+' + r.maturation; },
    // REAL: fórmula de cheesery.js (base x ingrediente x tratamiento x maduración x sinergias).
    formula(key) {
      const [base, ingredient, treatment, maturation] = key.split('+');
      const B = R(), combo = { base, ingredient, treatment, maturation };
      let v = B.bases[base].value * B.ingredients[ingredient].mult * B.treatments[treatment].mult * B.maturations[maturation].mult;
      for (const syn of B.synergies) if (Object.keys(syn.when).every((p) => combo[p] === syn.when[p])) v *= syn.mult;
      return { value: Math.round(v), timeMs: B.cheesery.baseTimeMs + B.treatments[treatment].timeMs + B.maturations[maturation].timeMs, coin: B.ingredients[ingredient].coinCost, combo };
    },
    // S2 (experimento): con s.styleOwned, solo se cocinan los estilos ya pagados (hasta ese estrato).
    currentKey(s) {
      if (!P().styleOnEntry) return this.recipeKey('cheddar');
      const S = P().strata, i = S.indexOf(E2.model.stratumOf(s.depth));
      return this.recipeKey(S[s.styleOwned == null ? i : Math.min(i, s.styleOwned)].id);
    },
  });
  return { register, get, providers };
})();
