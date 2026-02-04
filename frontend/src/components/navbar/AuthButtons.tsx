import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export const SignInButton = () => {
  return (
    <Link to="/login">
      <Button
        className="cursor-pointer active:scale-90 transition-all duration-300"
        variant="outline"
      >
        Sign In
      </Button>
    </Link>
  );
};

export const SignUpButton = () => {
  return (
    <Link to="/register">
      <Button
        className="cursor-pointer active:scale-90 transition-all duration-300"
        variant="outline"
      >
        Sign Up
      </Button>
    </Link>
  );
};
