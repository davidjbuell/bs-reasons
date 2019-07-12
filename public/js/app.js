console.log(navigator);
if ("serviceWorker" in navigator) {
    console.log("test");
    navigator.serviceWorker
        .register("/serviceworker.js", { scope: "/" })
        .then(function(reg) {
            if (reg.installing) {
                console.log("Service worker installing");
            } else if (reg.waiting) {
                console.log("Service worker installed");
            } else if (reg.active) {
                console.log("Service worker active");
            }
        })
        .catch(function(error) {
            // registration failed
            console.log("Registration failed with " + error);
        });
}

// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDYTz8DFM_VACXe9Tjt3bSTI_zhL4EZeT4",
    authDomain: "berkshire-hathaway-13d3d.firebaseapp.com",
    databaseURL: "https://berkshire-hathaway-13d3d.firebaseio.com",
    projectId: "berkshire-hathaway-13d3d",
    storageBucket: "berkshire-hathaway-13d3d.appspot.com",
    messagingSenderId: "993714685183",
    appId: "1:993714685183:web:e86bd59dc70ba26e",
};

firebase.initializeApp(firebaseConfig);

// Request data from Firebase
const dbRef = firebase.database().ref("reasons");

// setup dom references
let myReasonList = new reasonList();

dbRef.on("child_added", child => {
    myReasonList.init(child.val());
});

// create reason list object
function reasonList() {
    const myList = this;
    this.container = document.querySelector(".reasonListContainer");
    this.addButton = document.querySelector(".addReason");
    this.formcontainer = null;

    // setup add Reason event logic
    this.addButton.addEventListener("click", e => this.addReason(e, myList));

    // setup add Reason save logic
    this.container.addEventListener("click", e => this.saveReason(e, myList));
}

// setup init function
reasonList.prototype.init = function(reason) {
    let ul = this.container.querySelector("ul") || document.createElement("ul");
    let lastUpdated = new Date(reason.updatedAt).toDateString();
    let li = document.createElement("li");
    let h2 = document.createElement("h2");
    let p = document.createElement("p");
    let small = document.createElement("small");
    h2.textContent = reason.title;
    p.textContent = reason.text;
    small.textContent = lastUpdated;

    p.appendChild(small);
    li.setAttribute("aria-hidden", "true");
    li.appendChild(h2);
    li.appendChild(p);
    ul.insertAdjacentElement("afterbegin", li);

    this.container.appendChild(ul);

    window.setTimeout(function() {
        li.removeAttribute("aria-hidden");
    }, 20);
};

// setup add reason form method
reasonList.prototype.addReason = function(e, myList) {
    if (this.addFormEnabled) {
        this.addButton.classList.remove("close");
        this.formContainer.classList.add("inactive");
    } else {
        this.formContainer
            ? (this.formContainer.classList.remove("inactive"), this.addButton.classList.add("close"))
            : fetch("/includes/reasonForm.html")
                  .then(function(response) {
                      return response.text();
                  })
                  .then(function(myText) {
                      myList.container.insertAdjacentHTML("afterbegin", myText);
                      myList.formContainer = document.querySelector(".reasonFormContainer");

                      window.setTimeout(function() {
                          myList.addButton.classList.add("close");
                          myList.formContainer.classList.remove("inactive");
                          myList.formContainer.querySelector('[name="reasonTitle"]').focus();
                      }, 20);
                  });
    }

    this.addFormEnabled = this.addFormEnabled ? false : true;
};

// setup save reason method
reasonList.prototype.saveReason = function(e) {
    if (e.target && e.target.classList.contains("btnSave")) {
        const reasonForm = document.querySelector(".reasonForm");

        firebase
            .database()
            .ref("reasons")
            .push({
                title: reasonForm.reasonTitle.value,
                text: reasonForm.reasonText.value,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                updatedAt: firebase.database.ServerValue.TIMESTAMP,
            });

        reasonForm.reasonTitle.value = "";
        reasonForm.reasonText.value = "";
    }
};

// handle child added response from firebase
reasonList.prototype.handleChildAdded = function(child) {
    console.log(child);
};
