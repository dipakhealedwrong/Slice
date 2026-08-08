$(function () {

  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

 
  const user = window.SliceAuth ? SliceAuth.getSession() : null;
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // const user = window.SliceAuth ? SliceAuth.getSession() : null;
  // if (!user) {
  //   window.location.href = 'login.html';
  //   return;
  // }

  /* ---------- Populate account info ---------- */
  const firstName = user.name.split(' ')[0];
  $('#navUserName').text(firstName);
  $('#dashUserFirstName').text(firstName);
  $('#cardHolderName').text(user.name.toUpperCase());

  let balance = user.balance;
  const dailyInterest = (balance * 0.07) / 365;
  $('#dashBalance').text(`₹ ${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  $('#dashDailyInterest').text(dailyInterest.toFixed(2));
  $('#statTxns').text(user.transactions ? user.transactions.length : 0);

  /* Live-tick the balance gently, like the marketing homepage card */
  if (!prefersReducedMotion) {
    setInterval(() => {
      balance += Math.random() * 0.3;
      $('#dashBalance').text(`₹ ${balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    }, 3200);
  }

  /* ---------- Render transactions ---------- */
  const $txnList = $('#txnList');
  const txns = user.transactions || [];
  if (!txns.length) {
    $txnList.html('<div class="txn-row"><div class="txn-info"><span class="txn-name">No transactions yet</span><span class="txn-meta">Your activity will show up here.</span></div></div>');
  } else {
    txns.forEach((t) => {
      const isPositive = t.amt > 0;
      const dateLabel = t.daysAgo === 0 ? 'Today' : t.daysAgo === 1 ? 'Yesterday' : `${t.daysAgo} days ago`;
      const row = $(`
        <div class="txn-row">
          <div class="txn-icon">${t.cat.split(' ')[0]}</div>
          <div class="txn-info">
            <span class="txn-name">${t.name}</span>
            <span class="txn-meta">${t.cat.replace(/^\S+\s/, '')} · ${dateLabel}</span>
          </div>
          <div class="txn-amt ${isPositive ? 'positive' : 'negative'}">${isPositive ? '+' : '-'} ₹${Math.abs(t.amt).toLocaleString('en-IN')}</div>
        </div>
      `);
      $txnList.append(row);
    });
  }

  /* ---------- Logout ---------- */
  $('#logoutBtn').on('click', function () {
    SliceAuth.logOut();
    window.location.href = 'index.html';
  });

  /* ---------- Quick action buttons (demo — show a toast) ---------- */
  const $toast = $('<div class="dash-toast" id="dashToast"></div>').appendTo('body');
  let toastTimer = null;
  function showToast(msg) {
    clearTimeout(toastTimer);
    $toast.text(msg).addClass('show');
    toastTimer = setTimeout(() => $toast.removeClass('show'), 2200);
  }
  $('.dash-action-btn[data-action]').on('click', function () {
    const action = $(this).data('action');
    const labels = { add: 'Add Money', send: 'Send Money', bills: 'Pay Bills' };
    showToast(`${labels[action] || 'This feature'} is a demo preview — coming soon!`);
  });


  const $pageLoader = $('#pageLoader');
  const $loaderBarFill = $('#loaderBarFill');
  $('body').addClass('loading');
  requestAnimationFrame(() => { $loaderBarFill.css('width', '100%'); });
  $(window).on('load', () => setTimeout(() => { $pageLoader.addClass('loaded'); $('body').removeClass('loading'); }, 400));
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
    $(document).on('mouseenter', 'a, button, .magnetic', () => $cursorRing.addClass('cursor-hover'));
    $(document).on('mouseleave', 'a, button, .magnetic', () => $cursorRing.removeClass('cursor-hover'));
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

    $('.glass-card').on('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      $(this).css({ '--mx': `${x}%`, '--my': `${y}%` }).addClass('spot-active');
    }).on('mouseleave', function () { $(this).removeClass('spot-active'); });

    $(document).on('mousemove', '.dash-action-btn', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      $(this).css('transform', `translateY(-6px) rotateX(${-y / 22}deg) rotateY(${x / 22}deg)`);
    }).on('mouseleave', '.dash-action-btn', function () { $(this).css('transform', ''); });

    $sliceCardMove();
    function $sliceCardMove() {
      const $card = $('#dashCard');
      if (!$card.length) return;
      $card.on('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const cx = ((e.clientX - rect.left) / rect.width) * 100;
        const cy = ((e.clientY - rect.top) / rect.height) * 100;
        $(this).css({ '--cx': `${cx}%`, '--cy': `${cy}%` });
      });
    }
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

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) $(entry.target).addClass('active'); });
  }, { threshold: 0.1 });
  $('.reveal').each(function () { revealObserver.observe(this); });

});
