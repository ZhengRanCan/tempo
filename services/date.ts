const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isIsoDateString(value: string): boolean {
  return ISO_DATE_PATTERN.test(value)
}

export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getDatesBetweenInclusive(startDate: string, endDate: string): string[] {
  if (!isIsoDateString(startDate) || !isIsoDateString(endDate)) {
    return []
  }

  const dates: string[] = []
  const cursor = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)

  while (cursor <= end) {
    dates.push(formatDate(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates
}

export function addDays(date: string, days: number): string | null {
  if (!isIsoDateString(date)) {
    return null
  }

  const cursor = new Date(`${date}T00:00:00`)
  cursor.setDate(cursor.getDate() + days)

  return formatDate(cursor)
}
