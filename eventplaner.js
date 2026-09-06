const form = document.querySelector('#event-funnel');
const steps = [...document.querySelectorAll('.funnel-step')];
const progressLabel = document.querySelector('#progress-label');
const progressBar = document.querySelector('#progress-bar');
const backButton = document.querySelector('#back-step');
const nextButton = document.querySelector('#next-step');
const submitButton = document.querySelector('#submit-funnel');
const status = document.querySelector('#form-status');
let currentStep = 1;
let catalogSelection=[];
try { const saved=JSON.parse(sessionStorage.getItem('grossmann-event-products')||'[]'); if(Array.isArray(saved))catalogSelection=saved.filter(p=>p&&typeof p.name==='string'&&typeof p.package==='string'); } catch {}
if(catalogSelection.length){const summary=document.createElement('div');summary.className='cooling-tip';summary.textContent='Ihre Sortimentsauswahl: '+catalogSelection.map(p=>p.name+' ('+p.package+')').join(', ');document.querySelector('.planner-summary').append(summary);}
form.noValidate=true;

const selectedValue = (name) => form.querySelector(`[name="${name}"]:checked`)?.value || '';
const selectedValues = (name) => [...form.querySelectorAll(`[name="${name}"]:checked`)].map((input) => input.value);

function calculate() {
  const guests = Math.max(10, Number(form.elements.guests.value) || 100);
  const duration = Number(selectedValue('duration')) || 4;
  const season = selectedValue('season') || 'Sommer';
  const profile = selectedValue('profile') || 'Businesspublikum';
  const reserve = 1 + (Number(form.elements.reserve.value) || 0) / 100;
  const profileFactor = profile === 'Partygesellschaft' ? 1.12 : profile === 'Familien' ? .93 : 1;
  const seasonFactor = season === 'Sommer' ? 1.12 : .92;
  const hoursFactor = .82 + duration * .23;
  const liters = Math.round(guests * hoursFactor * profileFactor * seasonFactor * reserve);
  const crates = Math.ceil(liters / 9);

  document.querySelector('#sum-event').textContent = selectedValue('eventType') || 'Firmenfeier';
  document.querySelector('#sum-guests').textContent = String(guests);
  document.querySelector('#sum-duration').textContent = `${duration} Stunden`;
  document.querySelector('#sum-season').textContent = season;
  document.querySelector('#sum-liters').textContent = String(liters);
  document.querySelector('#sum-crates').textContent = String(crates);
  document.querySelector('#cooling-tip').textContent = liters >= 140
    ? '❄ Für diese Menge empfehlen wir mobile Kühlung oder einen Kühlanhänger.'
    : '❄ Mietkühlschränke halten die geplante Menge zuverlässig kalt.';
  return { guests, duration, season, profile, reserve: Math.round((reserve - 1) * 100), liters, crates };
}

function showStep(number) {
  currentStep = Math.min(6, Math.max(1, number));
  steps.forEach((step) => step.classList.toggle('active', Number(step.dataset.step) === currentStep));
  progressLabel.textContent = `Schritt ${currentStep} von 6`;
  progressBar.style.width = `${(currentStep / 6) * 100}%`;
  backButton.hidden = currentStep === 1;
  nextButton.hidden = currentStep === 6;
  submitButton.hidden = currentStep !== 6;
  status.textContent = '';
  document.querySelector('.funnel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function stepIsValid() {
  const panel = steps[currentStep - 1];
  const fields = [...panel.querySelectorAll('input[required], select[required], textarea[required]')];
  return fields.every((field) => field.reportValidity());
}

form.addEventListener('input', calculate);
form.addEventListener('change', calculate);

document.querySelectorAll('[data-counter]').forEach((button) => button.addEventListener('click', () => {
  const input = form.elements.guests;
  const delta = button.dataset.counter === 'plus' ? 10 : -10;
  input.value = Math.min(5000, Math.max(10, Number(input.value || 100) + delta));
  calculate();
}));

nextButton.addEventListener('click', () => {
  if (stepIsValid()) showStep(currentStep + 1);
});

backButton.addEventListener('click', () => showStep(currentStep - 1));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!stepIsValid()) return;
  const estimate = calculate();
  const values = new FormData(form);
  const date = values.get('eventDate') ? new Date(`${values.get('eventDate')}T12:00:00`).toLocaleDateString('de-DE') : 'noch offen';
  const body = [
    'Guten Tag,', '', 'ich möchte ein Angebot für folgende Veranstaltung anfragen:', '',
    `Veranstaltung: ${values.get('eventType')}`,
    `Datum: ${date}`,
    `Ort: ${values.get('location')}`,
    `Gäste: ${estimate.guests}`,
    `Gästeprofil: ${estimate.profile}`,
    `Dauer: ${estimate.duration} Stunden`,
    `Jahreszeit: ${estimate.season}`,
    `Getränke: ${selectedValues('drinks').join(', ') || 'Bitte beraten'}`,
    `Sortimentsauswahl: ${catalogSelection.map(p=>p.name+' · '+p.package).join('; ') || 'Persönliche Empfehlung gewünscht'}`,
    `Equipment: ${selectedValues('equipment').join(', ') || 'Kein Equipment ausgewählt'}`,
    `Reserve: ${estimate.reserve} %`,
    `Unverbindliche Schätzung: ${estimate.liters} Liter / ca. ${estimate.crates} Kisten`, '',
    `Unternehmen: ${values.get('company')}`,
    `Ansprechpartner: ${values.get('contactName')}`,
    `E-Mail: ${values.get('email')}`,
    `Telefon: ${values.get('phone')}`,
    `Hinweise: ${values.get('notes') || 'Keine'}`, '',
    'Bitte prüfen Sie die Mengen und senden Sie mir ein persönliches Angebot.'
  ].join('\n');
  const subject = `Eventanfrage ${values.get('eventType')} – ${values.get('company')}`;
  status.textContent = 'Ihre Anfrage wurde vorbereitet. Das E-Mail-Programm wird geöffnet.';
  window.location.href = `mailto:info@getraenkegrossmann.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

const dateInput = form.elements.eventDate;
dateInput.min = new Date().toISOString().slice(0, 10);
calculate();
showStep(1);
