// js/app-index.js
import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const formTransaksi = document.getElementById("formTransaksi");
const pilihBarang = document.getElementById("pilihBarang");
const jumlahBarang = document.getElementById("jumlahBarang");
const daftarTransaksi = document.getElementById("daftarTransaksi");

let dataBarang = [];

// Tambahkan bar menu navigasi
const navBar = document.createElement("nav");
navBar.className = "bg-white shadow-md py-4 mb-8";
navBar.innerHTML = `
  <div class="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4">
    <a href="index.html" class="text-blue-600 font-semibold hover:underline">Kasir</a>
    <a href="barang.html" class="text-blue-600 font-semibold hover:underline">Data Barang</a>
    <a href="penjualan.html" class="text-blue-600 font-semibold hover:underline">Penjualan</a>
    <a href="pengeluaran.html" class="text-blue-600 font-semibold hover:underline">Pengeluaran</a>
    <a href="profit.html" class="text-blue-600 font-semibold hover:underline">Profit Harian</a>
    <a href="profit-bulanan.html" class="text-blue-600 font-semibold hover:underline">Profit Bulanan</a>
    <a href="stok.html" class="text-blue-600 font-semibold hover:underline">Stok Masuk</a>
  </div>
`;
document.body.prepend(navBar);

// Ambil daftar barang untuk dropdown
async function isiDropdownBarang() {
  const querySnapshot = await getDocs(collection(db, "barang"));
  dataBarang = [];
  pilihBarang.innerHTML = '<option value="">-- Pilih Barang --</option>';
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    dataBarang.push({ id: docSnap.id, ...data });
    pilihBarang.innerHTML += `<option value="${docSnap.id}">${data.nama} - Rp${data.harga}</option>`;
  });
}

// Simpan transaksi penjualan
formTransaksi.addEventListener("submit", async (e) => {
  e.preventDefault();
  const barangId = pilihBarang.value;
  const jumlah = parseInt(jumlahBarang.value);

  const barangDipilih = dataBarang.find(b => b.id === barangId);
  if (!barangDipilih) return;

  if (barangDipilih.stok < jumlah) {
    alert("Stok tidak mencukupi!");
    return;
  }

  const total = barangDipilih.harga * jumlah;

  await addDoc(collection(db, "penjualan"), {
    barangId,
    namaBarang: barangDipilih.nama,
    harga: barangDipilih.harga,
    jumlah,
    total,
    timestamp: Timestamp.now()
  });

  // Kurangi stok barang
  const barangRef = doc(db, "barang", barangId);
  await updateDoc(barangRef, {
    stok: barangDipilih.stok - jumlah
  });

  formTransaksi.reset();
  tampilkanTransaksiHariIni();
  await isiDropdownBarang(); // refresh stok
});

// Tampilkan transaksi hari ini
async function tampilkanTransaksiHariIni() {
  daftarTransaksi.innerHTML = "";
  const now = new Date();
  const awalHari = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const akhirHari = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const q = query(
    collection(db, "penjualan"),
    where("timestamp", ">=", Timestamp.fromDate(awalHari)),
    where("timestamp", "<", Timestamp.fromDate(akhirHari))
  );

  const querySnapshot = await getDocs(q);
  const rows = [];
  querySnapshot.forEach((docSnap) => {
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

  // Tambahkan tombol export
  if (!document.getElementById("btnExport") && rows.length > 0) {
    const btn = document.createElement("button");
    btn.id = "btnExport";
    btn.textContent = "Download Excel";
    btn.className = "mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700";
    btn.onclick = () => exportToExcel(rows);
    daftarTransaksi.parentElement.appendChild(btn);
  }
}

function exportToExcel(data) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "PenjualanHarian");
  XLSX.writeFile(workbook, "penjualan-harian.xlsx");
}

// Inisialisasi saat halaman dimuat
window.onload = async function () {
  await isiDropdownBarang();
  await tampilkanTransaksiHariIni();
};