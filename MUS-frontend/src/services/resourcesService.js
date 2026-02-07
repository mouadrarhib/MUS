import resourcesData from '@/data/resources.json';

export const resourcesService = {
    /**
     * Get all resources
     */
    getAllResources: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(resourcesData);
            }, 500);
        });
    },

    /**
     * Get resource by ID
     */
    getResourceById: async (resourceId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const resource = resourcesData.find(r => r.id === resourceId);
                resolve(resource || null);
            }, 300);
        });
    },

    /**
     * Update resource
     */
    updateResource: async (resourceId, updatedData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const resourceIndex = resourcesData.findIndex(r => r.id === resourceId);
                if (resourceIndex !== -1) {
                    resourcesData[resourceIndex] = { ...resourcesData[resourceIndex], ...updatedData };
                    resolve(resourcesData[resourceIndex]);
                } else {
                    resolve(null);
                }
            }, 300);
        });
    },

    /**
     * Delete resource
     */
    deleteResource: async (resourceId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const resourceIndex = resourcesData.findIndex(r => r.id === resourceId);
                if (resourceIndex !== -1) {
                    const deletedResource = resourcesData.splice(resourceIndex, 1);
                    resolve(deletedResource[0]);
                } else {
                    resolve(null);
                }
            }, 300);
        });
    },

    /**
     * Create new resource
     */
    createResource: async (resourceData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newResource = {
                    id: `res_${Date.now()}`,
                    ...resourceData,
                    createdAt: new Date().toISOString(),
                    stats: {
                        totalFavorites: 0,
                        totalRatings: 0,
                        avgRating: 0,
                        downloads: 0
                    }
                };
                resourcesData.push(newResource);
                resolve(newResource);
            }, 300);
        });
    },

    /**
     * Get resources count by status
     */
    getResourceCountByStatus: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const counts = {
                    published: resourcesData.filter(r => r.status === 'published').length,
                    draft: resourcesData.filter(r => r.status === 'draft').length,
                    archived: resourcesData.filter(r => r.status === 'archived').length,
                };
                resolve(counts);
            }, 300);
        });
    },

    /**
     * Get resources count by type
     */
    getResourceCountByType: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const counts = {
                    exam: resourcesData.filter(r => r.educationalType === 'exam').length,
                    course: resourcesData.filter(r => r.educationalType === 'course').length,
                    notes: resourcesData.filter(r => r.educationalType === 'notes').length,
                };
                resolve(counts);
            }, 300);
        });
    },

    /**
     * Search resources
     */
    searchResources: async (query) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const results = resourcesData.filter(resource =>
                    resource.title?.toLowerCase().includes(query.toLowerCase()) ||
                    resource.description?.toLowerCase().includes(query.toLowerCase()) ||
                    resource.academicContext?.moduleTitle?.toLowerCase().includes(query.toLowerCase())
                );
                resolve(results);
            }, 300);
        });
    }
};

export default resourcesService;
