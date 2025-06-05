// js/app-barang.js
import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const barangForm = document.getElementById("barangForm");
const daftarBarang = document.getElementById("daftarBarang");
const formTitle = document.getElementById("formTitle");
const batalEditBtn = document.getElementById("batalEdit");

let editId = null;

// Ambil dan tampilkan data barang
async function tampilkanBarang() {
  daftarBarang.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "barang"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.className = "border-b";
    tr.innerHTML = `
      <td class="px-4 py-2">${data.nama}</td>
      <td class="px-4 py-2">${data.kategori}</td>
      <td class="px-4 py-2">Rp${data.harga}</td>
      <td class="px-4 py-2">${data.stok}</td>
      <td class="px-4 py-2 text-center">
        <button class="text-blue-600 hover:underline mr-2" onclick="editBarang('${docSnap.id}', '${data.nama}', '${data.kategori}', ${data.harga}, ${data.stok})">Edit</button>
        <button class="text-red-600 hover:underline" onclick="hapusBarang('${docSnap.id}')">Hapus</button>
      </td>`;
    daftarBarang.appendChild(tr);
  });
}

// Simpan data baru atau update
barangForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nama = document.getElementById("namaBarang").value;
  const kategori = document.getElementById("kategoriBarang").value;
  const harga = parseInt(document.getElementById("hargaBarang").value);
  const stok = parseInt(document.getElementById("stokBarang").value);

  const data = { nama, kategori, harga, stok };

  if (editId) {
    const barangRef = doc(db, "barang", editId);
    await updateDoc(barangRef, data);
    formTitle.textContent = "Tambah Barang";
    batalEditBtn.classList.add("hidden");
    editId = null;
  } else {
    await addDoc(collection(db, "barang"), data);
  }

  barangForm.reset();
  tampilkanBarang();
});

// Fungsi edit
window.editBarang = function (id, nama, kategori, harga, stok) {
  document.getElementById("namaBarang").value = nama;
  document.getElementById("kategoriBarang").value = kategori;
  document.getElementById("hargaBarang").value = harga;
  document.getElementById("stokBarang").value = stok;
  editId = id;
  formTitle.textContent = "Edit Barang";
  batalEditBtn.classList.remove("hidden");
};

// Batal edit
batalEditBtn.addEventListener("click", () => {
  barangForm.reset();
  formTitle.textContent = "Tambah Barang";
  batalEditBtn.classList.add("hidden");
  editId = null;
});

// Fungsi hapus
window.hapusBarang = async function (id) {
  const ok = confirm("Yakin ingin menghapus barang ini?");
  if (!ok) return;
  await deleteDoc(doc(db, "barang", id));
  tampilkanBarang();
};

// Inisialisasi
window.onload = tampilkanBarang;
