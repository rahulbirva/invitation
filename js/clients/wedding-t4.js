/**
 * Wedding T4: Hindu gold invitation — video opening + scroll invite.
 */
(function () {
  'use strict';

  var body = document.body;
  if (!body) return;

  var sessionOpening = document.getElementById('wed4-session-opening');
  var sessionInvite = document.getElementById('wed4-session-invite');
  var introVideo = document.getElementById('wed4-intro-video');
  var ringVideo1 = document.getElementById('wed4-ring-video-1');
  var ringVideo2 = document.getElementById('wed4-ring-video-2');
  var ringVideoReverse = document.getElementById('wed4-ring-video-reverse');
  var ganapatiEl = document.getElementById('wed4-ganapati');
  var ganapatiMantraEl = document.getElementById('wed4-ganapati-mantra');
  var welcomeTextEl = document.getElementById('wed4-welcome-text');
  var coupleRingEl = document.getElementById('wed4-couple-ring');
  var nameGroomEl = document.getElementById('wed4-name-groom');
  var nameBrideEl = document.getElementById('wed4-name-bride');
  var nameAmpEl = document.querySelector('.wed4-name-amp');
  var waxSealBtn = document.getElementById('wed4-wax-seal');
  var openingHint = document.getElementById('wed4-opening-hint');
  var openingStage = document.getElementById('wed4-opening-stage');
  var openingLoader = document.getElementById('wed4-opening-loader');
  var openingLoaderFill = document.getElementById('wed4-opening-loader-fill');
  var waxGroomInitial = document.getElementById('wed4-wax-groom-initial');
  var waxBrideInitial = document.getElementById('wed4-wax-bride-initial');
  var doorVideo = document.getElementById('wed4-door-video');
  var doorTap = document.getElementById('wed4-door-tap');
  var doorTapLabel = document.getElementById('wed4-door-tap-label');
  var doorTapRing = doorTap ? doorTap.querySelector('.wed4-door-tap-ring') : null;
  var knockSfx = document.getElementById('wed4-knock-sfx');
  var doorOpenSfx = document.getElementById('wed4-door-open-sfx');
  var heroSection = document.getElementById('wed4-hero-section');
  var scrollPage = document.getElementById('wed4-scroll-page');
  var pointerTrail = document.getElementById('wed4-pointer-trail');
  var scrollHint = document.getElementById('wed4-scroll-hint');
  var audio = document.getElementById('wed4-music');
  var muteBtn = document.getElementById('wed4-mute-btn');
  var scratchSectionEl = document.getElementById('wed4-scratch-section');
  var scratchCountdownEl = document.getElementById('wed4-scratch-countdown');
  var variantPicker = document.getElementById('wed-variant-picker');

  var premiumGroomPhoto = body.getAttribute('data-groom-photo') || '';
  var premiumBridePhoto = body.getAttribute('data-bride-photo') || '';
  var premiumGalleryCount = body.getAttribute('data-gallery-count') || '3';
  var useDoorOpening = (body.getAttribute('data-opening') || '') === 'door';
  var useFlyNameAnimation = (body.getAttribute('data-hero-name-animation') || '') === 'fly';
  var knocksRequiredRaw = parseInt(body.getAttribute('data-knocks-required') || '', 10);
  var KNOCKS_REQUIRED = !isNaN(knocksRequiredRaw) && knocksRequiredRaw > 0 ? knocksRequiredRaw : 3;
  var KNOCK_ANIM_MS = 320;

  var scrollRevealsInit = false;
  var scratchInit = false;
  var openingSequenceInited = false;
  var openingStarted = false;
  var introTapStarted = false;
  var openingTransitioned = false;
  var heroAnimationsStarted = false;
  var introVideoReady = false;
  var doorVideoReady = false;
  var knockCount = 0;
  var knockBusy = false;
  var doorMusicStarted = false;
  var waxGlowTimer = null;
  var openingLoaderTimer = null;
  var openingLoaderProgress = 0;
  var inviteScrollUnlocked = false;
  var scrollHintTimer = null;
  var pointerTrailInit = false;
  var lastTrailAt = 0;
  var lastTrailX = -9999;
  var lastTrailY = -9999;
  var galleryInterval = null;
  var galleryIndex = 0;
  var countdownStarted = false;
  var activeRingVideo = null;
  var heroInView = true;
  var heroLoopWatchInit = false;
  var introKeepAliveActive = false;
  var introKeepAliveTimer = null;

  var countdownEls = {
    days: document.getElementById('wed4-countdown-days'),
    hours: document.getElementById('wed4-countdown-hours'),
    minutes: document.getElementById('wed4-countdown-minutes'),
    seconds: document.getElementById('wed4-countdown-seconds')
  };

  var SCRATCH_REVEAL_THRESHOLD = (function () {
    var raw = body.getAttribute('data-scratch-threshold') || '';
    var n = parseFloat(raw);
    if (!isNaN(n) && n > 0 && n <= 1) return n;
    return 0.3;
  })();
  var PULL_OPEN_RATIO = 0.6;
  var FLY_SETTLE_MS = 1700;
  var DROP_SETTLE_MS = 2200;
  var DROP_DURATION_MS = 2200;
  var TYPEWRITER_CHAR_MIN_MS = 14;
  var TYPEWRITER_CHAR_MAX_MS = 36;
  var GANAPATI_ZOOM_MS = 1650;
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getAttr(name, fallback) {
    var val = body.getAttribute(name);
    if (val === null || val === '') return fallback;
    return val;
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setHtml(id, value) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = value;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatParentLinesHtml(value) {
    if (!value) return '';
    var raw = String(value).replace(/&amp;/gi, '&').trim();
    var parts;
    if (raw.indexOf('|') !== -1) {
      parts = raw.split('|').map(function (s) { return s.trim(); }).filter(Boolean);
    } else if (/\r?\n/.test(raw)) {
      parts = raw.split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    } else if (/\s*(?:&| and )\s*/i.test(raw)) {
      parts = raw.split(/\s*(?:&| and )\s*/i).map(function (s) { return s.trim(); }).filter(Boolean);
    } else {
      return '<span class="wed4-parent-line">' + escapeHtml(raw) + '</span>';
    }
    return parts.map(function (part) {
      return '<span class="wed4-parent-line">' + escapeHtml(part) + '</span>';
    }).join('');
  }

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function setOpeningLoaderProgress(value) {
    openingLoaderProgress = Math.max(0, Math.min(100, value));
    if (openingLoaderFill) {
      openingLoaderFill.style.width = openingLoaderProgress.toFixed(0) + '%';
    }
  }

  function startOpeningLoader() {
    if (!openingLoader || introVideoReady) return;
    if (openingLoaderTimer) clearInterval(openingLoaderTimer);
    setOpeningLoaderProgress(10);
    openingLoaderTimer = setInterval(function () {
      if (introVideoReady) {
        clearInterval(openingLoaderTimer);
        openingLoaderTimer = null;
        return;
      }
      if (openingLoaderProgress < 88) {
        setOpeningLoaderProgress(openingLoaderProgress + randomInRange(4, 11));
      }
    }, 220);
  }

  function markIntroVideoReady() {
    if (introVideoReady) return;
    introVideoReady = true;
    if (openingLoaderTimer) {
      clearInterval(openingLoaderTimer);
      openingLoaderTimer = null;
    }
    setOpeningLoaderProgress(100);
    if (openingStage) openingStage.classList.add('is-video-ready');
    if (openingLoader) {
      setTimeout(function () {
        openingLoader.classList.add('is-hidden');
      }, 180);
    }
    paintIntroFirstFrame();
  }

  /**
   * Instagram (and some WebViews) leave a paused <video> black until play().
   * Nudge a muted play, then freeze near the first frame so the seal screen
   * shows the intro behind it before the user taps.
   */
  function paintIntroFirstFrame() {
    if (!introVideo || introTapStarted) return;

    introVideo.muted = true;
    introVideo.setAttribute('playsinline', '');
    introVideo.setAttribute('webkit-playsinline', 'true');

    function freezeNearStart() {
      if (!introVideo || introTapStarted) return;
      try {
        introVideo.pause();
        if (introVideo.currentTime > 0.15) {
          introVideo.currentTime = 0.05;
        }
      } catch (e) { /* ignore seek errors */ }
    }

    var playPromise = introVideo.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(function () {
          requestAnimationFrame(function () {
            requestAnimationFrame(freezeNearStart);
          });
        })
        .catch(function () {
          try {
            introVideo.currentTime = 0.05;
          } catch (e) { /* ignore */ }
        });
      return;
    }

    freezeNearStart();
  }

  function isBrideFirst() {
    return getAttr('data-bride-first', '') === 'true';
  }

  function applyBrideFirstOrder() {
    if (!isBrideFirst()) return;
    body.classList.add('wed4-bride-first');

    var coupleNames = document.getElementById('wed4-couple-names');
    if (coupleNames && nameGroomEl && nameBrideEl && nameAmpEl) {
      var groomIndex = Array.prototype.indexOf.call(coupleNames.children, nameGroomEl);
      var brideIndex = Array.prototype.indexOf.call(coupleNames.children, nameBrideEl);
      if (groomIndex !== -1 && brideIndex !== -1 && groomIndex < brideIndex) {
        coupleNames.insertBefore(nameBrideEl, nameGroomEl);
        coupleNames.insertBefore(nameAmpEl, nameGroomEl);
      }
    }

    var coupleCards = document.querySelector('.wed4-couple-cards');
    var groomCard = document.getElementById('wed4-groom-card');
    var brideCard = document.getElementById('wed4-bride-card');
    if (coupleCards && groomCard && brideCard) {
      var groomCardIndex = Array.prototype.indexOf.call(coupleCards.children, groomCard);
      var brideCardIndex = Array.prototype.indexOf.call(coupleCards.children, brideCard);
      if (groomCardIndex !== -1 && brideCardIndex !== -1 && groomCardIndex < brideCardIndex) {
        coupleCards.insertBefore(brideCard, groomCard);
      }
    }
  }

  function isPremium() {
    return getAttr('data-variant', '') === 'premium';
  }

  function setCoupleCardsOpen(isOpen) {
    ['wed4-groom-card', 'wed4-bride-card'].forEach(function (id) {
      var card = document.getElementById(id);
      if (!card) return;
      if (isOpen) card.classList.add('is-open');
      else card.classList.remove('is-open');
    });
  }

  function applyPremiumVariant() {
    body.setAttribute('data-variant', 'premium');
    body.classList.remove('wed4-single-scratch', 'wed4-simple-couple');
    setCoupleCardsOpen(false);
    if (premiumGroomPhoto) body.setAttribute('data-groom-photo', premiumGroomPhoto);
    if (premiumBridePhoto) body.setAttribute('data-bride-photo', premiumBridePhoto);
    body.setAttribute('data-gallery-count', premiumGalleryCount);
    body.setAttribute('data-rsvp-enabled', 'true');
    body.setAttribute('data-rsvp-slug', 'wedding-t4-demo');
    body.setAttribute(
      'data-display-name',
      getAttr('data-groom-name', 'Groom') + ' & ' + getAttr('data-bride-name', 'Bride')
    );
    hydrateCouplePhotos();
  }

  function applyStandardVariant() {
    body.removeAttribute('data-variant');
    body.classList.add('wed4-single-scratch', 'wed4-simple-couple');
    setCoupleCardsOpen(true);
    body.removeAttribute('data-groom-photo');
    body.removeAttribute('data-bride-photo');
    body.setAttribute('data-gallery-count', '0');
    body.removeAttribute('data-rsvp-enabled');
    body.removeAttribute('data-rsvp-slug');
    body.removeAttribute('data-display-name');
  }

  function dismissVariantPicker() {
    if (!variantPicker) return;
    variantPicker.classList.remove('is-active', 'is-leaving');
    variantPicker.setAttribute('aria-hidden', 'true');
  }

  function initVariantPicker(onReady) {
    if (!variantPicker || getAttr('data-variant-picker', '') !== 'true') {
      if (variantPicker && variantPicker.parentNode) {
        variantPicker.parentNode.removeChild(variantPicker);
      }
      if (typeof onReady === 'function') onReady();
      return;
    }

    var chosen = false;

    var templateId = getAttr('data-template-id', '');
    if (window.TemplatePricing && templateId) {
      window.TemplatePricing.hydrateVariantPickerPrices(templateId);
    }

    function choose(variant) {
      if (chosen) return;
      chosen = true;
      if (variant === 'premium') applyPremiumVariant();
      else applyStandardVariant();

      variantPicker.classList.add('is-leaving');
      setTimeout(function () {
        dismissVariantPicker();
        if (typeof onReady === 'function') onReady();
      }, 450);
    }

    var buttons = variantPicker.querySelectorAll('[data-variant-choice]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        choose(btn.getAttribute('data-variant-choice'));
      });
    });
  }

  /* ── Hydration ── */

  function hydrate() {
    var groom = getAttr('data-groom-name', '');
    var bride = getAttr('data-bride-name', '');
    var groomDisplay = getAttr('data-groom-display-name', groom);
    var brideDisplay = getAttr('data-bride-display-name', bride);
    var welcomeMsg = getAttr('data-welcome-message', 'We warmly welcome you to celebrate with us.');

    setText('wed4-groom-name', groom);
    setText('wed4-bride-name', bride);
    setText('wed4-groom-prefix', getAttr('data-groom-parent-prefix', ''));
    setText('wed4-bride-prefix', getAttr('data-bride-parent-prefix', ''));
    setHtml('wed4-groom-parents', formatParentLinesHtml(getAttr('data-groom-parents-name', '')));
    setHtml('wed4-bride-parents', formatParentLinesHtml(getAttr('data-bride-parents-name', '')));

    if (welcomeTextEl) {
      welcomeTextEl.setAttribute('data-full-text', welcomeMsg);
      welcomeTextEl.textContent = '';
    }
    if (nameGroomEl) nameGroomEl.setAttribute('data-full-text', groomDisplay);
    if (nameBrideEl) nameBrideEl.setAttribute('data-full-text', brideDisplay);

    hydrateWaxSeal();

    hydrateScratchDate();
    hydrateTimeline();
    hydrateVenues();
    hydrateCouplePhotos();
    hydrateContact();
    hydrateWelcome();
    hydrateCountdown();
  }

  function hydrateWaxSeal() {
    var groom = getAttr('data-groom-name', 'G');
    var bride = getAttr('data-bride-name', 'B');
    var groomInitial = getAttr('data-groom-initial', groom.charAt(0));
    var brideInitial = getAttr('data-bride-initial', bride.charAt(0));
    if (getAttr('data-wax-initial-preserve', '') !== 'true') {
      groomInitial = groomInitial.toUpperCase();
      brideInitial = brideInitial.toUpperCase();
    }

    if (waxGroomInitial) waxGroomInitial.textContent = groomInitial;
    if (waxBrideInitial) waxBrideInitial.textContent = brideInitial;
  }

  function hydrateScratchDate() {
    var dateRaw = getAttr('data-scratch-date', '') || getAttr('data-event-date', '');
    if (!dateRaw) return;
    var d = new Date(dateRaw + 'T00:00:00');
    if (isNaN(d.getTime())) return;

    var monthStyle = getAttr('data-scratch-month-short', '') === 'true' ? 'short' : 'long';
    var monthLabel = d.toLocaleDateString('en-GB', { month: monthStyle }).toUpperCase().replace(/\.$/, '');
    var dayLabel = isDayPadded() ? String(d.getDate()).padStart(2, '0') : String(d.getDate());

    setText('wed4-scratch-day-value', dayLabel);
    setText('wed4-scratch-month-value', monthLabel);
    setText('wed4-scratch-year-value', String(d.getFullYear()));
    setText('wed4-scratch-full-value', dayLabel + ' ' + monthLabel + ' ' + d.getFullYear());
  }

  function hydrateTimeline() {
    for (var i = 1; i <= 5; i++) {
      var title = getAttr('data-event-' + i + '-title', '');
      var time = getAttr('data-event-' + i + '-time', '');
      setText('wed4-event-' + i + '-title', title);
      setText('wed4-event-' + i + '-time', time);

      var item = document.querySelector('.wed4-timeline-item[data-slot="' + i + '"]');
      if (item) item.classList.toggle('is-hidden', !title && !time);
    }
  }

  function isT7VenueLayout() {
    return getAttr('data-venue-layout', '') === 't7';
  }

  function hydrateVenuesT7() {
    var tabsEl = document.getElementById('wed4-venue-tabs');
    var panelsEl = document.getElementById('wed4-venue-panels');
    var section = document.getElementById('wed4-venues-section');
    if (!tabsEl || !panelsEl || !section) return;

    var venueArtSources = [
      {
        path: '/templates%2Fshared%2Fimages%2Fwedding%20t7%2Fpink%20arch.png',
        token: '41fbbcfc-e8dc-40b9-9835-b481b54cf100'
      },
      {
        path: '/templates%2Fshared%2Fimages%2Fwedding%20t7%2Fpink%20door%202%20plain.png',
        token: '65a5b0bc-d1a6-47a1-a2cc-9c331ce0930a'
      },
      {
        path: '/templates%2Fshared%2Fimages%2Fwedding%20t7%2Fvenue%20pink%20door.png',
        token: '5402ebee-dbc0-4243-91e4-9dd7877daad3'
      }
    ];

    var count = parseInt(getAttr('data-venue-count', '0'), 10);
    if (!count) {
      count = getAttr('data-event-address', '') ? 1 : 0;
    }

    tabsEl.innerHTML = '';
    panelsEl.innerHTML = '';

    var venues = [];
    for (var i = 1; i <= count; i++) {
      var label = getAttr('data-venue-' + i + '-label', 'Venue ' + i);
      var name = getAttr('data-venue-' + i + '-name', label);
      var addressAttr = body.getAttribute('data-venue-' + i + '-address');
      var address = addressAttr === null ? getAttr('data-event-address', '') : addressAttr;
      var mapLink = getAttr('data-venue-' + i + '-map-link', getAttr('data-map-link', ''));

      if (!name && !address && !mapLink) continue;
      venues.push({
        index: i,
        label: label,
        address: address,
        mapLink: mapLink
      });
    }

    var hasMultiple = venues.length > 1;
    tabsEl.classList.toggle('is-single', !hasMultiple);

    venues.forEach(function (venue, idx) {
      var doorArt = venueArtSources[Math.min(venue.index - 1, venueArtSources.length - 1)];

      if (hasMultiple) {
        var tab = document.createElement('button');
        tab.type = 'button';
        tab.className = 'wed7-venue-tab' + (idx === 0 ? ' is-active' : '');
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        tab.setAttribute('data-venue-index', String(venue.index));
        tab.textContent = venue.label;
        tabsEl.appendChild(tab);
      }

      var panel = document.createElement('div');
      panel.className = 'wed7-venue-panel' + (idx === 0 ? ' is-active' : '');
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('data-venue-index', String(venue.index));

      var card = document.createElement('div');
      card.className = 'wed7-venue-panel-card';

      var doorWrap = document.createElement('div');
      doorWrap.className = 'wed7-venue-door-wrap';

      var doorImg = document.createElement('img');
      doorImg.className = 'wed7-venue-door';
      doorImg.setAttribute('data-storage-path', doorArt.path);
      doorImg.setAttribute('data-token', doorArt.token);
      doorImg.alt = '';
      doorImg.loading = 'lazy';
      doorImg.decoding = 'async';
      doorImg.setAttribute('aria-hidden', 'true');
      doorWrap.appendChild(doorImg);
      card.appendChild(doorWrap);

      var cardTitle = document.createElement('h3');
      cardTitle.className = 'wed7-venue-card-title';
      cardTitle.textContent = venue.label;
      card.appendChild(cardTitle);

      var addressEl = document.createElement('p');
      addressEl.className = 'wed7-venue-address';
      addressEl.textContent = venue.address;
      card.appendChild(addressEl);

      if (venue.mapLink) {
        var mapBtn = document.createElement('a');
        mapBtn.className = 'wed7-btn-map';
        mapBtn.href = venue.mapLink;
        mapBtn.target = '_blank';
        mapBtn.rel = 'noopener noreferrer';
        mapBtn.textContent = 'View on Google Maps';
        card.appendChild(mapBtn);
      }

      panel.appendChild(card);
      panelsEl.appendChild(panel);
      applyFirebaseAsset(doorImg);
    });

    if (hasMultiple) {
      tabsEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.wed7-venue-tab');
        if (!btn) return;
        switchVenueTab(btn.getAttribute('data-venue-index'));
      });
    }

    section.hidden = !panelsEl.children.length;
  }

  function hydrateVenues() {
    if (isT7VenueLayout()) {
      hydrateVenuesT7();
      return;
    }

    var tabsEl = document.getElementById('wed4-venue-tabs');
    var panelsEl = document.getElementById('wed4-venue-panels');
    var section = document.getElementById('wed4-venues-section');
    if (!tabsEl || !panelsEl || !section) return;

    var count = parseInt(getAttr('data-venue-count', '0'), 10);
    if (!count) {
      count = getAttr('data-event-address', '') ? 1 : 0;
    }

    tabsEl.innerHTML = '';
    panelsEl.innerHTML = '';
    var visibleCount = 0;

    for (var i = 1; i <= count; i++) {
      var tabLabel = getAttr('data-venue-' + i + '-label', 'Venue ' + i);
      var name = getAttr('data-venue-' + i + '-name', tabLabel);
      // Present-but-empty venue attrs mean "omit" (do not fall back to event date/address).
      var dateAttr = body.getAttribute('data-venue-' + i + '-date');
      var dateRaw = dateAttr === null ? getAttr('data-event-date', '') : dateAttr;
      var time = getAttr('data-venue-' + i + '-time', '');
      var addressAttr = body.getAttribute('data-venue-' + i + '-address');
      var address = addressAttr === null ? getAttr('data-event-address', '') : addressAttr;
      var mapLink = getAttr('data-venue-' + i + '-map-link', getAttr('data-map-link', ''));
      var mapEmbed = getAttr('data-venue-' + i + '-map-embed', getAttr('data-map-embed', ''));

      if (!name && !address && !mapLink && !mapEmbed) continue;
      visibleCount += 1;

      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'wed4-venue-tab' + (visibleCount === 1 ? ' is-active' : '');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', visibleCount === 1 ? 'true' : 'false');
      tab.setAttribute('data-venue-index', String(i));
      tab.textContent = tabLabel;
      tabsEl.appendChild(tab);

      var article = document.createElement('article');
      article.className = 'wed4-venue-panel' + (visibleCount === 1 ? ' is-active' : '');
      article.setAttribute('role', 'tabpanel');
      article.setAttribute('data-venue-index', String(i));

      var header = document.createElement('div');
      header.className = 'wed4-venue-header';

      var title = document.createElement('h3');
      title.className = 'wed4-venue-title';
      title.textContent = name || ('Venue ' + i);
      header.appendChild(title);

      var meta = document.createElement('p');
      meta.className = 'wed4-venue-meta';
      var metaParts = [];
      var longDate = formatLongDate(dateRaw);
      if (address) metaParts.push(address);
      if (longDate) metaParts.push(longDate);
      if (time) metaParts.push(time);
      meta.textContent = metaParts.join(' • ');
      if (meta.textContent) header.appendChild(meta);

      article.appendChild(header);

      var bodyWrap = document.createElement('div');
      bodyWrap.className = 'wed4-venue-body';

      if (mapEmbed) {
        var mapWrap = document.createElement('div');
        mapWrap.className = 'wed4-venue-map-wrap';

        var iframe = document.createElement('iframe');
        iframe.className = 'wed4-venue-map';
        iframe.title = (name || ('Venue ' + i)) + ' map';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.allowFullscreen = true;
        iframe.src = mapEmbed;
        mapWrap.appendChild(iframe);

        bodyWrap.appendChild(mapWrap);
      }

      if (mapLink) {
        var link = document.createElement('a');
        link.className = 'wed4-btn wed4-btn-map';
        link.href = mapLink;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Open in Google Maps';
        bodyWrap.appendChild(link);
      }

      article.appendChild(bodyWrap);
      panelsEl.appendChild(article);
    }

    tabsEl.classList.toggle('is-single', visibleCount <= 1);
    if (visibleCount > 1) {
      tabsEl.addEventListener('click', function (e) {
        var btn = e.target.closest('.wed4-venue-tab');
        if (!btn) return;
        switchVenueTab(btn.getAttribute('data-venue-index'));
      });
    }

    section.hidden = !panelsEl.children.length;
  }

  function switchVenueTab(index) {
    var t7Layout = isT7VenueLayout();
    var tabs = document.querySelectorAll(t7Layout ? '.wed7-venue-tab' : '.wed4-venue-tab');
    var panels = document.querySelectorAll(t7Layout ? '.wed7-venue-panel' : '.wed4-venue-panel');
    var currentIndex = null;

    panels.forEach(function (panel) {
      if (panel.classList.contains('is-active')) {
        currentIndex = panel.getAttribute('data-venue-index');
      }
      if (!t7Layout) {
        panel.classList.remove('is-entering-left', 'is-entering-right');
      }
    });

    tabs.forEach(function (tab) {
      var active = tab.getAttribute('data-venue-index') === index;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach(function (panel) {
      var active = panel.getAttribute('data-venue-index') === index;
      panel.classList.toggle('is-active', active);
      if (!t7Layout && active && currentIndex !== null && currentIndex !== index) {
        void panel.offsetWidth;
        panel.classList.add(parseInt(index, 10) > parseInt(currentIndex, 10) ? 'is-entering-right' : 'is-entering-left');
      }
    });
  }

  function applyClientPhotoPath(el, path) {
    if (!el || !path) return;
    el.removeAttribute('data-token');
    el.removeAttribute('src');
    el.setAttribute('data-storage-path', path);
  }

  function hasLocalPortraitSrc(el) {
    if (!el) return false;
    var src = el.getAttribute('src') || '';
    return src.length > 0 && !/^https?:/i.test(src) && !el.getAttribute('data-storage-path');
  }

  function hydrateCouplePhotos() {
    var groomPath = getAttr('data-groom-photo', '');
    var bridePath = getAttr('data-bride-photo', '');
    var groomEl = document.getElementById('wed4-groom-photo');
    var brideEl = document.getElementById('wed4-bride-photo');
    if (groomEl && groomPath && !hasLocalPortraitSrc(groomEl)) {
      applyClientPhotoPath(groomEl, groomPath);
    }
    if (brideEl && bridePath && !hasLocalPortraitSrc(brideEl)) {
      applyClientPhotoPath(brideEl, bridePath);
    }
  }

  function formatLongDate(dateRaw) {
    if (!dateRaw) return '';
    var eventDate = new Date(dateRaw + 'T00:00:00');
    if (isNaN(eventDate.getTime())) return '';
    return eventDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: isDayPadded() ? '2-digit' : 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function isDayPadded() {
    return getAttr('data-date-pad-day', '') === 'true';
  }

  function formatTelHref(phone) {
    if (!phone) return '#';
    var digits = phone.replace(/[^\d+]/g, '');
    return 'tel:' + digits;
  }

  function hydrateContact() {
    var phone1 = getAttr('data-contact-phone', '');
    var phone2 = getAttr('data-contact-phone-2', '');
    var link1 = document.getElementById('wed4-contact-link-1');
    var link2 = document.getElementById('wed4-contact-link-2');

    if (link1 && phone1) {
      link1.href = formatTelHref(phone1);
      link1.setAttribute('aria-label', 'Call ' + phone1);
      link1.textContent = phone1;
    }

    if (link2) {
      if (phone2) {
        link2.href = formatTelHref(phone2);
        link2.setAttribute('aria-label', 'Call ' + phone2);
        link2.textContent = phone2;
        link2.hidden = false;
      } else {
        link2.hidden = true;
      }
    }
  }

  function getWelcomeHighlight() {
    return getAttr('data-welcome-highlight', '');
  }

  function renderWelcomeWithHighlight(el, text) {
    if (!el) return;
    var full = text == null ? '' : String(text);
    var highlight = getWelcomeHighlight();
    el.textContent = '';
    if (!highlight) {
      el.textContent = full;
      return;
    }
    var idx = full.indexOf(highlight);
    if (idx === -1) {
      el.textContent = full;
      return;
    }
    var before = full.slice(0, idx);
    var after = full.slice(idx + highlight.length);
    if (before) el.appendChild(document.createTextNode(before));
    var span = document.createElement('span');
    span.className = 'wed4-welcome-highlight';
    span.textContent = highlight;
    el.appendChild(span);
    if (after) el.appendChild(document.createTextNode(after));
  }

  function runWelcomeTypewriter(el, onComplete) {
    if (!el) {
      if (onComplete) onComplete();
      return;
    }

    var text = el.getAttribute('data-full-text') || '';
    var highlight = getWelcomeHighlight();
    el.textContent = '';

    if (!text) {
      if (onComplete) onComplete();
      return;
    }

    if (!highlight || text.indexOf(highlight) === -1) {
      runTypewriterOnEl(el, onComplete);
      return;
    }

    var highlightStart = text.indexOf(highlight);
    var highlightEnd = highlightStart + highlight.length;
    var beforeNode = document.createTextNode('');
    var span = document.createElement('span');
    span.className = 'wed4-welcome-highlight';
    var afterNode = document.createTextNode('');
    el.appendChild(beforeNode);
    el.appendChild(span);
    el.appendChild(afterNode);

    var chars = Array.from(text);
    var elapsed = 0;
    chars.forEach(function (ch, i) {
      elapsed += randomInRange(TYPEWRITER_CHAR_MIN_MS, TYPEWRITER_CHAR_MAX_MS);
      (function (index, char, delay) {
        setTimeout(function () {
          if (index < highlightStart) {
            beforeNode.textContent += char;
          } else if (index < highlightEnd) {
            span.textContent += char;
          } else {
            afterNode.textContent += char;
          }
          if (index === chars.length - 1 && onComplete) onComplete();
        }, delay);
      })(i, ch, elapsed);
    });
  }

  function hydrateWelcome() {
    renderWelcomeWithHighlight(
      document.getElementById('wed4-welcome-text-block'),
      getAttr('data-welcome-message', '')
    );
    var closingNames = getAttr('data-closing-names', '');
    if (closingNames) {
      setText('wed4-closing-names', closingNames);
    } else {
      var groom = getAttr('data-groom-name', '');
      var bride = getAttr('data-bride-name', '');
      setText('wed4-closing-names', groom + ' & ' + bride);
    }

    var blessings = getAttr('data-blessings-from', '');
    var blessingsBlock = document.getElementById('wed4-blessings');
    if (blessingsBlock) {
      setText('wed4-blessings-names', blessings || 'Friends and Family');
      blessingsBlock.hidden = false;
    }
  }

  function getCountdownTimeRaw() {
    return getAttr('data-countdown-time', '') || getAttr('data-event-1-time', '') || getAttr('data-event-time', '11:00 AM');
  }

  /** Parse "9:00 PM" / "20:49" into { hours, minutes }. Avoids Safari Date string bugs. */
  function parseClockTime(rawTime) {
    var start = (rawTime || '').split('-')[0].trim();
    var match = start.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/);
    if (!match) return { hours: 11, minutes: 0 };

    var hours = parseInt(match[1], 10);
    var minutes = parseInt(match[2], 10);
    var meridiem = match[3] ? match[3].toUpperCase() : '';

    if (meridiem === 'AM' || meridiem === 'PM') {
      if (hours === 12) hours = 0;
      if (meridiem === 'PM') hours += 12;
    }

    if (hours > 23 || minutes > 59) return { hours: 11, minutes: 0 };
    return { hours: hours, minutes: minutes };
  }

  /**
   * Build a Date for YYYY-MM-DD + clock time.
   * Optional IANA timeZone (e.g. Asia/Kolkata) so every device counts to the same moment.
   */
  function buildEventDateTime(dateRaw, timeRaw, timeZone) {
    var dateParts = (dateRaw || '').split('-');
    if (dateParts.length !== 3) return new Date(NaN);

    var year = parseInt(dateParts[0], 10);
    var month = parseInt(dateParts[1], 10);
    var day = parseInt(dateParts[2], 10);
    var clock = parseClockTime(timeRaw);

    if (!year || !month || !day) return new Date(NaN);

    if (!timeZone || typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
      return new Date(year, month - 1, day, clock.hours, clock.minutes, 0, 0);
    }

    function zoneParts(ms) {
      var map = {};
      new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).formatToParts(new Date(ms)).forEach(function (part) {
        if (part.type !== 'literal') map[part.type] = part.value;
      });
      var hour = parseInt(map.hour, 10);
      if (hour === 24) hour = 0;
      return {
        year: parseInt(map.year, 10),
        month: parseInt(map.month, 10),
        day: parseInt(map.day, 10),
        hour: hour,
        minute: parseInt(map.minute, 10),
        second: parseInt(map.second, 10)
      };
    }

    function zoneOffsetMs(ms) {
      var p = zoneParts(ms);
      var asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
      return asUtc - ms;
    }

    var utc = Date.UTC(year, month - 1, day, clock.hours, clock.minutes, 0);
    utc -= zoneOffsetMs(utc);
    utc = Date.UTC(year, month - 1, day, clock.hours, clock.minutes, 0) - zoneOffsetMs(utc);
    return new Date(utc);
  }

  function getCountdownTarget() {
    var dateRaw =
      getAttr('data-countdown-date', '') ||
      getAttr('data-primary-date', '') ||
      getAttr('data-event-date', '');
    var eventTimeRaw = getCountdownTimeRaw();
    var timeZone = getAttr(
      'data-countdown-timezone',
      getAttr('data-event-timezone', '')
    );
    var dateTime = buildEventDateTime(dateRaw, eventTimeRaw, timeZone);
    if (isNaN(dateTime.getTime())) {
      dateTime = buildEventDateTime(dateRaw, '11:00 AM', timeZone);
    }
    return { dateRaw: dateRaw, dateTime: dateTime };
  }

  function hydrateCountdown() {
    var target = getCountdownTarget();
    var eventTimeRaw = getCountdownTimeRaw();
    var timeStart = eventTimeRaw.split('-')[0].trim();
    var label = formatLongDate(target.dateRaw);
    if (label && timeStart) label += ' at ' + timeStart;
    setText('wed4-countdown-date', label);
  }

  function startCountdown() {
    if (!countdownEls.days || countdownStarted) return;
    var target = getCountdownTarget();
    var dateTime = target.dateTime;
    if (isNaN(dateTime.getTime())) return;
    countdownStarted = true;

    function tick() {
      var diff = dateTime.getTime() - Date.now();
      if (diff <= 0) {
        countdownEls.days.textContent = '0';
        countdownEls.hours.textContent = '0';
        countdownEls.minutes.textContent = '0';
        countdownEls.seconds.textContent = '0';
        return;
      }
      var s = Math.floor(diff / 1000);
      countdownEls.days.textContent = String(Math.floor(s / 86400));
      countdownEls.hours.textContent = String(Math.floor((s % 86400) / 3600));
      countdownEls.minutes.textContent = String(Math.floor((s % 3600) / 60));
      countdownEls.seconds.textContent = String(s % 60);
    }

    tick();
    setInterval(tick, 1000);
  }

  function revealScratchCountdown() {
    if (!scratchCountdownEl || scratchCountdownEl.classList.contains('is-visible')) {
      startCountdown();
      return;
    }

    scratchCountdownEl.removeAttribute('aria-hidden');
    if (scratchSectionEl) scratchSectionEl.classList.add('is-countdown-visible');
    scratchCountdownEl.classList.add('is-visible');

    if (prefersReducedMotion) {
      scratchCountdownEl.classList.add('is-dropping');
      startCountdown();
      return;
    }

    requestAnimationFrame(function () {
      scratchCountdownEl.classList.add('is-dropping');
      startCountdown();
    });
  }

  function spawnTrailParticle(x, y) {
    if (!pointerTrail || prefersReducedMotion) return;
    var particle = document.createElement('span');
    var glyphs = ['✦', '✧', '♥', '❋'];
    particle.className = 'wed4-trail-particle';
    particle.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    particle.style.left = x.toFixed(1) + 'px';
    particle.style.top = y.toFixed(1) + 'px';
    particle.style.fontSize = randomInRange(0.8, 1.3).toFixed(2) + 'rem';
    particle.style.animationDuration = randomInRange(650, 980).toFixed(0) + 'ms';
    particle.style.color = Math.random() > 0.25 ? 'var(--wed4-gold-light)' : 'var(--wed4-gold)';
    pointerTrail.appendChild(particle);
    setTimeout(function () {
      if (particle.parentNode) particle.parentNode.removeChild(particle);
    }, 1100);
  }

  function maybeSpawnTrail(x, y) {
    if (!pointerTrail || !sessionInvite || !sessionInvite.classList.contains('is-active')) return;
    var now = Date.now();
    var dx = x - lastTrailX;
    var dy = y - lastTrailY;
    if (now - lastTrailAt < 45 && (dx * dx + dy * dy) < 196) return;
    lastTrailAt = now;
    lastTrailX = x;
    lastTrailY = y;
    spawnTrailParticle(x + randomInRange(-8, 8), y + randomInRange(-8, 8));
  }

  function initPointerTrail() {
    if (pointerTrailInit || !pointerTrail || !scrollPage || prefersReducedMotion) return;
    pointerTrailInit = true;

    scrollPage.addEventListener('pointermove', function (e) {
      maybeSpawnTrail(e.clientX, e.clientY);
    }, { passive: true });

    scrollPage.addEventListener('touchmove', function (e) {
      var touch = e.touches && e.touches[0];
      if (!touch) return;
      maybeSpawnTrail(touch.clientX, touch.clientY);
    }, { passive: true });

    scrollPage.addEventListener('pointerdown', function (e) {
      maybeSpawnTrail(e.clientX, e.clientY);
      spawnTrailParticle(e.clientX + randomInRange(-10, 10), e.clientY + randomInRange(-10, 10));
    }, { passive: true });
  }

  function lockInviteScroll() {
    inviteScrollUnlocked = false;
    if (!scrollPage) return;
    scrollPage.classList.add('is-locked');
    scrollPage.scrollTop = 0;
    hideScrollHint();
  }

  function unlockInviteScroll() {
    inviteScrollUnlocked = true;
    if (!scrollPage) return;
    scrollPage.classList.remove('is-locked');
    maybeShowScrollHint();
  }

  function hideScrollHint() {
    if (scrollHintTimer) {
      clearTimeout(scrollHintTimer);
      scrollHintTimer = null;
    }
    if (scrollHint) scrollHint.hidden = true;
  }

  function maybeShowScrollHint() {
    if (!scrollPage || !scrollHint || !inviteScrollUnlocked) return;
    hideScrollHint();
    scrollHintTimer = setTimeout(function () {
      if (!inviteScrollUnlocked || !scrollPage || scrollPage.scrollTop > 8) return;
      scrollHint.hidden = false;
    }, 900);
  }

  function initScrollHint() {
    if (!scrollPage || !scrollHint) return;
    scrollPage.addEventListener('scroll', function () {
      if (scrollPage.scrollTop > 8) hideScrollHint();
    }, { passive: true });
    scrollHint.addEventListener('click', function () {
      if (!scrollPage || !inviteScrollUnlocked) return;
      hideScrollHint();
      scrollPage.scrollTo({ top: Math.min(220, scrollPage.scrollHeight), behavior: 'smooth' });
    });
  }

  /* ── Sessions ── */

  function showSession(target) {
    [sessionOpening, sessionInvite].forEach(function (node) {
      if (!node) return;
      var isTarget = node === target;
      node.classList.toggle('is-active', isTarget);
      if (isTarget) node.removeAttribute('aria-hidden');
      else node.setAttribute('aria-hidden', 'true');
    });

    if (target === sessionInvite) {
      body.classList.add('wed4-invite-active');
      lockInviteScroll();
      showMuteButton(true);
      initHeroLoopWatch();
      if (!scrollRevealsInit) {
        initScrollReveals();
        scrollRevealsInit = true;
      }
      if (!scratchInit) {
        initScratchCards();
        scratchInit = true;
      }
      initPullReveal();
      initGallery();
      initT6StyleGallery();
      initTimelineFlower();
      initRsvp();
      initPointerTrail();
      initScrollHint();
      scheduleMusicStart();
    }
  }

  function transitionToInvite() {
    if (openingTransitioned) return;
    openingTransitioned = true;
    pauseOpeningVideos();
    showSession(sessionInvite);
    if (scrollPage) scrollPage.scrollTop = 0;
  }

  function showCoupleRing() {
    if (coupleRingEl) coupleRingEl.classList.add('is-visible');
  }

  function showHeroContentImmediate() {
    if (heroAnimationsStarted) return;
    heroAnimationsStarted = true;
    if (heroSection) heroSection.classList.add('is-ready');
    if (ganapatiEl) ganapatiEl.classList.add('is-visible');
    if (ganapatiMantraEl) ganapatiMantraEl.classList.add('is-visible');
    if (welcomeTextEl) {
      renderWelcomeWithHighlight(welcomeTextEl, welcomeTextEl.getAttribute('data-full-text') || '');
      welcomeTextEl.classList.add('is-typed');
    }
    showCoupleRing();
    if (nameGroomEl) nameGroomEl.textContent = nameGroomEl.getAttribute('data-full-text') || '';
    if (nameBrideEl) nameBrideEl.textContent = nameBrideEl.getAttribute('data-full-text') || '';
    if (nameAmpEl) nameAmpEl.classList.add('is-visible');
    unlockInviteScroll();
  }

  function runTypewriterOnEl(el, onComplete) {
    if (!el) {
      if (onComplete) onComplete();
      return;
    }

    var text = el.getAttribute('data-full-text') || '';
    el.textContent = '';

    if (!text) {
      if (onComplete) onComplete();
      return;
    }

    var chars = Array.from(text);
    var elapsed = 0;
    chars.forEach(function (ch, i) {
      elapsed += randomInRange(TYPEWRITER_CHAR_MIN_MS, TYPEWRITER_CHAR_MAX_MS);
      (function (index, char, delay) {
        setTimeout(function () {
          el.textContent += char;
          if (index === chars.length - 1 && onComplete) onComplete();
        }, delay);
      })(i, ch, elapsed);
    });
  }

  function startHeroTextAnimations() {
    if (heroAnimationsStarted) return;
    heroAnimationsStarted = true;

    if (ganapatiEl) ganapatiEl.classList.add('is-visible');
    if (ganapatiMantraEl) ganapatiMantraEl.classList.add('is-visible');

    setTimeout(function () {
      if (!welcomeTextEl) {
        showCoupleRing();
        startNameDropAnimations();
        return;
      }

      var fullText = welcomeTextEl.getAttribute('data-full-text') || '';
      welcomeTextEl.setAttribute('data-full-text', fullText);
      welcomeTextEl.textContent = '';
      welcomeTextEl.classList.add('is-typing');
      runWelcomeTypewriter(welcomeTextEl, function () {
        welcomeTextEl.classList.remove('is-typing');
        welcomeTextEl.classList.add('is-typed');
        showCoupleRing();
        startNameDropAnimations();
      });
    }, Math.round(GANAPATI_ZOOM_MS * 0.72));
  }

  function startNameDropAnimations() {
    if (useFlyNameAnimation) {
      startNameFlyAnimations();
      return;
    }

    var firstNameEl = isBrideFirst() ? nameBrideEl : nameGroomEl;
    var secondNameEl = isBrideFirst() ? nameGroomEl : nameBrideEl;

    buildDropLetters(firstNameEl, { baseDelay: 0, stepDelay: 95, jitter: 35 });
    var firstDelay = getMaxDropDelayMs(firstNameEl);
    setTimeout(function () {
      if (nameAmpEl) nameAmpEl.classList.add('is-visible');
      buildDropLetters(secondNameEl, { baseDelay: 0, stepDelay: 95, jitter: 35 });
      var secondDelay = getMaxDropDelayMs(secondNameEl);
      setTimeout(function () {
        unlockInviteScroll();
      }, secondDelay);
    }, firstDelay + 280);
  }

  function startNameFlyAnimations() {
    var coupleNames = document.getElementById('wed4-couple-names');
    var firstNameEl = isBrideFirst() ? nameBrideEl : nameGroomEl;
    var secondNameEl = isBrideFirst() ? nameGroomEl : nameBrideEl;
    var firstFromLeft = !isBrideFirst();

    buildFlyLetters(firstNameEl, {
      minX: firstFromLeft ? -180 : 40,
      maxX: firstFromLeft ? -40 : 200,
      minY: -140,
      maxY: 120,
      baseDelay: 60,
      stepDelay: 58,
      jitter: 140
    });
    if (nameAmpEl) {
      nameAmpEl.classList.add('is-visible');
      buildFlyLetters(nameAmpEl, {
        minX: -80,
        maxX: 80,
        minY: -160,
        maxY: -20,
        baseDelay: 320,
        stepDelay: 60,
        jitter: 100
      });
    }
    buildFlyLetters(secondNameEl, {
      minX: firstFromLeft ? 40 : -180,
      maxX: firstFromLeft ? 200 : -40,
      minY: -120,
      maxY: 140,
      baseDelay: 200,
      stepDelay: 58,
      jitter: 140
    });

    var maxDelay = Math.max(
      getMaxFlyDelayMs(firstNameEl),
      getMaxFlyDelayMs(nameAmpEl),
      getMaxFlyDelayMs(secondNameEl)
    );

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if (coupleNames) coupleNames.classList.add('wed4-fly-active');
      });
    });

    setTimeout(function () {
      unlockInviteScroll();
    }, maxDelay + FLY_SETTLE_MS);
  }

  function preloadRing2FirstFrame() {
    if (!ringVideo2 || ringVideo2.readyState >= 2) return;
    ringVideo2.load();
    if (ringVideoReverse && ringVideoReverse.readyState < 2) ringVideoReverse.load();
  }

  function hardCutFromRing1ToRing2() {
    if (!ringVideo2) return;

    ringVideo2.currentTime = 0;
    ringVideo2.onended = onRing2Ended;
    activeRingVideo = ringVideo2;

    ringVideo2.classList.add('is-active');
    var p = ringVideo2.play();

    if (p && p.catch) p.catch(function () { /* autoplay blocked */ });

    requestAnimationFrame(function () {
      if (ringVideo1) {
        ringVideo1.pause();
        ringVideo1.classList.remove('is-active');
      }
    });
  }

  function finishOpeningToInvite() {
    if (openingTransitioned) return;
    stopIntroKeepAlive();
    hideWaxSeal();
    if (doorTap) doorTap.classList.add('is-hidden');
    if (doorVideo) {
      doorVideo.pause();
      doorVideo.classList.remove('is-active');
    }
    preloadRing2FirstFrame();
    transitionToInvite();
    if (ringVideo1 && introVideo) {
      var hidIntro = false;
      var hideIntroOnce = function () {
        if (hidIntro) return;
        hidIntro = true;
        introVideo.pause();
        introVideo.classList.remove('is-active');
      };
      ringVideo1.addEventListener('playing', function () {
        requestAnimationFrame(hideIntroOnce);
      }, { once: true });
      setTimeout(hideIntroOnce, 300);
    } else if (introVideo) {
      introVideo.pause();
      introVideo.classList.remove('is-active');
    }
    playVideo(ringVideo1);
    startHeroTextAnimations();
  }

  function onIntroEnded() {
    if (useDoorOpening) return;
    if (!introVideo && !introTapStarted) return;
    finishOpeningToInvite();
  }

  function onRing1Ended() {
    if (!ringVideo2) return;
    hardCutFromRing1ToRing2();
  }

  function onRing2Ended() {
    playVideo(ringVideoReverse);
  }

  function onRingReverseEnded() {
    playVideo(ringVideo2);
  }

  function pauseOpeningVideos() {
    stopIntroKeepAlive();
    [introVideo, doorVideo, ringVideo1].forEach(function (v) {
      if (v) {
        v.pause();
        v.classList.remove('is-active');
      }
    });
  }

  function pauseAllVideos() {
    pauseOpeningVideos();
    if (ringVideo2) {
      ringVideo2.pause();
      ringVideo2.classList.remove('is-active');
    }
    if (ringVideoReverse) {
      ringVideoReverse.pause();
      ringVideoReverse.classList.remove('is-active');
    }
  }

  /* ── Opening video sequence ── */

  function setActiveVideo(video) {
    [introVideo, ringVideo1, ringVideo2, ringVideoReverse].forEach(function (v) {
      if (!v) return;
      v.classList.toggle('is-active', v === video);
    });
  }

  function isRingVideo(video) {
    return !!video && (video === ringVideo1 || video === ringVideo2 || video === ringVideoReverse);
  }

  function hasVisibleRingVideo() {
    return [ringVideo1, ringVideo2, ringVideoReverse].some(function (v) {
      return v && v.classList.contains('is-active');
    });
  }

  function playVideo(video) {
    if (!video) return;
    if (isRingVideo(video)) {
      activeRingVideo = video;
      // iOS may not paint a swapped-in clip (hero bg shows through), so the
      // previous clip stays visible until this one fires `playing`.
      if (!hasVisibleRingVideo()) setActiveVideo(video);
    } else {
      setActiveVideo(video);
    }
    video.currentTime = 0;
    if (video === ringVideo1) video.onended = onRing1Ended;
    if (video === ringVideo2) video.onended = onRing2Ended;
    if (video === ringVideoReverse) video.onended = onRingReverseEnded;
    if (isRingVideo(video) && !isHeroLoopVisible()) return;
    var p = video.play();
    if (p && p.catch) p.catch(function () { /* autoplay blocked */ });
  }

  function isHeroLoopVisible() {
    return heroInView && !document.hidden;
  }

  function syncHeroLoopPlayback() {
    var v = activeRingVideo;
    if (!v) return;
    if (!isHeroLoopVisible()) {
      if (!v.paused) v.pause();
      return;
    }
    if (v.paused) {
      var p = v.play();
      if (p && p.catch) p.catch(function () { /* autoplay blocked */ });
    }
  }

  function initHeroLoopWatch() {
    if (heroLoopWatchInit || !heroSection) return;
    heroLoopWatchInit = true;

    [ringVideo1, ringVideo2, ringVideoReverse].forEach(function (v) {
      if (!v) return;
      v.addEventListener('playing', function () {
        if (activeRingVideo !== v || v.classList.contains('is-active')) return;
        requestAnimationFrame(function () {
          if (activeRingVideo === v) setActiveVideo(v);
        });
      });
    });

    // iOS suspends off-screen muted videos, which breaks the ring loop's
    // `ended` chain; pause while hidden and resume when the hero is back.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroInView = entries[entries.length - 1].isIntersecting;
        syncHeroLoopPlayback();
      }, { threshold: 0 }).observe(heroSection);
    }
    document.addEventListener('visibilitychange', syncHeroLoopPlayback);
    window.addEventListener('pageshow', syncHeroLoopPlayback);
  }

  function buildDropLetters(lineEl, options) {
    if (!lineEl) return;
    var text = (lineEl.getAttribute('data-full-text') || lineEl.textContent || '').trim();
    if (!text) return;

    lineEl.setAttribute('data-full-text', text);
    lineEl.innerHTML = '';
    lineEl.classList.add('wed4-drop-line');

    Array.from(text).forEach(function (ch, i) {
      var span = document.createElement('span');
      span.className = 'wed4-drop-letter';
      span.textContent = ch === ' ' ? '\u00a0' : ch;
      var delay = options.baseDelay + i * options.stepDelay + randomInRange(0, options.jitter || 0);
      span.style.setProperty('--delay', delay.toFixed(0) + 'ms');
      lineEl.appendChild(span);
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        lineEl.querySelectorAll('.wed4-drop-letter').forEach(function (span) {
          var top = span.getBoundingClientRect().top;
          span.style.setProperty('--drop-from', (-top + 6) + 'px');
          span.classList.add('is-dropping');
        });
      });
    });
  }

  function getMaxDropDelayMs(container) {
    var maxDelayMs = 0;
    if (!container) return maxDelayMs;
    container.querySelectorAll('.wed4-drop-letter').forEach(function (letter) {
      var delayRaw = letter.style.getPropertyValue('--delay') || '0ms';
      var delay = parseFloat(delayRaw);
      if (!isNaN(delay) && delay > maxDelayMs) maxDelayMs = delay;
    });
    return maxDelayMs + DROP_DURATION_MS;
  }

  function buildFlyLetters(lineEl, options) {
    if (!lineEl) return;
    var text = (lineEl.getAttribute('data-full-text') || lineEl.textContent || '').trim();
    if (!text) return;

    lineEl.setAttribute('data-full-text', text);
    lineEl.innerHTML = '';
    lineEl.classList.add('wed4-fly-line');

    Array.from(text).forEach(function (ch, i) {
      var span = document.createElement('span');
      span.className = 'wed4-fly-letter';
      span.textContent = ch === ' ' ? '\u00a0' : ch;
      span.style.setProperty('--sx', randomInRange(options.minX, options.maxX).toFixed(0) + 'px');
      span.style.setProperty('--sy', randomInRange(options.minY, options.maxY).toFixed(0) + 'px');
      span.style.setProperty('--rot', randomInRange(-35, 35).toFixed(1) + 'deg');
      var delay = options.baseDelay + i * options.stepDelay + randomInRange(0, options.jitter);
      span.style.setProperty('--delay', delay.toFixed(0) + 'ms');
      lineEl.appendChild(span);
    });
  }

  function getMaxFlyDelayMs(container) {
    var maxDelayMs = 0;
    if (!container) return maxDelayMs;
    container.querySelectorAll('.wed4-fly-letter').forEach(function (letter) {
      var delayRaw = letter.style.getPropertyValue('--delay') || '0ms';
      var delay = parseFloat(delayRaw);
      if (!isNaN(delay) && delay > maxDelayMs) maxDelayMs = delay;
    });
    return maxDelayMs;
  }

  function hideWaxSeal() {
    if (waxGlowTimer) {
      clearTimeout(waxGlowTimer);
      waxGlowTimer = null;
    }
    if (waxSealBtn) {
      waxSealBtn.classList.remove('is-glowing');
      waxSealBtn.classList.add('is-hidden');
      waxSealBtn.disabled = true;
    }
    if (openingHint) openingHint.classList.add('is-hidden');
  }

  function shouldKeepIntroPlaying() {
    return !!(introTapStarted && !openingTransitioned && introVideo && !introVideo.ended);
  }

  function getSealLiftMs() {
    if (!waxSealBtn) return 5200;
    var raw = (window.getComputedStyle(waxSealBtn).getPropertyValue('--wed4-seal-lift-ms') || '').trim();
    if (!raw) return 5200;
    var value = parseFloat(raw);
    if (isNaN(value)) return 5200;
    if (/ms$/i.test(raw)) return value;
    if (/s$/i.test(raw)) return value * 1000;
    return value;
  }

  function getWaxSealLiftAnimation() {
    if (!waxSealBtn || typeof waxSealBtn.getAnimations !== 'function') return null;
    var anims = waxSealBtn.getAnimations();
    for (var i = 0; i < anims.length; i++) {
      var anim = anims[i];
      if (anim && anim.animationName === 'wed4SealLift') return anim;
    }
    return anims[0] || null;
  }

  function pauseWaxSealLift() {
    var anim = getWaxSealLiftAnimation();
    if (anim && anim.playState === 'running') anim.pause();
  }

  /**
   * Keep the wax-seal CSS lift locked to intro video time.
   * Mobile browsers pause <video> when the app is backgrounded, but CSS
   * animations keep advancing on wall-clock — so without this the seal
   * finishes while the envelope video resumes mid-open.
   */
  function syncWaxSealLiftWithIntro(forceSyncTime) {
    if (!introTapStarted || openingTransitioned || !waxSealBtn) return;
    if (!waxSealBtn.classList.contains('is-opening') || waxSealBtn.classList.contains('is-hidden')) return;

    var anim = getWaxSealLiftAnimation();
    if (!anim) return;

    var liftMs = getSealLiftMs();
    var videoMs = introVideo ? Math.max(0, introVideo.currentTime * 1000) : 0;
    var sealMs = Math.min(liftMs, videoMs);
    var shouldRun = !!(introVideo && !introVideo.paused && !introVideo.ended && sealMs < liftMs);

    // Pause before seeking so a finished lift can be rewound (play() alone restarts at 0).
    if (forceSyncTime !== false) {
      if (anim.playState === 'running' || anim.playState === 'finished') anim.pause();
      try {
        anim.currentTime = sealMs;
      } catch (e) { /* ignore */ }
    }

    if (shouldRun) {
      if (anim.playState !== 'running') anim.play();
    } else if (anim.playState === 'running') {
      anim.pause();
    }
  }

  function forceIntroPlay() {
    if (!shouldKeepIntroPlaying() || !introKeepAliveActive) return;
    introVideo.muted = true;
    introVideo.setAttribute('playsinline', '');
    introVideo.setAttribute('webkit-playsinline', 'true');
    var p = introVideo.play();
    if (p && typeof p.then === 'function') {
      p.catch(function () {
        syncWaxSealLiftWithIntro(true);
      });
    }
  }

  function stopIntroKeepAliveTimer() {
    if (introKeepAliveTimer) {
      clearInterval(introKeepAliveTimer);
      introKeepAliveTimer = null;
    }
  }

  function stopIntroKeepAlive() {
    introKeepAliveActive = false;
    stopIntroKeepAliveTimer();
  }

  function startIntroKeepAlive() {
    if (!introVideo) return;
    introKeepAliveActive = true;
    stopIntroKeepAliveTimer();
    introKeepAliveTimer = setInterval(function () {
      if (!shouldKeepIntroPlaying()) {
        stopIntroKeepAlive();
        return;
      }
      if (introVideo.paused && !document.hidden) {
        forceIntroPlay();
      }
    }, 500);
    forceIntroPlay();
  }

  function beginIntroPlayback() {
    if (introVideo) {
      if (introVideo.currentTime > 0.2) {
        introVideo.currentTime = 0;
      }
      setActiveVideo(introVideo);
      startIntroKeepAlive();
    } else {
      onIntroEnded();
    }
  }

  function onIntroVisibilityOrFocusChange() {
    if (!introTapStarted || openingTransitioned) return;

    // Freeze seal immediately on hide — CSS keeps ticking while video is frozen on mobile.
    if (document.hidden) pauseWaxSealLift();

    if (introKeepAliveActive && shouldKeepIntroPlaying()) {
      forceIntroPlay();
    }

    requestAnimationFrame(function () {
      syncWaxSealLiftWithIntro(true);
    });
  }

  function initIntroBackgroundPlayback() {
    if (introVideo) {
      introVideo.addEventListener('pause', function () {
        if (document.hidden) syncWaxSealLiftWithIntro(true);
        if (!introKeepAliveActive || !shouldKeepIntroPlaying()) return;
        forceIntroPlay();
      });
    }

    document.addEventListener('visibilitychange', onIntroVisibilityOrFocusChange);
    window.addEventListener('pagehide', onIntroVisibilityOrFocusChange);
    window.addEventListener('pageshow', onIntroVisibilityOrFocusChange);
    window.addEventListener('blur', onIntroVisibilityOrFocusChange);
    window.addEventListener('focus', onIntroVisibilityOrFocusChange);
  }

  function startOpeningFromSeal() {
    if (introTapStarted) return;
    introTapStarted = true;

    if (waxSealBtn) {
      waxSealBtn.disabled = true;
      waxSealBtn.classList.add('is-opening');
      waxSealBtn.classList.add('is-glowing');
    }
    if (openingHint) openingHint.classList.add('is-hidden');
    if (openingStage) openingStage.classList.add('is-playing');
    scheduleMusicStart();

    if (prefersReducedMotion) {
      hideWaxSeal();
      transitionToInvite();
      showHeroContentImmediate();
      return;
    }

    beginIntroPlayback();
    setTimeout(function () {
      if (!openingTransitioned) {
        preloadRing2FirstFrame();
        if (ringVideo1 && ringVideo1.readyState < 2) ringVideo1.load();
      }
    }, 1200);
  }

  function initWaxSealOpener() {
    if (waxSealBtn) {
      waxSealBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        startOpeningFromSeal();
      });
      waxSealBtn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startOpeningFromSeal();
        }
      });
    }
    if (openingStage) {
      openingStage.style.cursor = 'pointer';
      openingStage.addEventListener('click', function () {
        if (!introTapStarted) startOpeningFromSeal();
      });
    }
  }

  function playSfx(el) {
    if (!el) return;
    try {
      el.pause();
      el.currentTime = 0;
    } catch (e) { /* ignore */ }
    el.play().catch(function () { /* gesture may be required */ });
  }

  function startMusicAfterDoorOpenSound() {
    if (!doorOpenSfx) {
      scheduleMusicStart();
      return;
    }

    function beginSong() {
      if (doorMusicStarted) return;
      doorMusicStarted = true;
      doorOpenSfx.removeEventListener('ended', beginSong);
      scheduleMusicStart();
    }

    doorOpenSfx.addEventListener('ended', beginSong);
    playSfx(doorOpenSfx);
    window.setTimeout(beginSong, 8000);
  }

  function paintDoorFirstFrame() {
    if (!doorVideo || openingStarted) return;

    doorVideo.muted = true;
    doorVideo.setAttribute('playsinline', '');
    doorVideo.setAttribute('webkit-playsinline', 'true');

    function freezeNearStart() {
      if (!doorVideo || openingStarted) return;
      try {
        doorVideo.pause();
        if (doorVideo.currentTime > 0.15) doorVideo.currentTime = 0.05;
      } catch (e) { /* ignore */ }
    }

    var playPromise = doorVideo.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise
        .then(function () {
          requestAnimationFrame(function () {
            requestAnimationFrame(freezeNearStart);
          });
        })
        .catch(function () {
          try {
            doorVideo.currentTime = 0.05;
          } catch (e) { /* ignore */ }
        });
      return;
    }

    freezeNearStart();
  }

  function markDoorVideoReady() {
    if (doorVideoReady) return;
    doorVideoReady = true;

    if (openingLoaderTimer) {
      clearInterval(openingLoaderTimer);
      openingLoaderTimer = null;
    }

    setOpeningLoaderProgress(100);
    if (openingStage) openingStage.classList.add('is-video-ready');
    if (doorTap) {
      doorTap.hidden = false;
      doorTap.removeAttribute('hidden');
    }

    if (openingLoader) {
      window.setTimeout(function () {
        openingLoader.classList.add('is-hidden');
        openingLoader.setAttribute('aria-busy', 'false');
      }, 220);
    }

    paintDoorFirstFrame();
  }

  function updateKnockLabel() {
    if (!doorTapLabel) return;
    if (knockCount <= 0) {
      doorTapLabel.textContent = 'Knock on the door';
    } else if (knockCount < KNOCKS_REQUIRED - 1) {
      doorTapLabel.textContent = 'Knock again';
    } else if (knockCount < KNOCKS_REQUIRED) {
      doorTapLabel.textContent = KNOCKS_REQUIRED <= 2 ? 'Knock again' : 'One more knock';
    }
  }

  function playKnockFeedback() {
    playSfx(knockSfx);

    if (doorVideo) {
      doorVideo.classList.remove('is-knocking');
      void doorVideo.offsetWidth;
      doorVideo.classList.add('is-knocking');
    }
    if (doorTapRing) {
      doorTapRing.classList.remove('is-knock-flash');
      void doorTapRing.offsetWidth;
      doorTapRing.classList.add('is-knock-flash');
    }

    window.setTimeout(function () {
      if (doorVideo) doorVideo.classList.remove('is-knocking');
      if (doorTapRing) doorTapRing.classList.remove('is-knock-flash');
      knockBusy = false;
    }, KNOCK_ANIM_MS);
  }

  function startDoorOpening() {
    if (openingStarted) return;
    openingStarted = true;
    introTapStarted = true;
    knockBusy = false;

    if (doorTap) doorTap.classList.add('is-hidden');
    if (doorVideo) doorVideo.classList.remove('is-knocking');
    if (openingStage) openingStage.classList.add('is-playing');

    startMusicAfterDoorOpenSound();
    preloadRing2FirstFrame();
    if (ringVideo1) ringVideo1.load();

    if (prefersReducedMotion) {
      finishOpeningToInvite();
      return;
    }

    if (!doorVideo) {
      finishOpeningToInvite();
      return;
    }

    doorVideo.muted = false;
    doorVideo.classList.add('is-active');
    var playPromise = doorVideo.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(function () {
        doorVideo.muted = true;
        doorVideo.play().catch(function () {
          finishOpeningToInvite();
        });
      });
    }
  }

  function handleDoorKnock() {
    if (openingStarted || knockBusy) return;

    knockCount += 1;
    updateKnockLabel();

    if (knockCount < KNOCKS_REQUIRED) {
      knockBusy = true;
      playKnockFeedback();
      return;
    }

    startDoorOpening();
  }

  function initDoorOpener() {
    updateKnockLabel();

    if (doorVideo) {
      doorVideo.addEventListener('ended', finishOpeningToInvite);
      ['loadeddata', 'canplay', 'canplaythrough'].forEach(function (eventName) {
        doorVideo.addEventListener(eventName, markDoorVideoReady, { once: true });
      });

      if (doorVideo.readyState >= 2 && doorVideo.currentSrc) {
        markDoorVideoReady();
      } else {
        startOpeningLoader();
        window.setTimeout(function () {
          if (!doorVideoReady) markDoorVideoReady();
        }, 16000);
      }
    } else {
      markDoorVideoReady();
    }

    if (doorTap) {
      doorTap.addEventListener('click', function (e) {
        e.preventDefault();
        handleDoorKnock();
      });
    }

    if (doorVideo) {
      doorVideo.addEventListener('click', function () {
        if (!openingStarted) handleDoorKnock();
      });
    }
  }

  function initOpeningSequence() {
    if (openingSequenceInited) return;
    openingSequenceInited = true;

    if (useDoorOpening) {
      initDoorOpener();
      return;
    }

    openingStarted = true;

    if (introVideo) {
      introVideo.addEventListener('ended', onIntroEnded);
      ['loadeddata', 'canplay', 'canplaythrough'].forEach(function (eventName) {
        introVideo.addEventListener(eventName, markIntroVideoReady, { once: true });
      });
      if (introVideo.readyState >= 2) {
        markIntroVideoReady();
      } else {
        startOpeningLoader();
      }
    }
    initWaxSealOpener();
    initIntroBackgroundPlayback();
  }

  /* ── Scroll reveals ── */

  function initScrollReveals() {
    var reveals = document.querySelectorAll('.wed4-reveal');
    if (!reveals.length || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: scrollPage, threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    reveals.forEach(function (el) { observer.observe(el); });
  }

  /* ── Scratch cards ── */

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    var r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawScratchOverlay(ctx, width, height) {
    var gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f7edcf');
    gradient.addColorStop(0.28, '#f1d583');
    gradient.addColorStop(0.62, '#d3a130');
    gradient.addColorStop(1, '#9f7312');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    var gloss = ctx.createLinearGradient(0, 0, 0, height * 0.48);
    gloss.addColorStop(0, 'rgba(255,255,255,0.52)');
    gloss.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gloss;
    drawRoundedRect(ctx, 8, 8, width - 16, height * 0.42, 18);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 246, 221, 0.42)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, 8, 8, width - 16, height - 16, 18);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(110, 70, 9, 0.18)';
    ctx.setLineDash([3, 4]);
    drawRoundedRect(ctx, 14, 14, width - 28, height - 28, 14);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 248, 240, 0.24)';
    for (var i = 0; i < 42; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.9 + 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    var tagWidth = Math.min(width - 24, 74);
    var tagHeight = 24;
    var tagX = (width - tagWidth) / 2;
    var tagY = height * 0.54 - tagHeight / 2;

    ctx.fillStyle = 'rgba(255, 250, 241, 0.9)';
    drawRoundedRect(ctx, tagX, tagY, tagWidth, tagHeight, 12);
    ctx.fill();

    ctx.strokeStyle = 'rgba(145, 99, 12, 0.2)';
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, tagX, tagY, tagWidth, tagHeight, 12);
    ctx.stroke();

    ctx.font = '700 10px Nunito, sans-serif';
    ctx.fillStyle = 'rgba(106, 68, 12, 0.88)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Scratch Here', width / 2, tagY + tagHeight / 2);

    ctx.font = 'italic 600 11px "Cormorant Garamond", serif';
    ctx.fillStyle = 'rgba(255, 252, 244, 0.82)';
    ctx.fillText('Reveal the date', width / 2, height * 0.28);
  }

  function initSingleScratchCard(cardEl, canvasEl, onRevealed) {
    if (!cardEl || !canvasEl) return;

    var ctx = canvasEl.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      cardEl.classList.add('is-revealed');
      if (onRevealed) onRevealed();
      return;
    }

    var isDrawing = false;
    var revealed = false;
    var brushRadius = 16;
    var lastRevealCheckAt = 0;

    function resizeCanvas() {
      var rect = cardEl.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvasEl.width = rect.width * dpr;
      canvasEl.height = rect.height * dpr;
      canvasEl.style.width = rect.width + 'px';
      canvasEl.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawScratchOverlay(ctx, rect.width, rect.height);
    }

    function getPos(e) {
      var rect = canvasEl.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    function scratch(x, y) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    function getClearedPercent() {
      var w = canvasEl.width;
      var h = canvasEl.height;
      var imageData = ctx.getImageData(0, 0, w, h);
      var pixels = imageData.data;
      var total = pixels.length / 4;
      var cleared = 0;
      var step = 8;
      for (var i = 3; i < pixels.length; i += 4 * step) {
        if (pixels[i] === 0) cleared++;
      }
      return cleared / (total / step);
    }

    function checkReveal() {
      if (revealed) return;
      if (getClearedPercent() >= SCRATCH_REVEAL_THRESHOLD) {
        revealed = true;
        cardEl.classList.add('is-revealed');
        if (onRevealed) onRevealed();
      }
    }

    function onStart(e) {
      if (revealed) return;
      isDrawing = true;
      var pos = getPos(e);
      scratch(pos.x, pos.y);
      e.preventDefault();
    }

    function onMove(e) {
      if (!isDrawing || revealed) return;
      var pos = getPos(e);
      scratch(pos.x, pos.y);
      var now = Date.now();
      if (now - lastRevealCheckAt > 120) {
        lastRevealCheckAt = now;
        checkReveal();
      }
      e.preventDefault();
    }

    function onEnd() {
      if (isDrawing) checkReveal();
      isDrawing = false;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvasEl.addEventListener('mousedown', onStart);
    canvasEl.addEventListener('mousemove', onMove);
    canvasEl.addEventListener('mouseup', onEnd);
    canvasEl.addEventListener('mouseleave', onEnd);
    canvasEl.addEventListener('touchstart', onStart, { passive: false });
    canvasEl.addEventListener('touchmove', onMove, { passive: false });
    canvasEl.addEventListener('touchend', onEnd);
  }

  function launchGraffitiBurst() {
    var burst = document.getElementById('wed4-graffiti-burst');
    if (!burst) return;

    burst.classList.add('is-active');
    burst.innerHTML = '';

    var colors = ['wed4-graffiti-gold', 'wed4-graffiti-saffron', 'wed4-graffiti-cream'];
    var count = 48;

    for (var i = 0; i < count; i++) {
      var piece = document.createElement('div');
      piece.className = 'wed4-graffiti-piece ' + colors[Math.floor(Math.random() * colors.length)];
      piece.style.left = (Math.random() * 100).toFixed(2) + '%';
      piece.style.animationDelay = (Math.random() * 0.8).toFixed(2) + 's';
      piece.style.animationDuration = (2.5 + Math.random() * 2).toFixed(2) + 's';
      piece.style.width = (4 + Math.random() * 12).toFixed(2) + 'px';
      piece.style.height = (6 + Math.random() * 16).toFixed(2) + 'px';
      piece.style.setProperty('--wed4-drift-x', ((Math.random() - 0.5) * 160).toFixed(0) + 'px');
      piece.style.setProperty('--wed4-twist', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      burst.appendChild(piece);
    }

    setTimeout(function () {
      burst.classList.remove('is-active');
      burst.innerHTML = '';
    }, 5500);
  }

  function initScratchCards() {
    var cards = [];
    if (scratchSectionEl) {
      var row;
      if (isPremium()) {
        row = scratchSectionEl.querySelector('.wed4-scratch-row.wed4-premium-only')
          || scratchSectionEl.querySelector('#wed4-scratch-row');
      } else {
        row = scratchSectionEl.querySelector('.wed4-scratch-row.wed4-standard-only')
          || scratchSectionEl.querySelector('#wed4-scratch-row-single')
          || (body.classList.contains('wed4-single-scratch')
            ? scratchSectionEl.querySelector('.wed4-scratch-row')
            : null);
      }
      if (row) cards = row.querySelectorAll('.wed4-scratch-card');
    }
    var totalCards = cards.length;
    if (!totalCards) return;

    /* Opt-in: start with date + countdown already revealed (no scratching). */
    if (getAttr('data-scratch-pre-revealed', '') === 'true') {
      Array.prototype.forEach.call(cards, function (card) {
        card.classList.add('is-revealed');
      });
      var hint = scratchSectionEl.querySelector('.wed4-scratch-hint');
      if (hint) hint.hidden = true;
      revealScratchCountdown();
      return;
    }

    var revealedCount = 0;

    function onCardRevealed() {
      revealedCount++;
      if (revealedCount >= totalCards) {
        launchGraffitiBurst();
        revealScratchCountdown();
      }
    }

    Array.prototype.forEach.call(cards, function (card) {
      initSingleScratchCard(
        card,
        card.querySelector('.wed4-scratch-canvas'),
        onCardRevealed
      );
    });
  }

  /* ── Pull reveal ── */

  function initPullOnCard(cardEl, curtainEl, pullTabEl) {
    if (!cardEl || !curtainEl || !pullTabEl) return;

    var dragging = false;
    var startY = 0;
    var startRevealed = 0;
    var revealedHeight = 0;
    var activePointerId = null;
    var cardHeight = 0;

    function getClientY(e) {
      if (e.touches && e.touches.length) return e.touches[0].clientY;
      return e.clientY;
    }

    function measureCard() {
      cardHeight = cardEl.getBoundingClientRect().height;
    }

    function readRevealed() {
      var raw = curtainEl.style.getPropertyValue('--wed4-revealed-height');
      if (!raw) {
        raw = window.getComputedStyle(curtainEl).getPropertyValue('--wed4-revealed-height');
      }
      return parseFloat(raw) || 0;
    }

    function setRevealed(height) {
      revealedHeight = Math.max(0, Math.min(cardHeight, height));
      curtainEl.style.setProperty('--wed4-revealed-height', revealedHeight + 'px');
    }

    function openCard() {
      setRevealed(cardHeight);
      curtainEl.classList.add('is-open');
      cardEl.classList.add('is-open');
      curtainEl.classList.remove('is-dragging');
    }

    function onPointerDown(e) {
      if (curtainEl.classList.contains('is-open')) return;
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      activePointerId = e.pointerId;
      startY = getClientY(e);
      startRevealed = readRevealed();
      measureCard();
      curtainEl.classList.add('is-dragging');
      if (pullTabEl.setPointerCapture) {
        try { pullTabEl.setPointerCapture(e.pointerId); } catch (err) { /* no-op */ }
      }
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging || e.pointerId !== activePointerId) return;
      var dy = getClientY(e) - startY;
      if (dy > 0) {
        setRevealed(startRevealed + dy);
        if (revealedHeight >= cardHeight * PULL_OPEN_RATIO) {
          openCard();
          dragging = false;
        }
      }
      e.preventDefault();
    }

    function onPointerUp(e) {
      if (e.pointerId !== activePointerId) return;
      dragging = false;
      curtainEl.classList.remove('is-dragging');
      if (!curtainEl.classList.contains('is-open')) {
        if (revealedHeight >= cardHeight * PULL_OPEN_RATIO) {
          openCard();
        } else {
          setRevealed(0);
        }
      }
    }

    pullTabEl.addEventListener('pointerdown', onPointerDown);
    pullTabEl.addEventListener('pointermove', onPointerMove);
    pullTabEl.addEventListener('pointerup', onPointerUp);
    pullTabEl.addEventListener('pointercancel', onPointerUp);

    pullTabEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        measureCard();
        openCard();
      }
    });

    measureCard();
    setRevealed(0);
    window.addEventListener('resize', measureCard);
  }

  function openPullCardImmediate(cardEl, curtainEl) {
    if (!cardEl || !curtainEl) return;
    var height = cardEl.getBoundingClientRect().height || cardEl.offsetHeight || 0;
    curtainEl.style.setProperty('--wed4-revealed-height', height + 'px');
    curtainEl.classList.add('is-open');
    cardEl.classList.add('is-open');
  }

  function initPullReveal() {
    /* Standard: text-only couple cards — no portrait / curtain pull */
    if (body.classList.contains('wed4-simple-couple')) {
      setCoupleCardsOpen(true);
      return;
    }

    var groomCard = document.getElementById('wed4-groom-card');
    var groomCurtain = document.getElementById('wed4-groom-curtain');
    var groomPull = document.getElementById('wed4-groom-pull');
    var brideCard = document.getElementById('wed4-bride-card');
    var brideCurtain = document.getElementById('wed4-bride-curtain');
    var bridePull = document.getElementById('wed4-bride-pull');

    /* Opt-in: start with curtains already open (no pull interaction). */
    if (getAttr('data-pull-pre-revealed', '') === 'true') {
      openPullCardImmediate(groomCard, groomCurtain);
      openPullCardImmediate(brideCard, brideCurtain);
      return;
    }

    initPullOnCard(groomCard, groomCurtain, groomPull);
    initPullOnCard(brideCard, brideCurtain, bridePull);
  }

  /* ── Gallery ── */

  function isLocalAssetSrc(path) {
    return path && !path.startsWith('/') && !/^https?:/i.test(path);
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  /* Opt-in: t6 scattered-frame photo session when #wed6-together is present. */
  function shouldInitT6StyleGallery() {
    return !!document.getElementById('wed6-together');
  }

  function hydrateT6StyleGallery() {
    if (!shouldInitT6StyleGallery()) return;

    setText('wed6-gallery-title', getAttr('data-gallery-title', 'A Glimpse of Us'));

    for (var i = 1; i <= 5; i++) {
      var photo = document.getElementById('wed6-gallery-photo-' + i);
      var item = photo ? photo.closest('.wed6-gallery-item') : null;
      if (!photo) continue;

      var path = getAttr('data-gallery-' + i, '') || getAttr('data-gallery-' + i + '-photo', '');
      var localSrc = photo.getAttribute('src') || '';

      if (path) {
        if (item) item.classList.remove('is-empty');
        photo.setAttribute('data-storage-path', path);
        photo.removeAttribute('data-token');
        applyFirebaseAsset(photo);
        continue;
      }

      photo.removeAttribute('data-storage-path');
      if (localSrc) {
        if (item) item.classList.remove('is-empty');
        continue;
      }

      photo.removeAttribute('src');
      if (item) item.classList.add('is-empty');
    }
  }

  function getT6GalleryZoomProgress(track, stage) {
    if (!track || !stage || !scrollPage) return 0;
    var pageRect = scrollPage.getBoundingClientRect();
    var trackRect = track.getBoundingClientRect();
    var trackTop = trackRect.top - pageRect.top + scrollPage.scrollTop;
    var maxScroll = Math.max(1, track.offsetHeight - stage.offsetHeight);
    return clamp01((scrollPage.scrollTop - trackTop) / maxScroll);
  }

  function initT6StyleGalleryZoom() {
    if (!shouldInitT6StyleGallery()) return;

    var track = document.getElementById('wed6-gallery-track');
    var stage = document.getElementById('wed6-gallery-stage');
    var cluster = document.getElementById('wed6-gallery-cluster');
    var decor = stage ? stage.querySelector('.wed6-gallery-decor') : null;
    if (!track || !stage || !cluster || !scrollPage) return;

    var ZOOM_MAX = 2.05;
    var ticking = false;
    var curves = decor
      ? Array.prototype.slice.call(decor.querySelectorAll('.wed6-gallery-curve'))
      : [];

    var curveMotion = [
      { x: -28, y: 46, rot: -12 },
      { x: 36, y: 30, rot: 8 },
      { x: -18, y: -40, rot: 16 },
      { x: 32, y: -48, rot: -18 },
      { x: -40, y: 22, rot: 4 },
      { x: 20, y: 52, rot: -6 },
      { x: 44, y: -26, rot: 22 },
      { x: 26, y: -36, rot: -10 },
      { x: -12, y: -54, rot: -28 },
      { x: 16, y: -44, rot: 12 }
    ];

    function applyZoom(progress) {
      var zoom = 1 + progress * (ZOOM_MAX - 1);
      cluster.style.setProperty('--wed6-gallery-zoom', zoom.toFixed(4));

      curves.forEach(function (curve, i) {
        var motion = curveMotion[i] || curveMotion[0];
        var tx = (motion.x * progress).toFixed(2);
        var ty = (motion.y * progress).toFixed(2);
        curve.style.transform =
          'translate(' + tx + 'px, ' + ty + 'px) rotate(' + motion.rot + 'deg)';
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        applyZoom(getT6GalleryZoomProgress(track, stage));
      });
    }

    if (prefersReducedMotion) {
      applyZoom(0);
      return;
    }

    applyZoom(getT6GalleryZoomProgress(track, stage));
    scrollPage.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  function initT6StyleGalleryReveal() {
    if (!shouldInitT6StyleGallery()) return;

    var section = document.getElementById('wed6-together');
    if (!section) return;

    var items = Array.prototype.slice.call(
      section.querySelectorAll('.wed6-gallery-item:not(.is-empty)')
    );
    if (!items.length) return;

    function assignRandomRevealOrder() {
      var order = items.slice();
      var i;

      for (i = order.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = order[i];
        order[i] = order[j];
        order[j] = tmp;
      }

      order.forEach(function (item, index) {
        item.style.setProperty('--wed6-gallery-delay', (index * 0.4).toFixed(2) + 's');
      });
    }

    assignRandomRevealOrder();

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      section.classList.add('is-gallery-visible');
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var viewportRatio = entry.rootBounds && entry.rootBounds.height
            ? entry.intersectionRect.height / entry.rootBounds.height
            : 0;

          if (entry.isIntersecting && (entry.intersectionRatio >= 0.35 || viewportRatio >= 0.35)) {
            section.classList.add('is-gallery-visible');
            observer.unobserve(section);
          }
        });
      },
      { root: scrollPage, rootMargin: '0px', threshold: [0, 0.15, 0.35, 0.5, 0.75, 1] }
    );

    observer.observe(section);
  }

  function initT6StyleGallery() {
    if (!shouldInitT6StyleGallery()) return;
    hydrateT6StyleGallery();
    initT6StyleGalleryZoom();
    initT6StyleGalleryReveal();
  }

  function initGallery() {
    var track = document.getElementById('wed4-gallery-track');
    var dotsEl = document.getElementById('wed4-gallery-dots');
    if (!track) return;

    var count = parseInt(getAttr('data-gallery-count', '0'), 10);
    if (!count || count < 1) {
      document.getElementById('wed4-gallery-section').hidden = true;
      return;
    }
    count = Math.min(5, Math.max(1, count));

    var paths = [];
    for (var i = 1; i <= count; i++) {
      var path = getAttr('data-gallery-' + i + '-photo', '');
      if (path) paths.push(path);
    }

    if (!paths.length) {
      document.getElementById('wed4-gallery-section').hidden = true;
      return;
    }

    track.innerHTML = '';
    paths.forEach(function (path, index) {
      var slide = document.createElement('div');
      slide.className = 'wed4-gallery-slide' + (index === 0 ? ' is-active' : '');
      var img = document.createElement('img');
      if (isLocalAssetSrc(path)) {
        img.src = path;
      } else {
        img.setAttribute('data-storage-path', path);
      }
      img.alt = 'Couple photo ' + (index + 1);
      img.decoding = 'async';
      img.loading = 'lazy';
      slide.appendChild(img);
      track.appendChild(slide);
    });

    if (dotsEl && paths.length > 1) {
      dotsEl.innerHTML = '';
      paths.forEach(function (_, index) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'wed4-gallery-dot' + (index === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Photo ' + (index + 1));
        dot.addEventListener('click', function () { goToGallerySlide(index); });
        dotsEl.appendChild(dot);
      });
    } else if (dotsEl) {
      dotsEl.hidden = true;
    }

    document.querySelectorAll('#wed4-gallery-track img[data-storage-path]').forEach(function (el) {
      applyFirebaseAsset(el);
    });

    if (paths.length > 1) {
      var galleryIntervalMs = parseInt(getAttr('data-gallery-interval', '4000'), 10);
      if (!galleryIntervalMs || galleryIntervalMs < 1000) galleryIntervalMs = 4000;
      galleryIntervalMs = Math.min(galleryIntervalMs, 30000);

      galleryInterval = setInterval(function () {
        goToGallerySlide((galleryIndex + 1) % paths.length);
      }, galleryIntervalMs);
    }
  }

  function goToGallerySlide(index) {
    var slides = document.querySelectorAll('.wed4-gallery-slide');
    var dots = document.querySelectorAll('.wed4-gallery-dot');
    if (!slides.length) return;

    galleryIndex = index;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === index);
    });
  }

  /* ── Timeline flower scroll ── */

  function initTimelineFlower() {
    var flower = document.getElementById('wed4-timeline-flower');
    var timelineSection = document.getElementById('wed4-timeline-section');
    var spine = document.querySelector('.wed4-timeline-spine');
    if (!flower || !timelineSection || !scrollPage) return;

    var flowerTicking = false;
    function updateFlowerPosition() {
      var sectionRect = timelineSection.getBoundingClientRect();
      var scrollRect = scrollPage.getBoundingClientRect();
      var spineHeight = spine ? spine.offsetHeight : sectionRect.height;
      var visibleTop = Math.max(sectionRect.top, scrollRect.top);
      var visibleBottom = Math.min(sectionRect.bottom, scrollRect.bottom);
      var visibleHeight = Math.max(0, visibleBottom - visibleTop);
      var sectionVisible = visibleHeight > 0;

      if (!sectionVisible) return;

      var progress;
      if (getAttr('data-timeline-flower-follow', '') === 'true') {
        var viewportCenter = scrollRect.top + scrollRect.height / 2;
        progress = (viewportCenter - sectionRect.top) / Math.max(1, sectionRect.height);
      } else {
        progress = (sectionRect.bottom - scrollRect.bottom) / (sectionRect.height - scrollRect.height + 1);
      }
      progress = Math.max(0, Math.min(1, progress));
      var maxTravel = Math.max(0, spineHeight - 48);
      flower.style.transform = 'translate3d(-50%, ' + (progress * maxTravel).toFixed(1) + 'px, 0)';
    }

    function onFlowerScroll() {
      if (flowerTicking) return;
      flowerTicking = true;
      window.requestAnimationFrame(function () {
        flowerTicking = false;
        updateFlowerPosition();
      });
    }

    scrollPage.addEventListener('scroll', onFlowerScroll, { passive: true });
    updateFlowerPosition();
  }

  /* ── Local RSVP ── */

  function playRsvpBurst() {
    var burst = document.getElementById('wed4-rsvp-burst');
    if (!burst) return;
    if (burst.parentNode !== document.body) document.body.appendChild(burst);

    burst.innerHTML = '';
    var symbols = ['✦', '❋', '✿', '♥', '✧'];
    var shades = ['#c9a227', '#e8c547', '#f4c98b', '#d4af37', '#a67c00'];

    for (var i = 0; i < 20; i++) {
      var spark = document.createElement('span');
      spark.className = 'wed4-rsvp-spark';
      spark.textContent = symbols[i % symbols.length];
      spark.style.left = (8 + Math.random() * 84).toFixed(2) + '%';
      spark.style.bottom = (20 + Math.random() * 30).toFixed(2) + '%';
      spark.style.color = shades[i % shades.length];
      spark.style.animationDuration = (2.5 + Math.random() * 1.5).toFixed(2) + 's';
      spark.style.animationDelay = (Math.random() * 0.4).toFixed(2) + 's';
      spark.style.fontSize = (0.9 + Math.random() * 0.8).toFixed(2) + 'rem';
      burst.appendChild(spark);
    }

    setTimeout(function () { burst.innerHTML = ''; }, 4500);
  }

  function shouldUseFirebaseRsvp() {
    var form = document.getElementById('wed4-rsvp-form');
    if (!form || !window.RsvpForm || !window.RsvpStore) return false;
    if (form.classList.contains('wed4-premium-only')) return isPremium();
    return true;
  }

  function initRsvp() {
    if (shouldUseFirebaseRsvp()) {
      initFirebaseRsvp();
      return;
    }
    initLocalRsvp();
  }

  function initFirebaseRsvp() {
    window.RsvpForm.init({
      formId: 'wed4-rsvp-form',
      nameInputId: 'wed4-rsvp-name',
      guestsWrapId: 'wed4-rsvp-guests-wrap',
      guestsInputId: 'wed4-rsvp-guests',
      reasonWrapId: 'wed4-rsvp-reason-wrap',
      reasonInputId: 'wed4-rsvp-reason',
      decreaseBtnId: 'wed4-rsvp-guests-decrease',
      increaseBtnId: 'wed4-rsvp-guests-increase',
      submitButtonId: 'wed4-rsvp-submit',
      thanksId: 'wed4-rsvp-thanks',
      thanksTextId: 'wed4-rsvp-thanks-text',
      hiddenClass: 'is-hidden',
      getInviteMeta: function () {
        return {
          slug: getAttr('data-rsvp-slug', ''),
          groomName: getAttr('data-groom-name', ''),
          brideName: getAttr('data-bride-name', ''),
          displayName: getAttr('data-display-name', ''),
          templateId: getAttr('data-template-id', 'wedding-t4')
        };
      },
      getSuccessMessage: function () {
        return "Your presence means the world to us. We're excited to celebrate together!";
      },
      declineThankYou: "We're sorry you won't be able to join us, but we're grateful for your blessings and best wishes.",
      onAttendYes: playRsvpBurst
    });
  }

  function initLocalRsvp() {
    var yesBtn = document.getElementById('wed4-rsvp-yes');
    var noBtn = document.getElementById('wed4-rsvp-no');
    var buttonsWrap = document.getElementById('wed4-rsvp-buttons');
    var messageWrap = document.getElementById('wed4-rsvp-message');
    var messageText = document.getElementById('wed4-rsvp-message-text');

    function showMessage(text) {
      if (buttonsWrap) {
        buttonsWrap.hidden = true;
        buttonsWrap.style.display = 'none';
      }
      if (messageWrap) {
        messageWrap.hidden = false;
        messageWrap.style.display = 'block';
      }
      if (messageText) messageText.textContent = text;
    }

    if (yesBtn) {
      yesBtn.addEventListener('click', function () {
        playRsvpBurst();
        showMessage("Your presence means the world to us. We're excited to celebrate together!");
      });
    }

    if (noBtn) {
      noBtn.addEventListener('click', function () {
        showMessage("We're sorry you won't be able to join us, but we're grateful for your blessings and best wishes.");
      });
    }
  }

  /* ── Audio ── */

  function applyMusicVolume() {
    if (!audio) return;
    var volRaw = getAttr('data-music-volume', '');
    var vol = parseFloat(volRaw);
    if (!isNaN(vol)) audio.volume = Math.max(0, Math.min(1, vol));
  }

  function scheduleMusicStart() {
    if (!audio) return;
    applyMusicVolume();
    var p = audio.play();
    if (p && p.catch) p.catch(function () { /* needs gesture */ });
  }

  function showMuteButton(visible) {
    if (!muteBtn) return;
    muteBtn.classList.toggle('is-visible', visible);
    muteBtn.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function initMute() {
    if (!muteBtn || !audio) return;
    muteBtn.addEventListener('click', function () {
      audio.muted = !audio.muted;
      muteBtn.classList.toggle('is-muted', audio.muted);
      muteBtn.textContent = audio.muted ? '🔇' : '🔊';
      muteBtn.setAttribute('aria-label', audio.muted ? 'Unmute music' : 'Mute music');
    });
  }

  function initializeFirebaseAudio() {
    if (!audio) return;
    var source = audio.querySelector('source[data-storage-path]');
    if (!source) return;
    applyFirebaseAsset(source);
    audio.load();
  }

  /* ── Firebase assets ── */

  function encodedStoragePath(attr) {
    return attr ? attr.replace(/^\//, '') : '';
  }

  function decodedStoragePath(attr) {
    if (!attr) return '';
    var raw = attr.replace(/^\//, '');
    try {
      return decodeURIComponent(raw);
    } catch (err) {
      return raw.replace(/%2F/g, '/');
    }
  }

  function resolvePathOnlyImageUrl(storagePath, baseUrl, cb) {
    var path = decodedStoragePath(storagePath);
    var encoded = encodedStoragePath(storagePath);
    var bucket = 'my-bel0ved.firebasestorage.app';

    function setUrl(url) {
      if (url && typeof cb === 'function') cb(url);
    }

    function tryPublicMedia() {
      if (baseUrl) setUrl(baseUrl + encoded + '?alt=media');
    }

    function tryRestFallback() {
      fetch('https://firebasestorage.googleapis.com/v0/b/' + bucket + '/o/' + encoded)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var token = data && (data.downloadTokens || (data.metadata && data.metadata.firebaseStorageDownloadTokens));
          if (token) setUrl(baseUrl + encoded + '?alt=media&token=' + token);
          else tryPublicMedia();
        })
        .catch(function () { tryPublicMedia(); });
    }

    function trySdk() {
      if (!window.FirebaseStorage || !window.FirebaseStorage.getDownloadUrlByPath) {
        tryRestFallback();
        return;
      }
      window.FirebaseStorage.getDownloadUrlByPath(path)
        .then(function (url) {
          if (url) setUrl(url);
          else tryRestFallback();
        })
        .catch(function () { tryRestFallback(); });
    }

    trySdk();
    setTimeout(trySdk, 300);
  }

  var wed4AssetInitDone = false;

  function applyFirebaseAsset(el) {
    var baseUrl = window.FirebaseConfig && window.FirebaseConfig.storageBaseUrl;
    if (!el) return;

    var storagePath = el.getAttribute('data-storage-path');
    if (!storagePath) return;

    var existingSrc = el.getAttribute('src');
    var token = el.getAttribute('data-token');
    var encoded = encodedStoragePath(storagePath);

    function setSrc(url) {
      if (!url) {
        if (existingSrc && !el.getAttribute('src')) el.setAttribute('src', existingSrc);
        return;
      }
      if (el.getAttribute('src') === url) return;
      if (el.tagName === 'SOURCE') {
        el.src = url;
        var audioEl = el.closest('audio');
        if (audioEl) audioEl.load();
      } else {
        el.src = url;
        if (el.tagName === 'VIDEO') el.load();
      }
    }

    if (baseUrl && token) {
      setSrc(baseUrl + encoded + '?alt=media&token=' + token);
      return;
    }

    if (baseUrl) {
      resolvePathOnlyImageUrl(storagePath, baseUrl, setSrc);
    } else if (existingSrc) {
      el.setAttribute('src', existingSrc);
    }
  }

  function initializeFirebaseImages() {
    if (wed4AssetInitDone) return;
    wed4AssetInitDone = true;

    document.querySelectorAll('img[data-storage-path], video[data-storage-path], audio source[data-storage-path]').forEach(function (el) {
      applyFirebaseAsset(el);
    });
  }

  function tryInitFirebaseImages() {
    if (!window.FirebaseConfig || !window.FirebaseConfig.storageBaseUrl) {
      document.querySelectorAll('video[data-storage-path][src]').forEach(function (v) {
        if (!v.getAttribute('src')) return;
        v.load();
      });
      return false;
    }
    initializeFirebaseImages();
    return true;
  }

  function runFirebaseImageInit() {
    if (tryInitFirebaseImages()) return;
    var checkFirebase = setInterval(function () {
      if (tryInitFirebaseImages()) clearInterval(checkFirebase);
    }, 100);
    setTimeout(function () { clearInterval(checkFirebase); }, 12000);
  }

  /* ── Boot ── */

  initVariantPicker(function () {
    applyBrideFirstOrder();
    hydrate();
    initializeFirebaseAudio();
    runFirebaseImageInit();
    initMute();
    startCountdown();
    initOpeningSequence();
    showSession(sessionOpening);
    showMuteButton(false);
  });
})();
