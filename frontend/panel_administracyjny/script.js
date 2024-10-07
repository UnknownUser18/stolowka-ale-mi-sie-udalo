const socket = new WebSocket("ws://localhost:8080");

// Connection opened
socket.addEventListener("open", (event) => {
  socket.send("Hello Server!");

});

// Listen for messages
socket.addEventListener("message", (event) => {
  console.log("Message from server ", event.data);
});
let eye = document.getElementById("eye");
eye.addEventListener("click", () => {
    let password = document.getElementById("password")
    let img = eye.querySelector("img")
    if (password.type === "password") {
        password.type = "text"
        img.src = "eye_closed.svg"

    } else {
        password.type = "password"
        img.src = "eye_open.svg"
    }
})