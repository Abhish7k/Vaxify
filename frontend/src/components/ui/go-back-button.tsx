import { useNavigate } from "react-router-dom";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";

const GoBackButton = ({ label, fallback = "/" }: { label: string; fallback?: string }) => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      asChild
      className="group cursor-pointer active:scale-95 transition-all"
      onClick={() => {
        const idx = (window.history.state as { idx?: number } | null)?.idx;
        if (typeof idx === "number" && idx > 0) {
          navigate(-1);
        } else {
          navigate(fallback);
        }
      }}
    >
      <div>
        <ArrowLeft
          className="ms-0 opacity-60 transition-transform group-hover:-translate-x-0.5 mr-1 mb-px duration-500"
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
