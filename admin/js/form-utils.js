/*==================================================
            SHERPAS FORM UTILITIES
==================================================*/

const API_URL =
"https://script.google.com/macros/s/AKfycbwkjav1SaN7h60-fYSGkATL9Y51Nw7HF3DW0ffeVAPM-Nf12Q0rg3VnxwguH7iVVDnu/exec";

async function checkDuplicateField(field, value) {

    
    value = String(value).trim();

    if (!value) {

        return {
            duplicate: false
        };

    }

    const memberID =
        document.getElementById("memberID")?.value || "";

    const formData = new URLSearchParams();

    formData.append(
        "action",
        "CHECK_DUPLICATE"
    );

    formData.append(
        "data",
        JSON.stringify({

            field: field,

            value: value,

            memberID: memberID

        })
    );

    const response = await fetch(API_URL, {

        method: "POST",

        body: formData

    });

    const result = await response.json();

    return result.data;

}

/*==================================================
        FILE TO BASE64
==================================================*/

function fileToBase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = function (e) {

            resolve(e.target.result);

        };

        reader.onerror = reject;

        reader.readAsDataURL(file);

    });

}

/*==================================================
        GOOGLE DRIVE IMAGE URL
==================================================*/

function driveToImage(url) {

    if (!url) return "";

    const match = url.match(/[-\w]{25,}/);

    if (!match) return url;

    return `https://drive.google.com/thumbnail?id=${match[0]}`;

}

/*==================================================
        FORMAT DATE
==================================================*/

function formatDate(date) {

    return new Date(date).toLocaleDateString("en-GB", {

        day: "2-digit",
        month: "short",
        year: "numeric"

    });

}

async function validateVehicleRegistration() {

    if (window.IS_EDIT_MODE)
        return true;

    const vehicle =
        document.getElementById("vehiclereg").value.trim();

    if (!vehicle)
        return true;

    const result =
        await checkDuplicateField(
            "Vehicle Registration",
            vehicle
        );

    if (result.duplicate) {

        Swal.fire({

            icon: "error",

            title: "Vehicle Already Registered",

            html:
                "<b>Member ID :</b> " +
                result.memberID

        });

        return false;

    }

    return true;

}
async function validateAge() {

    if (window.IS_EDIT_MODE)
        return true;

    const dob = document.getElementById("dob").value;

    if (!dob) {
        return false;
    }

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const month = today.getMonth() - birthDate.getMonth();

    if (
        month < 0 ||
        (month === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    if (age < 18) {

        Swal.fire({

            icon: "warning",

            title: "Age Restriction",

            text: "Applicant must be at least 18 years old."

        });

        document.getElementById("dob").focus();

        return false;

    }

    return true;

}

/*==================================================
        EMPTY CHECK
==================================================*/

function isEmpty(value) {

    return value === null ||
           value === undefined ||
           value.toString().trim() === "";

}

/*==================================================
        PHONE VALIDATION
==================================================*/

function validPhone(phone) {

    return /^[6-9]\d{9}$/.test(phone);

}

/*==================================================
        EMAIL VALIDATION
==================================================*/

function validEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}


async function validatePhone() {

    if (window.IS_EDIT_MODE)
        return true;

    const phone =
        document.getElementById("phone").value.trim();

    if (!phone) return true;

    const result =
        await checkDuplicateField("Phone", phone);

    if (result.duplicate) {

        Swal.fire({
            icon: "error",
            title: "Phone Number Already Registered",
            html: "<b>Member ID :</b> " + result.memberID
        });

        return false;
    }

    return true;
}

async function validateEmail() {

    if (window.IS_EDIT_MODE)
        return true;

    const email =
        document.getElementById("email").value.trim();

    if (!email) return true;

    const result =
        await checkDuplicateField("Email", email);

    if (result.duplicate) {

        Swal.fire({
            icon: "error",
            title: "Email Already Registered",
            html: "<b>Member ID :</b> " + result.memberID
        });

        return false;
    }

    return true;
}

async function validateAadhaar() {

    if (window.IS_EDIT_MODE)
        return true;

    const aadhaar =
        document.getElementById("aadhaar").value.trim();

    if (!aadhaar) return true;

    const result =
        await checkDuplicateField("Aadhaar Number", aadhaar);

    if (result.duplicate) {

        Swal.fire({
            icon: "error",
            title: "Aadhaar Already Registered",
            html: "<b>Member ID :</b> " + result.memberID
        });

        return false;
    }

    return true;
}

async function validateDrivingLicence() {

    if (window.IS_EDIT_MODE)
        return true;

    const licence =
        document.getElementById("license").value.trim();

    if (!licence) return true;

    const result =
        await checkDuplicateField("Driving License", licence);

    if (result.duplicate) {

        Swal.fire({
            icon: "error",
            title: "Driving Licence Already Registered",
            html: "<b>Member ID :</b> " + result.memberID
        });

        return false;
    }

    return true;
}

document.addEventListener("DOMContentLoaded", function () {

    const logo = document.querySelector(".logo");

    if (logo) {

        logo.style.cursor = "pointer";

        logo.addEventListener("click", function () {

            window.location.href = "../index.html";

        });

    }

});