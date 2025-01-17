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

// ฟังก์ชันแสดงหน้าแอป
function showApp() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("app").style.display = "block";

  // แสดงหรือซ่อนฟอร์มการจองตามบทบาท
  if (currentUser.role === "user") {
    document.getElementById("booking-form").style.display = "block";
  } else {
    document.getElementById("booking-form").style.display = "none";
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
function saveBooking(room, date, time, description = "") {
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

  // ตรวจสอบว่ามีการจองซ้ำหรือไม่
  if (bookings.some((b) => b.room === room && b.date === date && b.time === time)) {
    alert("This room is already booked for the selected time.");
    return;
  }

  const newBooking = {
    room,
    date,
    time,
    description,
    confirmed: false,
  };
  bookings.push(newBooking);
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

// ฟังก์ชันอัปเดตรายการการจอง
function updateBookingList() {
  const bookingList = document.getElementById("list");
  bookingList.innerHTML = "";

  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.forEach((booking, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div><strong>Room:</strong> ${booking.room}</div>
      <div><strong>Date:</strong> ${booking.date}</div>
      <div><strong>Time:</strong> ${booking.time}</div>
      <div><strong>Description:</strong> ${booking.description || "N/A"}</div>
      <div><strong>Status:</strong> ${booking.confirmed ? "Confirmed" : "Pending Confirmation"}</div>
    `;

    if (currentUser.role === "admin") {
      // ปุ่มยืนยันการจอง
      if (!booking.confirmed) {
        const confirmBtn = createButton("Confirm", () => confirmBooking(index));
        li.appendChild(confirmBtn);
      }

      // ปุ่มยกเลิกการจอง
      const deleteBtn = createButton("Cancel", () => deleteBooking(index));
      li.appendChild(deleteBtn);
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

// ฟังก์ชันยืนยันการจอง
function confirmBooking(index) {
  const bookings = JSON.parse(localStorage.getItem("bookings"));
  bookings[index].confirmed = true;
  localStorage.setItem("bookings", JSON.stringify(bookings));
  updateBookingList();
  alert("Booking confirmed!");
}

// ฟังก์ชันลบการจอง
function deleteBooking(index) {
  const bookings = JSON.parse(localStorage.getItem("bookings"));
  bookings.splice(index, 1);
  localStorage.setItem("bookings", JSON.stringify(bookings));
  updateBookingList();
  updateCalendar();
}

// ฟังก์ชันช่วยสร้างปุ่ม
function createButton(text, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.style.marginLeft = "10px";
  button.onclick = onClick;
  return button;
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
  const description = document.getElementById("description").value.trim();

  if (room && date && time) {
    saveBooking(room, date, time, description);
    updateBookingList();
    updateCalendar();
    alert("Booking request sent! Awaiting confirmation.");
    this.reset();
  } else {
    alert("Please fill in all required fields.");
  }
});

// อัปเดตรายการและปฏิทินเมื่อเริ่มต้น
updateBookingList();
updateCalendar();
