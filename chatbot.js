const chatbox = document.getElementById("chatbox");
const input = document.getElementById("userInput");
const productsDiv = document.getElementById("products");

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `message ${sender}`;
  message.innerText = text;
  chatbox.appendChild(message);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMessage() {
  const userText = input.value.trim();
  if (!userText) return;

  addMessage(userText, "user");
  input.value = "";

  const res = await fetch("http://127.0.0.1:5000/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText })
  });

  const data = await res.json();
  addMessage(data.response, "bot");

  // Optionally, trigger a product search
  if (userText.toLowerCase().includes("laptop") || userText.toLowerCase().includes("t-shirt")) {
    searchProducts(userText);
  }
}

async function searchProducts(keyword) {
  const res = await fetch(`http://127.0.0.1:5000/search?q=${keyword}`);
  const data = await res.json();

  productsDiv.innerHTML = "<h3>Suggested Products:</h3>";
  data.products.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <strong>${p.name}</strong><br>
      Category: ${p.category}<br>
      Price: ₹${p.price}<br>
      Rating: ${p.rating}<br>
      <p>${p.description}</p>
    `;
    productsDiv.appendChild(card);
  });
}
