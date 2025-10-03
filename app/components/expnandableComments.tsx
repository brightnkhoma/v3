'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Comments } from './commentSnippet';

interface ExpandableCommentsProps {
  item: any;
  defaultExpanded?: boolean;
  maxHeight?: string;
  className?: string;
  showCommentCount?: boolean;
  commentCount?: number;
}

const ExpandableComments = ({ 
  item, 
  defaultExpanded = false,
  maxHeight = '400px',
  className,
  showCommentCount = false,
  commentCount = 0
}: ExpandableCommentsProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;

  return (
    <Card className={cn("w-full transition-colors", className)}>
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full flex items-center justify-between p-0 h-auto font-semibold hover:bg-transparent",
            "hover:text-foreground/80 transition-colors"
          )}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Comments</span>
            {showCommentCount && commentCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {commentCount}
              </Badge>
            )}
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 transition-transform" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform" />
          )}
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out overflow-hidden",
            isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          )}
          style={isExpanded ? { maxHeight } : {}}
        >
          <div className={cn(
            "p-4 pt-0 border-t",
            currentTheme === 'dark' ? "border-gray-700" : "border-gray-200"
          )}>
            <Comments item={item} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpandableComments;