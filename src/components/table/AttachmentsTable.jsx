import { Eye, Download, Trash2 } from "lucide-react";

const AttachmentsTable = ({
  attachments,
  setPreviewFile,
  downloadBase64File,
  handleDelete,
}) => {
  return (
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
                    <div className="relative group">
                      <button
                        onClick={() => setPreviewFile(attachment)}
                        className="p-2 rounded-full cursor-pointer bg-blue-50 border text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                        Preview File
                      </span>
                    </div>

                    <div className="relative group">
                      <button
                        onClick={() =>
                          downloadBase64File(
                            attachment.base64,
                            attachment.fileName
                          )
                        }
                        className="p-2 rounded-full cursor-pointer bg-slate-50 border text-slate-600 hover:bg-slate-100 transition-colors"
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
  );
};

export default AttachmentsTable;
