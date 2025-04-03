import { Button } from "@/components/ui/button";

interface ResponseOptionProps {
  option: string;
  label: string;
  icon: string;
  color: string;
  onSelect: (option: string) => void;
  disabled: boolean;
}

const ResponseOption = ({
  option,
  label,
  icon,
  color,
  onSelect,
  disabled
}: ResponseOptionProps) => {
  const colorClasses = {
    primary: "border-primary bg-white text-secondary hover:bg-primary-light active:bg-primary",
    secondary: "border-secondary bg-white text-secondary hover:bg-secondary-light active:bg-secondary",
    "hyfe-grey": "border-hyfe-grey bg-white text-secondary hover:bg-hyfe-lightgrey active:bg-hyfe-grey",
    // Keep backwards compatibility
    blue: "border-primary bg-white text-secondary hover:bg-primary-light active:bg-primary",
    orange: "border-secondary bg-white text-secondary hover:bg-secondary-light active:bg-secondary",
    gray: "border-hyfe-grey bg-white text-secondary hover:bg-hyfe-lightgrey active:bg-hyfe-grey"
  };
  
  const iconBgClasses = {
    primary: "bg-primary-light text-secondary",
    secondary: "bg-secondary-light text-secondary",
    "hyfe-grey": "bg-hyfe-lightgrey text-secondary",
    // Keep backwards compatibility
    blue: "bg-primary-light text-secondary",
    orange: "bg-secondary-light text-secondary", 
    gray: "bg-hyfe-lightgrey text-secondary"
  };
  
  return (
    <Button
      variant="outline"
      className={`w-full h-auto py-4 px-4 border-2 rounded-lg flex items-center justify-between transition-all duration-200 ${
        colorClasses[color as keyof typeof colorClasses]
      } ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.01] hover:shadow-md"
      }`}
      onClick={() => !disabled && onSelect(option)}
      disabled={disabled}
    >
      <div className="flex items-center">
        <div className={`w-10 h-10 flex items-center justify-center rounded-full mr-4 ${iconBgClasses[color as keyof typeof iconBgClasses]}`}>
          <span className="text-xl">{icon}</span>
        </div>
        <span className="font-semibold text-lg">{label}</span>
      </div>
      <div className="w-4 h-4 rounded-full border-2 border-current flex-shrink-0"></div>
    </Button>
  );
};

export default ResponseOption;
