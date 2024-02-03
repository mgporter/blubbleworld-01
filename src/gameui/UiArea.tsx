interface UiAreaProps extends React.PropsWithChildren {
  properties?: string;
}

export default function UiArea({properties = "self-auto", children}: UiAreaProps) {

  return (
    <div className={"flex flex-col bg-slate-800/50 " + 
      "text-white p-4 pointer-events-auto rounded-2xl " + properties}>
      {children}
    </div>
  )

}