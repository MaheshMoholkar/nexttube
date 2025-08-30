import { CategoriesSection } from "@/modules/home/ui/sections/categories-section";
import React from "react";
import ResultsSection from "../../sections/results-section";

function SearchView({
  query,
  categoryId,
}: {
  query: string | undefined;
  categoryId: string | undefined;
}) {
  return (
    <div className="max-w-[1300px] mx-auto mb-10 flex flex-col gap-y-6 px-4 pt-2.5">
      <CategoriesSection categoryId={categoryId} />
      <ResultsSection query={query} categoryId={categoryId} />
    </div>
  );
}

export default SearchView;
