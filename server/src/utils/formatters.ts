export const formatApptNumber = (date: Date | string | undefined, apptNumber: number) => {
  if (!date) return `#${apptNumber}`;
  const d = new Date(date);
  if (isNaN(d.getTime())) return `#${apptNumber}`;
  
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const xx = String(apptNumber).padStart(2, '0');
  
  return `APT-${yyyy}${mm}${dd}-${xx}`;
};
