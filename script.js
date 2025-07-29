// script.js

// Получаем необходимые элементы DOM
const form = document.getElementById('expense-form');
const tableBody = document.querySelector('#expenses-table tbody');
const totalAmountElement = document.getElementById('total-amount');
const filterCategorySelect = document.getElementById('filter-category');

// Массив для хранения трат
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Функция для отображения трат в таблице
function renderExpenses() {
  tableBody.innerHTML = ''; // Очищаем таблицу

  let filteredExpenses = expenses;

  // Применяем фильтр по категории
  const selectedCategory = filterCategorySelect.value;
  if (selectedCategory !== 'all') {
    filteredExpenses = expenses.filter(expense => expense.category === selectedCategory);
  }

  // Заполняем таблицу
  filteredExpenses.forEach((expense, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${expense.amount}</td>
      <td>${expense.category}</td>
      <td>${expense.description}</td>
      <td>${expense.date}</td>
      <td><button onclick="deleteExpense(${index})">Удалить</button></td>
    `;
    tableBody.appendChild(row);
  });

  // Обновляем общую сумму
  updateTotalAmount();
}

// Функция для расчета общей суммы
function updateTotalAmount() {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalAmountElement.textContent = total.toFixed(2);
}

// Функция для добавления новой траты
function addExpense(event) {
  event.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;
  const date = new Date().toLocaleDateString();

  if (!isNaN(amount) && category && description) {
    expenses.push({ amount, category, description, date });
    localStorage.setItem('expenses', JSON.stringify(expenses));
    form.reset();
    renderExpenses();
  }
}

// Функция для удаления траты
function deleteExpense(index) {
  expenses.splice(index, 1);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();
}

// Обработчик события submit для формы
form.addEventListener('submit', addExpense);

// Обработчик изменения фильтра
filterCategorySelect.addEventListener('change', renderExpenses);

// Инициализация при загрузке страницы
renderExpenses();
