export const toResourceDetailModel = (
  item,
  { defaultStatus = 'published', defaultAccessTier = 'free' } = {}
) => {
  if (!item) return null;

  const accessTier = item?.access_tier || item?.accessTier || defaultAccessTier;

  return {
    ...item,
    id: Number(item?.id || item?.resource_id || 0),
    title: item?.title || item?.resource_title || 'Untitled resource',
    description: item?.description || item?.resource_description || '',
    status: item?.status || item?.resource_status || defaultStatus,
    educationalType:
      item?.educationalType || item?.educational_type || item?.resource_educational_type || 'other',
    format: item?.format || item?.resource_format || 'other',
    createdAt: item?.createdAt || item?.created_at || null,
    access_tier: accessTier,
    accessTier,
    author: {
      id: item?.author?.id || item?.created_by || item?.creator_id,
      name: item?.author?.name || item?.creator_name || item?.created_by_name || item?.author_name,
      role: item?.author?.role || item?.primary_role || item?.creator_primary_role,
      institution: item?.author?.institution || item?.institution_name || item?.institution,
    },
    academicContext: {
      moduleId: item?.academicContext?.moduleId || item?.module_id,
      moduleCode: item?.academicContext?.moduleCode || item?.module_code,
      moduleTitle: item?.academicContext?.moduleTitle || item?.module_title,
      difficulty: item?.academicContext?.difficulty || item?.difficulty,
      chapter: item?.academicContext?.chapter || item?.chapter,
      examRelated: item?.academicContext?.examRelated || item?.exam_related,
    },
  };
};
