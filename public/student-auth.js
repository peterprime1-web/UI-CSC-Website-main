// ========================================
// UI CSC PORTAL
// STUDENT AUTH
// ========================================

let currentStudent = null;

let currentStudentKey = null;

// ========================================
// CHECK AUTH
// ========================================

async function checkAuth(){

    return new Promise((resolve,reject)=>{

        auth.onAuthStateChanged(async(user)=>{

            try{

                if(!user){

                    window.location.href="student-login.html";

                    return;

                }

                const snapshot = await db

                    .ref("students")

                    .once("value");

                let found = false;

                snapshot.forEach((child)=>{

                    const student = child.val();

                    if(student.uid === user.uid){

                        found = true;

                        currentStudent = {
    ...student,
    id: child.key
};

                        currentStudentKey = child.key;

                    }

                });

                if(!found){

                    await auth.signOut();

                    window.location.href="student-login.html";

                    return;

                }

                if(currentStudent.status !== "Active"){

                    await auth.signOut();

                    alert(

                        "Your account has been disabled."

                    );

                    window.location.href="student-login.html";

                    return;

                }

                resolve(currentStudent);

            }

            catch(error){

                console.error(error);

                reject(error);

            }

        });

    });

}

// ========================================
// UPDATE ONLINE STATUS
// ========================================

async function updateOnlineStatus(isOnline){

    if(!currentStudentKey) return;

    try{

        await db

            .ref(`students/${currentStudentKey}`)

            .update({

                online:isOnline,

                lastLogin:Date.now()

            });

    }

    catch(error){

        console.error(error);

    }

}

// ========================================
// LOGOUT
// ========================================

async function logout(){

    try{

        await updateOnlineStatus(false);

        await auth.signOut();

        window.location.href="student-login.html";

    }

    catch(error){

        console.error(error);

    }

}

// ========================================
// AUTO ONLINE/OFFLINE
// ========================================

window.addEventListener("beforeunload",()=>{

    updateOnlineStatus(false);

});

document.addEventListener("visibilitychange",()=>{

    if(!currentStudentKey) return;

    if(document.hidden){

        updateOnlineStatus(false);

    }

    else{

        updateOnlineStatus(true);

    }

});

// ========================================
// GETTERS
// ========================================

function getCurrentStudent(){

    return currentStudent;

}

function getCurrentStudentKey(){

    return currentStudentKey;

}

