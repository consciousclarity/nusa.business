import { TAXONOMY, categoryLabel } from "@nusa/shared";

const MAX_CATEGORIES = 12;

export function CategoryPicker({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  function toggle(slug: string) {
    if (disabled) return;
    if (value.includes(slug)) {
      onChange(value.filter((s) => s !== slug));
      return;
    }
    if (value.length >= MAX_CATEGORIES) return;
    onChange([...value, slug]);
  }

  const selectedLabels = value.map(categoryLabel).join(" · ");

  return (
    <fieldset className="category-picker" disabled={disabled}>
      <legend>Categories</legend>
      <p className="muted">
        {value.length}/{MAX_CATEGORIES} selected
        {selectedLabels ? ` · ${selectedLabels}` : ""}
      </p>
      <div className="category-groups">
        {TAXONOMY.map((group) => {
          const selectedInGroup =
            (value.includes(group.slug) ? 1 : 0) +
            group.children.filter((c) => value.includes(c.slug)).length;
            const open =
            group.slug === "food-drink" ||
            selectedInGroup > 0 ||
            (group.related?.some((r) => value.includes(r.slug)) ?? false);
          return (
            <details key={group.slug} defaultOpen={open}>
              <summary>
                {group.label}
                {selectedInGroup > 0 ? ` (${selectedInGroup})` : ""}
              </summary>
              <label className="category-option">
                <input
                  type="checkbox"
                  checked={value.includes(group.slug)}
                  onChange={() => toggle(group.slug)}
                />
                Whole group
              </label>
              <ul>
                {group.children.map((child) => (
                  <li key={child.slug}>
                    <label className="category-option">
                      <input
                        type="checkbox"
                        checked={value.includes(child.slug)}
                        onChange={() => toggle(child.slug)}
                      />
                      {child.label}
                    </label>
                  </li>
                ))}
              </ul>
              {group.related && group.related.length > 0 && (
                <p className="muted related-note">
                  Related services (canonical records in other groups, not
                  duplicates):{" "}
                  {group.related
                    .map((rel) => `${rel.as} → ${categoryLabel(rel.slug)}`)
                    .join(" · ")}
                </p>
              )}
            </details>
          );
        })}
      </div>
    </fieldset>
  );
}
