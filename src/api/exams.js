import axiosInstance from './axiosInstance';

// ── Instructor: construir examen ─────────────────────────────
export const createExamApi = async (courseId, { passingScore, timeLimitMinutes }) => {
  const res = await axiosInstance.post(`/api/courses/${courseId}/exam`, {
    passingScore,
    ...(timeLimitMinutes ? { timeLimitMinutes } : {}),
  });
  return res.data.data;
};

export const createQuestionApi = async (examId, { text, orderIndex }) => {
  const res = await axiosInstance.post(`/api/exams/${examId}/questions`, {
    text,
    ...(orderIndex != null ? { orderIndex } : {}),
  });
  return res.data.data;
};

export const createOptionApi = async (questionId, { text, isCorrect }) => {
  const res = await axiosInstance.post(`/api/questions/${questionId}/options`, {
    text,
    isCorrect,
  });
  return res.data.data;
};

// ── Estudiante: tomar examen ─────────────────────────────────
export const getExamApi = async (courseId) => {
  const res = await axiosInstance.get(`/api/courses/${courseId}/exam`);
  return res.data.data;
};

// answers = [{ questionId, optionId }]
export const submitExamApi = async (courseId, answers) => {
  const res = await axiosInstance.post(`/api/courses/${courseId}/exam/submit`, { answers });
  return res.data.data;
};
