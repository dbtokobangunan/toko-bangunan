// js/app-profit.js
import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const ringkasan = document.getElementById("ringkasanProfit");

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

window.hitungProfitHarian = async function () {
  const now = new Date();
  const awalHari = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const akhirHari = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  let totalPenjualan = 0;
  let totalPengeluaran = 0;

  // Ambil total penjualan hari ini
  const qPenjualan = query(
    collection(db, "penjualan"),
    where("timestamp", ">=", Timestamp.fromDate(awalHari)),
    where("timestamp", "<", Timestamp.fromDate(akhirHari))
  );
  const snapPenjualan = await getDocs(qPenjualan);
  snapPenjualan.forEach(doc => {
    totalPenjualan += doc.data().total;
  });

  // Ambil total pengeluaran hari ini
  const qPengeluaran = query(
    collection(db, "pengeluaran"),
    where("timestamp", ">=", Timestamp.fromDate(awalHari)),
    where("timestamp", "<", Timestamp.fromDate(akhirHari))
  );
  const snapPengeluaran = await getDocs(qPengeluaran);
  snapPengeluaran.forEach(doc => {
    totalPengeluaran += doc.data().jumlah;
  });

  const profit = totalPenjualan - totalPengeluaran;

  ringkasan.innerHTML = `
    <p>Total Penjualan: <strong>Rp${totalPenjualan}</strong></p>
    <p>Total Pengeluaran: <strong>Rp${totalPengeluaran}</strong></p>
    <p>Profit Hari Ini: <strong class="text-green-600">Rp${profit}</strong></p>
  `;
};
