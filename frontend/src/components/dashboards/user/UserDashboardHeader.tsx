import { motion } from "framer-motion";
import { CalendarPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fadeUpItemSlow } from "@/lib/motion";

export default function UserDashboardHeader() {
  return (
    <motion.div
      variants={fadeUpItemSlow}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Your vaccination overview
        </p>
      </div>

      <Link to="/centers">
        <Button variant="outline" size="sm" className="w-full gap-1.5 sm:w-auto">
          <CalendarPlus className="size-4 shrink-0" />
          Book Appointment
        </Button>
      </Link>
    </motion.div>
  );
}
