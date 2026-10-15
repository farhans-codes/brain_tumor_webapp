import { analyzeImage, loadScreeningModel } from './model.js';
import { clearReport, showReport } from './report.js';

const form = document.querySelector('#scan-form');
const button = document.querySelector('#analyze-button');
const status = document.querySelector('#model-status');
const error = document.querySelector('#form-error');
let imageUrl;

loadScreeningModel().then(() => {
  status.textContent = 'Model ready. Images are processed on this device.';
}).catch(() => {
  status.textContent = 'Model could not load. Check your connection and refresh the page.';
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  error.hidden = true;
  const file = form.elements.image.files[0];
  if (!form.reportValidity()) return;
  if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
    error.textContent = 'Choose a PNG, JPEG, or WebP image smaller than 10 MB.';
    error.hidden = false;
    return;
  }

  button.disabled = true;
  button.textContent = 'Analyzing…';
  let nextUrl;
  try {
    nextUrl = URL.createObjectURL(file);
    const image = new Image();
    image.src = nextUrl;
    await image.decode();
    const prediction = await analyzeImage(image);
    const details = Object.fromEntries(new FormData(form));
    showReport(details, prediction, nextUrl);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    imageUrl = nextUrl;
    nextUrl = undefined;
    document.querySelector('#result-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (cause) {
    error.textContent = cause?.message === 'The model returned an invalid result.'
      ? cause.message
      : 'Could not analyze this image. Try another file or refresh the page.';
    error.hidden = false;
  } finally {
    if (nextUrl) URL.revokeObjectURL(nextUrl);
    button.disabled = false;
    button.textContent = 'Analyze scan';
  }
});

document.querySelector('#print-button').addEventListener('click', () => window.print());
document.querySelector('#clear-button').addEventListener('click', () => {
  form.reset();
  clearReport();
  if (imageUrl) URL.revokeObjectURL(imageUrl);
  imageUrl = undefined;
  error.hidden = true;
  document.querySelector('#patient-name').focus();
});
