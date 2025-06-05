// js/app-index.js
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

let dataBarang = [];

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
    rows.push({
      Waktu: waktu,
      Barang: data.namaBarang,
      Jumlah: data.jumlah,
      Total: data.total,
    });
  });

  const btnExport = document.getElementById("btnExport");
  if (rows.length > 0) {
    btnExport.classList.remove("hidden");
    btnExport.onclick = () => exportToExcel(rows);
  } else {
    btnExport.classList.add("hidden");
  }
}


// Fungsi export ke Excel
function exportToExcel(data) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "PenjualanHarian");
  XLSX.writeFile(workbook, "penjualan-harian.xlsx");
}


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
  });
}

// Inisialisasi saat halaman dimuat
window.onload = async function () {
  await isiDropdownBarang();
  await tampilkanTransaksiHariIni();
};
