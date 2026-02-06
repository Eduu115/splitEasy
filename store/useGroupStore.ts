import { create } from 'zustand';
import * as queries from '../database/queries';
import { Group, Member } from '../types';

interface GroupState {
    groups: Group[];
    members: Record<string, Member[]>; // groupId -> members
    loading: boolean;

    loadGroups: () => Promise<void>;
    addGroup: (name: string, emoji: string) => Promise<Group>;
    removeGroup: (id: string) => Promise<void>;

    loadMembers: (groupId: string) => Promise<void>;
    addMember: (groupId: string, name: string, color: string) => Promise<Member>;
}

export const useGroupStore = create<GroupState>((set, get) => ({
    groups: [],
    members: {},
    loading: false,

    loadGroups: async () => {
        set({ loading: true });
        const groups = await queries.getAllGroups();
        set({ groups, loading: false });
    },

    addGroup: async (name, emoji) => {
        const group = await queries.createGroup(name, emoji);
        set((state) => ({ groups: [group, ...state.groups] }));
        return group;
    },

    removeGroup: async (id) => {
        await queries.deleteGroup(id);
        set((state) => ({
            groups: state.groups.filter((g) => g.id !== id),
        }));
    },

    loadMembers: async (groupId) => {
        const members = await queries.getMembersByGroup(groupId);
        set((state) => ({
            members: { ...state.members, [groupId]: members },
        }));
    },

    addMember: async (groupId, name, color) => {
        const member = await queries.addMember(groupId, name, color);
        set((state) => ({
            members: {
                ...state.members,
                [groupId]: [...(state.members[groupId] || []), member],
            },
        }));
        return member;
    },
}));