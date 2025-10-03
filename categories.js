// Category definitions for festival events
const categories = {
  'Arts & Crafts': {
    name: 'Arts & Crafts',
    description: 'Creative activities and hands-on workshops',
    icon: '🎨',
  },
  Education: {
    name: 'Education',
    description: 'Workshops, talks, and learning sessions',
    icon: '📚',
  },
  Entertainment: {
    name: 'Entertainment',
    description: 'Performances, shows, and entertainment',
    icon: '🎭',
  },
  Music: {
    name: 'Music',
    description: 'Musical performances and activities',
    icon: '🎵',
  },
  'Physical Activity': {
    name: 'Physical Activity',
    description: 'Sports, exercise, and movement activities',
    icon: '🏃',
  },
  'Holistic Therapies': {
    name: 'Holistic Therapies',
    description: 'Wellness, massage, and healing services',
    icon: '🧘',
  },
  'Food & Drink': {
    name: 'Food & Drink',
    description: 'Meals, cooking workshops, and beverages',
    icon: '🍽️',
  },
  Other: {
    name: 'Other',
    description: 'Miscellaneous activities and information',
    icon: '📌',
  },
};

// Helper function to get category name
function getCategoryName(categoryKey) {
  return categories[categoryKey]?.name || categoryKey;
}

// Helper function to get category description
function getCategoryDescription(categoryKey) {
  return categories[categoryKey]?.description || '';
}

// Helper function to get category icon
function getCategoryIcon(categoryKey) {
  return categories[categoryKey]?.icon || '📅';
}
