import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtM9BnM3iJF_KcZDHMKE11MOb8EBXDGX0",
  authDomain: "toko-bangunan01.firebaseapp.com",
  projectId: "toko-bangunan01",
  storageBucket: "toko-bangunan01.firebasestorage.app",
  messagingSenderId: "162547296082",
  appId: "1:162547296082:web:e455b3d66749fd90003c8b",
  measurementId: "G-XEXDVSLBGW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

window.simpanData = async function () {
  const item = document.getElementById("item").value;
  const qty = Number(document.getElementById("qty").value);
  const price = Number(document.getElementById("price").value);
  const total = qty * price;

  await addDoc(collection(db, "penjualan"), {
    item, qty, price, total, timestamp: new Date()
  });

  tampilkanData();
};

async function tampilkanData() {
  const list = document.getElementById("dataList");
  list.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "penjualan"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = `${data.item} - ${data.qty} x ${data.price} = Rp${data.total}`;
    list.appendChild(li);
  });
}

window.filterByDate = async function () {
    const selectedDate = new Date(document.getElementById("filterDate").value);
    const nextDate = new Date(selectedDate);
    nextDate.setDate(selectedDate.getDate() + 1);
  
    const querySnapshot = await getDocs(collection(db, "penjualan"));
    const list = document.getElementById("dataList");
    list.innerHTML = "";
  
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const tgl = data.timestamp.toDate();
      if (tgl >= selectedDate && tgl < nextDate) {
        const li = document.createElement("li");
        li.textContent = `${data.item} - ${data.qty} x ${data.price} = Rp${data.total}`;
        list.appendChild(li);
      }
    });
  };
  
  window.exportCSV = async function () {
    const querySnapshot = await getDocs(collection(db, "penjualan"));
    let csv = "Nama Barang,Jumlah,Harga,Total,Tanggal\n";
  
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const tgl = data.timestamp.toDate().toLocaleString();
      csv += `${data.item},${data.qty},${data.price},${data.total},${tgl}\n`;
    });
  
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "penjualan.csv");
    link.click();
  };

  window.simpanPengeluaran = async function () {
    const deskripsi = document.getElementById("descPengeluaran").value;
    const biaya = Number(document.getElementById("biaya").value);
  
    await addDoc(collection(db, "pengeluaran"), {
      deskripsi, biaya, timestamp: new Date()
    });
  
    alert("Pengeluaran disimpan");
  };
  
  window.hitungProfit = async function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
  
    let totalPenjualan = 0;
    let totalPengeluaran = 0;
  
    const sales = await getDocs(collection(db, "penjualan"));
    sales.forEach(doc => {
      const data = doc.data();
      const tgl = data.timestamp.toDate();
      if (tgl >= today && tgl < tomorrow) {
        totalPenjualan += data.total;
      }
    });
  
    const expenses = await getDocs(collection(db, "pengeluaran"));
    expenses.forEach(doc => {
      const data = doc.data();
      const tgl = data.timestamp.toDate();
      if (tgl >= today && tgl < tomorrow) {
        totalPengeluaran += data.biaya;
      }
    });
  
    const profit = totalPenjualan - totalPengeluaran;
    document.getElementById("hasilProfit").textContent = `Total Penjualan: Rp${totalPenjualan} - Pengeluaran: Rp${totalPengeluaran} = Profit: Rp${profit}`;
  };
  
tampilkanData();
