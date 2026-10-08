"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useInView } from "react-intersection-observer";
import { Loader2, AlertCircle } from "lucide-react";
import { SearchService, SearchFilters, SearchResult } from "@/lib/services/search-service";
import { SearchFiltersPanel } from "./search-filters-panel";
import { AthleteSearchCard } from "./athlete-search-card";
import { Button } from "@/components/ui/button";

export function SearchPage() {
  const t = useTranslations("Search");
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: "compatibility",
  });

  const [results, setResults] = useState<SearchResult[]>([]);
  const [availableSports, setAvailableSports] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load initial results when filters change
  useEffect(() => {
    loadResults();
  }, [filters.query, filters.sports, filters.countries, filters.levels, filters.positions, filters.availability]);

  // Load more on scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading && offset > 0) {
      loadMoreResults();
    }
  }, [inView, hasMore, isLoading, offset]);

  const loadFilterOptions = async () => {
    const [sportsResult, countriesResult, positionsResult] = await Promise.all([
      SearchService.getAvailableSports(),
      SearchService.getAvailableCountries(),
      SearchService.getAllPositions(),
    ]);

    if (sportsResult.ok) setAvailableSports(sportsResult.data);
    if (countriesResult.ok) setAvailableCountries(countriesResult.data);
    if (positionsResult.ok) setAvailablePositions(positionsResult.data);
  };

  const loadResults = async () => {
    setIsLoading(true);
    setHasError(false);
    setOffset(0);

    const result = await SearchService.searchAthletes(filters, 20, 0);
    if (result.ok) {
      setResults(result.data);
      setHasMore(result.data.length === 20);
      setOffset(20);
    } else {
      setHasError(true);
    }
    setIsLoading(false);
  };

  const loadMoreResults = async () => {
    const result = await SearchService.searchAthletes(filters, 20, offset);
    if (result.ok) {
      setResults((prev) => [...prev, ...result.data]);
      setOffset((prev) => prev + 20);
      setHasMore(result.data.length === 20);
    }
  };

  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 py-6 max-w-7xl mx-auto">
      {/* Filters Sidebar (Desktop) */}
      <div className="md:col-span-1">
        <div className="sticky top-20">
          <SearchFiltersPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableSports={availableSports}
            availableCountries={availableCountries}
            availablePositions={availablePositions}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Results Area */}
      <div className="md:col-span-3">
        {/* Results Count */}
        {!isLoading && results.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("resultCount", { count: results.length })}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && results.length === 0 && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">
                {t("loading")}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && results.length === 0 && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {t("error")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {t("errorDescription")}
              </p>
              <Button onClick={loadResults} variant="outline">
                {t("retry")}
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasError && results.length === 0 && (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {t("noResults")}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {t("noResultsDescription")}
              </p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((athlete) => (
              <AthleteSearchCard key={athlete.id} athlete={athlete} />
            ))}

            {/* Infinite Scroll Trigger */}
            {hasMore && (
              <div ref={ref} className="flex justify-center py-8">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t("loadingMore")}
                  </p>
                )}
              </div>
            )}

            {!hasMore && results.length > 0 && (
              <div className="flex justify-center py-8">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t("endOfResults")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
