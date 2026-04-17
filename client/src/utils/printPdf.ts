export const printAppointmentPdf = (appointment: any) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert("Please allow popups for this site to generate PDF");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Appointment Confirmation #${appointment.appointmentNumber}</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #1969AA; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 700; color: #1969AA; margin-bottom: 5px; }
        .title { font-size: 20px; color: #555; }
        .content { display: flex; flex-direction: column; gap: 20px; }
        .row { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; }
        .label { font-weight: 600; color: #666; width: 30%; }
        .value { font-weight: 500; width: 70%; }
        .priority-badge { 
          display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;
        }
        .priority-Routine { background: #f1f5f9; color: #64748b; }
        .priority-Emergency { background: #fee2e2; color: #ef4444; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
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
          <div class="value" style="font-size: 24px; color: #1969AA;">#${appointment.appointmentNumber}</div>
        </div>
        <div class="row">
          <div class="label">Patient Name</div>
          <div class="value">${appointment.patientName || 'N/A'}</div>
        </div>
        <div class="row">
          <div class="label">Gender</div>
          <div class="value">${appointment.gender || 'N/A'}</div>
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
          <div class="value">
            <span class="priority-badge priority-${appointment.priority || 'Routine'}">${appointment.priority || 'Routine'}</span>
          </div>
        </div>
        <div class="row">
          <div class="label">Appointment Status</div>
          <div class="value" style="font-weight: bold; color: ${appointment.status === 'Reviewed' ? '#10b981' : '#f59e0b'};">${appointment.status || 'Pending'}</div>
        </div>
        ${appointment.symptoms || appointment.history ? `
        <div class="row">
          <div class="label">Symptoms</div>
          <div class="value">${appointment.symptoms || 'None reported'}</div>
        </div>
        <div class="row">
          <div class="label">History</div>
          <div class="value">${appointment.history || 'None reported'}</div>
        </div>
        ${appointment.document ? `
        <div class="row">
          <div class="label">Attached File</div>
          <div class="value">${appointment.document}</div>
        </div>
        ` : ''}
        ` : ''}
      </div>
      
      <div class="footer">
        <p>This is a computer generated document. Please bring this hard copy to the clinic.</p>
        <p>Printed on ${new Date().toLocaleString()}</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          // setTimeout(function() { window.close(); }, 500);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
