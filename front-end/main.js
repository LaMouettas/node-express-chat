const server = "http://127.0.0.1:3000";
const socket = io(server);

let messagesCount = 0;

(function () {
  socket.on("notification", (data) => {
    console.log("Message depuis le seveur:", data);
  });

  fetch(`${server}/api/messages`)
    .then((res) => {
      return res.json();
    })
    .then((messages) => {
      messagesCount = messages.length;
      messages.forEach((message) => {
        addMessage(message);
      });
    });

  //add submit event listener to the submit button and prevent default submit
  const submitButton = document.getElementById("submit");
  submitButton.addEventListener("click", (e) => {
    e.preventDefault();
    sendMessage();
  });

  //add event listener to the input to send the message when the enter key is pressed
  const input = document.getElementById("message-to-send");
  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  //notification new message
  socket.on("notification", (data) => {
    if (data.type === "new_message") {
      messagesCount++;
      addMessage(data.data);
    }
  });
})();

//Date format function
function padTo2Digits(num) {
  return num.toString().padStart(2, "0");
}
function formatDate(date) {
  return (
    // [
    //   date.getFullYear(),
    //   padTo2Digits(date.getMonth() + 1),
    //   padTo2Digits(date.getDate()),
    // ].join("-") +
    // " " +
    [
      padTo2Digits(date.getHours()),
      padTo2Digits(date.getMinutes()),
      //   padTo2Digits(date.getSeconds()),
    ].join(":")
  );
}

//Add a message to the chat when the submit button is pressed
async function sendMessage() {
  const content = document.getElementById("message-to-send").value;
  //soket io id
  const from = socket.id;
  const to = "John Doe";
  const date = new Date();
  const message = { content, from, to, date };
  //fetch post request to the api
  let res = await fetch(`${server}/api/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
  if (res.status === 201) {
    //clear the input
    document.getElementById("message-to-send").value = "";
    //add the message to the chat
    socket.emit("all", message);
  } else {
    alert("Erreur lors de l'envoi du message");
  }
}

function addMessage({ content, from, to, date: dateISO }) {
  // resfresh the title with the number of new messages
  const title = document.getElementById("title");
  title.innerHTML = "RIL - CHAT" + " (" + messagesCount + " new messages)";

  const messages = document.getElementById("messages");
  const messageElement = document.createElement("li");
  //transform dateIso to date
  const date = new Date(dateISO);
  messageElement.classList.add("me");
  messageElement.innerHTML = `
    <div class="name">
        <span class="">${from}</span>
    </div>
    <div class="message">
        <p>${content}</p>
        <span class="msg-time">${formatDate(date)}</span>
    </div>`;

  messages.appendChild(messageElement);
}
