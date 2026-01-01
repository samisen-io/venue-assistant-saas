export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount)
}

export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(d)
}

export function formatTime(time: string): string {
    // Check if time matches HH:MM:SS
    const [hours, minutes] = time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours, 10))
    date.setMinutes(parseInt(minutes, 10))

    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    }).format(date)
}

export function formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        maximumFractionDigits: 1,
    }).format(value / 100)
}
