import { useRef, useState } from "react";
import {
  Paperclip,
  FileText,
  FileImage,
  File,
  Download,
  Upload,
  Check,
  X,
} from "lucide-react";

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

const AttachmentsSection = ({ attachments = [], onUpload }) => {
  const fileInputRef = useRef(null);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [showUploadSnackbar, setShowUploadSnackbar] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">
            Attachments ({attachments.length})
          </h2>
        </div>
        <div>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Add Files
          </button>
        </div>
      </div>

      {/* Pending Files */}
      {pendingFiles.length > 0 && (
        <div className="mb-4 border border-dashed border-blue-300 bg-blue-50 p-3 rounded-lg">
          <p className="text-sm font-medium text-blue-700 mb-2">
            Files to Upload ({pendingFiles.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {pendingFiles.map((file) => (
              <div
                key={file.name}
                className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gray-100 rounded-md flex items-center justify-center">
                    {getFileIcon(file.name)}
                  </div>
                  <span className="text-sm text-gray-700 truncate max-w-[150px]">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={() => handleRemovePending(file.name)}
                  className="p-1 hover:bg-red-100 rounded-md"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-3">
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className={`px-4 py-1.5 rounded-md text-white text-sm font-medium bg-blue-600 hover:bg-blue-700 transition-colors ${
                uploading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {attachments.length === 0 ? (
        <p className="text-sm text-gray-500">No attachments available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-2 border border-gray-100 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                  {getFileIcon(attachment.fileName)}
                </div>
                <div className="min-w-0">
                  <p
                    className="font-medium text-xs text-gray-900 truncate"
                    title={attachment.fileName}
                  >
                    {attachment.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(attachment.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  downloadBase64File(attachment.base64, attachment.fileName)
                }
                className="p-1 hover:bg-gray-100 rounded-md flex-shrink-0"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Snackbar */}
      {showUploadSnackbar && (
        <div className="fixed bottom-6 left-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-md transition-all animate-fade-in-up">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-sm">Files uploaded successfully</p>
        </div>
      )}
    </div>
  );
};

export default AttachmentsSection;
