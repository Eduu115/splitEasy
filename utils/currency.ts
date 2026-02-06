// pa el cambio de moneda

export function formatAmount(cents: number): string {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
}

export function eurosToCents(euros: number): number {
    return Math.round(euros * 100);
}

export function centsToEuros(cents: number): number {
    return cents / 100;
}