document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
  initAnalytics();
  // initABTest();
  initSubscribeForm();
  initViewportAnimations();
});

function initABTest () {
  if (document.body.dataset.type !== 'home') { return; }

  if (Math.random() >= 0.5 || localStorage.getItem('abTestTitle1')) {
    localStorage.setItem('abTestTitle1', 1);
    amp().setUserProperties({'abTestTitle1': true});
    $('.heroTitle').innerText = '';
    $('.heroSubtitle').innerHTML = '';
  } else {
    amp().setUserProperties({'abTestTitle1': false});
  }
}

function initAnalytics () {
  amp().logEvent('Page View', {
    page: document.body.dataset.type || document.title
  });

  if (document.body.dataset.type === 'home') {
    let ticking = false;
    const scrollTracked = [];
    window.addEventListener('scroll', evt => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const b = document.body;
          const percent = this.scrollY / (document.body.clientHeight - window.innerHeight);
          if (percent >= 0.25 && !scrollTracked[0]) {
            amp().logEvent('25% Scroll Depth');
            scrollTracked[0] = true;
          }
          if (percent >= 0.5 && !scrollTracked[1]) {
            amp().logEvent('50% Scroll Depth');
            scrollTracked[1] = true;
          }
          if (percent >= 0.75 && !scrollTracked[2]) {
            amp().logEvent('75% Scroll Depth');
            scrollTracked[2] = true;
          }
          if (percent >= 0.95 && !scrollTracked[3]) {
            amp().logEvent('100% Scroll Depth');
            scrollTracked[3] = true;
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }
}

/**
 * Init XHR handler to subscribe.
 */
function initSubscribeForm () {
  const form = $('form.subscribe');
  if (!form) { return; }

  const button = form.querySelector('.submit');
  const input = form.querySelector('input[type="email"]');
  const newsletterHeader = $('#newsletterForm > h2');

  let originalHeaderText = '';
  if (newsletterHeader) {
    originalHeaderText = newsletterHeader.innerHTML;
  }

  form.addEventListener('submit', evt => {
    evt.preventDefault();

    const xhr = new XMLHttpRequest();
    let endpoint = 'http://localhost:5000/mail/subscribe';
    if (process.env.NODE_ENV === 'production') {
      endpoint = 'https://api.learncoupling.com/mail/subscribe';
    }
    xhr.open('POST', endpoint);

    xhr.addEventListener('load', () => {
      if (parseInt(xhr.status, 10) !== 200) {
        window.location.href = 'https://learncoupling.com/subscribe';
      }
      if (button) {
        button.disabled = true;
        button.innerHTML = 'Subscribed!';
      }
      if (newsletterHeader) {
        newsletterHeader.innerHTML = 'Successfully subscribed, thank you!';
      }
    });

    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(JSON.stringify({
      email: $('[name="email"]').value,
      source: document.title
    }));

    return false;
  });

  if (button) {
    input.addEventListener('keydown', () => {
      if (button.hasAttribute('disabled')) {
        button.innerHTML = 'Subscribe';
        button.removeAttribute('disabled');
      }
      if (newsletterHeader && originalHeaderText) {
        newsletterHeader.innerHTML = originalHeaderText;
      }
    });
  }
}

function initViewportAnimations() {
  const iconTextSections = $$('.iconText');
  const screenshots = $$('.screenshot');

  setInterval(() => {
    const height = window.innerHeight || document.documentElement.clientHeight;

    for (let i = 0; i < iconTextSections.length; i++) {
      if (iconTextSections[i].classList.contains('iconTextSectionVisible')) { continue; }
      const bounding = iconTextSections[i].getBoundingClientRect();
      if (bounding.top + (bounding.height / 1.5) >= 0 &&
          bounding.top + (bounding.height / 1.5) <= height) {
        iconTextSections[i].classList.add('iconTextSectionVisible');
      }
    }

    for (let i = 0; i < screenshots.length; i++) {
      if (screenshots[i].classList.contains('screenshotVisible')) { continue; }
      const bounding = screenshots[i].getBoundingClientRect();
      if (bounding.top + (bounding.height / 1.5) >= 0 &&
          bounding.top + (bounding.height / 1.5) <= height) {
        screenshots[i].classList.add('screenshotVisible');
        if (screenshots[i].parentNode.tagName === "A") {
          screenshots[i].parentNode.classList.add('screenshotVisible');
        }
      }
    }
  }, 100);
}

function click (q, fn) {
  if (!$(q)) { return; }
  const nodes = $$(q);
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].addEventListener('click', fn);
  }
}

function amp () { return amplitude.getInstance(); }

function $ (q) { return document.querySelector(q); }
function $$ (q) { return document.querySelectorAll(q); }
