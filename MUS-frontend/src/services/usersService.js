import usersData from '@/data/users.json';

export const usersService = {
  /**
   * Get all users
   */
  getAllUsers: async () => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(usersData);
      }, 500);
    });
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = usersData.find(u => u.id === userId);
        resolve(user || null);
      }, 300);
    });
  },

  /**
   * Update user
   */
  updateUser: async (userId, updatedData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userIndex = usersData.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          usersData[userIndex] = { ...usersData[userIndex], ...updatedData };
          resolve(usersData[userIndex]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  /**
   * Delete user
   */
  deleteUser: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userIndex = usersData.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          const deletedUser = usersData.splice(userIndex, 1);
          resolve(deletedUser[0]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  /**
   * Create new user
   */
  createUser: async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          id: `u_${Date.now()}`,
          ...userData,
          createdAt: new Date().toISOString()
        };
        usersData.push(newUser);
        resolve(newUser);
      }, 300);
    });
  },

  /**
   * Get users count by role
   */
  getUserCountByRole: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const counts = {
          admin: usersData.filter(u => u.userRoles?.includes('admin')).length,
          teacher: usersData.filter(u => u.userRoles?.includes('teacher')).length,
          student: usersData.filter(u => u.userRoles?.includes('student')).length,
        };
        resolve(counts);
      }, 300);
    });
  },

  /**
   * Get active/inactive users count
   */
  getUserCountByStatus: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const counts = {
          active: usersData.filter(u => u.isActive).length,
          inactive: usersData.filter(u => !u.isActive).length,
        };
        resolve(counts);
      }, 300);
    });
  },

  /**
   * Search users
   */
  searchUsers: async (query) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = usersData.filter(user =>
          user.fullName?.toLowerCase().includes(query.toLowerCase()) ||
          user.email?.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 300);
    });
  }
};

export default usersService;
