// ========================================
// FUZZY LOGIC SYSTEM - PENILAIAN KEHADIRAN SISWA
// Implementasi Metode Mamdani
// ========================================

/**
 * Class FuzzyLogicSystem - Implementasi Fuzzy Logic Mamdani
 */
class FuzzyLogicSystem {
    constructor() {
        // Define membership functions untuk INPUT (Kehadiran)
        this.inputMF = {
            kurang: { type: 'trapezoid', points: [0, 0, 40, 55] },
            cukup: { type: 'triangle', points: [40, 55, 70] },
            baik: { type: 'triangle', points: [55, 70, 85] },
            sangatBaik: { type: 'trapezoid', points: [70, 85, 100, 100] }
        };

        // Define membership functions untuk OUTPUT (Nilai/Score)
        this.outputMF = {
            kurang: { type: 'trapezoid', points: [0, 0, 40, 55] },
            cukup: { type: 'triangle', points: [40, 55, 70] },
            baik: { type: 'triangle', points: [55, 70, 85] },
            sangatBaik: { type: 'trapezoid', points: [70, 85, 100, 100] }
        };

        // Fuzzy Rules
        this.rules = [
            { input: 'kurang', output: 'kurang' },
            { input: 'cukup', output: 'cukup' },
            { input: 'baik', output: 'baik' },
            { input: 'sangatBaik', output: 'sangatBaik' }
        ];
    }

    /**
     * Trapezoid membership function
     */
    trapezoid(x, a, b, c, d) {
        if (x < a || x > d) return 0;
        if (x >= b && x <= c) return 1;
        if (x >= a && x < b) {
            if (b === a) return 1; // Handle kasus a = b
            return (x - a) / (b - a);
        }
        if (x > c && x <= d) {
            if (d === c) return 1; // Handle kasus c = d
            return (d - x) / (d - c);
        }
        return 0;
    }

    /**
     * Triangle membership function
     */
    triangle(x, a, b, c) {
        if (x < a || x > c) return 0;
        if (x === b) return 1;
        if (x >= a && x < b) {
            if (b === a) return 0;
            return (x - a) / (b - a);
        }
        if (x > b && x <= c) {
            if (c === b) return 0;
            return (c - x) / (c - b);
        }
        return 0;
    }

    /**
     * Calculate membership degree
     */
    getMembership(value, mfDefinition) {
        if (mfDefinition.type === 'trapezoid') {
            const [a, b, c, d] = mfDefinition.points;
            return this.trapezoid(value, a, b, c, d);
        } else if (mfDefinition.type === 'triangle') {
            const [a, b, c] = mfDefinition.points;
            return this.triangle(value, a, b, c);
        }
        return 0;
    }

    /**
     * STEP 1: Fuzzification - Convert crisp input to fuzzy sets
     */
    fuzzify(attendance) {
        return {
            kurang: this.getMembership(attendance, this.inputMF.kurang),
            cukup: this.getMembership(attendance, this.inputMF.cukup),
            baik: this.getMembership(attendance, this.inputMF.baik),
            sangatBaik: this.getMembership(attendance, this.inputMF.sangatBaik)
        };
    }

    /**
     * STEP 2: Rule Evaluation
     */
    evaluateRules(memberships) {
        const activatedRules = [];

        this.rules.forEach(rule => {
            const strength = memberships[rule.input];
            if (strength > 0) {
                activatedRules.push({
                    rule: rule,
                    strength: strength,
                    output: rule.output
                });
            }
        });

        return activatedRules;
    }

    /**
     * STEP 3: Aggregation - Combine outputs using MAX operator
     */
    aggregate(activatedRules) {
        const aggregated = {};

        ['kurang', 'cukup', 'baik', 'sangatBaik'].forEach(category => {
            const rulesForCategory = activatedRules.filter(r => r.output === category);
            if (rulesForCategory.length > 0) {
                aggregated[category] = Math.max(...rulesForCategory.map(r => r.strength));
            } else {
                aggregated[category] = 0;
            }
        });

        return aggregated;
    }

    /**
     * STEP 4: Defuzzification - Convert fuzzy output to crisp value using Centroid method
     */
    defuzzify(aggregated) {
        const resolution = 200;
        let numerator = 0;
        let denominator = 0;

        for (let i = 0; i <= resolution; i++) {
            const x = (100 / resolution) * i;
            
            const kurangMembership = Math.min(
                aggregated.kurang || 0,
                this.getMembership(x, this.outputMF.kurang)
            );
            const cukupMembership = Math.min(
                aggregated.cukup || 0,
                this.getMembership(x, this.outputMF.cukup)
            );
            const baikMembership = Math.min(
                aggregated.baik || 0,
                this.getMembership(x, this.outputMF.baik)
            );
            const sangatBaikMembership = Math.min(
                aggregated.sangatBaik || 0,
                this.getMembership(x, this.outputMF.sangatBaik)
            );

            const y = Math.max(kurangMembership, cukupMembership, baikMembership, sangatBaikMembership);

            numerator += x * y;
            denominator += y;
        }

        return denominator === 0 ? 0 : numerator / denominator;
    }

    /**
     * Main inference method - Complete Fuzzy Logic Process
     */
    infer(attendance) {
        // Step 1: Fuzzification
        const memberships = this.fuzzify(attendance);

        // Step 2: Rule Evaluation
        const activatedRules = this.evaluateRules(memberships);

        // Step 3: Aggregation
        const aggregated = this.aggregate(activatedRules);

        // Step 4: Defuzzification
        const crispOutput = this.defuzzify(aggregated);

        return {
            input: attendance,
            memberships: memberships,
            activatedRules: activatedRules,
            aggregated: aggregated,
            crispOutput: crispOutput
        };
    }
}

/**
 * Fungsi untuk menentukan predikat berdasarkan hasil fuzzy
 */
function determinePredicate(fuzzyResult) {
    const score = fuzzyResult.crispOutput;
    let predicate = '';
    let color = '';
    let bgClass = '';
    let description = '';
    
    if (score >= 85) {
        predicate = 'SANGAT BAIK';
        color = 'success';
        bgClass = 'bg-success';
        description = 'Kehadiran sangat baik! Siswa menunjukkan kedisiplinan yang luar biasa.';
    } else if (score >= 70) {
        predicate = 'BAIK';
        color = 'primary';
        bgClass = 'bg-primary';
        description = 'Kehadiran baik. Siswa cukup disiplin dan konsisten dalam menghadiri kelas.';
    } else if (score >= 55) {
        predicate = 'CUKUP';
        color = 'warning';
        bgClass = 'bg-warning text-dark';
        description = 'Kehadiran cukup. Siswa perlu meningkatkan kedisiplinan dan konsistensi kehadiran.';
    } else {
        predicate = 'KURANG';
        color = 'danger';
        bgClass = 'bg-danger';
        description = 'Kehadiran kurang. Siswa harus segera memperbaiki tingkat kehadiran untuk menghindari masalah akademik.';
    }
    
    return {
        predicate: predicate,
        color: color,
        bgClass: bgClass,
        description: description,
        score: score,
        fuzzyDetails: fuzzyResult
    };
}

/**
 * Fungsi untuk memvalidasi input kehadiran
 * @param {number} value - Nilai input
 * @returns {object} - Status validasi dan pesan error
 */
function validateAttendance(value) {
    if (value === '' || value === null || value === undefined) {
        return {
            valid: false,
            message: 'Nilai kehadiran tidak boleh kosong!'
        };
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
        return {
            valid: false,
            message: 'Nilai kehadiran harus berupa angka!'
        };
    }
    
    if (numValue < 0 || numValue > 100) {
        return {
            valid: false,
            message: 'Nilai kehadiran harus berada dalam rentang 0-100!'
        };
    }
    
    return {
        valid: true,
        value: numValue
    };
}

/**
 * Fungsi untuk menampilkan hasil penilaian
 * @param {object} result - Hasil perhitungan fuzzy logic
 */
function displayResult(result) {
    // Update persentase
    document.getElementById('percentageDisplay').textContent = result.fuzzyDetails.input.toFixed(1) + '%';
    
    // Update score fuzzy
    if (document.getElementById('fuzzyScore')) {
        document.getElementById('fuzzyScore').textContent = result.score.toFixed(2);
    }
    
    // Update predikat badge
    const predicateBadge = document.getElementById('predicateBadge');
    predicateBadge.textContent = result.predicate;
    predicateBadge.className = 'badge badge-result ' + result.bgClass;
    
    // Update deskripsi
    document.getElementById('descriptionText').textContent = result.description;
    
    // Tampilkan detail fuzzy logic
    displayFuzzyDetails(result.fuzzyDetails);
    
    // Tampilkan chart
    displayMembershipChart(result.fuzzyDetails);
    displayComparisonChart(result.fuzzyDetails);
    
    // Simpan ke riwayat
    saveToHistory(result);
    
    // Tampilkan section hasil dengan animasi
    const resultCard = document.querySelector('.result-card');
    resultCard.style.display = 'block';
    
    // Scroll ke hasil
    setTimeout(() => {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

/**
 * Fungsi untuk menampilkan chart membership function
 */
function displayMembershipChart(fuzzyDetails) {
    const canvas = document.getElementById('membershipChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const input = fuzzyDetails.input;
    
    // Generate data untuk chart
    const labels = [];
    const kurangData = [];
    const cukupData = [];
    const baikData = [];
    const sangatBaikData = [];
    
    // Sampling dengan resolusi tinggi
    for (let i = 0; i <= 100; i += 2) {
        labels.push(i);
        
        // Hitung membership degree untuk setiap kategori
        const mf = calculateMemberships(i, window.fuzzySystem);
        kurangData.push(mf.kurang * 100);
        cukupData.push(mf.cukup * 100);
        baikData.push(mf.baik * 100);
        sangatBaikData.push(mf.sangatBaik * 100);
    }
    
    // Destroy chart lama jika ada
    if (window.membershipChartInstance) {
        window.membershipChartInstance.destroy();
    }
    
    // Create chart baru
    window.membershipChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'KURANG',
                    data: kurangData,
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: 'CUKUP',
                    data: cukupData,
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: 'BAIK',
                    data: baikData,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: 'SANGAT BAIK',
                    data: sangatBaikData,
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 6
                },
                {
                    label: 'Input (' + input.toFixed(0) + '%)',
                    data: Array(labels.length).fill(null),
                    borderColor: '#000',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 0,
                    showLine: true,
                    xAxisID: 'x'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15
                    }
                },
                annotation: {
                    drawTime: 'afterDatasetsDraw'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Derajat Keanggotaan (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Nilai Kehadiran (%)'
                    }
                }
            }
        }
    });
}

/**
 * Fungsi untuk menampilkan comparison chart
 */
function displayComparisonChart(fuzzyDetails) {
    const canvas = document.getElementById('comparisonChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const memberships = fuzzyDetails.memberships;
    
    // Destroy chart lama jika ada
    if (window.comparisonChartInstance) {
        window.comparisonChartInstance.destroy();
    }
    
    // Create chart baru
    window.comparisonChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['KURANG', 'CUKUP', 'BAIK', 'SANGAT BAIK'],
            datasets: [{
                label: 'Derajat Keanggotaan',
                data: [
                    (memberships.kurang * 100).toFixed(2),
                    (memberships.cukup * 100).toFixed(2),
                    (memberships.baik * 100).toFixed(2),
                    (memberships.sangatBaik * 100).toFixed(2)
                ],
                backgroundColor: [
                    '#dc3545',
                    '#ffc107',
                    '#0d6efd',
                    '#198754'
                ],
                borderColor: [
                    '#dc3545',
                    '#ffc107',
                    '#0d6efd',
                    '#198754'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Persentase (%)'
                    }
                }
            }
        }
    });
}

/**
 * Helper function untuk calculate memberships
 */
function calculateMemberships(value, fuzzySystem) {
    return {
        kurang: fuzzySystem.getMembership(value, fuzzySystem.inputMF.kurang),
        cukup: fuzzySystem.getMembership(value, fuzzySystem.inputMF.cukup),
        baik: fuzzySystem.getMembership(value, fuzzySystem.inputMF.baik),
        sangatBaik: fuzzySystem.getMembership(value, fuzzySystem.inputMF.sangatBaik)
    };
}

/**
 * Fungsi untuk menampilkan detail proses fuzzy logic
 */
function displayFuzzyDetails(fuzzyDetails) {
    const detailsContainer = document.getElementById('fuzzyDetailsContainer');
    if (!detailsContainer) return;
    
    let html = '<div class="fuzzy-process">';
    
    // Step 1: Fuzzification
    html += '<div class="fuzzy-step mb-3">';
    html += '<h6 class="fw-bold">1️⃣ FUZZIFICATION (Derajat Keanggotaan)</h6>';
    html += '<div class="ms-3">';
    for (const [label, value] of Object.entries(fuzzyDetails.memberships)) {
        const percentage = (value * 100).toFixed(1);
        html += `<div class="mb-1">
            <span class="badge bg-secondary">${label.toUpperCase()}</span> 
            <span class="text-muted">μ = ${value.toFixed(4)} (${percentage}%)</span>
        </div>`;
    }
    html += '</div></div>';
    
    // Step 2: Rules
    html += '<div class="fuzzy-step mb-3">';
    html += '<h6 class="fw-bold">2️⃣ RULE EVALUATION (Aturan yang Aktif)</h6>';
    html += '<div class="ms-3">';
    if (fuzzyDetails.activatedRules.length === 0) {
        html += '<p class="text-muted mb-0">Tidak ada aturan yang aktif</p>';
    } else {
        fuzzyDetails.activatedRules.forEach((item, index) => {
            html += `<div class="mb-1">
                <span class="badge bg-dark">${index + 1}</span>
                IF Kehadiran = ${item.rule.input.toUpperCase()} 
                THEN Nilai = ${item.rule.output.toUpperCase()}
                <span class="text-muted">[α = ${item.strength.toFixed(4)}]</span>
            </div>`;
        });
    }
    html += '</div></div>';
    
    // Step 3: Defuzzification
    html += '<div class="fuzzy-step">';
    html += '<h6 class="fw-bold">3️⃣ DEFUZZIFICATION (Metode Centroid)</h6>';
    html += '<div class="ms-3">';
    html += `<p class="mb-0">Nilai Crisp Output: <strong>${fuzzyDetails.crispOutput.toFixed(2)}</strong></p>`;
    html += '</div></div>';
    
    html += '</div>';
    
    detailsContainer.innerHTML = html;
}

/**
 * Fungsi untuk menyimpan ke riwayat
 */
function saveToHistory(result) {
    let history = [];
    
    // Ambil history dari localStorage
    const savedHistory = localStorage.getItem('fuzzyHistory');
    if (savedHistory) {
        history = JSON.parse(savedHistory);
    }
    
    // Tambah item baru
    const historyItem = {
        input: result.fuzzyDetails.input,
        predicate: result.predicate,
        crispOutput: result.score,
        timestamp: new Date().toLocaleTimeString('id-ID'),
        bgClass: result.bgClass
    };
    
    history.unshift(historyItem); // Tambah di awal
    
    // Batasi history hanya 20 item
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    // Simpan ke localStorage
    localStorage.setItem('fuzzyHistory', JSON.stringify(history));
    
    // Update tampilan
    displayHistory();
}

/**
 * Fungsi untuk menampilkan riwayat
 */
function displayHistory() {
    const historyContainer = document.getElementById('historyContainer');
    if (!historyContainer) return;
    
    const savedHistory = localStorage.getItem('fuzzyHistory');
    
    if (!savedHistory || JSON.parse(savedHistory).length === 0) {
        historyContainer.innerHTML = '<p class="text-muted small text-center">Belum ada riwayat perhitungan</p>';
        return;
    }
    
    const history = JSON.parse(savedHistory);
    let html = '';
    
    history.forEach((item, index) => {
        html += `
            <div class="history-item" onclick="loadFromHistory(${item.input})">
                <div class="history-item-value">${item.input.toFixed(1)}%</div>
                <span class="badge ${item.bgClass} history-item-predicate">${item.predicate}</span>
                <div style="font-size: 0.8rem; color: #999; margin-top: 5px;">${item.timestamp}</div>
            </div>
        `;
    });
    
    historyContainer.innerHTML = html;
}

/**
 * Fungsi untuk load dari riwayat
 */
function loadFromHistory(value) {
    document.getElementById('attendance').value = value;
    document.getElementById('attendanceForm').dispatchEvent(new Event('submit'));
}

/**
 * Fungsi untuk clear riwayat
 */
function clearHistory() {
    if (confirm('Yakin ingin menghapus semua riwayat perhitungan?')) {
        localStorage.removeItem('fuzzyHistory');
        displayHistory();
    }
}

/**
 * Fungsi untuk menampilkan pesan error
 * @param {string} message - Pesan error
 */
function showError(message) {
    // Buat alert bootstrap
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show mt-3';
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <strong>Error!</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Tambahkan ke form
    const form = document.getElementById('attendanceForm');
    const existingAlert = form.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    form.appendChild(alertDiv);
    
    // Hapus alert setelah 5 detik
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

/**
 * Fungsi untuk mereset form
 */
function resetForm() {
    document.getElementById('attendanceForm').reset();
    const resultCard = document.querySelector('.result-card');
    resultCard.style.display = 'none';
    
    // Hapus alert jika ada
    const existingAlert = document.querySelector('.alert-danger');
    if (existingAlert) {
        existingAlert.remove();
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('attendanceForm');
    const attendanceInput = document.getElementById('attendance');
    
    // Initialize Fuzzy Logic System
    window.fuzzySystem = new FuzzyLogicSystem();
    
    // Load history on startup
    displayHistory();
    
    // Handle form submit
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const attendanceValue = attendanceInput.value;
        
        // Validasi input
        const validation = validateAttendance(attendanceValue);
        
        if (!validation.valid) {
            showError(validation.message);
            return;
        }
        
        // Jalankan Fuzzy Logic Inference
        const fuzzyResult = window.fuzzySystem.infer(validation.value);
        
        // Tentukan predikat berdasarkan hasil fuzzy
        const result = determinePredicate(fuzzyResult);
        
        // Tampilkan hasil
        displayResult(result);
    });
    
    // Handle input change - hapus error saat user mulai mengetik
    attendanceInput.addEventListener('input', function() {
        const existingAlert = form.querySelector('.alert-danger');
        if (existingAlert) {
            existingAlert.remove();
        }
    });
    
    // Validasi input hanya angka dan titik desimal
    attendanceInput.addEventListener('keypress', function(e) {
        const char = String.fromCharCode(e.which);
        if (!/[\d.]/.test(char)) {
            e.preventDefault();
        }
        
        // Cegah lebih dari satu titik desimal
        if (char === '.' && this.value.indexOf('.') !== -1) {
            e.preventDefault();
        }
    });
    
    // Batasi input agar tidak melebihi 100
    attendanceInput.addEventListener('blur', function() {
        let value = parseFloat(this.value);
        if (value > 100) {
            this.value = 100;
        }
        if (value < 0) {
            this.value = 0;
        }
    });
    
    // Clear history button
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearHistory);
    }
});

// ========================================
// ANIMASI DAN EFEK TAMBAHAN
// ========================================

// Tambahkan efek hover pada card
document.addEventListener('DOMContentLoaded', function() {
    const mainCard = document.querySelector('.main-card');
    
    mainCard.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.transition = 'transform 0.3s ease';
    });
    
    mainCard.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

console.log('✅ Sistem Fuzzy Logic Mamdani - Penilaian Kehadiran Siswa');
console.log('📊 Metode: Fuzzification → Rule Evaluation → Aggregation → Defuzzification');
console.log('🎯 Membership Functions:');
console.log('   Input: Kurang, Cukup, Baik, Sangat Baik');
console.log('   Output: Kurang (0-55), Cukup (40-70), Baik (55-85), Sangat Baik (70-100)');
console.log('   Defuzzification: Centroid Method');
console.log('✨ Fitur: Visualisasi Chart, Riwayat Perhitungan, Comparison Chart');
