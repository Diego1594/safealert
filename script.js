// SafeAlert Landing: interacciones de presentación, sin librerías ni backend.
'use strict';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

const iconPaths = {
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  route: '<circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18h8a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h5"/>',
  family: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v2"/>',
  community: '<circle cx="12" cy="6" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M5 5a3 3 0 0 0 0 6M19 5a3 3 0 0 1 0 6M2 19v-2a4 4 0 0 1 2-3M22 19v-2a4 4 0 0 0-2-3"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  report: '<path d="M8 4H5v17h14V4h-3M8 3h8v4H8ZM8 12h8M8 16h6"/>',
  wifi: '<path d="M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="20" r=".7"/>',
  home: '<path d="m3 10 9-7 9 7v10H3ZM9 20v-7h6v7"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5Z"/>',
  message: '<path d="M21 11a9 9 0 0 1-9 9H3l2-5a9 9 0 1 1 16-4Z"/><path d="M8 10h8M8 14h5"/>',
  devices: '<rect x="3" y="4" width="15" height="11" rx="1.5"/><path d="M10 15v5M6 20h8"/><rect x="16" y="10" width="6" height="11" rx="1"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
$$('[data-icon]').forEach(element => {
  element.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="24" height="24">${iconPaths[element.dataset.icon] || iconPaths.shield}</svg>`;
});

// Menú desplegable para tablet y móvil.
const menuToggle = $('#menu-toggle');
const mainNav = $('#main-nav');
function closeMenu(returnFocus = false) {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});
$$('#main-nav a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mainNav.classList.contains('open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width:961px)').addEventListener('change', () => closeMenu());

// Vistas dentro del mismo HTML. Los enlaces conservan una URL propia y el historial.
const views = {
  inicio: ['Inicio', 'hero-title'],
  funciones: ['Funciones', 'features-title'],
  'para-quien': ['Para quién', 'audience-title'],
  'como-funciona': ['Cómo funciona', 'how-title'],
  prototipo: ['El prototipo', 'prototype-title'],
  nosotros: ['Nosotros', 'about-title'],
  preguntas: ['Preguntas frecuentes', 'faq-title'],
  contacto: ['Contacto', 'contact-title'],
};
let currentView = '';
function readView() {
  const view = location.hash.slice(1);
  return Object.hasOwn(views, view) ? view : 'inicio';
}
function showView(view, focusHeading = true) {
  if (!Object.hasOwn(views, view)) view = 'inicio';
  currentView = view;
  // Solo ocultar vistas del main: el body también guarda data-view y debe seguir visible.
  document.body.hidden = false;
  $$('#contenido [data-view]').forEach(section => { section.hidden = section.dataset.view !== view; });
  $$('#main-nav a').forEach(link => {
    if (link.getAttribute('href') === `#${view}`) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  $('#page-navigation').hidden = view === 'inicio';
  $('#current-view-label').textContent = views[view][0];
  $('#view-announcement').textContent = `Vista: ${views[view][0]}`;
  document.title = `${views[view][0]} · SafeAlert`;
  document.body.dataset.view = view;
  closeMenu();
  window.scrollTo(0, 0);
  if (focusHeading) $(`#${views[view][1]}`).focus({preventScroll: true});
}
function navigateView(view) {
  if (!Object.hasOwn(views, view)) return;
  if (view !== currentView) {
    const depth = history.state?.safealertLanding ? history.state.depth : 0;
    history.pushState({safealertLanding: true, depth: depth + 1}, '', `#${view}`);
  }
  showView(view);
}
document.addEventListener('click', event => {
  if (event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const view = link.getAttribute('href').slice(1);
  if (view === 'contenido') {
    event.preventDefault();
    event.stopPropagation();
    $('#contenido').focus();
    return;
  }
  if (!Object.hasOwn(views, view)) return;
  event.preventDefault();
  // Procesar las vistas antes de que una vista previa trate el enlace como otra página.
  event.stopPropagation();
  navigateView(view);
}, true);
$('#back-view').addEventListener('click', () => {
  if (history.state?.safealertLanding && history.state.depth > 0) history.back();
  else navigateView('inicio');
});
window.addEventListener('popstate', () => showView(readView()));
window.addEventListener('hashchange', () => {
  // El enlace para saltar al contenido no cambia la vista activa.
  if (location.hash === '#contenido') return;
  const view = readView();
  if (view !== currentView) showView(view);
});

// Carrusel manual: cada mensaje presenta una necesidad de la propuesta.
const slides = [
  {title: 'Una alerta clara.<br>Una comunidad<br><span>más preparada.</span>', description: 'Saber qué ocurre, hacia dónde ir y cómo está tu familia. Una propuesta que reúne lo importante cuando más lo necesitas.', image: 'Images/ALERTAS.png', width: 469, height: 936, alt: 'Captura del centro de alertas del prototipo de SafeAlert', announcement: 'Alertas claras para una comunidad más preparada.'},
  {title: 'Tu familia cerca.<br>Incluso cuando<br><span>más importa.</span>', description: 'La tranquilidad también es saber de los tuyos. Conoce una propuesta pensada para comunicar estados y mantener conectada a tu red familiar.', image: 'Images/Familiares.png', width: 525, height: 954, alt: 'Captura de la red familiar del prototipo de SafeAlert', announcement: 'La propuesta de conexión y bienestar familiar.'},
  {title: 'Conoce tu zona.<br>Encuentra un paso<br><span>más claro.</span>', description: 'Orientarte es más fácil cuando sabes qué buscar. Explora cómo SafeAlert plantea acercar rutas, refugios y referencias para actuar con mayor claridad.', image: 'Images/Ruta-evacuacion-1.png', width: 488, height: 922, alt: 'Captura del mapa y la ruta de evacuación del prototipo', announcement: 'Orientación mediante rutas y refugios.'},
];
let currentSlide = 0;
function selectSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  const slide = slides[currentSlide];
  $('#hero-title').innerHTML = slide.title;
  $('#hero-description').textContent = slide.description;
  const image = $('#hero-product-image');
  image.src = slide.image;
  image.alt = slide.alt;
  image.width = slide.width;
  image.height = slide.height;
  $$('.slide-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
    dot.setAttribute('aria-pressed', String(i === currentSlide));
  });
  $('#slide-announcement').textContent = slide.announcement;
}
$$('[data-slide]').forEach(button => button.addEventListener('click', () => selectSlide(Number(button.dataset.slide))));
$('#previous-slide').addEventListener('click', () => selectSlide(currentSlide - 1));
$('#next-slide').addEventListener('click', () => selectSlide(currentSlide + 1));

// Pestañas por público; compatibles con teclado.
const audienceTabs = $$('[data-audience]');
function selectAudience(button, moveFocus = false) {
  audienceTabs.forEach(tab => {
    const selected = tab === button;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    $(`#panel-${tab.dataset.audience}`).hidden = !selected;
  });
  if (moveFocus) button.focus();
}
audienceTabs.forEach((button, index) => {
  button.addEventListener('click', () => selectAudience(button));
  button.addEventListener('keydown', event => {
    let next;
    if (['ArrowRight', 'ArrowDown'].includes(event.key)) next = (index + 1) % audienceTabs.length;
    if (['ArrowLeft', 'ArrowUp'].includes(event.key)) next = (index - 1 + audienceTabs.length) % audienceTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = audienceTabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectAudience(audienceTabs[next], true);
    }
  });
});

// Preguntas frecuentes: conservar una respuesta abierta a la vez.
const questions = $$('.faq-list details');
questions.forEach(question => question.addEventListener('toggle', () => {
  if (question.open) questions.forEach(other => { if (other !== question) other.open = false; });
}));

// Ampliación de las capturas proporcionadas por el equipo.
const previewDialog = $('#preview-dialog');
let previewTrigger = null;
$$('[data-preview]').forEach(button => button.addEventListener('click', () => {
  previewTrigger = button;
  $('#preview-title').textContent = button.dataset.previewTitle;
  $('#preview-image').src = button.dataset.preview;
  $('#preview-image').alt = button.dataset.previewTitle;
  $('#preview-image').onload = event => {
    event.target.width = event.target.naturalWidth;
    event.target.height = event.target.naturalHeight;
  };
  previewDialog.showModal();
}));
$('#close-preview').addEventListener('click', () => previewDialog.close());
previewDialog.addEventListener('click', event => { if (event.target === previewDialog) {
  const rect = previewDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) previewDialog.close();
}});
previewDialog.addEventListener('close', () => previewTrigger?.focus());

// Formulario de demostración: validación y confirmación sin enviar ni guardar datos.
const form = $('#contact-form');
const fields = {
  name: $('#contact-name'), email: $('#contact-email'),
  phone: $('#contact-phone'), message: $('#contact-message'),
};
const touched = new Set();
function validateField(key) {
  const input = fields[key];
  const value = input.value.trim();
  let error = '';
  if (!value) error = 'Completa este campo para continuar.';
  else if (key === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Escribe un correo válido, por ejemplo nombre@correo.com.';
  else if (key === 'phone' && (!/^\+?[\d\s()-]+$/.test(value) || value.replace(/\D/g, '').length < 9 || value.replace(/\D/g, '').length > 15)) error = 'Escribe un celular válido de entre 9 y 15 dígitos.';
  else if (key === 'message' && value.length < 10) error = 'Cuéntanos un poco más: escribe al menos 10 caracteres.';
  const errorElement = $(`#${key}-error`);
  errorElement.textContent = error;
  errorElement.hidden = !error;
  input.setAttribute('aria-invalid', String(Boolean(error)));
  return !error;
}
Object.entries(fields).forEach(([key, input]) => {
  input.addEventListener('blur', () => { touched.add(key); validateField(key); });
  input.addEventListener('input', () => { if (touched.has(key)) validateField(key); });
});
form.addEventListener('submit', event => {
  event.preventDefault();
  let firstInvalid = null;
  Object.keys(fields).forEach(key => {
    touched.add(key);
    if (!validateField(key) && !firstInvalid) firstInvalid = fields[key];
  });
  if (firstInvalid) {
    $('#form-status').textContent = 'Revisa los campos señalados antes de continuar.';
    firstInvalid.focus();
    return;
  }
  // textContent permite mostrar el nombre sin interpretar código HTML ingresado.
  $('#success-name').textContent = fields.name.value.trim().split(/\s+/)[0];
  $('#form-status').textContent = '';
  form.hidden = true;
  $('#form-success').hidden = false;
  $('#form-success').focus();
  form.reset();
});
$('#new-request').addEventListener('click', () => {
  form.hidden = false;
  $('#form-success').hidden = true;
  touched.clear();
  Object.keys(fields).forEach(key => {
    fields[key].removeAttribute('aria-invalid');
    $(`#${key}-error`).textContent = '';
    $(`#${key}-error`).hidden = true;
  });
  fields.name.focus();
});

// Abrir Inicio, o la vista indicada en la URL, sin crear una entrada extra.
const initialView = readView();
history.replaceState({safealertLanding: true, depth: 0}, '', `#${initialView}`);
showView(initialView, false);
