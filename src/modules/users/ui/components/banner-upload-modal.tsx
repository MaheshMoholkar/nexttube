import { ResponsiveModal } from "@/hooks/responsive-dialog";
import { UploadButton } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { ImageIcon } from "lucide-react";

interface BannerUploadModalProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BannerUploadModal = ({
  userId,
  open,
  onOpenChange,
}: BannerUploadModalProps) => {
  const utils = trpc.useUtils();

  const handleUploadComplete = () => {
    utils.users.getOne.invalidate({ id: userId });
    onOpenChange(false);
    toast.success("Banner uploaded");
  };

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      title="Upload Banner"
    >
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
              <ImageIcon className="w-8 h-8 text-gray-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Banner
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Choose an image to use as your banner. This will be displayed on
                your profile page.
              </p>
            </div>

            <div className="space-y-2">
              <UploadButton
                endpoint="bannerUploader"
                onClientUploadComplete={handleUploadComplete}
                onUploadError={(error) => {
                  toast.error(error.message);
                }}
                className="ut-button:bg-blue-600 ut-button:hover:bg-blue-700 ut-button:text-white ut-button:rounded-lg ut-button:px-6 ut-button:py-3 ut-button:font-medium"
              />
              <p className="text-xs text-gray-400">PNG, JPG, GIF up to 4MB</p>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
};
