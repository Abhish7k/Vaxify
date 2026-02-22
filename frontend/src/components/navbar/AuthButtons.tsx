import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export const SignInButton = () => {
  return (
    <Link to="/login" className="">
      <Button
        className="hidden sm:block cursor-pointer active:scale-90 transition-all duration-300"
        variant="outline"
      >
        Sign In
      </Button>

      <button className="sm:hidden border border-gray-300 rounded-sm px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer active:scale-90 transition-all duration-300">
        Sign in
      </button>
    </Link>
  );
};

export const SignUpButton = () => {
  return (
    <Link to="/register" className="">
      <Button
        className="hidden sm:block cursor-pointer active:scale-90 transition-all duration-300"
        variant="outline"
      >
        Sign Up
      </Button>

      <button className="sm:hidden border border-gray-300 rounded-sm px-2 py-1 text-sm hover:bg-gray-100 cursor-pointer active:scale-90 transition-all duration-300">
        Sign up
      </button>
    </Link>
  );
};
