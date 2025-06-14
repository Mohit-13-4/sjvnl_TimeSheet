
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface CommentSectionProps {
  comment: string;
  onCommentChange: (comment: string) => void;
  isAdmin: boolean;
}

const CommentSection = ({ comment, onCommentChange, isAdmin }: CommentSectionProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Comment:</label>
          <Textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Please enter the comments"
            className="min-h-[100px]"
            maxLength={255}
            disabled={isAdmin}
          />
          <div className="text-right text-sm text-gray-500">
            {comment.length} / 255
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentSection;
