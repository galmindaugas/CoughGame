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
    blue: "text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    orange: "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20",
    gray: "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/20"
  };
  
  return (
    <Button
      variant="outline"
      className={`h-auto py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center transition duration-200 ${colorClasses[color as keyof typeof colorClasses]} ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] hover:shadow-md"
      }`}
      onClick={() => !disabled && onSelect(option)}
      disabled={disabled}
    >
      <span className="text-2xl mb-2">{icon}</span>
      <span className="font-medium">{label}</span>
    </Button>
  );
};

export default ResponseOption;
