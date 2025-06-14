import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Fungsi untuk memformat angka ke Rupiah
function formatRupiah(num) {
  return "Rp" + num.toLocaleString("id-ID");
}

// const navBar = document.createElement("nav");
// navBar.className = "bg-white shadow-md py-4 mb-8";
// navBar.innerHTML = `
//   <div class="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4">
//     <a href="index.html" class="text-blue-600 font-semibold hover:underline">Kasir</a>
//     <a href="barang.html" class="text-blue-600 font-semibold hover:underline">Data Barang</a>
//     <a href="penjualan.html" class="text-blue-600 font-semibold hover:underline">Penjualan</a>
//     <a href="pengeluaran.html" class="text-blue-600 font-semibold hover:underline">Pengeluaran</a>
//     <a href="profit.html" class="text-blue-600 font-semibold hover:underline">Profit Harian</a>
//     <a href="profit-bulanan.html" class="text-blue-600 font-semibold hover:underline">Profit Bulanan</a>
//     <a href="stok.html" class="text-blue-600 font-semibold hover:underline">Stok Masuk</a>
//   </div>
// `;
// document.body.prepend(navBar);

// Fungsi utama untuk filter dan tampilkan penjualan bulanan
window.filterPenjualanBulanan = async function () {
  const input = document.getElementById("filterBulan").value;
  const tabel = document.getElementById("tabelPenjualanBulanan");
  tabel.innerHTML = "";

  if (!input) return alert("Silakan pilih bulan terlebih dahulu!");

  const [year, month] = input.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const q = query(
    collection(db, "penjualan"),
    where("timestamp", ">=", Timestamp.fromDate(start)),
    where("timestamp", "<", Timestamp.fromDate(end))
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    tabel.innerHTML = `<tr><td colspan="5" class="text-center py-4">Tidak ada data penjualan bulan ini.</td></tr>`;
    return;
  }

  snapshot.forEach(doc => {
    const data = doc.data();
    const waktu = data.timestamp.toDate();
    const tanggal = waktu.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });

    const tr = document.createElement("tr");
    tr.className = "border-b";
    tr.innerHTML = `
      <td class="border px-4 py-2">${tanggal}</td>
      <td class="border px-4 py-2">${data.namaBarang}</td>
      <td class="border px-4 py-2">${data.jumlah}</td>
      <td class="border px-4 py-2">${formatRupiah(data.harga)}</td>
      <td class="border px-4 py-2">${formatRupiah(data.total)}</td>
    `;
    tabel.appendChild(tr);
  });
};
