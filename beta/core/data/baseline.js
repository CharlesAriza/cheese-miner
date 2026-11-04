// GENERADO por core/tools/make-baseline.js: no editar a mano. Configuración fija de D2: S2.5, Blue terminado en el nivel 190,
// precios x10 por estrato y estudio de estilo, sin frontera. Es una baseline técnica provisional, no un balance aprobado.
var E2 = globalThis.E2 || (globalThis.E2 = {});
E2.BASELINE = {
 "stepMs": 100,
 "offlineStepMs": 1000,
 "crew": {
  "ritmo": 0.5,
  "rend": 0.25,
  "traitMin": -0.5,
  "traitMax": 2,
  "teamCap": 0.3,
  "combine": "hybridW",
  "yieldW": 0.5
 },
 "posts": {
  "mine": [
   [
    [
     "picker",
     "pr"
    ],
    [
     "collector",
     "rend"
    ]
   ],
   [
    [
     "picker",
     "pr"
    ],
    [
     "climber",
     "ritmo"
    ],
    [
     "collector",
     "rend"
    ]
   ],
   [
    [
     "picker",
     "pr"
    ],
    [
     "climber",
     "ritmo"
    ],
    [
     "collector",
     "rend"
    ],
    [
     "hauler",
     "rend"
    ]
   ]
  ],
  "drill": [
   [
    [
     "operator",
     "pr"
    ],
    [
     "filler",
     "rend"
    ]
   ],
   [
    [
     "operator",
     "pr"
    ],
    [
     "greaser",
     "ritmo"
    ],
    [
     "runner",
     "ritmo"
    ],
    [
     "filler",
     "rend"
    ]
   ],
   [
    [
     "operator",
     "pr"
    ],
    [
     "greaser",
     "ritmo"
    ],
    [
     "runner",
     "ritmo"
    ],
    [
     "filler",
     "rend"
    ],
    [
     "pumphand",
     "rend"
    ]
   ]
  ],
  "refine": [
   [
    [
     "stoker",
     "pr"
    ],
    [
     "moulder",
     "rend"
    ]
   ],
   [
    [
     "stoker",
     "pr"
    ],
    [
     "valve",
     "ritmo"
    ],
    [
     "runner",
     "ritmo"
    ],
    [
     "moulder",
     "rend"
    ]
   ],
   [
    [
     "stoker",
     "pr"
    ],
    [
     "valve",
     "ritmo"
    ],
    [
     "runner",
     "ritmo"
    ],
    [
     "moulder",
     "rend"
    ],
    [
     "gauge",
     "rend"
    ]
   ]
  ],
  "cheese": [
   [
    [
     "mixer",
     "pr"
    ],
    [
     "carrier",
     "ritmo"
    ]
   ],
   [
    [
     "mixer",
     "pr"
    ],
    [
     "presser",
     "ritmo"
    ],
    [
     "sealer",
     "rend"
    ],
    [
     "turner",
     "rend"
    ]
   ],
   [
    [
     "mixer",
     "pr"
    ],
    [
     "presser",
     "ritmo"
    ],
    [
     "stacker",
     "ritmo"
    ],
    [
     "sealer",
     "rend"
    ],
    [
     "turner",
     "rend"
    ],
    [
     "taster",
     "rend"
    ]
   ]
  ],
  "sell": [
   [
    [
     "keeper",
     "pr"
    ],
    [
     "porter",
     "rend"
    ]
   ],
   [
    [
     "keeper",
     "pr"
    ],
    [
     "liftman",
     "ritmo"
    ],
    [
     "porter",
     "rend"
    ]
   ],
   [
    [
     "keeper",
     "pr"
    ],
    [
     "liftman",
     "ritmo"
    ],
    [
     "winch",
     "ritmo"
    ],
    [
     "porter",
     "rend"
    ]
   ]
  ]
 },
 "mine": {
  "help": true,
  "helpScale": 0,
  "surveyAhead": 0,
  "blast": {
   "mode": "none",
   "reveal": 0.25,
   "every": 20
  }
 },
 "depthTraits": {
  "mode": "tier",
  "perTier": 10
 },
 "invest": {
  "mine": 1,
  "drill": 1,
  "refine": 1,
  "cheese": 1,
  "sell": 1
 },
 "refineCarry": true,
 "masteryScale": 10,
 "strata": [
  {
   "id": "cheddar",
   "from": 0,
   "to": 20,
   "vein": 70,
   "perLevel": 0.03,
   "hard": 1
  },
  {
   "id": "gouda",
   "from": 20,
   "to": 45,
   "vein": 286,
   "perLevel": 0.03,
   "hard": 3
  },
  {
   "id": "brie",
   "from": 45,
   "to": 75,
   "vein": 627,
   "perLevel": 0.03,
   "hard": 3
  },
  {
   "id": "emmental",
   "from": 75,
   "to": 110,
   "vein": 1073,
   "perLevel": 0.03,
   "hard": 3
  },
  {
   "id": "parmesan",
   "from": 110,
   "to": 150,
   "vein": 1703,
   "perLevel": 0.03,
   "hard": 3
  },
  {
   "id": "blue",
   "from": 150,
   "to": 190,
   "vein": 3700,
   "perLevel": 0.03,
   "hard": 3
  }
 ],
 "searchPerRaw": 0.5,
 "sell": {
  "cycleMs": 6000,
  "perCycle": 1,
  "yieldWeight": 0.5,
  "perCycleByStage": null
 },
 "recipe": {
  "ingredient": "herbs",
  "treatment": "smoked",
  "maturation": "aged"
 },
 "styleOnEntry": false,
 "richPerLevel": 0.01,
 "stationLevel": 1,
 "recipesKnown": 1,
 "mouseLevelsFrozen": true,
 "s2": {
  "levelBonus": 0.02,
  "mineXpFactor": 2.5,
  "managers": true,
  "rankCostScale": 1,
  "fundGrowth": 1.2,
  "costScale": "none",
  "costScaleAll": false,
  "fundamentals": {
   "mine": [
    {
     "id": "pick",
     "key": "power",
     "per": 0.1,
     "cost": 12,
     "level": 1
    },
    {
     "id": "paws",
     "key": "speed",
     "per": 0.1,
     "cost": 300,
     "level": 10
    }
   ],
   "drill": [
    {
     "id": "bit",
     "key": "yield",
     "per": 0.1,
     "cost": 50,
     "level": 1
    },
    {
     "id": "motor",
     "key": "speed",
     "per": 0.08,
     "cost": 70,
     "level": 4
    }
   ],
   "refine": [
    {
     "id": "vat",
     "key": "yield",
     "per": 0.1,
     "cost": 50,
     "level": 1
    },
    {
     "id": "furnace",
     "key": "speed",
     "per": 0.08,
     "cost": 70,
     "level": 4
    }
   ],
   "cheese": [
    {
     "id": "moulds",
     "key": "yield",
     "per": 0.1,
     "cost": 50,
     "level": 1
    },
    {
     "id": "curds",
     "key": "speed",
     "per": 0.08,
     "cost": 30,
     "level": 1
    },
    {
     "id": "cellar",
     "key": "value",
     "per": 0.08,
     "cost": 150,
     "level": 5
    }
   ],
   "sell": [
    {
     "id": "counter",
     "key": "count",
     "per": 0.1,
     "cost": 50,
     "level": 1
    },
    {
     "id": "quick",
     "key": "speed",
     "per": 0.1,
     "cost": 100,
     "level": 5
    },
    {
     "id": "prices",
     "key": "price",
     "per": 0.06,
     "cost": 40,
     "level": 1
    }
   ]
  },
  "phases": {
   "2": {
    "level": 15,
    "cost": 2000,
    "depth": 0
   },
   "3": {
    "level": 35,
    "cost": 50000,
    "depth": 45
   }
  },
  "pathCost": [
   5000,
   50000,
   250000
  ],
  "paths": {
   "mine": [
    {
     "id": "search",
     "gates": [
      {
       "level": 20
      },
      {
       "level": 40
      },
      {
       "level": 40,
       "depth": 20
      }
     ],
     "opts": {
      "prospector": [
       {
        "id": "prospector",
        "eff": {
         "tapMult": 2,
         "crewCrit": 5
        }
       },
       {
        "id": "blasting",
        "cap": true,
        "eff": {
         "blast": {
          "mode": "v2",
          "need": 3,
          "cooldownMs": 20000,
          "size": "crew",
          "seconds": 60
         }
        },
        "blueprint": "blasting"
       }
      ],
      "survey": [
       {
        "id": "surveyCrew",
        "eff": {
         "speedMult": 1.3
        }
       },
       {
        "id": "shiftRota",
        "eff": {
         "wRitmo": 0.75
        }
       },
       {
        "id": "surveyAhead",
        "cap": true,
        "eff": {
         "survey": 0.5
        },
        "blueprint": "surveyAhead"
       }
      ]
     }
    },
    {
     "id": "seams",
     "gates": [
      {
       "level": 40
      },
      {
       "level": 55
      }
     ],
     "opts": {
      "wide": [
       {
        "id": "wideSeams",
        "eff": {
         "veinMult": 1.4,
         "searchMult": 1,
         "richMult": 1.5
        }
       },
       {
        "id": "richSeams",
        "eff": {
         "matAdd": 1
        }
       }
      ],
      "quick": [
       {
        "id": "quickSeams",
        "eff": {
         "veinMult": 0.85,
         "searchMult": 0.7
        }
       }
      ]
     }
    }
   ],
   "refine": [
    {
     "id": "use",
     "gates": [
      {
       "level": 20
      },
      {
       "level": 40
      }
     ],
     "opts": {
      "pure": [
       {
        "id": "pureBase",
        "eff": {
         "base": 1.2,
         "speedMult": 0.8
        }
       },
       {
        "id": "gaugeDiscipline",
        "eff": {
         "wRend": 0.35
        }
       }
      ],
      "fast": [
       {
        "id": "fastStill",
        "eff": {
         "speedMult": 1.3,
         "cross": {
          "st": "cheese",
          "speedMult": 1.2
         }
        }
       }
      ]
     }
    }
   ],
   "cheese": [
    {
     "id": "time",
     "gates": [
      {
       "level": 40
      },
      {
       "level": 55
      }
     ],
     "opts": {
      "affinage": [
       {
        "id": "affinage",
        "eff": {
         "value": 1.4,
         "time": 1.5
        }
       }
      ],
      "fresh": [
       {
        "id": "freshMarket",
        "eff": {
         "time": 0.6,
         "value": 0.95
        }
       }
      ]
     }
    }
   ],
   "sell": [
    {
     "id": "market",
     "gates": [
      {
       "level": 20
      },
      {
       "level": 40
      }
     ],
     "opts": {
      "boutique": [
       {
        "id": "boutique",
        "eff": {
         "count": 0.7,
         "fineBonus": 1.4
        }
       },
       {
        "id": "collectorsList",
        "eff": {
         "buyerShift": 10
        }
       }
      ],
      "wholesale": [
       {
        "id": "wholesale",
        "eff": {
         "count": 1.8,
         "price": 0.9
        }
       },
       {
        "id": "bulkContracts",
        "eff": {
         "wholesale": 0.75
        }
       }
      ]
     }
    }
   ],
   "drill": [
    {
     "id": "extract",
     "gates": [
      {
       "level": 20
      },
      {
       "level": 40
      }
     ],
     "opts": {
      "sampler": [
       {
        "id": "coreSampler",
        "eff": {
         "matMult": 2
        }
       },
       {
        "id": "strataLogs",
        "eff": {
         "bpDiscount": 0.7
        }
       }
      ],
      "throughput": [
       {
        "id": "throughput",
        "eff": {
         "yield": 1.25
        }
       },
       {
        "id": "heavyBits",
        "eff": {
         "wRend": 0.35
        }
       }
      ]
     }
    }
   ]
  },
  "refitMs": 900000,
  "refitSpeed": 0.5,
  "milestones": {
   "wheel": {
    "level": 30,
    "cost": 100000
   },
   "master": {
    "level": 45,
    "cost": 500000
   }
  },
  "boosts": {
   "total": 6,
   "order": [
    "auto",
    "d20",
    "d45",
    "g1",
    "d75",
    "g2",
    "d110",
    "d150"
   ],
   "goals": [
    200000,
    2000000
   ]
  },
  "fund": {
   "model": "D",
   "phaseCaps": [
    7,
    14,
    20
   ],
   "perStratum": 3,
   "baseCap": 2,
   "power": 0.75,
   "growthC": 1.25,
   "costBy": "index"
  },
  "refineBoost": {
   "mode": "dim",
   "second": 1.2
  }
 },
 "sellFineOverflow": false,
 "s3": {
  "frontier": false,
  "bedrock": true,
  "costIndex": 10,
  "costAll": true,
  "materials": {
   "perVein": 1
  },
  "lab": {
   "phases": {
    "2": {
     "recipes": 10,
     "cost": 5000
    },
    "3": {
     "recipes": 30,
     "depth": 45,
     "cost": 200000
    },
    "4": {
     "recipes": 60,
     "depth": 75,
     "cost": 2000000
    }
   },
   "nodeCost": {
    "queue": 5000,
    "desk": 500000,
    "library": 5000000
   },
   "queue": 3,
   "blueprints": {
    "blasting": {
     "materials": {
      "gouda": 10
     },
     "coin": 0,
     "timeMult": 4
    },
    "surveyAhead": {
     "materials": {
      "gouda": 10
     },
     "coin": 0,
     "timeMult": 4
    }
   },
   "study": {
    "materials": 5,
    "timeMult": 3
   },
   "strainBases": "all"
  }
 },
 "product": "lab"
};
