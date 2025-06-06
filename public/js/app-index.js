import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const formTransaksi = document.getElementById("formTransaksi");
const pilihBarang = document.getElementById("pilihBarang");
const jumlahBarang = document.getElementById("jumlahBarang");
const daftarTransaksi = document.getElementById("daftarTransaksi");

let dataBarang = [];

// Ambil daftar barang
async function isiDropdownBarang() {
  const querySnapshot = await getDocs(collection(db, "barang"));
  dataBarang = [];
  pilihBarang.innerHTML = '<option value="">-- Pilih Barang --</option>';
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    dataBarang.push({ id: docSnap.id, ...data });
    pilihBarang.innerHTML += `<option value="${docSnap.id}">${data.nama} - Rp${data.harga}</option>`;
  });
}

// Simpan transaksi dan kurangi stok 👇
formTransaksi.addEventListener("submit", async (e) => {
  e.preventDefault();
  const barangId = pilihBarang.value;
  const jumlah = parseInt(jumlahBarang.value);

  const barangDipilih = dataBarang.find(b => b.id === barangId);
  if (!barangDipilih) return;

  if (barangDipilih.stok < jumlah) {
    alert("Stok tidak mencukupi!");
    return;
  }

  const total = barangDipilih.harga * jumlah;

  await addDoc(collection(db, "penjualan"), {
    barangId,
    namaBarang: barangDipilih.nama,
    harga: barangDipilih.harga,
    jumlah,
    total,
    timestamp: Timestamp.now()
  });

  // Kurangi stok barang 👇
  const barangRef = doc(db, "barang", barangId);
  await updateDoc(barangRef, {
    stok: barangDipilih.stok - jumlah
  });

  formTransaksi.reset();
  tampilkanTransaksiHariIni();
  await isiDropdownBarang(); // refresh dropdown
});

// Menampilkan transaksi hari ini
async function tampilkanTransaksiHariIni() {
  daftarTransaksi.innerHTML = "";
  const now = new Date();
  const awalHari = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const akhirHari = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const q = query(
    collection(db, "penjualan"),
    where("timestamp", ">=", Timestamp.fromDate(awalHari)),
    where("timestamp", "<", Timestamp.fromDate(akhirHari))
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const waktu = data.timestamp.toDate().toLocaleTimeString();
    const tr = document.createElement("tr");
    tr.className = "border-b";
    tr.innerHTML = `
      <td class="px-4 py-2">${waktu}</td>
      <td class="px-4 py-2">${data.namaBarang}</td>
      <td class="px-4 py-2">${data.jumlah}</td>
      <td class="px-4 py-2">Rp${data.total}</td>
    `;
    daftarTransaksi.appendChild(tr);
  });
}

// Inisialisasi saat halaman dimuat
window.onload = async function () {
  await isiDropdownBarang();
  await tampilkanTransaksiHariIni();
};
