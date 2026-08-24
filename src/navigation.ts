// Module-level navigate ref so WebMCP tool `execute` functions can route
// without closing over React state. Set by the root component.
import type { NavigateFunction } from "react-router";

export const navigateRef: { current: NavigateFunction | null } = {
  current: null,
};
