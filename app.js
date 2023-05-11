// Get the current date
const currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Generate the initial calendar for the current month and year
generateCalendar(currentMonth, currentYear);

document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar(currentMonth, currentYear);
});

document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  generateCalendar(currentMonth, currentYear);
});


function generateCalendar(month, year) {
  // Create a new date object for the first day of the month
  const firstDay = new Date(year, month, 1);

  // Calculate the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Calculate the index of the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayIndex = firstDay.getDay();

  // Generate the calendar structure based on the given month and year
  let calendarHTML = '';

  // Add empty squares before the first day of the month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarHTML += `<div style="width: 14.28%; height: 100px;"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarHTML += `
        <div class="day border border-dark p-2" data-date="${year}-${month + 1}-${day}" style="width: 14.28%; height: 120px;">
            ${day}
        </div>
    `;
  }


  // Update the calendar element with the generated structure
  document.getElementById('calendar').innerHTML = calendarHTML;

  // Update the current month and year display
  document.getElementById('currentMonth').innerText = `${getMonthName(month)} ${year}`;

  // Attach click event listeners to the days and load stored colors
  attachDayEventListeners();
}


function getMonthName(month) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month];
}

const colorPicker = document.getElementById('colorPicker');
const closeIcon = colorPicker.querySelector('.close-icon');
const colors = ['#2ecc71', '#58d68d', '#7dcea0', '#a3e4d7', '#d6eaf8'];


const colorCircles = colors.map(color => {
  const circle = document.createElement('div');
  circle.classList.add('color-circle');
  circle.style.backgroundColor = color;
  circle.addEventListener('click', () => {
    colorPicker.classList.add('d-none');
    currentDay.style.backgroundColor = color;
    // Store the selected color in localStorage
    localStorage.setItem(`moodColor-${currentDay.dataset.date}`, color);
  });
  return circle;
});

colorPicker.querySelector('.colors').append(...colorCircles);

let currentDay;

function showColorPicker(event, dayElement) {

  event.stopPropagation();
  currentDay = dayElement;
  colorPicker.style.left = `${event.pageX}px`;
  colorPicker.style.top = `${event.pageY}px`;
  colorPicker.classList.remove('d-none');

  // If the color picker is already visible, hide it first.
  if (colorPicker.style.display === 'block') {
    colorPicker.style.display = 'none';

    // Use setTimeout to introduce a small delay (100ms) before showing the color picker again.
    setTimeout(() => {
      colorPicker.style.display = 'block';
      positionColorPicker(event);
    }, 100);
  } else {
    colorPicker.style.display = 'block';
    positionColorPicker(event);
  }
}

closeIcon.addEventListener('click', () => colorPicker.classList.add('d-none'));

// Make sure to close the color picker when clicking outside of it
document.addEventListener('click', (event) => {
  if (!colorPicker.contains(event.target)) {
    colorPicker.classList.add('d-none');
  }
});

// Add click event to each day square
document.querySelectorAll('.day').forEach(day => {
  day.addEventListener('click', (event) => showColorPicker(event, day));

  // Load stored colors from localStorage
  const storedColor = localStorage.getItem(`moodColor-${day.dataset.date}`);
  if (storedColor) {
    day.style.backgroundColor = storedColor;
  }
});

function attachDayEventListeners() {
  // Add click event to each day square
  document.querySelectorAll('.day').forEach(day => {
    day.addEventListener('click', (event) => showColorPicker(event, day));

    // Load stored colors from localStorage
    const storedColor = localStorage.getItem(`moodColor-${day.dataset.date}`);
    if (storedColor) {
      day.style.backgroundColor = storedColor;
    }
  });
}

// Call the attachDayEventListeners function after generating the initial calendar
attachDayEventListeners();