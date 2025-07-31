// Глобальные переменные
let currentDate = new Date();
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let selectedDate = null;

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
  initializeEventListeners();
  updateCalendar();
  updateExpensesList();
  updateSummary();
  setTodayDate();
});

// Инициализация обработчиков событий
function initializeEventListeners() {
  // Навигация по месяцам
  document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
  document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
  
  // Добавление расхода
  document.getElementById('addExpenseBtn').addEventListener('click', addExpense);
  
  // Фильтры
  document.getElementById('filterCategory').addEventListener('change', filterExpenses);
  document.getElementById('startDate').addEventListener('change', filterExpenses);
  document.getElementById('endDate').addEventListener('change', filterExpenses);
}

// Установка сегодняшней даты в форму
function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('expenseDate').value = today;
}

// Изменение месяца
function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  updateCalendar();
}

// Обновление календаря
function updateCalendar() {
  const calendarGrid = document.getElementById('calendarGrid');
  calendarGrid.innerHTML = '';

  // Обновление заголовка с текущей датой
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                     'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  document.getElementById('currentDate').textContent = 
    `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // Получаем первый день месяца и количество дней
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // День недели первого дня месяца (0 - воскресенье, 1 - понедельник, ...)
  const firstDayOfWeek = firstDay.getDay() || 7; // Преобразуем 0 в 7 (воскресенье)

  // Пустые ячейки в начале
  for (let i = 1; i < firstDayOfWeek; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day';
    calendarGrid.appendChild(emptyDay);
  }

  // Дни месяца
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    
    // Проверяем, есть ли расходы на этот день
    const dayExpenses = expenses.filter(expense => expense.date === dateString);
    const hasExpenses = dayExpenses.length > 0;
    
    // Проверяем, является ли день сегодняшним
    const isToday = date.toDateString() === today.toDateString();
    
    // Проверяем, выбран ли день
    const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
    
    if (isToday) dayElement.classList.add('today');
    if (hasExpenses) dayElement.classList.add('has-expenses');
    if (isSelected) dayElement.classList.add('selected');
    
    dayElement.innerHTML = `
      <div class="day-number">${day}</div>
      ${hasExpenses ? `<div class="day-expenses">${dayExpenses.length} трат</div>` : ''}
    `;
    
    dayElement.onclick = () => selectDate(date);
    
    calendarGrid.appendChild(dayElement);
  }
}

// Выбор даты
function selectDate(date) {
  selectedDate = date;
  document.getElementById('expenseDate').value = date.toISOString().split('T')[0];
  updateCalendar();
}

// Добавление расхода
function addExpense() {
  const date = document.getElementById('expenseDate').value;
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const category = document.getElementById('expenseCategory').value;
  const description = document.getElementById('expenseDescription').value;

  if (!date || !amount || !category) {
    alert('Пожалуйста, заполните все обязательные поля');
    return;
  }

  const expense = {
    id: Date.now(),
    date: date,
    amount: amount,
    category: category,
    description: description
  };

  expenses.push(expense);
  localStorage.setItem('expenses', JSON.stringify(expenses));

  // Очистка формы
  document.getElementById('expenseAmount').value = '';
  document.getElementById('expenseCategory').value = '';
  document.getElementById('expenseDescription').value = '';

  // Обновление интерфейса
  updateCalendar();
  updateExpensesList();
  updateSummary();
}

// Удаление расхода
function deleteExpense(id) {
  expenses = expenses.filter(expense => expense.id !== id);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  updateCalendar();
  updateExpensesList();
  updateSummary();
}

// Обновление списка расходов
function updateExpensesList() {
  const tableBody = document.getElementById('expensesTableBody');
  tableBody.innerHTML = '';

  // Сортировка по дате (новые первыми)
  const filteredExpenses = getFilteredExpenses().sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  filteredExpenses.forEach(expense => {
    const row = document.createElement('tr');
    const expenseDate = new Date(expense.date);
    const formattedDate = expenseDate.toLocaleDateString('ru-RU');
    
    row.innerHTML = `
      <td>${formattedDate}</td>
      <td>${expense.category}</td>
      <td>${expense.amount.toFixed(2)} ₽</td>
      <td>${expense.description || '-'}</td>
      <td>
        <button class="delete-btn" onclick="deleteExpense(${expense.id})">Удалить</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Получение отфильтрованных расходов
function getFilteredExpenses() {
  let filtered = [...expenses];

  // Фильтр по категории
  const categoryFilter = document.getElementById('filterCategory').value;
  if (categoryFilter) {
    filtered = filtered.filter(expense => expense.category === categoryFilter);
  }

  // Фильтр по дате
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if (startDate) {
    filtered = filtered.filter(expense => expense.date >= startDate);
  }

  if (endDate) {
    filtered = filtered.filter(expense => expense.date <= endDate);
  }

  return filtered;
}

// Фильтрация расходов
function filterExpenses() {
  updateExpensesList();
  updateSummary();
}

// Обновление сводки
function updateSummary() {
  const filteredExpenses = getFilteredExpenses();
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expenseCount = filteredExpenses.length;
  const averageAmount = expenseCount > 0 ? (totalAmount / expenseCount).toFixed(2) : 0;

  document.getElementById('totalAmount').textContent = totalAmount.toFixed(2) + ' ₽';
  document.getElementById('averageAmount').textContent = averageAmount + ' ₽';
  document.getElementById('expenseCount').textContent = expenseCount;
}

// Глобальная функция для удаления расходов (вызывается из HTML)
window.deleteExpense = deleteExpense;
