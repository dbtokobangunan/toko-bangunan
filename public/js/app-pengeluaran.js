// js/app-pengeluaran.js
import { db } from './firebase-config.js';
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const form = document.getElementById("formPengeluaran");
const daftar = document.getElementById("daftarPengeluaran");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const deskripsi = document.getElementById("deskripsiPengeluaran").value;
  const jumlah = parseInt(document.getElementById("jumlahPengeluaran").value);

  await addDoc(collection(db, "pengeluaran"), {
    deskripsi,
    jumlah,
    timestamp: Timestamp.now()
  });

  form.reset();
  tampilkanPengeluaran();
});

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

async function tampilkanPengeluaran() {
  daftar.innerHTML = "";
  const now = new Date();
  const awalHari = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const akhirHari = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const q = query(
    collection(db, "pengeluaran"),
    where("timestamp", ">=", Timestamp.fromDate(awalHari)),
    where("timestamp", "<", Timestamp.fromDate(akhirHari))
  );

  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    const data = doc.data();
    const waktu = data.timestamp.toDate().toLocaleTimeString();
    const li = document.createElement("li");
    li.textContent = `${waktu} - ${data.deskripsi}: Rp${data.jumlah}`;
    daftar.appendChild(li);
  });
}

window.onload = tampilkanPengeluaran;
