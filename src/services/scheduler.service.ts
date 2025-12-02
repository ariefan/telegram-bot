import cron from 'node-cron';
import { ReminderService } from './reminder.service.js';

export class SchedulerService {
    private reminderService: ReminderService;
    private task: cron.ScheduledTask | null = null;

    constructor(reminderService: ReminderService) {
        this.reminderService = reminderService;
    }

    start() {
        console.log('Starting scheduler service...');

        // Schedule to run daily at 8:00 AM (Asia/Jakarta timezone)
        // Cron format: minute hour * * * (0 8 * * * = 8:00 AM every day)
        this.task = cron.schedule(
            '0 8 * * *',
            async () => {
                console.log(`\n[${new Date().toISOString()}] Running scheduled reminder check...`);
                try {
                    await this.reminderService.processReminders();
                } catch (error) {
                    console.error('[SchedulerService] Error running scheduled task:', error);
                }
            },
            {
                timezone: 'Asia/Jakarta',
            }
        );

        this.task.start();

        console.log('✅ Scheduler started - will run daily at 8:00 AM (Asia/Jakarta)');

        // Optional: Run immediately on startup for testing
        if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Running reminder check immediately...');
            this.reminderService.processReminders().catch((error) => {
                console.error('[SchedulerService] Error in initial run:', error);
            });
        }
    }

    stop() {
        if (this.task) {
            this.task.stop();
            console.log('Scheduler service stopped');
        }
    }

    // Manual trigger for testing
    async triggerNow() {
        console.log('Manually triggering reminder check...');
        await this.reminderService.processReminders();
    }
}
