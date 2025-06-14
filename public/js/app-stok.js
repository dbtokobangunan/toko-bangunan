// js/app-stok.js
import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  where,
  query
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const form = document.getElementById("formStokMasuk");
const pilihBarang = document.getElementById("pilihBarang");
const jumlahMasuk = document.getElementById("jumlahMasuk");
const tbody = document.getElementById("daftarStokMasuk");
tbody.innerHTML += `
  <tr>
    <td class="px-4 py-2">${waktu}</td>
    <td class="px-4 py-2">${namaBarang}</td>
    <td class="px-4 py-2">${jumlah}</td>
  </tr>
`;


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

let dataBarang = [];

// Isi dropdown barang dari Firestore
async function isiDropdownBarang() {
  const querySnapshot = await getDocs(collection(db, "barang"));
  dataBarang = [];
  pilihBarang.innerHTML = '<option value="">-- Pilih Barang --</option>';
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    dataBarang.push({ id: docSnap.id, ...data });
    pilihBarang.innerHTML += `<option value="${docSnap.id}">${data.nama}</option>`;
  });
}

// Simpan stok masuk ke Firestore
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const barangId = pilihBarang.value;
  const jumlah = parseInt(jumlahMasuk.value);
  const barang = dataBarang.find(b => b.id === barangId);

  if (!barang) return;

  await addDoc(collection(db, "stokMasuk"), {
    barangId,
    namaBarang: barang.nama,
    jumlah,
    timestamp: Timestamp.now()
  });

  // Update stok barang
  const barangRef = doc(db, "barang", barangId);
  await updateDoc(barangRef, {
    stok: barang.stok + jumlah
  });

  form.reset();
  tampilkanStokMasukHariIni();
});

// Tampilkan barang masuk hari ini
async function tampilkanStokMasukHariIni() {
  daftarStokMasuk.innerHTML = "";
  const now = new Date();
  const awal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const akhir = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const q = query(
    collection(db, "stokMasuk"),
    where("timestamp", ">=", Timestamp.fromDate(awal)),
    where("timestamp", "<", Timestamp.fromDate(akhir))
  );

  const snap = await getDocs(q);
  snap.forEach(doc => {
    const data = doc.data();
    const waktu = data.timestamp.toDate().toLocaleTimeString();
    const li = document.createElement("li");
    li.textContent = `${waktu} - ${data.namaBarang} +${data.jumlah}`;
    daftarStokMasuk.appendChild(li);
  });
}

window.onload = async function () {
  await isiDropdownBarang();
  await tampilkanStokMasukHariIni();
};
