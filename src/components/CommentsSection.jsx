import { MessageSquare, User } from "lucide-react";

const CommentsSection = ({ comments }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-gray-400" />
        <h1 className="text-xl font-semibold">Comments ({comments.length})</h1>
      </div>

      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm">No Comments yet</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-medium text-white">
                {comment.user?.name
                  ? comment.user.name.charAt(0).toUpperCase()
                  : <User className="w-5 h-5" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">
                    {comment.user?.name || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
                <p className="text-gray-700 text-sm mt-1">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
