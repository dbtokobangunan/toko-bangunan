import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const form = document.getElementById("formTransaksi");
const barangSelect = document.getElementById("pilihBarang");
const jumlahInput = document.getElementById("jumlahBarang");
const hargaInput = document.getElementById("hargaBarang");
const uangInput = document.getElementById("uangDiterima");
const daftar = document.getElementById("daftarTransaksi");
const btnExport = document.getElementById("btnExport");
const btnHitung = document.getElementById("btnHitung");

let selectedBarang = null;
let totalTransaksi = 0;
let kembalian = 0;

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(angka);
}

async function muatBarang() {
  const debug = document.getElementById("debug");
  barangSelect.innerHTML = '<option value="">-- Pilih Barang --</option>';
  try {
    const snapshot = await getDocs(collection(db, "barang"));
    if (snapshot.empty) {
      debug.textContent = "Tidak ada data barang di database.";
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.nama) {
        console.warn("Barang tanpa nama:", docSnap.id);
        return;
      }
      const option = document.createElement("option");
      option.value = docSnap.id;
      option.textContent = data.nama;
      option.dataset.hargaJual = data.hargaJual || 0;
      option.dataset.hargaBeli = data.hargaBeli || 0;
      barangSelect.appendChild(option);
    });
  } catch (err) {
    debug.textContent = "Gagal memuat barang: " + err.message;
    console.error(err);
  }
}



// Set harga jual otomatis saat barang dipilih
barangSelect.addEventListener("change", () => {
  const selectedOption = barangSelect.options[barangSelect.selectedIndex];
  const hargaJual = selectedOption.dataset.hargaJual;
  hargaInput.value = hargaJual || '';
});

btnHitung.addEventListener("click", () => {
  const jumlah = parseInt(jumlahInput.value);
  const harga = parseInt(hargaInput.value);
  const uang = parseInt(uangInput.value);

  if (!barangSelect.value || isNaN(jumlah) || jumlah <= 0 || isNaN(harga) || harga <= 0 || isNaN(uang)) {
    alert("Mohon isi data dengan benar sebelum menghitung.");
    return;
  }

  totalTransaksi = jumlah * harga;
  kembalian = uang - totalTransaksi;

  alert(`Total Bayar: ${formatRupiah(totalTransaksi)}\nKembalian: ${formatRupiah(kembalian)}`);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const barangId = barangSelect.value;
  const jumlah = parseInt(jumlahInput.value);
  const harga = parseInt(hargaInput.value);
  const uang = parseInt(uangInput.value);
  const selectedOption = barangSelect.options[barangSelect.selectedIndex];
  const hargaBeli = parseInt(selectedOption.dataset.hargaBeli || 0);
  const namaBarang = selectedOption.textContent;

  if (!barangId || jumlah <= 0 || harga <= 0 || uang < totalTransaksi) {
    alert("Isi data dengan benar sebelum menyimpan.");
    return;
  }

  await addDoc(collection(db, "penjualan"), {
  barangId,
  namaBarang,
  jumlah,
  hargaJual: harga,
  hargaBeli,
  total: totalTransaksi,
  timestamp: Timestamp.now()
});

// Kurangi stok barang
const barangRef = doc(db, "barang", barangId);
const barangSnap = await getDoc(barangRef);

if (barangSnap.exists()) {
  const dataBarang = barangSnap.data();
  const stokBaru = (dataBarang.stok || 0) - jumlah;

  await updateDoc(barangRef, { stok: stokBaru });
}

alert("Transaksi berhasil disimpan.");
form.reset();
tampilkanTransaksiHariIni();
});


async function tampilkanTransaksiHariIni() {
  daftar.innerHTML = "";
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const besok = new Date(now);
  besok.setDate(besok.getDate() + 1);

  const snapshot = await getDocs(collection(db, "penjualan"));
  const dataExport = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const waktu = data.timestamp?.toDate?.();
    if (waktu >= now && waktu < besok) {
      daftar.innerHTML += `
        <tr>
          <td class="px-4 py-2">${waktu.toLocaleString()}</td>
          <td class="px-4 py-2">${data.namaBarang}</td>
          <td class="px-4 py-2">${data.jumlah}</td>
          <td class="px-4 py-2">${formatRupiah(data.total)}</td>
        </tr>`;
      dataExport.push({
        Waktu: waktu.toLocaleString(),
        Barang: data.namaBarang,
        Jumlah: data.jumlah,
        Total: data.total
      });
    }
  });

  if (dataExport.length > 0) {
    btnExport.classList.remove("hidden");
    btnExport.onclick = () => {
      const sheet = XLSX.utils.json_to_sheet(dataExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, sheet, "Transaksi");
      XLSX.writeFile(wb, "transaksi-harian.xlsx");
    };
  } else {
    btnExport.classList.add("hidden");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  muatBarang();
  tampilkanTransaksiHariIni();
});
