import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export const SignInButton = () => {
  return (
    <Link to="/login" className="">
      <Button
        className="hidden min-[600px]:block cursor-pointer active:scale-90 transition-all duration-300"
        variant="outline"
      >
        Sign In
      </Button>

      <button className="min-[600px]:hidden border border-gray-300 rounded-sm px-2 py-1.5 text-xs font-medium hover:bg-gray-100 cursor-pointer active:scale-90 transition-all duration-300">
        Sign in
      </button>
    </Link>
  );
};

export const SignUpButton = () => {
  return (
    <Link to="/register" className="transition-all">
      <Button
        className="hidden min-[600px]:block cursor-pointer active:scale-90 transition-all duration-300"
        variant="outline"
      >
        Sign Up
      </Button>

      <button className="min-[600px]:hidden border border-gray-300 rounded-sm px-2 py-1.5 text-xs font-medium hover:bg-gray-100 cursor-pointer active:scale-90 transition-all duration-300">
        Sign up
      </button>
    </Link>
  );
};
