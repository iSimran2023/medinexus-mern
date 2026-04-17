export const flattenAppointment = (app: any) => {
  return {
    id: app._id || app.id,
    patientName: app.patient?.user?.name || 'Unknown',
    patientEmail: app.patient?.user?.email || null,
    patientPhone: app.patient?.tel || null,
    address: app.patient?.address || null,
    dob: app.patient?.dob || null,
    gender: app.patient?.gender || null,
    doctorName: app.schedule?.doctor?.user?.name || 'Unknown',
    doctorSpecialty: app.schedule?.doctor?.specialty || null,
    scheduleId: app.schedule?._id || app.schedule?.id || null,
    scheduleTitle: app.schedule?.title || 'Untitled Session',
    scheduleDate: app.schedule?.date || null,
    scheduleTime: app.schedule?.time || null,
    appointmentNumber: app.appointmentNumber,
    priority: app.priority || 'Routine',
    appointmentDate: app.appointmentDate || app.createdAt,
    symptoms: app.medicalData?.symptoms || null,
    history: app.medicalData?.history || null,
    document: app.medicalData?.documentName || null,
    status: app.status || 'Pending'
  };
};

export const flattenDoctor = (doc: any) => {
  return {
    id: doc._id || doc.id,
    name: doc.user?.name || 'Unknown',
    email: doc.user?.email || null,
    tel: doc.tel || null,
    specialty: doc.specialty || null,
    nic: doc.nic || null,
    gender: doc.gender || null
  };
};

export const flattenPatient = (pat: any) => {
  return {
    id: pat._id || pat.id,
    name: pat.user?.name || 'Unknown',
    email: pat.user?.email || null,
    tel: pat.tel || null,
    address: pat.address || null,
    dob: pat.dob || null,
    gender: pat.gender || null
  };
};

export const flattenSchedule = (sch: any) => {
  return {
    id: sch._id || sch.id,
    title: sch.title || 'Untitled Session',
    doctorName: sch.doctor?.user?.name || 'Unknown',
    doctorId: sch.doctor?._id || sch.doctor || null,
    doctorSpecialty: sch.doctor?.specialty || null,
    doctorTel: sch.doctor?.tel || null,
    date: sch.date || null,
    time: sch.time || null,
    maxAppointments: sch.maxAppointments || 0
  };
};
