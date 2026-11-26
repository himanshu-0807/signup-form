(function () {
  const form = document.getElementById('signup-form');
  const fullNameInput = document.getElementById('fullname');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirm');
  const dobInput = document.getElementById('dob');
  const roleInputs = Array.from(document.querySelectorAll('input[name="role"]'));
  const termsInput = document.getElementById('terms');
  const statusEl = document.getElementById('form-status');
  const ruleItems = Array.from(document.querySelectorAll('#password-rules li'));
  const toggleButtons = Array.from(document.querySelectorAll('.toggle-password'));

  const touched = new Set();
  let submitted = false;

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function getPasswordChecks(value) {
    return {
      length: value.length >= 8,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[^A-Za-z0-9\s]/.test(value)
    };
  }

  function updatePasswordChecklist(showUnmetAsError) {
    const checks = getPasswordChecks(passwordInput.value);
    ruleItems.forEach((item) => {
      const rule = item.dataset.rule;
      const met = Boolean(checks[rule]);
      const icon = item.querySelector('.rule-icon');
      item.classList.toggle('is-met', met);
      item.classList.toggle('is-unmet', !met && showUnmetAsError);
      if (icon) {
        icon.textContent = met ? '✓' : (!met && showUnmetAsError ? '✕' : '○');
      }
    });
    return checks;
  }

  function setFieldState(input, errorId, message, showVisual) {
    const errorEl = document.getElementById(errorId);
    if (!showVisual) {
      input.classList.remove('is-invalid', 'is-valid');
      input.removeAttribute('aria-invalid');
      if (errorEl) errorEl.textContent = '';
      return;
    }

    if (message) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = message;
    } else {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      input.setAttribute('aria-invalid', 'false');
      if (errorEl) errorEl.textContent = '';
    }
  }

  function validateFullName(showVisual) {
    const val = fullNameInput.value.trim();
    let msg = '';
    if (!val) {
      msg = 'Full name is required.';
    } else if (val.replace(/\s+/g, '').length < 2) {
      msg = 'Please enter at least 2 characters for your full name.';
    }
    setFieldState(fullNameInput, 'fullname-error', msg, showVisual);
    return !msg;
  }

  function validateEmail(showVisual) {
    const val = emailInput.value.trim();
    let msg = '';
    if (!val) {
      msg = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(val) || val.includes('..')) {
      msg = 'Please enter a valid email address (e.g., name@example.com).';
    }
    setFieldState(emailInput, 'email-error', msg, showVisual);
    return !msg;
  }

  function validatePassword(showVisual) {
    const val = passwordInput.value;
    const checks = updatePasswordChecklist(showVisual);
    const missing = [];
    if (!checks.length) missing.push('at least 8 characters');
    if (!checks.upper) missing.push('an uppercase letter');
    if (!checks.lower) missing.push('a lowercase letter');
    if (!checks.number) missing.push('a number');
    if (!checks.special) missing.push('a special character');

    let msg = '';
    if (!val) {
      msg = 'Password is required.';
    } else if (missing.length > 0) {
      msg = 'Password must include ' + missing.join(', ') + '.';
    }
    setFieldState(passwordInput, 'password-error', msg, showVisual);
    return !msg;
  }

  function validateConfirm(showVisual) {
    const val = confirmInput.value;
    let msg = '';
    if (!val) {
      msg = 'Please confirm your password.';
    } else if (val !== passwordInput.value) {
      msg = 'Passwords do not match.';
    }
    setFieldState(confirmInput, 'confirm-error', msg, showVisual);
    return !msg;
  }

  function validateDob(showVisual) {
    const val = dobInput.value.trim();
    let msg = '';
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(val);

    if (!val) {
      msg = 'Date of birth is required.';
    } else if (!match) {
      msg = 'Enter a valid date in MM/DD/YYYY format.';
    } else {
      const month = Number(match[1]);
      const day = Number(match[2]);
      const year = Number(match[3]);
      const date = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const isValidCalendarDate =
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day;

      if (!isValidCalendarDate || year < 1900) {
        msg = 'Please enter a valid calendar date.';
      } else if (date > today) {
        msg = 'Date of birth cannot be in the future.';
      }
    }

    setFieldState(dobInput, 'dob-error', msg, showVisual);
    return !msg;
  }

  function validateRole(showVisual) {
    const selected = roleInputs.some((radio) => radio.checked);
    const errorEl = document.getElementById('role-error');
    const msg = selected ? '' : 'Please select either Student or Employee.';
    roleInputs.forEach((radio) => {
      radio.classList.toggle('is-invalid', Boolean(showVisual && msg));
    });
    if (errorEl) errorEl.textContent = showVisual ? msg : '';
    return selected;
  }

  function validateTerms(showVisual) {
    const checked = termsInput.checked;
    const errorEl = document.getElementById('terms-error');
    const msg = checked ? '' : 'You must agree to the Terms and conditions.';
    termsInput.classList.toggle('is-invalid', Boolean(showVisual && msg));
    termsInput.setAttribute('aria-invalid', showVisual && msg ? 'true' : 'false');
    if (errorEl) errorEl.textContent = showVisual ? msg : '';
    return checked;
  }

  function clearStatusIfEditing() {
    if (statusEl.classList.contains('is-success')) {
      statusEl.textContent = '';
      statusEl.className = '';
      statusEl.setAttribute('role', 'status');
    }
  }

  function formatDobInput(e) {
    const raw = dobInput.value;
    if (e.inputType && e.inputType.startsWith('delete')) return;
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 4) {
      formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
    } else if (digits.length > 2) {
      formatted = digits.slice(0, 2) + '/' + digits.slice(2);
    }
    dobInput.value = formatted;
  }

  function bindFieldValidation(input, validator) {
    input.addEventListener('blur', () => {
      touched.add(input.id);
      validator(true);
    });

    input.addEventListener('input', () => {
      clearStatusIfEditing();
      if (input === passwordInput) {
        updatePasswordChecklist(submitted || touched.has('password'));
        if (touched.has('confirm') || submitted || confirmInput.value.length > 0) {
          validateConfirm(true);
        }
      }
      if (touched.has(input.id) || submitted) {
        validator(true);
      }
    });
  }

  bindFieldValidation(fullNameInput, validateFullName);
  bindFieldValidation(emailInput, validateEmail);
  bindFieldValidation(passwordInput, validatePassword);
  bindFieldValidation(confirmInput, validateConfirm);

  dobInput.addEventListener('input', (e) => {
    formatDobInput(e);
    clearStatusIfEditing();
    if (touched.has('dob') || submitted) {
      validateDob(true);
    }
  });
  dobInput.addEventListener('blur', () => {
    touched.add('dob');
    validateDob(true);
  });

  roleInputs.forEach((radio) => {
    radio.addEventListener('change', () => {
      clearStatusIfEditing();
      touched.add('role');
      validateRole(true);
    });
  });

  termsInput.addEventListener('change', () => {
    clearStatusIfEditing();
    touched.add('terms');
    validateTerms(true);
  });

  toggleButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isHidden = target.type === 'password';
      target.type = isHidden ? 'text' : 'password';
      btn.textContent = isHidden ? 'Hide' : 'Show';
      btn.setAttribute('aria-pressed', String(isHidden));
      btn.setAttribute('aria-label', (isHidden ? 'Hide ' : 'Show ') + (target.id === 'confirm' ? 'confirm password' : 'password'));
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitted = true;

    const results = [
      { valid: validateFullName(true), el: fullNameInput },
      { valid: validateEmail(true), el: emailInput },
      { valid: validatePassword(true), el: passwordInput },
      { valid: validateConfirm(true), el: confirmInput },
      { valid: validateDob(true), el: dobInput },
      { valid: validateRole(true), el: roleInputs[0] },
      { valid: validateTerms(true), el: termsInput }
    ];

    const firstInvalid = results.find((item) => !item.valid);
    if (firstInvalid) {
      statusEl.textContent = 'Please fix the highlighted errors above before signing up.';
      statusEl.className = 'is-error';
      statusEl.setAttribute('role', 'alert');
      firstInvalid.el.focus();
      return;
    }

    const signedUpName = fullNameInput.value.trim();
    form.reset();
    touched.clear();
    submitted = false;

    [fullNameInput, emailInput, passwordInput, confirmInput, dobInput].forEach((input) => {
      input.classList.remove('is-valid', 'is-invalid');
      input.removeAttribute('aria-invalid');
    });
    [passwordInput, confirmInput].forEach((input) => {
      input.type = 'password';
    });
    toggleButtons.forEach((btn) => {
      btn.textContent = 'Show';
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', btn.dataset.target === 'confirm' ? 'Show confirm password' : 'Show password');
    });
    roleInputs.forEach((radio) => radio.classList.remove('is-invalid'));
    termsInput.classList.remove('is-invalid');
    termsInput.removeAttribute('aria-invalid');
    document.querySelectorAll('.field-error').forEach((el) => {
      el.textContent = '';
    });
    updatePasswordChecklist(false);

    statusEl.textContent = `Account created successfully! Welcome, ${signedUpName}.`;
    statusEl.className = 'is-success';
    statusEl.setAttribute('role', 'status');
  });

  document.querySelectorAll('[data-modal]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const dialog = document.getElementById(trigger.dataset.modal);
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    });
  });

  document.querySelectorAll('.modal-close').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog');
      if (dialog) dialog.close();
    });
  });

  document.querySelectorAll('.info-modal').forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
  });
})();
