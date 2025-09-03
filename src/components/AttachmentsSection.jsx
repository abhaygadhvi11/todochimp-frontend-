import { Paperclip, FileText, FileImage, File, Download } from "lucide-react";

const getFileIcon = (fileName) => {
  const ext = fileName.split(".").pop().toLowerCase();
  switch (ext) {
    case "txt":
    case "doc":
    case "docx":
    case "pdf":
      return <FileText className="w-4 h-4 text-blue-600" />;
    case "jpg":
    case "jpeg":
    case "png":
      return <FileImage className="w-4 h-4 text-green-600" />;
    default:
      return <File className="w-4 h-4 text-gray-600" />;
  }
};

function downloadBase64File(base64Data, fileName) {
  if (!base64Data) {
    alert("File is not available for download");
    return;
  }

  const link = document.createElement("a");
  link.href = base64Data; 
  link.download = fileName || "downloaded_file";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const AttachmentsSection = ({ attachments }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Paperclip className="w-5 h-5 text-gray-400" />
        <h1 className="text-xl font-semibold">
          Attachments ({attachments.length})
        </h1>
      </div>

      {attachments.length === 0 ? (
        <p className="text-gray-500 text-sm">No Attachments yet</p>
      ) : (
        <div className="space-y-3">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {/* Icon */}
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                {getFileIcon(attachment.fileName)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {attachment.fileName}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(attachment.uploadedAt).toLocaleString()}
                </p>
              </div>

              {/* Download */}
              <button
                onClick={() =>
                  downloadBase64File(attachment.base64, attachment.fileName)
                }
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Download className="w-5 h-5 text-gray-400" />
              </button>
            </div>  
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentsSection;
