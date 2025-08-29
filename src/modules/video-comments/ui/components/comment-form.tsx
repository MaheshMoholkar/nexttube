"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/user-avatar";
import { videoCommentInsertSchema } from "@/db/schema";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

function CommentForm({
  videoId,
  parentId,
  onSuccess,
  onCancel,
  variant = "comment",
}: {
  videoId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: "comment" | "reply";
}) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const utils = trpc.useUtils();

  const create = trpc.videoComments.create.useMutation({
    onSuccess: () => {
      utils.videoComments.getMany.invalidate({ videoId });
      form.reset();
      toast.success(variant === "comment" ? "Comment added" : "Reply added");
      onSuccess?.();
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/login");
      } else {
        toast.error(
          variant === "comment"
            ? "Failed to add comment"
            : "Failed to add reply"
        );
      }
    },
  });

  const formSchema = videoCommentInsertSchema.omit({ userId: true });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parentId,
      videoId,
      content: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    create.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    onCancel?.();
  };

  return (
    <Form {...form}>
      <form
        className="flex gap-4 group"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <UserAvatar
          size="lg"
          imageUrl={session?.user.image ?? "/user-placeholder.svg"}
          name={session?.user.name ?? "User"}
        />
        <div className="flex-1">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder={
                      variant === "comment"
                        ? "Add a comment..."
                        : "Add a reply..."
                    }
                    {...field}
                    className="resize-none bg-transparent overflow-hidden min-h-0"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="justify-end gap-2 mt-2 flex">
            {onCancel && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" size="sm" disabled={create.isPending}>
              {variant === "comment" ? "Comment" : "Reply"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export default CommentForm;
