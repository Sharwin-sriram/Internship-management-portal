'use client';

import FileUpload from '../../components/FileUpload';

export default function DocumentsPage() {
  const handleUploadSuccess = (data: any) => {
    console.log('Upload successful:', data);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600 mt-2">Upload your documents for internship applications</p>
        </div>

        {/* File Upload Component */}
        <FileUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>
    </div>
  );
}
