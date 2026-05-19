"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FiUpload,
  FiFileText,
  FiDownload,
  FiRotateCcw,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import Button from "../ui/Button";
import {
  getJson,
  postForm,
  postAuthJson,
  downloadBlob,
} from "../../lib/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type ResumeMeta = {
  id: string;
  original_name: string;
  version: number;
  mime_type: string;
  is_verified: boolean;
  uploaded_at: string;
  updatedAt: string;
};

type ResumeVersion = {
  _id: string;
  version_number: number;
  original_name: string;
  file_size: number;
  uploaded_at: string;
  change_description?: string;
};

interface ResumeSectionProps {
  initialResume?: ResumeMeta | null;
}

export default function ResumeSection({ initialResume }: ResumeSectionProps) {
  const [resume, setResume] = useState<ResumeMeta | null>(
    initialResume ?? null
  );
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [uploading, setUploading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVersions = useCallback(async (documentId: string) => {
    const res = await getJson<{
      success: boolean;
      data: ResumeVersion[];
    }>(`/documents/${documentId}/versions`);
    if (res.ok && res.body?.success) {
      setVersions(res.body.data);
    }
  }, []);

  const fetchResume = useCallback(async () => {
    const res = await getJson<{
      success: boolean;
      data: Array<{
        _id: string;
        doc_type: string;
        original_name: string;
        version: number;
        mime_type: string;
        is_verified: boolean;
        uploaded_at: string;
        updatedAt: string;
      }>;
    }>("/documents?doc_type=resume");

    if (res.ok && res.body?.success && res.body.data.length > 0) {
      const doc = res.body.data[0];
      const meta: ResumeMeta = {
        id: doc._id,
        original_name: doc.original_name,
        version: doc.version,
        mime_type: doc.mime_type,
        is_verified: doc.is_verified,
        uploaded_at: doc.uploaded_at,
        updatedAt: doc.updatedAt,
      };
      setResume(meta);
      await fetchVersions(doc._id);
    } else {
      setResume(null);
      setVersions([]);
    }
  }, [fetchVersions]);

  useEffect(() => {
    if (initialResume) {
      fetchVersions(initialResume.id);
    } else {
      fetchResume();
    }
  }, [initialResume, fetchResume, fetchVersions]);

  const validateFile = (file: File): string | null => {
    if (file.type !== "application/pdf") {
      return "Only PDF files are allowed for resumes.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size exceeds 5 MB limit.";
    }
    return null;
  };

  const handleUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", "resume");

    const res = await postForm<{
      success: boolean;
      message?: string;
      data?: { documentId: string; version: number; originalName: string };
    }>("/documents/upload", formData);

    setUploading(false);

    if (res.ok && res.body?.success && res.body.data) {
      await fetchResume();
    } else {
      setError(res.body?.message || "Upload failed. Please try again.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDownload = async (documentId: string, fileName: string) => {
    const blob = await downloadBlob(`/documents/${documentId}/download`);
    if (!blob) {
      setError("Failed to download resume.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadVersion = async (
    documentId: string,
    versionId: string,
    fileName: string
  ) => {
    const blob = await downloadBlob(
      `/documents/${documentId}/versions/${versionId}/download`
    );
    if (!blob) {
      setError("Failed to download version.");
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = async (versionId: string) => {
    if (!resume) return;
    setRestoring(versionId);
    setError("");

    const res = await postAuthJson<{ success: boolean; message?: string }>(
      `/documents/${resume.id}/versions/${versionId}/restore`,
      {}
    );

    setRestoring(null);

    if (res.ok && res.body?.success) {
      await fetchResume();
    } else {
      setError(res.body?.message || "Failed to restore version.");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <section
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-xl)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h3
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: 700,
          marginBottom: "var(--space-lg)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <FiFileText /> Primary Resume
      </h3>

      {error && (
        <div
          style={{
            padding: "10px 14px",
            marginBottom: "var(--space-md)",
            borderRadius: "var(--radius)",
            background: "rgba(239,68,68,0.1)",
            color: "var(--color-error, #ef4444)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {error}
        </div>
      )}

      {/* Current default resume */}
      {resume ? (
        <div
          style={{
            padding: "var(--space-md)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border)",
            background: "var(--color-background)",
            marginBottom: "var(--space-lg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "var(--space-md)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius)",
                  background: "var(--color-primary-10)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-primary)",
                }}
              >
                <FiFileText size={22} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {resume.original_name}
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: "var(--color-primary-10)",
                      color: "var(--color-primary)",
                      fontSize: "var(--font-size-xs)",
                      fontWeight: 700,
                    }}
                  >
                    Default · v{resume.version}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-muted)",
                    marginTop: 2,
                  }}
                >
                  Updated {formatDate(resume.updatedAt || resume.uploaded_at)}
                  {resume.is_verified && (
                    <span
                      style={{
                        marginLeft: 8,
                        color: "var(--color-success, #22c55e)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <FiCheckCircle size={14} /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleDownload(resume.id, resume.original_name)
              }
            >
              <FiDownload /> Download
            </Button>
          </div>
        </div>
      ) : (
        <p
          style={{
            color: "var(--color-muted)",
            fontSize: "var(--font-size-sm)",
            marginBottom: "var(--space-md)",
          }}
        >
          No resume uploaded yet. Upload a PDF (max 5 MB) to get started.
        </p>
      )}

      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? "var(--color-primary)" : "var(--color-border)"}`,
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-xl)",
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          background: isDragging
            ? "var(--color-primary-10)"
            : "var(--color-background)",
          transition: "border-color 0.2s, background 0.2s",
          opacity: uploading ? 0.6 : 1,
          marginBottom: versions.length > 0 ? "var(--space-lg)" : 0,
        }}
      >
        <FiUpload
          size={28}
          style={{ color: "var(--color-primary)", marginBottom: 8 }}
        />
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          {uploading
            ? "Uploading..."
            : resume
              ? "Upload new version"
              : "Upload resume"}
        </div>
        <div
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-muted)",
          }}
        >
          PDF only · Max 5 MB · Drag & drop or click to browse
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </div>

      {/* Version history */}
      {versions.length > 0 && (
        <div>
          <h4
            style={{
              fontSize: "var(--font-size-base)",
              fontWeight: 600,
              marginBottom: "var(--space-md)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FiClock size={16} /> Version History
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-sm)",
            }}
          >
            {versions.map((v) => {
              const isDefault = resume && v.version_number === resume.version;
              return (
                <div
                  key={v._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                    background: isDefault
                      ? "var(--color-primary-10)"
                      : "var(--color-background)",
                    flexWrap: "wrap",
                    gap: "var(--space-sm)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 500,
                        fontSize: "var(--font-size-sm)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      v{v.version_number} — {v.original_name}
                      {isDefault && (
                        <span
                          style={{
                            padding: "1px 6px",
                            borderRadius: 999,
                            background: "var(--color-primary)",
                            color: "white",
                            fontSize: "var(--font-size-xs)",
                            fontWeight: 700,
                          }}
                        >
                          Default
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-muted)",
                        marginTop: 2,
                      }}
                    >
                      {formatDate(v.uploaded_at)} · {formatSize(v.file_size)}
                      {v.change_description && ` · ${v.change_description}`}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDownloadVersion(
                          resume!.id,
                          v._id,
                          v.original_name
                        )
                      }
                    >
                      <FiDownload />
                    </Button>
                    {!isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={restoring === v._id}
                        onClick={() => handleRestore(v._id)}
                        title="Set as default"
                      >
                        <FiRotateCcw /> Set default
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
