// IP Tracking utility for Guest test quota management
const IP_STORAGE_KEY = 'korean_vitamin_ip_data';
const MAX_FREE_TESTS = 2;

class IPTracker {
    constructor() {
        this.ipAddress = null;
        this.testHistory = [];
    }

    // Get user's IP address using ipify API
    async getIPAddress() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            this.ipAddress = data.ip;
            return this.ipAddress;
        } catch (error) {
            console.error('Error fetching IP:', error);
            // Fallback to a random identifier if IP fetch fails
            this.ipAddress = this.generateFallbackId();
            return this.ipAddress;
        }
    }

    // Generate fallback identifier if IP fetch fails
    generateFallbackId() {
        const existing = localStorage.getItem('fallback_user_id');
        if (existing) return existing;

        const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('fallback_user_id', id);
        return id;
    }

    // Load test history from localStorage
    loadHistory() {
        try {
            const stored = localStorage.getItem(IP_STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored);
                return data[this.ipAddress] || [];
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
        return [];
    }

    // Save test history to localStorage
    saveHistory(history) {
        try {
            const stored = localStorage.getItem(IP_STORAGE_KEY);
            const allData = stored ? JSON.parse(stored) : {};
            allData[this.ipAddress] = history;
            localStorage.setItem(IP_STORAGE_KEY, JSON.stringify(allData));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    // Check remaining test quota
    async checkQuota() {
        if (!this.ipAddress) {
            await this.getIPAddress();
        }

        this.testHistory = this.loadHistory();
        const completedTests = this.testHistory.filter(t => t.completed).length;
        const remaining = MAX_FREE_TESTS - completedTests;

        return {
            total: MAX_FREE_TESTS,
            completed: completedTests,
            remaining: Math.max(0, remaining),
            hasQuota: remaining > 0,
            testHistory: this.testHistory
        };
    }

    // Record test attempt
    async recordTestAttempt(testId, completed = false, score = null) {
        if (!this.ipAddress) {
            await this.getIPAddress();
        }

        this.testHistory = this.loadHistory();

        const existingIndex = this.testHistory.findIndex(t => t.testId === testId);

        const testRecord = {
            testId,
            completed,
            score,
            timestamp: new Date().toISOString(),
            ip: this.ipAddress
        };

        if (existingIndex >= 0) {
            // Update existing record
            this.testHistory[existingIndex] = testRecord;
        } else {
            // Add new record
            this.testHistory.push(testRecord);
        }

        this.saveHistory(this.testHistory);
        return testRecord;
    }

    // Check if should show upgrade popup
    async shouldShowUpgradePopup() {
        const quota = await this.checkQuota();
        return quota.completed >= MAX_FREE_TESTS && quota.remaining === 0;
    }

    // Get test history for display
    async getTestHistory() {
        if (!this.ipAddress) {
            await this.getIPAddress();
        }
        return this.loadHistory();
    }

    // Clear history (for testing purposes)
    clearHistory() {
        if (this.ipAddress) {
            const stored = localStorage.getItem(IP_STORAGE_KEY);
            if (stored) {
                const allData = JSON.parse(stored);
                delete allData[this.ipAddress];
                localStorage.setItem(IP_STORAGE_KEY, JSON.stringify(allData));
            }
        }
    }
}

// Export singleton instance
const ipTracker = new IPTracker();
export default ipTracker;
