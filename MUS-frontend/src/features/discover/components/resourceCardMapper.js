const DEFAULT_THUMB = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatCompact = (value) => {
  const n = toNumber(value, 0);
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
};

const formatDuration = (resource) => {
  const raw = resource?.duration_label || resource?.duration;
  if (raw && String(raw).trim()) return String(raw).trim();

  const seconds = toNumber(resource?.duration_seconds, 0);
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const isVideoResource = (resource, metadata = {}) => {
  const formatValue = String(resource?.format || resource?.resource_format || '').toLowerCase();
  const typeValue = String(resource?.educational_type || resource?.resource_type || '').toLowerCase();
  const mimeValue = String(resource?.mime_type || metadata?.mime_type || metadata?.file?.mime_type || '').toLowerCase();
  const url = String(resource?.url || '').toLowerCase();

  if (formatValue.includes('video') || typeValue.includes('video') || mimeValue.startsWith('video/')) return true;
  if (/\.(mp4|mov|avi|mkv|webm|m4v)(\?|$)/.test(url)) return true;
  return false;
};

const toTitle = (value, fallback = 'General') => {
  const normalized = String(value || '').trim();
  if (!normalized) return fallback;
  return normalized
    .split(/[\s_-]+/)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(' ');
};

const categoryColorMap = {
  mathematics: '#2563EB',
  science: '#0891B2',
  languages: '#7C3AED',
  language: '#7C3AED',
  biology: '#16A34A',
  'computer science': '#2563EB',
  'study skills': '#9333EA',
};

const pickCategory = (resource) => {
  const raw =
    resource?.category ||
    resource?.subject ||
    resource?.module_title ||
    resource?.educational_type ||
    resource?.educationalType ||
    '';

  const label = toTitle(raw, 'General');
  const color = categoryColorMap[label.toLowerCase()] || '#2563EB';
  return { label, color };
};

export const toResourceCardModel = (resource) => {
  const metadata = typeof resource?.metadata === 'object'
    ? resource.metadata
    : (() => {
      try {
        return resource?.metadata ? JSON.parse(resource.metadata) : {};
      } catch {
        return {};
      }
    })();

  const category = pickCategory(resource);
  const avgRating = toNumber(resource?.average_rating ?? resource?.avg_rating ?? resource?.rating, 0);
  const totalFavorites = toNumber(resource?.total_favorites ?? resource?.likes ?? resource?.favorites, 0);
  const views = toNumber(resource?.view_count ?? resource?.total_views ?? resource?.downloads ?? 0, 0);
  const isVideo = isVideoResource(resource, metadata);

  return {
    id: resource?.id || resource?.resource_id || `${resource?.title || resource?.resource_title || 'resource'}-${resource?.created_at || resource?.createdAt || 'na'}`,
    title: resource?.title || resource?.resource_title || 'Untitled resource',
    description: resource?.description || resource?.resource_description || metadata?.summary || 'No description provided.',
    category: category.label,
    author: resource?.creator_name || resource?.created_by_name || resource?.author?.name || resource?.author_name || 'Unknown Author',
    rating: avgRating > 0 ? Number(avgRating.toFixed(1)) : 0,
    views: formatCompact(views),
    likes: formatCompact(totalFavorites),
    duration: isVideo ? formatDuration(resource) : null,
    thumb:
      resource?.thumbnail_url ||
      resource?.thumbnail ||
      metadata?.thumbnail_url ||
      metadata?.thumbnail?.public_url ||
      resource?.cover_url ||
      resource?.preview_url ||
      DEFAULT_THUMB,
    avatar:
      resource?.creator_avatar_url ||
      resource?.author?.avatar_url ||
      resource?.author?.avatarUrl ||
      resource?.creator?.avatar_url ||
      resource?.creator?.avatarUrl ||
      resource?.avatar_url ||
      resource?.avatar ||
      '',
    color: category.color,
  };
};
