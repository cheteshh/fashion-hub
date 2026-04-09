import { X } from "lucide-react";
import { Filters } from "@/hooks/useFilters";

interface FilterSidebarProps {
  filters: Filters;
  availableCategories: string[];
  availableBrands: string[];
  availableGenders: string[];
  globalMin: number;
  globalMax: number;
  onToggleCategory: (cat: string) => void;
  onToggleBrand: (brand: string) => void;
  onToggleGender: (gender: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onReset: () => void;
}

const FilterSidebar = ({
  filters, availableCategories, availableBrands, availableGenders,
  globalMin, globalMax,
  onToggleCategory, onToggleBrand, onToggleGender,
  onPriceChange, onReset,
}: FilterSidebarProps) => {
  const hasActiveFilters =
    filters.categories.length > 0 || filters.brands.length > 0 ||
    filters.genders.length > 0 ||
    filters.priceMin > globalMin || filters.priceMax < globalMax;

  return (
    <aside className="w-full rounded-xl border bg-card p-5 lg:w-64 lg:shrink-0">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <button onClick={onReset} className="flex items-center gap-1 text-xs text-accent hover:underline">
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* Gender */}
      {availableGenders.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-foreground">Gender</p>
          <div className="flex flex-wrap gap-2">
            {availableGenders.map((g) => (
              <button
                key={g}
                onClick={() => onToggleGender(g)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  filters.genders.includes(g)
                    ? "bg-accent text-accent-foreground"
                    : "border bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="mt-5">
        <p className="mb-2 text-sm font-medium text-foreground">Price Range</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.priceMin}
            onChange={(e) => onPriceChange(Number(e.target.value), filters.priceMax)}
            placeholder="Min"
            className="h-9 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-muted-foreground">–</span>
          <input
            type="number"
            value={filters.priceMax}
            onChange={(e) => onPriceChange(filters.priceMin, Number(e.target.value))}
            placeholder="Max"
            className="h-9 w-full rounded-lg border bg-secondary px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>₹{globalMin.toLocaleString()}</span>
          <span>₹{globalMax.toLocaleString()}</span>
        </div>
      </div>

      {/* Categories */}
      {availableCategories.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-foreground">Category</p>
          <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
            {availableCategories.map((cat) => (
              <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat)}
                  onChange={() => onToggleCategory(cat)}
                  className="h-4 w-4 rounded accent-amber-500"
                />
                <span className="text-foreground">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Brands */}
      {availableBrands.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-foreground">Brand</p>
          <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
            {availableBrands.map((brand) => (
              <label key={brand} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => onToggleBrand(brand)}
                  className="h-4 w-4 rounded accent-amber-500"
                />
                <span className="text-foreground">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default FilterSidebar;
