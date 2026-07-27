(function() {
    'use strict';

    // DOM refs
    const form = document.getElementById('guestForm');
    const namaInput = document.getElementById('nama');
    const institusiInput = document.getElementById('institusi');
    const tanggalInput = document.getElementById('tanggal');
    const jamInput = document.getElementById('jam');
    const keperluanInput = document.getElementById('keperluan');
    const tableBody = document.getElementById('tableBody');
    const totalSpan = document.getElementById('totalCount');

    // State
    let guests = [];
    let isLoading = false;

    // Collection reference
    const guestsCollection = db.collection('tamu');

    // Set default date & time
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

    // Escape HTML
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

    // Render table
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
                        <button class="action-delete" data-id="${g.id}" title="Hapus">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        totalSpan.textContent = guests.length;

        // Delete buttons
        document.querySelectorAll('.action-delete').forEach(btn => {
            btn.addEventListener('click', function(e) {
                const id = this.dataset.id;
                if (id) {
                    deleteGuest(id);
                }
            });
        });
    }

    // ----- LISTEN DATA REAL-TIME DARI FIRESTORE -----
    function listenGuests() {
        if (isLoading) return;
        isLoading = true;

        guestsCollection
            .orderBy('tanggal', 'desc')
            .orderBy('jam', 'desc')
            .onSnapshot((snapshot) => {
                guests = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    guests.push({
                        id: doc.id,
                        nama: data.nama || '',
                        institusi: data.institusi || '',
                        tanggal: data.tanggal || '',
                        jam: data.jam || '',
                        keperluan: data.keperluan || ''
                    });
                });
                renderTable();
                isLoading = false;
            }, (error) => {
                console.error('❌ Error listening to Firestore:', error);
                isLoading = false;
                alert('⚠️ Gagal terhubung ke database. Periksa koneksi internet Anda.');
            });
    }

    // ----- TAMBAH TAMU KE FIRESTORE -----
    async function addGuest(event) {
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

        try {
            // Tampilkan indikator loading pada tombol
            const saveBtn = document.getElementById('saveBtn');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
            saveBtn.disabled = true;

            // Simpan ke Firestore
            await guestsCollection.add({
                nama: nama,
                institusi: institusi,
                tanggal: tanggal,
                jam: jam,
                keperluan: keperluan,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Reset form
            form.reset();
            setDefaults();
            namaInput.focus();

            // Kembalikan tombol
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;

            // Scroll ke tabel
            document.querySelector('.table-wrapper').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } catch (error) {
            console.error('❌ Error adding guest:', error);
            alert('⚠️ Gagal menyimpan data. Periksa koneksi internet Anda.');
            
            const saveBtn = document.getElementById('saveBtn');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Simpan';
            saveBtn.disabled = false;
        }
    }

    // ----- HAPUS TAMU DARI FIRESTORE -----
    async function deleteGuest(id) {
        const guestToDelete = guests.find(g => g.id === id);
        if (!guestToDelete) return;

        const confirmed = confirm(`Hapus data tamu "${guestToDelete.nama}"?`);
        if (!confirmed) return;

        try {
            await guestsCollection.doc(id).delete();
            // Data akan otomatis terhapus dari UI karena listener real-time
        } catch (error) {
            console.error('❌ Error deleting guest:', error);
            alert('⚠️ Gagal menghapus data. Periksa koneksi internet Anda.');
        }
    }

    // ----- RESET FORM -----
    function resetForm() {
        form.reset();
        setDefaults();
        namaInput.focus();
    }

    // ----- EVENT LISTENERS -----
    form.addEventListener('submit', addGuest);
    document.getElementById('resetBtn').addEventListener('click', function(e) {
        e.preventDefault();
        resetForm();
    });

    // ----- START -----
    setDefaults();
    
    // Mulai listen data dari Firestore
    listenGuests();
    
    namaInput.focus();

    console.log('🔥 Aplikasi Daftar Hadir Tamu terhubung ke Firebase!');

})();