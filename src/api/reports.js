import axiosInstance from './axiosInstance';

// Reporte de ingresos del instructor autenticado (total, mes actual, desglose por curso)
export const getInstructorRevenueReportApi = async () => {
  const res = await axiosInstance.get('/api/instructor/reports/revenue');
  return res.data.data;
};

// Reporte global de la plataforma (solo admin)
export const getAdminOverviewApi = async () => {
  const res = await axiosInstance.get('/api/admin/reports/overview');
  return res.data.data;
};
