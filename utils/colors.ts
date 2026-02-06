export const MEMBER_COLORS = [
    '#FF6B6B', // rojo
    '#4ECDC4', // turquesa
    '#45B7D1', // azul
    '#96CEB4', // verde
    '#FFEAA7', // amarillo
    '#DDA0DD', // lila
    '#FF8C42', // naranja
    '#6C5CE7', // morado
    '#A8E6CF', // menta
    '#F38181', // coral
];

export function getNextColor(usedColors: string[]): string {
    const available = MEMBER_COLORS.filter((c) => !usedColors.includes(c));
    return available.length > 0 ? available[0] : MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)];
}