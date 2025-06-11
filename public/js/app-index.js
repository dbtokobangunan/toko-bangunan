import { db } from './firebase-config.js';
import {
  collection, getDocs, addDoc, doc, getDoc, Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const formTransaksi = document.getElementById("formTransaksi");
const daftarTransaksi = document.getElementById("daftarTransaksi");
const selectBarang = document.getElementById("pilihBarang");
const btnExport = document.getElementById("btnExport");

const jumlahBarang = document.getElementById("jumlahBarang");
const hargaSatuan = document.getElementById("hargaSatuan");
const totalBayar = document.getElementById("totalBayar");
const uangDiterima = document.getElementById("uangDiterima");
const kembalian = document.getElementById("kembalian");

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(angka);
}

async function muatBarangKeDropdown() {
  selectBarang.innerHTML = '<option value="">-- Pilih Barang --</option>';
  const snapshot = await getDocs(collection(db, "barang"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data && data.nama) {
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = data.nama;
      selectBarang.appendChild(option);
    }
  });
}

async function tampilkanTransaksiHariIni() {
  daftarTransaksi.innerHTML = "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const besok = new Date(today);
  besok.setDate(besok.getDate() + 1);

  const snapshot = await getDocs(collection(db, "penjualan"));
  const dataExport = [];
  let adaData = false;

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tgl = data.timestamp?.toDate?.();
    if (tgl >= today && tgl < besok) {
      adaData = true;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="px-4 py-2">${tgl.toLocaleString()}</td>
        <td class="px-4 py-2">${data.namaBarang}</td>
        <td class="px-4 py-2">${data.jumlah}</td>
        <td class="px-4 py-2">${formatRupiah(data.total)}</td>`;
      daftarTransaksi.appendChild(tr);
      dataExport.push({
        Tanggal: tgl.toLocaleString(),
        Barang: data.namaBarang,
        Jumlah: data.jumlah,
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

formTransaksi.addEventListener("submit", async (e) => {
  e.preventDefault();
  const barangId = selectBarang.value;
  const jumlah = parseInt(jumlahBarang.value);
  const harga = parseInt(hargaSatuan.value);

  if (!barangId || isNaN(jumlah) || jumlah <= 0 || isNaN(harga) || harga <= 0) {
    alert("Isi semua data dengan benar.");
    return;
  }

  const barangRef = doc(db, "barang", barangId);
  const barangSnap = await getDoc(barangRef);
  if (!barangSnap.exists()) {
    alert("Barang tidak ditemukan.");
    return;
  }

  const barang = barangSnap.data();
  const total = jumlah * harga;

  await addDoc(collection(db, "penjualan"), {
    barangId,
    namaBarang: barang.nama,
    jumlah,
    harga,
    total,
    timestamp: Timestamp.now()
  });

  alert("Transaksi berhasil disimpan.");
  formTransaksi.reset();
  totalBayar.value = "";
  kembalian.value = "";
  await tampilkanTransaksiHariIni();
});

function exportToExcel(data) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "TransaksiHariIni");
  XLSX.writeFile(workbook, "transaksi-harian.xlsx");
}

function updateTotalBayar() {
  const j = parseInt(jumlahBarang.value);
  const h = parseInt(hargaSatuan.value);
  if (!isNaN(j) && !isNaN(h)) {
    const total = j * h;
    totalBayar.value = formatRupiah(total);
  } else {
    totalBayar.value = "";
  }
}

function updateKembalian() {
  const total = parseInt(jumlahBarang.value) * parseInt(hargaSatuan.value);
  const uang = parseInt(uangDiterima.value);
  if (!isNaN(total) && !isNaN(uang)) {
    const kembali = uang - total;
    kembalian.value = formatRupiah(kembali);
  } else {
    kembalian.value = "";
  }
}

jumlahBarang.addEventListener("input", updateTotalBayar);
hargaSatuan.addEventListener("input", updateTotalBayar);
uangDiterima.addEventListener("input", updateKembalian);

window.addEventListener("DOMContentLoaded", async () => {
  await muatBarangKeDropdown();
  await tampilkanTransaksiHariIni();
});
