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
const daftar = document.getElementById("daftarTransaksi");
const barang = document.getElementById("pilihBarang");
const jumlah = document.getElementById("jumlahBarang");
const harga = document.getElementById("hargaBarang");
const uang = document.getElementById("uangDiterima");
const totalLabel = document.getElementById("totalBayar");
const kembalianLabel = document.getElementById("kembalian");
const btnExport = document.getElementById("btnExport");

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(angka);
}

async function muatBarang() {
  barang.innerHTML = '<option value="">-- Pilih Barang --</option>';
  const data = await getDocs(collection(db, "barang"));
  data.forEach(doc => {
    const d = doc.data();
    barang.innerHTML += `<option value="${doc.id}">${d.nama}</option>`;
  });
}

async function tampilkanTransaksiHariIni() {
  daftar.innerHTML = "";
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const besok = new Date(now);
  besok.setDate(besok.getDate() + 1);

  const snapshot = await getDocs(collection(db, "penjualan"));
  const dataExport = [];

  snapshot.forEach(doc => {
    const data = doc.data();
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
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const barangId = barang.value;
  const jml = parseInt(jumlah.value);
  const hrg = parseInt(harga.value);
  const bayar = parseInt(uang.value);
  const total = jml * hrg;
  const kembali = bayar - total;

  if (!barangId || jml <= 0 || hrg <= 0 || bayar < total) return alert("Isi data dengan benar");

  const barangDoc = await getDoc(doc(db, "barang", barangId));
  const namaBarang = barangDoc.data().nama;

  await addDoc(collection(db, "penjualan"), {
    barangId,
    namaBarang,
    jumlah: jml,
    harga: hrg,
    total,
    timestamp: Timestamp.now()
  });

  totalLabel.textContent = formatRupiah(total);
  kembalianLabel.textContent = formatRupiah(kembali);

  alert("Transaksi berhasil");
  form.reset();
  tampilkanTransaksiHariIni();
});

window.addEventListener("DOMContentLoaded", () => {
  muatBarang();
  tampilkanTransaksiHariIni();
});
