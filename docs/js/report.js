const fields = [
  ['Patient name', 'name'],
  ['Age', 'age'],
  ['Gender', 'gender'],
  ['Contact number', 'contact'],
  ['Scan type', 'scanType'],
];

export function showReport(details, prediction, imageUrl) {
  document.querySelector('#empty-state').hidden = true;
  document.querySelector('#report').hidden = false;
  document.querySelector('#report-date').textContent = new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date());
  document.querySelector('#prediction-label').textContent = prediction.label;
  document.querySelector('#prediction-confidence').textContent = `Model score: ${prediction.confidence.toFixed(1)}% (not a clinical probability)`;
  const preview = document.createElement('img');
  preview.src = imageUrl;
  preview.alt = 'Uploaded scan preview';
  document.querySelector('#report-image-container').replaceChildren(preview);

  const list = document.querySelector('#report-details');
  list.replaceChildren();
  for (const [label, key] of fields) {
    if (!details[key]) continue;
    const term = document.createElement('dt');
    const value = document.createElement('dd');
    term.textContent = label;
    value.textContent = details[key];
    list.append(term, value);
  }
}

export function clearReport() {
  document.querySelector('#report').hidden = true;
  document.querySelector('#empty-state').hidden = false;
  document.querySelector('#report-image-container').replaceChildren();
  document.querySelector('#report-details').replaceChildren();
}
