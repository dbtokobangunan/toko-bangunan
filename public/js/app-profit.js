import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const ringkasan = document.getElementById("ringkasanProfit");

window.hitungProfit = async function () {
  const jenis = document.getElementById("jenisProfit").value;
  const tanggal = new Date(document.getElementById("tanggalProfit").value);
  if (isNaN(tanggal)) return alert("Harap pilih tanggal");

  let awal, akhir;
  if (jenis === "harian") {
    awal = new Date(tanggal);
    akhir = new Date(tanggal);
    akhir.setDate(akhir.getDate() + 1);
  } else if (jenis === "bulanan") {
    awal = new Date(tanggal.getFullYear(), tanggal.getMonth(), 1);
    akhir = new Date(tanggal.getFullYear(), tanggal.getMonth() + 1, 1);
  } else if (jenis === "tahunan") {
    awal = new Date(tanggal.getFullYear(), 0, 1);
    akhir = new Date(tanggal.getFullYear() + 1, 0, 1);
  }

  let totalJual = 0;
  let totalBeli = 0;
  let totalPengeluaran = 0;

  const penjualanQuery = query(
    collection(db, "penjualan"),
    where("timestamp", ">=", Timestamp.fromDate(awal)),
    where("timestamp", "<", Timestamp.fromDate(akhir))
  );
  const penjualanSnap = await getDocs(penjualanQuery);
  penjualanSnap.forEach(doc => {
    const data = doc.data();
    totalJual += data.total;
    totalBeli += (data.hargaBeli || 0) * (data.jumlah || 0); // asumsikan 'hargaBeli' disimpan di data
  });

  const pengeluaranQuery = query(
    collection(db, "pengeluaran"),
    where("timestamp", ">=", Timestamp.fromDate(awal)),
    where("timestamp", "<", Timestamp.fromDate(akhir))
  );
  const pengeluaranSnap = await getDocs(pengeluaranQuery);
  pengeluaranSnap.forEach(doc => {
    totalPengeluaran += doc.data().jumlah || 0;
  });

  const profitKotor = totalJual - totalBeli;
  const profitBersih = profitKotor - totalPengeluaran;

  ringkasan.innerHTML = `
    <p>Total Penjualan: <strong>Rp${totalJual.toLocaleString("id-ID")}</strong></p>
    <p>Modal (Harga Beli): <strong>Rp${totalBeli.toLocaleString("id-ID")}</strong></p>
    <p>Total Pengeluaran: <strong>Rp${totalPengeluaran.toLocaleString("id-ID")}</strong></p>
    <hr class="my-2" />
    <p>Profit Kotor (Harga Jual - Harga Beli): <strong class="text-blue-600">Rp${profitKotor.toLocaleString("id-ID")}</strong></p>
    <p>Profit Bersih (Profit Kotor - Pengeluaran): <strong class="text-green-600">Rp${profitBersih.toLocaleString("id-ID")}</strong></p>
  `;
};
