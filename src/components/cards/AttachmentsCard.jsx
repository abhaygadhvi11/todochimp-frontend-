import { Eye, Download, Trash2 } from "lucide-react";

const AttachmentsCard = ({
  attachments,
  setPreviewFile,
  downloadBase64File,
  handleDelete,
  getFileIcon
}) => {
  return (
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
                  className="max-w-[150px] font-medium text-sm text-gray-900 truncate"
                  title={attachment.fileName}
                >
                  {attachment.fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(attachment.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPreviewFile(attachment)}
                className="p-1.5 rounded-full cursor-pointer bg-blue-50 border text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Eye className="w-4 h-4 text-blue-500" />
              </button>

              <button
                onClick={() =>
                  downloadBase64File(attachment.base64, attachment.fileName)
                }
                className="p-1.5 rounded-full cursor-pointer bg-slate-50 border text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Download className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => handleDelete(attachment.id)}
                className="p-1.5 rounded-full cursor-pointer bg-red-50 border text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttachmentsCard;