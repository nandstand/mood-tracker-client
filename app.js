const serverUrl = 'http://localhost:3000';


// Get the current date
const currentDate = new Date();
let currentMonth = currentDate.getMonth(); // 0-indexed
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

  // Index representing the day of the week for the first day of the month (as in... 0 = Sunday, 1 = Monday, etc)
  const firstDayIndex = firstDay.getDay();

  // Generate the calendar structure based on the given month and year
  let calendarHTML = '';

  // Add empty squares before the first day of the month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarHTML += `<div style="width: 14.28%; height: 120px;"></div>`;
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
  setupDays();
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
const colors = ['#46DA86', '#E3E978', '#FDAC60', '#FF6464', '#f5f5f5'];

// Create a color circle for each color
const colorCircles = colors.map(color => {

  // Circle element
  const circle = document.createElement('div');
  circle.classList.add('color-circle');
  circle.style.backgroundColor = color;
  
  // Click event listener
  circle.addEventListener('click', () => {
    colorPicker.classList.add('d-none'); // Hide the color picker on circle click
    currentDay.style.backgroundColor = color; // Change the day's color

    // Send the color to the server
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

// Put the colors in the picker element
colorPicker.querySelector('.colors').append(...colorCircles);

let currentDay; // The day element that was clicked
function showColorPicker(event, dayElement) {

  event.stopPropagation(); // Prevent the document event defined below from firing
  currentDay = dayElement;

  // Show the color picker at the click event's position
  colorPicker.style.left = `${event.pageX}px`; // Position of the click event in document
  colorPicker.style.top = `${event.pageY}px`;
  colorPicker.classList.remove('d-none');

  // If the color picker is already visible, hide it and show again
  if ( !colorPicker.classList.contains('d-none') ) {
    colorPicker.classList.add('d-none');
    // Small delay
    setTimeout(() => {
      colorPicker.classList.remove('d-none');
    }, 100);
  }

  
} // end showColorPicker function

closeIcon.addEventListener('click', () => colorPicker.classList.add('d-none'));

//  close the color picker when clicking outside of it
document.addEventListener('click', (event) => {
  if ( !colorPicker.contains(event.target) ) { // click event not within / below color picker
    colorPicker.classList.add('d-none');
  }
});


// Setup the days of the calendar
// Retrieves the color data for the entire month and sets the colors of the days
// Also adds a click event listener to each day

function setupDays() {
  // Fetch mood data for the current month
  fetch(`${serverUrl}/mood/${currentYear}/${currentMonth + 1}`) // 1-indexed month
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response not a-ok');
      }
      return response.json();
    })
    .then(moods => {
      // Create a map of date => color 
      const moodMap = {};
      moods.forEach(mood => {
        // Get rid of padding zeros in the date...
        // Could do this server-side but I think it makes more sense to do it here
        const [year, month, day] = mood.date.split('-'); 
        const formattedDate = `${year}-${parseInt(month)}-${parseInt(day)}`;
        moodMap[formattedDate] = mood.color;
      });

      // Add click event to each day square and set the color
      document.querySelectorAll('.day').forEach(day => {
        day.addEventListener('click', (event) => showColorPicker(event, day));

        // Set the color based on the fetched data or use the default color
        const colorData = moodMap[day.dataset.date];
        day.style.backgroundColor = colorData || '#f5f5f5';
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
}
