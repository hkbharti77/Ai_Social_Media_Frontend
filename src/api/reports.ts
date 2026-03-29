import axiosInstance from './axios';

export const downloadMonthlyRoiReportApi = async (): Promise<void> => {
  const response = await axiosInstance.get('/reports/monthly-roi', {
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  const monthName = new Date().toLocaleString('default', { month: 'long' });
  link.setAttribute('download', `VaniAI_ROI_Report_${monthName}.pdf`);
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  link.remove();
  window.URL.revokeObjectURL(url);
};
