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
  FileText,
  ExternalLink,
  Loader2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/auth/AuthContext";
import { hospitalApi } from "@/api/hospital.api";
import { toast } from "sonner";

export default function StaffInfoCard() {
  const { user } = useAuthContext();
  const [hospital, setHospital] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await hospitalApi.getMyHospital();
        setHospital(data);
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Could not load profile details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] w-full max-w-lg mx-auto items-center justify-center rounded-2xl border bg-card/30 backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // mapping fields from enriched hospital response (which includes staff info)
  const staffData = {
    staffId: `STF-${hospital?.id?.toString().substring(0, 8).toUpperCase() || "..."}`,
    name: hospital?.staffName || user?.name || "Staff Member",
    email: hospital?.staffEmail || user?.email || "N/A",
    phone: hospital?.staffPhone || user?.phone || "+91-XXXXXXXXXX",
    status: hospital?.status || "ACTIVE",
    hospitalName: hospital?.name || "Loading...",
    hospitalId: hospital?.id || "N/A",
    joinedDate: hospital?.staffCreatedAt
      ? new Date(hospital.staffCreatedAt).toLocaleDateString()
      : "January 2026",
    documentUrl: hospital?.documentUrl || "https://vaxify-docs.s3.amazonaws.com/test-id-card.pdf",
  };

  const basicInfo = [
    { icon: User, label: "Name", value: staffData.name },
    { icon: Mail, label: "Email", value: staffData.email },
    { icon: Phone, label: "Phone", value: staffData.phone },
    {
      icon: Building2,
      label: "Hospital",
      value: staffData.hospitalName,
    },
  ];

  const metadataInfo = [
    { icon: Hash, label: "Staff ID", value: staffData.staffId },
    { icon: Hash, label: "Hospital ID", value: staffData.hospitalId },
    { icon: Calendar, label: "Joined", value: staffData.joinedDate },
    {
      icon: BadgeCheck,
      label: "Status",
      value: staffData.status,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      whileHover="hover"
      className="w-full max-w-lg mx-auto"
    >
      <Card
        className={cn("relative overflow-hidden rounded-2xl border bg-card p-4 sm:p-8 shadow-sm mb-10")}
      >
        {/* gradient background */}
        <div
          className="absolute inset-0 z-0 opacity-40 dark:opacity-20"
          style={{
            background: "radial-gradient(circle at 50% 20%, hsl(142,70%,85%) 0%, transparent 65%)",
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
            src="https://ik.imagekit.io/vaxify/icons/staff.png"
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
              <h2 className="text-xl font-semibold">{staffData.name}</h2>

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

              {/* doc row */}
              <InfoRow
                icon={<FileText className="h-4 w-4" />}
                label="Verification"
                value={
                  staffData.documentUrl ? (
                    <a
                      href={staffData.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center justify-end gap-1"
                    >
                      View Cert <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground italic">Pending Upload</span>
                  )
                }
              />
            </div>
          </div>
        </motion.div>
      </Card>
    </motion.div>
  );
}

const iconAnimation: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.15,
    y: -18,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

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

      <span className="text-xs text-muted-foreground min-w-0 truncate">{label}</span>

      <div className="text-xs sm:text-sm text-right flex-1 min-w-0 truncate">{value}</div>
    </div>
  );
}
