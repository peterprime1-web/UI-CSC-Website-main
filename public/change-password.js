document.addEventListener("DOMContentLoaded", async () => {

    await checkAuth();

    $("#change-password-btn").onclick = changePassword;

});

async function changePassword() {

    const currentPassword =
        $("#current-password").value.trim();

    const newPassword =
        $("#new-password").value.trim();

    const confirmPassword =
        $("#confirm-password").value.trim();

    if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {

        toast(
            "Fill all fields.",
            "error"
        );

        return;

    }

    if (newPassword !== confirmPassword) {

        toast(
            "Passwords do not match.",
            "error"
        );

        return;

    }

    if (newPassword.length < 6) {

        toast(
            "Password must be at least 6 characters.",
            "error"
        );

        return;

    }

    showLoading();

    try {

        const credential =
            firebase.auth.EmailAuthProvider.credential(

                auth.currentUser.email,

                currentPassword

            );

        await auth.currentUser.reauthenticateWithCredential(
            credential
        );

        await auth.currentUser.updatePassword(
            newPassword
        );

        const adminId =
            sessionStorage.getItem(
                "currentAdminId"
            );

        await db.ref(
            "admins/" + adminId
        ).update({

            mustChangePassword: false,

            updatedAt: Date.now()

        });

        toast(
            "Password updated.",
            "success"
        );

        setTimeout(() => {

            location.replace(
                "admin.html"
            );

        },1000);

    }

    catch(err){

        console.error(err);

        toast(
            err.message,
            "error"
        );

    }

    finally{

        hideLoading();

    }

    $("#profile-password").onclick=()=>{

    location.href="change-password.html";

};

}