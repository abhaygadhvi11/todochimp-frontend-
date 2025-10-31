import { useState } from "react";
import { MessageSquare, User, Send, Check } from "lucide-react";

const CommentsSection = ({ comments = [], onAddComment }) => {
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUploadSnackbar, setShowUploadSnackbar] = useState(false);

  const handlePost = async () => {
    if (!commentText.trim()) return;
    setLoading(true);

    try {
      await onAddComment(commentText);
      setShowUploadSnackbar(true);
      setTimeout(() => setShowUploadSnackbar(false), 2500);
      setCommentText(""); 
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to post comment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-gray-400" />
        <h1 className="text-xl font-semibold">Comments ({comments.length})</h1>
      </div>

      {/* Comment List */} 
      {comments.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-3">No comments yet.</p> ) : (
          <div className="space-y-2">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50 border border-gray-100 transition"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-medium text-white">
                  {comment.user?.name ? (
                    comment.user.name.charAt(0).toUpperCase()
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-800">
                      {comment.user?.name || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
      )}

      {/* Comment Input */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="flex items-start gap-3">
          {/* User Avatar */}
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
            U
          </div>

          <div className="flex-1">
            <textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handlePost}
                disabled={loading}
                className={`flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-md transition-colors ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                <Send className="w-4 h-4" />
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {showUploadSnackbar && (
        <div className="fixed bottom-6 left-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-md transition-all animate-fade-in-up">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-sm">Comment added successfully</p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
