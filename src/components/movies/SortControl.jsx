const SORT_OPTIONS = [
  { value: "date-desc", label: "Vizyon Tarihi (Yeni → Eski)" },
  { value: "date-asc", label: "Vizyon Tarihi (Eski → Yeni)" },
  { value: "rating-desc", label: "Puan (Yüksek → Düşük)" },
  { value: "rating-asc", label: "Puan (Düşük → Yüksek)" },
];

export const DEFAULT_SORT = "date-desc";

function SortControl({ value, onChange }) {
  return (
    <label className="movie-sort-control">
      <span>Sırala</span>

      <select
        className="movie-sort-select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default SortControl;
