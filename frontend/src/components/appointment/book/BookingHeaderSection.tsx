import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Center } from "@/types/hospital";

type Props = {
  center: Center;
};

export default function BookingHeaderSection({ center }: Props) {
  return (
    <Card className="border-dashed h-fit">
      <CardContent className="px-4 sm:px-6 transition-all">
        <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between transition-all">
          {/* icon + name */}
          <div className="flex items-center gap-3 ">
            <div className="">
              <img
                src="https://ik.imagekit.io/vaxify/icons/hospital-2.png"
                alt=""
                className="h-16 w-16"
                draggable={false}
              />
            </div>

            <h1 className="text-base sm:text-lg font-semibold leading-tight transition-all">
              {center.name}
            </h1>
          </div>

          {/* address */}
          <div className="ml-18 sm:ml-0 flex items-start gap-2 rounded-md py-2 text-sm text-muted-foreground lg:max-w-[45%] ">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

            <span className="leading-relaxed wrap-break-word">
              {center.address}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
