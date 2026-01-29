import { FileText, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HospitalDocumentCardProps {
  documentUrl?: string;
}

export const HospitalDocumentCard = ({
  documentUrl,
}: HospitalDocumentCardProps) => {
  const handleViewDocument = () => {
    if (documentUrl) {
      window.open(documentUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden h-fit">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-slate-500" />

          <CardTitle className="text-sm font-semibold">
            Registration Document
          </CardTitle>
        </div>

        <CardDescription>
          One-time verification document uploaded during registration.
        </CardDescription>
      </CardHeader>

      <CardContent className="">
        {documentUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-100 rounded-lg group transition-colors">
              <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-red-600">PDF</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-slate-700">
                  Registration_Proof.pdf
                </p>

                <p className="text-xs text-muted-foreground">
                  Uploaded Document
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 active:scale-95 transition-all duration-200"
              onClick={handleViewDocument}
            >
              <Eye className="h-4 w-4" />
              View Document
            </Button>
          </div>
        ) : (
          <div className="text-center py-6 spazio-y-2">
            <div className="bg-slate-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-slate-400" />
            </div>

            <p className="text-sm font-medium text-muted-foreground">
              No document available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
