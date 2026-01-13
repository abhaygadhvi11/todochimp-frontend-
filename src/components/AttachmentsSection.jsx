import { useRef, useState } from "react";
import { FileText, FileImage, File, Upload, Check, X } from "lucide-react";
import AttachmentsTable from "./table/AttachmentsTable";
import AttachmentsCard from "./cards/AttachmentsCard";

const API_URL = import.meta.env.VITE_API_URL;

const getFileIcon = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  switch (ext) {
    case "txt":
    case "doc":
    case "docx":
    case "pdf":
      return <FileText className="w-4 h-4 text-blue-500" />;
    case "jpg":
    case "jpeg":
    case "png":
      return <FileImage className="w-4 h-4 text-green-500" />;
    default:
      return <File className="w-4 h-4 text-gray-500" />;
  }
};

function downloadBase64File(base64Data, fileName) {
  if (!base64Data) return alert("File not available for download");
  const link = document.createElement("a");
  link.href = base64Data;
  link.download = fileName || "downloaded_file";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const AttachmentsSection = ({
  attachments = [],
  onUpload,
  taskId,
  onRemove,
}) => {
  const fileInputRef = useRef(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [showUploadSnackbar, setShowUploadSnackbar] = useState(false);
  const [showDeleteSnackbar, setShowDeleteSnackbar] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const getFileExtension = (fileName = "") => fileName.split(".").pop().toLowerCase();
  const isImage = (ext) => ["jpg", "jpeg", "png"].includes(ext);
  const isPDF = (ext) => ext === "pdf";
  const isText = (ext) => ext === "txt";

  const decodeBase64Text = (base64) => {
    try {
      return atob(base64.split(",")[1]);
    } catch {
      return "Unable to preview file";
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setPendingFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleRemovePending = (fileName) => {
    setPendingFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const handleSubmit = async () => {
    if (pendingFiles.length === 0) return;
    setUploading(true);

    try {
      for (const file of pendingFiles) {
        await onUpload?.(file);
      }
      setPendingFiles([]);
      setShowUploadSnackbar(true);
      setTimeout(() => setShowUploadSnackbar(false), 2500);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload files.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!confirm("Are you sure you want to delete this attachment?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/tasks/${taskId}/attachments?attachmentId=${attachmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        onRemove?.(attachmentId);
        setShowDeleteSnackbar(true);
        setTimeout(() => setShowDeleteSnackbar(false), 2500);
      } else {
        alert(data.error || "Failed to delete attachment");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong while deleting the file");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setPendingFiles((prev) => [...prev, ...files]);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer transition
                ${isDragging ? "border-blue-500 bg-blue-100" : "border-gray-300"}
                hover:border-blue-400 hover:bg-blue-50
              `}
        >
          <Upload className="w-7 h-7 text-blue-600" />
          <p className="text-sm font-medium text-gray-700">
            Drag & drop files here or{" "}
            <span className="text-blue-600 underline">browse</span>
          </p>
          <p className="text-xs text-gray-500">
            Supports images, PDFs, documents, text files
          </p>
        </div>

        {/* Pending Uploads */}
        {pendingFiles.length > 0 && (
          <div className="mb-4 border border-dashed border-blue-300 bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-700 mb-2">
              Files to Upload ({pendingFiles.length})
            </p>

            {/* Responsive Grid */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {pendingFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md"
                >
                  {/* Left content */}
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center">
                      {getFileIcon(file.name)}
                    </div>

                    {/* File name responsive */}
                    <span className="text-sm text-gray-700 truncate max-w-full sm:max-w-[150px]">
                      {file.name}
                    </span>
                  </div>

                  {/* Remove button with tooltip */}
                  <div className="relative group flex-shrink-0">
                    <button
                      onClick={() => handleRemovePending(file.name)}
                      className="p-1 hover:bg-gray-100 rounded-md cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5 text-red-500" />
                    </button>
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Remove
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-3">
              <button
                onClick={handleSubmit}
                disabled={uploading}
                className={`px-4 py-1.5 rounded-md text-white text-sm cursor-pointer font-medium bg-blue-600 hover:bg-blue-700 transition-colors ${
                  uploading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        )}
      </div> 
      
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900">
              ATTACHMENTS ({attachments.length})
            </h1>
          </div>
          <div>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Uploaded Attachments */}
        {attachments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-3">
            No attachments available
          </p>
        ) : (
          <>
            {/* Mobile View */}
            <AttachmentsCard
              attachments={attachments}
              setPreviewFile={setPreviewFile}
              downloadBase64File={downloadBase64File}
              handleDelete={handleDelete}
              getFileIcon={getFileIcon}
            />

            {/* Desktop Table View */}
            <AttachmentsTable
              attachments={attachments}
              setPreviewFile={setPreviewFile}
              downloadBase64File={downloadBase64File}
              handleDelete={handleDelete}
            />
          </>
        )}

        {previewFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2 sm:px-4">
            <div className=" relative bg-white rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[95vh] flex flex-col animate-fadeIn">
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 bg-white rounded-full">
                <h3
                  className="text-sm sm:text-base font-semibold text-gray-800 truncate"
                  title={previewFile.fileName}
                >
                  {previewFile.fileName}
                </h3>

                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 rounded-md hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-auto p-3 sm:p-4 bg-gray-50">
                {(() => {
                  const ext = getFileExtension(previewFile.fileName);

                  if (isImage(ext)) {
                    return (
                      <div className="flex justify-center">
                        <img
                          src={previewFile.base64}
                          alt="Preview"
                          className=" max-w-full max-h-[70vh] object-contain rounded-lg shadow"
                        />
                      </div>
                    );
                  }

                  if (isPDF(ext)) {
                    return (
                      <iframe
                        src={previewFile.base64}
                        title="PDF Preview"
                        className=" w-full h-[65vh] sm:h-[70vh] rounded-lg border bg-white"
                      />
                    );
                  }

                  if (isText(ext)) {
                    return (
                      <pre className=" text-sm leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-lg border text-gray-800 max-h-[70vh] overflow-auto">
                        {decodeBase64Text(previewFile.base64)}
                      </pre>
                    );
                  }

                  return (
                    <p className="text-center text-gray-500 text-sm py-10">
                      Preview not supported for this file type.
                    </p>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Upload Snackbar */}
        {showUploadSnackbar && (
          <div className="fixed bottom-6 left-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-md transition-all animate-fade-in-up z-50">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-sm">Files uploaded successfully</p>
          </div>
        )}

        {showDeleteSnackbar && (
          <div className="fixed bottom-6 left-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-md transition-all animate-fade-in-up z-50">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-sm">File deleted successfully</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AttachmentsSection;
