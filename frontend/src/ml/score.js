let modelPromise;

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

export async function score(_text) {
  await loadModel();
  // Placeholder for UI integration. Replace with parity-tested scoring before release.
  return { label: "genuine", score: 0.1, scam_type: null, highlights: [] };
}
