"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Comment, MusicFolderItem } from "../lib/types"
import { RootState, useAppSelector } from "../lib/local/redux/store"
import { Heart, Loader, MessageCircle, SendHorizonal, User, X, ChevronDown, ChevronUp, Reply, ThumbsUp } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { v4 } from "uuid"
import { comment, getComments } from "../lib/dataSource/contentDataSource"

export const CommentSnippet = ({ comment, onReply, depth = 0, item, followUpComment }: { comment: Comment; onReply: (comment: Comment) => void; depth?: number, item: MusicFolderItem, followUpComment: Comment | null }) => {
  const { user } = useAppSelector((state: RootState) => state.auth)
  const [expanded, setExpanded] = useState(depth < 2)
  const [showAllReplies, setShowAllReplies] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [comments, setComments] = useState<Comment[]>([])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const myComments = await getComments(item, followUpComment)
      setComments(myComments)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [item])

  const toggleExpanded = () => setExpanded(!expanded)

  const formatDate = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 30) {
        return `${diffInDays}d ago`
      } else {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      }
    }
  }

  return (
    <div className={`flex flex-row py-3 ${depth > 0 ? 'pl-12' : ''}`}>
      <AvatarSection src={""} />
      <div className="w-full flex flex-col ml-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{comment.user.name}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(new Date(comment.date))}</span>
        </div>

        <p className="text-sm mb-2 text-gray-800 dark:text-gray-200">{comment.content}</p>

        <div className="flex items-center gap-4 mt-1">
          <LikeSection
            likes={comment.likes}
            isLiked={false}
            onLike={() => { }}
          />
          <button
            onClick={() => onReply(comment)}
            className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Reply size={14} />
            Reply
          </button>
        </div>

        {/* Subcomments */}
        {comments.length > 0 && (
          <div className="mt-3">
            {expanded ? (
              <>
                {comments.slice(0, showAllReplies ? undefined : 2).map((subComment) => (
                  <CommentSnippet
                    item={item}
                    key={subComment.id}
                    comment={subComment}
                    onReply={onReply}
                    depth={depth + 1}
                    followUpComment={subComment}
                  />
                ))}

                {comments.length > 2 && !showAllReplies && (
                  <button
                    onClick={() => setShowAllReplies(true)}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 flex items-center px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    View {comments.length - 2} more replies
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                )}

                {showAllReplies && (
                  <button
                    onClick={() => setShowAllReplies(false)}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 flex items-center px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Show fewer replies
                    <ChevronUp size={14} className="ml-1" />
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={toggleExpanded}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-2 flex items-center px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {comments.length} replies
                <ChevronDown size={14} className="ml-1" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface AvatarSectionProps {
  src: string
}
const AvatarSection: React.FC<AvatarSectionProps> = ({ src }) => {
  return (
    <Avatar className="h-10 w-10 flex-shrink-0">
      <AvatarImage src={src} />
      <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
        <User size={20} className="text-gray-500 dark:text-gray-400" />
      </AvatarFallback>
    </Avatar>
  )
}

const LikeSection = ({ likes, onLike, isLiked }: { likes: number; onLike: () => void; isLiked: boolean }) => {
  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <button
        onClick={onLike}
        className={`flex items-center gap-1 text-xs px-3 py-1 ${isLiked ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
      >
        <ThumbsUp size={14} />
      </button>
      <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
      <span className="text-xs px-2 text-gray-600 dark:text-gray-400">{likes}</span>
    </div>
  )
}

export const Comments = ({ item }: { item: MusicFolderItem }) => {
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const myComments = await getComments(item, null)
      setComments(myComments)
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [item])

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment)
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-900/0 rounded-lg">
      <div className="flex items-center gap-2 mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
        <span>{comments.length} Comments</span>
      </div>

      <CommentInput
        contentId={item.content.contentId}
        replyingTo={replyingTo}
        onCancelReply={cancelReply}
        onCommentPosted={fetchComments}
      />

      <div className="mt-6 pr-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader className="animate-spin text-gray-400" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <CommentSnippet
                item={item}
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                followUpComment={comment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const CommentInput = ({
  contentId,
  replyingTo,
  onCancelReply,
  onCommentPosted
}: {
  contentId: string;
  replyingTo: Comment | null;
  onCancelReply: () => void;
  onCommentPosted: () => void;
}) => {
  const { user } = useAppSelector((state: RootState) => state.auth)
  const [text, setText] = useState<string>("")
  const [isSending, setIsSending] = useState<boolean>(false)

  const onSendComment = async () => {
    if (!user || !user.userId || text.trim().length === 0) return

    const userComment: Comment = {
      user,
      content: text.trim(),
      id: v4(),
      date: new Date(),
      followUpComments: [],
      contentId,
      likes: 0,
      dislikes: 0,
    }

    setIsSending(true)
    try {
      await comment(userComment, replyingTo)
      setText("")
      onCancelReply()
      onCommentPosted()
    } catch (error) {
      console.error("Failed to post comment:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendComment()
    }
  }

  return (
    <div className="mb-6">
      {replyingTo && (
        <div className="flex items-center justify-between mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
          <div className="truncate text-blue-700 dark:text-blue-300">
            Replying to <span className="font-medium">{replyingTo.user.name}</span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <AvatarSection src={""} />
        <div className="flex-1 relative">
          <div className="relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full min-h-[40px] p-3 border-b border-gray-300 dark:border-gray-700 resize-none focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={replyingTo ? `Reply to ${replyingTo.user.name}...` : "Add a comment..."}
              disabled={isSending}
              rows={1}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={onSendComment}
                disabled={text.trim().length === 0 || isSending}
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${text.trim().length === 0 || isSending
                  ? "bg-blue-200 text-white dark:bg-blue-800 dark:text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  }`}
              >
                {isSending ? <Loader className="animate-spin" size={16} /> : "Comment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}