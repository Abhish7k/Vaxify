import api from "./axios";
import type { FileUploadResponseDto } from "@/api/dto/files";

export const uploadFile = async (file: File): Promise<FileUploadResponseDto> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<FileUploadResponseDto>("/files/upload", formData);
  return response.data;
};

export function extractDownloadKey(documentUrl: string): string | null {
  const marker = "/api/files/download/";
  const idx = documentUrl.indexOf(marker);
  if (idx >= 0) {
    const key = documentUrl.slice(idx + marker.length).split("?")[0];
    return key || null;
  }

  if (documentUrl.startsWith("http")) return null;
  return documentUrl || null;
}

export async function openProtectedDocument(documentUrl: string) {
  const key = extractDownloadKey(documentUrl);
  if (!key) return;

  const response = await api.get(`/files/download/${encodeURIComponent(key)}`, {
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
}
