async function checkAuth(){

    return new Promise(resolve=>{

        auth.onAuthStateChanged(async user=>{

            if(!user){

                location.replace("login.html");

                return;

            }

            const snap = await db.ref("admins")

                .orderByChild("uid")

                .equalTo(user.uid)

                .once("value");

            if(!snap.exists()){

                await auth.signOut();

                location.replace("login.html");

                return;

            }

            let admin;

            snap.forEach(child=>{

                admin = {

                    id:child.key,

                    ...child.val()

                };

            });

            if(admin.status!=="Active"){

                await auth.signOut();

                location.replace("login.html");

                return;

            }

           window.currentAdmin = admin;
           window.permissions =
    admin.permissions || {};

sessionStorage.setItem(
    "currentAdminId",
    admin.id
);

if (
    admin.mustChangePassword &&
    !location.pathname.endsWith("change-password.html")
) {

    location.replace("change-password.html");
    return;

}

resolve(admin); 

        });

    });

}

