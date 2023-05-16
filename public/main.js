const postBtn = document.querySelector("#postBtn");
const allContentDiv = document.querySelector("#allContentDiv");
const loginForm = document.querySelector("#login");
const loginName = document.querySelector("#loginName");
const loginPassword = document.querySelector("#loginPassword");
const registerH1 = document.querySelector("#registerH1");
const registerForm = document.querySelector("#register");
const registerName = document.querySelector("#registerName");
const registerPassword = document.querySelector("#registerPassword");
const hiddenDiv = document.querySelector("#hiddenDiv");

// Logga in
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const result = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: loginName.value,
      password: loginPassword.value,
    }),
  });
  if (result.status === 200) {
    loginForm.classList.add("hidden");
    registerH1.innerHTML = "Welcome " + loginName.value;
    registerForm.classList.add("hidden");
    hiddenDiv.classList.remove("hidden");
  }
  loggedIn();
  const data = await result.json();
  console.log(data);
});

// Kollar om man är inloggad
const loggedIn = async () => {
  const result = await fetch("/api/loggedin");
  const user = await result.json();
  if (user.user) {
    loginForm.classList.add("hidden");
    registerH1.innerHTML = "Welcome " + user.user;
    logoutForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
  } else {
    logoutForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    loginForm.classList.remove("hidden");
  }
};

// Registrera ny användare
registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const result = await fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user: registerName.value,
      password: registerPassword.value,
    }),
  });
  if (result.status === 200) {
    registerForm.classList.add("hidden");
    loginForm.classList.add("hidden");
    logoutForm.classList.remove("hidden");
    registerH1.innerHTML = "Welcome " + registerName.value;
    hiddenDiv.classList.remove("hidden");
  }
  const data = await result.json();
  console.log(data);
});

// Logga ut
const logoutForm = document.querySelector("#logout");
logoutForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const result = await fetch("/api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (result.status === 200) {
    logoutForm.classList.add("hidden");
    registerH1.innerHTML = "You are logged out";
    loginForm.classList.remove("hidden");
    registerForm.classList.remove("hidden");
    hiddenDiv.classList.add("hidden");
  }
  const data = await result.json();
  console.log(data);
});

//////////////////////////////////////////////

// HÄMTA ALLA KONTON

const newAccount = async () => {
  let title = document.querySelector("#title").value;
  let saldo = document.querySelector("#saldo").value;
  let response = await fetch("/newaccount", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: `${title}`,
      saldo: `${saldo}`,
    }),
  });

  allAccounts();
  console.log(response);
};

const deleteAccount = async (id) => {
  try {
    let response = await fetch(`/account/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: `${id}`,
      }),
    });
    console.log(response);
    allAccounts();
  } catch (error) {
    console.error("Error deleting account:", error);
  }
};

const allAccounts = async () => {
  let response = await fetch("http://localhost:3003/accounts");
  let data = await response.json();
  console.log(data);
  allContentDiv.innerHTML = "";
  data.forEach((post) => {
    const accountId = post._id;
    allContentDiv.innerHTML += `
    <div class="accountDiv">
    <button id="deleteBtn" data-id="${post._id}" class="deleteBtn">Radera ditt konto</button>
    <h3>${post.title}</h3>
    <h4>Kontonummer:</h4>
    <p> ${accountId}</p>
    <h4>Saldo:</h4>
    <p> ${post.saldo} SEK</p>
    <br>
    <div id="updateDiv${accountId}" class="updateDiv">
      <br>
      <div class="depositDiv">
      <input id="depositSaldo${accountId}" type="number" placeholder="Belopp att sätta in">
      <button id="depositBtn" data-id="${accountId}">Sätt in pengar</button>
      </div>
      <div class="withdrawDiv">
      <input id="withdrawSaldo${accountId}" type="number" placeholder="Belopp att ta ut">
      <button id="withdrawBtn" data-id="${accountId}">Ta ut pengar</button>
      </div>
    </div>
    </div>
    `;
  });
  
  // <button id="editBtn" data-id="${post._id}" class="editBtn">Hantera dina pengar</button>
  // let editBtn = document.querySelectorAll(`#editBtn`);
  // editBtn.forEach((btn) =>
  //   btn.addEventListener("click", () => {
  //     const accountId = btn.dataset.id;
  //     const updateDiv = document.querySelector(`#updateDiv${accountId}`);
  //     updateDiv.classList.toggle("hidden");
  //   })
  // );

  let deleteBtn = document.querySelectorAll("#deleteBtn");
  deleteBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      const accountId = btn.dataset.id;
      deleteAccount(accountId);
    });
  });

  let withdrawBtn = document.querySelectorAll("#withdrawBtn");
  withdrawBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      const accountId = btn.dataset.id;
      withdrawSaldo(accountId);
    });
  });

  let depositBtn = document.querySelectorAll("#depositBtn");
  depositBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      const accountId = btn.dataset.id;
      depositSaldo(accountId);
    });
  });
};

const depositSaldo = async (id) => {
  let saldoInput = document.querySelector(`#depositSaldo${id}`);
  let saldo = saldoInput.value;
  
  const getSaldos = await fetch(`/account/${id}`);
  const oldSaldo = await getSaldos.json();
  console.log(oldSaldo.saldo);
  console.log(saldo);

  if (saldo <= 0) {
    alert("Du kan inte sätta in ett negativt belopp");
    return;
  }

  saldo = parseInt(oldSaldo.saldo) + parseInt(saldo);

  let response = await fetch(`/accounts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      saldo: `${saldo}`,
      title: `${oldSaldo.title}`,
    }),
  });
  console.log(response);
  allAccounts();
};

const withdrawSaldo = async (id) => {
  let saldoInput = document.querySelector(`#withdrawSaldo${id}`);
  let saldo = saldoInput.value;

  const getSaldos = await fetch(`/account/${id}`);
  const oldSaldo = await getSaldos.json();
  console.log(oldSaldo.saldo);
  console.log(oldSaldo.title);

  if (saldo <= 0) {
    alert("Du kan inte ta ut ett negativt belopp");
    return;
  }

  if (parseInt(saldo) > parseInt(oldSaldo.saldo)) {
    alert("Du kan inte ta ut mer än vad du har på kontot");
    return;
  }

  saldo = parseInt(oldSaldo.saldo) - parseInt(saldo);

  let response = await fetch(`/accounts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      saldo: `${saldo}`,
      title: `${oldSaldo.title}`,
    }),
  });
  console.log(response);
  allAccounts();
};

allAccounts();

postBtn.addEventListener("click", newAccount);
