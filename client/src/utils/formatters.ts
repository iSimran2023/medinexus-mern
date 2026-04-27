export const formatApptNumber = (dateString: string | undefined, apptNumber: number) => {
  if (!dateString) return `#${apptNumber}`;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return `#${apptNumber}`;
  
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const xx = String(apptNumber).padStart(2, '0');
  
  return `APT-${yyyy}${mm}${dd}-${xx}`;
};
