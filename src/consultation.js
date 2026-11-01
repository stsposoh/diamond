// The consultation form is UI only: it validates, then shows the confirmation
// without sending anything anywhere.
const MESSAGES = {
  name: 'Tell us what to call you.',
  email: 'We need an email address to confirm the date, like name@example.com.',
  occasion: 'Choose what the piece is for, or “Something else”.',
  date: 'Choose a day for the visit.',
};

export function initConsultation() {
  const form = document.querySelector('[data-consult-form]');
  if (!form) return;

  // The atelier sees clients Tuesday to Saturday; offer the next three weeks of those days.
  const date = form.elements.date;
  const day = new Date();
  for (let added = 0; added < 15;) {
    day.setDate(day.getDate() + 1);
    if (day.getDay() === 0 || day.getDay() === 1) continue;
    const option = new Option(day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }), day.toISOString().slice(0, 10));
    date.append(option);
    added++;
  }

  const errorFor = (field) => {
    let error = document.getElementById(`${field.id}-error`);
    if (!error) {
      error = document.createElement('p');
      error.id = `${field.id}-error`;
      error.className = 'form__error';
      field.closest('.form__field').append(error);
    }
    return error;
  };

  const check = (field) => {
    const valid = field.checkValidity();
    field.setAttribute('aria-invalid', String(!valid));
    if (valid) {
      field.removeAttribute('aria-describedby');
      errorFor(field).textContent = '';
    } else {
      field.setAttribute('aria-describedby', errorFor(field).id);
      errorFor(field).textContent = MESSAGES[field.name];
    }
    return valid;
  };

  const fields = [...form.querySelectorAll('input, select')];
  fields.forEach((field) => {
    field.addEventListener('blur', () => { if (field.value) check(field); });
    field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') check(field); });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const invalid = fields.filter((field) => !check(field));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    const name = form.elements.name.value.trim().split(/\s+/)[0];
    const when = date.selectedOptions[0].textContent;
    const done = document.createElement('div');
    done.className = 'form__done';
    done.setAttribute('role', 'status');
    done.tabIndex = -1;
    done.innerHTML = `
      <p class="form__done-title"></p>
      <p class="form__done-text"></p>
      <p class="form__done-note">This is a demo site. Nothing was sent.</p>
    `;
    done.querySelector('.form__done-title').textContent = `Thank you, ${name}.`;
    done.querySelector('.form__done-text').textContent = `We have pencilled you in for ${when}. A cutter will write to ${form.elements.email.value} to confirm the time.`;
    form.replaceWith(done);
    done.focus();
  });
}
