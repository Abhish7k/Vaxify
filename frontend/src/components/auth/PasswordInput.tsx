import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../ui/input";

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, id, ...props }, ref) => {
  const [show, setShow] = React.useState(false);
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className="relative w-full">
      <Input
        id={inputId}
        type={show ? "text" : "password"}
        placeholder="********"
        className={className}
        ref={ref}
        {...props}
      />

      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        aria-controls={inputId}
      >
        {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
