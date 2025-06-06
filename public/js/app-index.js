import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const formTransaksi = document.getElementById("formTransaksi");
const pilihBarang = document.getElementById("pilihBarang");
const jumlahBarang = document.getElementById("jumlahBarang");
const daftarTransaksi = document.getElementById("daftarTransaksi");
const btnExport = document.getElementById("btnExport");

let dataBarang = [];

// Isi dropdown
async function isiDropdownBarang() {
  const snapshot = await getDocs(collection(db, "barang"));
  dataBarang = [];
  pilihBarang.innerHTML = '<option value="">-- Pilih Barang --</option>';
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    dataBarang.push({ id: docSnap.id, ...data });
    pilihBarang.innerHTML += `<option value="${docSnap.id}">${data.nama} - Rp${data.harga}</option>`;
  });
}

// Simpan transaksi
formTransaksi?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const barangId = pilihBarang.value;
  const jumlah = parseInt(jumlahBarang.value);

  const barang = dataBarang.find(b => b.id === barangId);
  if (!barang) return;

  const total = barang.harga * jumlah;

  await addDoc(collection(db, "penjualan"), {
    barangId,
    namaBarang: barang.nama,
    harga: barang.harga,
    jumlah,
    total,
    timestamp: Timestamp.now()
  });

  formTransaksi.reset();
  tampilkanTransaksiHariIni();
});

// Tampilkan transaksi hari ini
async function tampilkanTransaksiHariIni() {
  daftarTransaksi.innerHTML = "";
  const now = new Date();
  const awal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const akhir = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const q = query(
    collection(db, "penjualan"),
    where("timestamp", ">=", Timestamp.fromDate(awal)),
    where("timestamp", "<", Timestamp.fromDate(akhir))
  );

  const snapshot = await getDocs(q);
  const rows = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const waktu = data.timestamp.toDate().toLocaleTimeString();
    const tr = document.createElement("tr");
    tr.className = "border-b";
    tr.innerHTML = `
      <td class="px-4 py-2">${waktu}</td>
      <td class="px-4 py-2">${data.namaBarang}</td>
      <td class="px-4 py-2">${data.jumlah}</td>
      <td class="px-4 py-2">Rp${data.total}</td>
    `;
    daftarTransaksi.appendChild(tr);
    rows.push({ Waktu: waktu, Barang: data.namaBarang, Jumlah: data.jumlah, Total: data.total });
  });

  if (btnExport && rows.length > 0) {
    btnExport.classList.remove("hidden");
    btnExport.onclick = () => exportToExcel(rows);
  } else if (btnExport) {
    btnExport.classList.add("hidden");
  }
}

// Export Excel
function exportToExcel(data) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "PenjualanHarian");
  XLSX.writeFile(workbook, "penjualan-harian.xlsx");
}

// Inisialisasi
window.onload = async () => {
  await isiDropdownBarang();
  await tampilkanTransaksiHariIni();
};
