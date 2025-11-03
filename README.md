# 💧 Aqua Buddy - Hydration Gamification App

**Aqua Buddy** is a mobile-friendly web app designed to help people with dementia and Alzheimer's stay hydrated through gamification and gentle reminders. The app features a friendly animated character, progress tracking, adaptive notifications, and a reward system to make drinking water fun and engaging.

## 🌟 Features

### Core Functionality
- **Animated Aqua Buddy Character**: A friendly, floating water droplet companion with blinking eyes and a smile
- **One-Tap Water Logging**: Large, accessible button to log each glass of water
- **Undo Last Glass**: Made a mistake? Easily undo the last logged glass with confirmation
- **Reset Day Progress**: Reset today's progress completely with a safety confirmation
- **Visual Progress Tracking**: Water meter with animated droplets showing daily progress
- **Daily Goal Tracker**: Clear display of glasses remaining to reach the daily goal

### Adaptive Notification System
- **Smart Reminders**: Frequency adjusts automatically based on progress:
  - Less than 50% complete: More frequent reminders (base frequency)
  - 50-79% complete: Normal frequency (1.5x base)
  - 80% or more: Less frequent, gentle encouragement (3x base)
- **Customizable Frequency**: Set base reminder interval (30 min - 2 hours)
- **Positive Messaging**: Encouraging, friendly reminder messages
- **Notification History**: View recent reminders in settings

### Reward System
- **Badges**: Unlock achievements for milestones (first day, streaks, total glasses)
- **Stickers**: Earn collectible stickers for completing goals
- **Accessories**: Dress up Aqua Buddy with hats, sunglasses, and more
- **Streak Tracking**: Build consecutive day streaks for special rewards
- **Confetti Animations**: Celebrate goal completion with visual effects

### Progress Tracking
- **Calendar View**: Visual history of completed days
- **Weekly Summary**: Bar chart showing daily water intake for the week
- **Streak Display**: Track consecutive successful days

### Accessibility Features
- **Adjustable Font Size**: Small, Medium, Large, Extra Large
- **High Contrast Mode**: Enhanced visibility for users with visual impairments
- **Large Touch Targets**: Easy-to-tap buttons (44x44px minimum)
- **Clear Instructions**: Simple, straightforward help section
- **Calming Design**: Soothing colors and gentle animations

### Settings
- **Daily Goal**: Customize water intake goal (4-12 glasses)
- **Reminder Frequency**: Adjust notification timing
- **Accessibility Options**: Font size and contrast settings
- **Caregiver Support**: Quick access to contact support

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- VS Code with Live Server extension (for local development)

### Installation & Setup

1. **Download or Clone the Project**
   ```bash
   # If you have the files, navigate to the AquaBuddy folder
   cd AquaBuddy
   ```

2. **Open in VS Code**
   ```bash
   code .
   ```

3. **Install Live Server Extension** (if not already installed)
   - Open VS Code Extensions (Ctrl+Shift+X or Cmd+Shift+X)
   - Search for "Live Server" by Ritwick Dey
   - Click "Install"

4. **Launch the App**
   - Right-click on `index.html` in VS Code
   - Select "Open with Live Server"
   - The app will open in your default browser at `http://127.0.0.1:5500/`

### Alternative: Open Directly in Browser
If you don't want to use Live Server, you can simply:
- Double-click `index.html` to open it in your default browser
- Or drag `index.html` into a browser window

## 📁 Project Structure

```
AquaBuddy/
├── index.html          # Main HTML structure
├── styles.css          # All styles and animations
├── script.js           # Application logic and functionality
└── README.md          # This file
```

## 🎮 How to Use

### Basic Usage
1. **Log Water**: Tap the large green "Log Water" button each time you finish a glass of water
2. **Track Progress**: Watch the water meter fill up and see how many glasses you've had
3. **Reach Your Goal**: Try to complete your daily water goal (default: 8 glasses)
4. **Earn Rewards**: Unlock badges, stickers, and accessories as you meet milestones

### Navigation
- **Home (🏠)**: Main screen with Aqua Buddy and water logging
- **Progress (📊)**: View your streak, weekly summary, and calendar
- **Rewards (🏆)**: See unlocked badges, stickers, and accessories
- **Help (❓)**: Get instructions and contact caregiver support
- **Settings (⚙️)**: Customize goals, reminders, and accessibility

### Customizing Settings
1. Tap the **Settings** icon (⚙️) in the top-right corner
2. Adjust your daily water goal using the + and - buttons
3. Change reminder frequency from the dropdown menu
4. Enable high contrast mode or adjust font size for better visibility
5. Tap "← Back" to return to the main screen

## 🎯 Reward Milestones

### Badges
- **First Drop**: Complete your first day
- **Week Warrior**: Achieve a 7-day streak
- **Hydration Hero**: Complete 30 days
- **Century Club**: Drink 100 glasses total
- **Dedication**: Achieve a 30-day streak
- **Champion**: Complete 100 days

### Stickers
- **Gold Star**: Complete 1 day
- **Heart**: Complete 3 days
- **Trophy**: Complete 5 days
- **Medal**: 7-day streak
- **Crown**: 14-day streak
- **Diamond**: Complete 20 days

### Accessories
- **Sunglasses**: Complete 3 days
- **Hat**: 5-day streak
- **Bow**: Complete 7 days
- **Crown**: 10-day streak
- **Wizard Hat**: Complete 15 days
- **Party Hat**: 20-day streak

## 💾 Data Storage

All data is stored locally in your browser using **localStorage**:
- Daily water intake logs
- Streak information
- Unlocked rewards
- Settings preferences

**Note**: Data persists across sessions but is tied to the specific browser. Clearing browser data will reset the app.

## 🎨 Design Language

### Color Palette
- **Primary Blue**: #4FC3F7 - Main accent color
- **Accent Blue**: #81D4FA - Secondary highlights
- **White**: #FFFFFF - Background and text
- **Gentle Green**: #A5D6A7 - Success and action buttons

### Typography
- **Font Family**: Roboto (clean, highly readable)
- **Responsive Sizing**: Scales based on accessibility settings

### UI Principles
- **Simplicity**: No complex menus or multi-step actions
- **Clarity**: Large, clear labels and instructions
- **Feedback**: Immediate visual response to all actions
- **Encouragement**: Positive, supportive messaging throughout

## 🧪 Testing Features

The app is set to use **November 3, 2025** as the current date for testing purposes. To test different scenarios:

1. **Test Goal Completion**: Click "Log Water" 8 times to complete the daily goal
2. **View Confetti**: Complete your goal to see the celebration animation
3. **Test Reminders**: Wait or adjust reminder frequency in settings
4. **Unlock Rewards**: Complete multiple days to unlock badges and accessories
5. **Test Accessibility**: Try different font sizes and high contrast mode

## 🔧 Customization for Caregivers

### Adjusting Default Settings
To change the default settings, edit `script.js`:

```javascript
const defaultSettings = {
    dailyGoal: 8,              // Change default glasses per day
    baseReminderFrequency: 60, // Change default reminder time (minutes)
    fontSize: 'medium',        // Default font size
    highContrast: false        // Default contrast setting
};
```

### Modifying Reminder Messages
Edit the message arrays in the `showReminder()` function to customize notifications.

### Changing Reward Thresholds
Modify the unlock conditions in:
- `checkBadgeUnlockCondition()`
- `checkStickerUnlockCondition()`
- `checkAccessoryUnlockCondition()`

## 📱 Mobile Compatibility

The app is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Mobile phones (iOS Safari, Android Chrome)
- ✅ Any device with a modern browser

On mobile devices, the phone frame adjusts to fill the entire screen for a native app experience.

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with animations and transitions
- **Vanilla JavaScript**: No frameworks or dependencies
- **LocalStorage API**: Client-side data persistence

### Browser Requirements
- Modern browser with ES6 support
- LocalStorage enabled
- JavaScript enabled

## 🤝 Support & Accessibility

### For Users
- Large touch targets (minimum 44x44px)
- High contrast mode available
- Adjustable text sizes
- Simple, clear instructions
- Gentle, calming animations

### For Caregivers
- Contact support button in Help section
- Easy-to-adjust settings
- Progress tracking to monitor hydration
- Customizable goals and reminders

## 📝 Notes

- All progress data is stored locally in the browser
- No internet connection required after initial load
- No personal data is collected or transmitted
- The app uses simulated notifications (browser alerts/popups)
- For real browser notifications, additional permissions would be needed

## 🎉 Credits

**Aqua Buddy** was designed with care for people living with dementia and Alzheimer's disease. The app focuses on simplicity, encouragement, and making healthy habits fun through gamification.

---

**Version**: 1.0.0
**Last Updated**: November 3, 2025
**License**: Free to use for personal and caregiving purposes

Enjoy staying hydrated with Aqua Buddy! 💧💙
