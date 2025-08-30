"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { videoUpdateSchema } from "@/db/schema";
import { trpc } from "@/trpc/client";
import {
  CopyCheckIcon,
  CopyIcon,
  Globe2Icon,
  ImagePlusIcon,
  LockIcon,
  MoreVertical,
  Sparkles,
  RotateCcw,
  TrashIcon,
  Loader2,
} from "lucide-react";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import Link from "next/link";
import { env } from "@/env";
import { snakeCaseToTitle } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import { ThumbnailUploadModal } from "../components/thumbnail-upload-modal";
import { ThumbnailGenerateModal } from "../components/thumbnail-generate-modal";
import { Skeleton } from "@/components/ui/skeleton";

export const FormSection = ({ videoId }: { videoId: string }) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSkeleton = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="flex items-center gap-x-2">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <div className="space-y-8 lg:col-span-3">
          {/* Title field */}
          <div className="space-y-2">
            <div className="flex items-center gap-x-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <div className="flex items-center gap-x-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>

          {/* Thumbnail field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-[84px] w-[153px]" />
          </div>

          {/* Category field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        <div className="flex flex-col gap-y-8 lg:col-span-2">
          {/* Video preview */}
          <div className="bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
            <div className="aspect-video">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="p-4 flex flex-col gap-y-6">
              {/* Video Link */}
              <div className="flex justify-between items-center gap-x-2">
                <div className="flex flex-col gap-y-1 flex-1">
                  <Skeleton className="h-3 w-16" />
                  <div className="flex items-center gap-x-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>

              {/* Video Status */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>

              {/* Subtitles Status */}
              <div className="flex justify-between items-center">
                <div className="flex flex-col gap-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </div>

          {/* Visibility field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const FormSectionSuspense = ({ videoId }: { videoId: string }) => {
  const utils = trpc.useUtils();
  const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
  const [categories] = trpc.categories.getMany.useSuspenseQuery();

  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const [thumbnailGenerateModalOpen, setThumbnailGenerateModalOpen] =
    useState(false);
  const router = useRouter();

  const updateVideo = trpc.videos.update.useMutation({
    onSuccess: () => {
      utils.studio.getOne.invalidate({ id: videoId });
      utils.studio.getMany.invalidate();
      toast.success("Video updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const removeVideo = trpc.videos.remove.useMutation({
    onSuccess: () => {
      utils.studio.getMany.invalidate();
      toast.success("Video removed");
      router.push("/studio");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const revalidate = trpc.videos.revalidate.useMutation({
    onSuccess: () => {
      utils.studio.getOne.invalidate({ id: videoId });
      utils.studio.getMany.invalidate();
      toast.success("Video revalidated");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
    onSuccess: () => {
      utils.studio.getOne.invalidate({ id: videoId });
      utils.studio.getMany.invalidate();
      toast.success("Thumbnail restored");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const generateTitle = trpc.videos.generateTitle.useMutation({
    onSuccess: () => {
      toast.success("Generating", {
        description: "The thumbnail will be generated in a few minutes",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const generateDescription = trpc.videos.generateDescription.useMutation({
    onSuccess: () => {
      toast.success("Generating", {
        description: "The description will be generated in a few minutes",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
    updateVideo.mutate(data);
  };

  const videoLink = `${env.NEXT_PUBLIC_APP_URL}/videos/${video.id}`;

  const [isCopied, setIsCopied] = useState(false);

  return (
    <>
      <ThumbnailGenerateModal
        videoId={videoId}
        open={thumbnailGenerateModalOpen}
        onOpenChange={setThumbnailGenerateModalOpen}
      />
      <ThumbnailUploadModal
        videoId={videoId}
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Video Details</h1>
              <p className="text-xs text-muted-foreground">
                Manage your video details
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={updateVideo.isPending}>
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => revalidate.mutate({ id: videoId })}
                    disabled={revalidate.isPending}
                  >
                    <RotateCcw className="size-4 mr-2" />
                    Revalidate
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => removeVideo.mutate({ id: videoId })}
                    disabled={removeVideo.isPending}
                  >
                    <TrashIcon className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
            <div className="space-y-8 lg:col-span-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-x-2">
                        Title
                        <Button
                          variant="outline"
                          size="icon"
                          type="button"
                          className="rounded-full size-6 [&_svg]:size-3"
                          onClick={() => generateTitle.mutate({ id: videoId })}
                          disabled={
                            generateTitle.isPending || !video.muxTrackId
                          }
                        >
                          {generateTitle.isPending ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Sparkles />
                          )}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Add a title to your video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-x-2">
                      Description
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        className="rounded-full size-6 [&_svg]:size-3"
                        onClick={() =>
                          generateDescription.mutate({ id: videoId })
                        }
                        disabled={
                          generateDescription.isPending || !video.muxTrackId
                        }
                      >
                        {generateDescription.isPending ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Sparkles />
                        )}
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        className="resize-none pr-10 min-h-[200px]"
                        placeholder="Add a description to your video"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="muxThumbnail"
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className="p-0 5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group">
                        <Image
                          src={video.muxThumbnail || THUMBNAIL_FALLBACK}
                          fill
                          alt="Thumbnail"
                          className="object-cover"
                          unoptimized={!!video.muxThumbnail}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              size="icon"
                              className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300"
                            >
                              <MoreVertical className="text-white" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem
                              onClick={() =>
                                setThumbnailModalOpen((prev) => !prev)
                              }
                            >
                              <ImagePlusIcon className="size-4 mr-1" /> Change
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setThumbnailGenerateModalOpen(true)
                              }
                              disabled={generateTitle.isPending}
                            >
                              <Sparkles className="size-4 mr-1" /> AI Generated
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                restoreThumbnail.mutate({ id: videoId })
                              }
                              disabled={restoreThumbnail.isPending}
                            >
                              <RotateCcw className="size-4 mr-1" /> Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-y-8 lg:col-span-2">
              <div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
                <div className="aspect-video overflow-hidden relative">
                  <VideoPlayer
                    playbackId={video.muxPlaybackId ?? undefined}
                    muxThumbnail={video.muxThumbnail ?? undefined}
                  />
                </div>
                <div className="p-4 flex flex-col gap-y-6">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-xs text-muted-foreground">
                        Video Link
                      </p>
                      <div className="flex items-center gap-x-2">
                        <Link href={`/videos/${video.id}`}>
                          <p className="line-clamp-1 text-sm text-blue-500">
                            {videoLink}
                          </p>
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(videoLink);
                            setIsCopied(true);
                            setTimeout(() => {
                              setIsCopied(false);
                            }, 2000);
                          }}
                          disabled={updateVideo.isPending}
                        >
                          {isCopied ? (
                            <CopyCheckIcon className="size-4 text-green-500" />
                          ) : (
                            <CopyIcon className="size-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Video Status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(video.muxStatus || "uploading")}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-y-1">
                      <p className="text-muted-foreground text-xs">
                        Subtitles Status
                      </p>
                      <p className="text-sm">
                        {snakeCaseToTitle(
                          video.muxTrackStatus || "no_subtitles"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">
                          <Globe2Icon className="size-4 mr-2" /> Public
                        </SelectItem>
                        <SelectItem value="private">
                          <LockIcon className="size-4 mr-2" /> Private
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
