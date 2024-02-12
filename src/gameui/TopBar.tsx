import { useStore } from "./Store"
import { UiProps } from "./UiProperties"

export default function TopBar() {

  const people = useStore((state) => state.people);
  const money = useStore((state) => state.money);

  return (
    <div className='topbar grow-0 h-10 m-2 flex gap-4 justify-end'>
      <div className={UiProps + "select-none rounded-3xl flex items-center py-2 px-4"}><p>People: {people}</p></div>
      <div className={UiProps + "select-none rounded-3xl flex items-center py-2 px-4"}><p>Money: {money}</p></div>
      <div className={UiProps + "select-none rounded-3xl flex items-center py-2 px-4"}><p>Options</p></div>
    </div>
  )
}