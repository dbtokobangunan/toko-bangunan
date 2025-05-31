import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const jenisLaporan = document.getElementById("jenisLaporan");
const tanggalFilter = document.getElementById("tanggalFilter");
const tabelPenjualan = document.getElementById("tabelPenjualan");
const btnExport = document.getElementById("btnExport");

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

window.tampilkanLaporan = async function () {
  const mode = jenisLaporan.value;
  const tanggal = new Date(tanggalFilter.value);
  if (isNaN(tanggal)) return alert("Harap pilih tanggal!");

  let awal, akhir;
  switch (mode) {
    case 'harian':
      awal = new Date(tanggal);
      akhir = new Date(tanggal);
      akhir.setDate(akhir.getDate() + 1);
      break;
    case 'mingguan':
      awal = new Date(tanggal);
      awal.setDate(awal.getDate() - awal.getDay());
      akhir = new Date(awal);
      akhir.setDate(awal.getDate() + 7);
      break;
    case 'bulanan':
      awal = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1);
      akhir = new Date(tanggal.getFullYear(), tanggal.getMonth() + 1, 1);
      break;
    case 'tahunan':
      awal = new Date(tanggal.getFullYear(), 0, 1);
      akhir = new Date(tanggal.getFullYear() + 1, 0, 1);
      break;
  }

  const q = query(
    collection(db, "penjualan"),
    where("timestamp", ">=", Timestamp.fromDate(awal)),
    where("timestamp", "<", Timestamp.fromDate(akhir))
  );

  const snapshot = await getDocs(q);
  let rows = [];
  tabelPenjualan.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    const waktu = data.timestamp.toDate();
    const tanggalStr = waktu.toLocaleDateString("id-ID");
    const row = {
      Tanggal: tanggalStr,
      Barang: data.namaBarang,
      Jumlah: data.jumlah,
      Harga: data.harga,
      Total: data.total
    };
    rows.push(row);

    const tr = document.createElement("tr");
    tr.className = "border-b";
    tr.innerHTML = `
      <td class="px-4 py-2">${tanggalStr}</td>
      <td class="px-4 py-2">${data.namaBarang}</td>
      <td class="px-4 py-2">${data.jumlah}</td>
      <td class="px-4 py-2">Rp${data.harga}</td>
      <td class="px-4 py-2">Rp${data.total}</td>
    `;
    tabelPenjualan.appendChild(tr);
  });

  if (rows.length > 0) {
    btnExport.classList.remove("hidden");
    btnExport.onclick = () => exportToExcel(rows, mode);
  } else {
    btnExport.classList.add("hidden");
  }
};

function exportToExcel(data, mode) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Penjualan");
  XLSX.writeFile(workbook, `penjualan-${mode}.xlsx`);
}
