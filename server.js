// require('dotenv').config();
// const admin = require('firebase-admin');
// const cron = require('node-cron');
// const webpush = require('web-push');
// const express = require('express');
// const app = express();

// app.use(express.json());

// // Set VAPID details for WebPush
// webpush.setVapidDetails(
//   `mailto:${process.env.VAPID_EMAIL}`,
//   process.env.VAPID_PUBLIC_KEY,
//   process.env.VAPID_PRIVATE_KEY
// );

// // Initialize Firebase Admin SDK
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// const db = admin.firestore();

// // Send push notification
// async function sendPushNotification(subscription, payload) {
//   try {
//     await webpush.sendNotification(JSON.parse(subscription), JSON.stringify(payload));
//     console.log(`Notification sent for task: ${payload.title}`);
//   } catch (error) {
//     console.error('Error sending notification:', error);
//   }
// }

// // Check and send notifications
// async function checkAndSendNotifications() {
//   const now = Date.now();
//   console.log('Checking for tasks to notify...');

//   try {
//     const tasksSnapshot = await db
//       .collection('tasks')
//       .where('alert', '==', true)
//       .where('notified', '==', false)
//       .get();

//     if (tasksSnapshot.empty) {
//       console.log('No tasks found that require notifications.');
//       return;
//     }

//     console.log(`Found ${tasksSnapshot.size} tasks that need notifications.`);

//     const notificationPromises = tasksSnapshot.docs.map(async (doc) => {
//       const task = doc.data();
//       const taskId = doc.id;
//       const taskTime = new Date(task.dueDate).getTime();
//       const alertMinutes = task.alertMinutes || 0;
//       const alertTime = taskTime - alertMinutes * 60 * 1000;

//       if (now >= alertTime && now < taskTime) {
//         console.log(`Task "${task.title}" is due for notification!`);

//         const payload = {
//           title: `Task Reminder: ${task.title}`,
//           body: `Your task "${task.title}" is due at ${new Date(taskTime).toLocaleString()}.`,
//           data: { taskId }
//         };

//         await sendPushNotification(task.subscription, payload);

//         // Handle recurrence
//         if (task.recurrence !== 'none') {
//           let nextDueDate;
//           if (task.recurrence === 'daily') {
//             nextDueDate = new Date(taskTime + 24 * 60 * 60 * 1000);
//           } else if (task.recurrence === 'weekly') {
//             nextDueDate = new Date(taskTime + 7 * 24 * 60 * 60 * 1000);
//           }
//           await db.collection('tasks').doc(taskId).update({
//             dueDate: nextDueDate.toISOString(),
//             notified: false
//           });
//         } else {
//           await db.collection('tasks').doc(taskId).update({ notified: true });
//         }
//       }
//     });

//     await Promise.all(notificationPromises);
//     console.log('All notifications processed!');
//   } catch (error) {
//     console.error('Error fetching tasks:', error);
//   }
// }


// app.post('/api/send-notification', async (req, res) => {
//   const { subscription, payload } = req.body;
//   try {
//     await sendPushNotification(subscription, payload);
//     res.status(200).send('Notification sent');
//   } catch (err) {
//     console.error('Push error:', err);
//     res.status(500).send('Failed to send push');
//   }
// });


// // Schedule checks every minute
// cron.schedule('* * * * *', () => {
//   checkAndSendNotifications();
// });

// // Initial run
// checkAndSendNotifications();

// app.listen(3000, () => {
//   console.log('Server running on port 3000');
// });


// require('dotenv').config();
// const express = require('express');
// const webpush = require('web-push');
// const cors = require('cors');
// const https = require('https');

// const app = express();

// app.use(cors({ origin: 'http://localhost:5173' }));
// app.use(express.json());

// // Custom HTTPS agent
// const agent = new https.Agent({
//   keepAlive: true,
//   timeout: 10000, // 10 seconds
// });


// console.log("keys",process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY)

// // Set VAPID details
// webpush.setVapidDetails(
//   `mailto:${process.env.VAPID_EMAIL}`,
//   process.env.VAPID_PUBLIC_KEY,
//   process.env.VAPID_PRIVATE_KEY
// );

// app.post('/api/notify', async (req, res) => {
//   const { subscription } = req.body;
//   console.log('Subscription endpoint:', subscription.endpoint); // Log endpoint
//   if (!subscription) {
//     return res.status(400).send('No subscription provided');
//   }

//   const payload = {
//     title: 'Test Notification',
//     body: 'This is a test push notification!',
//     data: { url: '/' },
//   };

//   try {
//     await webpush.sendNotification(subscription, JSON.stringify(payload), { agent });
//     res.status(200).send('Notification sent');
//   } catch (error) {
//     console.error('Error sending notification:', error);
//     res.status(500).send('Failed to send notification');
//   }
// });

// app.listen(3000, () => {
//   console.log('Server running on port 3000');
// });