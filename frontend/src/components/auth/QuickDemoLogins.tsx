import { Button } from "../ui/button";
import { User } from "lucide-react";

interface QuickDemoLoginsProps {
  onDemoClick: () => void;
}

const QuickDemoLogins = ({ onDemoClick }: QuickDemoLoginsProps) => {
  return (
    <div className="mt-6 flex justify-center w-full">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="flex items-center gap-3 h-auto py-2.5 px-5 text-xs hover:bg-muted/80 hover:text-accent-foreground cursor-pointer active:scale-95 transition-all"
        onClick={onDemoClick}
      >
        <User className="w-4 h-4" />
        <span>Demo User Login</span>
      </Button>
    </div>
  );
};

export default QuickDemoLogins;
