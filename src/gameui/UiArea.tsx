export default function UiArea(props: React.PropsWithChildren) {

  const alignSelfSetting = props.alignSelf == undefined ? "" : props.alignSelf;

  return (
    <div className={"flex flex-col pointer-events-auto bg-slate-800/50 text-white m-2 p-4 pointer-events-autod rounded-2xl " + alignSelfSetting}>
      {props.children}
    </div>
  )

}