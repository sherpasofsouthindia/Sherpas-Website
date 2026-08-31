const ADMIN_API =
"https://script.google.com/macros/s/AKfycbyEsRyyMII7sBskySkuCUAznl8EOBGL81dj3ijCTRKIwmW6Xkp9Nkfb2kHDGFcTToERnw/exec";


async function verifyAdminSession() {

    const token =
        sessionStorage.getItem("sherpas_admin_token");


    /*----------------------------------
            CHECK TOKEN
    ----------------------------------*/

    if (!token) {

        window.location.href =
            "login.html";

        return false;

    }


    try {

        const url =
            ADMIN_API +
            "?action=VERIFY_ADMIN" +
            "&token=" +
            encodeURIComponent(token);


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Server returned HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        /*----------------------------------
            VERIFY SESSION
        ----------------------------------*/

        if (
            !result.success ||
            !result.authenticated
        ) {

            sessionStorage.removeItem(
                "sherpas_admin_token"
            );

            sessionStorage.removeItem(
                "sherpas_admin_email"
            );


            window.location.href =
                "login.html";

            return false;

        }


        return true;

    }

    catch(error) {

        console.error(
            "Session verification failed:",
            error
        );


        sessionStorage.removeItem(
            "sherpas_admin_token"
        );

        sessionStorage.removeItem(
            "sherpas_admin_email"
        );


        window.location.href =
            "login.html";

        return false;

    }

}


verifyAdminSession();