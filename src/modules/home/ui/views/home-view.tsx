import { CategoriesSection } from "../sections/categories-section";
import { HomeVideosSection } from "../sections/home-videos-section";

interface Props {
  categoryId?: string;
}

export const HomeView = ({ categoryId }: Props) => {
  return (
    <div className="w-full max-w-full mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6 overflow-hidden">
      <CategoriesSection categoryId={categoryId} />
      <HomeVideosSection categoryId={categoryId} />
    </div>
  );
};
