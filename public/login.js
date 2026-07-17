

const email = document.getElementById("login-email");

const password = document.getElementById("login-password");

const remember = document.getElementById("remember-me");

const loginBtn = document.getElementById("login-btn");

const errorText = document.getElementById("login-error");

loginBtn.onclick = login;

password.addEventListener("keypress", e=>{

    if(e.key==="Enter")

        login();

});

async function login(){
    // At the top of your login() function, clear previous errors and hide the box
errorText.textContent = "";
errorText.classList.remove("active");

    

    const userEmail=email.value.trim();

    const userPassword=password.value;

    if(!userEmail||!userPassword){

        errorText.textContent="Enter your email and password.";

        return;

    }

    loginBtn.disabled=true;

    loginBtn.textContent="Signing in...";

    try{

        const persistence = remember.checked

            ? firebase.auth.Auth.Persistence.LOCAL

            : firebase.auth.Auth.Persistence.SESSION;

        await auth.setPersistence(persistence);

        const credential = await auth.signInWithEmailAndPassword(

            userEmail,

            userPassword

        );

        const uid = credential.user.uid;

        const snap = await db.ref("admins").orderByChild("uid").equalTo(uid).once("value");

        if(!snap.exists()){

            await auth.signOut();

            throw new Error("You are not registered as an administrator.");

        }

        let admin;

        snap.forEach(child=>{

            admin = {

                id: child.key,

                ...child.val()

            };

        });

        if(admin.status !== "Active"){

            await auth.signOut();

            throw new Error("Your administrator account is disabled.");

        }

        sessionStorage.setItem(

            "admin",

            JSON.stringify(admin)

        );

        await checkAuth();

        location.replace("admin.html");
    }

    catch(err){

        console.error(err);

        // Display the error and make the container visible
errorText.textContent = "An error occurred during login. Try again";
errorText.classList.add("active");

    }

    finally{

        loginBtn.disabled=false;

        loginBtn.textContent="Login";

    }

}

