document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP = '2348163180822';

  document.getElementById('year').textContent = new Date().getFullYear();

  // Header background on scroll
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');
  const closeNav = () => {
    nav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  // Reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Animated counters
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const tick = () => {
        current = Math.min(current + step, target);
        el.textContent = current + (current === target ? '+' : '');
        if (current < target) requestAnimationFrame(tick);
      };
      tick();
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(c => countIO.observe(c));

  // Hide gallery tiles whose photos haven't been added yet
  document.querySelectorAll('.gallery img').forEach(img => {
    img.addEventListener('error', () => { img.closest('figure').style.display = 'none'; });
  });

  // "Order Now" buttons pre-fill the service dropdown
  const form = document.getElementById('quoteForm');
  const select = form.querySelector('select[name="service"]');
  document.querySelectorAll('[data-package]').forEach(btn => {
    btn.addEventListener('click', () => { select.value = btn.dataset.package; });
  });

  // Form: Formspree if configured, otherwise send via WhatsApp
  const status = document.getElementById('formStatus');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(form);

    if (form.action.includes('YOUR_FORM_ID')) {
      const msg =
        `Hello Lightall Solar, I'd like a quote.%0A%0A` +
        `Name: ${encodeURIComponent(data.get('name'))}%0A` +
        `Phone: ${encodeURIComponent(data.get('phone'))}%0A` +
        `Email: ${encodeURIComponent(data.get('email') || '-')}%0A` +
        `Location: ${encodeURIComponent(data.get('location') || '-')}%0A` +
        `Interested in: ${encodeURIComponent(data.get('service'))}%0A` +
        `Message: ${encodeURIComponent(data.get('message') || '-')}`;
      window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
      status.style.color = '#1E9E5A';
      status.textContent = 'Opening WhatsApp to send your request...';
      return;
    }

    status.style.color = '';
    status.textContent = 'Sending...';
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error();
      form.reset();
      status.style.color = '#1E9E5A';
      status.textContent = 'Thank you! We will contact you shortly.';
    } catch {
      status.style.color = '#C0392B';
      status.textContent = 'Something went wrong. Please call 0816 318 0822 or WhatsApp us.';
    }
  });
});
