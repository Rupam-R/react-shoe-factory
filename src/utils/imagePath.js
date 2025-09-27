// Build a public image path from a known folder and file name
// Example: getImagePath('banner-img', 'hero.jpg', '/img/banner-fallback.png')
export function getImagePath(folder, name, fallback = '') {
  if (!name) return fallback || '';
  // If already an absolute or root-relative URL, return as-is
  if (name.startsWith('http://') || name.startsWith('https://') || name.startsWith('/')) {
    return name;
  }
  // Otherwise, serve from public folder
  return `/${folder}/${name}`;
}
