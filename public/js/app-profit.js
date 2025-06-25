import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

function getDateRange(mode, tanggal) {
  let start, end;

  if (mode === "harian") {
    start = new Date(tanggal);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 1);
  } else if (mode === "bulanan") {
    start = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1);
    end = new Date(tanggal.getFullYear(), tanggal.getMonth() + 1, 1);
  } else if (mode === "tahunan") {
    start = new Date(tanggal.getFullYear(), 0, 1);
    end = new Date(tanggal.getFullYear() + 1, 0, 1);
  }

  return { start, end };
}

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR"
  }).format(angka);
}

// INI YANG PENTING
window.hitungProfit = async function hitungProfit() {
  const mode = document.getElementById("jenisProfit").value;
  const tglInput = document.getElementById("tanggalProfit").value;
  const ringkasan = document.getElementById("ringkasanProfit");

  if (!tglInput) {
    ringkasan.innerHTML = `<p class="text-red-600">Tanggal belum dipilih.</p>`;
    return;
  }

  const tanggal = new Date(tglInput);
  const { start, end } = getDateRange(mode, tanggal);

  let totalPenjualan = 0;
  let totalModal = 0;
  let totalPengeluaran = 0;

  // Penjualan
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

  // Pengeluaran
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
}
