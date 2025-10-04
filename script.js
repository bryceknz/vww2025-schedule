// Festival Schedule App - Main JavaScript functionality

// Time Format functionality
class TimeFormat {
  constructor() {
    this.toggleButton = document.getElementById('timeFormatToggle');
    this.toggleIcon = this.toggleButton?.querySelector('.header-toggle-icon');
    this.storageKey = 'vww2025-time-format';
    this.currentFormat = '12hr'; // Default to 12-hour format
    this.init();
  }

  init() {
    if (!this.toggleButton) return;

    // Set initial format based on stored preference
    this.setInitialFormat();

    // Add event listener for toggle button
    this.toggleButton.addEventListener('click', () => this.toggleFormat());
  }

  setInitialFormat() {
    const storedFormat = localStorage.getItem(this.storageKey);

    if (storedFormat) {
      this.currentFormat = storedFormat;
    }

    this.updateButtonDisplay();
  }

  toggleFormat() {
    this.currentFormat = this.currentFormat === '12hr' ? '24hr' : '12hr';
    this.updateButtonDisplay();
    localStorage.setItem(this.storageKey, this.currentFormat);

    // Add click animation
    this.animateClick();

    // Re-render the schedule with new time format
    filterEvents();
  }

  animateClick() {
    if (this.toggleButton) {
      this.toggleButton.style.transform = 'scale(1.2)';
      setTimeout(() => {
        this.toggleButton.style.transform = 'scale(1)';
      }, 150);
    }
  }

  updateButtonDisplay() {
    if (this.toggleIcon) {
      // Static text showing both formats
      this.toggleIcon.textContent = '🕐';
    }
  }

  formatTime(timeString) {
    if (this.currentFormat === '24hr') {
      return this.formatTo24Hour(timeString);
    } else {
      return this.formatTo12Hour(timeString);
    }
  }

  formatTo24Hour(timeString) {
    // Handle time ranges (e.g., "10:00 AM - 5:00 PM")
    if (timeString.includes(' - ')) {
      const [start, end] = timeString.split(' - ');
      return `${this.formatTo24Hour(start)} - ${this.formatTo24Hour(end)}`;
    }

    // Handle special cases
    if (timeString === 'After Dark') return '18:30';
    if (timeString === 'All Weekend') return '00:00';
    if (timeString === 'midnight') return '00:00';
    if (timeString.includes('Saturday')) return '10:00';

    // Parse 12-hour format
    const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return timeString;

    let hour = parseInt(match[1]);
    const minute = match[2];
    const ampm = match[3].toUpperCase();

    // Convert to 24-hour format
    if (ampm === 'PM' && hour !== 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;

    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }

  formatTo12Hour(timeString) {
    // Handle time ranges
    if (timeString.includes(' - ')) {
      const [start, end] = timeString.split(' - ');
      return `${this.formatTo12Hour(start)} - ${this.formatTo12Hour(end)}`;
    }

    // Handle special cases
    if (timeString === '23:00') return 'After Dark';
    if (timeString === '00:00') return 'midnight';
    if (timeString === '10:00' && timeString.includes('Saturday'))
      return 'Saturday 10am-5pm';

    // If already in 12-hour format (contains AM/PM), return as-is
    if (timeString.includes('AM') || timeString.includes('PM')) {
      return timeString;
    }

    // Parse 24-hour format
    const match = timeString.match(/(\d{1,2}):(\d{2})/);
    if (!match) return timeString;

    let hour = parseInt(match[1]);
    const minute = match[2];

    // Convert to 12-hour format
    const ampm = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;

    return `${hour}:${minute} ${ampm}`;
  }
}

// Dark Mode functionality
class DarkMode {
  constructor() {
    this.toggleButton = document.getElementById('darkModeToggle');
    this.toggleIcon = this.toggleButton?.querySelector('.header-toggle-icon');
    this.storageKey = 'vww2025-theme-preference';
    this.init();
  }

  init() {
    if (!this.toggleButton) return;

    // Set initial theme based on stored preference or system preference
    this.setInitialTheme();

    // Add event listener for toggle button
    this.toggleButton.addEventListener('click', () => this.toggleTheme());

    // Listen for system theme changes
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', e => {
        if (!this.hasStoredPreference()) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
  }

  setInitialTheme() {
    const storedPreference = localStorage.getItem(this.storageKey);

    if (storedPreference) {
      // User has a stored preference
      this.applyTheme(storedPreference);
    } else {
      // Use system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      this.applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  toggleTheme() {
    // Get current theme, considering both data-theme attribute and system preference
    const dataTheme = document.documentElement.getAttribute('data-theme');
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    // Determine current theme: explicit data-theme takes precedence, otherwise use system preference
    const currentTheme = dataTheme || (systemPrefersDark ? 'dark' : 'light');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    this.applyTheme(newTheme);
    localStorage.setItem(this.storageKey, newTheme);

    // Add click animation
    this.animateClick();
  }

  animateClick() {
    if (this.toggleButton) {
      this.toggleButton.style.transform = 'scale(1.2)';
      setTimeout(() => {
        this.toggleButton.style.transform = 'scale(1)';
      }, 150);
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    if (this.toggleIcon) {
      this.toggleIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  hasStoredPreference() {
    return localStorage.getItem(this.storageKey) !== null;
  }
}

// Global time format instance
let timeFormat;

// Helper function to check if an event has already passed
function isEventPast(event) {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

  // Convert JavaScript day to festival day (1-based indexing)
  // JavaScript: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // Festival: 1=Fri, 2=Sat, 3=Sun, 4=All Weekend
  const jsToFestivalDay = {
    5: 1, // Friday
    6: 2, // Saturday
    0: 3, // Sunday
  };

  const currentFestivalDay = jsToFestivalDay[currentDayOfWeek];

  // Map day names to festival day numbers (1-based indexing)
  const dayMap = {
    friday: 1, // Friday = 1
    saturday: 2, // Saturday = 2
    sunday: 3, // Sunday = 3
    all: 4, // All Weekend = 4
  };

  const eventDay = dayMap[event.day];

  // Handle special cases
  if (eventDay === 4) return false; // Don't hide "all weekend" events
  if (event.time === 'After Dark') return false; // Don't hide "After Dark" events
  if (event.time === 'All Weekend') return false; // Don't hide "All Weekend" events

  // If current day is not a festival day (Mon-Thu), don't hide any events
  if (currentFestivalDay === undefined) return false;

  // If we're past the event day, it's definitely past
  if (currentFestivalDay > eventDay) return true;

  // If we're on the same day, check the time
  if (currentFestivalDay === eventDay) {
    // Handle time ranges (e.g., "10:00 AM - 5:00 PM")
    if (event.time.includes(' - ')) {
      const [startTime, endTime] = event.time.split(' - ');
      const startMinutes = parseTimeToMinutes(startTime);
      const endMinutes = parseTimeToMinutes(endTime);

      // If current time is past the end time, event is over
      return currentTime > endMinutes;
    }

    // Handle single times
    const eventMinutes = parseTimeToMinutes(event.time);
    return currentTime > eventMinutes;
  }

  // If we're before the event day, it's in the future
  return false;
}

// Helper function to parse time string to minutes since midnight
function parseTimeToMinutes(timeStr) {
  // Handle special cases
  if (timeStr === 'midnight') return 24 * 60; // End of day (1440 minutes)
  if (timeStr === 'After Dark') return 23 * 60; // 11 PM

  // Parse standard time format (e.g., "7:30 AM", "6:00 PM")
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;

  let hour = parseInt(match[1]);
  const minute = parseInt(match[2]);
  const ampm = match[3].toUpperCase();

  // Convert to 24-hour format
  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  return hour * 60 + minute;
}

// Helper function to convert 12-hour time to 24-hour format (for sorting)
function convertTo24Hour(time12h) {
  // Handle time ranges (e.g., "10:00 AM - 5:00 PM")
  if (time12h.includes(' - ')) {
    const [start, end] = time12h.split(' - ');
    return `${convertTo24Hour(start)} - ${convertTo24Hour(end)}`;
  }

  // Handle special cases
  if (time12h === 'After Dark') return '23:00';
  if (time12h === 'All Weekend') return '00:00';
  if (time12h === 'midnight') return '00:00';
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
      const dayName =
        day === 'all'
          ? 'All Weekend'
          : day.charAt(0).toUpperCase() + day.slice(1);
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
            <div class="event-time">${
              timeFormat ? timeFormat.formatTime(event.time) : event.time
            }</div>
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

    // Only filter out past events when showing "All Days"
    // When user manually selects a specific day, show ALL events for that day
    const isNotPast = dayFilter === 'all' ? !isEventPast(event) : true;

    return (
      matchesDay &&
      matchesLocation &&
      matchesCategory &&
      matchesSearch &&
      isNotPast
    );
  });

  renderSchedule(filtered);
}

// Update day filter to show all days (including past ones)
function updateDayFilter() {
  const dayFilter = document.getElementById('dayFilter');

  // Clear existing options except "All Days"
  const allDaysOption = dayFilter.querySelector('option[value="all"]');
  dayFilter.innerHTML = '';
  dayFilter.appendChild(allDaysOption);

  // Add all day options (including past days)
  const dayOptions = [
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  dayOptions.forEach(day => {
    const option = document.createElement('option');
    option.value = day.value;
    option.textContent = day.label;
    dayFilter.appendChild(option);
  });
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
  // Initialize time format
  timeFormat = new TimeFormat();

  // Initialize dark mode
  new DarkMode();

  // Populate filters
  updateDayFilter();
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

  // Initial render with past events filtering
  filterEvents();
});
