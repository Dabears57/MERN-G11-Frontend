export function buildPath(route: string): string {
  if (import.meta.env.MODE === 'development') {
    return `http://localhost:5050/${route}`;
  }
  return `http://${import.meta.env.VITE_APP_HOST ?? '137.184.95.70'}:5050/${route}`;
}
