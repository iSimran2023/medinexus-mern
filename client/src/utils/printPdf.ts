export const printAppointmentPdf = (appointment: any) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert("Please allow popups for this site to generate PDF");
    return;
  }

  const parseHistoryString = (text: string) => {
    if (!text) return {};
    const labels = ['Reason:', 'Diseases:', 'Allergies:', 'Meds:', 'Emergency:', 'Notes:', 'Type:'];
    const result: Record<string, string> = {};
    for (let i = 0; i < labels.length; i++) {
      const currentLabel = labels[i];
      const currentIndex = text.lastIndexOf(currentLabel);
      if (currentIndex === -1) {
        result[currentLabel] = '';
        continue;
      }
      const start = currentIndex + currentLabel.length;
      let end = text.length;
      for (let j = 0; j < labels.length; j++) {
        if (j === i) continue;
        const nextLabelIndex = text.indexOf(labels[j], start);
        if (nextLabelIndex !== -1) {
          if (end === text.length || nextLabelIndex < end) {
            end = nextLabelIndex;
          }
        }
      }
      result[currentLabel] = text.substring(start, end).replace(/\\n/g, '\n').trim();
    }
    return result;
  };

  const parsedHistory = parseHistoryString(appointment.history || '');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Appointment Confirmation #${appointment.appointmentNumber}</title>
      <style>
        @page { margin: 0; size: auto; }
        body { font-family: 'Inter', -apple-system, sans-serif; padding: 20px 40px; margin: 0; color: #333; font-size: 13px; }
        .header { text-align: center; border-bottom: 2px solid #1969AA; padding-bottom: 10px; margin-bottom: 15px; }
        .logo { font-size: 24px; font-weight: 700; color: #1969AA; margin-bottom: 5px; }
        .title { font-size: 16px; color: #555; }
        .content { display: flex; flex-direction: column; gap: 8px; }
        .row { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 6px; }
        .label { font-weight: 600; color: #666; width: 30%; }
        .value { font-weight: 500; width: 70%; white-space: pre-wrap; }
        .priority-badge { 
          display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;
        }
        .priority-Routine { background: #f1f5f9; color: #64748b; }
        .priority-Emergency { background: #fee2e2; color: #ef4444; }
        .section-title { font-size: 16px; color: #1969AA; margin-top: 15px; margin-bottom: 8px; font-weight: 700; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">MediNexus</div>
        <div class="title">Official Appointment Record</div>
      </div>
      
      <div class="content">
        <div class="row">
          <div class="label">Appointment Number</div>
          <div class="value" style="font-size: 18px; color: #1969AA; font-weight: bold;">#${appointment.appointmentNumber}</div>
        </div>
        <div class="row">
          <div class="label">Patient Name</div>
          <div class="value">${appointment.patientName || 'N/A'}</div>
        </div>
        <div class="row">
          <div class="label">Date of Birth</div>
          <div class="value">${appointment.dob ? new Date(appointment.dob).toLocaleDateString() : 'N/A'}</div>
        </div>
        <div class="row">
          <div class="label">Gender</div>
          <div class="value">${appointment.gender || 'N/A'}</div>
        </div>
        <div class="row">
          <div class="label">Phone / Telephone</div>
          <div class="value">${appointment.patientPhone || 'N/A'}</div>
        </div>
        <div class="row">
          <div class="label">Address</div>
          <div class="value">${appointment.address || 'N/A'}</div>
        </div>
        <div class="row">
          <div class="label">Doctor Name</div>
          <div class="value">Dr. ${appointment.doctorName || 'N/A'}</div>
        </div>
        <div class="row">
          <div class="label">Session Title</div>
          <div class="value">${appointment.scheduleTitle || 'N/A'}</div>
        </div>
        <div class="row">
          <div class="label">Date & Time</div>
          <div class="value">${appointment.scheduleDate ? new Date(appointment.scheduleDate).toLocaleDateString() : 'N/A'} @ ${appointment.scheduleTime || 'N/A'}</div>
        </div>
        <div class="row">
          <div class="label">Priority</div>
          <div class="value" style="display: flex; align-items: center;"><span class="priority-badge priority-${appointment.priority || 'Routine'}">${appointment.priority || 'Routine'}</span></div>
        </div>
        <div class="row">
          <div class="label">Appointment Status</div>
          <div class="value" style="font-weight: bold; color: ${appointment.status === 'Reviewed' ? '#10b981' : (appointment.status === 'Rescheduled' ? '#d97706' : '#f59e0b')};">${appointment.status || 'Pending'}</div>
        </div>
        
        <div class="section-title">Medical Information</div>
        ${appointment.symptoms ? `
        <div class="row">
          <div class="label">Symptoms</div>
          <div class="value">${appointment.symptoms}</div>
        </div>` : ''}
        
        ${Object.entries({
          'Reason for Visit': parsedHistory['Reason:'],
          'Appointment Type': parsedHistory['Type:'],
          'Existing Diseases': parsedHistory['Diseases:'],
          'Allergies': parsedHistory['Allergies:'],
          'Current Medications': parsedHistory['Meds:'],
          'Emergency Contact': parsedHistory['Emergency:'],
          'Previous History': parsedHistory['Notes:']
        }).map(([label, val]) => val ? `
        <div class="row">
          <div class="label">${label}</div>
          <div class="value">${val}</div>
        </div>` : '').join('')}

        ${appointment.document ? `
        <div class="row">
          <div class="label">Attached File</div>
          <div class="value"><a href="http://localhost:5001/uploads/${appointment.document}" target="_blank" style="color: #1969AA;">${appointment.document}</a></div>
        </div>
        ` : ''}

        ${appointment.status === 'Reviewed' && appointment.prescription ? `
        <div class="section-title" style="color: #1969AA;">Prescription & Notes</div>
        <div class="row">
          <div class="label">Diagnosis</div>
          <div class="value">${appointment.prescription.diagnosis || 'N/A'}</div>
        </div>
        <div class="row">
          <div class="label">Medications</div>
          <div class="value">${appointment.prescription.medications?.join(', ') || 'N/A'}</div>
        </div>
        <div class="row">
          <div class="label">Doctor's Notes</div>
          <div class="value">${appointment.prescription.notes || 'N/A'}</div>
        </div>
        ` : ''}

      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
