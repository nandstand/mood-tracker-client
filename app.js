const serverUrl = 'http://localhost:3000';


// Get the current date
const currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Generate the initial calendar for the current month and year
generateCalendar(currentMonth, currentYear);

// Button event listeners for the previous and next buttons
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

// Generate the calendar for the given month and year
function generateCalendar(month, year) {
  // Create a new date object for the first day of the month
  const firstDay = new Date(year, month, 1);

  // Calculate the number of days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // Next month's previous month's last day... 0 = last day of previous month

  // Calculate the index of the first day in the calendar grid
  const firstDayIndex = firstDay.getDay();

  // Generate the calendar structure based on the given month and year
  let calendarHTML = '';

  // Add empty squares before the first day of the month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarHTML += `<div style="width: 14.28%; height: 100px;"></div>`;
  }

  // Add a numbered square for each day of the month
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
} // End of generateCalendar function


function getMonthName(month) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return monthNames[month];
}

// Color picker

const colorPicker = document.getElementById('colorPicker');
const closeIcon = colorPicker.querySelector('.close-icon');
const colors = ['#2ecc71', '#58d68d', '#7dcea0', '#a3e4d7', '#d6eaf8', '#f5f5f5'];


const colorCircles = colors.map(color => {
  const circle = document.createElement('div');
  circle.classList.add('color-circle');
  circle.style.backgroundColor = color;
  circle.addEventListener('click', () => {
    colorPicker.classList.add('d-none');
    currentDay.style.backgroundColor = color;

    fetch(`${serverUrl}/mood/${currentDay.dataset.date}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ color: color }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
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

    // Small 100ms delay before showing the color picker again
    setTimeout(() => {
      colorPicker.style.display = 'block';
    }, 100);
  } else {
    colorPicker.style.display = 'block';
  }
}

closeIcon.addEventListener('click', () => colorPicker.classList.add('d-none'));

//  close the color picker when clicking outside of it
document.addEventListener('click', (event) => {
  if (!colorPicker.contains(event.target)) {
    colorPicker.classList.add('d-none');
  }
});

// Attach event listeners to each day
// This function is called once at startup
// and after changing the month

// This function also loads the stored colors for each day
// This function does a lot of things
// Too many things

function attachDayEventListeners() {
  document.querySelectorAll('.day').forEach(day => {
    day.addEventListener('click', (event) => showColorPicker(event, day));

    fetch(`${serverUrl}/mood/${day.dataset.date}`)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            // If the mood for this date is not found, set the color to the default
            throw new Error('404');
          } else {
            throw new Error('Network response was not ok');
          }
        }
        return response.json();
      })
      .then(mood => {
        day.style.backgroundColor = mood.color;
      })
      .catch(error => {
        if (error.message === '404') {
          // Default color for dates with no mood set
          day.style.backgroundColor = '#f5f5f5';
        } else {
          console.error('Error:', error);
        }
      });

  });
}


// Call the attachDayEventListeners function after generating the initial calendar
attachDayEventListeners();