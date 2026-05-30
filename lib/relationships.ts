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
export type LeaderboardAudience = "family" | "friends" | "all";

export function normalizeRelationship(value?: string | null) {
  if (!value) return "";
  const match = relationshipOptions.find((option) => option.toLowerCase() === value.toLowerCase());
  return match || value;
}

export function isFamilyFriendRelationship(value?: string | null) {
  return normalizeRelationship(value).toLowerCase() === "family friend";
}

export function leaderboardAudienceForRelationship(value?: string | null): LeaderboardAudience {
  return isFamilyFriendRelationship(value) ? "friends" : "family";
}
