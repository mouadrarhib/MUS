import { get, patch, put } from "@/services/http";

const TUTOR_PROFILE = {
  BASE: "/tutor-profiles",
};

const toNumberOrNull = (value) => {
  if (value === null || typeof value === "undefined" || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const normalizeSkills = (skills) =>
  toArray(skills)
    .map((entry, index) => {
      if (typeof entry === "string") {
        const skillName = entry.trim();
        return skillName ? { id: null, skill_name: skillName, sort_order: index + 1 } : null;
      }

      if (!entry || typeof entry !== "object") return null;
      const skillName = String(entry.skill_name || entry.name || "").trim();
      if (!skillName) return null;
      return {
        id: Number(entry.id || 0) || null,
        skill_name: skillName,
        sort_order: Number(entry.sort_order || index + 1) || index + 1,
      };
    })
    .filter(Boolean);

const normalizeEducation = (education) =>
  toArray(education)
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const degree = String(entry.degree || "").trim();
      const institution = String(entry.institution || "").trim();
      if (!degree || !institution) return null;

      return {
        id: Number(entry.id || 0) || null,
        degree,
        institution,
        start_year: toNumberOrNull(entry.start_year),
        end_year: toNumberOrNull(entry.end_year),
        description: String(entry.description || "").trim() || null,
        sort_order: Number(entry.sort_order || index + 1) || index + 1,
      };
    })
    .filter(Boolean);

const normalizeProfile = (profile) => {
  if (!profile || typeof profile !== "object") return null;

  return {
    ...profile,
    years_experience: toNumberOrNull(profile.years_experience),
    hourly_rate: toNumberOrNull(profile.hourly_rate),
    response_time_minutes: toNumberOrNull(profile.response_time_minutes),
    rating_avg: toNumberOrNull(profile.rating_avg),
    rating_count: toNumberOrNull(profile.rating_count) || 0,
    published_resources_count: toNumberOrNull(profile.published_resources_count) || 0,
    sessions_taught_count: toNumberOrNull(profile.sessions_taught_count) || 0,
    students_taught_count: toNumberOrNull(profile.students_taught_count) || 0,
    roles: toArray(profile.roles).map((role) => String(role || "").trim()).filter(Boolean),
    skills: normalizeSkills(profile.skills),
    education: normalizeEducation(profile.education),
  };
};

const normalizePayload = (response) => normalizeProfile(response?.data || null);

export const tutorProfileService = {
  getPublicTutorProfile: async (userId) => {
    const response = await get(`${TUTOR_PROFILE.BASE}/${userId}/public`);
    return normalizePayload(response);
  },

  getMyTutorProfile: async () => {
    const response = await get(`${TUTOR_PROFILE.BASE}/me`);
    return normalizePayload(response);
  },

  upsertMyTutorProfile: async (payload = {}) => {
    const response = await put(`${TUTOR_PROFILE.BASE}/me`, payload);
    return normalizePayload(response);
  },

  setMyTutorProfileVisibility: async (visibility_status) => {
    const response = await patch(`${TUTOR_PROFILE.BASE}/me/visibility`, { visibility_status });
    return normalizePayload(response);
  },

  replaceMyTutorProfileSkills: async (skills = []) => {
    const response = await put(`${TUTOR_PROFILE.BASE}/me/skills`, {
      skills: normalizeSkills(skills).map((entry) => entry.skill_name),
    });
    return normalizeSkills(response?.data);
  },

  replaceMyTutorProfileEducation: async (education = []) => {
    const response = await put(`${TUTOR_PROFILE.BASE}/me/education`, {
      education: normalizeEducation(education).map((entry) => ({
        degree: entry.degree,
        institution: entry.institution,
        start_year: entry.start_year,
        end_year: entry.end_year,
        description: entry.description,
        sort_order: entry.sort_order,
      })),
    });
    return normalizeEducation(response?.data);
  },
};

export default tutorProfileService;
