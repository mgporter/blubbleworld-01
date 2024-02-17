import { create } from "zustand";

interface StoreState {
  money: number,
  people: number,
  spendMoney: (amount: number) => void;
  incrementPeople: (amount: number) => void;
  decrementOnePerson: () => void;

}

export const useStore = create<StoreState>((set) => ({
  money: 12000,
  people: 82,
  spendMoney: (amount) => set((state) => ({money: state.money - amount})),
  incrementPeople: (amount) => set((state) => ({people: state.people + amount})),
  decrementOnePerson: () => set((state) => ({people: Math.max(state.people - 1, 0)})),
}));