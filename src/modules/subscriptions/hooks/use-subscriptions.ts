import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface UseSubscriptionProps {
  userId: string;
  isSubscribed: boolean;
  fromVideoId?: string;
}

function useSubscription({
  userId,
  isSubscribed,
  fromVideoId,
}: UseSubscriptionProps) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const subscribe = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success("Subscribed");
      utils.subscriptions.getMany.invalidate();
      utils.videos.getManySubscribed.invalidate();
      utils.users.getOne.invalidate({ id: userId });
      if (fromVideoId) utils.videos.getOne.invalidate({ id: fromVideoId });
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/login");
      }
    },
  });

  const unsubscribe = trpc.subscriptions.remove.useMutation({
    onSuccess: () => {
      toast.success("Unsubscribed");
      utils.subscriptions.getMany.invalidate();
      utils.videos.getManySubscribed.invalidate();
      utils.users.getOne.invalidate({ id: userId });
      if (fromVideoId) utils.videos.getOne.invalidate({ id: fromVideoId });
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/login");
      }
    },
  });

  const isPending = subscribe.isPending || unsubscribe.isPending;

  const onClick = () => {
    if (isSubscribed) unsubscribe.mutate({ userId });
    else subscribe.mutate({ userId });
  };

  return {
    isPending,
    onClick,
  };
}

export default useSubscription;
