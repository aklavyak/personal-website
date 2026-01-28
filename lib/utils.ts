export function formatBookDate(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
