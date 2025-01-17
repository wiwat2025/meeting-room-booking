// รายชื่อผู้ใช้
const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "user1", password: "user123", role: "user" },
];

let currentUser = null;

// ฟังก์ชันล็อกอิน
document.getElementById("login-btn").addEventListener("click", () => {
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

  document.getElementById("booking-form").style.display =
    currentUser.role === "user" ? "block" : "none";

  updateBookingList();
  updateCalendar();
}

// ฟังก์ชันล็อกเอาต์
document.getElementById("logout-btn").addEventListener("click", () => {
  currentUser = null;
  document.getElementById("login-form").style.display = "block";
  document.getElementById("app").style.display = "none";
});

// ฟังก์ชันบันทึกการจอง
function saveBooking(room, date, time, description = "") {
  const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

  if (bookings.some((b) => b.room === room && b.date === date && b.time === time)) {
    alert("This room is already booked for the selected time.");
    return;
  }

  bookings.push({
    room,
    date,
    time,
    description: description || "No details",
    confirmed: false,
  });
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
      <div><strong>Description:</strong> ${booking.description}</div>
      <div><strong>Status:</strong> ${booking.confirmed ? "Confirmed" : "Pending Confirmation"}</div>
    `;

    if (currentUser.role === "admin" && !booking.confirmed) {
      li.appendChild(createButton("Confirm", () => confirmBooking(index)));
      li.appendChild(createButton("Cancel", () => deleteBooking(index)));
    }

    bookingList.appendChild(li);
  });
}

// ฟังก์ชันสร้างปฏิทิน
function generateCalendar(year, month) {
  const calendarContainer = document.getElementById("calendar-container");
  calendarContainer.innerHTML = "";

  updateCalendarHeader(year, month);

  const date = new Date(year, month, 1);
  const firstDayIndex = date.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDayIndex; i++) {
    calendarContainer.appendChild(createEmptyDiv());
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("calendar-day");
    dayDiv.innerHTML = `<strong>${day}</strong>`;

    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.forEach((booking) => {
      const [bookingYear, bookingMonth, bookingDay] = booking.date.split("-").map(Number);

      if (bookingYear === year && bookingMonth === month + 1 && bookingDay === day) {
        const bookingSpan = document.createElement("span");
        bookingSpan.classList.add("booking");
        bookingSpan.textContent = `${booking.room} (${booking.time})`;
        dayDiv.appendChild(bookingSpan);

        if (booking.description) {
          const descSpan = document.createElement("span");
          descSpan.classList.add("description");
          descSpan.textContent = booking.description;
          dayDiv.appendChild(descSpan);
        }
      }
    });

    calendarContainer.appendChild(dayDiv);
  }
}

// ฟังก์ชันแสดงส่วนหัวของปฏิทิน (วันที่, เดือน, ปี)
function updateCalendarHeader(year, month) {
  const header = document.getElementById("calendar-header");
  if (!header) {
    const headerElement = document.createElement("div");
    headerElement.id = "calendar-header";
    document.getElementById("calendar-container").before(headerElement);
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  header.innerHTML = `
    <h2>${months[month]} ${year}</h2>
  `;
}

// ฟังก์ชันอัปเดตปฏิทินเมื่อโหลดหน้า
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

// ฟังก์ชันช่วยสร้าง div ว่าง
function createEmptyDiv() {
  const emptyDiv = document.createElement("div");
  emptyDiv.classList.add("empty-day");
  return emptyDiv;
}

// ฟังก์ชันสำหรับการจอง
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

// เรียกใช้งานฟังก์ชันอัปเดตปฏิทินเมื่อโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", () => {
  updateBookingList();
  updateCalendar();
});
