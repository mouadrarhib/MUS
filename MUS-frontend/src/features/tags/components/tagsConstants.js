// src/features/tags/components/tagsConstants.js

/** Ordered list of tag categories for the form Select. */
export const CATEGORY_OPTIONS = [
  { value: 'topic', label: 'Topic' },
  { value: 'subject', label: 'Subject' },
  { value: 'level', label: 'Level' },
  { value: 'format', label: 'Format' },
  { value: 'language', label: 'Language' },
  { value: 'other', label: 'Other' },
];

/**
 * Build a blank draft object, optionally pre-filled from an existing tag.
 * @param {object|null} tag
 */
export const createDraft = (tag = null) => ({
  name: tag?.name || '',
  slug: tag?.slug || '',
  category: tag?.category || 'topic',
  description: tag?.description || '',
  is_active: typeof tag?.is_active === 'boolean' ? tag.is_active : true,
});

/**
 * Convert a free-form string into a URL-safe slug.
 * @param {string} value
 */
export const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

/**
 * Format an ISO date string for display in the usage breakdown.
 * @param {string|null|undefined} value
 */
export const formatUsageDate = (value) => {
  if (!value) return 'No recent activity';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No recent activity';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};