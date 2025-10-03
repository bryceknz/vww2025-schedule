# VWW 2026 Festival Schedule

A simple, responsive web app for navigating the VWW 2026 Festival schedule.

## Features

- **Clean Timeline View**: All events organized chronologically by day
- **Location Filtering**: Filter events by specific locations (Potting Shed, Sports Hall, etc.)
- **Search Functionality**: Search for specific activities or topics
- **Mobile-Friendly**: Responsive design that works on all devices
- **Color-Coded Locations**: Easy visual identification of event locations

## Deployment

### Vercel (Recommended)

1. Push this repository to GitHub
2. Connect your GitHub account to [Vercel](https://vercel.com)
3. Import this repository
4. Deploy with zero configuration

### Netlify

1. Push this repository to GitHub
2. Connect your GitHub account to [Netlify](https://netlify.com)
3. Import this repository
4. Deploy with zero configuration

### GitHub Pages

1. Push this repository to GitHub
2. Go to repository Settings > Pages
3. Select "Deploy from a branch" and choose "main"
4. Your site will be available at `https://yourusername.github.io/vww2026`

## Local Development

Simply open `index.html` in your web browser - no build process required!

## File Structure

- `index.html` - Main application file (HTML, CSS, and JavaScript)
- `schedule.txt` - Original schedule data
- `vercel.json` - Vercel deployment configuration
- `netlify.toml` - Netlify deployment configuration
- `README.md` - This file

## Customization

To update the schedule:

1. Edit the `events` array in the JavaScript section of `index.html`
2. Follow the existing data structure with `day`, `time`, `title`, `location`, and `description` fields
3. Redeploy to your hosting platform

## Browser Support

Works in all modern browsers including:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers
