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


// อัปเดตการแสดงผลครั้งแรก
updateBookingList();
