import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const ringkasan = document.getElementById("ringkasanProfit");

// Buat dropdown filter
const filterContainer = document.createElement("div");
filterContainer.className = "mb-4 flex gap-4 items-center";

const filterSelect = document.createElement("select");
filterSelect.className = "border border-gray-300 rounded p-2";
filterSelect.innerHTML = `
  <option value="harian">Harian</option>
  <option value="bulanan">Bulanan</option>
  <option value="tahunan">Tahunan</option>
`;

const btnHitung = document.createElement("button");
btnHitung.textContent = "Hitung Profit";
btnHitung.className = "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700";

filterContainer.appendChild(filterSelect);
filterContainer.appendChild(btnHitung);
ringkasan.before(filterContainer);

// // Navbar
// const navBar = document.createElement("nav");
// navBar.className = "bg-white shadow-md py-4 mb-8";
// navBar.innerHTML = `
//   <div class="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4">
//     <a href="index.html" class="text-blue-600 font-semibold hover:underline">Kasir</a>
//     <a href="barang.html" class="text-blue-600 font-semibold hover:underline">Data Barang</a>
//     <a href="penjualan.html" class="text-blue-600 font-semibold hover:underline">Penjualan</a>
//     <a href="pengeluaran.html" class="text-blue-600 font-semibold hover:underline">Pengeluaran</a>
//     <a href="profit.html" class="text-blue-600 font-semibold hover:underline">Profit</a>
//     <a href="stok.html" class="text-blue-600 font-semibold hover:underline">Stok Masuk</a>
//   </div>
// `;
// document.body.prepend(navBar);

function getDateRange(mode) {
  const now = new Date();
  let start, end;
  if (mode === "harian") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  } else if (mode === "bulanan") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (mode === "tahunan") {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear() + 1, 0, 1);
  }
  return { start, end };
}

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR"
  }).format(angka);
}

btnHitung.onclick = async () => {
  const mode = filterSelect.value;
  const { start, end } = getDateRange(mode);

  let totalPenjualan = 0;
  let totalPengeluaran = 0;
  let totalModal = 0;

  // Ambil data penjualan
  const qPenjualan = query(
    collection(db, "penjualan"),
    where("timestamp", ">=", Timestamp.fromDate(start)),
    where("timestamp", "<", Timestamp.fromDate(end))
  );
  const snapPenjualan = await getDocs(qPenjualan);
  snapPenjualan.forEach(doc => {
    const d = doc.data();
    totalPenjualan += d.total;
    totalModal += (d.hargaBeli || 0) * (d.jumlah || 1);
  });

  // Ambil data pengeluaran
  const qPengeluaran = query(
    collection(db, "pengeluaran"),
    where("timestamp", ">=", Timestamp.fromDate(start)),
    where("timestamp", "<", Timestamp.fromDate(end))
  );
  const snapPengeluaran = await getDocs(qPengeluaran);
  snapPengeluaran.forEach(doc => {
    totalPengeluaran += doc.data().jumlah;
  });

  const profitKotor = totalPenjualan - totalModal;
  const profitBersih = profitKotor - totalPengeluaran;

  ringkasan.innerHTML = `
    <p class="mb-2">Periode: <strong class="text-blue-600 capitalize">${mode}</strong></p>
    <p>Total Penjualan: <strong>${formatRupiah(totalPenjualan)}</strong></p>
    <p>Total Modal (Harga Beli): <strong>${formatRupiah(totalModal)}</strong></p>
    <p>Profit Kotor: <strong class="text-yellow-600">${formatRupiah(profitKotor)}</strong></p>
    <p>Total Pengeluaran Lain: <strong>${formatRupiah(totalPengeluaran)}</strong></p>
    <p class="mt-2 text-lg">Profit Bersih: <strong class="text-green-600">${formatRupiah(profitBersih)}</strong></p>
  `;
};
