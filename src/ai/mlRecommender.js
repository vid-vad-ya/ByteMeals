// src/ai/mlRecommender.js
// TF-IDF + cosine similarity recommender (browser-only, free).
// Caches TF-IDF data in localStorage for performance.

const TFIDF_KEY = "byteMeals_tfidf";

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function buildDocs(menu) {
  // Build textual description for each dish (Option B style)
  return menu.map((d) =>
    `${d.name}. This is a ${d.veg ? "Veg" : "Non-Veg"} ${d.category} dish priced at ₹${d.price}.`
  );
}

function buildVocab(docs) {
  const vocab = new Map();
  let idx = 0;
  for (const doc of docs) {
    const toks = tokenize(doc);
    for (const t of toks) {
      if (!vocab.has(t)) {
        vocab.set(t, idx++);
      }
    }
  }
  return vocab; // Map token -> index
}

function computeTF(docTokens, vocabSize) {
  const tf = new Array(vocabSize).fill(0);
  for (const t of docTokens) tf[t] += 1;
  const len = docTokens.length || 1;
  for (let i = 0; i < tf.length; i++) tf[i] = tf[i] / len;
  return tf;
}

function computeIDF(allTokens, vocab) {
  const N = allTokens.length;
  const idf = new Array(vocab.size).fill(0);
  for (let i = 0; i < allTokens.length; i++) {
    const seen = new Set(allTokens[i]);
    for (const token of seen) {
      const idx = vocab.get(token);
      if (idx !== undefined) idf[idx] += 1;
    }
  }
  // smooth idf
  for (let i = 0; i < idf.length; i++) {
    idf[i] = Math.log(1 + N / (1 + idf[i])); // smooth variant
  }
  return idf;
}

function multiplyTFIDF(tf, idf) {
  const vec = new Array(tf.length);
  for (let i = 0; i < tf.length; i++) vec[i] = tf[i] * idf[i];
  return vec;
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  const L = Math.min(a.length, b.length);
  for (let i = 0; i < L; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function saveTFIDF(cache) {
  localStorage.setItem(TFIDF_KEY, JSON.stringify(cache));
}

export function loadTFIDF() {
  try {
    const raw = localStorage.getItem(TFIDF_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Build TF-IDF model for menu items.
 * Returns: { vocab: [tokens], vectors: [{id, vector}], createdAt }
 */
export function buildTFIDFFromMenu(menu) {
  const docs = buildDocs(menu);
  const tokenLists = docs.map((d) => tokenize(d));
  const vocabMap = buildVocab(docs);
  const vocabArr = Array.from(vocabMap.keys()); // index -> token by iteration order below we will map index from map
  // But we need consistent index mapping: token -> idx
  const vocabSize = vocabMap.size;

  // Build arrays of token indices for each doc
  const docsIndices = tokenLists.map((tokens) => tokens.map((t) => vocabMap.get(t)));

  const tfs = docsIndices.map((inds) => {
    const tokStrs = inds.map((i) => i); // not used; compute TF on indices
    // compute raw token array for computeTF using tokens not indices: we can use tokenLists
    return computeTF(tokenLists[docsIndices.indexOf(inds)].map((t) => t), vocabSize);
  });

  // Simpler: compute TF using tokenLists directly
  const tfsCorrect = tokenLists.map((toks) => computeTF(toks, vocabSize));
  const idf = computeIDF(tokenLists, vocabMap);

  const vectors = tfsCorrect.map((tf, i) => ({
    id: menu[i].id,
    vector: multiplyTFIDF(tf, idf),
  }));

  const cache = {
    vocab: Array.from(vocabMap.entries()).sort((a,b)=>a[1]-b[1]).map(e=>e[0]), // ensure order by index
    vectors,
    createdAt: Date.now(),
  };

  saveTFIDF(cache);
  return cache;
}

/**
 * Ensure TF-IDF vectors exist & match menu length.
 * Rebuilds if missing or if menu length changed.
 */
export function ensureTFIDF(menu) {
  const cached = loadTFIDF();
  if (!cached || !Array.isArray(cached.vectors) || cached.vectors.length !== menu.length) {
    return buildTFIDFFromMenu(menu);
  }
  return cached;
}

/**
 * Get recommendations:
 * - If userHistory empty => return top N by default (here first N).
 * - Otherwise take last ordered dish (first item in last order) and compute cosine similarity to other dishes.
 */
export function getRecommendations(menu, userHistory, topN = 5) {
  const menuList = Array.isArray(menu) ? menu : [];
  if (menuList.length === 0) return [];

  const cache = ensureTFIDF(menuList);

  if (!userHistory || userHistory.length === 0) {
    // fallback: return first topN items (or we could sort by price/popularity)
    return menuList.slice(0, topN);
  }

  // get last order and first item id
  const lastOrder = userHistory[userHistory.length - 1];
  if (!lastOrder || !Array.isArray(lastOrder.items) || lastOrder.items.length === 0) {
    return menuList.slice(0, topN);
  }

  const lastItemId = lastOrder.items[0].id;
  const selVecObj = cache.vectors.find((v) => v.id === lastItemId);
  if (!selVecObj) {
    return menuList.slice(0, topN);
  }

  // compute similarity scores
  const scores = cache.vectors.map((v) => ({
    id: v.id,
    score: cosine(selVecObj.vector, v.vector),
  }));

  // sort descending and filter out the exact same dish
  scores.sort((a, b) => b.score - a.score);

  const recommendedIds = scores.filter(s => s.id !== lastItemId).slice(0, topN).map(s => s.id);

  // return dish objects in same shape as menu
  const recommended = recommendedIds.map((id) => menuList.find((m) => m.id === id)).filter(Boolean);

  return recommended;
}
