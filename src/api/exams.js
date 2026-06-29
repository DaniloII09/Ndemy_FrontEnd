import axiosInstance from './axiosInstance';

// ── Instructor: construir examen ─────────────────────────────
export const createExamApi = async (courseId, { passingScore, timeLimitMinutes }) => {
  const res = await axiosInstance.post(`/api/courses/${courseId}/exam`, {
    passingScore,
    ...(timeLimitMinutes ? { timeLimitMinutes } : {}),
  });
  return res.data.data;
};

// Editar examen existente (passingScore / timeLimitMinutes)
export const updateExamApi = async (courseId, { passingScore, timeLimitMinutes }) => {
  const res = await axiosInstance.put(`/api/courses/${courseId}/exam`, {
    passingScore,
    ...(timeLimitMinutes ? { timeLimitMinutes } : {}),
  });
  return res.data.data;
};

// Eliminar examen (instructor dueño o admin)
export const deleteExamApi = async (courseId) => {
  const res = await axiosInstance.delete(`/api/courses/${courseId}/exam`);
  return res.data;
};

export const createQuestionApi = async (examId, { text, orderIndex }) => {
  const res = await axiosInstance.post(`/api/exams/${examId}/questions`, {
    text,
    ...(orderIndex != null ? { orderIndex } : {}),
  });
  return res.data.data;
};

export const updateQuestionApi = async (questionId, { text, orderIndex }) => {
  const res = await axiosInstance.put(`/api/questions/${questionId}`, {
    text,
    ...(orderIndex != null ? { orderIndex } : {}),
  });
  return res.data.data;
};

export const deleteQuestionApi = async (questionId) => {
  const res = await axiosInstance.delete(`/api/questions/${questionId}`);
  return res.data;
};

export const createOptionApi = async (questionId, { text, isCorrect }) => {
  const res = await axiosInstance.post(`/api/questions/${questionId}/options`, {
    text,
    isCorrect,
  });
  return res.data.data;
};

export const updateOptionApi = async (optionId, { text, isCorrect }) => {
  const res = await axiosInstance.put(`/api/options/${optionId}`, {
    text,
    isCorrect,
  });
  return res.data.data;
};

export const deleteOptionApi = async (optionId) => {
  const res = await axiosInstance.delete(`/api/options/${optionId}`);
  return res.data;
};

// ── Estudiante / Instructor: ver examen ──────────────────────
// El backend devuelve respuestas correctas solo a instructor dueño y admin.
export const getExamApi = async (courseId) => {
  const res = await axiosInstance.get(`/api/courses/${courseId}/exam`);
  return res.data.data;
};

// answers = [{ questionId, optionId }]
export const submitExamApi = async (courseId, answers) => {
  const res = await axiosInstance.post(`/api/courses/${courseId}/exam/submit`, { answers });
  return res.data.data;
};