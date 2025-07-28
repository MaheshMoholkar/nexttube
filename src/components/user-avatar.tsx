import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cva, VariantProps } from "class-variance-authority";

const avatarVariants = cva("", {
  variants: {
    size: {
      default: "w-9 h-9",
      xs: "w-4 h-4",
      sm: "w-6 h-6",
      lg: "w-10 h-10",
      xl: "w-[160px] h-[160px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
  imageUrl: string;
  name: string;
  className?: string;
  onClick?: () => void;
}

export const UserAvatar = ({
  imageUrl,
  name,
  size,
  className,
  onClick,
}: UserAvatarProps) => {
  return (
    <Avatar
      className={cn(avatarVariants({ size }), className)}
      onClick={onClick}
    >
      {imageUrl && <AvatarImage src={imageUrl} alt={name} />}
      <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
};
