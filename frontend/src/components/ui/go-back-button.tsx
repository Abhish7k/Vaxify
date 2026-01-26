import { useNavigate } from "react-router-dom";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";

const GoBackButton = ({ label }: { label: string }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      asChild
      className="group cursor-pointer active:scale-95 transition-all"
      onClick={() => navigate(-1)}
    >
      <div>
        <ArrowLeft
          className="ms-0 opacity-60 transition-transform group-hover:-translate-x-0.5 mr-2 "
          size={16}
          strokeWidth={2}
          aria-hidden="true"
        />
        {label}
      </div>
    </Button>
  );
};

export default GoBackButton;
