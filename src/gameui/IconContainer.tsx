export default function IconContainer({img}: {img: string}) {


  return (
    <div className="border-2 rounded-xl border-gray-700 border-solid size-16 
      flex grow-0 shrink-0 justify-center items-center overflow-hidden">
      <img src={img} className="p-2"></img>
    </div>
  )
}