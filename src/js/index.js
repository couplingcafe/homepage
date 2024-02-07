document.addEventListener('DOMContentLoaded', () => {
  console.log('Loaded');
  initAnalytics();
  initLoaded();
  initViewportAnimations();
});

function initAnalytics () {
  if (window.location.host.startsWith('localhost')) { return; }

  $$('button').forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('Subscribe button click.');
      analytics.track('Home Page: Button Click', {
        id: btn.getAttribute('data-track') || btn.getAttribute('id')
      });
    });
  });

  $$('a').forEach(link => {
    link.addEventListener('click', () => {
      analytics.track('Home Page: Link Click', {
        id: link.getAttribute('data-track') || link.getAttribute('id'),
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
