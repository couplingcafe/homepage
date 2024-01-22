document.addEventListener('DOMContentLoaded', () => {
  console.log('Loaded');
  initAnalytics();
  initLoaded();
  initSubscribeForm();
  initViewportAnimations();
});

function initAnalytics () {
  if (window.location.host.startsWith('localhost')) { return; }

  if (window.location.pathname === '/') {
    let ticking = false;
    const scrollTracked = [];
    window.addEventListener('scroll', evt => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const percent = this.scrollY / (document.body.clientHeight - window.innerHeight);
          if (percent >= 0.25 && !scrollTracked[0]) {
            analytics.track('Home Page 25% Scroll Depth');
            scrollTracked[0] = true;
          }
          if (percent >= 0.5 && !scrollTracked[1]) {
            analytics.track('Home Page 50% Scroll Depth');
            scrollTracked[1] = true;
          }
          if (percent >= 0.75 && !scrollTracked[2]) {
            analytics.track('Home Page 75% Scroll Depth');
            scrollTracked[2] = true;
          }
          if (percent >= 0.95 && !scrollTracked[3]) {
            analytics.track('Home Page 100% Scroll Depth');
            scrollTracked[3] = true;
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  $$('form.subscribe button').forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('Subscribe button click.');
      analytics.track('Home Page Subscribe');
    });
  });

  $$('a').forEach(link => {
    link.addEventListener('click', () => {
      analytics.track('Home Page Link Click', {
        href: link.getAttribute('href'),
        text: link.innerText
      });
    });
  });
}

function initLoaded () {
  let fontLoaded = false;
  let imgLoaded = false;

  document.fonts.ready.then(() => {
    fontLoaded = true;
    tryLoad();
  });

  const img = document.querySelector('img.hero');
  if (!img) {
    imgLoaded = true;
  }
  else {
    if (!img.complete || img.naturalWidth === 0) {
      img.onload = () => {
        imgLoaded = true;
        tryLoad();
      };
    } else {
      imgLoaded = true;
      tryLoad();
    }
  }

  function tryLoad () {
    if (fontLoaded && imgLoaded) {
      document.body.classList.add('loaded');
    }
  }

  setTimeout(function () {
    document.body.classList.add('loaded');
  }, 1000);
}

/**
 * Init XHR handler to subscribe.
 */
function initSubscribeForm () {
  const forms = $$('.subscribeForm');
  if (!forms || !forms.length) { return; }

  forms.forEach(form => {
    const button = form.querySelector('.submit');
    const input = form.querySelector('input[type="email"]');

    let originalHeaderText = '';

    button.addEventListener('click', evt => {
      evt.preventDefault();

      const xhr = new XMLHttpRequest();
      let endpoint = 'http://localhost:5000/mail/subscribe';
      if (process.env.NODE_ENV === 'production') {
        endpoint = 'https://subscribe.learncoupling.com/mail/subscribe';
      }
      xhr.open('POST', endpoint);

      xhr.addEventListener('load', () => {
        if (button) {
          button.disabled = true;
          button.innerHTML = 'Subscribed!';
        }
      });

      xhr.addEventListener('error', () => {
        window.location.href = 'http://eepurl.com/hfV9gr';
      });

      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.send(JSON.stringify({
        email: input.value,
        source: document.title
      }));

      analytics.identify(null, {
        email: input.value
      });

      return false;
    });

    if (button) {
      input.addEventListener('keydown', () => {
        if (button.hasAttribute('disabled')) {
          button.innerHTML = 'Subscribe';
          button.removeAttribute('disabled');
        }
      });
    }
  });
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

function $ (q) { return document.querySelector(q); }
function $$ (q) { return Array.from(document.querySelectorAll(q)); }
