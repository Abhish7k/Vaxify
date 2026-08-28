import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { CenterData } from "@/types/center-details";

interface Props {
  center: CenterData;
}

const CenterDetailsInfoSection = ({ center }: Props) => {
  if (!center.features?.length) return null;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-medium">Facilities & Features</h2>
      </CardHeader>

      <CardContent className="grid md:grid-cols-2 gap-4">
        {center.features.map((feature) => (
          <div key={feature} className="flex gap-3 text-sm text-muted-foreground">
            <span>•</span>
            <span>{feature}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CenterDetailsInfoSection;
