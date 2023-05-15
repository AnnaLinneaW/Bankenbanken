const postBtn = document.querySelector("#postBtn");
const allContentDiv = document.querySelector("#allContentDiv");

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
    <p>Kontonummer: ${accountId}</p>
    <p>Saldo: ${post.saldo} SEK</p>
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
