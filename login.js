$(function () {

  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  
  if (window.SliceAuth && SliceAuth.getSession()) {
    window.location.href = 'dashboard.html';
    return;
  }

  
  const $pageLoader = $('#pageLoader');
  const $loaderBarFill = $('#loaderBarFill');
  $('body').addClass('loading');
  requestAnimationFrame(() => { $loaderBarFill.css('width', '100%'); });
  $(window).on('load', () => {
    setTimeout(() => { $pageLoader.addClass('loaded'); $('body').removeClass('loading'); }, 400);
  });
  setTimeout(() => { $pageLoader.addClass('loaded'); $('body').removeClass('loading'); }, 1600);

  
  const $cursorDot = $('#cursorDot');
  const $cursorRing = $('#cursorRing');
  if ($cursorDot.length && $cursorRing.length && !isCoarsePointer) {
    let ringX = 0, ringY = 0, targetX = 0, targetY = 0;
    $(window).on('mousemove', (e) => {
      targetX = e.clientX; targetY = e.clientY;
      $cursorDot.css('transform', `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`);
    });
    (function animateRing() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      $cursorRing.css('transform', `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`);
      requestAnimationFrame(animateRing);
    })();
    $(document).on('mousedown', () => $cursorRing.addClass('cursor-down'));
    $(document).on('mouseup', () => $cursorRing.removeClass('cursor-down'));
    $(document).on('mouseenter', 'a, button, input, .magnetic', () => $cursorRing.addClass('cursor-hover'));
    $(document).on('mouseleave', 'a, button, input, .magnetic', () => $cursorRing.removeClass('cursor-hover'));
  }

  
  const $cursorGlow = $('#cursorGlow');
  if ($cursorGlow.length && !isCoarsePointer) {
    let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
    $(window).on('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    (function animateGlow() {
      curX += (mouseX - curX) * 0.12;
      curY += (mouseY - curY) * 0.12;
      $cursorGlow.css({ left: curX + 'px', top: curY + 'px' });
      requestAnimationFrame(animateGlow);
    })();
  }

 
  if (!isCoarsePointer) {
    $('.magnetic').on('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      $(this).css('transform', `translate(${x * 0.12}px, ${y * 0.2}px)`);
    }).on('mouseleave', function () { $(this).css('transform', 'translate(0,0)'); });
  }

  
  if (!isCoarsePointer) {
    $('.glass-card').on('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      $(this).css({ '--mx': `${x}%`, '--my': `${y}%` }).addClass('spot-active');
    }).on('mouseleave', function () { $(this).removeClass('spot-active'); });
  }

  
  $(document).on('click', '.btn', function (e) {
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

 
  const confettiCanvas = document.getElementById('confettiCanvas');
  let confettiCtx, confettiParticles = [], confettiRAF = null;
  if (confettiCanvas) {
    confettiCtx = confettiCanvas.getContext('2d');
    const resize = () => { confettiCanvas.width = window.innerWidth; confettiCanvas.height = window.innerHeight; };
    resize();
    $(window).on('resize', resize);
  }
  function fireConfetti(originX, originY) {
    if (!confettiCtx || prefersReducedMotion) return;
    const colors = ['#ff2d6f', '#e0115f', '#ff8fb3', '#0fae7f', '#ffcf4d'];
    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 6;
      confettiParticles.push({
        x: originX, y: originY,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
        size: 4 + Math.random() * 4, color: colors[Math.floor(Math.random() * colors.length)],
        life: 1, rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 12
      });
    }
    if (!confettiRAF) confettiRAF = requestAnimationFrame(tick);
  }
  function tick() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach((p) => {
      p.vy += 0.12; p.x += p.vx; p.y += p.vy; p.life -= 0.012; p.rotation += p.rotSpeed;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.globalAlpha = Math.max(p.life, 0);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    });
    confettiParticles = confettiParticles.filter((p) => p.life > 0 && p.y < confettiCanvas.height + 50);
    confettiRAF = confettiParticles.length ? requestAnimationFrame(tick) : null;
  }

  
  const $tabLogin = $('#tabLogin');
  const $tabSignup = $('#tabSignup');
  const $indicator = $('#authTabIndicator');
  const $loginForm = $('#loginForm');
  const $signupForm = $('#signupForm');

  function switchTo(target) {
    const isSignup = target === 'signup';
    $tabLogin.toggleClass('active', !isSignup);
    $tabSignup.toggleClass('active', isSignup);
    $indicator.toggleClass('pos-signup', isSignup);
    $loginForm.toggleClass('active', !isSignup);
    $signupForm.toggleClass('active', isSignup);
  }
  $tabLogin.on('click', () => switchTo('login'));
  $tabSignup.on('click', () => switchTo('signup'));
  $('[data-switch]').on('click', function () { switchTo($(this).data('switch')); });

  /* Support ?mode=signup deep link, e.g. from the navbar */
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'signup') switchTo('signup');


  $('.pw-toggle').on('click', function () {
    const targetId = $(this).data('target');
    const $input = $('#' + targetId);
    const isHidden = $input.attr('type') === 'password';
    $input.attr('type', isHidden ? 'text' : 'password');
    $(this).find('.eye-open').toggle(!isHidden);
    $(this).find('.eye-closed').toggle(isHidden);
  });

 
  const $signupPassword = $('#signupPassword');
  const $pwStrength = $('#pwStrength');
  $signupPassword.on('input', function () {
    const val = $(this).val();
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    $pwStrength.removeClass('weak medium strong');
    if (!val.length) return;
    if (score <= 1) $pwStrength.addClass('weak');
    else if (score <= 2) $pwStrength.addClass('medium');
    else $pwStrength.addClass('strong');
  });

 
  function setError($field, $error, message) {
    $field.closest('.form-field').addClass('has-error');
    $error.text(message);
  }
  function clearError($field, $error) {
    $field.closest('.form-field').removeClass('has-error');
    $error.text('');
  }
  function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function showBanner($banner, type, message) {
    $banner.removeClass('error success').addClass(type + ' show').text(message);
  }


  $loginForm.on('submit', function (e) {
    e.preventDefault();
    const $email = $('#loginEmail');
    const $password = $('#loginPassword');
    const $banner = $('#loginBanner');
    let valid = true;

    clearError($email, $('#loginEmailError'));
    clearError($password, $('#loginPasswordError'));
    $banner.removeClass('show error success');

    if (!$email.val().trim()) {
      setError($email, $('#loginEmailError'), 'Enter the email or mobile number on your account.');
      valid = false;
    }
    if (!$password.val()) {
      setError($password, $('#loginPasswordError'), 'Enter your password.');
      valid = false;
    }
    if (!valid) return;

    const $submit = $('#loginSubmit');
    $submit.addClass('is-loading').prop('disabled', true);

    setTimeout(() => {
      const result = SliceAuth.logIn({ email: $email.val(), password: $password.val() });
      $submit.removeClass('is-loading').prop('disabled', false);

      if (!result.ok) {
        showBanner($banner, 'error', result.error);
        return;
      }
      showBanner($banner, 'success', `Welcome back, ${result.user.name.split(' ')[0]}! Taking you to your account…`);
      const rect = $submit[0].getBoundingClientRect();
      fireConfetti(rect.left + rect.width / 2, rect.top);
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 900);
    }, 700);
  });


  $signupForm.on('submit', function (e) {
    e.preventDefault();
    const $name = $('#signupName');
    const $email = $('#signupEmail');
    const $phone = $('#signupPhone');
    const $password = $('#signupPassword');
    const $confirm = $('#signupConfirm');
    const $agree = $('#agreeTerms');
    const $banner = $('#signupBanner');
    let valid = true;

    [[$name, '#signupNameError'], [$email, '#signupEmailError'], [$phone, '#signupPhoneError'],
     [$password, '#signupPasswordError'], [$confirm, '#signupConfirmError']].forEach(([$f, sel]) => clearError($f, $(sel)));
    $('.terms-check').removeClass('has-error');
    $banner.removeClass('show error success');

    if ($name.val().trim().length < 2) {
      setError($name, $('#signupNameError'), 'Enter your full name.');
      valid = false;
    }
    if (!isValidEmail($email.val().trim())) {
      setError($email, $('#signupEmailError'), 'Enter a valid email address.');
      valid = false;
    }
    if (!/^\d{10}$/.test($phone.val().trim())) {
      setError($phone, $('#signupPhoneError'), 'Enter a valid 10-digit mobile number.');
      valid = false;
    }
    if ($password.val().length < 8) {
      setError($password, $('#signupPasswordError'), 'Password must be at least 8 characters.');
      valid = false;
    }
    if ($confirm.val() !== $password.val() || !$confirm.val()) {
      setError($confirm, $('#signupConfirmError'), 'Passwords do not match.');
      valid = false;
    }
    if (!$agree.is(':checked')) {
      $('.terms-check').addClass('has-error');
      $('#agreeTermsError').text('Please accept the Terms of Service to continue.');
      valid = false;
    }
    if (!valid) return;

    const $submit = $('#signupSubmit');
    $submit.addClass('is-loading').prop('disabled', true);

    setTimeout(() => {
      const result = SliceAuth.signUp({
        name: $name.val(), email: $email.val(), phone: $phone.val(), password: $password.val()
      });
      $submit.removeClass('is-loading').prop('disabled', false);

      if (!result.ok) {
        showBanner($banner, 'error', result.error);
        return;
      }
      showBanner($banner, 'success', `Account created! Welcome to slice, ${result.user.name.split(' ')[0]} 🎉`);
      const rect = $submit[0].getBoundingClientRect();
      fireConfetti(rect.left + rect.width / 2, rect.top);
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1100);
    }, 900);
  });

});
