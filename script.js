document.getElementById("booking-form").addEventListener("submit", function (e) {
  e.preventDefault();

  const room = document.getElementById("room").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (room && date && time) {
    // สร้างข้อมูลการจอง
    const booking = {
      room,
      date,
      time,
    };

    // บันทึกการจองใน LocalStorage
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.push(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    // อัปเดตรายการจองในหน้าเว็บ
    updateBookingList();
    alert("Room booked successfully!");
    this.reset();
  }
});

function updateBookingList() {
  const bookingList = document.getElementById("list");
  bookingList.innerHTML = "";

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.forEach((booking, index) => {
    const li = document.createElement("li");
    li.textContent = `Room: ${booking.room}, Date: ${booking.date}, Time: ${booking.time}`;
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Cancel";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.onclick = () => {
      bookings.splice(index, 1);
      localStorage.setItem("bookings", JSON.stringify(bookings));
      updateBookingList();
    };
    li.appendChild(deleteBtn);
    bookingList.appendChild(li);
  });
}
const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "user1", password: "user123", role: "user" },
];
let currentUser = null;
document.getElementById("login-btn").addEventListener("click", function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // ตรวจสอบผู้ใช้
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    currentUser = user;
    alert(`Welcome, ${user.username} (${user.role})!`);
    showApp();
  } else {
    alert("Invalid username or password");
  }
});

function showApp() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("app").style.display = "block";

  if (currentUser.role !== "admin") {
    document.getElementById("booking-form").style.display = "none";
  }

  updateBookingList();
}
document.getElementById("logout-btn").addEventListener("click", function () {
  currentUser = null;
  document.getElementById("login-form").style.display = "block";
  document.getElementById("app").style.display = "none";
});
function updateBookingList() {
  const bookingList = document.getElementById("list");
  bookingList.innerHTML = "";

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.forEach((booking, index) => {
    const li = document.createElement("li");
    li.textContent = `Room: ${booking.room}, Date: ${booking.date}, Time: ${booking.time}`;

    // เพิ่มปุ่มลบสำหรับ Admin เท่านั้น
    if (currentUser.role === "admin") {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Cancel";
      deleteBtn.style.marginLeft = "10px";
      deleteBtn.onclick = () => {
        bookings.splice(index, 1);
        localStorage.setItem("bookings", JSON.stringify(bookings));
        updateBookingList();
      };
      li.appendChild(deleteBtn);
    }

    bookingList.appendChild(li);
  });
}
document
  .getElementById("booking-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    if (currentUser.role !== "admin") {
      alert("Only admins can book rooms!");
      return;
    }

    const room = document.getElementById("room").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    if (room && date && time) {
      const booking = { room, date, time };

      let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
      bookings.push(booking);
      localStorage.setItem("bookings", JSON.stringify(bookings));

      updateBookingList();
      alert("Room booked successfully!");
      this.reset();
    }
  });



// อัปเดตการแสดงผลครั้งแรก
updateBookingList();
