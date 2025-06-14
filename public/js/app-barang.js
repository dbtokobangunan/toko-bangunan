import { db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const barangForm = document.getElementById("barangForm");
const daftarBarang = document.getElementById("daftarBarang");
const formTitle = document.getElementById("formTitle");
const batalEditBtn = document.getElementById("batalEdit");

let editId = null;

async function tampilkanBarang() {
  daftarBarang.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "barang"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    tr.className = "border-b";
    tr.innerHTML = `
      <td class="px-4 py-2">${data.nama || '-'}</td>
      <td class="px-4 py-2">${data.kategori || '-'}</td>
      <td class="px-4 py-2">Rp${data.hargaBeli?.toLocaleString() || '0'}</td>
      <td class="px-4 py-2">Rp${data.hargaJual?.toLocaleString() || '0'}</td>
      <td class="px-4 py-2">${data.stok ?? 0}</td>
      <td class="px-4 py-2">
        <button class="text-blue-600 hover:underline mr-2" onclick="editBarang('${docSnap.id}', '${data.nama}', '${data.kategori}', ${data.hargaBeli}, ${data.hargaJual}, ${data.stok})">Edit</button>
        <button class="text-red-600 hover:underline" onclick="hapusBarang('${docSnap.id}')">Hapus</button>
      </td>`;
    daftarBarang.appendChild(tr);
  });
}

barangForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nama = document.getElementById("namaBarang").value.trim();
  const kategori = document.getElementById("kategoriBarang").value.trim();
  const hargaBeli = parseInt(document.getElementById("hargaBeli").value);
  const hargaJual = parseInt(document.getElementById("hargaJual").value);
  const stok = parseInt(document.getElementById("stokBarang").value);

  if (!nama || !kategori || isNaN(hargaBeli) || isNaN(hargaJual) || isNaN(stok)) {
    return alert("Semua field wajib diisi dengan benar.");
  }

  const data = { nama, kategori, hargaBeli, hargaJual, stok };

  try {
    if (editId) {
      await updateDoc(doc(db, "barang", editId), data);
      batalEditBtn.classList.add("hidden");
      editId = null;
    } else {
      await addDoc(collection(db, "barang"), data);
    }
    barangForm.reset();
    tampilkanBarang();
  } catch (err) {
    console.error("Gagal simpan:", err);
    alert("Gagal menyimpan data.");
  }
});

window.editBarang = function (id, nama, kategori, hargaBeli, hargaJual, stok) {
  document.getElementById("namaBarang").value = nama;
  document.getElementById("kategoriBarang").value = kategori;
  document.getElementById("hargaBeli").value = hargaBeli;
  document.getElementById("hargaJual").value = hargaJual;
  document.getElementById("stokBarang").value = stok;
  editId = id;
  batalEditBtn.classList.remove("hidden");
};

batalEditBtn.addEventListener("click", () => {
  barangForm.reset();
  batalEditBtn.classList.add("hidden");
  editId = null;
});

window.hapusBarang = async function (id) {
  if (!confirm("Yakin ingin menghapus?")) return;
  await deleteDoc(doc(db, "barang", id));
  tampilkanBarang();
};

window.onload = tampilkanBarang;
