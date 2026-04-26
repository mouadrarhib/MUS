const parseMetadata = (metadata) => {
  if (!metadata) return {};
  if (typeof metadata === 'object') return metadata;
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
};

export const toResourceDetailModel = (
  item,
  { defaultStatus = 'published', defaultAccessTier = 'free' } = {}
) => {
  if (!item) return null;

  const accessTier = item?.access_tier || item?.accessTier || defaultAccessTier;
  const metadata = parseMetadata(item?.metadata);
  const metadataAcademicContext = metadata?.academicContext && typeof metadata.academicContext === 'object'
    ? metadata.academicContext
    : {};

  return {
    ...item,
    metadata,
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
      institutionId: String(item?.academicContext?.institutionId || metadataAcademicContext.institutionId || ''),
      programId: String(item?.academicContext?.programId || metadataAcademicContext.programId || ''),
      levelId: String(item?.academicContext?.levelId || metadataAcademicContext.levelId || ''),
      semesterId: String(item?.academicContext?.semesterId || metadataAcademicContext.semesterId || ''),
      moduleId: String(item?.academicContext?.moduleId || metadataAcademicContext.moduleId || item?.module_id || ''),
      moduleCode: item?.academicContext?.moduleCode || metadataAcademicContext.moduleCode || item?.module_code || '',
      moduleTitle: item?.academicContext?.moduleTitle || metadataAcademicContext.moduleTitle || item?.module_title || '',
      difficulty: item?.academicContext?.difficulty || metadataAcademicContext.difficulty || item?.difficulty || 'medium',
      chapter: item?.academicContext?.chapter || metadataAcademicContext.chapter || item?.chapter || '',
      examRelated: Boolean(item?.academicContext?.examRelated ?? metadataAcademicContext.isExamRelated ?? metadataAcademicContext.examRelated ?? item?.exam_related),
    },
  };
};
