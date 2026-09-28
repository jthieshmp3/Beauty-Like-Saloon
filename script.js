/* ================================================================
   AMMA'S 70TH — script.js
   Vanilla JS only. No framework, no library, no build step.
   
   Sections:
   1. Reduced-motion detection
   2. Main site dim-on-load (graceful fallback)
   3. Scene 1 -> main transition
   4. Scroll-triggered fade-ins (IntersectionObserver)
   5. Photo carousel dots (mobile)
   6. RSVP form logic
      6a. Attendance toggle
      6b. Meal counters
      6c. Character counter
      6d. Validation helpers
      6e. Submit handler (FRONTEND PREVIEW ONLY - see TODO)
   7. Smooth scroll for inline CTAs
   ================================================================ */


/* ── 1. REDUCED-MOTION ─────────────────────────────────────────── */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* ── 2. DIM MAIN ON LOAD ───────────────────────────────────────── */
// Hide #main immediately so the secret overlay covers it cleanly.
// Without JS this class is never added, so the page is readable.
const mainEl = document.getElementById('main');
if (mainEl) mainEl.classList.add('dim');


/* ── 3. SCENE 1 -> MAIN TRANSITION ────────────────────────────── */
const secretEl = document.getElementById('secret');
const btnOpen  = document.getElementById('btn-open');

if (btnOpen) {
  btnOpen.addEventListener('click', function () {
    if (!mainEl) return;

    if (reducedMotion) {
      // Instant swap — no animation
      secretEl.style.display = 'none';
      mainEl.classList.remove('dim');
      mainEl.classList.add('revealed');
      initFadeIns();
      return;
    }

    // 1. Start curtain lifting (secret slides up)
    secretEl.classList.add('exiting');

    // 2. Slightly after curtain starts rising, fade in main beneath it
    setTimeout(function () {
      mainEl.classList.remove('dim');
      mainEl.classList.add('revealed');
    }, 180);

    // 3. After curtain finishes, remove it from layout & start fade-ins
    secretEl.addEventListener('animationend', function () {
      secretEl.hidden = true;
      initFadeIns();
    }, { once: true });
  });
}


/* ── 4. SCROLL-TRIGGERED FADE-INS ─────────────────────────────── */
// Elements with class .fi fade up into view as they scroll into the viewport.
// Called after the reveal so hero elements trigger immediately.
function initFadeIns() {
  const els = document.querySelectorAll('.fi');
  if (!els.length) return;

  if (reducedMotion) {
    // Just make everything visible immediately
    els.forEach(function (el) { el.classList.add('up'); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  els.forEach(function (el) { observer.observe(el); });
}


/* ── 5. PHOTO LIGHTBOX (TAP-TO-ENLARGE) ────────────────────────── */
(function () {
  var lightbox     = document.getElementById('lightbox-modal');
  var lightboxImg  = document.getElementById('lightbox-img');
  var lightboxTit  = document.getElementById('lightbox-title');
  var lightboxCap  = document.getElementById('lightbox-caption');
  var lightboxCls  = document.getElementById('lightbox-close');
  var momentCards  = document.querySelectorAll('.moment-item[data-img-src]');
  var lastActiveEl = null;

  if (!lightbox || !lightboxImg) return;

  function openLightbox(card) {
    var src   = card.getAttribute('data-img-src');
    var title = card.getAttribute('data-img-title') || '';
    var cap   = card.getAttribute('data-img-caption') || '';
    var alt   = card.querySelector('img') ? card.querySelector('img').getAttribute('alt') : title;

    lastActiveEl = card;
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightboxTit.textContent = title;
    lightboxCap.textContent = cap;

    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    if (lightboxCls) lightboxCls.focus();
  }

  function closeLightbox() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
    lightboxImg.src = '';
    if (lastActiveEl) {
      lastActiveEl.focus();
      lastActiveEl = null;
    }
  }

  momentCards.forEach(function (card) {
    card.addEventListener('click', function () { openLightbox(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(card);
      }
    });
  });

  if (lightboxCls) {
    lightboxCls.addEventListener('click', closeLightbox);
  }

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hasAttribute('hidden')) {
      closeLightbox();
    }
  });
}());


/* ── 6. RSVP FORM & BOLLYWOOD CONFIRMATION MODAL ───────────────── */
(function () {
  var form          = document.getElementById('rsvp-form');
  var statusMsgEl   = document.getElementById('rsvp-status-msg');
  var submitBtn     = document.getElementById('btn-submit');
  var btnTextEl     = submitBtn ? submitBtn.querySelector('.btn-submit-text') : null;
  var btnSpinnerEl  = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;

  // Confirmation modal elements
  var rsvpModal     = document.getElementById('rsvp-modal');
  var modalTitle    = document.getElementById('modal-title');
  var modalContent  = document.getElementById('modal-content');
  var modalCloseBtn = document.getElementById('modal-close');
  var modalDoneBtn  = document.getElementById('modal-done-btn');
  var lastFormFocus = null;

  if (!form) return;

  /* --- 6a. Attendance toggle --- */
  var btnYes     = document.getElementById('btn-yes');
  var btnNo      = document.getElementById('btn-no');
  var paxSection = document.getElementById('pax-section');
  var attendance = null; // 'yes' | 'no'

  function setAttend(val) {
    attendance = val;

    btnYes.classList.toggle('sel-yes', val === 'yes');
    btnYes.setAttribute('aria-pressed', String(val === 'yes'));

    btnNo.classList.toggle('sel-no', val === 'no');
    btnNo.setAttribute('aria-pressed', String(val === 'no'));

    if (paxSection) {
      if (val === 'yes') {
        paxSection.classList.add('open');
      } else {
        paxSection.classList.remove('open');
        vegCount = 0; nvegCount = 0;
        refreshCounters();
      }
    }
    clearErr('err-attend');
  }

  if (btnYes) btnYes.addEventListener('click', function () { setAttend('yes'); });
  if (btnNo)  btnNo.addEventListener('click',  function () { setAttend('no');  });

  /* --- 6b. Meal counters --- */
  var vegCount  = 0;
  var nvegCount = 0;
  var paxInput  = document.getElementById('f-pax');
  var vegValEl  = document.getElementById('veg-val');
  var nvegValEl = document.getElementById('nveg-val');
  var vegMinus  = document.getElementById('veg-minus');
  var vegPlus   = document.getElementById('veg-plus');
  var nvegMinus = document.getElementById('nveg-minus');
  var nvegPlus  = document.getElementById('nveg-plus');

  function totalPax() {
    if (!paxInput) return 0;
    var v = parseInt(paxInput.value, 10);
    return isNaN(v) || v < 1 ? 0 : v;
  }

  function refreshCounters() {
    if (vegValEl)  vegValEl.textContent  = vegCount;
    if (nvegValEl) nvegValEl.textContent = nvegCount;

    var total = totalPax();
    var used  = vegCount + nvegCount;

    if (vegMinus)  vegMinus.disabled  = vegCount  <= 0;
    if (nvegMinus) nvegMinus.disabled = nvegCount <= 0;
    if (vegPlus)   vegPlus.disabled   = used >= total;
    if (nvegPlus)  nvegPlus.disabled  = used >= total;
  }

  if (vegPlus)   vegPlus.addEventListener('click',   function () { vegCount++;  refreshCounters(); });
  if (vegMinus)  vegMinus.addEventListener('click',  function () { vegCount--;  refreshCounters(); });
  if (nvegPlus)  nvegPlus.addEventListener('click',  function () { nvegCount++; refreshCounters(); });
  if (nvegMinus) nvegMinus.addEventListener('click', function () { nvegCount--; refreshCounters(); });

  if (paxInput) {
    paxInput.addEventListener('input', function () {
      if (vegCount + nvegCount > totalPax()) {
        vegCount = 0; nvegCount = 0;
      }
      refreshCounters();
      clearErr('err-pax');
      clearInputErr(paxInput);
    });
  }

  /* --- 6c. Character counter for wish textarea --- */
  var wishArea  = document.getElementById('f-wish');
  var charCount = document.getElementById('char-count');
  if (wishArea && charCount) {
    wishArea.addEventListener('input', function () {
      var rem = 500 - wishArea.value.length;
      charCount.textContent = rem + ' characters remaining';
    });
  }

  /* --- 6d. Error helpers --- */
  function showErr(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
  }

  function clearErr(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = '';
    el.classList.remove('show');
  }

  function markInputErr(el) { if (el) el.classList.add('err'); }
  function clearInputErr(el){ if (el) el.classList.remove('err'); }

  var nameEl   = document.getElementById('f-name');
  var mobileEl = document.getElementById('f-mobile');

  if (nameEl)   nameEl.addEventListener('input',   function () { clearErr('err-name');   clearInputErr(nameEl);   });
  if (mobileEl) mobileEl.addEventListener('input', function () { clearErr('err-mobile'); clearInputErr(mobileEl); });

  /* --- 6e. Pop-up confirmation modal handlers --- */
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  function openConfirmationModal(attending, name, paxCount) {
    if (!rsvpModal || !modalContent) return;
    lastFormFocus = document.activeElement;

    var safeName = escapeHtml(name);

    if (attending === 'yes') {
      if (modalTitle) modalTitle.textContent = 'You’re On The Guest List!';
      modalContent.innerHTML =
        '<p>Wonderful news, <strong>' + safeName + '</strong>!</p>' +
        '<p>We have reserved <strong>' + paxCount + ' seat' + (paxCount > 1 ? 's' : '') + '</strong> ' +
        'for you at Amma’s 70th Bollywood Birthday Bash.</p>' +
        '<p>Get ready for an unforgettable night of music, celebration, and dancing!</p>';
    } else {
      if (modalTitle) modalTitle.textContent = 'We’ll Miss You, ' + safeName + '!';
      modalContent.innerHTML =
        '<p>Thank you for letting us know, <strong>' + safeName + '</strong>.</p>' +
        '<p>We’re sorry you won’t be able to celebrate with us in person, ' +
        'but your warm love and blessings will be felt on Amma’s special night.</p>';
    }

    rsvpModal.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    if (modalCloseBtn) modalCloseBtn.focus();
  }

  function closeConfirmationModal() {
    if (!rsvpModal) return;
    rsvpModal.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (lastFormFocus) {
      lastFormFocus.focus();
      lastFormFocus = null;
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeConfirmationModal);
  if (modalDoneBtn)  modalDoneBtn.addEventListener('click', closeConfirmationModal);

  if (rsvpModal) {
    rsvpModal.addEventListener('click', function (e) {
      if (e.target === rsvpModal) closeConfirmationModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && rsvpModal && !rsvpModal.hasAttribute('hidden')) {
      closeConfirmationModal();
    }
  });

  /* --- 6f. Submit handler with real validation & backend connection --- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (statusMsgEl) statusMsgEl.style.display = 'none';

    var valid = true;
    var nameVal = nameEl ? nameEl.value.trim() : '';
    var mobileVal = mobileEl ? mobileEl.value.trim() : '';

    // Validate name
    if (!nameVal) {
      showErr('err-name', 'Please enter your full name.');
      markInputErr(nameEl);
      valid = false;
    }

    // Validate mobile
    if (!mobileVal) {
      showErr('err-mobile', 'Please enter your mobile number.');
      markInputErr(mobileEl);
      valid = false;
    }

    // Validate attendance selection
    if (!attendance) {
      showErr('err-attend', 'Please let us know if you will be joining us.');
      valid = false;
    }

    // Validate pax and meals only when attending
    if (attendance === 'yes') {
      var pax = totalPax();
      if (pax < 1) {
        showErr('err-pax', 'Please enter your total number of guests (at least 1).');
        markInputErr(paxInput);
        valid = false;
      } else {
        clearErr('err-pax');
        clearInputErr(paxInput);
        if (vegCount + nvegCount !== pax) {
          showErr('err-meals',
            'Vegetarian (' + vegCount + ') + non-vegetarian (' + nvegCount + ') meals must equal total guests (' + pax + ').'
          );
          valid = false;
        } else {
          clearErr('err-meals');
        }
      }
    }

    if (!valid) {
      // Focus on first error element
      var firstErr = form.querySelector('.form-err.show, .form-input.err');
      if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Prevent repeated clicks during submission
    if (submitBtn) submitBtn.disabled = true;
    if (btnTextEl) btnTextEl.textContent = 'Sending your response...';
    if (btnSpinnerEl) btnSpinnerEl.style.display = 'inline-block';

    var wishNameEl  = document.getElementById('f-wish-name');
    var dietaryEl   = document.getElementById('f-dietary');
    var wishNameVal = (wishNameEl && wishNameEl.value.trim()) ? wishNameEl.value.trim() : nameVal;

    var payload = {
      name: nameVal,
      mobile: mobileVal,
      attendance: attendance,
      total_pax: attendance === 'yes' ? totalPax() : 0,
      veg: attendance === 'yes' ? vegCount : 0,
      non_veg: attendance === 'yes' ? nvegCount : 0,
      dietary: attendance === 'yes' && dietaryEl ? dietaryEl.value.trim() : '',
      wish: wishArea ? wishArea.value.trim() : '',
      wish_name: wishNameVal
    };

    console.log('[RSVP] Submitting payload to /api/rsvp:', payload);

    // Live backend connection to /api/rsvp
    fetch('/api/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(function (res) {
      return res.json().then(function (data) {
        return { ok: res.ok, data: data };
      }).catch(function () {
        return { ok: res.ok, data: null };
      });
    })
    .then(function (result) {
      if (result.ok && result.data && result.data.ok) {
        // Successful verified submission from backend
        openConfirmationModal(attendance, nameVal, totalPax());
        form.reset();
        attendance = null;
        if (btnYes) btnYes.classList.remove('sel-yes');
        if (btnNo)  btnNo.classList.remove('sel-no');
        if (paxSection) paxSection.classList.remove('open');
        vegCount = 0; nvegCount = 0;
        refreshCounters();
      } else {
        var errDetail = (result.data && result.data.error) ? result.data.error : 'Server returned an invalid response';
        throw new Error(errDetail);
      }
    })
    .catch(function (err) {
      console.error('[RSVP] Submission failed:', err);
      if (statusMsgEl) {
        statusMsgEl.textContent = 'Could not submit your RSVP (' + (err.message || 'Network error') + '). Please verify your details or contact the host directly.';
        statusMsgEl.style.display = 'block';
        statusMsgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    })
    .finally(function () {
      if (submitBtn) submitBtn.disabled = false;
      if (btnTextEl) btnTextEl.textContent = 'Send my response';
      if (btnSpinnerEl) btnSpinnerEl.style.display = 'none';
    });
  });

}());


/* ── 7. WISHES LOADER & SAMPLE PREVIEW ─────────────────────────── */
(function () {
  var wishesTrack = document.getElementById('wishes-track');
  if (!wishesTrack) return;

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  // Fetch live wishes from backend without overriding sample preview if empty
  fetch('/api/wishes')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data && data.ok && Array.isArray(data.wishes) && data.wishes.length > 0) {
        // Render verified live wishes from Google Sheets
        wishesTrack.innerHTML = '';
        data.wishes.forEach(function (w) {
          var article = document.createElement('article');
          article.className = 'wish-card live-wish';
          article.innerHTML =
            '<div class="wish-card-top">' +
              '<span class="wish-avatar" aria-hidden="true">&#10022;</span>' +
              '<div class="wish-author-info">' +
                '<h3 class="wish-author">' + escapeHtml(w.name) + '</h3>' +
                '<span class="wish-label">Family &amp; Friends</span>' +
              '</div>' +
            '</div>' +
            '<p class="wish-body">&ldquo;' + escapeHtml(w.wish) + '&rdquo;</p>';
          wishesTrack.appendChild(article);
        });
      }
    })
    .catch(function (err) {
      console.log('[Wishes] Live wishes query failed; sample wishes remain displayed for review.', err);
    });
}());


/* ── 8. SMOOTH SCROLL FOR INLINE CTAs ─────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
  anchor.addEventListener('click', function (e) {
    var target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

