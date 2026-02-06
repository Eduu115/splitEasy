import { create } from 'zustand';
import * as queries from '../database/queries';
import { Expense } from '../types';

interface ExpenseState {
  expenses: Record<string, Expense[]>; // groupId -> expenses
  loading: boolean;

  loadExpenses: (groupId: string) => Promise<void>;
  addExpense: (
    groupId: string,
    description: string,
    amount: number,
    paidBy: string,
    participantIds: string[]
  ) => Promise<Expense>;
  removeExpense: (groupId: string, expenseId: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  expenses: {},
  loading: false,

  loadExpenses: async (groupId) => {
    set({ loading: true });
    const expenses = await queries.getExpensesByGroup(groupId);
    set((state) => ({
      expenses: { ...state.expenses, [groupId]: expenses },
      loading: false,
    }));
  },

  addExpense: async (groupId, description, amount, paidBy, participantIds) => {
    const expense = await queries.createExpense(groupId, description, amount, paidBy, participantIds);
    set((state) => ({
      expenses: {
        ...state.expenses,
        [groupId]: [expense, ...(state.expenses[groupId] || [])],
      },
    }));
    return expense;
  },

  removeExpense: async (groupId, expenseId) => {
    await queries.deleteExpense(expenseId);
    set((state) => ({
      expenses: {
        ...state.expenses,
        [groupId]: (state.expenses[groupId] || []).filter((e) => e.id !== expenseId),
      },
    }));
  },
}));