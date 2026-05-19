'use client';

import { useState } from 'react';

interface FileUploadProps {
  onUploadSuccess?: (data: any) => void;
  onUploadError?: (error: string) => void;
}

type DocumentType = 'resume' | 'cover_letter' | 'certificate' | 'id_proof';

interface UploadFile {
  file: File;
  type: DocumentType;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const ALLOWED_TYPES = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const DOCUMENT_TYPES = [
  { value: 'resume', label: 'Resume', icon: '📄', description: 'Click to browse or drag & drop\nPDF, JPG, PNG (Max 5MB)' },
  { value: 'cover_letter', label: 'Cover Letter', icon: '📝', description: 'Click to browse or drag & drop\nPDF, JPG, PNG (Max 5MB)' },
  { value: 'certificate', label: 'Certificate', icon: '🎓', description: 'Click to browse or drag & drop\nPDF, JPG, PNG (Max 5MB)' },
  { value: 'id_proof', label: 'ID Proof', icon: '🪪', description: 'Click to browse or drag & drop\nPDF, JPG, PNG (Max 5MB)' },
];

export default function FileUpload({ onUploadSuccess, onUploadError }: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileType = file.type;
    const allowedTypes = Object.keys(ALLOWED_TYPES);
    
    if (!allowedTypes.includes(fileType)) {
      return 'Invalid file type. Only PDF, JPG, and PNG files are allowed.';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 5MB limit.';
    }

    return null;
  };

  const handleFileSelect = (selectedFiles: FileList | null, type: DocumentType) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: UploadFile[] = [];

    Array.from(selectedFiles).forEach((file) => {
      const error = validateFile(file);
      
      if (error) {
        newFiles.push({
          file,
          type,
          progress: 0,
          status: 'error',
          error,
        });
      } else {
        newFiles.push({
          file,
          type,
          progress: 0,
          status: 'pending',
        });
      }
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const uploadFile = async (uploadFile: UploadFile, index: number) => {
    const formData = new FormData();
    formData.append('file', uploadFile.file);
    formData.append('documentType', uploadFile.type);

    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: 'uploading' as const, progress: 0 } : f
        )
      );

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setFiles((prev) =>
            prev.map((f, i) =>
              i === index ? { ...f, progress: percentComplete } : f
            )
          );
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          setFiles((prev) =>
            prev.map((f, i) =>
              i === index ? { ...f, status: 'success' as const, progress: 100 } : f
            )
          );
          onUploadSuccess?.(response);
        } else {
          const error = xhr.responseText || 'Upload failed';
          setFiles((prev) =>
            prev.map((f, i) =>
              i === index ? { ...f, status: 'error' as const, error } : f
            )
          );
          onUploadError?.(error);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        const error = 'Network error occurred';
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, status: 'error' as const, error } : f
          )
        );
        onUploadError?.(error);
      });

      xhr.open('POST', 'http://localhost:9933/api/documents/upload');
      
      // Add auth token if available
      const token = localStorage.getItem('token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: 'error' as const, error: errorMessage } : f
        )
      );
      onUploadError?.(errorMessage);
    }
  };

  const handleUploadAll = () => {
    files.forEach((file, index) => {
      if (file.status === 'pending') {
        uploadFile(file, index);
      }
    });
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: DocumentType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files, type);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'uploading':
        return '⬆️';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📄';
    }
  };

  return (
    <div className="w-full">
      {/* Upload Documents Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          <span className="text-blue-600">📤</span>
          Upload Documents
        </h2>
        <div className="h-1 w-full bg-gray-200 mb-6">
          <div className="h-full w-0 bg-blue-600"></div>
        </div>

        {/* Document Type Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {DOCUMENT_TYPES.map((docType) => (
            <div
              key={docType.value}
              className={`relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={(e) => handleDrop(e, docType.value as DocumentType)}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={(e) => handleFileSelect(e.target.files, docType.value as DocumentType)}
                className="hidden"
                id={`file-input-${docType.value}`}
              />
              <label
                htmlFor={`file-input-${docType.value}`}
                className="cursor-pointer flex flex-col items-center justify-center text-center"
              >
                <div className="text-5xl mb-3">{docType.icon}</div>
                <div className="text-sm font-semibold text-gray-800 mb-2">
                  {docType.label}
                </div>
                <div className="text-xs text-gray-500 whitespace-pre-line">
                  {docType.description}
                </div>
              </label>
            </div>
          ))}
        </div>

        {/* Upload Guidelines */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <span>ℹ️</span>
            Upload Guidelines:
          </h3>
          <ul className="text-xs text-blue-800 space-y-1 ml-5 list-disc">
            <li>Accepted formats: PDF, JPG, PNG</li>
            <li>Maximum file size: 5MB per file</li>
            <li>You can upload multiple files at once</li>
            <li>Ensure documents are clear and readable</li>
          </ul>
        </div>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Files ({files.length})</h3>
          <div className="space-y-3">
            {files.map((uploadFile, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all ${
                  uploadFile.status === 'success'
                    ? 'bg-green-50 border-green-300'
                    : uploadFile.status === 'error'
                    ? 'bg-red-50 border-red-300'
                    : uploadFile.status === 'uploading'
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{getStatusIcon(uploadFile.status)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {uploadFile.file.name}
                        </p>
                        <span className="text-xs px-2 py-0.5 bg-white border border-gray-300 rounded-full whitespace-nowrap">
                          {DOCUMENT_TYPES.find((t) => t.value === uploadFile.type)?.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(uploadFile.file.size)} • {uploadFile.file.type}
                      </p>
                      {uploadFile.error && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <span>⚠️</span>
                          {uploadFile.error}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="ml-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                    title="Remove file"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Progress Bar */}
                {uploadFile.status === 'uploading' && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Uploading...</span>
                      <span className="font-semibold">{uploadFile.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {uploadFile.status === 'success' && (
                  <div className="mt-2 text-xs text-green-700 font-medium flex items-center gap-1">
                    <span>✓</span>
                    Upload completed successfully
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Upload Button */}
          {files.some((f) => f.status === 'pending') && (
            <button
              onClick={handleUploadAll}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
            >
              Upload All Files ({files.filter((f) => f.status === 'pending').length})
            </button>
          )}
        </div>
      )}

      {/* Why we need these documents */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Why do we need these documents?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
            <span className="text-3xl flex-shrink-0">📄</span>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Resume</h4>
              <p className="text-sm text-gray-600">
                Your professional background and experience
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
            <span className="text-3xl flex-shrink-0">📝</span>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Cover Letter</h4>
              <p className="text-sm text-gray-600">
                Your motivation and interest in the position
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
            <span className="text-3xl flex-shrink-0">🎓</span>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Certificates</h4>
              <p className="text-sm text-gray-600">
                Educational qualifications and achievements
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg">
            <span className="text-3xl flex-shrink-0">🪪</span>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">ID Proof</h4>
              <p className="text-sm text-gray-600">
                Identity verification for security purposes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
