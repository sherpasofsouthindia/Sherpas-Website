/*==================================================
        SHERPAS PUBLIC REGISTRATION
==================================================*/

const EVENTS_API =
    "https://script.google.com/macros/s/AKfycbyEsRyyMII7sBskySkuCUAznl8EOBGL81dj3ijCTRKIwmW6Xkp9Nkfb2kHDGFcTToERnw/exec";

const MEMBERS_API =
    "https://script.google.com/macros/s/AKfycbx2W4fMoGyjPggDI6FD-K-6dUZl2NQBXC5kBs36DC4gyE7TFHYmSLfsgTodPk-zkGQr/exec";


/*==================================================
        GLOBAL DATA
==================================================*/

let currentEvent = null;
let registrationSettings = null;
let currentMember = null;
let registrationContext = null;


/*==================================================
        URL EVENT ID
==================================================*/

const params =
    new URLSearchParams(
        window.location.search
    );

const eventID =
    String(
        params.get("eventID") ||
        ""
    ).trim();


/*==================================================
        ELEMENTS
==================================================*/

const eventCard =
    document.getElementById(
        "eventCard"
    );

const registrationStatus =
    document.getElementById(
        "registrationStatus"
    );

const memberSearchSection =
    document.getElementById(
        "memberSearchSection"
    );

const memberDetailsSection =
    document.getElementById(
        "memberDetailsSection"
    );

const registrationFormSection =
    document.getElementById(
        "registrationFormSection"
    );

const successSection =
    document.getElementById(
        "successSection"
    );

const memberIdentifier =
    document.getElementById(
        "memberIdentifier"
    );

const findMemberBtn =
    document.getElementById(
        "findMemberBtn"
    );

const memberSearchMessage =
    document.getElementById(
        "memberSearchMessage"
    );

const memberDetails =
    document.getElementById(
        "memberDetails"
    );

const continueRegistrationBtn =
    document.getElementById(
        "continueRegistrationBtn"
    );

const registrationForm =
    document.getElementById(
        "registrationForm"
    );

const rideFields =
    document.getElementById(
        "rideFields"
    );

const previousRegistrationMessage =
    document.getElementById(
        "previousRegistrationMessage"
    );


/*==================================================
        INITIALIZE
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadRegistrationPage();

    }
);


/*==================================================
        LOAD PAGE
==================================================*/

async function loadRegistrationPage() {

    if (!eventID) {

        showRegistrationError(
            "Event ID is missing from the registration link."
        );

        return;

    }

    try {

        await loadEvent();

        await loadRegistrationSettings();

        checkRegistrationAvailability();

    }
    catch (error) {

        console.error(
            "Registration page error:",
            error
        );

        showRegistrationError(
            error.message
        );

    }

}


/*==================================================
        LOAD EVENT
==================================================*/

async function loadEvent() {

    const response =
        await fetch(
            EVENTS_API +
            "?action=GET_EVENTS"
        );

    if (!response.ok) {

        throw new Error(
            "Unable to connect to Events API."
        );

    }

    const result =
        await response.json();

    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to load events."
        );

    }

    const events =
        result.data || [];

    currentEvent =
        events.find(
            function (event) {

                return String(
                    event["Event ID"] || ""
                ).trim() === eventID;

            }
        );

    if (!currentEvent) {

        throw new Error(
            "Event not found: " +
            eventID
        );

    }

    renderEvent();

}


/*==================================================
        RENDER EVENT
==================================================*/

function renderEvent() {

    eventCard.innerHTML = `

        <h2>
            ${escapeHTML(
                currentEvent["Event Name"] || ""
            )}
        </h2>

        <div class="event-meta">

            <span>
                <i class="fa-solid fa-tag"></i>
                ${escapeHTML(
                    currentEvent["Category"] || ""
                )}
            </span>

            <span>
                <i class="fa-solid fa-calendar"></i>
                ${escapeHTML(
                    currentEvent["Date"] || ""
                )}
            </span>

            <span>
                <i class="fa-solid fa-clock"></i>
                ${escapeHTML(
                    currentEvent["Time"] || ""
                )}
            </span>

            <span>
                <i class="fa-solid fa-location-dot"></i>
                ${escapeHTML(
                    currentEvent["Location"] || ""
                )}
            </span>

        </div>

        <p>
            ${escapeHTML(
                currentEvent["Description"] || ""
            )}
        </p>

    `;

}


/*==================================================
        LOAD REGISTRATION SETTINGS
==================================================*/

async function loadRegistrationSettings() {

    const response =
        await fetch(

            EVENTS_API +
            "?action=GET_REGISTRATION_SETTINGS" +
            "&eventID=" +
            encodeURIComponent(
                eventID
            )

        );

    if (!response.ok) {

        throw new Error(
            "Unable to load registration settings."
        );

    }

    const result =
        await response.json();

    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to load registration settings."
        );

    }

    registrationSettings =
        result.data || {};

}


/*==================================================
        CHECK REGISTRATION
==================================================*/

function checkRegistrationAvailability() {

    if (!registrationSettings ||
        registrationSettings["Registration Enabled"] !== "Yes") {

        disableRegistration(
            "Registration is not enabled for this event."
        );

        return;

    }


    if (
        registrationSettings["Registration Status"] &&
        String(
            registrationSettings["Registration Status"]
        ).toLowerCase() !== "open"
    ) {

        disableRegistration(
            "Registration is currently closed."
        );

        return;

    }

}


/*==================================================
        DISABLE REGISTRATION
==================================================*/

function disableRegistration(message) {

    registrationStatus.className =
        "message-box";

    registrationStatus.textContent =
        message;

    memberSearchSection.classList.add(
        "hidden"
    );

}


/*==================================================
        FIND MEMBER
==================================================*/

findMemberBtn.addEventListener(
    "click",
    findMember
);


/*==================================================
        ENTER KEY
==================================================*/

memberIdentifier.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            findMember();

        }

    }
);


/*==================================================
        FIND MEMBER
==================================================*/

async function findMember() {

    const identifier =
        memberIdentifier.value.trim();

    if (!identifier) {

        memberSearchMessage.textContent =
            "Please enter Membership ID or phone number.";

        return;

    }


    findMemberBtn.disabled = true;

    findMemberBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Finding...';

    memberSearchMessage.textContent = "";


    try {

        /*========================================
                BUILD REQUEST
        ========================================*/

        const form =
            new URLSearchParams();

        form.append(
            "action",
            "GET_REGISTRATION_CONTEXT"
        );

        form.append(
            "data",
            JSON.stringify({

                eventID: eventID,

                identifier: identifier

            })
        );


        /*========================================
                SEND TO MEMBERS API
        ========================================*/

        const response =
            await fetch(
                MEMBERS_API,
                {
                    method: "POST",
                    body: form
                }
            );


        if (!response.ok) {

            throw new Error(
                "Member database returned HTTP " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "REGISTRATION CONTEXT:",
            result
        );


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to identify member."
            );

        }


        /*========================================
                SAVE CONTEXT
        ========================================*/

        registrationContext =
            result.data || null;


        if (!registrationContext) {

            throw new Error(
                "Registration context was not returned."
            );

        }


        /*========================================
                CHECK ELIGIBILITY
        ========================================*/

        if (
            registrationContext.eligible === false
        ) {

            throw new Error(
                registrationContext.reason ||
                "You are not eligible for this registration."
            );

        }


        /*========================================
                SAVE MEMBER
        ========================================*/

        currentMember =
            registrationContext.member;


        if (!currentMember) {

            throw new Error(
                "Member information was not returned."
            );

        }


        /*========================================
                RENDER MEMBER
        ========================================*/

        renderMemberDetails();


        /*========================================
                SHOW HISTORY INFORMATION
        ========================================*/

        const history =
            registrationContext.history || {};

        console.log(
            "Ride history count:",
            history.count
        );

        console.log(
            "First ride:",
            history.isFirstRide
        );

        console.log(
            "Already registered:",
            registrationContext.alreadyRegistered
        );


        /*========================================
                ALREADY REGISTERED CHECK
        ========================================*/

        if (
            registrationContext.alreadyRegistered
        ) {

            memberSearchMessage.textContent =
                "You are already registered for this event.";

            continueRegistrationBtn.disabled =
                true;

            return;

        }


        continueRegistrationBtn.disabled =
            false;


    }
    catch (error) {

        console.error(
            "Registration context error:",
            error
        );

        memberSearchMessage.textContent =
            error.message;

        memberDetailsSection.classList.add(
            "hidden"
        );

    }
    finally {

        findMemberBtn.disabled =
            false;

        findMemberBtn.innerHTML =
            '<i class="fa-solid fa-magnifying-glass"></i> Find Member';

    }

}


/*==================================================
        RENDER MEMBER
==================================================*/

function renderMemberDetails() {

    memberDetails.innerHTML = `

        ${detail(
            "Membership ID",
            currentMember["Membership ID"]
        )}

        ${detail(
            "Full Name",
            currentMember["Full Name"]
        )}

        ${detail(
            "Phone",
            currentMember["Phone"]
        )}

        ${detail(
            "Date of Birth",
            currentMember["Date of Birth"]
        )}

        ${detail(
            "Gender",
            currentMember["Gender"]
        )}

        ${detail(
            "Blood Group",
            currentMember["Blood Group"]
        )}

        ${detail(
            "Vehicle Registration",
            currentMember["Vehicle Registration"] ||
            currentMember["Vehicle Reg"] ||
            ""
        )}

        ${detail(
            "Motorcycle",
            currentMember["Motorcycle Name"] ||
            currentMember["Vehicle Name"] ||
            currentMember["Motorcycle Model"] ||
            ""
        )}

    `;


    memberDetailsSection.classList.remove(
        "hidden"
    );

}


/*==================================================
        DETAIL HELPER
==================================================*/

function detail(label, value) {

    return `

        <div class="detail-item">

            <div class="detail-label">
                ${escapeHTML(label)}
            </div>

            <div class="detail-value">
                ${escapeHTML(value || "-")}
            </div>

        </div>

    `;

}


/*==================================================
        CONTINUE
==================================================*/

continueRegistrationBtn.addEventListener(
    "click",
    function () {

        if (!registrationContext) {

            return;

        }


        if (
            registrationContext.alreadyRegistered
        ) {

            return;

        }


        memberSearchSection.classList.add(
            "hidden"
        );

        memberDetailsSection.classList.add(
            "hidden"
        );

        registrationFormSection.classList.remove(
            "hidden"
        );


        const history =
            registrationContext.history || {};

        const isFirstRide =
            history.isFirstRide === true;


        /*========================================
                FIRST RIDE
        ========================================*/

        if (isFirstRide) {

            previousRegistrationMessage.classList.add(
                "hidden"
            );


            buildFirstRideForm();

        }


        /*========================================
                SECOND / LATER RIDE
        ========================================*/

        else {

            previousRegistrationMessage.classList.remove(
                "hidden"
            );


            previousRegistrationMessage.innerHTML = `

                <strong>
                    Previous Ride Details Found
                </strong>

                <p>
                    Your previous ride registration
                    details have been loaded.
                    Please review them before continuing.
                </p>

            `;


            buildReturningMemberForm(
                history.latest || {}
            );

        }

    }
);

/*==================================================
        READ-ONLY VEHICLE DETAILS
==================================================*/

function buildVehicleDetails() {

    const vehicleName =
        currentMember["Vehicle Name"] ||
        currentMember["Motorcycle Model"] ||
        "";

    const vehicleModel =
        currentMember["Motorcycle Model"] ||
        "";

    const vehicleVariant =
        currentMember["Vehicle Colour / Variant"] ||
        "";

    return `

        <div class="ride-subsection">

            <h3>
                <i class="fa-solid fa-motorcycle"></i>
                Vehicle Details
            </h3>

            <p class="locked-note">
                Vehicle details are linked to your SHERPAS OF SOUTH INDIA
                membership profile and cannot be changed
                during ride registration.
            </p>


            <div class="member-details">

                ${detail(
                    "Vehicle Registration",
                    currentMember["Vehicle Registration"]
                )}

                ${detail(
                    "Motorcycle",
                    vehicleName
                )}

                ${detail(
                    "Motorcycle Model",
                    vehicleModel
                )}

                ${detail(
                    "Variant / Colour",
                    vehicleVariant
                )}

                ${detail(
                    "Engine Number",
                    currentMember["Engine Number"]
                )}

                ${detail(
                    "Chassis Number",
                    currentMember["Chassis Number"]
                )}

                ${detail(
                    "Driving Licence",
                    currentMember["Driving License"]
                )}

            </div>

        </div>

    `;

}


/*==================================================
        EMERGENCY CONTACT
==================================================*/

function buildEmergencyContactFields(
    previous = {}
) {

    return `

        <div class="ride-subsection">

            <h3>
                <i class="fa-solid fa-phone-volume"></i>
                Emergency Contact
            </h3>

            <div class="ride-field">

                <label>
                    Contact Name *
                </label>

                <input
                    type="text"
                    id="rideEmergencyName"
                    value="${escapeHTML(
                        previous["Emergency Contact Name"] || ""
                    )}"
                    required
                >

            </div>


            <div class="ride-field">

                <label>
                    Relationship *
                </label>

                <input
                    type="text"
                    id="rideEmergencyRelationship"
                    value="${escapeHTML(
                        previous["Emergency Contact Relationship"] || ""
                    )}"
                    required
                >

            </div>


            <div class="ride-field">

                <label>
                    Contact Number *
                </label>

                <input
                    type="tel"
                    id="rideEmergencyPhone"
                    value="${escapeHTML(
                        previous["Emergency Contact Number"] || ""
                    )}"
                    required
                >

            </div>


            <div class="ride-field">

                <label>
                    Address
                </label>

                <textarea
                    id="rideEmergencyAddress"
                    rows="3"
                >${escapeHTML(
                    previous["Emergency Contact Address"] || ""
                )}</textarea>

            </div>

        </div>

    `;

}

/*==================================================
        PILLION SECTION
==================================================*/

function buildPillionFields(previous = {}) {

    return `

        <div class="ride-subsection">

            <h3>
                <i class="fa-solid fa-user-group"></i>
                Pillion Passenger
            </h3>

            <div class="ride-field">

                <label>
                    Are you bringing a pillion passenger?
                </label>

                <select id="pillionRequired">

                    <option value="No">No</option>

                    <option value="Yes">Yes</option>

                </select>

            </div>


            <div
                id="pillionDetails"
                style="display:none;"
            >

                <div class="ride-field">

                    <label>
                        Pillion Full Name *
                    </label>

                    <input
                        type="text"
                        id="pillionFullName"
                        value="${escapeHTML(
                            previous["Pillion Full Name"] || ""
                        )}"
                    >

                </div>


                <div class="ride-field">

                    <label>
                        Relationship with Rider *
                    </label>

                    <input
                        type="text"
                        id="pillionRelationship"
                        value="${escapeHTML(
                            previous["Pillion Relationship"] || ""
                        )}"
                    >

                </div>


                <div class="ride-field">

                    <label>
                        Pillion Phone *
                    </label>

                    <input
                        type="tel"
                        id="pillionPhone"
                        value="${escapeHTML(
                            previous["Pillion Phone"] || ""
                        )}"
                    >

                </div>


                <div class="ride-field">

                    <label>
                        Pillion Blood Group
                    </label>

                    <input
                        type="text"
                        id="pillionBloodGroup"
                        value="${escapeHTML(
                            previous["Pillion Blood Group"] || ""
                        )}"
                    >

                </div>


                <div class="ride-field">

                    <label>
                        Pillion Address
                    </label>

                    <textarea
                        id="pillionAddress"
                        rows="3"
                    >${escapeHTML(
                        previous["Pillion Address"] || ""
                    )}</textarea>

                </div>


                <div class="ride-field">

                    <label>
                        Pillion Emergency Contact Name
                    </label>

                    <input
                        type="text"
                        id="pillionEmergencyName"
                        value="${escapeHTML(
                            previous["Pillion Emergency Contact Name"] || ""
                        )}"
                    >

                </div>


                <div class="ride-field">

                    <label>
                        Pillion Emergency Contact Relationship
                    </label>

                    <input
                        type="text"
                        id="pillionEmergencyRelationship"
                        value="${escapeHTML(
                            previous[
                                "Pillion Emergency Contact Relationship"
                            ] || ""
                        )}"
                    >

                </div>


                <div class="ride-field">

                    <label>
                        Pillion Emergency Contact Number
                    </label>

                    <input
                        type="tel"
                        id="pillionEmergencyPhone"
                        value="${escapeHTML(
                            previous[
                                "Pillion Emergency Contact Number"
                            ] || ""
                        )}"
                    >

                </div>


                <div class="ride-field">

                    <label>
                        Pillion Emergency Contact Address
                    </label>

                    <textarea
                        id="pillionEmergencyAddress"
                        rows="3"
                    >${escapeHTML(
                        previous[
                            "Pillion Emergency Contact Address"
                        ] || ""
                    )}</textarea>

                </div>

            </div>

        </div>

    `;
}


/*==================================================
        MEDICAL / HEALTH INFORMATION
==================================================*/

function buildMedicalFields(previous = {}) {

    return `

        <div class="ride-subsection">

            <h3>
                <i class="fa-solid fa-heart-pulse"></i>
                Medical Information
            </h3>

            <p class="locked-note">
                These details are collected for ride safety
                and may be updated for this ride.
            </p>


            <div class="ride-field">

                <label>
                    Disability / Medical Condition
                </label>

                <textarea
                    id="medicalDisability"
                    rows="3"
                >${escapeHTML(
                    previous["Disability Details"] || ""
                )}</textarea>

            </div>


            <div class="ride-field">

                <label>
                    Accident History
                </label>

                <select id="medicalAccidentHistory">

                    <option value="">
                        Select
                    </option>

                    <option value="No"
                        ${
                            String(
                                previous["Accident History"] || ""
                            ).toLowerCase() === "no"
                                ? "selected"
                                : ""
                        }
                    >
                        No
                    </option>

                    <option value="Yes"
                        ${
                            String(
                                previous["Accident History"] || ""
                            ).toLowerCase() === "yes"
                                ? "selected"
                                : ""
                        }
                    >
                        Yes
                    </option>

                </select>

            </div>


            <div class="ride-field">

                <label>
                    Accident Details
                </label>

                <textarea
                    id="medicalAccidentDetails"
                    rows="3"
                >${escapeHTML(
                    previous["Accident History Details"] ||
                    previous["Accident Details"] ||
                    ""
                )}</textarea>

            </div>


            <div class="ride-field">

                <label>
                    Medicine Allergies
                </label>

                <textarea
                    id="medicineAllergies"
                    rows="3"
                >${escapeHTML(
                    previous["Medicine Allergies"] || ""
                )}</textarea>

            </div>


            <div class="ride-field">

                <label>
                    Current Medications
                </label>

                <textarea
                    id="currentMedications"
                    rows="3"
                >${escapeHTML(
                    previous["Current Medications"] || ""
                )}</textarea>

            </div>


            <div class="ride-field">

                <label>
                    Smoking
                </label>

                <select id="smoker">

                    <option value="">
                        Select
                    </option>

                    <option value="No"
                        ${
                            previous["Smoker"] === "No"
                                ? "selected"
                                : ""
                        }
                    >
                        No
                    </option>

                    <option value="Yes"
                        ${
                            previous["Smoker"] === "Yes"
                                ? "selected"
                                : ""
                        }
                    >
                        Yes
                    </option>

                </select>

            </div>


            <div class="ride-field">

                <label>
                    Alcohol Consumption
                </label>

                <select id="alcoholConsumption">

                    <option value="">
                        Select
                    </option>

                    <option value="No"
                        ${
                            previous["Alcohol Consumption"] === "No"
                                ? "selected"
                                : ""
                        }
                    >
                        No
                    </option>

                    <option value="Yes"
                        ${
                            previous["Alcohol Consumption"] === "Yes"
                                ? "selected"
                                : ""
                        }
                    >
                        Yes
                    </option>

                </select>

            </div>


            <div class="ride-field">

                <label>
                    Health Insurance
                </label>

                <select id="healthInsurance">

                    <option value="">
                        Select
                    </option>

                    <option value="No"
                        ${
                            previous["Health Insurance"] === "No"
                                ? "selected"
                                : ""
                        }
                    >
                        No
                    </option>

                    <option value="Yes"
                        ${
                            previous["Health Insurance"] === "Yes"
                                ? "selected"
                                : ""
                        }
                    >
                        Yes
                    </option>

                </select>

            </div>


            <div class="ride-field">

                <label>
                    Health Insurance Details
                </label>

                <textarea
                    id="healthInsuranceDetails"
                    rows="3"
                >${escapeHTML(
                    previous["Health Insurance Details"] || ""
                )}</textarea>

            </div>


            <label class="check-row">

                <input
                    type="checkbox"
                    id="medicalFitnessInfo"
                    required
                    ${
                        previous["Medical Declaration"] === "Yes"
                            ? "checked"
                            : ""
                    }
                >

                <span>
                    I confirm that I am medically fit to
                    participate in this ride.
                </span>

            </label>

        </div>

    `;
}

/*==================================================
        VEHICLE INSURANCE / PUC
==================================================*/

function buildVehicleDocumentFields(previous = {}) {

    return `

        <div class="ride-subsection">

            <h3>
                <i class="fa-solid fa-file-shield"></i>
                Vehicle Documents
            </h3>


            <div class="ride-field">

                <label>
                    Insurance Company
                </label>

                <input
                    type="text"
                    id="insuranceCompany"
                    value="${escapeHTML(
                        previous["Vehicle Insurance Company"] || ""
                    )}"
                >

            </div>


            <div class="ride-field">

                <label>
                    Insurance Policy Number
                </label>

                <input
                    type="text"
                    id="insurancePolicyNumber"
                    value="${escapeHTML(
                        previous["Insurance Policy Number"] || ""
                    )}"
                >

            </div>


            <div class="ride-field">

                <label>
                    Insurance Valid From
                </label>

                <input
                    type="date"
                    id="insuranceValidFrom"
                    value="${toDateInputValue(
                        previous["Insurance Valid From"]
                    )}"
                >

            </div>


            <div class="ride-field">

                <label>
                    Insurance Valid To
                </label>

                <input
                    type="date"
                    id="insuranceValidTo"
                    value="${toDateInputValue(
                        previous["Insurance Valid To"]
                    )}"
                >

            </div>


            <div class="ride-field">

                <label>
                    Pollution Certificate Valid To
                </label>

                <input
                    type="date"
                    id="pollutionValidTo"
                    value="${toDateInputValue(
                        previous["Pollution Certificate Valid To"]
                    )}"
                >

            </div>

        </div>

    `;
}

/*==================================================
        VEHICLE OWNER / NOC
==================================================*/

function buildNOCFields(previous = {}) {

    const previousOwnerRequired =
        String(
            previous["Owner NOC Required"] || ""
        ).toLowerCase() === "yes";


    return `

        <div class="ride-subsection">

            <h3>
                <i class="fa-solid fa-file-signature"></i>
                Vehicle Ownership / NOC
            </h3>


            <div class="ride-field">

                <label>
                    Is the motorcycle registered in your name?
                </label>

                <select id="vehicleOwner">

                    <option value="Yes"
                        ${
                            !previousOwnerRequired
                                ? "selected"
                                : ""
                        }
                    >
                        Yes
                    </option>

                    <option value="No"
                        ${
                            previousOwnerRequired
                                ? "selected"
                                : ""
                        }
                    >
                        No
                    </option>

                </select>

            </div>


            <div
                id="nocDetails"
                style="display:none;"
            >

                <div class="ride-field">

                    <label>
                        Vehicle Owner Name *
                    </label>

                    <input
                        type="text"
                        id="ownerName"
                        value="${escapeHTML(
                            previous["Owner Name"] || ""
                        )}"
                    >

                </div>


                <div class="ride-field">

                    <label>
                        Owner Phone *
                    </label>

                    <input
                        type="tel"
                        id="ownerPhone"
                        value="${escapeHTML(
                            previous["Owner Phone"] || ""
                        )}"
                    >

                </div>


                <div class="ride-field">

                    <label>
                        Upload Signed NOC *
                    </label>

                    <input
                        type="file"
                        id="ownerNOC"
                        accept=".pdf,.jpg,.jpeg,.png"
                    >

                    ${
                        previous["Owner NOC URL"]
                            ? `
                                <div class="previous-file">
                                    Existing NOC is already available
                                    for this registration.
                                </div>
                              `
                            : ""
                    }

                </div>

            </div>

        </div>

    `;
}

/*==================================================
        NOC TOGGLE
==================================================*/

function initializeNOCToggle() {

    const vehicleOwner =
        document.getElementById(
            "vehicleOwner"
        );

    const nocDetails =
        document.getElementById(
            "nocDetails"
        );

    if (
        !vehicleOwner ||
        !nocDetails
    ) {
        return;
    }


    function updateNOCVisibility() {

        const requiresNOC =
            vehicleOwner.value === "No";


        nocDetails.style.display =
            requiresNOC
                ? "block"
                : "none";


        [
            "ownerName",
            "ownerPhone",
            "ownerNOC"
        ].forEach(
            function(id) {

                const field =
                    document.getElementById(id);

                if (field) {

                    field.required =
                        requiresNOC;

                }

            }
        );

    }


    vehicleOwner.addEventListener(
        "change",
        updateNOCVisibility
    );


    updateNOCVisibility();

}

/*==================================================
        PAYMENT SECTION
==================================================*/

function buildPaymentFields() {

    const paymentRequired =
        String(
            registrationSettings?.["Payment Required"] || ""
        ).toLowerCase() === "yes";

    const proofRequired =
        String(
            registrationSettings?.["Payment Proof Required"] || ""
        ).toLowerCase() === "yes";

    const fee =
        registrationSettings?.["Registration Fee"] || "0";


    if (!paymentRequired) {

        return "";

    }


    return `

        <div class="ride-subsection">

            <h3>
                <i class="fa-solid fa-credit-card"></i>
                Registration Payment
            </h3>

            <div class="payment-summary">

                <div class="payment-amount">

                    <span>
                        Registration Fee
                    </span>

                    <strong>
                        ₹${escapeHTML(fee)}
                    </strong>

                </div>

            </div>


            ${
                proofRequired
                    ? `

                        <div class="ride-field">

                            <label>
                                Payment Proof *
                            </label>

                            <input
                                type="file"
                                id="paymentProof"
                                accept=".jpg,.jpeg,.png,.pdf"
                                required
                            >

                            <small>
                                Upload your payment receipt,
                                transaction screenshot or PDF.
                            </small>

                        </div>

                      `
                    : ""
            }

        </div>

    `;

}

/*==================================================
        FINAL DECLARATION
==================================================*/

function buildFinalDeclaration() {

    return `

        <div class="ride-subsection">

            <h3>
                <i class="fa-solid fa-file-signature"></i>
                Final Declaration
            </h3>


            <label class="check-row">

                <input
                    type="checkbox"
                    id="detailsConfirmed"
                    required
                >

                <span>
                    I confirm that the information provided
                    in this registration is true and correct.
                </span>

            </label>


            <label class="check-row">

                <input
                    type="checkbox"
                    id="membershipDetailsConfirmed"
                    required
                >

                <span>
                    I understand that membership and vehicle
                    master details cannot be changed through
                    this ride registration. I will contact
                    SHERPAS OF SOUTH INDIA admins if any correction
                    is required.
                </span>

            </label>


            <label class="check-row">

                <input
                    type="checkbox"
                    id="rideDeclaration"
                    required
                >

                <span>
                    I have read and agree to the applicable
                    SHERPAS OF SOUTH INDIA ride/event declaration
                    and safety requirements.
                </span>

            </label>


            <label class="check-row">

                <input
                    type="checkbox"
                    id="medicalDeclaration"
                    required
                >

                <span>
                    I confirm that I am medically fit to
                    participate in this ride.
                </span>

            </label>

            
        </div>

    `;
}


/*==================================================
        FILE TO BASE64
==================================================*/

function fileToBase64(file) {

    return new Promise(
        function(resolve, reject) {

            if (!file) {

                reject(
                    new Error(
                        "No file selected."
                    )
                );

                return;

            }

            const reader =
                new FileReader();

            reader.onload =
                function(event) {

                    resolve(
                        event.target.result
                    );

                };

            reader.onerror =
                function() {

                    reject(
                        new Error(
                            "Unable to read selected file."
                        )
                    );

                };

            reader.readAsDataURL(file);

        }
    );

}

/*==================================================
        FIRST RIDE FORM
==================================================*/

function buildFirstRideForm() {

    rideFields.innerHTML = `

        ${buildVehicleDetails()}

        ${buildEmergencyContactFields()}

        ${buildPillionFields()}

        ${buildMedicalFields()}

        ${buildVehicleDocumentFields()}

        ${buildNOCFields()}

        ${buildPaymentFields()}

        ${buildFinalDeclaration()}

    `;

    initializePillionToggle();

    initializeNOCToggle();

}



/*==================================================
        RETURNING MEMBER FORM
==================================================*/

function buildReturningMemberForm(previous) {

    previous =
        previous || {};

    rideFields.innerHTML = `

        ${buildVehicleDetails()}

        ${buildEmergencyContactFields(
            previous
        )}

        ${buildPillionFields(
            previous
        )}

        ${buildMedicalFields(
            previous
        )}

        ${buildVehicleDocumentFields(
            previous
        )}

        ${buildNOCFields(
            previous
        )}

        ${buildPaymentFields()}

        ${buildFinalDeclaration()}

    `;

    initializePillionToggle();

    initializeNOCToggle();

}

/*==================================================
        PILLION TOGGLE
==================================================*/

function initializePillionToggle() {

    const pillionRequired =
        document.getElementById(
            "pillionRequired"
        );

    const pillionDetails =
        document.getElementById(
            "pillionDetails"
        );

    if (
        !pillionRequired ||
        !pillionDetails
    ) {

        return;

    }


    function updatePillionVisibility() {

        pillionDetails.style.display =
            pillionRequired.value === "Yes"
                ? "block"
                : "none";

        setPillionRequiredFields();

    }


    pillionRequired.addEventListener(
        "change",
        updatePillionVisibility
    );


    updatePillionVisibility();

}


function setPillionRequiredFields() {

    const required =
        document.getElementById(
            "pillionRequired"
        )?.value === "Yes";


    [
        "pillionFullName",
        "pillionRelationship",
        "pillionPhone"
    ].forEach(
        function(id) {

            const field =
                document.getElementById(id);

            if (field) {

                field.required =
                    required;

            }

        }
    );

}


function toDateInputValue(value) {

    if (!value) {
        return "";
    }

    const text =
        String(value).trim();


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(text)
    ) {

        return text;

    }


    const date =
        new Date(text);


    if (
        isNaN(date.getTime())
    ) {

        return "";

    }


    return [
        date.getFullYear(),
        String(
            date.getMonth() + 1
        ).padStart(2, "0"),
        String(
            date.getDate()
        ).padStart(2, "0")
    ].join("-");

}




/*==================================================
        SUBMIT RIDE REGISTRATION
==================================================*/

registrationForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        /*========================================
                BASIC CONTEXT CHECK
        ========================================*/

        if (!registrationContext) {

            alert(
                "Please identify your membership first."
            );

            return;

        }


        if (
            registrationContext.alreadyRegistered
        ) {

            alert(
                "You are already registered for this event."
            );

            return;

        }


        /*========================================
                VALIDATE FORM
        ========================================*/

        if (
            !registrationForm.checkValidity()
        ) {

            registrationForm.reportValidity();

            return;

        }


        const submitButton =
            document.getElementById(
                "submitRegistrationBtn"
            );


        const originalButtonText =
            submitButton.innerHTML;


        submitButton.disabled =
            true;

        submitButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';


        try {


            /*====================================
                    FILE HELPER
            ====================================*/

            async function getFileBase64(
                inputID,
                required = false
            ) {

                const input =
                    document.getElementById(
                        inputID
                    );


                if (
                    !input ||
                    !input.files ||
                    !input.files.length
                ) {

                    if (required) {

                        throw new Error(
                            "Required file is missing: " +
                            inputID
                        );

                    }

                    return "";

                }


                return await fileToBase64(
                    input.files[0]
                );

            }


            /*====================================
                    PAYMENT PROOF
            ====================================*/

            const paymentRequired =
                String(
                    registrationSettings?.[
                        "Payment Required"
                    ] || ""
                ).toLowerCase() === "yes";


            const paymentProofRequired =
                String(
                    registrationSettings?.[
                        "Payment Proof Required"
                    ] || ""
                ).toLowerCase() === "yes";


            let paymentProof = "";


            if (
                paymentRequired &&
                paymentProofRequired
            ) {

                paymentProof =
                    await getFileBase64(
                        "paymentProof",
                        true
                    );

            }
            else {

                paymentProof =
                    await getFileBase64(
                        "paymentProof",
                        false
                    );

            }


            /*====================================
                    NOC
            ====================================*/

            const vehicleOwner =
                document.getElementById(
                    "vehicleOwner"
                )?.value || "Yes";


            let ownerNOC = "";


            if (
                vehicleOwner === "No"
            ) {

                ownerNOC =
                    await getFileBase64(
                        "ownerNOC",
                        true
                    );

            }
            else {

                ownerNOC =
                    await getFileBase64(
                        "ownerNOC",
                        false
                    );

            }


            /*====================================
                    PILLION
            ====================================*/

            const pillionRequired =
                document.getElementById(
                    "pillionRequired"
                )?.value || "No";


            /*====================================
                    BUILD PAYLOAD
            ====================================*/

            const registrationData = {

                eventID:
                    eventID,

                identifier:
                    memberIdentifier.value.trim(),


                /*------------------------------
                    EMERGENCY CONTACT
                ------------------------------*/

                emergencyContactName:
                    document.getElementById(
                        "rideEmergencyName"
                    )?.value.trim() || "",

                emergencyContactRelationship:
                    document.getElementById(
                        "rideEmergencyRelationship"
                    )?.value.trim() || "",

                emergencyContactNumber:
                    document.getElementById(
                        "rideEmergencyPhone"
                    )?.value.trim() || "",

                emergencyContactAddress:
                    document.getElementById(
                        "rideEmergencyAddress"
                    )?.value.trim() || "",


                /*------------------------------
                    PILLION
                ------------------------------*/

                pillionRequired:
                    pillionRequired,

                pillionFullName:
                    document.getElementById(
                        "pillionFullName"
                    )?.value.trim() || "",

                pillionRelationship:
                    document.getElementById(
                        "pillionRelationship"
                    )?.value.trim() || "",

                pillionPhone:
                    document.getElementById(
                        "pillionPhone"
                    )?.value.trim() || "",

                pillionBloodGroup:
                    document.getElementById(
                        "pillionBloodGroup"
                    )?.value.trim() || "",

                pillionAddress:
                    document.getElementById(
                        "pillionAddress"
                    )?.value.trim() || "",

                pillionEmergencyName:
                    document.getElementById(
                        "pillionEmergencyName"
                    )?.value.trim() || "",

                pillionEmergencyRelationship:
                    document.getElementById(
                        "pillionEmergencyRelationship"
                    )?.value.trim() || "",

                pillionEmergencyPhone:
                    document.getElementById(
                        "pillionEmergencyPhone"
                    )?.value.trim() || "",

                pillionEmergencyAddress:
                    document.getElementById(
                        "pillionEmergencyAddress"
                    )?.value.trim() || "",


                /*------------------------------
                    MEDICAL
                ------------------------------*/

                medicalDisability:
                    document.getElementById(
                        "medicalDisability"
                    )?.value.trim() || "",

                medicalAccidentHistory:
                    document.getElementById(
                        "medicalAccidentHistory"
                    )?.value || "",

                medicalAccidentDetails:
                    document.getElementById(
                        "medicalAccidentDetails"
                    )?.value.trim() || "",

                medicineAllergies:
                    document.getElementById(
                        "medicineAllergies"
                    )?.value.trim() || "",

                currentMedications:
                    document.getElementById(
                        "currentMedications"
                    )?.value.trim() || "",

                smoker:
                    document.getElementById(
                        "smoker"
                    )?.value || "",

                alcoholConsumption:
                    document.getElementById(
                        "alcoholConsumption"
                    )?.value || "",

                healthInsurance:
                    document.getElementById(
                        "healthInsurance"
                    )?.value || "",

                healthInsuranceDetails:
                    document.getElementById(
                        "healthInsuranceDetails"
                    )?.value.trim() || "",


                /*------------------------------
                    VEHICLE DOCUMENTS
                ------------------------------*/

                insuranceCompany:
                    document.getElementById(
                        "insuranceCompany"
                    )?.value.trim() || "",

                insurancePolicyNumber:
                    document.getElementById(
                        "insurancePolicyNumber"
                    )?.value.trim() || "",

                insuranceValidFrom:
                    document.getElementById(
                        "insuranceValidFrom"
                    )?.value || "",

                insuranceValidTo:
                    document.getElementById(
                        "insuranceValidTo"
                    )?.value || "",

                pollutionValidTo:
                    document.getElementById(
                        "pollutionValidTo"
                    )?.value || "",


                /*------------------------------
                    OWNER / NOC
                ------------------------------*/

                vehicleOwner:
                    vehicleOwner,

                ownerName:
                    document.getElementById(
                        "ownerName"
                    )?.value.trim() || "",

                ownerPhone:
                    document.getElementById(
                        "ownerPhone"
                    )?.value.trim() || "",

                ownerNOC:
                    ownerNOC,


                /*------------------------------
                    OPTIONAL RIDE FIELDS
                ------------------------------*/

                alternatePhone:
                    document.getElementById(
                        "alternatePhone"
                    )?.value.trim() || "",

                heightCM:
                    document.getElementById(
                        "heightCM"
                    )?.value || "",

                weightKG:
                    document.getElementById(
                        "weightKG"
                    )?.value || "",

                identificationMark:
                    document.getElementById(
                        "identificationMark"
                    )?.value.trim() || "",


                /*------------------------------
                    PAYMENT
                ------------------------------*/

                paymentProof:
                    paymentProof,


                /*------------------------------
                    DECLARATIONS
                ------------------------------*/

                detailsConfirmed:
                    document.getElementById(
                        "detailsConfirmed"
                    )?.checked === true,

                membershipDetailsConfirmed:
                    document.getElementById(
                        "membershipDetailsConfirmed"
                    )?.checked === true,

                rideDeclaration:
                    document.getElementById(
                        "rideDeclaration"
                    )?.checked === true,

                medicalDeclaration:
                    document.getElementById(
                        "medicalDeclaration"
                    )?.checked === true

            };


            console.log(
                "SUBMIT REGISTRATION DATA:",
                registrationData
            );


            /*====================================
                    SEND TO MEMBERS API
            ====================================*/

            const form =
                new URLSearchParams();


            form.append(
                "action",
                "SUBMIT_RIDE_REGISTRATION"
            );


            form.append(
                "data",
                JSON.stringify(
                    registrationData
                )
            );


            const response =
                await fetch(
                    MEMBERS_API,
                    {
                        method: "POST",
                        body: form
                    }
                );


            const text =
                await response.text();


            console.log(
                "SUBMIT REGISTRATION RAW RESPONSE:",
                text
            );


            let result;


            try {

                result =
                    JSON.parse(text);

            }
            catch (error) {

                throw new Error(
                    "Invalid response from registration server."
                );

            }


            console.log(
                "SUBMIT REGISTRATION RESULT:",
                result
            );


            if (
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Registration could not be submitted."
                );

            }


            /*====================================
                    SUCCESS
            ====================================*/

            const registrationID =
                result.data?.registrationID ||
                "";


            registrationFormSection.classList.add(
                "hidden"
            );


            successSection.classList.remove(
                "hidden"
            );


            document.getElementById(
                "registrationNumber"
            ).innerHTML =

                registrationID
                    ? `
                        Registration ID:
                        <strong>
                            ${escapeHTML(
                                registrationID
                            )}
                        </strong>
                      `
                    : "Registration submitted successfully.";


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });


        }
        catch (error) {

            console.error(
                "REGISTRATION SUBMISSION ERROR:",
                error
            );


            alert(
                error.message ||
                "Unable to submit registration."
            );


            submitButton.disabled =
                false;

            submitButton.innerHTML =
                originalButtonText;

        }

    }
);


/*==================================================
        ERROR
==================================================*/

function showRegistrationError(message) {

    eventCard.innerHTML = `

        <div class="message-box">

            <strong>
                Unable to load registration.
            </strong>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/*==================================================
        ESCAPE HTML
==================================================*/

function escapeHTML(value) {

    return String(value || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}