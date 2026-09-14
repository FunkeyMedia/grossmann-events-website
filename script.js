const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('open', !open);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}));

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

const heroVideo = document.querySelector('#hero-video');
const heroVideoToggle = document.querySelector('.hero-video-toggle');
if (heroVideo && heroVideoToggle) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const playHero = () => {
    if (!heroVideo.getAttribute('src')) heroVideo.src = heroVideo.dataset.src;
    heroVideo.muted = true;
    heroVideo.play().catch(() => { heroVideoToggle.textContent = 'Video abspielen'; });
  };
  heroVideoToggle.hidden = false;
  heroVideo.addEventListener('play', () => { heroVideoToggle.textContent = 'Video pausieren'; });
  heroVideo.addEventListener('pause', () => { heroVideoToggle.textContent = 'Video abspielen'; });
  heroVideo.addEventListener('error', () => {
    heroVideo.removeAttribute('src');
    heroVideo.load();
    heroVideoToggle.hidden = true;
  });
  heroVideoToggle.addEventListener('click', () => {
    if (heroVideo.paused) playHero();
    else heroVideo.pause();
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) heroVideo.pause();
  });
  if (!reducedMotion.matches && !navigator.connection?.saveData) playHero();
}
