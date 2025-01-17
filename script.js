const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "user1", password: "user123", role: "user" },
];
let currentUser = null;

// ฟังก์ชันล็อกอิน
document.getElementById("login-btn").addEventListener("click", function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

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
function saveBooking(room, date, time) {
  const booking = { room, date, time };
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

    if (currentUser.role === "admin") {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Cancel";
      deleteBtn.style.marginLeft = "10px";
      deleteBtn.onclick = () => {
        bookings.splice(index, 1);
        localStorage.setItem("bookings", JSON.stringify(bookings));
        updateBookingList();
        updateCalendar();
      };
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

  for (let i = 0; i < firstDayIndex; i++) {
    const emptyDiv = document.createElement("div");
    calendarContainer.appendChild(emptyDiv);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("calendar-day");
    dayDiv.innerHTML = `<strong>${day}</strong>`;

    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.forEach((booking) => {
      const bookingDate = new Date(booking.date);
      if (
        bookingDate.getFullYear() === year &&
        bookingDate.getMonth() === month &&
        bookingDate.getDate() === day
      ) {
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

  if (currentUser.role !== "admin") {
    alert("Only admins can book rooms!");
    return;
  }

  const room = document.getElementById("room").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (room && date && time) {
    saveBooking(room, date, time);
    updateBookingList();
    updateCalendar();
    alert("Room booked successfully!");
    this.reset();
  }
});

// เรียกอัปเดตครั้งแรก
updateBookingList();
updateCalendar();
