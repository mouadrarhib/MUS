import { get, patch, post } from "@/services/http";

const QA = "/qa";

const asArray = (value) => (Array.isArray(value) ? value : []);

const qaService = {
  listQuestions: async (params = {}) => {
    const response = await get(`${QA}/questions`, { params });
    return asArray(response?.data);
  },

  getQuestionById: async (questionId, params = {}) => {
    const response = await get(`${QA}/questions/${questionId}`, { params });
    return response?.data || null;
  },

  createQuestion: async (payload) => {
    const response = await post(`${QA}/questions`, payload);
    return response?.data || null;
  },

  listAnswersByQuestion: async (questionId, params = {}) => {
    const response = await get(`${QA}/questions/${questionId}/answers`, { params });
    return asArray(response?.data);
  },

  createAnswer: async (questionId, payload) => {
    const response = await post(`${QA}/questions/${questionId}/answers`, payload);
    return response?.data || null;
  },

  acceptAnswer: async (answerId) => {
    const response = await patch(`${QA}/answers/${answerId}/accept`);
    return response?.data || null;
  },

  moderateQuestion: async (questionId, payload) => {
    const response = await patch(`${QA}/questions/${questionId}/moderate`, payload);
    return response?.data || null;
  },

  moderateAnswer: async (answerId, payload) => {
    const response = await patch(`${QA}/answers/${answerId}/moderate`, payload);
    return response?.data || null;
  },

  moderateComment: async (commentId, payload) => {
    const response = await patch(`${QA}/comments/${commentId}/moderate`, payload);
    return response?.data || null;
  },

  listQuestionComments: async (questionId, params = {}) => {
    const response = await get(`${QA}/questions/${questionId}/comments`, { params });
    return asArray(response?.data);
  },

  createQuestionComment: async (questionId, payload) => {
    const response = await post(`${QA}/questions/${questionId}/comments`, payload);
    return response?.data || null;
  },

  listAnswerComments: async (answerId, params = {}) => {
    const response = await get(`${QA}/answers/${answerId}/comments`, { params });
    return asArray(response?.data);
  },

  createAnswerComment: async (answerId, payload) => {
    const response = await post(`${QA}/answers/${answerId}/comments`, payload);
    return response?.data || null;
  },
};

export default qaService;
