import axiosInstance from './axiosInstance';
import { MOCK_COURSES, MOCK_COURSE_DETAIL } from './mockData';

const USE_MOCK = true; // cambiar a false cuando el backend de P2 esté listo

// simula delay de red
const delay = (ms = 500) => new Promise(res => setTimeout(res, ms));

export const getCoursesApi = async ({ search = '', category = '', page = 0, size = 6 } = {}) => {
  if (USE_MOCK) {
    await delay();
    let results = [...MOCK_COURSES];

    if (search) {
      results = results.filter(c =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (category) {
      results = results.filter(c => c.category === category);
    }

    const start = page * size;
    return {
      content: results.slice(start, start + size),
      totalElements: results.length,
      totalPages: Math.ceil(results.length / size),
      number: page,
    };
  }

  // real — cuando nuestro backend esté listo
  const response = await axiosInstance.get('/courses', {
    params: { search, category, page, size },
  });
  return response.data.data;
};

export const getCourseDetailApi = async (courseId) => {
  if (USE_MOCK) {
    await delay();
    const course = MOCK_COURSE_DETAIL[courseId];
    if (!course) throw { response: { status: 404, data: { message: 'Curso no encontrado' } } };
    return course;
  }

  const response = await axiosInstance.get(`/courses/${courseId}`);
  return response.data.data;
};