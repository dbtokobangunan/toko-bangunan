// js/app.js

// Highlight menu aktif
document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("nav a");
  const current = window.location.pathname.split("/").pop();

  links.forEach(link => {
    const href = link.getAttribute("href");
    if (href === current) {
      link.classList.add("underline", "text-black");
    } else {
      link.classList.remove("underline", "text-black");
    }
  });
});

// Fungsi logout (opsional jika nanti pakai Firebase Auth)
window.logout = function () {
  // Misal nanti pakai firebase.auth().signOut();
  alert("Anda berhasil logout.");
  window.location.href = "login.html"; // atau halaman lain
};
