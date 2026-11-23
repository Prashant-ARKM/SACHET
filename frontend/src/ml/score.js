let modelPromise;

// Python str.split also treats ASCII information separators as whitespace.
const WORD_SEPARATOR = /[\p{White_Space}\u001c-\u001f]+/u;

export function loadModel() {
  if (!modelPromise) {
    modelPromise = fetch("/model.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load /model.json (HTTP ${response.status})`);
        }
        return response.json();
      })
      .catch((error) => {
        modelPromise = undefined;
        throw error;
      });
  }
  return modelPromise;
}

function splitWords(text) {
  return text.split(WORD_SEPARATOR).filter(Boolean);
}

function vectorize(text, model) {
  const [minN, maxN] = model.ngram_range;
  const words = splitWords(model.lowercase ? text.toLowerCase() : text);
  const counts = new Map();

  for (const word of words) {
    const chars = Array.from(` ${word} `);
    for (let size = minN; size <= maxN; size++) {
      // sklearn includes a short padded word once when the window reaches its length.
      const lastOffset = Math.max(0, chars.length - size);
      for (let offset = 0; offset <= lastOffset; offset++) {
        const gram = chars.slice(offset, offset + size).join("");
        if (Object.hasOwn(model.vocab, gram)) {
          counts.set(gram, (counts.get(gram) ?? 0) + 1);
        }
      }
      if (lastOffset === 0) break;
    }
  }

  const features = Array.from(counts, ([gram, count]) => {
    const index = model.vocab[gram];
    return { gram, index, value: count * model.idf[index] };
  });
  const norm = Math.sqrt(sum(features, ({ value }) => value * value));
  if (norm > 0) {
    for (const feature of features) feature.value /= norm;
  }
  return features;
}

function sum(items, term) {
  // Compensated summation follows Python 3.12's float sum.
  let total = 0;
  let correction = 0;
  for (const item of items) {
    const value = term(item);
    const next = total + value;
    correction += Math.abs(total) >= Math.abs(value)
      ? (total - next) + value
      : (value - next) + total;
    total = next;
  }
  return total + correction;
}

function dot(features, coefficients, intercept) {
  return sum(features, ({ index, value }) => value * coefficients[index]) + intercept;
}

function sigmoid(logit) {
  if (logit >= 0) return 1 / (1 + Math.exp(-logit));
  const exp = Math.exp(logit);
  return exp / (1 + exp);
}

function classifyType(features, model) {
  if (!model) return "other";
  let bestClass = null;
  let bestLogit = -Infinity;
  for (const [index, name] of model.classes.entries()) {
    const logit = dot(features, model.coef[index], model.intercept[index]);
    if (logit > bestLogit) {
      bestClass = name;
      bestLogit = logit;
    }
  }
  return bestClass;
}

function compareCodePoints(left, right) {
  const a = Array.from(left);
  const b = Array.from(right);
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const difference = a[i].codePointAt(0) - b[i].codePointAt(0);
    if (difference !== 0) return difference;
  }
  return a.length - b.length;
}

function highlights(text, features, coefficients) {
  const contributions = features
    .map(({ gram, index, value }) => ({ gram, weight: value * coefficients[index] }))
    .filter(({ weight }) => weight > 0);
  contributions.sort((a, b) =>
    b.weight - a.weight || compareCodePoints(a.gram, b.gram)
  );

  const words = splitWords(text);
  const padded = words.map((word) => ` ${word.toLowerCase()} `);
  const used = new Set();
  const picked = [];
  for (const { gram } of contributions.slice(0, 5)) {
    const index = padded.findIndex((word) => word.includes(gram) && !used.has(word));
    if (index >= 0) {
      picked.push(index);
      used.add(padded[index]);
    }
  }

  return picked.sort((a, b) => a - b).map((index) => words[index]);
}

export async function score(text) {
  const model = await loadModel();
  const message = text || "";
  const features = vectorize(message, model);
  const probability = sigmoid(dot(features, model.scam.coef, model.scam.intercept));
  const isScam = probability >= (model.threshold ?? 0.5);

  return {
    label: isScam ? "scam" : "genuine",
    score: probability,
    threshold: model.threshold ?? 0.5,
    scam_type: isScam ? classifyType(features, model.type) : null,
    highlights: highlights(message, features, model.scam.coef),
  };
}
