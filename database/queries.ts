import * as Crypto from 'expo-crypto';
import { Expense, ExpenseParticipant, Group, Member } from '../types';
import { getDatabase } from './schema';

// ========== GRUPOS ==========

export async function getAllGroups(): Promise<Group[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Group>('SELECT * FROM groups ORDER BY created_at DESC');
}

export async function createGroup(name: string, emoji: string): Promise<Group> {
    const db = await getDatabase();
    const id = Crypto.randomUUID();
    await db.runAsync(
        'INSERT INTO groups (id, name, emoji) VALUES (?, ?, ?)',
        [id, name, emoji]
    );
    const group = await db.getFirstAsync<Group>('SELECT * FROM groups WHERE id = ?', [id]);
    return group!;
}

export async function deleteGroup(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM groups WHERE id = ?', [id]);
}

// ========== MIEMBROS ==========

export async function getMembersByGroup(groupId: string): Promise<Member[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Member>('SELECT * FROM members WHERE group_id = ?', [groupId]);
}

export async function addMember(groupId: string, name: string, color: string): Promise<Member> {
    const db = await getDatabase();
    const id = Crypto.randomUUID();
    await db.runAsync(
        'INSERT INTO members (id, group_id, name, color) VALUES (?, ?, ?, ?)',
        [id, groupId, name, color]
    );
    const member = await db.getFirstAsync<Member>('SELECT * FROM members WHERE id = ?', [id]);
    return member!;
}

// ========== GASTOS ==========

export async function getExpensesByGroup(groupId: string): Promise<Expense[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Expense>(
        'SELECT * FROM expenses WHERE group_id = ? ORDER BY created_at DESC',
        [groupId]
    );
}

export async function createExpense(
    groupId: string,
    description: string,
    amount: number,
    paidBy: string,
    participantIds: string[]
): Promise<Expense> {
    const db = await getDatabase();
    const id = Crypto.randomUUID();

    await db.runAsync(
        'INSERT INTO expenses (id, group_id, description, amount, paid_by) VALUES (?, ?, ?, ?, ?)',
        [id, groupId, description, amount, paidBy]
    );

    for (const memberId of participantIds) {
        await db.runAsync(
            'INSERT INTO expense_participants (expense_id, member_id) VALUES (?, ?)',
            [id, memberId]
        );
    }

    const expense = await db.getFirstAsync<Expense>('SELECT * FROM expenses WHERE id = ?', [id]);
    return expense!;
}

export async function getExpenseParticipants(expenseId: string): Promise<ExpenseParticipant[]> {
    const db = await getDatabase();
    return await db.getAllAsync<ExpenseParticipant>(
        'SELECT * FROM expense_participants WHERE expense_id = ?',
        [expenseId]
    );
}

export async function deleteExpense(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
}

// ========== DEUDAS ==========
export async function getParticipantsMapByGroup(
    groupId: string
): Promise<Record<string, string[]>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ expense_id: string; member_id: string }>(
        `SELECT ep.expense_id, ep.member_id
       FROM expense_participants ep
       JOIN expenses e ON e.id = ep.expense_id
       WHERE e.group_id = ?`,
        [groupId]
    );

    const map: Record<string, string[]> = {};
    for (const row of rows) {
        if (!map[row.expense_id]) map[row.expense_id] = [];
        map[row.expense_id].push(row.member_id);
    }
    return map;
}