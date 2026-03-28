export function buildPath(route: string): string {
  if (import.meta.env.MODE === 'development') {
    return `http://localhost:5050/${route}`;
  }
  return `/${route}`;
}
