import { TAB_KEYS } from '@/features/catalog/config/catalogTabs';

export const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const extractData = (response) => response?.data ?? response;

export const extractList = (response) => {
  const data = extractData(response);
  return Array.isArray(data) ? data : [];
};

export const extractOne = (response) => {
  const data = extractData(response);
  return Array.isArray(data) ? data[0] || null : data || null;
};

export const getDialogDefaultValues = (type, item = null, presetValues = {}) => {
  const defaults = (() => {
    if (type === TAB_KEYS.INSTITUTION_TYPES || type === TAB_KEYS.DOMAINS) {
      return { name: item?.name || '' };
    }
    if (type === TAB_KEYS.PROGRAMS) {
      return { name: item?.name || '', domain_id: String(item?.domain_id || item?.domainId || '') };
    }
    if (type === TAB_KEYS.LEVELS) {
      return {
        name: item?.name || '',
        program_id: String(item?.program_id || item?.programId || ''),
        sort_order: String(item?.sort_order || item?.sortOrder || '1'),
      };
    }
    if (type === TAB_KEYS.SEMESTERS) {
      return {
        name: item?.name || '',
        level_id: String(item?.level_id || item?.levelId || ''),
        sort_order: String(item?.sort_order || item?.sortOrder || '1'),
      };
    }
    if (type === TAB_KEYS.MODULES) {
      return {
        code: item?.code || '',
        title: item?.title || '',
        description: item?.description || '',
        semester_id: String(item?.semester_id || item?.semesterId || ''),
      };
    }
    if (type === TAB_KEYS.INSTITUTIONS) {
      return {
        name: item?.name || '',
        institution_type_id: String(item?.institution_type_id || item?.institutionTypeId || ''),
        country: item?.country || '',
        city: item?.city || '',
      };
    }
    return {};
  })();

  return { ...defaults, ...presetValues };
};

export const sortByName = (items = []) =>
  [...items].sort((a, b) =>
    String(a?.name || a?.title || '').localeCompare(String(b?.name || b?.title || ''), undefined, { sensitivity: 'base' })
  );

export const sortByOrderThenName = (items = []) =>
  [...items].sort((a, b) => {
    const orderA = Number(a?.sort_order || a?.sortOrder || 0);
    const orderB = Number(b?.sort_order || b?.sortOrder || 0);
    if (orderA !== orderB) return orderA - orderB;
    return String(a?.name || '').localeCompare(String(b?.name || ''), undefined, { sensitivity: 'base' });
  });
