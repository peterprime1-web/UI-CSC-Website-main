// ========================================
// UI CSC STUDENT LOGIN
// ========================================

const form = document.getElementById("student-login-form");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const loginButton = document.getElementById("login-btn");

const loadingSpinner = document.getElementById("loading-spinner");

const togglePassword = document.getElementById("toggle-password");

const rememberMe = document.getElementById("remember-me");

const forgotPassword = document.getElementById("forgot-password");

const loginForm = document.getElementById("student-login-form");

const activateForm = document.getElementById("activate-account-form");

const loginSwitch = document.getElementById("login-switch");

const activateSwitch = document.getElementById("activate-switch");

const showActivate = document.getElementById("show-activate");

const showLogin = document.getElementById("show-login");

const activateMatric = document.getElementById("activate-matric");

const activateEmail = document.getElementById("activate-email");

const activatePassword = document.getElementById("activate-password");

const activateConfirm = document.getElementById("activate-confirm");

// ========================================
// START
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    loadRememberedEmail();

    setupPasswordToggle();

    setupForgotPassword();

    setupLogin();

    setupFormSwitching();

    setupAccountActivation();

});

// ========================================
// LOGIN
// ========================================

function setupLogin(){

    form.addEventListener("submit", async (e)=>{

        e.preventDefault();

        const email = emailInput.value.trim();

        const password = passwordInput.value;

        if(!email || !password){

            toast(

                "Please enter your email and password.",

                "warning"

            );

            return;

        }

        setLoading(true);

        try{

            const credential = await auth

                .signInWithEmailAndPassword(

                    email,

                    password

                );

            const uid = credential.user.uid;

const snapshot = await db

    .ref("students")

    .once("value");

let student = null;

let studentKey = null;

snapshot.forEach((child)=>{

    const value = child.val();

    if(value.uid === uid){

        student = value;

        studentKey = child.key;

    }

});

if(!student){

    await auth.signOut();

    throw new Error(

        "Student record not found."

    );

}
    
            if(
    !student.status ||
    student.status.toLowerCase() !== "active"
){

                await auth.signOut();

                throw new Error(

                    "Your account has been disabled."

                );

            }

            await db

.ref(`students/${studentKey}`)

.update({

    lastLogin: Date.now(),

    online: true

});



            saveRememberedEmail();

            toast(

                "Login successful!",

                "success"

            );

            

            setTimeout(()=>{

                window.location.href = "index.html";

            },800);

            

        }

        catch(error){

            console.error(error);

            handleLoginError(error);

        }

        finally{

            setLoading(false);

        }

    });

}

// ========================================
// LOADING
// ========================================

function setLoading(state){

    loginButton.disabled = state;

    loadingSpinner.classList.toggle(

        "hidden",

        !state

    );

    loginButton.style.display =

        state

        ? "none"

        : "flex";

}
// ========================================
// PASSWORD VISIBILITY
// ========================================

function setupPasswordToggle(){

    togglePassword.addEventListener("click",()=>{

        const visible =

            passwordInput.type === "password";

        passwordInput.type =

            visible

            ? "text"

            : "password";

        togglePassword.innerHTML = `

            <span class="material-icons">

                ${visible ? "visibility_off" : "visibility"}

            </span>

        `;

    });

}

// ========================================
// REMEMBER ME
// ========================================

function saveRememberedEmail(){

    if(rememberMe.checked){

        localStorage.setItem(

            "rememberEmail",

            emailInput.value.trim()

        );

    }

    else{

        localStorage.removeItem(

            "rememberEmail"

        );

    }

}

function loadRememberedEmail(){

    const email = localStorage.getItem(

        "rememberEmail"

    );

    if(email){

        emailInput.value = email;

        rememberMe.checked = true;

    }

}

// ========================================
// FORGOT PASSWORD
// ========================================

function setupForgotPassword(){

    forgotPassword.addEventListener(

        "click",

        async(e)=>{

            e.preventDefault();

            const email = emailInput.value.trim();

            if(!email){

                toast(

                    "Enter your email first.",

                    "warning"

                );

                emailInput.focus();

                return;

            }

            try{

                await auth.sendPasswordResetEmail(

                    email

                );

                toast(

                    "Password reset email sent.",

                    "success"

                );

            }

            catch(error){

                handleLoginError(error);

            }

        }

    );

}

// ========================================
// TOAST
// ========================================

function toast(

    message,

    type="success"

){

    const container =

        document.getElementById(

            "toast-container"

        );

    const toast =

        document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = `

        <span class="material-icons">

            ${

                type==="success"

                ? "check_circle"

                : type==="warning"

                ? "warning"

                : "error"

            }

        </span>

        <div>

            ${message}

        </div>

    `;

    container.appendChild(toast);

    setTimeout(()=>{

        toast.remove();

    },3500);

}

// ========================================
// FIREBASE ERRORS
// ========================================

function handleLoginError(error){

    let message =

        "Unable to sign in.";

    switch(error.code){

        case "auth/user-not-found":

            message =

                "No student account was found with this email.";

            break;

        case "auth/wrong-password":

            message =

                "Incorrect password.";

            break;

        case "auth/invalid-email":

            message =

                "Invalid email address.";

            break;

        case "auth/too-many-requests":

            message =

                "Too many attempts. Please try again later.";

            break;

        case "auth/network-request-failed":

            message =

                "No internet connection.";

            break;

        case "auth/email-already-in-use":

    message="This account has already been activated.";

    break;

case "auth/weak-password":

    message="Password should be at least 6 characters.";

    break;

        default:

            if(error.message){

                message = error.message;

            }

    }

    toast(

        message,

        "error"

    );

    

}

// ========================================
// FORM SWITCHING
// ========================================

function setupFormSwitching(){

    showActivate.addEventListener("click",(e)=>{

        e.preventDefault();

        loginForm.classList.add("hidden");

        loginSwitch.classList.add("hidden");

        activateForm.classList.remove("hidden");

        activateSwitch.classList.remove("hidden");

        activateForm.classList.add("fade-in");

    });

    showLogin.addEventListener("click",(e)=>{

        e.preventDefault();

        activateForm.classList.add("hidden");

        activateSwitch.classList.add("hidden");

        loginForm.classList.remove("hidden");

        loginSwitch.classList.remove("hidden");

        loginForm.classList.add("fade-in");

    });

}

// ========================================
// ACCOUNT ACTIVATION
// ========================================

function setupAccountActivation(){

    activateForm.addEventListener("submit", async (e)=>{

        e.preventDefault();

        const matric = activateMatric.value.trim();

        const email = activateEmail.value.trim().toLowerCase();

        const password = activatePassword.value;

        const confirm = activateConfirm.value;

        if(password !== confirm){

            toast(

                "Passwords do not match.",

                "error"

            );

            return;

        }

        if(password.length < 6){

            toast(

                "Password must be at least 6 characters.",

                "warning"

            );

            return;

        }

        try{

            const snapshot = await db

                .ref("students")

                .once("value");

            let studentKey = null;

            let student = null;

            snapshot.forEach(child=>{

                const value = child.val();

                if(

                    value.matricNumber === matric ||

                    value.matric === matric

                ){

                    studentKey = child.key;

                    student = value;

                }

            });

            if(!student){

                toast(

                    "Matric number not found.",

                    "error"

                );

                return;

            }

            if(

                student.email.toLowerCase() !== email

            ){

                toast(

                    "Email does not match our records.",

                    "error"

                );

                return;

            }

            if(student.uid){

                toast(

                    "This account has already been activated.",

                    "warning"

                );

                return;

            }

            const credential = await auth

                .createUserWithEmailAndPassword(

                    email,

                    password

                );

            await db.ref(`students/${studentKey}`).update({

    uid: credential.user.uid,

    activatedAt: Date.now(),

    lastLogin: Date.now(),

    online: false

});

            toast(

                "Account activated successfully!",

                "success"

            );

            activateForm.reset();

            showLogin.click();

        }

        catch(error){

            handleLoginError(error);

        }

    });

}

