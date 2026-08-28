import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { UploadCloud, File, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toastUtils } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { uploadFile } from "@/api/files.api";

interface SingleImageDropzoneProps {
  id?: string;
  width?: number;
  height?: number;
  className?: string;
  value?: string | string[];
  onChange?: (url?: string, fileName?: string) => void;
  disabled?: boolean;
}

export const FileDropzone = ({
  id,
  className,
  value,
  onChange,
  disabled,
}: SingleImageDropzoneProps) => {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      // handle rejections
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];

        if (rejection.errors[0].code === "file-too-large") {
          toastUtils.error("File is too large. Max size is 5MB.");
        } else {
          toastUtils.error(rejection.errors[0].message);
        }
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      setLoading(true);

      try {
        const response = await uploadFile(file);

        // backend returns { fileName, fileUrl, message }
        if (onChange) {
          onChange(response.fileUrl, response.fileName);
        }

        toastUtils.success("Document uploaded successfully");
      } catch (error) {
        toastUtils.error(getErrorMessage(error, "Document upload failed"));
      } finally {
        setLoading(false);
      }
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: disabled || loading,
  });

  // if we have a value url, show the uploaded state
  if (value) {
    return (
      <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/20">
        <File className="h-4 w-4 text-blue-500" />
        <span className="text-sm truncate flex-1 text-muted-foreground">
          Document Uploaded
        </span>
        <button
          type="button"
          onClick={() => onChange?.("")}
          className="text-muted-foreground hover:text-red-500 transition-colors"
          disabled={disabled || loading}
          aria-label="Remove uploaded document"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors bg-white hover:bg-slate-50",
        isDragActive ? "border-primary bg-primary/5" : "border-slate-200",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <input {...getInputProps({ id })} />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <>
          <div className="bg-slate-900 rounded-full p-2 mb-3">
            <UploadCloud className="h-5 w-5 text-white" />
          </div>

          <p className="text-sm font-semibold text-slate-900">
            Upload Document
          </p>

          <p className="text-xs text-muted-foreground mt-1 mb-4">
            PDFs only (max 5MB)
          </p>

          <div className="bg-slate-900 text-white text-xs px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-colors">
            Choose File
          </div>
        </>
      )}
    </div>
  );
};
