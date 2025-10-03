// Festival Schedule App - Main JavaScript functionality

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(time12h) {
  // Handle time ranges (e.g., "10:00 AM - 5:00 PM")
  if (time12h.includes(' - ')) {
    const [start, end] = time12h.split(' - ');
    return `${convertTo24Hour(start)} - ${convertTo24Hour(end)}`;
  }

  // Handle special cases
  if (time12h === 'After Dark') return '23:00';
  if (time12h === 'All Weekend') return '00:00';
  if (time12h.includes('Saturday')) return '10:00';

  // Parse 12-hour format
  const match = time12h.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return time12h;

  let hour = parseInt(match[1]);
  const minute = match[2];
  const ampm = match[3].toUpperCase();

  // Convert to 24-hour format
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, '0')}:${minute}`;
}

// Helper function to convert 24-hour time to 12-hour display format
function formatTimeDisplay(time24h) {
  // Handle time ranges
  if (time24h.includes(' - ')) {
    const [start, end] = time24h.split(' - ');
    return `${formatTimeDisplay(start)} - ${formatTimeDisplay(end)}`;
  }

  // Handle special cases
  if (time24h === '23:00') return 'After Dark';
  if (time24h === '00:00') return 'All Weekend';
  if (time24h === '10:00' && time24h.includes('Saturday'))
    return 'Saturday 10am-5pm';

  // Parse 24-hour format
  const match = time24h.match(/(\d{1,2}):(\d{2})/);
  if (!match) return time24h;

  let hour = parseInt(match[1]);
  const minute = match[2];

  // Convert to 12-hour format
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;

  return `${hour}:${minute} ${ampm}`;
}

function renderSchedule(filteredEvents = events) {
  const scheduleContainer = document.getElementById('schedule');

  if (filteredEvents.length === 0) {
    scheduleContainer.innerHTML =
      '<div class="no-events">No events found matching your criteria.</div>';
    return;
  }

  // Group events by day
  const eventsByDay = {};
  filteredEvents.forEach(event => {
    if (!eventsByDay[event.day]) {
      eventsByDay[event.day] = [];
    }
    eventsByDay[event.day].push(event);
  });

  // Sort events within each day by time
  Object.keys(eventsByDay).forEach(day => {
    eventsByDay[day].sort((a, b) => {
      // Convert times to 24-hour format for sorting
      const timeA24 = convertTo24Hour(a.time);
      const timeB24 = convertTo24Hour(b.time);

      // Simple string comparison works for 24-hour format
      return timeA24.localeCompare(timeB24);
    });
  });

  let html = '';

  // Render each day
  const dayOrder = ['friday', 'saturday', 'sunday', 'all'];
  dayOrder.forEach(day => {
    if (eventsByDay[day] && eventsByDay[day].length > 0) {
      const dayName = day.charAt(0).toUpperCase() + day.slice(1);
      html += `
        <div class="day-section">
          <div class="day-header">${dayName}</div>
          <div class="events-container">
      `;

      eventsByDay[day].forEach(event => {
        const locationClass = `location-${event.location}`;
        const displayLocation = locationMap[event.location] || event.location;

        html += `
          <div class="event">
            <div class="event-time">${formatTimeDisplay(
              convertTo24Hour(event.time)
            )}</div>
            <div class="event-title">${event.title}</div>
            <div class="event-location ${locationClass}">${displayLocation}</div>
            ${
              event.description
                ? `<div class="event-description">${event.description}</div>`
                : ''
            }
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }
  });

  scheduleContainer.innerHTML = html;
}

function filterEvents() {
  const dayFilter = document.getElementById('dayFilter').value;
  const locationFilter = document.getElementById('locationFilter').value;
  const categoryFilter = document.getElementById('categoryFilter').value;
  const searchTerm = document.getElementById('searchBox').value.toLowerCase();

  let filtered = events.filter(event => {
    const matchesDay = dayFilter === 'all' || event.day === dayFilter;
    const matchesLocation =
      locationFilter === 'all' || event.location === locationFilter;
    const matchesCategory =
      categoryFilter === 'all' || event.category === categoryFilter;
    const matchesSearch =
      searchTerm === '' ||
      event.title.toLowerCase().includes(searchTerm) ||
      (event.description &&
        event.description.toLowerCase().includes(searchTerm)) ||
      (locationMap[event.location] &&
        locationMap[event.location].toLowerCase().includes(searchTerm)) ||
      (event.category &&
        getCategoryName(event.category).toLowerCase().includes(searchTerm));

    return matchesDay && matchesLocation && matchesCategory && matchesSearch;
  });

  renderSchedule(filtered);
}

// Populate location filter dropdown dynamically
function populateLocationFilter() {
  const locationFilter = document.getElementById('locationFilter');

  // Add options from locationMap
  Object.entries(locationMap).forEach(([key, displayName]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = displayName;
    locationFilter.appendChild(option);
  });
}

// Populate category filter dropdown dynamically
function populateCategoryFilter() {
  const categoryFilter = document.getElementById('categoryFilter');

  // Add options from categories
  Object.entries(categories).forEach(([key, category]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${category.icon} ${category.name}`;
    categoryFilter.appendChild(option);
  });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Populate filters
  populateLocationFilter();
  populateCategoryFilter();

  // Event listeners
  document.getElementById('dayFilter').addEventListener('change', filterEvents);
  document
    .getElementById('locationFilter')
    .addEventListener('change', filterEvents);
  document
    .getElementById('categoryFilter')
    .addEventListener('change', filterEvents);
  document.getElementById('searchBox').addEventListener('input', filterEvents);

  // Initial render
  renderSchedule();
});
