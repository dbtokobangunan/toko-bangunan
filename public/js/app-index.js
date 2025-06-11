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

const formTransaksi = document.getElementById("formTransaksi");
const daftarTransaksi = document.getElementById("daftarTransaksi");
const selectBarang = document.getElementById("pilihBarang");
const btnExport = document.getElementById("btnExport");
const jumlahBarang = document.getElementById("jumlahBarang");
const hargaBarang = document.getElementById("hargaBarang");

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(angka);
}

async function muatBarangKeDropdown() {
  selectBarang.innerHTML = '<option value="">-- Pilih Barang --</option>';
  const snapshot = await getDocs(collection(db, "barang"));
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data && data.nama && data.stok > 0) {
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = `${data.nama} (Stok: ${data.stok})`;
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

formTransaksi.addEventListener("submit", async (e) => {
  e.preventDefault();
  const barangId = selectBarang.value;
  const jumlah = parseInt(jumlahBarang.value);
  const harga = parseInt(hargaBarang.value);

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
  if (jumlah > barang.stok) {
    alert("Stok tidak cukup.");
    return;
  }

  const total = jumlah * harga;

  await addDoc(collection(db, "penjualan"), {
    barangId,
    namaBarang: barang.nama,
    jumlah,
    harga,
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

function exportToExcel(data) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "TransaksiHariIni");
  XLSX.writeFile(workbook, "transaksi-harian.xlsx");
}

window.addEventListener("DOMContentLoaded", async () => {
  await muatBarangKeDropdown();
  await tampilkanTransaksiHariIni();
});
