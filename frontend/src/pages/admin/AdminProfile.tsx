import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { ShieldCheck, Mail, Calendar, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/useAuth";
import { format } from "date-fns";

export default function AdminProfileCard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const joinedDate = user.createdAt
    ? format(new Date(user.createdAt), "MMM yyyy")
    : "Jan 2026";

  const formattedRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <motion.div
      // card fades in + scales up on load
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      // hover lift effect preserved
      whileHover="hover"
      className="w-full max-w-md mx-auto"
    >
      <Card
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm",
        )}
      >
        {/* static gradient background */}
        <div
          className="absolute inset-0 z-0 opacity-40 dark:opacity-20"
          style={{
            background:
              "radial-gradient(circle at 50% 20%, hsl(211,100%,85%) 0%, transparent 65%)",
          }}
        />

        {/* icon */}
        <motion.div
          initial={{ scale: 0 }} // starts small
          animate={{ scale: 1 }} // grows to normal
          transition={{ delay: 0.2, duration: 0.4 }}
          variants={iconAnimation}
          className="relative z-10 flex justify-center mt-5"
        >
          <img
            src="https://ik.imagekit.io/vaxify/icons/profile.png"
            alt="Admin profile"
            className="h-32 w-32 object-contain"
          />
        </motion.div>

        {/* content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }} // 0.3s delay, 0.5s duration
          className="relative z-20 rounded-xl border bg-background/80 p-6 backdrop-blur-sm text-center"
        >
          <div className="flex flex-col items-center space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{user.name || "Admin"}</h2>
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="h-4 w-4" />
                {formattedRole}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {user.role === "admin" ? "System Administrator" : formattedRole}
            </p>
          </div>

          <div className="mt-6 space-y-4 text-sm text-left">
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={user.email}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Admin Since"
              value={joinedDate}
            />
            <InfoRow
              icon={<Activity className="h-4 w-4" />}
              label="Platform"
              value="Vaxify"
            />
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}

// hover animation variants
const iconAnimation: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.1,
    y: -10,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

// info row component
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium leading-tight">{value}</p>
      </div>
    </div>
  );
}
