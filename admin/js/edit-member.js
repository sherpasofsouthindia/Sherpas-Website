/*==================================================
        SHERPAS EDIT MEMBER
==================================================*/

window.IS_EDIT_MODE = true;


/*==================================================
        CONFIG
==================================================*/

const EDIT_API_URL =
    "https://script.google.com/macros/s/AKfycbxtf2NG24jzV941AgKd81kMg0eZYLmta8cx4Qr3E22jLO7xqXWUGZ5phJWEOsun3nYZ/exec";


/*==================================================
        APPLICATION ID FROM URL
==================================================*/

const EDIT_APPLICATION_ID =
    new URLSearchParams(
        window.location.search
    ).get("applicationID");


/*==================================================
        MEMBER DATA
==================================================*/

let currentMember = null;


/*==================================================
        INITIALIZE
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "Edit Member Page Loaded"
        );

        console.log(
            "Application ID:",
            EDIT_APPLICATION_ID
        );


        if (!EDIT_APPLICATION_ID) {

            Swal.fire({

                icon: "error",

                title: "Application ID Missing",

                text:
                    "Unable to identify the member record."

            }).then(function () {

                window.location.href =
                    "members.html";

            });

            return;

        }


        /*------------------------------------------
                INITIALIZE DROPDOWNS
        ------------------------------------------*/

        if (
            typeof initializeFormData ===
            "function"
        ) {

            initializeFormData();

        }


        /*------------------------------------------
                LOAD MEMBER
        ------------------------------------------*/

        await loadMemberForEdit();


        /*------------------------------------------
                SETUP REPLACEMENT PREVIEWS
        ------------------------------------------*/

        setupReplacementPreview(
            "photo",
            "photoPreview",
            false
        );

        setupReplacementPreview(
            "signatureFile",
            "signaturePreview",
            true
        );

        /*------------------------------------------
                FORM SUBMIT
        ------------------------------------------*/

        const form =
            document.getElementById(
                "membershipForm"
            );

        if (form) {

            form.addEventListener(
                "submit",
                updateMemberSubmit
            );

        }

    }
);


/*==================================================
        LOAD MEMBER DATA
==================================================*/

async function loadMemberForEdit() {

    Swal.fire({

        title: "Loading Member",

        text:
            "Please wait...",

        allowOutsideClick: false,

        didOpen: function () {

            Swal.showLoading();

        }

    });


    try {

        const response =
            await fetch(
                EDIT_API_URL
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load members."
            );

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Failed to load members."
            );

        }


        const members =
            result.members || [];


        currentMember =
            members.find(function (member) {

                return String(
                    member["Application ID"] || ""
                ).trim() ===
                EDIT_APPLICATION_ID;

            });


        if (!currentMember) {

            throw new Error(
                "Member application not found."
            );

        }


        console.log(
            "Member loaded:",
            currentMember
        );


        populateMemberForm(
            currentMember
        );


        Swal.close();

    }

    catch (error) {

        console.error(
            "LOAD MEMBER ERROR:",
            error
        );


        Swal.fire({

            icon: "error",

            title: "Unable to Load Member",

            text:
                error.message

        }).then(function () {

            window.location.href =
                "members.html";

        });

    }

}


/*==================================================
        POPULATE FORM
==================================================*/

function populateMemberForm(member) {

    /*------------------------------------------
            SYSTEM FIELDS
    ------------------------------------------*/

    setValue(
        "applicationID",
        member["Application ID"]
    );

    setValue(
        "memberID",
        member["Membership ID"]
    );

    setValue(
        "memberStatus",
        member["Status"]
    );


    /*------------------------------------------
            APPLICATION DATE DISPLAY
    ------------------------------------------*/

    const applicationDateView =
        document.getElementById(
            "applicationDateView"
        );

    if (applicationDateView) {

        applicationDateView.value =
            formatDateForInput(
                member["Application Date"]
            );

    }


    /*------------------------------------------
            PERSONAL DETAILS
    ------------------------------------------*/

    setValue(
        "fullname",
        member["Full Name"]
    );

    setDateValue(
        "dob",
        member["Date of Birth"]
    );

    setValue(
        "gender",
        member["Gender"]
    );

    setValue(
        "maritalstatus",
        member["Marital Status"]
    );

    setValue(
        "bloodgroup",
        member["Blood Group"]
    );

    setValue(
        "aadhaar",
        member["Aadhaar Number"]
    );


    /*------------------------------------------
            ADDRESS
    ------------------------------------------*/

    setValue(
        "address",
        member["Address"]
    );

    setValue(
        "state",
        member["State"]
    );


    /* IMPORTANT:
       Populate district AFTER state
    */

    if (
        typeof populateDistricts ===
        "function"
    ) {

        populateDistricts(
            member["State"]
        );

    }

    setValue(
        "district",
        member["District"]
    );

    setValue(
        "pincode",
        member["PIN Code"]
    );


    /*------------------------------------------
            HEALTH
    ------------------------------------------*/

    setValue(
        "healthissues",
        member["Health Issues"]
    );

    setValue(
        "healthdetails",
        member["Health Details"]
    );


    /*------------------------------------------
            CONTACT
    ------------------------------------------*/

    setValue(
        "phone",
        member["Phone"]
    );

    setValue(
        "email",
        member["Email"]
    );

    setValue(
        "emergency1",
        member["Emergency Contact 1"]
    );

    setValue(
        "emergency2",
        member["Emergency Contact 2"]
    );


    /*------------------------------------------
            VEHICLE
    ------------------------------------------*/

    setValue(
        "motorcyclemodel",
        member["Motorcycle Model"] ||
        member["Vehicle Name"]
    );


    if (
        typeof populateVariants ===
        "function"
    ) {

        populateVariants(
            member["Motorcycle Model"] ||
            member["Vehicle Name"]
        );

    }

    setValue(
        "vehiclevariant",
        member[
            "Vehicle Colour / Variant"
        ]
    );

    setValue(
        "vehiclereg",
        member[
            "Vehicle Registration"
        ]
    );

    setValue(
        "license",
        member[
            "Driving License"
        ]
    );

    setValue(
        "enginenumber",
        member[
            "Engine Number"
        ]
    );

    setValue(
        "chassisnumber",
        member[
            "Chassis Number"
        ]
    );


    /*------------------------------------------
            OCCUPATION
    ------------------------------------------*/

    setValue(
        "working",
        member["Occupation"]
    );


    /*------------------------------------------
            CLUB DETAILS
    ------------------------------------------*/

    setValue(
        "otherclub",
        member["Other Club"]
    );

    setValue(
        "otherclubdetails",
        member[
            "Other Club Details"
        ]
    );

    setValue(
        "officialpost",
        member["Official Post"]
    );

    setValue(
        "officialpostdetails",
        member[
            "Official Post Details"
        ]
    );

    setValue(
        "social",
        member["Social Media"]
    );


    /*------------------------------------------
            FAMILY
    ------------------------------------------*/

    setValue(
        "father",
        member["Father Name"]
    );

    setValue(
        "mother",
        member["Mother Name"]
    );


    /*------------------------------------------
            ACCIDENT
    ------------------------------------------*/

    setValue(
        "accident",
        member["Accident History"]
    );

    setValue(
        "accidentdetails",
        member[
            "Accident Details"
        ]
    );


    /*------------------------------------------
            FILE URL PREVIEW
    ------------------------------------------*/

    showExistingImage(
        "photoPreview",
        member["Photo URL"]
    );

    showExistingImage(
        "signaturePreview",
        member["Signature URL"]
    );


    /*------------------------------------------
            PAYMENT PROOF
    ------------------------------------------*/

    showExistingImage(
        "paymentPreview",
        member["Payment Proof URL"]
    );


    /*------------------------------------------
            SHOW CONDITIONAL FIELDS
    ------------------------------------------*/

    triggerConditionalFields();

}


/*==================================================
        SET VALUE
==================================================*/

function setValue(id, value) {

    const element =
        document.getElementById(id);

    if (!element)
        return;

    element.value =
        value === undefined ||
        value === null
            ? ""
            : value;

}


/*==================================================
        SET DATE VALUE
==================================================*/

function setDateValue(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (!element || !value)
        return;

    const date =
        new Date(value);

    if (!isNaN(date)) {

        const year =
            date.getFullYear();

        const month =
            String(
                date.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                date.getDate()
            ).padStart(2, "0");

        element.value =
            `${year}-${month}-${day}`;

    }

}


/*==================================================
        FORMAT DATE
==================================================*/

function formatDateForInput(value) {

    if (!value)
        return "";

    const date =
        new Date(value);

    if (isNaN(date))
        return String(value);

    return date.toLocaleDateString(
        "en-GB",
        {

            day: "2-digit",

            month: "short",

            year: "numeric"

        }
    );

}


function showExistingImage(previewID, url) {

    console.log("Loading image:", previewID, url);

    const preview =
        document.getElementById(previewID);

    if (!preview) {

        console.warn(
            "Preview element not found:",
            previewID
        );

        return;
    }

    if (!url) {

        console.warn(
            "No image URL found:",
            previewID
        );

        return;
    }

    let imageURL = String(url);

    const match =
        imageURL.match(/[-\w]{25,}/);

    if (match) {

        imageURL =
            "https://drive.google.com/thumbnail?id=" +
            match[0] +
            "&sz=w800";

    }

    console.log(
        "Final Image URL:",
        imageURL
    );


    // If preview itself is an IMG
    if (
        preview.tagName === "IMG"
    ) {

        preview.onload = function () {

            console.log(
                "Image loaded successfully:",
                previewID
            );

            preview.style.display =
                "block";

        };

        preview.onerror = function () {

            console.error(
                "Image failed to load:",
                imageURL
            );

        };

        preview.src = imageURL;

        preview.style.display =
            "block";

        return;

    }


    // If preview is a DIV / container
    let img =
        preview.querySelector("img");

    if (!img) {

        img =
            document.createElement("img");

        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.borderRadius = "50%";

        preview.innerHTML = "";

        preview.appendChild(img);

    }


    img.onload = function () {

        console.log(
            "Image loaded successfully:",
            previewID
        );

        preview.style.display =
            "block";

    };


    img.onerror = function () {

        console.error(
            "Image failed to load:",
            imageURL
        );

    };


    img.src = imageURL;

    preview.style.display =
        "block";

}


/*==================================================
        REPLACEMENT FILE PREVIEW
==================================================*/

function setupReplacementPreview(
    inputID,
    previewID,
    isSignature = false
) {

    const input =
        document.getElementById(inputID);

    const preview =
        document.getElementById(previewID);

    if (!input || !preview) {

        console.warn(
            "Preview setup failed:",
            inputID,
            previewID
        );

        return;
    }

    input.addEventListener(
        "change",
        function () {

            const file =
                this.files &&
                this.files[0];

            if (!file)
                return;

            const reader =
                new FileReader();

            reader.onload =
                function (event) {

                    const imageURL =
                        event.target.result;

                    // If preview itself is IMG
                    if (
                        preview.tagName === "IMG"
                    ) {

                        preview.src =
                            imageURL;

                        preview.style.display =
                            "block";

                        return;
                    }


                    // If preview is container DIV
                    let img =
                        preview.querySelector("img");


                    if (!img) {

                        img =
                            document.createElement("img");

                        preview.innerHTML =
                            "";

                        preview.appendChild(img);

                    }


                    img.src =
                        imageURL;

                    img.style.width =
                        "100%";

                    img.style.height =
                        "100%";

                    img.style.objectFit =
                        isSignature
                            ? "contain"
                            : "cover";

                    img.style.borderRadius =
                        isSignature
                            ? "0"
                            : "50%";


                    preview.style.display =
                        "block";


                    console.log(
                        "New file preview loaded:",
                        previewID
                    );

                };


            reader.onerror =
                function () {

                    console.error(
                        "Unable to preview selected file:",
                        file.name
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


/*==================================================
        CONDITIONAL FIELDS
==================================================*/

function triggerConditionalFields() {

    const ids = [

        "healthissues",

        "otherclub",

        "officialpost",

        "accident"

    ];


    ids.forEach(function (id) {

        const element =
            document.getElementById(id);

        if (element) {

            element.dispatchEvent(

                new Event(
                    "change",
                    {
                        bubbles: true
                    }
                )

            );

        }

    });

}


const saveChangesBtn =
    document.getElementById("saveChangesBtn");

if (saveChangesBtn) {

    saveChangesBtn.addEventListener(
        "click",
        async function () {

            console.log(
                "SAVE CHANGES BUTTON CLICKED"
            );

            await updateMemberSubmit();

        }
    );

}

/*==================================================
        SUBMIT UPDATE
==================================================*/

async function updateMemberSubmit() {

    console.log(
        "UPDATE MEMBER SUBMIT STARTED"
    );

    try {

        Swal.fire({
            title: "Saving...",
            text: "Updating member information...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const data =
            await collectMemberData();

        console.log(
            "UPDATE DATA:",
            data
        );

        console.log(
            "APPLICATION ID:",
            data["Application ID"]
        );

        if (!data["Application ID"]) {

            throw new Error(
                "Application ID is missing."
            );

        }

        const formData =
            new URLSearchParams();

        formData.append(
            "action",
            "UPDATE_MEMBER"
        );

        formData.append(
            "data",
            JSON.stringify(data)
        );

        console.log(
            "SENDING REQUEST TO API"
        );

        const response =
            await fetch(
                EDIT_API_URL,
                {
                    method: "POST",
                    body: formData
                }
            );

        const responseText =
            await response.text();

        console.log(
            "RAW RESPONSE:",
            responseText
        );

        const result =
            JSON.parse(responseText);

        console.log(
            "UPDATE RESULT:",
            result
        );

        if (!result.success) {

            throw new Error(
                result.message ||
                "Update failed."
            );

        }

        await Swal.fire({
            icon: "success",
            title: "Updated Successfully",
            text: result.message
        });

        window.location.href =
            "members.html";

    }
    catch (error) {

        console.error(
            "UPDATE ERROR:",
            error
        );

        Swal.fire({
            icon: "error",
            title: "Update Failed",
            text: error.message
        });

    }

}

/*==================================================
        FILE TO BASE64
==================================================*/

function fileToBase64(file) {

    return new Promise(
        function (resolve, reject) {

            const reader =
                new FileReader();

            reader.onload =
                function () {

                    resolve(
                        reader.result
                    );

                };

            reader.onerror =
                reject;

            reader.readAsDataURL(
                file
            );

        }
    );

}


/*==================================================
        UPLOAD REPLACEMENT FILE
==================================================*/

async function uploadReplacementFile(
    file,
    type
) {

    if (!file) {
        return "";
    }

    const base64 =
        await fileToBase64(file);


    const formData =
        new URLSearchParams();


    formData.append(
        "action",
        "UPLOAD_FILE"
    );


    formData.append(
        "data",
        JSON.stringify({

            applicationID:
                EDIT_APPLICATION_ID,

            memberID:
                currentMember["Membership ID"] || "",

            type:
                type,

            fileName:
                file.name,

            mimeType:
                file.type,

            base64:
                base64

        })
    );


    const response =
        await fetch(
            EDIT_API_URL,
            {
                method: "POST",
                body: formData
            }
        );


    const result =
        await response.json();


    console.log(
        "UPLOAD FILE RESPONSE:",
        result
    );


    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to upload file."
        );

    }


    return (
        result.data?.url ||
        result.url ||
        ""
    );

}


/*==================================================
        COLLECT MEMBER DATA
==================================================*/

async function collectMemberData() {

    const get =
        function (id) {

            const element =
                document.getElementById(id);

            return element
                ? element.value.trim()
                : "";

        };


    /*------------------------------------------
            KEEP EXISTING FILE URLS
    ------------------------------------------*/

    let photoURL =
        currentMember["Photo URL"] || "";

    let signatureURL =
        currentMember["Signature URL"] || "";

    let paymentURL =
        currentMember["Payment Proof URL"] || "";


    /*------------------------------------------
            PHOTO REPLACEMENT
    ------------------------------------------*/

    const photoInput =
        document.getElementById("photo");


    if (
        photoInput &&
        photoInput.files &&
        photoInput.files.length > 0
    ) {

        Swal.fire({

            title:
                "Uploading New Photo...",

            allowOutsideClick:
                false,

            didOpen:
                function () {

                    Swal.showLoading();

                }

        });


        photoURL =
            await uploadReplacementFile(
                photoInput.files[0],
                "PHOTO"
            );

    }


    /*------------------------------------------
            SIGNATURE REPLACEMENT
    ------------------------------------------*/

    const signatureInput =
        document.getElementById(
            "signatureFile"
        );


    if (
        signatureInput &&
        signatureInput.files &&
        signatureInput.files.length > 0
    ) {

        Swal.fire({

            title:
                "Uploading New Signature...",

            allowOutsideClick:
                false,

            didOpen:
                function () {

                    Swal.showLoading();

                }

        });


        signatureURL =
            await uploadReplacementFile(
                signatureInput.files[0],
                "SIGNATURE"
            );

    }


    /*------------------------------------------
            RETURN UPDATED DATA
    ------------------------------------------*/

    return {

        /* SYSTEM */

        "Application ID":
            EDIT_APPLICATION_ID,

        "Membership ID":
            get("memberID"),

        "Application Date":
            currentMember["Application Date"] || "",

        "Status":
            get("memberStatus"),


        /* PERSONAL */

        "Full Name":
            get("fullname"),

        "Date of Birth":
            get("dob"),

        "Gender":
            get("gender"),

        "Marital Status":
            get("maritalstatus"),

        "Blood Group":
            get("bloodgroup"),

        "Aadhaar Number":
            get("aadhaar"),


        /* ADDRESS */

        "Address":
            get("address"),

        "State":
            get("state"),

        "District":
            get("district"),

        "PIN Code":
            get("pincode"),


        /* HEALTH */

        "Health Issues":
            get("healthissues"),

        "Health Details":
            get("healthdetails"),


        /* CONTACT */

        "Phone":
            get("phone"),

        "Email":
            get("email"),

        "Emergency Contact 1":
            get("emergency1"),

        "Emergency Contact 2":
            get("emergency2"),


        /* VEHICLE */

        "Vehicle Name":
            get("motorcyclemodel"),

        "Motorcycle Model":
            get("motorcyclemodel"),

        "Vehicle Registration":
            get("vehiclereg"),

        "Vehicle Colour / Variant":
            get("vehiclevariant"),

        "Driving License":
            get("license"),

        "Engine Number":
            get("enginenumber"),

        "Chassis Number":
            get("chassisnumber"),


        /* OCCUPATION */

        "Occupation":
            get("working"),


        /* CLUB */

        "Other Club":
            get("otherclub"),

        "Other Club Details":
            get("otherclubdetails"),

        "Official Post":
            get("officialpost"),

        "Official Post Details":
            get("officialpostdetails"),

        "Social Media":
            get("social"),


        /* FAMILY */

        "Father Name":
            get("father"),

        "Mother Name":
            get("mother"),


        /* ACCIDENT */

        "Accident History":
            get("accident"),

        "Accident Details":
            get("accidentdetails"),


        /* FILES */

        "Photo URL":
            photoURL,

        "Signature URL":
            signatureURL,

        "Payment Proof URL":
            paymentURL,


        /* KEEP SYSTEM FILES */

        "QR Code URL":
            currentMember["QR Code URL"] || "",

        "Membership Card URL":
            currentMember[
                "Membership Card URL"
            ] || "",

        "Application PDF URL":
            currentMember[
                "Application PDF URL"
            ] || "",


        /* APPROVAL */

        "Approved By":
            currentMember[
                "Approved By"
            ] || "",

        "Approved Date":
            currentMember[
                "Approved Date"
            ] || "",

        "Last Updated":
            new Date().toISOString()

    };

}