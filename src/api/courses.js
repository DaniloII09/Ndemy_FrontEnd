import axiosInstance from './axiosInstance';

export const getCoursesApi = async ({ search = '', category = '', page = 0, size = 6 } = {}) => {
  const response = await axiosInstance.get('/api/courses', {
    params: { search: search || undefined, category: category || undefined, page, size },
  });
  return response.data.data;
};

export const getCourseDetailApi = async (courseId) => {
  const response = await axiosInstance.get(`/api/courses/${courseId}`);
  // El backend devuelve GeneralResponse { data: CourseDetailResponse }
  return response.data.data;
};

export const checkoutApi = async (courseId, couponCode = null) => {
  const response = await axiosInstance.post('/api/payment/checkout', {
    courseId,
    ...(couponCode ? { couponCode } : {}),
  });
  return response.data.data;
};