export const relationshipOptions = [
  "Niece",
  "Nephew",
  "Brother",
  "Sister",
  "Dad",
  "Mom",
  "Son",
  "Daughter",
  "Cousin",
  "Aunt",
  "Uncle",
  "Grandparent",
  "Family friend",
  "Other family"
] as const;

export type RelationshipOption = (typeof relationshipOptions)[number];

export function normalizeRelationship(value?: string | null) {
  if (!value) return "";
  const match = relationshipOptions.find((option) => option.toLowerCase() === value.toLowerCase());
  return match || value;
}
