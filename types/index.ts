export interface Group {
    id: string;
    name: string;
    emoji: string;
    created_at: string;
}

export interface Member {
    id: string;
    group_id: string;
    name: string;
    color: string;
}

export interface Expense {
    id: string;
    group_id: string;
    description: string;
    amount: number; // en céntimos
    paid_by: string; // member_id
    created_at: string;
}

export interface ExpenseParticipant {
    expense_id: string;
    member_id: string;
}

export interface Debt {
    from: string; // member_id deudor
    to: string;   // member_id acreedor
    amount: number;
}