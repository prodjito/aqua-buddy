const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Cloud Function to schedule and send push notifications
 * This runs on Firebase's servers and can send notifications even when the app is closed
 */

/**
 * HTTP endpoint to schedule a notification
 * Call this from your app to schedule future notifications
 *
 * POST /scheduleNotification
 * Body: {
 *   token: "user's FCM token",
 *   message: "notification message",
 *   delayMinutes: 60,
 *   title: "optional title"
 * }
 */
exports.scheduleNotification = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { token, message, delayMinutes = 60, title = 'Aqua Buddy 💧' } = req.body;

    if (!token || !message) {
      res.status(400).send('Missing required fields: token and message');
      return;
    }

    // Store notification data in Firestore to be sent later
    const scheduledTime = Date.now() + (delayMinutes * 60 * 1000);

    await admin.firestore().collection('scheduled_notifications').add({
      token: token,
      title: title,
      message: message,
      scheduledTime: scheduledTime,
      sent: false,
      createdAt: Date.now()
    });

    res.status(200).json({
      success: true,
      message: 'Notification scheduled successfully',
      scheduledTime: new Date(scheduledTime).toISOString()
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Scheduled function that runs every minute to check and send pending notifications
 * This is what actually delivers the notifications at the scheduled time
 */
exports.sendScheduledNotifications = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const now = Date.now();

    try {
      // Query for notifications that are due and not yet sent
      const snapshot = await admin.firestore()
        .collection('scheduled_notifications')
        .where('sent', '==', false)
        .where('scheduledTime', '<=', now)
        .limit(100)
        .get();

      if (snapshot.empty) {
        console.log('No notifications to send');
        return null;
      }

      const notifications = [];
      const batch = admin.firestore().batch();

      snapshot.forEach((doc) => {
        const data = doc.data();

        // Prepare FCM message
        const message = {
          notification: {
            title: data.title,
            body: data.message,
            icon: '/icon-192.png'
          },
          data: {
            click_action: '/',
            timestamp: String(Date.now())
          },
          token: data.token,
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              clickAction: '/'
            }
          },
          webpush: {
            fcmOptions: {
              link: '/'
            },
            notification: {
              icon: '/icon-192.png',
              badge: '/icon-192.png',
              vibrate: [200, 100, 200],
              requireInteraction: false
            }
          }
        };

        notifications.push(message);

        // Mark as sent in batch
        batch.update(doc.ref, { sent: true, sentAt: now });
      });

      // Send all notifications
      const results = await Promise.allSettled(
        notifications.map(msg => admin.messaging().send(msg))
      );

      // Commit batch update
      await batch.commit();

      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;

      console.log(`Sent ${successCount} notifications, ${failCount} failed`);

      // Log failures for debugging
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Failed to send notification ${index}:`, result.reason);
        }
      });

      return null;
    } catch (error) {
      console.error('Error sending scheduled notifications:', error);
      return null;
    }
  });

/**
 * HTTP endpoint to send immediate notification
 * Useful for testing or urgent notifications
 *
 * POST /sendNotification
 * Body: {
 *   token: "user's FCM token",
 *   title: "notification title",
 *   message: "notification message"
 * }
 */
exports.sendNotification = functions.https.onRequest(async (req, res) => {
  // Set CORS headers
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { token, title = 'Aqua Buddy 💧', message } = req.body;

    if (!token || !message) {
      res.status(400).send('Missing required fields: token and message');
      return;
    }

    const payload = {
      notification: {
        title: title,
        body: message,
        icon: '/icon-192.png'
      },
      data: {
        click_action: '/',
        timestamp: String(Date.now())
      },
      token: token,
      webpush: {
        fcmOptions: {
          link: '/'
        },
        notification: {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          vibrate: [200, 100, 200]
        }
      }
    };

    const response = await admin.messaging().send(payload);

    res.status(200).json({
      success: true,
      messageId: response
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Cleanup old sent notifications (runs daily)
 * Keeps Firestore clean by removing old notification records
 */
exports.cleanupOldNotifications = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    try {
      const snapshot = await admin.firestore()
        .collection('scheduled_notifications')
        .where('sent', '==', true)
        .where('sentAt', '<', oneWeekAgo)
        .limit(500)
        .get();

      if (snapshot.empty) {
        console.log('No old notifications to clean up');
        return null;
      }

      const batch = admin.firestore().batch();
      snapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Cleaned up ${snapshot.size} old notifications`);

      return null;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      return null;
    }
  });
