import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const ringkasan = document.getElementById("ringkasanProfit");

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

// Fungsi global agar bisa dipanggil dari HTML
window.hitungProfit = async function hitungProfit() {
  const mode = document.getElementById("jenisProfit").value;
  const tanggal = new Date(document.getElementById("tanggalProfit").value);

  const { start, end } = getDateRange(mode);
  // Override start & end jika harian
  if (mode === "harian" && !isNaN(tanggal)) {
    start.setFullYear(tanggal.getFullYear(), tanggal.getMonth(), tanggal.getDate());
    start.setHours(0, 0, 0, 0);
    end.setTime(start.getTime() + 24 * 60 * 60 * 1000);
  }

  let totalPenjualan = 0;
  let totalModal = 0;
  let totalPengeluaran = 0;

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
