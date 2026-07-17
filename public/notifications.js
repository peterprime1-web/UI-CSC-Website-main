// ========================================
// UI CSC PORTAL - NOTIFICATIONS MODULE
// notifications.js (With Browser Notifications)
// ========================================

window.Notifications = (() => {
    let notifications = [];
    let initialLoadComplete = false;

    // DOM Elements
    const badge = document.getElementById("notification-count");
    const list = document.getElementById("notification-list");
    const panel = document.getElementById("notification-panel");
    const bell = document.querySelector(".notification-btn");

    async function init() {
        if (!bell || !panel) return;

        // Ask for permission to show desktop notifications
        requestBrowserNotificationPermission();

        // Toggle panel ONLY when clicking the bell button
        bell.onclick = (e) => {
            e.stopPropagation();
            const isShowing = panel.classList.toggle("show");
            if (isShowing) {
                clearBadge();
            }
        };

        // Hide the menu completely if you click anywhere else on the page
        document.addEventListener("click", (e) => {
            if (!panel.contains(e.target) && !bell.contains(e.target)) {
                panel.classList.remove("show");
            }
        });

        panel.onclick = (e) => e.stopPropagation();

        // Start listening to live database additions
        setupRealtimeListeners();
    }

    /**
     * Requests native browser permissions for push alerts
     */
    function requestBrowserNotificationPermission() {
        if ("Notification" in window) {
            if (Notification.permission !== "granted" && Notification.permission !== "denied") {
                Notification.requestPermission();
            }
        }
    }

    /**
     * Spawns a native desktop browser banner
     */
    function sendBrowserNotification(title, body) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
                body: body,
                icon: "https://ui-avatars.com/api/?name=CSC&background=4A90E2&color=fff" // Optional logo icon
            });
        }
    }

    /**
     * Attaches live Firebase database listeners to catch updates automatically
     */
    function setupRealtimeListeners() {
        if (!window.db) {
            console.error("Firebase Database (db) instance is missing!");
            return;
        }

        const pathsToWatch = {
            'announcements': '📢 New Announcement',
            'notes': '📚 New Lecture Note',
            'materials': '📁 New Course Material',
            'assignments': '📝 New Assignment'
        };

        // Brief delay on startup so historical data doesn't trigger alerts
        setTimeout(() => {
            initialLoadComplete = true;
        }, 2000);

        Object.keys(pathsToWatch).forEach(path => {
            db.ref(path).limitToLast(1).on("child_added", (snapshot) => {
                if (!snapshot.exists()) return;

                const item = snapshot.val();
                const title = item.title || item.name || `New update in ${path}`;
                const detailMessage = item.description || item.preview || "Open page to view details.";
                
                const newNotification = {
                    id: snapshot.key,
                    label: pathsToWatch[path],
                    title: title,
                    message: detailMessage,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: path
                };

                notifications.unshift(newNotification);
                if (notifications.length > 15) notifications.pop();

                // Re-render items and handle background tracking
                renderNotifications(initialLoadComplete);

                // FIRE BROWSER NOTIFICATION: Only if it's new real-time content
                if (initialLoadComplete) {
                    sendBrowserNotification(pathsToWatch[path], title);
                }
            });
        });
    }

    function renderNotifications(incrementBadge = false) {
        if (!list) return;

        if (notifications.length === 0) {
            list.innerHTML = `<div class="notification-empty" style="padding:15px; text-align:center; color:#888;">No recent updates</div>`;
            return;
        }

        list.innerHTML = notifications.map(item => `
            <div class="notification-item ${item.type}-notify" style="padding: 12px 15px; border-bottom: 1px solid rgba(0,0,0,0.05); cursor: pointer;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #4A90E2; font-weight: 600;">
                    <span>${item.label}</span>
                    <span style="color: #aaa; font-weight: normal;">${item.time}</span>
                </div>
                <strong style="display: block; font-size: 13px; margin-top: 4px; color: var(--text-main, #333);">${item.title}</strong>
                <p style="margin: 3px 0 0; font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.message}</p>
            </div>
        `).join("");

        if (badge && incrementBadge && !panel.classList.contains("show")) {
            const currentCount = parseInt(badge.textContent || "0");
            badge.textContent = currentCount + 1;
            badge.style.display = "flex"; 
        }
    }

    function clearBadge() {
        if (badge) {
            badge.textContent = "0";
            badge.style.display = "none"; 
        }
    }

    return {
        init
    };
})();