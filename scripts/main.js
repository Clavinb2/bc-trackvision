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
});

