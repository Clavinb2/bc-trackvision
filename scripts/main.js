document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('[data-filter]');
  const filterTargets = document.querySelectorAll('[data-category]');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => btn.classList.toggle('is-active', btn === button));

      filterTargets.forEach((target) => {
        const category = target.dataset.category;
        const shouldShow = filter === 'all' || category.split(',').includes(filter);
        target.style.display = shouldShow ? '' : 'none';
      });
    });
  });

  document.querySelectorAll('.nav').forEach((nav) => {
    const toggle = nav.querySelector('.nav__toggle');
    const menu = nav.querySelector('.nav__menu');

    if (!toggle || !menu) return;

    const closeMenu = () => {
      menu.classList.remove('is-open');
      toggle.classList.remove('is-active');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isExpanded));
      menu.classList.toggle('is-open', !isExpanded);
      toggle.classList.toggle('is-active', !isExpanded);
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 768px)').matches) {
          closeMenu();
        }
      });
    });

    window.addEventListener('resize', () => {
      if (!window.matchMedia('(max-width: 768px)').matches) {
        closeMenu();
      }
    });
  });

  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const statusEl = contactForm.querySelector('.form-status');

    const setStatus = (message, state) => {
      if (!statusEl) {
        if (message) {
          window.alert(message);
        }
        return;
      }

      statusEl.textContent = message;
      statusEl.classList.remove('is-success', 'is-error');
      if (state) {
        statusEl.classList.add(state);
      }
    };

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!submitBtn) return;

      const formData = new FormData(contactForm);
      formData.append('access_key', 'd840b1bd-562e-42bc-a9aa-8fe285a25bdc');

      const originalText = submitBtn.textContent;

      setStatus('Sending…', null);
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('Success! Your message has been sent.', 'is-success');
          contactForm.reset();
        } else {
          setStatus(`Error: ${data.message}`, 'is-error');
        }
      } catch (error) {
        setStatus('Something went wrong. Please try again.', 'is-error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }
});

