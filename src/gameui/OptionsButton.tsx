interface OptionsButtonProps {
  clickHandler: () => void;
  buttonText: string;
  enabled?: boolean;
}

export default function OptionsButton({clickHandler, buttonText, enabled = true}: OptionsButtonProps) {


  return (
    <button 
      disabled={!enabled}
      type="button" 
      className="w-full disabled:bg-green-800 bg-emerald-600 enabled:hover:bg-emerald-700 text-sm"
      onClick={clickHandler}>{buttonText}
    </button>
  )
}