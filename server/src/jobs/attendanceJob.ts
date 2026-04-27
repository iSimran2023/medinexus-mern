import cron from 'node-cron';
import Appointment from '../models/Appointment';

// Run every 5 minutes
// Extract logic to run immediately and on schedule
const runAttendanceUpdate = async () => {
  try {
      console.log('Running attendance cron job...');
      const now = new Date();

      // Find all pending appointments and populate schedule to handle legacy data
      const pendingAppointments = await Appointment.find({ status: 'Pending' }).populate('schedule');

      let updatedCount = 0;
      for (const app of pendingAppointments) {
        let appTime = app.appointmentTime;

        // Fallback for older appointments missing appointmentTime
        if (!appTime && app.schedule) {
          const schedule: any = app.schedule;
          if (schedule.date && schedule.time) {
            appTime = new Date(schedule.date);
            const [hours, minutes] = schedule.time.split(':');
            appTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          }
        }

        if (appTime && appTime < now) {
          app.status = 'Missed';
          await app.save();
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        console.log(`Successfully updated ${updatedCount} missed appointments.`);
      } else {
        console.log('No missed appointments found.');
      }
  } catch (err) {
    console.error('Error running attendance cron job:', err);
  }
};

// Run every 5 minutes and once on startup
export const startAttendanceCronJob = () => {
  runAttendanceUpdate(); // Run immediately on server start
  cron.schedule('*/5 * * * *', runAttendanceUpdate); // Then run every 5 minutes
};
