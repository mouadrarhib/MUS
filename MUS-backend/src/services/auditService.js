import { sequelize } from "../models/index.js";

export const logAudit = async ({
  userId = null,
  action,
  resourceType = null,
  resourceId = null,
  oldValue = null,
  newValue = null,
  ip = null,
  userAgent = null,
}) => {
  if (!action) return;

  try {
    await sequelize.query(
      `
      INSERT INTO public.audit_logs
        (user_id, action, resource_type, resource_id, old_value, new_value, ip, user_agent)
      VALUES
        (:user_id, :action, :resource_type, :resource_id, :old_value::jsonb, :new_value::jsonb, :ip, :user_agent)
      `,
      {
        replacements: {
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          old_value: oldValue ? JSON.stringify(oldValue) : null,
          new_value: newValue ? JSON.stringify(newValue) : null,
          ip,
          user_agent: userAgent,
        },
      }
    );
  } catch (_error) {
    // Best effort logging
  }
};
