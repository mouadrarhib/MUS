import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";

const toArray = (value) => (Array.isArray(value) ? value : []);
const toPgTextArrayLiteral = (items = []) => {
  const escaped = toArray(items).map((item) =>
    `"${String(item ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
  );
  return `{${escaped.join(",")}}`;
};

export const getPublicTutorProfileByUserId = async (userId) => {
  const [rows] = await sequelize.query(SQL.TUTOR_PROFILE.GET_PUBLIC_BY_USER_ID, {
    replacements: { user_id: userId },
  });
  return rows?.[0] || null;
};

export const getMyTutorProfile = async (userId) => {
  const [rows] = await sequelize.query(SQL.TUTOR_PROFILE.GET_MY_PROFILE, {
    replacements: { user_id: userId },
  });
  return rows?.[0] || null;
};

export const upsertMyTutorProfile = async ({
  userId,
  headline,
  bio,
  years_experience,
  hourly_rate,
  currency,
  response_time_minutes,
  visibility_status,
}) => {
  const [rows] = await sequelize.query(SQL.TUTOR_PROFILE.UPSERT, {
    replacements: {
      user_id: userId,
      headline: headline ?? null,
      bio: bio ?? null,
      years_experience: years_experience ?? null,
      hourly_rate: hourly_rate ?? null,
      currency: currency ?? null,
      response_time_minutes: response_time_minutes ?? null,
      visibility_status: visibility_status ?? null,
    },
  });
  return rows?.[0] || null;
};

export const setMyTutorProfileVisibility = async ({ userId, visibilityStatus }) => {
  const [rows] = await sequelize.query(SQL.TUTOR_PROFILE.SET_VISIBILITY, {
    replacements: {
      user_id: userId,
      visibility_status: visibilityStatus,
    },
  });
  return rows?.[0] || null;
};

export const replaceMyTutorProfileSkills = async ({ userId, skills }) => {
  const [rows] = await sequelize.query(SQL.TUTOR_PROFILE.REPLACE_SKILLS, {
    replacements: {
      user_id: userId,
      skills: toPgTextArrayLiteral(skills),
    },
  });
  return rows || [];
};

export const replaceMyTutorProfileEducation = async ({ userId, education }) => {
  const [rows] = await sequelize.query(SQL.TUTOR_PROFILE.REPLACE_EDUCATION, {
    replacements: {
      user_id: userId,
      education: JSON.stringify(toArray(education)),
    },
  });
  return rows || [];
};
