const BASE_TICKET_PRICE = 1000;

document.addEventListener('DOMContentLoaded', () => {
  initLegacyCreditApp();
  initCreditForm();
  initTicketForm();
  initLifestylePage();
});

function initLegacyCreditApp() {
  const tabs = document.querySelectorAll('.tabs__tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const openApplicationButton = document.getElementById('open-application');
  const applicationSection = document.getElementById('application');
  const stageElements = document.querySelectorAll('.stage');
  const nextStageButton = document.getElementById('next-stage');
  const managerInput = document.getElementById('manager');
  const toast = document.getElementById('toast');
  const profileForm = document.getElementById('profile-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');

  if (
    !tabs.length ||
    !tabContents.length ||
    !openApplicationButton ||
    !applicationSection ||
    !stageElements.length ||
    !nextStageButton ||
    !managerInput ||
    !toast ||
    !profileForm ||
    !nameInput ||
    !emailInput ||
    !nameError ||
    !emailError
  ) {
    return;
  }

  const profileState = { name: '', email: '' };
  let currentStageIndex = 0;
  let toastTimeout;

  function switchTab(targetId) {
    tabContents.forEach((content) => {
      const isActive = content.id === targetId;
      content.classList.toggle('tab-content--active', isActive);
      content.setAttribute('aria-hidden', String(!isActive));
    });

    tabs.forEach((tab) => {
      const isActive = tab.dataset.target === targetId;
      tab.classList.toggle('tabs__tab--active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
    });
  }

  const currentActiveTab = Array.from(tabs).find((tab) => tab.classList.contains('tabs__tab--active')) || tabs[0];
  if (currentActiveTab) {
    switchTab(currentActiveTab.dataset.target);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.target);
    });
  });

  openApplicationButton.addEventListener('click', () => {
    applicationSection.classList.remove('application--hidden');
    applicationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function validateName(value) {
    const trimmed = value.trim();

    if (!trimmed) {
      nameError.textContent = 'Укажите имя.';
      return false;
    }

    const namePattern = /^[А-Яа-яЁё\s]{2,}$/;
    if (!namePattern.test(trimmed)) {
      nameError.textContent = 'Имя должно содержать минимум 2 буквы кириллицы.';
      return false;
    }

    nameError.textContent = '';
    return true;
  }

  function validateEmail(value) {
    const trimmed = value.trim();

    if (!trimmed) {
      emailError.textContent = '';
      return true;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      emailError.textContent = 'Укажите корректный email в формате user@example.com.';
      return false;
    }

    emailError.textContent = '';
    return true;
  }

  profileForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const isNameValid = validateName(nameInput.value);
    const isEmailValid = validateEmail(emailInput.value);

    if (!isNameValid || !isEmailValid) {
      return;
    }

    profileState.name = nameInput.value.trim();
    profileState.email = emailInput.value.trim();

    showToast('Профиль сохранён.');
  });

  managerInput.addEventListener('click', () => {
    if (profileState.name) {
      managerInput.value = profileState.name;
    } else {
      showToast('Сначала заполните и сохраните имя в профиле.');
    }
  });

  function updateStages() {
    stageElements.forEach((stageElement, index) => {
      stageElement.classList.toggle('stage--active', index === currentStageIndex);
      stageElement.classList.toggle('stage--completed', index < currentStageIndex);
    });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('toast--visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('toast--visible');
    }, 3500);
  }

  nextStageButton.addEventListener('click', () => {
    if (currentStageIndex >= stageElements.length - 1) {
      showToast('Все этапы уже пройдены.');
      return;
    }

    if (!managerInput.value.trim()) {
      showToast('Стоп-условие. Поле "Менеджер" должно быть заполнено');
      return;
    }

    currentStageIndex += 1;
    updateStages();

    if (profileState.email) {
      showToast('Уведомление менеджера о смене этапа заявки отправлено');
    } else {
      showToast('Уведомление менеджера о смене этапа заявки не отправлено');
    }
  });

  updateStages();
}

function initCreditForm() {
  const creditForm = document.getElementById('credit-form');
  const resultContainer = document.getElementById('credit-result');

  if (!creditForm || !resultContainer) {
    return;
  }

  creditForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!creditForm.checkValidity()) {
      creditForm.reportValidity();
      return;
    }

    const amount = parseFloat(creditForm.elements['loan-amount'].value);
    const term = parseInt(creditForm.elements['loan-term'].value, 10);
    const rate = parseFloat(creditForm.elements['interest-rate'].value);
    const income = parseFloat(creditForm.elements['client-income'].value);
    const name = creditForm.elements['client-name'].value.trim();
    const phone = creditForm.elements['client-phone'].value.trim();
    const comment = creditForm.elements['manager-comment'].value.trim();

    const payment = calculateMonthlyPayment(amount, rate, term);
    const dti = income > 0 ? payment / income : null;

    const formatter = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    });

    const rows = [
      { label: 'Клиент', value: name },
      { label: 'Телефон', value: phone },
      { label: 'Сумма кредита', value: formatter.format(amount) },
      { label: 'Срок кредита', value: `${term} мес.` },
      { label: 'Процентная ставка', value: `${rate.toFixed(2)}% годовых` },
      { label: 'Ежемесячный платёж', value: formatter.format(payment) },
      {
        label: 'Коэффициент долговой нагрузки',
        value: dti === null ? 'Доход не указан' : `${(dti * 100).toFixed(1)}% от дохода`
      },
      {
        label: 'Комментарий',
        value: comment ? comment : '—'
      }
    ];

    resultContainer.innerHTML = `
      <h3>Результат расчёта</h3>
      <dl class="result__list">
        ${rows.map((row) => `
          <div class="result__item">
            <dt>${row.label}</dt>
            <dd>${row.value}</dd>
          </div>
        `).join('')}
      </dl>
      <p class="result__note">Клиент должен подтвердить корректность данных перед отправкой в скоринг.</p>
    `;
  });
}

function calculateMonthlyPayment(amount, rate, term) {
  const monthlyRate = rate <= 0 ? 0 : rate / 100 / 12;

  if (monthlyRate === 0) {
    return amount / term;
  }

  const factor = Math.pow(1 + monthlyRate, term);
  return amount * monthlyRate * factor / (factor - 1);
}

function initTicketForm() {
  const ticketForm = document.getElementById('ticket-form');
  const resultContainer = document.getElementById('ticket-result');

  if (!ticketForm || !resultContainer) {
    return;
  }

  ticketForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!ticketForm.checkValidity()) {
      ticketForm.reportValidity();
      return;
    }

    const age = parseFloat(ticketForm.elements['passenger-age'].value);
    const daysBefore = parseInt(ticketForm.elements['days-before'].value, 10);

    const ticketDecision = determineTicketDecision(age, daysBefore);

    if (!ticketDecision.allowed) {
      resultContainer.innerHTML = `
        <div class="result__alert" role="alert">
          <h3>Покупка недоступна</h3>
          <p>${ticketDecision.reason}</p>
        </div>
      `;
      return;
    }

    const discountAmount = BASE_TICKET_PRICE * ticketDecision.discount;
    const finalPrice = BASE_TICKET_PRICE - discountAmount;
    const formatter = new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 2
    });

    const daysLabel = daysBefore === 1 ? '1 день' : `${daysBefore} дн.`;

    resultContainer.innerHTML = `
      <h3>Расчёт стоимости</h3>
      <dl class="result__list">
        <div class="result__item">
          <dt>Базовая стоимость</dt>
          <dd>${formatter.format(BASE_TICKET_PRICE)}</dd>
        </div>
        <div class="result__item">
          <dt>Скидка</dt>
          <dd>${(ticketDecision.discount * 100).toFixed(0)}%</dd>
        </div>
        <div class="result__item">
          <dt>Размер скидки</dt>
          <dd>${formatter.format(discountAmount)}</dd>
        </div>
        <div class="result__item">
          <dt>Итого к оплате</dt>
          <dd>${formatter.format(finalPrice)}</dd>
        </div>
      </dl>
      <p class="result__note">Скидка выбрана согласно правилам для возраста ${age} лет и покупки за ${daysLabel} до отправления.</p>
    `;
  });
}

function determineTicketDecision(age, daysBefore) {
  if (Number.isNaN(age) || Number.isNaN(daysBefore)) {
    return {
      allowed: false,
      reason: 'Укажите корректный возраст и количество дней до отправления.'
    };
  }

  if (daysBefore < 0) {
    return {
      allowed: false,
      reason: 'Количество дней до отправления не может быть отрицательным.'
    };
  }

  if (age <= 18) {
    return {
      allowed: false,
      reason: 'Пассажиры младше 18 лет или ровно в 18 лет купить билет не могут.'
    };
  }

  if (age >= 100) {
    return {
      allowed: false,
      reason: 'Возраст 100 лет и старше не обслуживается кассой.'
    };
  }

  if (age > 90 && age < 100) {
    return {
      allowed: false,
      reason: 'Для пассажиров старше 90 лет требуется ручная проверка — продажа онлайн недоступна.'
    };
  }

  let discount = 0;

  if (age > 18 && age <= 20) {
    discount = 0;
  } else if (age > 20 && age <= 50) {
    discount = selectDiscount(daysBefore, 0.10, 0.35, 0.40);
  } else if (age > 50 && age <= 90) {
    discount = selectDiscount(daysBefore, 0.15, 0.40, 0.50);
  } else {
    return {
      allowed: false,
      reason: 'Возраст пассажира вне заданных диапазонов. Обратитесь в поддержку.'
    };
  }

  return {
    allowed: true,
    discount
  };
}

function selectDiscount(daysBefore, oneDayDiscount, threeDayDiscount, longDiscount) {
  if (daysBefore === 1) {
    return oneDayDiscount;
  }

  if (daysBefore >= 2 && daysBefore <= 3) {
    return threeDayDiscount;
  }

  if (daysBefore > 3) {
    return longDiscount;
  }

  return 0;
}

const showGlobalToast = (() => {
  let timeoutId;

  return function showGlobalToast(message) {
    const toast = document.getElementById('toast');

    if (!toast) {
      return;
    }

    toast.textContent = message;
    toast.classList.add('toast--visible');
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      toast.classList.remove('toast--visible');
    }, 3500);
  };
})();

function initLifestylePage() {
  const commentForm = document.getElementById('comment-form');
  const commentInput = document.getElementById('comment-text');
  const commentError = document.getElementById('comment-error');
  const happinessSection = document.getElementById('happiness-section');
  const happinessCheckboxes = happinessSection ? happinessSection.querySelectorAll('input[type="checkbox"]') : null;
  const happinessIndexField = document.getElementById('happiness-index');
  const cardForm = document.getElementById('card-form');
  const cardSelect = document.getElementById('card-type');
  const cardDetailsContainer = document.getElementById('card-details');
  const cardError = document.getElementById('card-error');
  const phoneForm = document.getElementById('phone-form');
  const phoneInput = document.getElementById('phone-number');
  const phoneError = document.getElementById('phone-error');
  const simSelect = document.getElementById('sim-provider');

  if (
    !commentForm ||
    !commentInput ||
    !commentError ||
    !happinessCheckboxes ||
    !happinessIndexField ||
    !cardForm ||
    !cardSelect ||
    !cardDetailsContainer ||
    !cardError ||
    !phoneForm ||
    !phoneInput ||
    !phoneError ||
    !simSelect
  ) {
    return;
  }

  const commentPattern = /^[A-Za-zА-Яа-яЁё\s.,!?"'()\-]+$/;

  commentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const value = commentInput.value.trim();

    if (!value) {
      commentError.textContent = 'Комментарий обязателен.';
      commentInput.focus();
      return;
    }

    if (value.length > 500) {
      commentError.textContent = 'Слишком длинный комментарий.';
      commentInput.focus();
      return;
    }

    if (!commentPattern.test(value)) {
      commentError.textContent = 'Используйте допустимые символы.';
      commentInput.focus();
      return;
    }

    commentError.textContent = '';
    showGlobalToast('Успех операции');
  });

  commentInput.addEventListener('input', () => {
    if (commentError.textContent) {
      commentError.textContent = '';
    }
  });

  if (happinessCheckboxes.length) {
    const updateHappinessIndex = () => {
      let index = 0;

      happinessCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          index += Number(checkbox.dataset.value || 0);
        }
      });

      happinessIndexField.value = index.toString();
    };

    happinessCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', updateHappinessIndex);
    });

    updateHappinessIndex();
  }

  const cardDetailsMap = {
    debit: [
      { label: 'Тариф', value: '«Свободный баланс»' },
      { label: 'Стоимость обслуживания', value: '0 ₽ при покупках от 5 000 ₽' },
      { label: 'Кешбек за покупки', value: '5% в супермаркетах' }
    ],
    business: [
      { label: 'Тариф', value: '«Бизнес-старт»' },
      { label: 'Стоимость обслуживания', value: '2 490 ₽ в месяц' },
      { label: 'Акция', value: 'Возврат 20% на рекламу' }
    ],
    credit: [
      { label: 'Льготный период', value: '120 дней без процентов' },
      { label: 'Стоимость обслуживания', value: '1 990 ₽ в год' },
      { label: 'Кешбек за покупки', value: '7% в путешествиях' }
    ],
    gold: [
      { label: 'Тариф', value: '«Золотая карта»' },
      { label: 'Процент на остаток', value: '4.5% на счёте' },
      { label: 'Кешбек за покупки', value: '10% в категориях месяца' }
    ],
    platinum: [
      { label: 'Тариф', value: '«Platinum Select»' },
      { label: 'Стоимость обслуживания', value: '4 990 ₽ в год' },
      { label: 'Акция', value: 'Доступ в бизнес-залы 6 раз в год' }
    ],
    travel: [
      { label: 'Тариф', value: '«Путешествуй»' },
      { label: 'Льготный период', value: '90 дней без процентов' },
      { label: 'Бонусы', value: 'Мили за каждую покупку' }
    ],
    youth: [
      { label: 'Тариф', value: '«Юниор»' },
      { label: 'Стоимость обслуживания', value: '0 ₽ до 23 лет' },
      { label: 'Процент на остаток', value: '6% при активных покупках' }
    ],
    premium: [
      { label: 'Тариф', value: '«Premium Club»' },
      { label: 'Стоимость обслуживания', value: '9 900 ₽ в год' },
      { label: 'Акция', value: 'Персональный менеджер 24/7' }
    ],
    digital: [
      { label: 'Тариф', value: '«Онлайн-поток»' },
      { label: 'Стоимость обслуживания', value: '0 ₽ при подписке на сервисы' },
      { label: 'Кешбек за покупки', value: '5% на цифровые товары' }
    ],
    cobrand: [
      { label: 'Партнёр', value: 'Авиакомпания «Северное небо»' },
      { label: 'Льготный период', value: '60 дней без процентов' },
      { label: 'Кешбек за покупки', value: 'Бонусные мили х2 у партнёра' }
    ]
  };

  const renderCardDetails = (cardType) => {
    const details = cardDetailsMap[cardType];

    if (!details) {
      cardDetailsContainer.innerHTML = '<p class="placeholder">Выберите карту, чтобы увидеть условия.</p>';
      return;
    }

    const items = details
      .map((detail) => `
        <div class="details-list__item">
          <dt>${detail.label}</dt>
          <dd>${detail.value}</dd>
        </div>
      `)
      .join('');

    cardDetailsContainer.innerHTML = `
      <dl class="details-list">
        ${items}
      </dl>
    `;
  };

  renderCardDetails(cardSelect.value);

  cardSelect.addEventListener('change', () => {
    if (cardError.textContent) {
      cardError.textContent = '';
    }
    renderCardDetails(cardSelect.value);
  });

  cardForm.addEventListener('change', (event) => {
    if (event.target.name === 'card-gender' && cardError.textContent) {
      cardError.textContent = '';
    }
  });

  cardForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const selectedCard = cardSelect.value;
    const selectedGender = cardForm.querySelector('input[name="card-gender"]:checked');

    if (!selectedCard) {
      cardError.textContent = 'Выберите тип карты.';
      cardSelect.focus();
      return;
    }

    if (!selectedGender) {
      cardError.textContent = 'Укажите получателя карты.';
      return;
    }

    cardError.textContent = '';

    if (selectedGender.value === 'male') {
      showGlobalToast('Карточка оформлена, бонус за карту 100 рублей');
    } else {
      showGlobalToast('Карточка оформлена, бонус за карту 69 рублей');
    }
  });

  const phonePattern = /^\+7\s\d{3}\s\d{3}\s\d{2}\s\d{2}$/;

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');

    if (!digits) {
      return '';
    }

    let normalized = digits;

    if (normalized.startsWith('8')) {
      normalized = `7${normalized.slice(1)}`;
    }

    if (!normalized.startsWith('7')) {
      normalized = `7${normalized}`;
    }

    normalized = normalized.slice(0, 11);

    const rest = normalized.slice(1);
    let result = '+7';

    if (rest.length > 0) {
      result += ` ${rest.slice(0, 3)}`;
    }

    if (rest.length > 3) {
      result += ` ${rest.slice(3, 6)}`;
    }

    if (rest.length > 6) {
      result += ` ${rest.slice(6, 8)}`;
    }

    if (rest.length > 8) {
      result += ` ${rest.slice(8, 10)}`;
    }

    return result;
  };

  phoneInput.addEventListener('input', (event) => {
    const formatted = formatPhone(event.target.value);
    event.target.value = formatted;

    if (phoneError.textContent) {
      phoneError.textContent = '';
    }
  });

  simSelect.addEventListener('change', () => {
    if (phoneError.textContent) {
      phoneError.textContent = '';
    }
  });

  phoneForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const value = phoneInput.value.trim();
    const provider = simSelect.value;

    if (!phonePattern.test(value)) {
      phoneError.textContent = 'Укажите телефон в формате +7 999 999 99 99.';
      phoneInput.focus();
      return;
    }

    if (!provider) {
      phoneError.textContent = 'Выберите оператора.';
      simSelect.focus();
      return;
    }

    phoneError.textContent = '';
    showGlobalToast('Успех операции');
  });
}
