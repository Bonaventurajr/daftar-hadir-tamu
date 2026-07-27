(function() {
    'use strict';

    // ----- DOM refs -----
    const form = document.getElementById('guestForm');
    const namaInput = document.getElementById('nama');
    const institusiInput = document.getElementById('institusi');
    const tanggalInput = document.getElementById('tanggal');
    const jamInput = document.getElementById('jam');
    const keperluanInput = document.getElementById('keperluan');
    const tableBody = document.getElementById('tableBody');
    const totalSpan = document.getElementById('totalCount');

    // ----- State -----
    let guests = [];

    // ----- Helper: set default date & time -----
    function setDefaults() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        tanggalInput.value = `${year}-${month}-${day}`;

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        jamInput.value = `${hours}:${minutes}`;
    }

    // ----- Escaping sederhana -----
    function escHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        });
    }

    // ----- Render tabel -----
    function renderTable() {
        if (guests.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        <div class="empty-state">
                            <i class="fas fa-inbox"></i>
                            <p>Belum ada tamu yang terdaftar.</p>
                        </div>
                    </td>
                </tr>
            `;
            totalSpan.textContent = '0';
            return;
        }

        let html = '';
        guests.forEach((g, index) => {
            const no = index + 1;
            let purposeClass = 'other';
            const purposeLower = g.keperluan.toLowerCase();
            if (purposeLower.includes('kerja') || purposeLower.includes('bisnis') || purposeLower.includes('rapat')) {
                purposeClass = 'work';
            } else if (purposeLower.includes('pribadi') || purposeLower.includes('keluarga') || purposeLower.includes('sosial')) {
                purposeClass = 'personal';
            }

            html += `
                <tr class="row-pop">
                    <td>${no}</td>
                    <td><strong style="color:#fff;">${escHtml(g.nama)}</strong></td>
                    <td>${escHtml(g.tanggal)}</td>
                    <td>${escHtml(g.jam)}</td>
                    <td>${escHtml(g.institusi) || '—'}</td>
                    <td><span class="badge-purpose ${purposeClass}">${escHtml(g.keperluan)}</span></td>
                    <td style="text-align:center;">
                        <button class="action-delete" data-index="${index}" title="Hapus">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        totalSpan.textContent = guests.length;

        // event listener hapus per tombol
        document.querySelectorAll('.action-delete').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const idx = parseInt(this.dataset.index, 10);
                if (!isNaN(idx)) {
                    deleteGuest(idx);
                }
            });
        });
    }

    // ----- Tambah tamu -----
    function addGuest(event) {
        event.preventDefault();

        const nama = namaInput.value.trim();
        const institusi = institusiInput.value.trim();
        const tanggal = tanggalInput.value;
        const jam = jamInput.value;
        const keperluan = keperluanInput.value.trim();

        if (!nama) {
            alert('⚠️ Nama lengkap wajib diisi.');
            namaInput.focus();
            return;
        }
        if (!tanggal) {
            alert('⚠️ Tanggal berkunjung wajib diisi.');
            tanggalInput.focus();
            return;
        }
        if (!jam) {
            alert('⚠️ Jam berkunjung wajib diisi.');
            jamInput.focus();
            return;
        }
        if (!keperluan) {
            alert('⚠️ Keperluan wajib diisi.');
            keperluanInput.focus();
            return;
        }

        const newGuest = {
            nama,
            institusi,
            tanggal,
            jam,
            keperluan
        };

        guests.push(newGuest);
        renderTable();

        form.reset();
        setDefaults();
        namaInput.focus();

        document.querySelector('.table-wrapper').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // ----- Hapus tamu -----
    function deleteGuest(index) {
        if (index < 0 || index >= guests.length) return;
        const confirmed = confirm(`Hapus data tamu "${guests[index].nama}"?`);
        if (!confirmed) return;
        guests.splice(index, 1);
        renderTable();
    }

    // ----- Reset form -----
    function resetForm() {
        form.reset();
        setDefaults();
        namaInput.focus();
    }

    // ----- Data contoh -----
    function loadSampleData() {
        const sample = [{
            nama: 'Dr. Sarah Wijaya',
            institusi: 'Universitas Indonesia',
            tanggal: '2026-07-23',
            jam: '09:30',
            keperluan: 'Rapat koordinasi riset'
        }, {
            nama: 'Budi Santoso',
            institusi: 'PT. Tech Inovasi',
            tanggal: '2026-07-23',
            jam: '11:00',
            keperluan: 'Presentasi produk baru'
        }, {
            nama: 'Maya Permata',
            institusi: 'Kementerian Pendidikan',
            tanggal: '2026-07-22',
            jam: '14:15',
            keperluan: 'Kunjungan kerjasama'
        }];
        guests = sample;
        renderTable();
    }

    // ----- Event listeners -----
    form.addEventListener('submit', addGuest);
    document.getElementById('resetBtn').addEventListener('click', function(e) {
        e.preventDefault();
        resetForm();
    });

    // ----- Start -----
    setDefaults();
    loadSampleData();
    namaInput.focus();

})();