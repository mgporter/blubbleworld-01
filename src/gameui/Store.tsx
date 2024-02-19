import { create } from "zustand";
import { C } from "../Constants";

interface StoreState {
  money: number,
  people: number,
  spendMoney: (amount: number) => void;
  incrementPeople: (amount: number) => void;
  incrementOnePerson: () => void;
  decrementPeople: (amount: number) => void;
  decrementOnePerson: () => void;

}

export const useStore = create<StoreState>((set) => ({
  money: C.startingMoney,
  people: 0,
  spendMoney: (amount) => set((state) => ({money: state.money - amount})),
  incrementPeople: (amount) => set((state) => ({people: state.people + amount})),
  decrementPeople: (amount) => set((state) => ({people: Math.max(state.people - amount, 0)})),
  incrementOnePerson: () => set((state) => ({people: state.people + 1})),
  decrementOnePerson: () => set((state) => ({people: Math.max(state.people - 1, 0)})),
}));