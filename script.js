$(function () {

  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  
  const $navbar = $('#navbar');
  $(window).on('scroll', () => {
    $navbar.toggleClass('scrolled', $(window).scrollTop() > 40);
  });


  if (window.SliceAuth) {
    const session = SliceAuth.getSession();
    if (session) {
      $('#navAuthBtn').attr('href', 'dashboard.html').text(`Hi, ${session.name.split(' ')[0]}`);
    }
  }


  const $tiltCard = $('#tiltCard');
  const $heroVisual = $('.hero-visual');
  if ($tiltCard.length && $heroVisual.length) {
    $heroVisual.on('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      $tiltCard.css('transform', `rotateX(${-y / 15}deg) rotateY(${x / 15}deg)`);
    });
    $heroVisual.on('mouseleave', () => {
      $tiltCard.css('transform', 'rotateX(0deg) rotateY(0deg)');
    });
  }

  // 2b. Cursor-following glare "swipe" across the credit card
  const $sliceCard = $('.slice-card');
  if ($sliceCard.length && !isCoarsePointer) {
    $sliceCard.on('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * 100;
      const cy = ((e.clientY - rect.top) / rect.height) * 100;
      $(this).css({ '--cx': `${cx}%`, '--cy': `${cy}%` });
    });
  }


  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) $(entry.target).addClass('active');
    });
  }, { threshold: 0.1 });
  $('.reveal').each(function () { revealObserver.observe(this); });

  
  const $savingsRange = $('#savingsRange');
  if ($savingsRange.length) {
    $savingsRange.on('input', function () {
      const balance = parseInt($(this).val(), 10);
      const interestRate = 0.07; // 7.00% p.a.
      const dailyEarn = (balance * interestRate) / 365;
      const yearlyEarn = balance * interestRate;

      $('#savingsAmountText').text(`₹ ${balance.toLocaleString('en-IN')}`);
      $('#dailyEarnVal').text(`₹ ${dailyEarn.toFixed(2)} / day`);
      $('#yearlyEarnVal').text(`₹ ${yearlyEarn.toLocaleString('en-IN')} / year`);
      $('#notifAmount').text(dailyEarn.toFixed(2));
    });
  }

  // 5. Loan Calculator Widget
  const $loanRange = $('#loanRange');
  if ($loanRange.length) {
    $loanRange.on('input', function () {
      const amount = parseInt($(this).val(), 10);
      $('#calcValue').text(`₹ ${amount.toLocaleString('en-IN')}`);

      const monthlyRate = 0.12 / 12;
      const emi = Math.round((amount * monthlyRate * Math.pow(1 + monthlyRate, 12)) / (Math.pow(1 + monthlyRate, 12) - 1));
      $('#emiVal').text(`₹ ${emi.toLocaleString('en-IN')}/mo`);
    });
  }

  // 6. Scroll Progress Bar
  function updateScrollProgress() {
    const scrollTop = $(window).scrollTop();
    const docHeight = $(document).height() - $(window).height();
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    $('#scrollProgress').css('width', pct + '%');
  }
  $(window).on('scroll', updateScrollProgress);
  updateScrollProgress();

  // 7. Cursor Glow (desktop only)
  const $cursorGlow = $('#cursorGlow');
  if ($cursorGlow.length && !isCoarsePointer) {
    let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
    $(window).on('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    function animateCursorGlow() {
      curX += (mouseX - curX) * 0.12;
      curY += (mouseY - curY) * 0.12;
      $cursorGlow.css({ left: curX + 'px', top: curY + 'px' });
      requestAnimationFrame(animateCursorGlow);
    }
    animateCursorGlow();
  }

  // 8. Parallax Ambient Glows
  const $glows = $('.glow-bg');
  $(window).on('scroll', () => {
    const scrollY = $(window).scrollTop();
    $glows.each(function () {
      const speed = parseFloat($(this).data('speed')) || 0.1;
      $(this).css('transform', `translateY(${scrollY * speed}px)`);
    });
  });

  // 9. Count-Up Numbers on Scroll Into View
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const $el = $(el);
        const target = parseFloat($el.data('target'));
        const decimals = parseInt($el.data('decimals')) || 0;
        const suffix = $el.data('suffix') || '';
        const format = $el.data('format');
        const duration = 1600;
        const startTime = performance.now();

        function tick(now) {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = target * eased;
          let display = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
          if (format === 'inr') display = Math.round(value).toLocaleString('en-IN');
          $el.text(display + suffix);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  $('.count-up').each(function () { countObserver.observe(this); });

  // 10. Growth Bar & Category Bar fill animation on scroll
  const growthObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        $(entry.target).addClass('in-view');
        growthObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  $('.growth-bar').each(function () { growthObserver.observe(this); });

  const catObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        $(entry.target).addClass('in-view');
        catObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  $('.cat-fill').each(function () { catObserver.observe(this); });

  // 11. Magnetic Button Effect
  if (!isCoarsePointer) {
    $('.magnetic').on('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      $(this).css('transform', `translate(${x * 0.15}px, ${y * 0.25}px)`);
    }).on('mouseleave', function () {
      $(this).css('transform', 'translate(0, 0)');
    });
  }

  /* ======================================================================
     NEXT-LEVEL FX LAYER
     Page loader, custom cursor, ambient particles, spotlight cards,
     glitch headings, ripple buttons, confetti bursts, live-tick balance.
     ====================================================================== */

  // 12. Page Load Intro
  const $pageLoader = $('#pageLoader');
  const $loaderBarFill = $('#loaderBarFill');
  $('body').addClass('loading');
  requestAnimationFrame(() => { $loaderBarFill.css('width', '100%'); });
  $(window).on('load', () => {
    setTimeout(() => {
      $pageLoader.addClass('loaded');
      $('body').removeClass('loading');
    }, 500);
  });
  setTimeout(() => {
    $pageLoader.addClass('loaded');
    $('body').removeClass('loading');
  }, 2200);

  // 13. Custom Cursor
  const $cursorDot = $('#cursorDot');
  const $cursorRing = $('#cursorRing');
  if ($cursorDot.length && $cursorRing.length && !isCoarsePointer) {
    let ringX = 0, ringY = 0, targetX = 0, targetY = 0;
    $(window).on('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      $cursorDot.css('transform', `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`);
    });
    function animateRing() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      $cursorRing.css('transform', `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`);
      requestAnimationFrame(animateRing);
    }
    animateRing();

    $(document).on('mousedown', () => $cursorRing.addClass('cursor-down'));
    $(document).on('mouseup', () => $cursorRing.removeClass('cursor-down'));

    $('a, button, input[type=range], .accordion-button, .carousel-indicators button, .magnetic').on({
      mouseenter: () => $cursorRing.addClass('cursor-hover'),
      mouseleave: () => $cursorRing.removeClass('cursor-hover')
    });
  }

  // 14. Spotlight Glow on Cards
  if (!isCoarsePointer) {
    $('.glass-card').on('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      $(this).css({ '--mx': `${x}%`, '--my': `${y}%` }).addClass('spot-active');
    }).on('mouseleave', function () {
      $(this).removeClass('spot-active');
    });
  }

  // 15. Ripple Buttons
  $('.btn').on('click', function (e) {
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const $ripple = $('<span class="ripple-wave"></span>').css({
      width: size, height: size,
      left: e.clientX - rect.left - size / 2,
      top: e.clientY - rect.top - size / 2
    });
    $(this).append($ripple);
    setTimeout(() => $ripple.remove(), 650);
  });

  // 16. Confetti Bursts
  const confettiCanvas = document.getElementById('confettiCanvas');
  let confettiCtx, confettiParticles = [], confettiRAF = null;
  if (confettiCanvas) {
    confettiCtx = confettiCanvas.getContext('2d');
    const resizeConfetti = () => {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    };
    resizeConfetti();
    $(window).on('resize', resizeConfetti);
  }

  function fireConfetti(originX, originY) {
    if (!confettiCtx || prefersReducedMotion) return;
    const colors = ['#ff2d6f', '#e0115f', '#ff8fb3', '#0fae7f', '#ffcf4d'];
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      confettiParticles.push({
        x: originX, y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12
      });
    }
    if (!confettiRAF) confettiRAF = requestAnimationFrame(tickConfetti);
  }

  function tickConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach((p) => {
      p.vy += 0.12;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.012;
      p.rotation += p.rotSpeed;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(p.life, 0);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    });
    confettiParticles = confettiParticles.filter((p) => p.life > 0 && p.y < confettiCanvas.height + 50);
    if (confettiParticles.length > 0) {
      confettiRAF = requestAnimationFrame(tickConfetti);
    } else {
      confettiRAF = null;
    }
  }

  $('#getLinkBtn').on('click', function (e) {
    const rect = this.getBoundingClientRect();
    fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

  $(document).on('click', '[data-bs-target="#appModal"]', function () {
    const rect = this.getBoundingClientRect();
    fireConfetti(rect.left + rect.width / 2, rect.top);
  });

  // 17. Ambient Hero Particles (drifting rupee glyphs)
  const heroCanvas = document.getElementById('heroParticles');
  if (heroCanvas && !prefersReducedMotion) {
    const ctx = heroCanvas.getContext('2d');
    let particles = [];
    const glyphs = ['₹', '•', '✦'];

    function resizeHero() {
      const parent = heroCanvas.parentElement;
      heroCanvas.width = parent.clientWidth + 120;
      heroCanvas.height = parent.clientHeight + 120;
    }
    function initParticles() {
      particles = Array.from({ length: 22 }, () => ({
        x: Math.random() * heroCanvas.width,
        y: Math.random() * heroCanvas.height,
        speed: 0.2 + Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 0.4,
        size: 10 + Math.random() * 14,
        opacity: 0.05 + Math.random() * 0.16,
        glyph: glyphs[Math.floor(Math.random() * glyphs.length)]
      }));
    }
    resizeHero();
    initParticles();
    $(window).on('resize', resizeHero);

    function animateHeroParticles() {
      ctx.clearRect(0, 0, heroCanvas.width, heroCanvas.height);
      particles.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -20) { p.y = heroCanvas.height + 20; p.x = Math.random() * heroCanvas.width; }
        ctx.font = `${p.size}px 'Space Grotesk', sans-serif`;
        ctx.fillStyle = `rgba(224, 17, 95, ${p.opacity})`;
        ctx.fillText(p.glyph, p.x, p.y);
      });
      requestAnimationFrame(animateHeroParticles);
    }
    animateHeroParticles();
  }

  // 18. Glitch-In Section Headings
  const scrambleChars = '!<>-_\\/[]{}—=+*^?#';
  function scrambleReveal(el) {
    const finalText = el.textContent;
    const len = finalText.length;
    let frame = 0;
    const totalFrames = 14;
    const interval = setInterval(() => {
      let out = '';
      for (let i = 0; i < len; i++) {
        if (finalText[i] === ' ') { out += ' '; continue; }
        const revealPoint = (i / len) * totalFrames;
        out += (frame >= revealPoint + 4) ? finalText[i] : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      }
      el.textContent = out;
      frame++;
      if (frame > totalFrames + 4) {
        el.textContent = finalText;
        clearInterval(interval);
      }
    }, 35);
  }

  if (!prefersReducedMotion) {
    const headingObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.dataset.scrambled) {
          entry.target.dataset.scrambled = 'true';
          scrambleReveal(entry.target);
          headingObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    $('.section-header h2').each(function () { headingObserver.observe(this); });
  }

  // 19. Live-Tick Hero Balance
  const $liveHeroBalance = $('#liveHeroBalance');
  if ($liveHeroBalance.length) {
    let balance = 248920.00;
    setInterval(() => {
      balance += Math.random() * 0.35;
      $liveHeroBalance.text(`₹ ${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
      $liveHeroBalance.removeClass('tick-pulse');
      void $liveHeroBalance[0].offsetWidth;
      $liveHeroBalance.addClass('tick-pulse');
    }, 3000);
  }

  // 20. Extra Tilt Depth for Feature / Safety / Insight Cards
  if (!isCoarsePointer) {
    $('.feature-box, .safety-badge, .insight-card, .insight-mini').on('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      $(this).css('transform', `translateY(-8px) rotateX(${-y / 22}deg) rotateY(${x / 22}deg)`);
    }).on('mouseleave', function () {
      $(this).css('transform', '');
    });
  }

});
