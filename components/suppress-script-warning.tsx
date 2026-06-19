// app/components/suppress-script-warning.tsx
"use client";

// next-themes (used internally by NeonAuthUIProvider) renders an inline
// <script> tag to prevent a theme flash before hydration. React 19 warns
// about any <script> rendered by a component — this is a known false
// positive for that use case and doesn't affect functionality.
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function SuppressScriptWarning() {
  return null;
}