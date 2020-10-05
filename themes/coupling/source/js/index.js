document.addEventListener('DOMContentLoaded', () => {
  initHumbleWidget();
  initLoaded();
  initSubscribeForm();
  initUploadForm();
  initViewportAnimations();
});

function initLoaded() {
  if (!document.getElementById('heroImage'))
  {
    document.body.classList.add('loaded');
    return;
  }

  if (!document.getElementById('heroImage').loaded) {
    document.getElementById('heroImage').onload = () => {
      document.body.classList.add('loaded');
    };
  } else {
    document.body.classList.add('loaded');
  }
}

/**
 * Init XHR handler to subscribe.
 */
function initSubscribeForm () {
  const form = document.querySelector('.subscribeForm');
  if (!form) { return; }

  const button = form.querySelector('.submit');
  const input = form.querySelector('input[type="email"]');
  const newsletterHeader = document.querySelector('#newsletterForm > h2');

  let originalHeaderText = '';
  if (newsletterHeader) {
    originalHeaderText = newsletterHeader.innerHTML;
  }

  form.addEventListener('submit', evt => {
    evt.preventDefault();

    // supermedium/superchimp
    const xhr = new XMLHttpRequest();
    let endpoint = 'http://localhost:5000/mail/subscribe';
    if (process.env.NODE_ENV === 'production') {
      endpoint = 'https://supermedium.com/mail/subscribe';
    }
    xhr.open('POST', endpoint);

    // Get group (product interest).
    let group = '';
    if (document.querySelector('[name="group"]')) {
      group = document.querySelector('[name="group"]').value;
    }

    xhr.addEventListener('load', () => {
      if (parseInt(xhr.status, 10) !== 200) {
        window.location.href = 'https://supermedium/subscribe/';
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
      email: document.querySelector('[name="email"]').value,
      group: group,
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

function initHumbleWidget () {
  if (document.body.dataset.type !== 'index') { return; }

  const paymentClass = 'paymentVisible';
  const widget = document.getElementById('humbleWidget');
  let widgetLoaded = false;

  // Show widget.
  const buyBtns = Array.from(document.querySelectorAll('.purchaseButton'));
  buyBtns.forEach(btn => btn.addEventListener('click', () => {
    document.body.classList.add(paymentClass);
  }));

  // Hide until load to prevent flashes.
  if (!widgetLoaded) {
    widget.style.opacity = 0;
    widget.onload = () => {
      widgetLoaded = true;
      widget.style.opacity = 1
    };
    widget.setAttribute('src', widget.dataset.src);
  }

  // Escape.
  document.addEventListener('keydown', evt => {
    if (evt.keyCode == 27) { document.body.classList.remove(paymentClass); }
  });

  // Click to close.
  document.body.addEventListener('click', evt => {
    if (evt.target.closest('.purchaseButton')) { return; }
    if (!document.body.classList.contains(paymentClass)) { return; }

    if (!evt.target.closest('#humbleWidget')) {
      document.body.classList.remove(paymentClass);
    }
  });
}

function initUploadForm() {
  if (document.body.dataset.type !== 'upload') { return; }

  const endpoint = process.env.NODE_ENV === 'production'
    ? 'https://supermedium.com/api/v1/cosmic'
    : 'http://localhost:51934/api/v1/cosmic';

  const codeInput = document.getElementById('codeInput');
  const codeReset = document.getElementById('uploadCodeReset');
  const codeSubmit = document.getElementById('codeSubmit');
  const codeSubmitText = codeSubmit.innerHTML;
  const fileInput = document.getElementById('uploadFileInput') ;
  const formContainer = document.getElementById('uploadFormContainer');
  const progressContainer = document.getElementById('uploadProgressContainer');
  const progressDetails = document.getElementById('uploadProgressDetails');
  const progressMask = document.getElementById('uploadProgressMask');
  const progressText = document.getElementById('uploadProgressText');
  let isDragging = false;

  // Reuse last session code. will be an button to clear it.
  let code = localStorage.getItem('uploadCode');
  if (code) {
    formContainer.dataset.state = 'codeAccepted';
    codeReset.querySelector('b').innerHTML = code;
  }

  // Verify code with server.
  codeSubmit.addEventListener('click', evt => {
    evt.preventDefault();
    codeSubmit.disabled = true;
    codeSubmit.innerHTML = 'Verifying...';

    fetch(`${endpoint}/code/${codeInput.value}`, {
      cors: 'no-cors'
    }).then(res => {
      codeSubmit.removeAttribute('disabled');
      if (res.status === 404) {
        formContainer.dataset.state = 'errorInvalid';
        codeSubmit.innerHTML = 'Verify Upload Code';
        return;
      }

      // Success.
      formContainer.dataset.state = 'codeAccepted';
      code = codeInput.value;
      localStorage.setItem('uploadCode', code);
      codeReset.querySelector('b').innerHTML = code;
    }).catch(err => {
      formContainer.dataset.state = 'errorServer';
      codeSubmit.innerHTML = codeSubmitText;
      codeSubmit.removeAttribute('disabled');
    });
  });

  // Show feedback on drag enter.
  formContainer.addEventListener('dragenter', evt => {
    isDragging = true;
    formContainer.classList.add('uploadFormDragEnter');
    evt.preventDefault();
    evt.stopPropagation();
  });

  // dragleave is weird and fires when I don't want it to.
  formContainer.addEventListener('dragover', evt => {
    isDragging = true;
    evt.preventDefault();
    evt.stopPropagation();
  });

  // Remove feedback on drag leave.
  formContainer.addEventListener('dragleave', evt => {
    isDragging = false;
    setTimeout(() => {
      if (isDragging) { return; }
      formContainer.classList.remove('uploadFormDragEnter');
    }, 250);
    evt.preventDefault();
    evt.stopPropagation();
  });

  // Upload using drop.
  formContainer.addEventListener('drop', evt => {
    evt.preventDefault();
    evt.stopPropagation();
    formContainer.classList.remove('uploadFormDragEnter');
    upload(evt.dataTransfer.files);
  });

  // Trigger underlying file input when clicking out special input.
  formContainer.addEventListener('click', () => {
    if (formContainer.dataset.state !== 'codeAccepted') { return; }
    if (formContainer.classList.contains('fileFormUploading')) { return; }
    fileInput.click();
  });

  // Upload using traditional file input method.
  fileInput.addEventListener('change', evt => {
    evt.preventDefault();
    evt.stopPropagation();
    upload(fileInput.files);
  });

  codeReset.addEventListener('click', () => {
    localStorage.setItem('uploadCode', '');
    window.location.reload();
  });

  // Do the upload!
  function upload (files) {
    const validatedFiles = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].name.match(/(\.cbr)|(\.cbz)|(\.zip)$/)) {
        validatedFiles.push(files[i]);
      }
    }

    files = validatedFiles;
    if (!files.length) {
      // TODO: Show error.
      return;
    }

    formContainer.classList.add('fileFormUploading');

    const bytesLoaded = [];
    const bytesTotal = [];
    let filesLoaded = 0;

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('code', code);
      formData.append(`file`, files[i]);

      const detail = document.createElement('p');
      detail.innerHTML = `<i class="fas fa-spinner uploadSpinner"></i><span>${files[i].name}</span>`;
      progressDetails.appendChild(detail);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${endpoint}/upload`);
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          progressText.innerHTML = `${++filesLoaded}/${files.length} files uploaded`
          detail.innerHTML = `<i class="fas fa-check uploadCheckmark"></i><span>${files[i].name}</span>`;
          if (filesLoaded === files.length) {
            progressContainer.classList.add('uploadComplete');
          }
        }
      });

      // Update progress bar.
      progressText.innerHTML = `0/${files.length} files uploaded`
      xhr.upload.onprogress = function (evt) {
        bytesLoaded[i] = evt.loaded;
        bytesTotal[i] = evt.total;
        let loaded = 0;
        let total = 0;
        for (let j = 0; j < bytesLoaded.length; j++) {
          loaded += bytesLoaded[j];
          total += bytesTotal[j];
        }
        progressMask.style.transform = `scaleX(${1 - (loaded / total)})`;
      };

      xhr.send(formData);
    }
  }
}

function initViewportAnimations() {
  const iconTextSections = document.querySelectorAll('.iconText');
  const screenshots = document.querySelectorAll('.screenshot');

  setInterval(() => {
    const height = window.innerHeight || document.documentElement.clientHeight;

    for (let i = 0; i < iconTextSections.length; i++) {
      if (iconTextSections[i].classList.contains('iconTextSectionVisible')) { continue; }
      const bounding = iconTextSections[i].getBoundingClientRect();
      if (bounding.top + (bounding.height / 2) >= 0 &&
          bounding.top + (bounding.height / 2) <= height) {
        iconTextSections[i].classList.add('iconTextSectionVisible');
      }
    }

    for (let i = 0; i < screenshots.length; i++) {
      if (screenshots[i].classList.contains('screenshotVisible')) { continue; }
      const bounding = screenshots[i].getBoundingClientRect();
      if (bounding.top + (bounding.height / 2) >= 0 &&
          bounding.top + (bounding.height / 2) <= height) {
        screenshots[i].classList.add('screenshotVisible');
      }
    }
  }, 100);
}
