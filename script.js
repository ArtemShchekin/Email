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

const profileState = {
  name: '',
  email: ''
};

let currentStageIndex = 0;
let toastTimeout;

function switchTab(targetId) {
  tabContents.forEach((content) => {
    const isActive = content.id === targetId;
    content.classList.toggle('tab-content--active', isActive);
  });

  tabs.forEach((tab) => {
    const isActive = tab.dataset.target === targetId;
    tab.classList.toggle('tabs__tab--active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });
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
