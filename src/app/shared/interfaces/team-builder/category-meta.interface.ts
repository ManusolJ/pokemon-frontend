/**
 * Display metadata for a move category badge: the short abbreviation
 * shown in dense lists and the CSS modifier class that paints it.
 *
 * The `class` value differs across the move-row UIs (compact lists use
 * `move-row__cat--*`, the move picker grid uses `move__cat--*`), so each
 * consumer keeps its own `CATEGORY_META` mapping while sharing this shape.
 */
export interface CategoryMeta {
  readonly abbr: string;
  readonly class: string;
}
