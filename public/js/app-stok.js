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

  // Simpan ke koleksi stokMasuk
  await addDoc(collection(db, "stokMasuk"), {
    barangId,
    namaBarang: barang.nama,
    jumlah,
    timestamp: Timestamp.now()
  });

  // Update stok pada data barang
  const barangRef = doc(db, "barang", barangId);
  await updateDoc(barangRef, {
    stok: barang.stok + jumlah
  });

  form.reset();
  tampilkanStokMasukHariIni();
});

// Tampilkan barang masuk hari ini
async function tampilkanStokMasukHariIni() {
  tbody.innerHTML = "";
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

    tbody.innerHTML += `
      <tr>
        <td class="px-4 py-2">${waktu}</td>
        <td class="px-4 py-2">${data.namaBarang}</td>
        <td class="px-4 py-2">${data.jumlah}</td>
      </tr>
    `;
  });
}

// Saat halaman dimuat
window.onload = async function () {
  await isiDropdownBarang();
  await tampilkanStokMasukHariIni();
};
