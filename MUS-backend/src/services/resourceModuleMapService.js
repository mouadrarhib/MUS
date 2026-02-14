import { sequelize } from "../models/index.js";
import AppError from "../helpers/appError.js";

/**
 * Associer une resource à un module
 */
export const addResourceToModule = async (
  resourceId,
  moduleId,
  chapter = null,
  difficulty = null,
  examRelated = false
) => {
  try {
    const [results] = await sequelize.query(
      `
      INSERT INTO public.resource_module_map (resource_id, module_id, chapter, difficulty, exam_related)
      VALUES (:resource_id, :module_id, :chapter, :difficulty, :exam_related)
      RETURNING resource_id, module_id, chapter, difficulty::text AS difficulty, exam_related, created_at
      `,
      {
        replacements: {
          resource_id: resourceId,
          module_id: moduleId,
          chapter,
          difficulty,
          exam_related: examRelated,
        },
      }
    );

    return results[0];
  } catch (error) {
    if (error.original?.code === "23503") {
      throw new AppError("Resource or module not found", 404);
    }
    if (error.original?.code === "23505") {
      throw new AppError("Resource is already associated with this module", 409);
    }
    throw error;
  }
};

/**
 * Retirer une resource d'un module
 */
export const removeResourceFromModule = async (resourceId, moduleId) => {
  const [results] = await sequelize.query(
    `
    DELETE FROM public.resource_module_map
    WHERE resource_id = :resource_id AND module_id = :module_id
    RETURNING resource_id
    `,
    {
      replacements: {
        resource_id: resourceId,
        module_id: moduleId,
      },
    }
  );

  if (!results.length) {
    throw new AppError("Association not found", 404);
  }

  return { message: "Resource removed from module successfully" };
};

/**
 * Récupérer tous les modules d'une resource
 */
export const getModulesByResource = async (resourceId) => {
  const [results] = await sequelize.query(
    `
    SELECT
      rmm.module_id,
      m.code AS module_code,
      m.title AS module_title,
      rmm.chapter,
      rmm.difficulty::text AS difficulty,
      rmm.exam_related,
      rmm.created_at
    FROM public.resource_module_map rmm
    INNER JOIN public.modules m ON m.id = rmm.module_id
    WHERE rmm.resource_id = :resource_id
    ORDER BY m.code, m.title
    `,
    {
      replacements: { resource_id: resourceId },
    }
  );

  return results;
};

/**
 * Récupérer toutes les resources d'un module
 */
export const getResourcesByModule = async (moduleId) => {
  const [results] = await sequelize.query(
    `
    SELECT
      rmm.resource_id,
      r.title AS resource_title,
      rmm.chapter,
      rmm.difficulty,
      rmm.exam_related,
      u.full_name AS creator_name
    FROM public.resource_module_map rmm
    INNER JOIN public.resources r ON rmm.resource_id = r.id
    INNER JOIN public.users u ON r.created_by = u.id
    WHERE rmm.module_id = :module_id
    ORDER BY rmm.chapter, r.title
    `,
    {
      replacements: { module_id: moduleId },
    }
  );
  
  return results;
};

export const getVisibleResourcesByModule = async (moduleId, actor = null) => {
  const isAdmin = (actor?.roles || []).includes("admin");
  if (isAdmin) {
    return getResourcesByModule(moduleId);
  }

  const [results] = await sequelize.query(
    `
    SELECT
      rmm.resource_id,
      r.title AS resource_title,
      rmm.chapter,
      rmm.difficulty,
      rmm.exam_related,
      u.full_name AS creator_name
    FROM public.resource_module_map rmm
    INNER JOIN public.resources r ON rmm.resource_id = r.id
    INNER JOIN public.users u ON r.created_by = u.id
    WHERE rmm.module_id = :module_id
      AND r.status = 'published'::resource_status
    ORDER BY rmm.chapter, r.title
    `,
    {
      replacements: { module_id: moduleId },
    }
  );

  return results;
};

/**
 * Mettre à jour les infos d'association
 */
export const updateResourceModuleMap = async (
  resourceId,
  moduleId,
  { chapter, difficulty, examRelated }
) => {
  const [results] = await sequelize.query(
    `
    UPDATE public.resource_module_map
    SET
      chapter = COALESCE(:chapter, chapter),
      difficulty = COALESCE(CAST(:difficulty AS difficulty_level), difficulty),
      exam_related = COALESCE(:exam_related, exam_related)
    WHERE resource_id = :resource_id
      AND module_id = :module_id
    RETURNING resource_id, module_id, chapter, difficulty::text AS difficulty, exam_related, created_at
    `,
    {
      replacements: {
        resource_id: resourceId,
        module_id: moduleId,
        chapter: chapter !== undefined ? chapter : null,
        difficulty: difficulty !== undefined ? difficulty : null,
        exam_related: examRelated !== undefined ? examRelated : null,
      },
    }
  );

  if (results.length === 0) {
    throw new AppError("Association not found", 404);
  }

  return results[0];
};

/**
 * Récupérer les modules disponibles pour un student
 */
export const getAvailableModulesForStudent = async (userId) => {
  const [results] = await sequelize.query(
    `
    SELECT m.id, m.code, m.title, m.description, m.semester_id
    FROM public.student_profiles sp
    INNER JOIN public.modules m ON m.semester_id = sp.current_semester_id
    WHERE sp.user_id = :user_id
    ORDER BY m.code, m.title
    `,
    {
      replacements: { user_id: userId },
    }
  );

  return results;
};

/**
 * Vérifier si une association existe
 */
export const resourceModuleMapExists = async (resourceId, moduleId) => {
  const [results] = await sequelize.query(
    `
    SELECT EXISTS(
      SELECT 1
      FROM public.resource_module_map
      WHERE resource_id = :resource_id AND module_id = :module_id
    ) AS exists
    `,
    {
      replacements: { resource_id: resourceId, module_id: moduleId },
    }
  );

  return Boolean(results[0]?.exists);
};

/**
 * Supprimer toutes les associations d'une resource
 */
export const removeAllModulesFromResource = async (resourceId) => {
  const [results] = await sequelize.query(
    `
    DELETE FROM public.resource_module_map
    WHERE resource_id = :resource_id
    RETURNING resource_id
    `,
    {
      replacements: { resource_id: resourceId },
    }
  );

  const deletedCount = results.length;

  return {
    message: `${deletedCount} association(s) removed successfully`,
    deleted_count: deletedCount,
  };
};
