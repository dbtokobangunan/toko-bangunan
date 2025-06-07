// js/app-index.js
import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs";

const formTransaksi = document.getElementById("formTransaksi");
const daftarTransaksi = document.getElementById("daftarTransaksi");
const selectBarang = document.getElementById("pilihBarang");
const btnExport = document.getElementById("btnExport");

// Format ke Rupiah
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(angka);
}

// Muat data barang ke dropdown
async function muatBarangKeDropdown() {
  selectBarang.innerHTML = '<option value="">-- Pilih Barang --</option>';
  const snapshot = await getDocs(collection(db, "barang"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data && data.nama && data.harga !== undefined && data.stok > 0) {
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = `${data.nama} (Stok: ${data.stok})`;
      option.dataset.harga = data.harga;
      selectBarang.appendChild(option);
    }
  });
}

// Tampilkan transaksi hari ini
async function tampilkanTransaksiHariIni() {
  daftarTransaksi.innerHTML = "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const besok = new Date(today);
  besok.setDate(besok.getDate() + 1);

  const querySnapshot = await getDocs(collection(db, "penjualan"));
  const dataExport = [];
  let adaData = false;

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tgl = data.timestamp?.toDate?.();

    if (tgl && tgl >= today && tgl < besok) {
      adaData = true;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-4 py-2">${tgl.toLocaleString()}</td>
        <td class="px-4 py-2">${data.namaBarang || '-'}</td>
        <td class="px-4 py-2">${data.jumlah ?? 0}</td>
        <td class="px-4 py-2">${formatRupiah(data.total)}</td>`;
      daftarTransaksi.appendChild(tr);

      dataExport.push({
        Waktu: tgl.toLocaleString(),
        Barang: data.namaBarang || '-',
        Jumlah: data.jumlah ?? 0,
        Total: data.total
      });
    }
  });

  if (adaData) {
    btnExport.classList.remove("hidden");
    btnExport.onclick = () => exportToExcel(dataExport);
  } else {
    btnExport.classList.add("hidden");
  }
}

// Simpan transaksi
formTransaksi.addEventListener("submit", async (e) => {
  e.preventDefault();
  const barangId = selectBarang.value;
  const jumlah = parseInt(document.getElementById("jumlahBarang").value);

  if (!barangId || isNaN(jumlah) || jumlah <= 0) {
    alert("Silakan pilih barang dan isi jumlah dengan benar.");
    return;
  }

  const barangRef = doc(db, "barang", barangId);
  const barangSnap = await getDoc(barangRef);

  if (!barangSnap.exists()) {
    alert("Barang tidak ditemukan.");
    return;
  }

  const barang = barangSnap.data();
  if (jumlah > barang.stok) {
    alert("Stok tidak cukup.");
    return;
  }

  const total = jumlah * barang.harga;

  await addDoc(collection(db, "penjualan"), {
    barangId,
    namaBarang: barang.nama,
    jumlah,
    harga: barang.harga,
    total,
    timestamp: Timestamp.now()
  });

  await updateDoc(barangRef, {
    stok: barang.stok - jumlah
  });

  alert("Transaksi berhasil disimpan.");
  formTransaksi.reset();
  await muatBarangKeDropdown();
  await tampilkanTransaksiHariIni();
});

// Export Excel
function exportToExcel(data) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "TransaksiHariIni");
  XLSX.writeFile(workbook, "transaksi-harian.xlsx");
}

// Inisialisasi
window.addEventListener("DOMContentLoaded", async () => {
  await muatBarangKeDropdown();
  await tampilkanTransaksiHariIni();
});
