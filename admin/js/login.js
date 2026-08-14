const ADMIN_API =
"https://script.google.com/macros/s/AKfycbxcoPESR32V3Xl4yG4Mk59uv-0Pr1ZQ4yAHOHlmX2ljvQsNY3-71Gcpj5pwEICtditg9g/exec";


document
.getElementById("loginForm")
.addEventListener("submit", async function(e) {

    e.preventDefault();

    const email =
        document
            .getElementById("email")
            .value
            .trim();

    const password =
        document
            .getElementById("password")
            .value;


    const button =
        this.querySelector("button");


    button.disabled = true;

    button.textContent =
        "Logging in...";


    try {

        /*========================================
                PREPARE LOGIN REQUEST
        ========================================*/

        const params =
            new URLSearchParams();


        params.append(
            "action",
            "LOGIN"
        );


        params.append(
            "email",
            email
        );


        params.append(
            "password",
            password
        );


        /*========================================
                SEND LOGIN REQUEST
        ========================================*/

        const response =
            await fetch(
                ADMIN_API,
                {
                    method: "POST",
                    body: params
                }
            );


        if (!response.ok) {

            throw new Error(
                "Server returned HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "Login response:",
            result
        );


        /*========================================
                CHECK LOGIN RESPONSE
        ========================================*/

        if (
            !result.success ||
            !result.data ||
            !result.data.token
        ) {

            throw new Error(
                result.message ||
                "Invalid login."
            );

        }


        /*========================================
                SAVE AUTHENTICATION SESSION
        ========================================*/

        sessionStorage.setItem(
            "sherpas_admin_token",
            result.data.token
        );


        sessionStorage.setItem(
            "sherpas_admin_email",
            email
        );


        console.log(
            "Admin token saved successfully."
        );


        /*========================================
                GO TO DASHBOARD
        ========================================*/

        window.location.href =
            "dashboard.html";

    }


    catch(error) {

        console.error(
            "Login error:",
            error
        );


        alert(
            error.message ||
            "Login failed."
        );


        button.disabled = false;

        button.textContent =
            "Login";

    }

});


/*==================================================
        LOGOUT
==================================================*/

async function logoutAdmin() {

    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );


    try {

        if (token) {

            const params =
                new URLSearchParams();


            params.append(
                "action",
                "LOGOUT"
            );


            params.append(
                "token",
                token
            );


            await fetch(
                ADMIN_API,
                {
                    method: "POST",
                    body: params
                }
            );

        }

    }

    catch(error) {

        console.error(
            "Logout error:",
            error
        );

    }


    /*----------------------------------
            CLEAR SESSION
    ----------------------------------*/

    sessionStorage.removeItem(
        "sherpas_admin_token"
    );


    sessionStorage.removeItem(
        "sherpas_admin_email"
    );


    window.location.href =
        "login.html";

}