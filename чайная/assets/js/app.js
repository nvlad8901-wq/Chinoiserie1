/**
 * CHINOISERIE - APPLICATION LOGIC & INTERACTIONS
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Working Hours & Live Open/Closed Status
  updateLiveStatus();
  setInterval(updateLiveStatus, 60000);

  function updateLiveStatus() {
    const statusText = document.getElementById('live-status-text');
    const statusPill = document.getElementById('live-status-pill');
    if (!statusText) return;

    const now = new Date();
    const day = now.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
    const hours = now.getHours();

    let isOpen = false;
    let closingHour = 23;

    if (day === 5 || day === 6) { // Fri, Sat: 16:00 - 00:00
      closingHour = 24;
      if (hours >= 16 || hours < 0) isOpen = true;
    } else { // Sun - Thu: 16:00 - 23:00
      if (hours >= 16 && hours < 23) isOpen = true;
    }

    if (isOpen) {
      statusText.innerText = `СЕЙЧАС ОТКРЫТО • ДО ${closingHour === 24 ? '00:00' : closingHour + ':00'}`;
      if (statusPill) {
        statusPill.style.borderColor = 'rgba(45, 226, 166, 0.4)';
        statusPill.style.color = '#2de2a6';
      }
    } else {
      statusText.innerText = 'ОТКРЫВАЕМСЯ В 16:00';
      if (statusPill) {
        statusPill.style.borderColor = 'rgba(212, 175, 55, 0.4)';
        statusPill.style.color = '#d4af37';
      }
    }
  }

  // 2. Tea Menu Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const teaCards = document.querySelectorAll('.tea-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      teaCards.forEach(card => {
        if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
          card.style.display = 'flex';
          setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => { card.style.display = 'none'; }, 250);
        }
      });
    });
  });

  // 3. Dynamic Ceremony Cost Calculation
  const guestsInput = document.getElementById('booking-guests');
  const summaryCost = document.getElementById('summary-cost-value');

  if (guestsInput && summaryCost) {
    guestsInput.addEventListener('input', calculateCost);
    guestsInput.addEventListener('change', calculateCost);
  }

  function calculateCost() {
    const guests = parseInt(guestsInput.value) || 1;
    let cost = 2000;
    if (guests > 3) {
      cost += (guests - 3) * 500;
    }
    summaryCost.innerText = `${cost.toLocaleString('ru-RU')} ₽`;
  }

  // 4. Booking Form Submission -> Telegram Link Generator
  const bookingForm = document.getElementById('ceremony-booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('booking-name').value.trim();
      const phone = document.getElementById('booking-phone').value.trim();
      const guests = document.getElementById('booking-guests').value;
      const date = document.getElementById('booking-date').value;
      const teaType = document.getElementById('booking-tea-type').value;
      const notes = document.getElementById('booking-notes').value.trim();

      let cost = 2000;
      if (parseInt(guests) > 3) {
        cost += (parseInt(guests) - 3) * 500;
      }

      const message = `🍵 Бронирование Чайной Церемонии (Chinoiserie)%0A%0A` +
        `👤 Имя: ${encodeURIComponent(name)}%0A` +
        `📞 Контакт: ${encodeURIComponent(phone)}%0A` +
        `👥 Гостей: ${guests} чел.%0A` +
        `📅 Дата/Время: ${encodeURIComponent(date)}%0A` +
        `🍃 Предпочтение по чаю: ${encodeURIComponent(teaType)}%0A` +
        (notes ? `💬 Пожелания: ${encodeURIComponent(notes)}%0A` : '') +
        `💰 Расчетная стоимость: ${cost} ₽`;

      // Trigger celebration confetti
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#2de2a6', '#ffffff']
        });
      }

      // Show confirmation in modal
      const modal = document.getElementById('booking-modal');
      const modalContent = document.getElementById('booking-modal-body');
      
      if (modalContent) {
        modalContent.innerHTML = `
          <div style="text-align: center; padding: 1rem 0;">
            <div style="font-size: 3rem; margin-bottom: 1rem; color: #d4af37;">✓</div>
            <h3 style="font-family: var(--font-display); font-size: 1.8rem; margin-bottom: 0.8rem; color: #fff;">Заявка сформирована</h3>
            <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.8rem;">
              Ваш запрос на церемонию для <strong>${guests} чел.</strong> готов к отправке чайному мастеру в Telegram (<span style="color: #2de2a6;">@websoot</span>).
            </p>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.25); border-radius: 12px; padding: 1.2rem; margin-bottom: 1.8rem; text-align: left; font-family: var(--font-mono); font-size: 0.85rem; color: #d4af37;">
              Сумма: <strong>${cost} ₽</strong><br>
              Чайный мастер: @websoot
            </div>
            <a href="https://t.me/websoot?text=${message}" target="_blank" class="btn-primary" style="display: inline-flex; width: 100%; justify-content: center;">
              Открыть Telegram и подтвердить бронь
            </a>
          </div>
        `;
      }

      if (modal) modal.classList.add('active');
    });
  }

  // 5. Lightbox / Modal for Telegram Gallery Photos
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-image');
  const lightboxCaption = document.getElementById('lightbox-caption');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const title = item.getAttribute('data-title') || '';
      const desc = item.getAttribute('data-desc') || '';

      if (lightboxModal && img) {
        lightboxImg.src = img.src;
        lightboxCaption.innerHTML = `<strong>${title}</strong><br><span style="color: var(--text-muted); font-size: 0.85rem;">${desc}</span>`;
        lightboxModal.classList.add('active');
      }
    });
  });

  // Modal close handlers
  document.querySelectorAll('.modal-close-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Quick order tea buttons
  document.querySelectorAll('.tea-order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.tea-card');
      const teaName = card.querySelector('.tea-name').innerText;
      const select = document.getElementById('booking-tea-type');
      if (select) {
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].text.includes(teaName) || teaName.includes(select.options[i].text)) {
            select.selectedIndex = i;
            break;
          }
        }
      }
      const bookingSec = document.getElementById('ceremony');
      if (bookingSec) {
        bookingSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
