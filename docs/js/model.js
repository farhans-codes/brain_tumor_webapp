const MODEL_URL = new URL('../model/model.json', import.meta.url).href;
const CLASS_LABELS = ['No tumor detected', 'Tumor detected'];
let modelPromise;

export function loadScreeningModel() {
  modelPromise ??= window.tf.loadLayersModel(MODEL_URL);
  return modelPromise;
}

export async function analyzeImage(imageElement) {
  const model = await loadScreeningModel();
  const input = window.tf.tidy(() => window.tf.browser.fromPixels(imageElement)
    .resizeBilinear([256, 256])
    .toFloat()
    .div(255)
    .expandDims(0));

  try {
    const output = model.predict(input);
    try {
      const scores = Array.from(await output.data());
      if (scores.length !== CLASS_LABELS.length || scores.some(score => !Number.isFinite(score))) {
        throw new Error('The model returned an invalid result.');
      }
      const index = scores[1] > scores[0] ? 1 : 0;
      return { label: CLASS_LABELS[index], confidence: scores[index] * 100 };
    } finally {
      output.dispose();
    }
  } finally {
    input.dispose();
  }
}
