import usersData from '@/data/users.json';

// Helper to get users array from the new API structure
const getUsersArray = () => {
  return usersData?.data?.users || [];
};

export const usersService = {
  /**
   * Get all users
   */
  getAllUsers: async () => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getUsersArray());
      }, 500);
    });
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getUsersArray();
        const user = users.find(u => u.user_id === userId);
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
        const users = getUsersArray();
        const userIndex = users.findIndex(u => u.user_id === userId);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updatedData };
          resolve(users[userIndex]);
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
        const users = getUsersArray();
        const userIndex = users.findIndex(u => u.user_id === userId);
        if (userIndex !== -1) {
          const deletedUser = users.splice(userIndex, 1);
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
        const users = getUsersArray();
        const newUser = {
          user_id: `u_${Date.now()}`,
          ...userData,
          user_created_at: new Date().toISOString()
        };
        users.push(newUser);
        resolve(newUser);
      }, 300);
    });
  },

  /**
   * Toggle user status
   */
  toggleUserStatus: async (userId, isActive) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getUsersArray();
        const userIndex = users.findIndex(u => u.user_id === userId);
        if (userIndex !== -1) {
          users[userIndex].is_active = isActive;
          resolve(users[userIndex]);
        } else {
          resolve(null);
        }
      }, 300);
    });
  },

  /**
   * Get users count by role
   */
  getUserCountByRole: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getUsersArray();
        const counts = {
          admin: users.filter(u => u.roles?.includes('admin')).length,
          teacher: users.filter(u => u.roles?.includes('teacher')).length,
          student: users.filter(u => u.roles?.includes('student')).length,
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
        const users = getUsersArray();
        const counts = {
          active: users.filter(u => u.is_active).length,
          inactive: users.filter(u => !u.is_active).length,
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
        const users = getUsersArray();
        const results = users.filter(user =>
          user.full_name?.toLowerCase().includes(query.toLowerCase()) ||
          user.email?.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 300);
    });
  }
};

export default usersService;

