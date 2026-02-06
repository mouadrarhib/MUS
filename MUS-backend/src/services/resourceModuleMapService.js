import { sequelize } from "../models/index.js";
import { SQL } from "../snippets/index.js";
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
    const [results] = await sequelize.query(SQL.RESOURCE_MODULE_MAP.ADD, {
      replacements: {
        resource_id: resourceId,
        module_id: moduleId,
        chapter,
        difficulty,
        exam_related: examRelated,
      },
    });
    
    return results[0];
  } catch (error) {
    if (error.message.includes("not found")) {
      throw new AppError(error.message, 404);
    }
    if (error.message.includes("already associated")) {
      throw new AppError("Resource is already associated with this module", 409);
    }
    throw error;
  }
};

/**
 * Retirer une resource d'un module
 */
export const removeResourceFromModule = async (resourceId, moduleId) => {
  try {
    await sequelize.query(SQL.RESOURCE_MODULE_MAP.REMOVE, {
      replacements: { resource_id: resourceId, module_id: moduleId },
    });
    
    return { message: "Resource removed from module successfully" };
  } catch (error) {
    if (error.message.includes("not found")) {
      throw new AppError("Association not found", 404);
    }
    throw error;
  }
};

/**
 * Récupérer tous les modules d'une resource
 */
export const getModulesByResource = async (resourceId) => {
  const [results] = await sequelize.query(SQL.RESOURCE_MODULE_MAP.GET_BY_RESOURCE, {
    replacements: { resource_id: resourceId },
  });
  
  return results;
};

/**
 * Récupérer toutes les resources d'un module
 */
export const getResourcesByModule = async (moduleId) => {
  const [results] = await sequelize.query(SQL.RESOURCE_MODULE_MAP.GET_BY_MODULE, {
    replacements: { module_id: moduleId },
  });
  
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
  try {
    const [results] = await sequelize.query(SQL.RESOURCE_MODULE_MAP.UPDATE, {
      replacements: {
        resource_id: resourceId,
        module_id: moduleId,
        chapter: chapter !== undefined ? chapter : null,
        difficulty: difficulty !== undefined ? difficulty : null,
        exam_related: examRelated !== undefined ? examRelated : null,
      },
    });
    
    if (results.length === 0) {
      throw new AppError("Association not found", 404);
    }
    
    return results[0];
  } catch (error) {
    if (error.message.includes("not found")) {
      throw new AppError("Association not found", 404);
    }
    throw error;
  }
};

/**
 * Récupérer les modules disponibles pour un student
 */
export const getAvailableModulesForStudent = async (userId) => {
  const [results] = await sequelize.query(SQL.RESOURCE_MODULE_MAP.GET_AVAILABLE_MODULES, {
    replacements: { user_id: userId },
  });
  
  return results;
};

/**
 * Vérifier si une association existe
 */
export const resourceModuleMapExists = async (resourceId, moduleId) => {
  const [results] = await sequelize.query(SQL.RESOURCE_MODULE_MAP.EXISTS, {
    replacements: { resource_id: resourceId, module_id: moduleId },
  });
  
  return results[0]?.sp_resource_module_map_exists || false;
};

/**
 * Supprimer toutes les associations d'une resource
 */
export const removeAllModulesFromResource = async (resourceId) => {
  const [results] = await sequelize.query(SQL.RESOURCE_MODULE_MAP.REMOVE_ALL_BY_RESOURCE, {
    replacements: { resource_id: resourceId },
  });
  
  const deletedCount = results[0]?.sp_resource_module_map_remove_all_by_resource || 0;
  
  return {
    message: `${deletedCount} association(s) removed successfully`,
    deleted_count: deletedCount,
  };
};
