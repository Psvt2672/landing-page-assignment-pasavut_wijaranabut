const STORAGE_KEY = 'owndays_registrations';
const VISITS_KEY   = 'owndays_visits';
const STORE_LIST = ['centralramindra', 'fashionisland', 'centralworld', 'megabangna', 'centralplazawestgest'];

const form = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const successState = document.getElementById('successState');

// Validation rules
const validators = {
  name(val) {
    if (!val.trim())            return 'Please enter your name.';
    if (val.trim().length < 2)  return 'Name must be at least 2 characters.';
    return null;
  },
  email(val) {
    if (!val.trim()) return 'Please enter your email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim()))
      return 'Please enter a valid email address.';
    return null;
  },
  phone(val) {
    if (!val.trim()) return 'Please enter your phone number.';
    if (!/^\d{10}$/.test(val.trim()))
      return 'Please enter a valid phone number.';
    return null;
  },
  store(val) {
    if (!val || !STORE_LIST.includes(val))
      return 'Please select a preferred store.';
    return null;
  },
  date(val) {
    if (!val) return 'Please choose a preferred date.';
    const chosen = new Date(val);
    const today  = new Date(); today.getDay;
    if (chosen < today) return 'Please enter a valid data.';
    return null;
  },
};

// Set min date
document.getElementById('date').min = new Date().toISOString().split('T')[0];

// ── Validate single field ──────────────────────────────────
function validateField(id) {
  const input   = document.getElementById(id);
  const fieldEl = document.getElementById('field-' + id);
  const errorEl = document.getElementById('error-' + id);
  const error   = validators[id](input.value);

  if (error) {
    fieldEl.classList.add('has-error');
    errorEl.textContent = error;
    return false;
  }
  fieldEl.classList.remove('has-error');
  errorEl.textContent = '';
  return true;
}

// Show errors
['name', 'email', 'phone', 'store', 'date'].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener('blur',  () => validateField(id));
  input.addEventListener('input', () => {
    if (document.getElementById('field-' + id).classList.contains('has-error'))
      validateField(id);
  });
});

// Save data
function saveRegistration(record) {
  let all = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) all = JSON.parse(raw);
    if (!Array.isArray(all)) all = [];
  } catch {
    all = [];
  }
  all.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// Form submit
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const fields  = ['name', 'email', 'phone', 'store', 'date'];
  const allValid = fields.map(validateField).every(Boolean);

  if (!allValid) {
    const firstBad = fields.find(id =>
      document.getElementById('field-' + id).classList.contains('has-error')
    );
    document.getElementById(firstBad)?.focus();
    return;
  }

  // Build record
  const record = {
    id:             crypto.randomUUID(),
    name:           document.getElementById('name').value.trim(),
    email:          document.getElementById('email').value.trim().toLowerCase(),
    phone:          document.getElementById('phone').value.trim(),
    store:          document.getElementById('store').value,
    preferred_date: document.getElementById('date').value,
    registered_at:  new Date().toISOString(),
  };

  submitBtn.disabled = true;
  submitBtn.classList.add('loading');

  try {
    saveRegistration(record);
    // Brief artificial delay so the spinner is visible
    setTimeout(() => {
      form.hidden = false;
      successState.hidden = false;
      form.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }, 600);
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');

    const msg = document.createElement('p');
    msg.textContent = 'Could not save your registration. Please try again.';
    msg.style.cssText = 'color:#D63C3C;font-size:.85rem;margin-top:12px;text-align:center';
    form.appendChild(msg);
    setTimeout(() => msg.remove(), 4000);
  }
});
trackVisit()

// Visit Tracking
function trackVisit() {
  let count = parseInt(localStorage.getItem(VISITS_KEY) || '0', 10);
  localStorage.setItem(VISITS_KEY, count + 1);
}
