import { MenuIcon } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Link } from "react-router-dom";

const MobileNav = () => {
  return (
    <div className="md:hidden mt-2 transition-all">
      <Sheet>
        <SheetTrigger asChild>
          <button type="button" aria-label="Open menu" className="cursor-pointer">
            <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          </button>
        </SheetTrigger>

        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center justify-start gap-2">
              <SheetClose asChild>
                <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-600">
                  <img src="/logo.svg" alt="" width={30} aria-hidden="true" />
                  Vaxify
                </Link>
              </SheetClose>
            </SheetTitle>
          </SheetHeader>

          <SheetDescription></SheetDescription>

          <div className="mt-10 pl-5 flex flex-col gap-5">
            {links.map((link) => (
              <SheetClose key={link.href} asChild>
                <Link
                  to={link.href}
                  className="text-xl text-foreground/70 hover:text-indigo-600 transition-all"
                >
                  {link.name}
                </Link>
              </SheetClose>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const links = [
  {
    name: "Centers",
    href: "/centers",
  },
  {
    name: "Book Appointment",
    href: "/book",
  },
];

export default MobileNav;
