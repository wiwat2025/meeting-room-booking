const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "user1", password: "user123", role: "user" },
];
let currentUser = null;

// ฟังก์ชันล็อกอิน
document.getElementById("login-btn").addEventListener("click", function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const user = users.find((u) => u.username === username && u.password === password);

  if (user) {
    currentUser = user;
    alert(`Welcome, ${user.username} (${user.role})!`);
    showApp();
  } else {
    alert("Invalid username or password");
  }
});

// ฟังก์ชันแสดงหน้าเว็บ
function showApp() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("app").style.display = "block";

  if (currentUser.role !== "admin") {
    document.getElementById("booking-form").style.display = "block"; // ให้ผู้ใช้ทั่วไปสามารถเพิ่มได้
  } else {
    document.getElementById("booking-form").style.display = "none"; // แอดมินไม่ต้องการฟอร์มเพิ่มการจอง
  }

  updateBookingList();
  updateCalendar();
}

// ฟังก์ชันล็อกเอาต์
document.getElementById("logout-btn").addEventListener("click", function () {
  currentUser = null;
  document.getElementById("login-form").style.display = "block";
  document.getElementById("app").style.display = "none";
});

// ฟังก์ชันบันทึกการจอง
function saveBooking(room, date, time) {
  const booking = { room, date, time, confirmed: false }; // เพิ่มสถานะ confirmed เป็น false
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.push(booking);
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

// ฟังก์ชันอัปเดตรายการการจอง
function updateBookingList() {
  const bookingList = document.getElementById("list");
  bookingList.innerHTML = "";

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.forEach((booking, index) => {
    const li = document.createElement("li");
    li.textContent = `Room: ${booking.room}, Date: ${booking.date}, Time: ${booking.time}`;
    
    if (booking.confirmed) {
      li.textContent += " (Confirmed)";
    } else {
      li.textContent += " (Pending Confirmation)";
    }

    // หากเป็นแอดมินจะสามารถยืนยันการจองห้อง
    if (currentUser.role === "admin" && !booking.confirmed) {
      const confirmBtn = document.createElement("button");
      confirmBtn.textContent = "Confirm Booking";
      confirmBtn.style.marginLeft = "10px";
      confirmBtn.onclick = () => {
        booking.confirmed = true;
        const bookings = JSON.parse(localStorage.getItem("bookings"));
        bookings[index] = booking; // อัปเดตการจองที่ได้รับการยืนยัน
        localStorage.setItem("bookings", JSON.stringify(bookings));
        updateBookingList(); // อัปเดตรายการการจอง
      };
      li.appendChild(confirmBtn);
    }

    // แอดมินสามารถลบการจองได้
    if (currentUser.role === "admin") {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Cancel";
      deleteBtn.style.marginLeft = "10px";
      deleteBtn.onclick = () => {
        const bookings = JSON.parse(localStorage.getItem("bookings"));
        bookings.splice(index, 1); // ลบการจอง
        localStorage.setItem("bookings", JSON.stringify(bookings));
        updateBookingList(); // อัปเดตรายการการจอง
        updateCalendar(); // อัปเดตปฏิทิน
      };
      li.appendChild(deleteBtn);
    }

    // หากเป็นผู้ใช้งานทั่วไปจะไม่สามารถลบหรือลงทะเบียนการจองได้
    if (currentUser.role === "user" && !booking.confirmed) {
      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel My Booking";
      cancelBtn.style.marginLeft = "10px";
      cancelBtn.onclick = () => {
        const bookings = JSON.parse(localStorage.getItem("bookings"));
        bookings.splice(index, 1); // ลบการจองของผู้ใช้งานทั่วไป
        localStorage.setItem("bookings", JSON.stringify(bookings));
        updateBookingList(); // อัปเดตรายการการจอง
        updateCalendar(); // อัปเดตปฏิทิน
      };
      li.appendChild(cancelBtn);
    }

    bookingList.appendChild(li);
  });
}

// ฟังก์ชันสร้างปฏิทิน
function generateCalendar(year, month) {
  const calendarContainer = document.getElementById("calendar-container");
  calendarContainer.innerHTML = "";

  const date = new Date(year, month, 1);
  const firstDayIndex = date.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // เพิ่มช่องว่างก่อนวันแรกของเดือน
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.classList.add("empty-day");
    calendarContainer.appendChild(emptyDiv);
  }

  // สร้างวันในเดือน
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("calendar-day");
    dayDiv.innerHTML = `<strong>${day}</strong>`;

    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.forEach((booking) => {
      if (booking.date === `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`) {
        const bookingSpan = document.createElement("span");
        bookingSpan.classList.add("booking");
        bookingSpan.textContent = `${booking.room} (${booking.time})`;
        dayDiv.appendChild(bookingSpan);
      }
    });

    calendarContainer.appendChild(dayDiv);
  }
}

// ฟังก์ชันอัปเดตปฏิทิน
function updateCalendar() {
  const today = new Date();
  generateCalendar(today.getFullYear(), today.getMonth());
}

// ฟังก์ชันจัดการการจอง
document.getElementById("booking-form").addEventListener("submit", function (e) {
  e.preventDefault();

  if (currentUser.role !== "user") {
    alert("Only users can book rooms!");
    return;
  }

  const room = document.getElementById("room").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value.trim();

  if (room && date && time) {
    saveBooking(room, date, time);
    updateBookingList();
    updateCalendar();
    alert("Booking request sent! Awaiting confirmation.");
    this.reset();
  } else {
    alert("Please fill in all fields.");
  }
});

// เรียกอัปเดตครั้งแรก
updateBookingList();
updateCalendar();
