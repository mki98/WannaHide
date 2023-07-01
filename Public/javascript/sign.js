import { showAlert } from "./alerts.js";
import { KeyPairs } from "./keyGen.js";
import { openDatabase, storeKeys } from "./indexDB.js";
let signupBtn = document.getElementById("signupBtn");
let signinBtn = document.getElementById("signinBtn");
let title = document.getElementById("title");
let nameField = document.getElementById("nameField");
let lost = document.getElementById("lost");
let username = document.getElementById("username");
let email = document.getElementById("email");
let password = document.getElementById("password1");
let passwordConfirm = document.getElementById("password2");
let confirmpass = document.getElementById("confirmpass");
signinBtn.addEventListener("click", function (e) {
  e.preventDefault();
  nameField.style.maxHeight = "0";
  confirmpass.style.maxHeight = "0";
  title.innerHTML = `Sign in`;
  signupBtn.classList.add("disable");
  confirmpass.classList.add("disable");
  signinBtn.classList.remove("disable");

  lost.innerHTML = `Lost Password <a href="#"> Click Here!</a>`;
  if (email.value && password.value) {
    axios({
      method: "POST",
      url: "http://localhost:5000/api/v1/users/login",
      data: {
        email: email.value,
        password: password.value,
      },
    })
      .then((res) => {
        if (res.data.status == "Success") {
          showAlert("success", res.data?.message);
          window.setTimeout(() => {
            location.assign("/chat");
          }, 1000);
        }
      })
      .catch((error) => {
        showAlert("error", error.response.data?.message);
      });
  }
});

signupBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  nameField.style.maxHeight = "60px";
  confirmpass.style.maxHeight = "60px";
  title.innerHTML = `Sign Up`;
  signupBtn.classList.remove("disable");
  signinBtn.classList.add("disable");
  lost.innerHTML = ``;
  if (username.value && email.value && password.value && passwordConfirm) {
    let user = new KeyPairs();
    axios({
      method: "POST",
      url: "http://localhost:5000/api/v1/users/signup",
      data: {
        username: username.value,
        email: email.value,
        password: password.value,
        passwordConfirm: passwordConfirm.value,
        publicKey: `${user.publicKey.toString()}`,
      },
    })
      .then(async (res) => {
        if (res.data.status == "Success") {
          try {
            const db = await openDatabase("User", 1, [
              { name: "keys", keyPath: "id" },
            ]);
            await storeKeys(
              db,
              res.data.user._id,
              user.publicKey.toString(),
              user.privateKey.toString()
            );
          } catch (e) {
            console.log(e.message);
          }
          showAlert("success", res.data.message);
        }
      })
      .catch((error) => {
        showAlert("error", error.response.data.message);
      });
  }
});
