import { MapPin } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface HospitalDetailsCardProps {
  hospital: {
    name: string;
    licenseNumber?: string;
    address: string;
    city?: string;
    pincode?: string;
  };
  itemVariants: Variants;
}

export const HospitalDetailsCard = ({
  hospital,
  itemVariants,
}: HospitalDetailsCardProps) => {
  return (
    <Card className="lg:col-span-2 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader className="border-b pb-4">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Core Information</CardTitle>
        </div>

        <CardDescription>
          Primary identification details for your hospital.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={itemVariants} className="space-y-2">
            <p className="text-sm text-muted-foreground font-normal">Hospital Name</p>
            <p className="font-semibold text-xl text-foreground ">
              {hospital.name}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <p className="text-sm text-muted-foreground font-normal">
              Registration ID
            </p>

            <div className="flex items-center gap-2 font-mono text-sm rounded-lg w-fit ">
              <span className="text-foreground ">{hospital.licenseNumber || "N/A"}</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="space-y-6 pt-8 border-t border-slate-100"
        >
          <div className="flex items-center gap-2 text-primary">
            <MapPin className="h-4 w-4" />

            <span className="font-medium tracking-wide text-xs uppercase">
              Location Details
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-normal">
                Street Address
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground ">
                {hospital.address}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-normal">City</p>
                <p className="text-sm font-medium text-foreground ">
                  {hospital.city || "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-normal">Pincode</p>
                <p className="text-sm font-medium text-foreground ">
                  {hospital.pincode || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};
