'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, ThumbsUp, ThumbsDown, Send, User as UserIcon } from 'lucide-react';
import { User ,Comment} from '../lib/types';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentsSectionProps {
  contentId: string;
  initialComments: Comment[];
  currentUser: User;
  onAddComment: (comment: Omit<Comment, 'id' | 'date'>) => Promise<void>;
}

export function CommentsSection({ contentId, initialComments, currentUser, onAddComment }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const { theme } = useTheme();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const handleAddComment = async (data: CommentFormData) => {
    try {
      const newComment: Omit<Comment, 'id' | 'date'> = {
        user: currentUser,
        content: data.content,
        contentId,
        followUpComments: [],
        likes: 0,
        dislikes: 0,
      };

      await onAddComment(newComment);
      
      // For demo purposes, we'll add it locally
      const commentWithId: Comment = {
        ...newComment,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date(),
      };

      if (replyingTo) {
        setComments(prev => 
          prev.map(comment => 
            comment.id === replyingTo 
              ? { ...comment, followUpComments: [...comment.followUpComments, commentWithId] }
              : comment
          )
        );
        setReplyingTo(null);
      } else {
        setComments(prev => [commentWithId, ...prev]);
      }
      
      reset();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleLike = (commentId: string) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

  const handleDislike = (commentId: string) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? { ...comment, dislikes: comment.dislikes + 1 }
          : comment
      )
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border-l-2 ${depth > 0 ? 'pl-4 ml-4' : 'pl-0'} ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar>
              <AvatarImage src={`/api/avatar/${comment.user.userId}`} />
              <AvatarFallback>
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">{comment.user.name}</span>
                <span className="text-xs text-gray-500">{formatDate(comment.date)}</span>
              </div>
              
              <p className="mt-2 text-sm">{comment.content}</p>
              
              <div className="flex items-center space-x-4 mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(comment.id)}
                  className="flex items-center space-x-1"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>{comment.likes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDislike(comment.id)}
                  className="flex items-center space-x-1"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>{comment.dislikes}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center space-x-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Reply</span>
                </Button>
              </div>

              {replyingTo === comment.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <form onSubmit={handleSubmit(handleAddComment)} className="space-y-2">
                    <Textarea
                      placeholder="Write a reply..."
                      {...register('content')}
                      className="min-h-[80px]"
                    />
                    {errors.content && (
                      <p className="text-sm text-red-500">{errors.content.message}</p>
                    )}
                    <div className="flex space-x-2">
                      <Button type="submit" size="sm" disabled={isSubmitting}>
                        <Send className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {comment.followUpComments.length > 0 && (
        <div className="ml-6">
          {comment.followUpComments.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div id='comments' className="w-full  mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Add Comment Form */}
          <form onSubmit={handleSubmit(handleAddComment)} className="mb-6 space-y-3">
            <div className="flex items-start space-x-3">
              <Avatar>
                <AvatarImage src={`/api/avatar/${currentUser.userId}`} />
                <AvatarFallback>
                  <UserIcon className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="Add your comment..."
                  {...register('content')}
                  className="min-h-[100px]"
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="ml-12">
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </Button>
          </form>

          {/* Comments List */}
          <AnimatePresence>
            {comments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-gray-500"
              >
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}