import { Debt, Expense, Member } from '../types';

interface BalanceData {
    balances: Record<string, number>; // memberId -> balance en céntimos
    debts: Debt[];
}

export function calculateBalances(
    members: Member[],
    expenses: Expense[],
    participantsMap: Record<string, string[]> // expenseId -> memberIds[]
): BalanceData {
    // Balance de cada miembro: positivo = le deben, negativo = debe
    const balances: Record<string, number> = {};
    members.forEach((m) => (balances[m.id] = 0));

    for (const expense of expenses) {
        const participantIds = participantsMap[expense.id] || [];
        if (participantIds.length === 0) continue;

        const sharePerPerson = Math.floor(expense.amount / participantIds.length);
        const remainder = expense.amount - sharePerPerson * participantIds.length;

        // El que pagó suma lo que pagó
        balances[expense.paid_by] = (balances[expense.paid_by] || 0) + expense.amount;

        // Cada participante resta su parte
        participantIds.forEach((id, index) => {
            // El primer participante absorbe el remainder por redondeo
            const share = sharePerPerson + (index === 0 ? remainder : 0);
            balances[id] = (balances[id] || 0) - share;
        });
    }

    // Simplificar deudas
    const debts = simplifyDebts(balances);

    return { balances, debts };
}

function simplifyDebts(balances: Record<string, number>): Debt[] {
    const debts: Debt[] = [];

    // Crear listas de deudores y acreedores
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    for (const [id, balance] of Object.entries(balances)) {
        if (balance < 0) debtors.push({ id, amount: -balance });
        if (balance > 0) creditors.push({ id, amount: balance });
    }

    // Ordenar de mayor a menor
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const settled = Math.min(debtor.amount, creditor.amount);

        if (settled > 0) {
            debts.push({
                from: debtor.id,
                to: creditor.id,
                amount: settled,
            });
        }

        debtor.amount -= settled;
        creditor.amount -= settled;

        if (debtor.amount === 0) i++;
        if (creditor.amount === 0) j++;
    }

    return debts;
}