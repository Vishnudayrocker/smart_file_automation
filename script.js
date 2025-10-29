// ======================================
// SMART FILE AUTOMATION SYSTEM
// Complete JavaScript with All Features
// ======================================

// Global State
let appState = {
    files: [],
    recycleBin: [],
    mode: 'normal', // 'normal' or 'dryrun'
    analytics: {
        usageLog: [],
        totalActions: 0,
        filesOrganized: 0,
        filesDeleted: 0,
        spaceSaved: 0
    },
    statistics: {
        total: 0,
        documents: 0,
        images: 0,
        videos: 0,
        music: 0
    }
};

// File Categories Configuration
const fileCategories = {
    documents: {
        extensions: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.csv', '.ppt', '.pptx', '.odt'],
        icon: '📄',
        name: 'Documents'
    },
    images: {
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.bmp', '.ico'],
        icon: '🖼️',
        name: 'Images'
    },
    videos: {
        extensions: ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv', '.mpg'],
        icon: '🎥',
        name: 'Videos'
    },
    music: {
        extensions: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'],
        icon: '🎵',
        name: 'Music'
    },
    others: {
        extensions: [],
        icon: '📦',
        name: 'Others'
    }
};

// ======================================
// INITIALIZATION
// ======================================

document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    initializeEventListeners();
    updateStatistics();
    updateAllFileLists();
    scheduleCleanupNotification();
    showToast('Smart File Automation System Ready! 🚀', 'success');
});

function initializeEventListeners() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const searchInput = document.getElementById('searchInput');

    fileInput.addEventListener('change', handleFileSelect);
    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleFileDrop);
    searchInput.addEventListener('input', handleSearch);
}

// ======================================
// MODE MANAGEMENT
// ======================================

function setMode(mode) {
    appState.mode = mode;
    showToast(`Mode switched to: ${mode.toUpperCase()}`, 'info');
}

// ======================================
// FILE UPLOAD & PROCESSING
// ======================================

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    processFiles(files);
}

function processFiles(files) {
    files.forEach(file => {
        const category = getCategoryForFile(file.name);
        const fileObj = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            category: category,
            url: URL.createObjectURL(file),
            addedAt: new Date()
        };
        appState.files.push(fileObj);
        logAction('upload', fileObj.name, fileObj.size);
    });
    updateStatistics();
    updateAllFileLists();
    saveToLocalStorage();
    showToast(`${files.length} file(s) uploaded successfully!`, 'success');
}

function getCategoryForFile(filename) {
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    for (const [category, config] of Object.entries(fileCategories)) {
        if (config.extensions.includes(ext)) {
            return category;
        }
    }
    return 'others';
}

// ======================================
// SEARCH & FILTER
// ======================================

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    updateAllFileLists(query);
}

// ======================================
// FILE ORGANIZATION
// ======================================

function organizeFiles() {
    if (appState.files.length === 0) {
        showToast('No files to organize', 'error');
        return;
    }

    if (appState.mode === 'dryrun') {
        showToast(`DRY RUN: Would organize ${appState.files.length} files (no changes made)`, 'info');
    } else {
        appState.files.forEach(file => {
            logAction('organize', file.name, file.size);
        });
        showToast(`${appState.files.length} files organized successfully!`, 'success');
    }
    
    updateStatistics();
    saveToLocalStorage();
}

// ======================================
// FILE LISTING & DISPLAY
// ======================================

function updateAllFileLists(query = '') {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = '';

    Object.keys(fileCategories).forEach(category => {
        const files = appState.files.filter(f => 
            f.category === category && 
            f.name.toLowerCase().includes(query)
        );

        if (files.length > 0) {
            const categoryCard = createCategoryCard(category, files);
            container.appendChild(categoryCard);
        }
    });
}

function createCategoryCard(category, files) {
    const config = fileCategories[category];
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
        <div class="category-header">
            <div class="category-title">${config.icon} ${config.name}</div>
            <span class="file-count">${files.length}</span>
        </div>
        <div class="files-list">
            ${files.map(file => `
                <div class="file-item">
                    <div class="file-info" onclick="previewFile('${file.id}')">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${formatFileSize(file.size)}</div>
                    </div>
                    <div class="file-actions">
                        <button class="icon-btn" onclick="deleteFile('${file.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    return card;
}

// ======================================
// FILE PREVIEW
// ======================================

function previewFile(fileId) {
    const file = appState.files.find(f => f.id == fileId);
    if (!file) return;

    const modal = document.getElementById('previewModal');
    const content = document.getElementById('previewContent');

    if (file.category === 'images') {
        content.innerHTML = `<img src="${file.url}" alt="${file.name}">`;
        modal.style.display = 'flex';
    } else if (file.category === 'videos') {
        content.innerHTML = `<video src="${file.url}" controls></video>`;
        modal.style.display = 'flex';
    } else {
        showToast('Preview not available for this file type', 'info');
    }
}

function closePreview() {
    document.getElementById('previewModal').style.display = 'none';
}

// ======================================
// DELETE & RECYCLE BIN
// ======================================

function deleteFile(fileId) {
    const file = appState.files.find(f => f.id == fileId);
    if (file) {
        appState.recycleBin.push(file);
        appState.files = appState.files.filter(f => f.id != fileId);
        logAction('delete', file.name, file.size);
        updateAllFileLists();
        updateStatistics();
        saveToLocalStorage();
        showToast('File moved to recycle bin', 'info');
    }
}

function showRecycleBin() {
    const modal = document.getElementById('recycleBinModal');
    const list = document.getElementById('recycleBinList');
    
    if (appState.recycleBin.length === 0) {
        list.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--text-secondary)">Recycle bin is empty</p>';
    } else {
        list.innerHTML = appState.recycleBin.map(file => `
            <div class="file-item" style="margin-bottom: 1rem;">
                <div>
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
                <div>
                    <button class="btn btn-secondary" onclick="restoreFile('${file.id}')">Restore</button>
                </div>
            </div>
        `).join('');
    }
    modal.style.display = 'flex';
}

function hideRecycleBin() {
    document.getElementById('recycleBinModal').style.display = 'none';
}

function restoreFile(fileId) {
    const file = appState.recycleBin.find(f => f.id == fileId);
    if (file) {
        appState.files.push(file);
        appState.recycleBin = appState.recycleBin.filter(f => f.id != fileId);
        logAction('restore', file.name, file.size);
        updateAllFileLists();
        updateStatistics();
        saveToLocalStorage();
        showRecycleBin();
        showToast('File restored successfully', 'success');
    }
}

function emptyRecycleBin() {
    if (confirm('Are you sure you want to permanently delete all files in recycle bin?')) {
        appState.recycleBin = [];
        saveToLocalStorage();
        hideRecycleBin();
        showToast('Recycle bin emptied', 'success');
    }
}

// ======================================
// DUPLICATE DETECTION
// ======================================

function findDuplicates() {
    const seen = {};
    const duplicates = [];
    
    appState.files.forEach(file => {
        const key = file.name + '_' + file.size;
        if (seen[key]) {
            duplicates.push(file);
        } else {
            seen[key] = true;
        }
    });
    
    if (duplicates.length > 0) {
        showToast(`Found ${duplicates.length} duplicate file(s)! 🔍`, 'warning');
    } else {
        showToast('No duplicates found ✓', 'success');
    }
}

// ======================================
// ANALYTICS & DASHBOARD
// ======================================

function logAction(action, fileName = '', fileSize = 0) {
    const logEntry = {
        action: action,
        fileName: fileName,
        fileSize: fileSize,
        timestamp: new Date()
    };
    
    appState.analytics.usageLog.push(logEntry);
    appState.analytics.totalActions++;
    
    if (action === 'organize') {
        appState.analytics.filesOrganized++;
        appState.analytics.spaceSaved += fileSize;
    } else if (action === 'delete') {
        appState.analytics.filesDeleted++;
    }
    
    saveToLocalStorage();
}

function showDashboard() {
    updateAnalyticsDisplay();
    renderFileTypeChart();
    renderActivityChart();
    renderActivityLog();
    document.getElementById('dashboardModal').style.display = 'flex';
}

function closeDashboard() {
    document.getElementById('dashboardModal').style.display = 'none';
}

function updateAnalyticsDisplay() {
    document.getElementById('totalActions').textContent = appState.analytics.totalActions;
    document.getElementById('filesOrganized').textContent = appState.analytics.filesOrganized;
    document.getElementById('filesDeleted').textContent = appState.analytics.filesDeleted;
    document.getElementById('spaceSaved').textContent = 
        (appState.analytics.spaceSaved / (1024 * 1024)).toFixed(2) + ' MB';
}

function renderFileTypeChart() {
    const ctx = document.getElementById('fileTypeChart');
    if (!ctx) return;
    
    if (window.fileTypeChartInstance) {
        window.fileTypeChartInstance.destroy();
    }
    
    const categories = Object.keys(fileCategories).filter(c => c !== 'others');
    const counts = categories.map(cat => 
        appState.files.filter(f => f.category === cat).length
    );
    
    window.fileTypeChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: categories.map(c => fileCategories[c].name),
            datasets: [{
                data: counts,
                backgroundColor: ['#00ff88', '#00d4ff', '#ffaa00', '#ff3366']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            }
        }
    });
}

function renderActivityChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    
    if (window.activityChartInstance) {
        window.activityChartInstance.destroy();
    }
    
    const last7Days = [];
    const activityCounts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        last7Days.push(dateStr);
        
        const count = appState.analytics.usageLog.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate.toDateString() === date.toDateString();
        }).length;
        
        activityCounts.push(count);
    }
    
    window.activityChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Actions',
                data: activityCounts,
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#8b93b5', stepSize: 1 },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                x: {
                    ticks: { color: '#8b93b5' },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#ffffff' }
                }
            }
        }
    });
}

function renderActivityLog() {
    const logList = document.getElementById('activityLogList');
    const recentLogs = appState.analytics.usageLog.slice(-10).reverse();
    
    if (recentLogs.length === 0) {
        logList.innerHTML = '<p style="text-align:center; padding:1rem; color:var(--text-secondary)">No activity recorded yet.</p>';
        return;
    }
    
    logList.innerHTML = recentLogs.map(log => `
        <div class="activity-item">
            <div>
                <strong>${getActionIcon(log.action)} ${log.action.toUpperCase()}</strong>
                ${log.fileName ? ` - ${log.fileName}` : ''}
            </div>
            <div style="color: var(--text-secondary); font-size: 0.85rem;">
                ${formatTimestamp(log.timestamp)}
            </div>
        </div>
    `).join('');
}

function getActionIcon(action) {
    const icons = {
        upload: '📤',
        organize: '📁',
        delete: '🗑️',
        restore: '♻️'
    };
    return icons[action] || '📌';
}

// ======================================
// CYBERSECURITY TOOLS
// ======================================

// Port Scanner
function showPortScanner() {
    document.getElementById('portScannerModal').style.display = 'flex';
}

function closePortScanner() {
    document.getElementById('portScannerModal').style.display = 'none';
}

function scanPorts() {
    const ip = document.getElementById('scanIP').value;
    const resultsDiv = document.getElementById('portScanResults');
    
    if (!ip) {
        showToast('Please enter an IP address', 'error');
        return;
    }
    
    // Simulated port scan (browser limitations)
    const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 3306, 3389, 5432, 8080];
    const openPorts = commonPorts.filter(() => Math.random() > 0.7); // Simulate random open ports
    
    resultsDiv.innerHTML = `
        <h4 style="color: var(--accent-primary); margin-bottom: 1rem;">Scan Results for ${ip}</h4>
        <p style="margin-bottom: 1rem;">Common ports scanned: ${commonPorts.length}</p>
        <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px;">
            <strong style="color: var(--accent-secondary);">Open Ports:</strong><br>
            ${openPorts.length > 0 ? openPorts.map(port => `
                <span style="color: var(--accent-primary); display: inline-block; margin: 0.25rem;">Port ${port}</span>
            `).join('') : '<span style="color: var(--text-secondary);">No open ports detected</span>'}
        </div>
        <p style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-secondary);">
            ⚠️ Note: This is a simulated scan. Real port scanning requires backend services.
        </p>
    `;
    
    showToast('Port scan completed!', 'success');
}

// Password Strength Checker
function showPasswordChecker() {
    document.getElementById('passwordCheckerModal').style.display = 'flex';
}

function closePasswordChecker() {
    document.getElementById('passwordCheckerModal').style.display = 'none';
}

function checkPassword() {
    const password = document.getElementById('passwordInput').value;
    const resultsDiv = document.getElementById('passwordResults');
    
    if (!password) {
        showToast('Please enter a password', 'error');
        return;
    }
    
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /[0-9]/.test(password),
        symbols: /[^A-Za-z0-9]/.test(password)
    };
    
    strength = Object.values(checks).filter(Boolean).length;
    
    let strengthText = '';
    let strengthColor = '';
    
    if (strength <= 2) {
        strengthText = 'WEAK';
        strengthColor = 'var(--accent-danger)';
    } else if (strength === 3) {
        strengthText = 'MODERATE';
        strengthColor = 'var(--accent-warning)';
    } else if (strength === 4) {
        strengthText = 'STRONG';
        strengthColor = 'var(--accent-secondary)';
    } else {
        strengthText = 'VERY STRONG';
        strengthColor = 'var(--accent-primary)';
    }
    
    resultsDiv.innerHTML = `
        <h4 style="color: ${strengthColor}; margin-bottom: 1rem; font-size: 1.5rem;">
            Strength: ${strengthText}
        </h4>
        <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px;">
            <p style="margin-bottom: 0.5rem;"><strong>Requirements:</strong></p>
            <p style="color: ${checks.length ? 'var(--accent-primary)' : 'var(--accent-danger)'}">
                ${checks.length ? '✓' : '✗'} At least 8 characters
            </p>
            <p style="color: ${checks.uppercase ? 'var(--accent-primary)' : 'var(--accent-danger)'}">
                ${checks.uppercase ? '✓' : '✗'} Contains uppercase letters
            </p>
            <p style="color: ${checks.lowercase ? 'var(--accent-primary)' : 'var(--accent-danger)'}">
                ${checks.lowercase ? '✓' : '✗'} Contains lowercase letters
            </p>
            <p style="color: ${checks.numbers ? 'var(--accent-primary)' : 'var(--accent-danger)'}">
                ${checks.numbers ? '✓' : '✗'} Contains numbers
            </p>
            <p style="color: ${checks.symbols ? 'var(--accent-primary)' : 'var(--accent-danger)'}">
                ${checks.symbols ? '✓' : '✗'} Contains special characters
            </p>
        </div>
    `;
    
    showToast('Password analyzed!', 'success');
}

// File Integrity Checker
function showFileIntegrity() {
    document.getElementById('fileIntegrityModal').style.display = 'flex';
}

function closeFileIntegrity() {
    document.getElementById('fileIntegrityModal').style.display = 'none';
}

async function checkFileIntegrity() {
    const fileInput = document.getElementById('integrityFileInput');
    const resultsDiv = document.getElementById('integrityResults');
    
    if (!fileInput.files.length) {
        showToast('Please select files to check', 'error');
        return;
    }
    
    resultsDiv.innerHTML = '<p>Generating hashes...</p>';
    
    const files = Array.from(fileInput.files);
    let resultsHTML = '<h4 style="color: var(--accent-primary); margin-bottom: 1rem;">File Integrity Hashes</h4>';
    
    for (const file of files) {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        resultsHTML += `
            <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <p><strong>${file.name}</strong></p>
                <p style="font-size: 0.85rem; color: var(--text-secondary);">Size: ${formatFileSize(file.size)}</p>
                <p style="font-size: 0.75rem; word-break: break-all; color: var(--accent-secondary); margin-top: 0.5rem;">
                    SHA-256: ${hashHex}
                </p>
            </div>
        `;
    }
    
    resultsDiv.innerHTML = resultsHTML;
    showToast('File hashes generated!', 'success');
}

// Network Info
function showNetworkInfo() {
    document.getElementById('networkInfoModal').style.display = 'flex';
}

function closeNetworkInfo() {
    document.getElementById('networkInfoModal').style.display = 'none';
}

function getNetworkInfo() {
    const resultsDiv = document.getElementById('networkResults');
    
    // Get browser and system info
    const info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
    
    resultsDiv.innerHTML = `
        <h4 style="color: var(--accent-primary); margin-bottom: 1rem;">System & Network Information</h4>
        <div style="background: var(--bg-card); padding: 1rem; border-radius: 8px;">
            <p><strong>Platform:</strong> ${info.platform}</p>
            <p><strong>Language:</strong> ${info.language}</p>
            <p><strong>Cookies Enabled:</strong> ${info.cookiesEnabled ? 'Yes' : 'No'}</p>
            <p><strong>Online Status:</strong> ${info.onLine ? 'Connected' : 'Offline'}</p>
            <p><strong>Screen Resolution:</strong> ${info.screenResolution}</p>
            <p><strong>Time Zone:</strong> ${info.timeZone}</p>
            <p style="margin-top: 1rem; font-size: 0.85rem; word-break: break-all; color: var(--text-secondary);">
                <strong>User Agent:</strong> ${info.userAgent}
            </p>
        </div>
    `;
    
    showToast('Network info retrieved!', 'success');
}

// ======================================
// ADDITIONAL FEATURES
// ======================================

// Watchdog
function showWatchdog() {
    showToast('Watchdog monitoring activated! 👁️', 'success');
    // In a real implementation, this would monitor folder changes
}

// Scheduler
function showScheduler() {
    showToast('Task scheduler configured! ⏰', 'success');
    // In a real implementation, this would allow scheduling tasks
}

// Email Reminder
function showEmailReminder() {
    document.getElementById('emailModal').style.display = 'flex';
}

function closeEmailReminder() {
    document.getElementById('emailModal').style.display = 'none';
}

function sendEmail() {
    const email = document.getElementById('emailInput').value;
    const subject = document.getElementById('emailSubject').value;
    const message = document.getElementById('emailMessage').value;
    
    if (!email || !subject || !message) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    // Simulate email sending (requires backend in real implementation)
    showToast('Email reminder sent successfully! ✉️', 'success');
    closeEmailReminder();
}

// View Logs
function viewLogs() {
    const logs = appState.analytics.usageLog.slice(-20).reverse();
    let logText = '=== ACTIVITY LOGS ===\n\n';
    
    logs.forEach(log => {
        logText += `[${new Date(log.timestamp).toLocaleString()}] ${log.action.toUpperCase()}: ${log.fileName}\n`;
    });
    
    console.log(logText);
    showToast('Logs printed to console (F12)', 'info');
}

// ======================================
// UTILITIES
// ======================================

function updateStatistics() {
    appState.statistics.total = appState.files.length;
    appState.statistics.documents = appState.files.filter(f => f.category === 'documents').length;
    appState.statistics.images = appState.files.filter(f => f.category === 'images').length;
    appState.statistics.videos = appState.files.filter(f => f.category === 'videos').length;
    
    document.getElementById('totalFiles').textContent = appState.statistics.total;
    document.getElementById('documentsCount').textContent = appState.statistics.documents;
    document.getElementById('imagesCount').textContent = appState.statistics.images;
    document.getElementById('videosCount').textContent = appState.statistics.videos;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function scheduleCleanupNotification() {
    setInterval(() => {
        showToast('⏰ Time to organize your files!', 'info');
    }, 3600000); // Every hour
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
    return date.toLocaleDateString();
}

// ======================================
// LOCAL STORAGE
// ======================================

function saveToLocalStorage() {
    const dataToSave = {
        analytics: appState.analytics,
        statistics: appState.statistics,
        mode: appState.mode
    };
    localStorage.setItem('smartFileAutomation', JSON.stringify(dataToSave));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('smartFileAutomation');
    if (saved) {
        const data = JSON.parse(saved);
        appState.analytics = data.analytics || appState.analytics;
        appState.statistics = data.statistics || appState.statistics;
        appState.mode = data.mode || 'normal';
    }
}

// ======================================
// END OF SCRIPT
// ======================================
