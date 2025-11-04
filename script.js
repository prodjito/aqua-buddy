// Aqua Buddy - Hydration Gamification App
// Main Application Logic

class AquaBuddyApp {
    constructor() {
        this.currentDate = new Date();
        this.settings = this.loadSettings();
        this.userData = this.loadUserData();
        this.notificationTimer = null;
        this.notificationHistory = [];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateMainScreen();
        this.updateProgressScreen();
        this.updateRewardsScreen();
        this.applyAccessibilitySettings();
        this.scheduleNextReminder();
        this.checkDailyReset();
    }

    loadSettings() {
        const defaultSettings = {
            dailyGoal: 8,
            baseReminderFrequency: 0.5, // 60 minutes
            fontSize: 'medium',
            highContrast: false
        };

        const saved = localStorage.getItem('aqua-buddy-settings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveSettings() {
        localStorage.setItem('aqua-buddy-settings', JSON.stringify(this.settings));
    }

    loadUserData() {
        const defaultData = {
            dailyLog: {},
            totalGlasses: 0,
            streakDays: 0,
            lastCompletedDate: null,
            unlockedBadges: [],
            unlockedStickers: [],
            unlockedAccessories: [],
            currentAccessory: null
        };

        const saved = localStorage.getItem('aqua-buddy-data');
        return saved ? { ...defaultData, ...JSON.parse(saved) } : defaultData;
    }

    saveUserData() {
        localStorage.setItem('aqua-buddy-data', JSON.stringify(this.userData));
    }

    checkDailyReset() {
        const today = this.formatDate(this.currentDate);

        if (!this.userData.dailyLog[today]) {
            this.userData.dailyLog[today] = {
                glasses: 0,
                completed: false,
                timestamp: this.currentDate.getTime()
            };
            this.saveUserData();
        }
    }

    formatDate(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    getTodayData() {
        const today = this.formatDate(this.currentDate);
        return this.userData.dailyLog[today] || { glasses: 0, completed: false };
    }

    setupEventListeners() {
        document.getElementById('log-water-btn').addEventListener('click', () => this.logWater());
        document.getElementById('undo-btn').addEventListener('click', () => this.undoLastGlass());
        document.getElementById('reset-day-btn').addEventListener('click', () => this.resetDay());

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.navigateTo(e.currentTarget.dataset.screen));
        });

        document.getElementById('settings-btn').addEventListener('click', () => this.navigateTo('settings-screen'));
        document.getElementById('back-from-settings').addEventListener('click', () => this.navigateTo('main-screen'));

        document.getElementById('decrease-goal').addEventListener('click', () => this.adjustDailyGoal(-1));
        document.getElementById('increase-goal').addEventListener('click', () => this.adjustDailyGoal(1));
        document.getElementById('daily-goal-input').addEventListener('change', (e) => {
            this.settings.dailyGoal = parseInt(e.target.value);
            this.saveSettings();
            this.updateMainScreen();
        });

        document.getElementById('base-reminder-frequency').addEventListener('change', (e) => {
            this.settings.baseReminderFrequency = parseInt(e.target.value);
            this.saveSettings();
            this.scheduleNextReminder();
        });

        document.getElementById('font-size').addEventListener('change', (e) => {
            this.settings.fontSize = e.target.value;
            this.saveSettings();
            this.applyAccessibilitySettings();
        });

        document.getElementById('high-contrast').addEventListener('change', (e) => {
            this.settings.highContrast = e.target.checked;
            this.saveSettings();
            this.applyAccessibilitySettings();
        });

        document.getElementById('contact-support-btn').addEventListener('click', () => {
            alert('This would contact your caregiver. In a real app, this would send an email or notification to a designated caregiver.');
        });

        document.getElementById('close-notification').addEventListener('click', () => this.closeNotification());

        document.getElementById('prev-month').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('next-month').addEventListener('click', () => this.changeMonth(1));

        this.currentCalendarDate = new Date(this.currentDate);
    }

    logWater() {
        const today = this.formatDate(this.currentDate);
        const todayData = this.getTodayData();

        if (todayData.glasses >= this.settings.dailyGoal) {
            this.showBuddyMessage("Great job! You've already reached your goal today! 🎉");
            return;
        }

        todayData.glasses++;
        this.userData.dailyLog[today] = todayData;
        this.userData.totalGlasses++;

        const goalReached = todayData.glasses >= this.settings.dailyGoal;

        if (goalReached && !todayData.completed) {
            todayData.completed = true;
            this.handleGoalCompletion();
        }

        this.saveUserData();
        this.updateMainScreen();
        this.updateProgressScreen();
        this.scheduleNextReminder();

        this.animateWaterLog();

        const messages = [
            "Awesome! Stay hydrated! 💧",
            "Great job! Keep it up! 🌟",
            "You're doing amazing! 💙",
            "Way to go! 🎉",
            "Wonderful! Your body thanks you! 💧"
        ];

        this.showBuddyMessage(messages[Math.floor(Math.random() * messages.length)]);
    }

    undoLastGlass() {
        const todayData = this.getTodayData();

        if (todayData.glasses === 0) {
            this.showBuddyMessage("No glasses to undo today! 💙");
            return;
        }

        const confirmed = confirm("Are you sure you want to undo your last glass of water? This will remove one glass from today's count.");

        if (!confirmed) {
            return;
        }

        const today = this.formatDate(this.currentDate);
        const wasCompleted = todayData.completed;

        todayData.glasses--;
        this.userData.totalGlasses--;

        if (wasCompleted && todayData.glasses < this.settings.dailyGoal) {
            todayData.completed = false;
        }

        this.userData.dailyLog[today] = todayData;
        this.saveUserData();
        this.updateMainScreen();
        this.updateProgressScreen();
        this.scheduleNextReminder();

        this.showBuddyMessage("Last glass undone. No worries! 💙");
    }

    resetDay() {
        const todayData = this.getTodayData();

        if (todayData.glasses === 0) {
            this.showBuddyMessage("Today's count is already at zero! 💧");
            return;
        }

        const confirmed = confirm(`Are you sure you want to reset today's progress? This will remove all ${todayData.glasses} glass(es) from your count today.`);

        if (!confirmed) {
            return;
        }

        const today = this.formatDate(this.currentDate);
        const glassesToRemove = todayData.glasses;

        todayData.glasses = 0;
        todayData.completed = false;
        this.userData.totalGlasses -= glassesToRemove;

        this.userData.dailyLog[today] = todayData;
        this.saveUserData();
        this.updateMainScreen();
        this.updateProgressScreen();
        this.scheduleNextReminder();

        this.showBuddyMessage("Today's progress has been reset. Let's start fresh! 💙");
    }

    handleGoalCompletion() {
        this.createConfetti();
        this.updateStreak();
        this.checkAndUnlockRewards();

        setTimeout(() => {
            this.showBuddyMessage("🎉 You did it! Daily goal completed! You're a hydration superstar! 🌟");
        }, 500);
    }

    updateStreak() {
        const today = this.formatDate(this.currentDate);
        const yesterday = new Date(this.currentDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = this.formatDate(yesterday);

        const lastCompleted = this.userData.lastCompletedDate;

        if (lastCompleted === yesterdayStr) {
            this.userData.streakDays++;
        } else if (lastCompleted !== today) {
            this.userData.streakDays = 1;
        }

        this.userData.lastCompletedDate = today;
        this.saveUserData();
    }

    checkAndUnlockRewards() {
        const todayData = this.getTodayData();
        const streak = this.userData.streakDays;

        const badges = this.getBadgesList();
        const stickers = this.getStickersList();
        const accessories = this.getAccessoriesList();

        badges.forEach(badge => {
            if (this.checkBadgeUnlockCondition(badge) && !this.userData.unlockedBadges.includes(badge.id)) {
                this.userData.unlockedBadges.push(badge.id);
                this.showBuddyMessage(`🎖️ New Badge Unlocked: ${badge.name}!`);
            }
        });

        stickers.forEach(sticker => {
            if (this.checkStickerUnlockCondition(sticker) && !this.userData.unlockedStickers.includes(sticker.id)) {
                this.userData.unlockedStickers.push(sticker.id);
                this.showBuddyMessage(`⭐ New Sticker Earned: ${sticker.name}!`);
            }
        });

        accessories.forEach(accessory => {
            if (this.checkAccessoryUnlockCondition(accessory) && !this.userData.unlockedAccessories.includes(accessory.id)) {
                this.userData.unlockedAccessories.push(accessory.id);
                this.showBuddyMessage(`👑 New Accessory Unlocked: ${accessory.name}!`);
            }
        });

        this.saveUserData();
        this.updateRewardsScreen();
    }

    checkBadgeUnlockCondition(badge) {
        const totalDaysCompleted = Object.values(this.userData.dailyLog).filter(day => day.completed).length;

        switch(badge.id) {
            case 'first-day':
                return totalDaysCompleted >= 1;
            case 'week-warrior':
                return this.userData.streakDays >= 7;
            case 'hydration-hero':
                return totalDaysCompleted >= 30;
            case 'century-club':
                return this.userData.totalGlasses >= 100;
            case 'dedication':
                return this.userData.streakDays >= 30;
            case 'champion':
                return totalDaysCompleted >= 100;
            default:
                return false;
        }
    }

    checkStickerUnlockCondition(sticker) {
        const totalDaysCompleted = Object.values(this.userData.dailyLog).filter(day => day.completed).length;

        if (sticker.id === 'star') return totalDaysCompleted >= 1;
        if (sticker.id === 'heart') return totalDaysCompleted >= 3;
        if (sticker.id === 'trophy') return totalDaysCompleted >= 5;
        if (sticker.id === 'medal') return this.userData.streakDays >= 7;
        if (sticker.id === 'crown') return this.userData.streakDays >= 14;
        if (sticker.id === 'diamond') return totalDaysCompleted >= 20;

        return false;
    }

    checkAccessoryUnlockCondition(accessory) {
        const totalDaysCompleted = Object.values(this.userData.dailyLog).filter(day => day.completed).length;

        if (accessory.id === 'sunglasses') return totalDaysCompleted >= 3;
        if (accessory.id === 'hat') return this.userData.streakDays >= 5;
        if (accessory.id === 'bow') return totalDaysCompleted >= 7;
        if (accessory.id === 'crown') return this.userData.streakDays >= 10;
        if (accessory.id === 'wizard-hat') return totalDaysCompleted >= 15;
        if (accessory.id === 'party-hat') return this.userData.streakDays >= 20;

        return false;
    }

    getBadgesList() {
        return [
            { id: 'first-day', name: 'First Drop', icon: '💧', description: 'Complete your first day' },
            { id: 'week-warrior', name: 'Week Warrior', icon: '🔥', description: '7 day streak' },
            { id: 'hydration-hero', name: 'Hydration Hero', icon: '🦸', description: '30 days completed' },
            { id: 'century-club', name: 'Century Club', icon: '💯', description: '100 glasses total' },
            { id: 'dedication', name: 'Dedication', icon: '⭐', description: '30 day streak' },
            { id: 'champion', name: 'Champion', icon: '🏆', description: '100 days completed' }
        ];
    }

    getStickersList() {
        return [
            { id: 'star', name: 'Gold Star', icon: '⭐' },
            { id: 'heart', name: 'Heart', icon: '❤️' },
            { id: 'trophy', name: 'Trophy', icon: '🏆' },
            { id: 'medal', name: 'Medal', icon: '🥇' },
            { id: 'crown', name: 'Crown', icon: '👑' },
            { id: 'diamond', name: 'Diamond', icon: '💎' }
        ];
    }

    getAccessoriesList() {
        return [
            { id: 'sunglasses', name: 'Sunglasses', icon: '🕶️' },
            { id: 'hat', name: 'Hat', icon: '🎩' },
            { id: 'bow', name: 'Bow', icon: '🎀' },
            { id: 'crown', name: 'Crown', icon: '👑' },
            { id: 'wizard-hat', name: 'Wizard Hat', icon: '🧙' },
            { id: 'party-hat', name: 'Party Hat', icon: '🎉' }
        ];
    }

    updateMainScreen() {
        const todayData = this.getTodayData();
        const progress = (todayData.glasses / this.settings.dailyGoal) * 100;

        document.getElementById('water-fill').style.width = `${Math.min(progress, 100)}%`;
        document.getElementById('progress-text').textContent = `${todayData.glasses} / ${this.settings.dailyGoal} glasses`;

        const glassesLeft = Math.max(0, this.settings.dailyGoal - todayData.glasses);
        document.getElementById('glasses-left').textContent = glassesLeft;

        this.updateWaterDroplets();
        this.updateReminderBanner();

        if (todayData.glasses >= this.settings.dailyGoal) {
            this.showBuddyMessage("🎉 Goal completed! You're a hydration champion!");
        }
    }

    updateWaterDroplets() {
        const todayData = this.getTodayData();
        const dropletsContainer = document.getElementById('water-droplets');
        dropletsContainer.innerHTML = '';

        for (let i = 0; i < this.settings.dailyGoal; i++) {
            const droplet = document.createElement('span');
            droplet.className = 'water-droplet';
            droplet.textContent = '💧';

            if (i < todayData.glasses) {
                droplet.classList.add('filled');
            }

            dropletsContainer.appendChild(droplet);
        }
    }

    updateReminderBanner() {
        const reminderText = document.getElementById('reminder-text');

        if (this.nextReminderTime) {
            const now = new Date();
            const diff = this.nextReminderTime - now;
            const minutes = Math.floor(diff / 60000);

            if (minutes > 60) {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                reminderText.textContent = `Next reminder in ${hours}h ${mins}m`;
            } else {
                reminderText.textContent = `Next reminder in ${minutes} minutes`;
            }
        } else {
            reminderText.textContent = 'Reminders active';
        }
    }

    scheduleNextReminder() {
        if (this.notificationTimer) {
            clearTimeout(this.notificationTimer);
        }

        const todayData = this.getTodayData();
        const progress = todayData.glasses / this.settings.dailyGoal;

        let reminderDelay;
        if (progress >= 0.8) {
            reminderDelay = this.settings.baseReminderFrequency * 3;
        } else if (progress >= 0.5) {
            reminderDelay = this.settings.baseReminderFrequency * 1.5;
        } else {
            reminderDelay = this.settings.baseReminderFrequency;
        }

        this.nextReminderTime = new Date(Date.now() + reminderDelay * 60000);

        this.notificationTimer = setTimeout(() => {
            this.showReminder();
            this.scheduleNextReminder();
        }, reminderDelay * 60000);

        this.updateReminderBanner();
    }

    showReminder() {
        const todayData = this.getTodayData();
        const progress = todayData.glasses / this.settings.dailyGoal;

        let messages;
        if (progress >= 0.8) {
            messages = [
                "You're almost there! Just a little more! 💙",
                "So close to your goal! Keep it up! 🌟",
                "One more glass to go! You've got this! 💧"
            ];
        } else if (progress >= 0.5) {
            messages = [
                "You're halfway there! Great progress! 🎉",
                "Keep going! Your body will thank you! 💧",
                "Doing great! Time for another glass! 💙"
            ];
        } else {
            messages = [
                "Time to hydrate! Let's drink some water! 💧",
                "Your friend Aqua Buddy is waiting for you! 💙",
                "Remember to drink water! Stay healthy! 🌟",
                "It's water time! Let's do this together! 💧"
            ];
        }

        const message = messages[Math.floor(Math.random() * messages.length)];

        this.notificationHistory.push({
            time: new Date().toLocaleTimeString(),
            message: message
        });

        this.updateNotificationHistory();
        this.displayNotificationPopup(message);
    }

    displayNotificationPopup(message) {
        // Try to show system notification first (works in background/closed)
        if ('Notification' in window && Notification.permission === 'granted') {
            this.showSystemNotification(message);
        } else if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    this.showSystemNotification(message);
                }
            });
        }

        // Also show in-app popup if user is actively viewing the app
        if (document.visibilityState === 'visible') {
            const popup = document.getElementById('notification-popup');
            const messageEl = document.getElementById('notification-message');

            messageEl.textContent = message;
            popup.classList.add('show');

            setTimeout(() => {
                popup.classList.remove('show');
            }, 5000);
        }
    }

    showSystemNotification(message) {
        const todayData = this.getTodayData();
        const progress = todayData.glasses / this.settings.dailyGoal;
        const glassesLeft = Math.max(0, this.settings.dailyGoal - todayData.glasses);

        // Create notification with progress info
        let body = message;
        if (glassesLeft > 0) {
            body += `\n${todayData.glasses}/${this.settings.dailyGoal} glasses today - ${glassesLeft} to go!`;
        } else {
            body += `\n🎉 Goal completed! Great job!`;
        }

        // Create notification options
        const options = {
            body: body,
            icon: this.getNotificationIcon(),
            badge: this.getNotificationIcon(),
            vibrate: [200, 100, 200],
            tag: 'aqua-buddy-reminder',
            requireInteraction: false,
            silent: false,
            renotify: false,
            data: {
                dateTime: Date.now(),
                progress: progress,
                glassesLeft: glassesLeft
            }
        };

        try {
            // Show notification
            const notification = new Notification('Aqua Buddy 💧', options);

            // Handle notification click
            notification.onclick = (event) => {
                event.preventDefault();
                window.focus();
                notification.close();
            };

            // Auto-close after 15 seconds
            setTimeout(() => {
                notification.close();
            }, 15000);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }

    getNotificationIcon() {
        // Try to use the app icon, fallback to a data URL
        // This creates a simple blue circle as a fallback icon
        return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%234FC3F7"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">💧</text></svg>';
    }

    closeNotification() {
        document.getElementById('notification-popup').classList.remove('show');
    }

    updateNotificationHistory() {
        const historyContainer = document.getElementById('notification-history');

        if (this.notificationHistory.length === 0) {
            historyContainer.innerHTML = '<p class="empty-state">No notifications yet today</p>';
            return;
        }

        historyContainer.innerHTML = this.notificationHistory
            .slice(-10)
            .reverse()
            .map(notif => `<div class="notification-item">${notif.time}: ${notif.message}</div>`)
            .join('');
    }

    updateProgressScreen() {
        this.updateStreakDisplay();
        this.updateWeeklySummary();
        this.updateCalendar();
    }

    updateStreakDisplay() {
        document.getElementById('streak-days').textContent = this.userData.streakDays;
    }

    updateWeeklySummary() {
        const chartContainer = document.getElementById('weekly-chart');
        chartContainer.innerHTML = '';

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = this.currentDate.getDay();
        const startOfWeek = new Date(this.currentDate);
        startOfWeek.setDate(this.currentDate.getDate() - (today === 0 ? 6 : today - 1));

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = this.formatDate(date);
            const dayData = this.userData.dailyLog[dateStr] || { glasses: 0 };

            const dayBar = document.createElement('div');
            dayBar.className = 'day-bar';

            const percentage = (dayData.glasses / this.settings.dailyGoal) * 100;
            const height = Math.min(percentage, 100);

            dayBar.innerHTML = `
                <div class="bar" style="height: ${height}%"></div>
                <div class="day-label">${days[i]}</div>
            `;

            chartContainer.appendChild(dayBar);
        }
    }

    updateCalendar() {
        const year = this.currentCalendarDate.getFullYear();
        const month = this.currentCalendarDate.getMonth();

        document.getElementById('month-year').textContent =
            `${this.currentCalendarDate.toLocaleString('default', { month: 'long' })} ${year}`;

        const gridContainer = document.getElementById('calendar-grid');
        gridContainer.innerHTML = '';

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const prevMonthDays = new Date(year, month, 0).getDate();

        for (let i = startDay - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            const dayEl = this.createCalendarDay(day, true, false);
            gridContainer.appendChild(dayEl);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            const dayData = this.userData.dailyLog[dateStr];
            const isToday = dateStr === this.formatDate(this.currentDate);
            const isCompleted = dayData && dayData.completed;

            const dayEl = this.createCalendarDay(day, false, isToday, isCompleted);
            gridContainer.appendChild(dayEl);
        }

        const totalCells = startDay + daysInMonth;
        const remainingCells = 42 - totalCells;

        for (let day = 1; day <= remainingCells; day++) {
            const dayEl = this.createCalendarDay(day, true, false);
            gridContainer.appendChild(dayEl);
        }
    }

    createCalendarDay(day, isOtherMonth, isToday, isCompleted = false) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = day;

        if (isOtherMonth) {
            dayEl.classList.add('other-month');
        }
        if (isToday) {
            dayEl.classList.add('today');
        }
        if (isCompleted) {
            dayEl.classList.add('completed');
        }

        return dayEl;
    }

    changeMonth(direction) {
        this.currentCalendarDate.setMonth(this.currentCalendarDate.getMonth() + direction);
        this.updateCalendar();
    }

    updateRewardsScreen() {
        this.renderBadges();
        this.renderStickers();
        this.renderAccessories();
    }

    renderBadges() {
        const grid = document.getElementById('badges-grid');
        const badges = this.getBadgesList();

        grid.innerHTML = badges.map(badge => {
            const unlocked = this.userData.unlockedBadges.includes(badge.id);
            return `
                <div class="badge-item ${unlocked ? '' : 'locked'}" title="${badge.description}">
                    <div class="badge-icon">${unlocked ? badge.icon : '🔒'}</div>
                    <div class="badge-name">${badge.name}</div>
                </div>
            `;
        }).join('');
    }

    renderStickers() {
        const grid = document.getElementById('stickers-grid');
        const stickers = this.getStickersList();

        grid.innerHTML = stickers.map(sticker => {
            const unlocked = this.userData.unlockedStickers.includes(sticker.id);
            return `
                <div class="sticker-item ${unlocked ? '' : 'locked'}">
                    <div class="sticker-icon">${unlocked ? sticker.icon : '🔒'}</div>
                    <div class="sticker-name">${sticker.name}</div>
                </div>
            `;
        }).join('');
    }

    renderAccessories() {
        const grid = document.getElementById('accessories-grid');
        const accessories = this.getAccessoriesList();

        grid.innerHTML = accessories.map(accessory => {
            const unlocked = this.userData.unlockedAccessories.includes(accessory.id);
            return `
                <div class="accessory-item ${unlocked ? '' : 'locked'}"
                     data-accessory-id="${accessory.id}"
                     ${unlocked ? `onclick="app.toggleAccessory('${accessory.id}')"` : ''}>
                    <div class="accessory-icon">${unlocked ? accessory.icon : '🔒'}</div>
                    <div class="accessory-name">${accessory.name}</div>
                </div>
            `;
        }).join('');
    }

    toggleAccessory(accessoryId) {
        if (this.userData.currentAccessory === accessoryId) {
            this.userData.currentAccessory = null;
        } else {
            this.userData.currentAccessory = accessoryId;
        }
        this.saveUserData();
        this.updateBuddyAccessory();
    }

    updateBuddyAccessory() {
        const accessoriesEl = document.getElementById('buddy-accessories');
        accessoriesEl.innerHTML = '';

        if (this.userData.currentAccessory) {
            const accessory = this.getAccessoriesList().find(a => a.id === this.userData.currentAccessory);
            if (accessory) {
                accessoriesEl.innerHTML = `<div style="font-size: 50px; position: absolute; top: -10px; left: 50%; transform: translateX(-50%);">${accessory.icon}</div>`;
            }
        }
    }

    navigateTo(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        document.getElementById(screenId).classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.screen === screenId) {
                btn.classList.add('active');
            }
        });

        if (screenId === 'progress-screen') {
            this.updateProgressScreen();
        } else if (screenId === 'rewards-screen') {
            this.updateRewardsScreen();
        } else if (screenId === 'settings-screen') {
            this.updateSettingsScreen();
        }
    }

    updateSettingsScreen() {
        document.getElementById('daily-goal-input').value = this.settings.dailyGoal;
        document.getElementById('base-reminder-frequency').value = this.settings.baseReminderFrequency;
        document.getElementById('font-size').value = this.settings.fontSize;
        document.getElementById('high-contrast').checked = this.settings.highContrast;
        this.updateNotificationHistory();
    }

    adjustDailyGoal(change) {
        const newGoal = this.settings.dailyGoal + change;
        if (newGoal >= 4 && newGoal <= 12) {
            this.settings.dailyGoal = newGoal;
            document.getElementById('daily-goal-input').value = newGoal;
            this.saveSettings();
            this.updateMainScreen();
        }
    }

    applyAccessibilitySettings() {
        document.body.className = '';
        document.body.classList.add(`font-${this.settings.fontSize}`);

        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
        }
    }

    showBuddyMessage(message) {
        const messageEl = document.getElementById('buddy-message');
        messageEl.textContent = message;

        messageEl.style.animation = 'none';
        setTimeout(() => {
            messageEl.style.animation = 'fadeIn 0.5s ease';
        }, 10);
    }

    animateWaterLog() {
        const btn = document.getElementById('log-water-btn');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = '';
        }, 200);

        const buddy = document.getElementById('aqua-buddy');
        buddy.style.animation = 'none';
        setTimeout(() => {
            buddy.style.animation = 'float 3s ease-in-out infinite';
        }, 10);
    }

    createConfetti() {
        const container = document.getElementById('confetti-container');
        const colors = ['#4FC3F7', '#81D4FA', '#A5D6A7', '#FFF59D', '#FFB74D'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

            container.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }
    }
}

let app;

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch((error) => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
            console.log('Notification permission:', permission);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    app = new AquaBuddyApp();

    // Request notification permission after a short delay
    setTimeout(() => {
        requestNotificationPermission();
    }, 2000);
});
