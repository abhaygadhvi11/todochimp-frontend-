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
  Trash2,
} from "lucide-react";

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

  return (
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
          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center cursor-pointer gap-2 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-md transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Add Files</span>
          </button>
        </div>
      </div>

      {/* Pending Uploads */}
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
                <div className="relative group">
                  <button
                    onClick={() => handleRemovePending(file.name)}
                    className="p-1 hover:bg-gray-100 rounded-md cursor-pointer flex-shrink-0"
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

      {/* Uploaded Attachments */}
      {attachments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-3">
          No attachments available
        </p>
      ) : (
        <>
          {/* Mobile View */}
          <div className="lg:hidden max-h-64 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-9 h-9 bg-gray-100 rounded-md flex items-center justify-center">
                      {getFileIcon(attachment.fileName)}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="font-medium text-sm text-gray-900 truncate"
                        title={attachment.fileName}
                      >
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() =>
                        downloadBase64File(
                          attachment.base64,
                          attachment.fileName
                        )
                      }
                      className="p-1.5 hover:bg-gray-100 rounded-md transition"
                    >
                      <Download className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      className="p-1.5 hover:bg-red-50 rounded-md transition"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:flex flex-col mt-4 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="max-h-70 overflow-y-auto">
              <table className="min-w-full border-collapse">
                {/* Sticky Header */}
                <thead className="bg-gradient-to-r from-blue-700 to-purple-600 text-white sticky top-0 z-10">
                  <tr>
                    <th className="py-4 px-6 text-center text-m font-semibold w-16">
                      #
                    </th>
                    <th className="py-4 px-6 text-left text-m font-semibold">
                      FILE NAME
                    </th>
                    <th className="py-4 px-6 text-center text-m font-semibold">
                      UPLOADED DATE
                    </th>
                    <th className="py-4 px-6 text-center text-m font-semibold">
                      ACTIONS
                    </th>
                  </tr>
                </thead>

                {/* Scrollable Body */}
                <tbody className="divide-y divide-gray-100">
                  {attachments.map((attachment, index) => (
                    <tr
                      key={attachment.id}
                      className={`transition-all duration-200 ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-indigo-50`}
                    >
                      {/* Sr No */}
                      <td className="px-6 py-3 text-center text-sm font-medium text-gray-700">
                        {index + 1}
                      </td>

                      {/* File Name */}
                      <td
                        className="px-6 py-3 text-left text-sm font-medium text-gray-900 truncate max-w-[280px]"
                        title={attachment.fileName}
                      >
                        {attachment.fileName}
                      </td>

                      {/* Uploaded Date */}
                      <td className="px-6 py-3 text-center text-sm text-gray-700 whitespace-nowrap">
                        {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-3 text-center">
                        <div className="inline-flex justify-center space-x-2">
                          {/* Download */}
                          <div className="relative group">
                            <button
                              onClick={() =>
                                downloadBase64File(
                                  attachment.base64,
                                  attachment.fileName
                                )
                              }
                              className="p-2 rounded-full cursor-pointer bg-blue-50 border text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                              Download File
                            </span>
                          </div>

                          {/* Delete */}
                          <div className="relative group">
                            <button
                              onClick={() => handleDelete(attachment.id)}
                              className="p-2 rounded-full cursor-pointer bg-red-50 border text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                              Delete File
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
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
  );
};

export default AttachmentsSection;
