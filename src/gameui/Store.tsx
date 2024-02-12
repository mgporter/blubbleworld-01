import { create } from "zustand";

interface StoreState {
  money: number,
  people: number,
  spendMoney: (amount: number) => void;
}

export const useStore = create<StoreState>((set) => ({
  money: 12000,
  people: 82,
  spendMoney: (amount) => set((state) => ({money: state.money - amount})),
}));