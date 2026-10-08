"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchFilters } from "@/lib/services/search-service";
import { SPORTS_LABELS, LEVELS } from "@/lib/constants";

interface SearchFiltersPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableSports: string[];
  availableCountries: string[];
  availablePositions: string[];
  isLoading?: boolean;
}

export function SearchFiltersPanel({
  filters,
  onFiltersChange,
  availableSports,
  availableCountries,
  availablePositions,
  isLoading = false,
}: SearchFiltersPanelProps) {
  const t = useTranslations("Search");
  const [isOpen, setIsOpen] = useState(false);

  const handleQueryChange = (value: string) => {
    onFiltersChange({ ...filters, query: value || undefined });
  };

  const toggleSport = (sport: string) => {
    const sports = filters.sports || [];
    const updated = sports.includes(sport)
      ? sports.filter((s) => s !== sport)
      : [...sports, sport];
    onFiltersChange({ ...filters, sports: updated.length > 0 ? updated : undefined });
  };

  const toggleLevel = (level: string) => {
    const levels = filters.levels || [];
    const updated = levels.includes(level as any)
      ? levels.filter((l) => l !== level)
      : [...levels, level as any];
    onFiltersChange({ ...filters, levels: updated.length > 0 ? updated : undefined });
  };

  const togglePosition = (position: string) => {
    const positions = filters.positions || [];
    const updated = positions.includes(position)
      ? positions.filter((p) => p !== position)
      : [...positions, position];
    onFiltersChange({ ...filters, positions: updated.length > 0 ? updated : undefined });
  };

  const handleCountriesChange = (value: string) => {
    onFiltersChange({ ...filters, countries: value ? [value] : undefined });
  };

  const handleAvailabilityChange = (value: string) => {
    onFiltersChange({
      ...filters,
      availability: value ? (value as any) : undefined,
    });
  };

  const handleReset = () => {
    onFiltersChange({
      query: undefined,
      sports: undefined,
      countries: undefined,
      levels: undefined,
      positions: undefined,
      availability: undefined,
      sortBy: "compatibility",
    });
  };

  const hasActiveFilters =
    filters.query ||
    (filters.sports && filters.sports.length > 0) ||
    (filters.countries && filters.countries.length > 0) ||
    (filters.levels && filters.levels.length > 0) ||
    (filters.positions && filters.positions.length > 0) ||
    filters.availability;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 pb-4">
        <Input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={filters.query || ""}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex w-full items-center justify-between px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      >
        <span className="font-medium text-sm">
          {t("filters")}
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {(filters.sports?.length || 0) +
                (filters.levels?.length || 0) +
                (filters.positions?.length || 0) +
                (filters.countries?.length || 0 ? 1 : 0)}
            </Badge>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Filters Panel */}
      <div
        className={`space-y-4 md:block ${isOpen ? "block" : "hidden"} md:space-y-6`}
      >
        {/* Sport Filter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900 dark:text-white">
            {t("sport")}
          </label>
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
            {availableSports.map((sport) => (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.sports?.includes(sport)
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {SPORTS_LABELS[sport] || sport}
              </button>
            ))}
          </div>
        </div>

        {/* Level Filter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900 dark:text-white">
            {t("level")}
          </label>
          <div className="space-y-2">
            {Object.entries(LEVELS).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.levels?.includes(key as any) || false}
                  onChange={() => toggleLevel(key)}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Position Filter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900 dark:text-white">
            {t("position")}
          </label>
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
            {availablePositions.map((position) => (
              <button
                key={position}
                onClick={() => togglePosition(position)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.positions?.includes(position)
                    ? "bg-green-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {position}
              </button>
            ))}
          </div>
        </div>

        {/* Country Filter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900 dark:text-white">
            {t("country")}
          </label>
          <Select
            value={filters.countries?.[0] || ""}
            onValueChange={handleCountriesChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectCountry")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("allCountries")}</SelectItem>
              {availableCountries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Availability Filter */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900 dark:text-white">
            {t("availability")}
          </label>
          <Select
            value={filters.availability || ""}
            onValueChange={handleAvailabilityChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("anyAvailability")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("anyAvailability")}</SelectItem>
              <SelectItem value="free">{t("free")}</SelectItem>
              <SelectItem value="under_contract">
                {t("underContract")}
              </SelectItem>
              <SelectItem value="on_loan">{t("onLoan")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!hasActiveFilters || isLoading}
            className="flex-1"
          >
            {t("reset")}
          </Button>
          <Button
            size="sm"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
            className="flex-1 md:hidden"
          >
            {t("apply")}
          </Button>
        </div>
      </div>
    </div>
  );
}
