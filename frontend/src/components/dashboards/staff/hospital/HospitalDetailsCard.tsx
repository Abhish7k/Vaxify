import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface HospitalDetailsCardProps {
  hospital: {
    name: string;
    licenseNumber: string;
    address: string;
    city?: string;
    pincode?: string;
  };
  itemVariants: any;
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
            <Label className="text-slate-500 font-normal">Hospital Name</Label>
            <p className="font-semibold text-xl text-slate-900 ">
              {hospital.name}
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label className="text-slate-500 font-normal">
              Registration ID
            </Label>

            <div className="flex items-center gap-2 font-mono text-sm rounded-lg w-fit ">
              <span className="text-slate-700 ">{hospital.licenseNumber}</span>
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
              <Label className="text-slate-500 font-normal">
                Street Address
              </Label>
              <p className="text-sm leading-relaxed text-slate-600 ">
                {hospital.address}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-500 font-normal">City</Label>
                <p className="text-sm font-medium text-slate-700 ">
                  {hospital.city || "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-500 font-normal">Pincode</Label>
                <p className="text-sm font-medium text-slate-700 ">
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
