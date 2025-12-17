'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, CornerDownRight, Trash2, MoreHorizontal, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { 
  useGetMenuCommentsQuery, 
  useAddMenuCommentMutation,
  useReplyToCommentMutation,
  useDeleteCommentMutation,
  useGetCustomerInfoQuery,
} from '@/lib/services/api';
import { MenuComment } from '@/lib/services/apiTypes';

interface CommentsModalProps {
  menuId: number;
  menuTitle: string;
  onClose: () => void;
  onLoginRequired: () => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function CommentItem({ 
  comment, 
  currentUserId,
  onReply,
  onDelete,
  isDeleting,
}: { 
  comment: MenuComment;
  currentUserId?: number;
  onReply: (commentId: number, userName: string) => void;
  onDelete: (commentId: number) => void;
  isDeleting: boolean;
}) {
  const [showOptions, setShowOptions] = useState(false);
  const isOwner = currentUserId === comment.user.id;
  
  return (
    <div className="py-3">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-bold">
            {comment.user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-semibold text-sm text-white">
                {comment.user.name}
              </span>
              <span className="text-gray-500 text-xs ml-2">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>
            
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-1 text-gray-500 hover:text-white rounded transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                
                {showOptions && (
                  <div className="absolute right-0 top-6 bg-gray-800 rounded-lg shadow-lg py-1 z-10 min-w-[100px]">
                    <button
                      onClick={() => {
                        onDelete(comment.id);
                        setShowOptions(false);
                      }}
                      disabled={isDeleting}
                      className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <p className="text-gray-300 text-sm mt-1 break-words">
            {comment.comment}
          </p>
          
          <button
            onClick={() => onReply(comment.id, comment.user.name)}
            className="text-gray-500 text-xs mt-2 hover:text-red-400 transition-colors"
          >
            Reply
          </button>
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-12 mt-3 border-l-2 border-gray-700 pl-3">
          {comment.replies.map(reply => (
            <div key={reply.id} className="py-2">
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {reply.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-white">
                      {reply.user.name}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {formatTimeAgo(reply.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs mt-0.5 break-words">
                    {reply.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentsModal({ menuId, menuTitle, onClose, onLoginRequired }: CommentsModalProps) {
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; userName: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  
  const token = useSelector((state: RootState) => state.auth.token);

  // Wait for client-side mount before using portal
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Fetch comments
  const { data: commentsData, isLoading, refetch } = useGetMenuCommentsQuery(
    { menuId },
    { skip: !menuId }
  );
  
  // Get current user info
  const { data: userInfo } = useGetCustomerInfoQuery(undefined, { skip: !token });
  
  // Mutations
  const [addComment, { isLoading: isAddingComment }] = useAddMenuCommentMutation();
  const [replyToComment, { isLoading: isReplying }] = useReplyToCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  
  const comments = commentsData?.data?.comments || [];
  const currentUserId = userInfo?.id ? Number(userInfo.id) : undefined;
  
  // Focus input when replying
  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);
  
  const handleSubmit = async () => {
    if (!token) {
      onLoginRequired();
      return;
    }
    
    if (!commentText.trim()) return;
    
    try {
      if (replyTo) {
        await replyToComment({
          parent_id: replyTo.id,
          comment: commentText.trim(),
        }).unwrap();
      } else {
        await addComment({
          menu_id: menuId,
          comment: commentText.trim(),
        }).unwrap();
      }
      
      setCommentText('');
      setReplyTo(null);
      refetch();
      
      // Scroll to bottom to show new comment
      setTimeout(() => {
        if (commentsContainerRef.current) {
          commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };
  
  const handleDelete = async (commentId: number) => {
    if (!token) return;
    
    setDeletingId(commentId);
    try {
      await deleteComment(commentId).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setDeletingId(null);
    }
  };
  
  const handleReply = (commentId: number, userName: string) => {
    if (!token) {
      onLoginRequired();
      return;
    }
    setReplyTo({ id: commentId, userName });
  };
  
  const cancelReply = () => {
    setReplyTo(null);
    setCommentText('');
  };

  // Don't render until mounted (client-side)
  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full md:max-w-md h-[70vh] md:h-[80vh] bg-gray-900 md:rounded-2xl flex flex-col overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div>
            <h2 className="font-bold text-white">Comments</h2>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">{menuTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Comments List */}
        <div 
          ref={commentsContainerRef}
          className="flex-1 overflow-y-auto px-4"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-gray-500 text-sm">No comments yet</p>
              <p className="text-gray-600 text-xs mt-1">Be the first to comment!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={currentUserId}
                  onReply={handleReply}
                  onDelete={handleDelete}
                  isDeleting={deletingId === comment.id}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Reply Indicator */}
        {replyTo && (
          <div className="px-4 py-2 bg-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <CornerDownRight className="w-4 h-4 text-gray-500" />
              <span className="text-gray-400">
                Replying to <span className="text-red-400 font-medium">{replyTo.userName}</span>
              </span>
            </div>
            <button
              onClick={cancelReply}
              className="text-gray-500 hover:text-white text-sm"
            >
              Cancel
            </button>
          </div>
        )}
        
        {/* Input */}
        <div className="p-4 pb-20 md:pb-4 border-t border-gray-800 bg-gray-900">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={token ? (replyTo ? 'Write a reply...' : 'Add a comment...') : 'Login to comment'}
              disabled={!token}
              className="flex-1 bg-gray-800 text-white text-sm rounded-full px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSubmit}
              disabled={!commentText.trim() || isAddingComment || isReplying || !token}
              className="w-10 h-10 bg-[#FF4D4D] hover:bg-[#FF4D4D] disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
            >
              {isAddingComment || isReplying ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
          
          {!token && (
            <button
              onClick={onLoginRequired}
              className="w-full mt-2 text-center text-sm text-red-400 hover:text-red-300"
            >
              Sign in to join the conversation
            </button>
          )}
        </div>
      </div>
      
      {/* Animation */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );

  // Use portal to render modal at document body level (escapes stacking context)
  return createPortal(modalContent, document.body);
}

