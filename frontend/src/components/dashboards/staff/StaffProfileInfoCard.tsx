import * as React from "react";
import { motion, type Variants } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Building2,
  Hash,
  Calendar,
  BadgeCheck,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function StaffInfoCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      whileHover="hover"
      className="w-full max-w-lg mx-auto"
    >
      <Card
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-card p-8 shadow-sm",
        )}
      >
        {/* gradient background */}
        <div
          className="absolute inset-0 z-0 opacity-40 dark:opacity-20"
          style={{
            background:
              "radial-gradient(circle at 50% 20%, hsl(142,70%,85%) 0%, transparent 65%)",
          }}
        />

        {/* profile icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          variants={iconAnimation}
          className="relative z-10 flex justify-center mt-5"
        >
          <img
            src="/icons/staff.png"
            alt="Staff profile"
            className="h-32 w-32 object-contain"
          />
        </motion.div>

        {/* content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative z-20 rounded-xl border bg-background/80 p-6 backdrop-blur-sm text-center"
        >
          {/* header */}
          <div className="flex flex-col items-center space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{staffStats.name}</h2>

              <Badge className="border border-emerald-600/20 bg-emerald-600/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                STAFF
              </Badge>
            </div>
          </div>

          {/* info rows */}
          <div className="mt-6 space-y-3 text-sm">
            {basicInfo.map((item, index) => (
              <InfoRow
                key={index}
                icon={<item.icon className="h-4 w-4" />}
                label={item.label}
                value={item.value}
              />
            ))}

            {/* metadata */}
            <div className="mt-6 pt-6 border-t border-border/50 space-y-3">
              {metadataInfo.map((item, index) => (
                <InfoRow
                  key={index}
                  icon={<item.icon className="h-4 w-4" />}
                  label={item.label}
                  value={item.value}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Animations                                   */
/* -------------------------------------------------------------------------- */

const iconAnimation: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.15,
    y: -18,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

/* -------------------------------------------------------------------------- */
/*                               Info Row                                     */
/* -------------------------------------------------------------------------- */

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <span className="text-xs text-muted-foreground min-w-0 truncate">
        {label}
      </span>
      <span className="font-medium text-right flex-1 min-w-0 truncate">
        {value}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Mock Data (MVP)                               */
/* -------------------------------------------------------------------------- */

const staffStats = {
  staffId: "STF-20451",
  name: "Anita Verma",
  email: "anita@cityhealth.com",
  phone: "+91-XXXXXXXXXX",
  role: "STAFF",
  status: "ACTIVE",
  hospitalName: "City Health Hospital",
  hospitalId: "HOSP-001",
  joinedDate: "Jan 2026",
};

const basicInfo = [
  { icon: User, label: "Name", value: staffStats.name },
  { icon: Mail, label: "Email", value: staffStats.email },
  { icon: Phone, label: "Phone", value: staffStats.phone },
  {
    icon: Building2,
    label: "Hospital",
    value: staffStats.hospitalName,
  },
];

const metadataInfo = [
  { icon: Hash, label: "Staff ID", value: staffStats.staffId },
  { icon: Hash, label: "Hospital ID", value: staffStats.hospitalId },
  { icon: Calendar, label: "Joined", value: staffStats.joinedDate },
  {
    icon: BadgeCheck,
    label: "Status",
    value: staffStats.status,
  },
];
