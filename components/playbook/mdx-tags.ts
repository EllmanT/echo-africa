/** The only JSX tags an article may use. Kept apart from mdx.tsx so scripts can import it without React. */
export const ALLOWED_MDX_TAGS = ["Illustration", "Callout"] as const;
