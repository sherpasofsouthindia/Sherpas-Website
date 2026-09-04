const EVENTS_API_URL = 
"https://script.google.com/macros/s/AKfycbyEsRyyMII7sBskySkuCUAznl8EOBGL81dj3ijCTRKIwmW6Xkp9Nkfb2kHDGFcTToERnw/exec";

/*==========================================
        EVENTS ADMIN
==========================================*/

const API =
"https://script.google.com/macros/s/AKfycbyEsRyyMII7sBskySkuCUAznl8EOBGL81dj3ijCTRKIwmW6Xkp9Nkfb2kHDGFcTToERnw/exec";

const MEMBERS_API =
    "https://script.google.com/macros/s/AKfycbzZwnRIuTBjdy9OmYxXaiOXI10aITdffJaVEQ-4W6tf1uz_lyInrcNOdWjm-O7ACQ2L/exec";


/*==========================================
        ELEMENTS
==========================================*/

const modal =
    document.getElementById("eventModal");

const addBtn =
    document.getElementById("addEventBtn");

const closeBtn =
    document.querySelector(".close");

const poster =
    document.getElementById("poster");

const preview =
    document.getElementById("posterPreview");

const search =
    document.getElementById("searchEvent");

const eventsTable =
    document.getElementById("eventsTable");

const registrationEnabled =
    document.getElementById("registrationEnabled");

const registrationOptions =
    document.getElementById("registrationOptions");

const membershipRequired =
    document.getElementById("membershipRequired");

const approvedMembersOnly =
    document.getElementById("approvedMembersOnly");

const allowPillion =
    document.getElementById("allowPillion");

const maximumParticipants =
    document.getElementById("maximumParticipants");

const registrationFee =
    document.getElementById("registrationFee");

const paymentRequired =
    document.getElementById("paymentRequired");

const paymentProofRequired =
    document.getElementById("paymentProofRequired");

const adminPaymentVerification =
    document.getElementById("adminPaymentVerification");

const adminApprovalRequired =
    document.getElementById("adminApprovalRequired");

const registrationOpenDate =
    document.getElementById("registrationOpenDate");

const registrationCloseDate =
    document.getElementById("registrationCloseDate");

const registrationStatus =
    document.getElementById("registrationStatus");


    let allEvents = [];
    let editingEventID = null;

    let allEventDayAttendance = [];


/*==================================================
        REGISTRATION SETTINGS TOGGLE
==================================================*/

if (registrationEnabled) {

    registrationEnabled.addEventListener(
        "change",
        function () {

            if (registrationOptions) {

                registrationOptions.style.display =
                    this.checked
                        ? "block"
                        : "none";

            }

        }
    );

}


document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*======================================
                LOAD EVENTS BY DEFAULT
        ======================================*/

        loadEvents();


        /*======================================
                TAB SWITCHING
        ======================================*/

        const tabs =
            document.querySelectorAll(
                ".events-tab"
            );


        const panels =
            document.querySelectorAll(
                ".events-tab-panel"
            );

        const exportButton =
            document.getElementById(
                "exportRegistrationsExcelBtn"
            );

        if (exportButton) {

            exportButton.addEventListener(
                "click",
                exportRegistrationsToExcel
            );

        }

        const eventDayExcelButton =
            document.getElementById(
                "exportEventDayExcelBtn"
            );


        if (eventDayExcelButton) {

            eventDayExcelButton.addEventListener(
                "click",
                exportEventDayAttendanceToExcel
            );

        }


        const eventDayPdfButton =
            document.getElementById(
                "exportEventDayPdfBtn"
            );


        if (eventDayPdfButton) {

            eventDayPdfButton.addEventListener(
                "click",
                exportEventDayAttendanceToPDF
            );

        }

        tabs.forEach(
            function (tab) {

                tab.addEventListener(
                    "click",
                    function () {

                        const targetID =
                            this.dataset.tab;


                        if (!targetID) {
                            return;
                        }


                        /*--------------------------
                            ACTIVE TAB
                        --------------------------*/

                        tabs.forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        this.classList.add(
                            "active"
                        );


                        /*--------------------------
                            ACTIVE PANEL
                        --------------------------*/

                        panels.forEach(
                            function (panel) {

                                panel.classList.remove(
                                    "active"
                                );

                            }
                        );


                        const targetPanel =
                            document.getElementById(
                                targetID
                            );


                        if (targetPanel) {

                            targetPanel.classList.add(
                                "active"
                            );

                        }


                        /*--------------------------
                            LOAD REGISTRATIONS
                            ONLY WHEN OPENED
                        --------------------------*/

                        if (
                            targetID ===
                            "registrationsPanel"
                        ) {

                            loadRideRegistrations();

                        }


                        /*--------------------------
                            LOAD EVENT DAY
                            ONLY WHEN OPENED
                        --------------------------*/

                        if (
                            targetID ===
                            "eventDayPanel"
                        ) {

                            loadEventDay();

                        }

                    }
                );

            }
        );


        /*======================================
                REFRESH REGISTRATIONS
        ======================================*/

        const refreshButton =
            document.getElementById(
                "refreshRideRegistrationsBtn"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                function () {

                    loadRideRegistrations();

                }
            );

        }

    }
);


/*==========================================
        OPEN MODAL
==========================================*/

addBtn.onclick = function () {

    modal.classList.add("show");

};


/*==========================================
        CLOSE MODAL
==========================================*/

closeBtn.onclick = function () {

    modal.classList.remove("show");

};




/*==========================================
        CLOSE MODAL - OUTSIDE CLICK
==========================================*/

window.onclick = function (e) {

    if (e.target === modal) {

        modal.classList.remove("show");

    }

};


editingEventID = null;

const modalTitle =
    document.querySelector(
        "#eventModal h2"
    );

if (modalTitle) {

    modalTitle.textContent =
        "Add Event";

}


const submitButton =
    document.querySelector(
        "#eventForm button[type='submit']"
    );

if (submitButton) {

    submitButton.textContent =
        "Save Event";

}

/*==========================================
        POSTER PREVIEW
==========================================*/

poster.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) {

            preview.style.display =
                "none";

            preview.src = "";

            return;

        }

        const reader =
            new FileReader();

        reader.onload =
            function (e) {

                preview.src =
                    e.target.result;

                preview.style.display =
                    "block";

            };

        reader.readAsDataURL(file);

    }
);


/*==========================================
        FILE TO BASE64
==========================================*/

function fileToBase64(file) {

    return new Promise(
        function (resolve, reject) {

            if (!file) {

                resolve("");

                return;

            }

            const reader =
                new FileReader();

            reader.onload =
                function (e) {

                    resolve(
                        e.target.result
                    );

                };

            reader.onerror =
                reject;

            reader.readAsDataURL(file);

        }
    );

}


/*==========================================
        LOAD EVENTS
==========================================*/

async function loadEvents() {

    const container =
        document.getElementById("eventsTable");

    if (!container)
        return;


    container.innerHTML = `

        <div class="loading-events">

            <i class="fa-solid fa-spinner fa-spin"></i>

            Loading events...

        </div>

    `;


    try {

        const url =
            API +
            (API.includes("?") ? "&" : "?") +
            "action=GET_EVENTS";

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


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load events."
            );

        }


        allEvents = result.data || [];

        renderEvents(allEvents);


    }

    catch (error) {

        console.error(
            "Load Events Error:",
            error
        );


        container.innerHTML = `

            <div class="events-error">

                <strong>
                    Failed to load events.
                </strong>

                <br>

                ${escapeHTML(
                    error.message
                )}

            </div>

        `;

    }

}


/*==================================================
        SAVE REGISTRATION SETTINGS
==================================================*/

async function saveRegistrationSettings(eventID) {

    if (!eventID) {

        throw new Error(
            "Event ID is required for registration settings."
        );

    }


    /*------------------------------------------
            GET ADMIN SESSION
    ------------------------------------------*/

    const adminToken =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );


    if (!adminToken) {

        throw new Error(
            "Admin session expired. Please login again."
        );

    }


    /*------------------------------------------
            COLLECT SETTINGS
    ------------------------------------------*/

    const settings = {

        "Event ID":
            String(eventID).trim(),

        "Registration Enabled":
            registrationEnabled &&
            registrationEnabled.checked
                ? "Yes"
                : "No",

        "Membership Required":
            membershipRequired
                ? membershipRequired.value
                : "Yes",

        "Approved Members Only":
            approvedMembersOnly
                ? approvedMembersOnly.value
                : "Yes",

        "Allow Pillion":
            allowPillion
                ? allowPillion.value
                : "No",

        "Maximum Participants":
            maximumParticipants
                ? maximumParticipants.value
                : "0",

        "Registration Fee":
            registrationFee
                ? registrationFee.value
                : "0",

        "Payment Required":
            paymentRequired
                ? paymentRequired.value
                : "No",

        "Payment Proof Required":
            paymentProofRequired
                ? paymentProofRequired.value
                : "No",

        "Admin Payment Verification":
            adminPaymentVerification
                ? adminPaymentVerification.value
                : "No",

        "Admin Approval Required":
            adminApprovalRequired
                ? adminApprovalRequired.value
                : "No",

        "Registration Open Date":
            registrationOpenDate
                ? registrationOpenDate.value
                : "",

        "Registration Close Date":
            registrationCloseDate
                ? registrationCloseDate.value
                : "",

        "Registration Status":
            registrationStatus
                ? registrationStatus.value
                : "Closed"
    };


    /*------------------------------------------
            PREPARE REQUEST
    ------------------------------------------*/

    const form =
        new URLSearchParams();


    form.append(
        "action",
        "SAVE_REGISTRATION_SETTINGS"
    );


    form.append(
        "token",
        adminToken
    );


    form.append(
        "data",
        JSON.stringify({
            eventID: String(eventID).trim(),
            ...settings
        })
    );



    /*------------------------------------------
            SEND REQUEST
    ------------------------------------------*/

    const response =
        await fetch(
            API,
            {
                method: "POST",
                body: form
            }
        );


    const text =
        await response.text();


    /*------------------------------------------
            PARSE RESPONSE
    ------------------------------------------*/

    let result;

    try {

        result =
            JSON.parse(text);

    }
    catch (error) {

        throw new Error(
            "Invalid response from registration settings API."
        );

    }


    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to save registration settings."
        );

    }


    return result;

}   

/*==========================================
        RENDER EVENTS
==========================================*/

function renderEvents(events) {

    const container =
        document.getElementById("eventsTable");

    if (!container) {

        console.error("eventsTable element not found");

        return;

    }

    if (!events || events.length === 0) {

        container.innerHTML = `
            <div class="no-events">
                No events found.
            </div>
        `;

        return;

    }

    container.innerHTML = "";

    events.forEach(function (event) {

        /*----------------------------------
                DATE
        ----------------------------------*/

        let eventDate = event["Date"] || "";

        if (eventDate) {

            const d = new Date(eventDate);

            if (!isNaN(d.getTime())) {

                eventDate =
                    d.toLocaleDateString(
                        "en-GB",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    );

            }

        }


        /*----------------------------------
                TIME
        ----------------------------------*/

        let eventTime = event["Time"] || "";

        /* TIME FORMAT */

        if (eventTime) {

            // If already in HH:mm format
            if (
                typeof eventTime === "string" &&
                /^\d{1,2}:\d{2}$/.test(eventTime.trim())
            ) {

                eventTime = eventTime.trim();

            }

            // If ISO date-time is returned from Google Apps Script
            else if (
                typeof eventTime === "string" &&
                eventTime.includes("T")
            ) {

                // Extract the time directly from the ISO value
                // This avoids timezone conversion.
                const match =
                    eventTime.match(/T(\d{2}):(\d{2})/);

                if (match) {

                    eventTime =
                        match[1] + ":" + match[2];

                }

            }

            // If JavaScript Date object
            else if (
                eventTime instanceof Date &&
                !isNaN(eventTime.getTime())
            ) {

                const hours =
                    String(eventTime.getHours()).padStart(2, "0");

                const minutes =
                    String(eventTime.getMinutes()).padStart(2, "0");

                eventTime =
                    hours + ":" + minutes;

            }

            else {

                eventTime = String(eventTime);

            }

        }


        /*----------------------------------
                STATUS
        ----------------------------------*/

        const status =
            String(
                event["Status"] || "Active"
            );

        const isActive =
            status.toLowerCase() === "active";


        /*----------------------------------
                REGISTRATION LINK
        ----------------------------------*/

        let registrationHTML = "";

        if (event["Registration Link"]) {

            registrationHTML = `

                <a
                    href="${escapeHTML(
                        event["Registration Link"]
                    )}"
                    target="_blank"
                    class="registration-link"
                >

                    <i class="fa-solid fa-link"></i>

                    Registration

                </a>

            `;

        }

        

        /*----------------------------------
                EVENT ROW
        ----------------------------------*/

        const row =
            document.createElement("div");

        row.className = "event-row";

        row.innerHTML = `

            <div class="event-poster">

                ${
                    event["Image URL"]
                        ? `
                            <img
                                src="${escapeHTML(event["Image URL"])}"
                                alt="${escapeHTML(event["Event Name"] || "Event Poster")}"
                                class="event-poster-image"
                                data-poster="${escapeHTML(event["Image URL"])}"
                                onclick="event.preventDefault(); event.stopPropagation();"
                            >
                        `
                        : `
                            <div class="event-no-poster">

                                <i class="fa-solid fa-image"></i>

                                <span>No Poster</span>

                            </div>
                        `
                }

            </div>

            <div class="event-info">

                <h2>

                    ${escapeHTML(
                        event["Event Name"] || ""
                    )}

                    <span class="event-id">

                        ${escapeHTML(
                            event["Event ID"] || ""
                        )}

                    </span>

                </h2>


                <div class="event-meta">

                    <span>

                        <i class="fa-solid fa-tag"></i>

                        ${escapeHTML(
                            event["Category"] || ""
                        )}

                    </span>


                    <span>

                        <i class="fa-solid fa-calendar"></i>

                        ${escapeHTML(eventDate)}

                    </span>


                    <span>

                        <i class="fa-solid fa-clock"></i>

                        ${escapeHTML(eventTime)}

                    </span>


                    <span>

                        <i class="fa-solid fa-location-dot"></i>

                        ${escapeHTML(
                            event["Location"] || ""
                        )}

                    </span>

                </div>


                <p>

                    ${escapeHTML(
                        event["Description"] || ""
                    )}

                </p>


                ${registrationHTML}

            </div>


            <div class="event-actions">

                <span class="status-badge ${
                    isActive
                        ? "active"
                        : "inactive"
                }">

                    ${escapeHTML(status)}

                </span>


                <button
                    type="button"
                    class="status-btn"
                    data-id="${escapeHTML(
                        event["Event ID"] || ""
                    )}"
                >

                    ${
                        isActive
                            ? "Deactivate"
                            : "Activate"
                    }

                </button>

                
                <button
                    type="button"
                    class="edit-event-btn"
                    data-id="${escapeHTML(
                        event["Event ID"] || ""
                    )}"
                >

                    <i class="fa-solid fa-pen"></i>
                    Edit

                </button>


                <button
                    type="button"
                    class="delete-event-btn"
                    data-id="${escapeHTML(
                        event["Event ID"] || ""
                    )}"
                >

                    <i class="fa-solid fa-trash"></i>
                    Delete

                </button>

            </div>

        `;


        container.appendChild(row);

    });

}

/*==========================================
        ESCAPE HTML
==========================================*/

function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/*==========================================
        SEARCH EVENTS
==========================================*/

search.addEventListener(
    "keyup",
    function () {

        const value =
            this.value
                .toLowerCase()
                .trim();


        document
            .querySelectorAll(
                ".event-row"
            )
            .forEach(
                function (row) {

                    row.style.display =
                        row.innerText
                            .toLowerCase()
                            .includes(value)
                        ? ""
                        : "none";

                }
            );

    }
);


/*==========================================
        TOGGLE STATUS
==========================================*/

document.addEventListener(
    "click",
    async function (e) {

        const btn =
            e.target.closest(
                ".status-btn"
            );

        if (!btn)
            return;


        const eventID =
            btn.dataset.id;

        if (!eventID)
            return;


        btn.disabled = true;


        try {

            const form =
                new URLSearchParams();

            const token =
                sessionStorage.getItem(
                    "sherpas_admin_token"
                );

            if (!token) {

                throw new Error(
                    "Admin session expired. Please login again."
                );

            }

            form.append(
                "action",
                "TOGGLE_STATUS"
            );

            form.append(
                "token",
                token
            );

            form.append(
                "data",
                JSON.stringify({
                    eventID: eventID
                })
            );


            const response =
                await fetch(
                    API,
                    {

                        method: "POST",

                        body: form

                    }
                );


            const text =
                await response.text();



            const result =
                JSON.parse(text);


            if (!result.success) {

                throw new Error(

                    result.message ||
                    result.error ||
                    "Unable to change status."

                );

            }


            await loadEvents();

        }
        catch (error) {

            console.error(
                "STATUS ERROR:",
                error
            );


            alert(

                "Failed to change event status.\n\n" +
                error.message

            );

        }
        finally {

            btn.disabled =
                false;

        }

    }
);


/*==========================================
        ADD EVENT
==========================================*/

document
    .getElementById("eventForm")
    .addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const submitButton =
                this.querySelector(
                    "button[type='submit']"
                );


            try {

                submitButton.disabled =
                    true;


                submitButton.textContent =
                    "Saving Event...";


                const file =
                    poster.files[0];


                let base64 = "";


                if (file) {

                    base64 =
                        await fileToBase64(
                            file
                        );

                }


                const eventData = {

                    eventName:
                        document
                            .getElementById("eventName")
                            .value
                            .trim(),

                    category:
                        document
                            .getElementById("eventCategory")
                            .value,

                    date:
                        document
                            .getElementById("eventDate")
                            .value,

                    time:
                        document
                            .getElementById("eventTime")
                            .value,

                    location:
                        document
                            .getElementById("eventLocation")
                            .value
                            .trim(),

                    description:
                        document
                            .getElementById("eventDescription")
                            .value
                            .trim(),

                    image:
                        base64,

                    fileName:
                        file ? file.name : "",

                    mimeType:
                        file ? file.type : "image/jpeg",

                    link:
                        document
                            .getElementById("registrationLink")
                            .value
                            .trim()

                };

                /*==================================================
                        UPDATE EVENT DATA
                ==================================================*/

                if (editingEventID) {

                    const existingEvent =
                        allEvents.find(function (item) {

                            return String(
                                item["Event ID"]
                            ).trim() === String(
                                editingEventID
                            ).trim();

                        });


                    eventData["Event ID"] =
                        editingEventID;

                    eventData.eventID = 
                        editingEventID;

                    eventData["Event Name"] =
                        eventData.eventName;

                    eventData["Category"] =
                        eventData.category;

                    eventData["Date"] =
                        eventData.date;

                    eventData["Time"] =
                        eventData.time;

                    eventData["Location"] =
                        eventData.location;

                    eventData["Description"] =
                        eventData.description;

                    eventData["Registration Link"] =
                        eventData.link;


                    /*
                        Keep existing image URL during editing.

                        We will handle replacing the poster
                        separately after Edit/Delete is working.
                    */

                    eventData["Image URL"] =
                        existingEvent
                            ? existingEvent["Image URL"] || ""
                            : "";


                    eventData["Status"] =
                        existingEvent
                            ? existingEvent["Status"] || "Active"
                            : "Active";

                }


                const form =
                    new URLSearchParams();

                /*----------------------------------
                        ADMIN SESSION TOKEN
                ----------------------------------*/

                const token =
                    sessionStorage.getItem(
                        "sherpas_admin_token"
                    );

                if (!token) {

                    throw new Error(
                        "Admin session expired. Please login again."
                    );

                }


                /*----------------------------------
                        ADD EVENT REQUEST
                ----------------------------------*/

                form.append(
                    "action",
                    editingEventID
                        ? "UPDATE_EVENT"
                        : "ADD_EVENT"
                );

                form.append(
                    "token",
                    token
                );

                form.append(
                    "data",
                    JSON.stringify(
                        eventData
                    )
                );


                const response =
                    await fetch(
                        API,
                        {

                            method: "POST",

                            body: form

                        }
                    );


                const text =
                    await response.text();


                const result =
                    JSON.parse(text);


                if (!result.success) {

                    throw new Error(

                        result.message ||
                        result.error ||
                        "Event could not be added."

                    );

                }

                const savedEventID =
                    result.eventID ||
                    result.data?.eventID ||
                    editingEventID;

                await saveRegistrationSettings(
                    savedEventID
                );


                alert(

                    "Event Added Successfully\n\n" +
                    "Event ID: " +
                    (
                        result.eventID ||
                        result.data?.eventID ||
                        ""
                    )

                );


                modal.classList.remove(
                    "show"
                );


                this.reset();


                preview.src =
                    "";


                preview.style.display =
                    "none";


                await loadEvents();

            }
            catch (error) {

                console.error(
                    "ADD EVENT ERROR:",
                    error
                );


                alert(

                    "Failed to add event.\n\n" +
                    error.message

                );

            }
            finally {

                submitButton.disabled =
                    false;


                submitButton.textContent =
                    "Save Event";

            }

        }
    );




/*==================================================
        EDIT EVENT
==================================================*/

document.addEventListener(
    "click",
    function (e) {

        const btn =
            e.target.closest(".edit-event-btn");

        if (!btn) {
            return;
        }


        const eventID =
            btn.dataset.id;

        if (!eventID) {
            return;
        }


        const event =
            allEvents.find(function (item) {

                return String(
                    item["Event ID"]
                ).trim() === String(
                    eventID
                ).trim();

            });


        if (!event) {

            alert(
                "Event details could not be found."
            );

            return;

        }


        editingEventID =
            eventID;


        /*----------------------------------
                LOAD EVENT INTO FORM
        ----------------------------------*/

        document.getElementById(
            "eventName"
        ).value =
            event["Event Name"] || "";


        document.getElementById(
            "eventDate"
        ).value =
            convertDateForInput(
                event["Date"]
            );


        document.getElementById(
            "eventCategory"
        ).value =
            event["Category"] || "Ride";


        document.getElementById(
            "eventTime"
        ).value =
            convertTimeForInput(
                event["Time"]
            );


        document.getElementById(
            "eventLocation"
        ).value =
            event["Location"] || "";


        document.getElementById(
            "eventDescription"
        ).value =
            event["Description"] || "";


        document.getElementById(
            "registrationLink"
        ).value =
            event["Registration Link"] || "";


        /*----------------------------------
                EXISTING POSTER PREVIEW
        ----------------------------------*/

        if (event["Image URL"]) {

            preview.src =
                event["Image URL"];

            preview.style.display =
                "block";

        }
        else {

            preview.src = "";

            preview.style.display =
                "none";

        }


        /*----------------------------------
                CHANGE MODAL TITLE
        ----------------------------------*/

        const modalTitle =
            document.querySelector(
                "#eventModal h2"
            );

        if (modalTitle) {

            modalTitle.textContent =
                "Edit Event";

        }


        const submitButton =
            document.querySelector(
                "#eventForm button[type='submit']"
            );

        if (submitButton) {

            submitButton.textContent =
                "Update Event";

        }


        modal.classList.add("show");

    }
);


/*==================================================
        DATE FORMAT
==================================================*/

function convertDateForInput(value) {

    if (!value) {
        return "";
    }


    const text =
        String(value).trim();


    /* Already YYYY-MM-DD */

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(text)
    ) {

        return text;

    }


    /* DD-MMM-YYYY */

    const parts =
        text.split("-");


    if (parts.length === 3) {

        const day =
            parts[0].padStart(2, "0");

        const monthName =
            parts[1].toLowerCase();

        const year =
            parts[2];


        const months = {

            jan: "01",
            feb: "02",
            mar: "03",
            apr: "04",
            may: "05",
            jun: "06",
            jul: "07",
            aug: "08",
            sep: "09",
            oct: "10",
            nov: "11",
            dec: "12"

        };


        const month =
            months[monthName];


        if (month) {

            return `${year}-${month}-${day}`;

        }

    }


    return "";

}


/*==================================================
        TIME FORMAT
==================================================*/

function convertTimeForInput(value) {

    if (!value) {
        return "";
    }


    const text =
        String(value).trim();


    const match =
        text.match(
            /(\d{1,2}):(\d{2})/
        );


    if (!match) {
        return "";
    }


    return (
        String(match[1]).padStart(2, "0") +
        ":" +
        match[2]
    );

}

/*==================================================
        DELETE EVENT
==================================================*/

document.addEventListener(
    "click",
    async function (e) {

        const btn =
            e.target.closest(
                ".delete-event-btn"
            );

        if (!btn) {
            return;
        }


        const eventID =
            btn.dataset.id;


        if (!eventID) {
            return;
        }


        const event =
            allEvents.find(function (item) {

                return String(
                    item["Event ID"]
                ).trim() === String(
                    eventID
                ).trim();

            });


        const eventName =
            event
                ? event["Event Name"]
                : eventID;


        const confirmed =
            confirm(
                "Delete this event?\n\n" +
                eventName +
                "\n\nThis action cannot be undone."
            );


        if (!confirmed) {
            return;
        }


        btn.disabled = true;

        btn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';


        try {

            const token =
                sessionStorage.getItem(
                    "sherpas_admin_token"
                );


            if (!token) {

                throw new Error(
                    "Admin session expired. Please login again."
                );

            }


            const form =
                new URLSearchParams();


            form.append(
                "action",
                "DELETE_EVENT"
            );


            form.append(
                "token",
                token
            );


            form.append(
                "data",
                JSON.stringify({

                    eventID: eventID

                })
            );


            const response =
                await fetch(
                    API,
                    {

                        method: "POST",

                        body: form

                    }
                );


            const text =
                await response.text();


            const result =
                JSON.parse(text);


            if (!result.success) {

                throw new Error(

                    result.message ||
                    result.error ||
                    "Unable to delete event."

                );

            }


            alert(
                "Event deleted successfully."
            );


            await loadEvents();

        }
        catch (error) {

            console.error(
                "DELETE EVENT ERROR:",
                error
            );


            alert(
                "Failed to delete event.\n\n" +
                error.message
            );

        }
        finally {

            btn.disabled =
                false;

        }

    }
);

/*==================================================
        VIEW EVENT POSTER
==================================================*/

document.addEventListener(
    "click",
    function (e) {

        const btn =
            e.target.closest(
                ".view-poster-btn"
            );

        if (!btn) {
            return;
        }


        const posterURL =
            btn.dataset.poster;


        if (!posterURL) {
            return;
        }


        const viewer =
            document.getElementById(
                "posterViewer"
            );

        const image =
            document.getElementById(
                "fullPosterImage"
            );


        if (!viewer || !image) {
            return;
        }


        image.src =
            posterURL;


        viewer.classList.add(
            "show"
        );

    }
);


/*==================================================
        CLOSE POSTER
==================================================*/

document.addEventListener(
    "click",
    function (e) {

        if (
            e.target.id ===
            "closePosterViewer"
        ) {

            closePosterViewer();

        }

    }
);


/*==================================================
        CLOSE WHEN CLICKING OUTSIDE
==================================================*/

document.addEventListener(
    "click",
    function (e) {

        const viewer =
            document.getElementById(
                "posterViewer"
            );


        if (
            viewer &&
            e.target === viewer
        ) {

            closePosterViewer();

        }

    }
);


/*==================================================
        CLOSE WITH ESCAPE
==================================================*/

document.addEventListener(
    "keydown",
    function (e) {

        if (
            e.key === "Escape"
        ) {

            closePosterViewer();

        }

    }
);


/*==================================================
        CLOSE POSTER FUNCTION
==================================================*/

function closePosterViewer() {

    const viewer =
        document.getElementById(
            "posterViewer"
        );

    const image =
        document.getElementById(
            "fullPosterImage"
        );


    if (!viewer) {
        return;
    }


    viewer.classList.remove(
        "show"
    );


    if (image) {

        image.src = "";

    }

}

function initializeEventDayBulkSelection() {

    const riderList =
        document.getElementById(
            "eventDayRiderList"
        );


    if (!riderList) {
        return;
    }


    if (
        document.getElementById(
            "eventDayBulkToolbar"
        )
    ) {
        return;
    }


    const toolbar =
        document.createElement(
            "div"
        );


    toolbar.id =
        "eventDayBulkToolbar";

    toolbar.className =
        "event-day-bulk-toolbar";


    toolbar.innerHTML = `

        <label
            class="event-day-select-all"
        >

            <input
                type="checkbox"
                id="eventDaySelectAll"
            >

            <span>
                Select All
            </span>

        </label>


        <span
            class="event-day-selected-count"
        >
            <strong
                id="eventDaySelectedCount"
            >
                0
            </strong>

            selected
        </span>


        <button
            type="button"
            id="bulkCheckInEventDayBtn"
            class="event-day-bulk-checkin-btn"
            disabled
            title="Check in selected riders"
        >
            <i class="fa-solid fa-right-to-bracket"></i>
            Check In Selected
        </button>

        <button
            type="button"
            id="bulkStartRideEventDayBtn"
            class="event-day-bulk-start-btn"
            disabled
            title="Start selected riders"
        >
            <i class="fa-solid fa-flag-checkered"></i>
            Start Selected
        </button>

        <button
            type="button"
            id="bulkAbsentEventDayBtn"
            class="event-day-bulk-absent-btn"
            disabled
            title="Mark selected riders absent"
        >
            <i class="fa-solid fa-user-xmark"></i>
            Absent Selected
        </button>

        <button
            type="button"
            id="bulkReturnRideEventDayBtn"
            class="event-day-bulk-return-btn"
            disabled
            title="Return selected riders"
        >
            <i class="fa-solid fa-rotate-left"></i>
            Return Selected
        </button>

        <button
            type="button"
            id="clearEventDaySelectionBtn"
            class="event-day-bulk-clear-btn"
            disabled
            title="Clear selection"
        >
            <i class="fa-solid fa-xmark"></i>
            Clear
        </button>

    `;


    riderList.parentNode.insertBefore(
        toolbar,
        riderList
    );


    document.addEventListener(
        "change",
        function(e) {

            if (
                e.target.matches(
                    ".event-day-rider-select"
                )
            ) {

                updateEventDayBulkSelection();

            }


            if (
                e.target.id ===
                "eventDaySelectAll"
            ) {

                document
                    .querySelectorAll(
                        ".event-day-rider-select"
                    )
                    .forEach(
                        function(
                            checkbox
                        ) {

                            checkbox.checked =
                                e.target.checked;

                        }
                    );


                updateEventDayBulkSelection();

            }

        }
    );


    const bulkButton =
        document.getElementById(
            "bulkCheckInEventDayBtn"
        );


    if (bulkButton) {

        bulkButton.addEventListener(
            "click",
            bulkCheckInSelectedRiders
        );

    }


    const bulkStartButton =
        document.getElementById(
            "bulkStartRideEventDayBtn"
        );


    if (bulkStartButton) {

        bulkStartButton.addEventListener(
            "click",
            bulkStartSelectedRiders
        );

    }

    const bulkAbsentButton =
        document.getElementById(
            "bulkAbsentEventDayBtn"
        );


    if (bulkAbsentButton) {

        bulkAbsentButton.addEventListener(
            "click",
            bulkMarkRidersAbsent
        );

    }

    const bulkReturnButton =
        document.getElementById(
            "bulkReturnRideEventDayBtn"
        );


    if (bulkReturnButton) {

        bulkReturnButton.addEventListener(
            "click",
            bulkReturnSelectedRiders
        );

    }

        /*------------------------------------------
                INDIVIDUAL CHECK-IN
        ------------------------------------------*/

        riderList.addEventListener(
            "click",
            async function(e) {

                const button =
                    e.target.closest(
                        ".event-day-checkin-btn"
                    );

                if (!button) {
                    return;
                }


                const registrationID =
                    String(
                        button.dataset
                            .registrationId || ""
                    ).trim();


                const eventSelect =
                    document.getElementById(
                        "eventDayEventSelect"
                    );


                const eventID =
                    eventSelect
                        ? eventSelect.value.trim()
                        : "";


                if (
                    !registrationID ||
                    !eventID
                ) {

                    alert(
                        "Unable to identify the rider or event."
                    );

                    return;

                }


                const confirmed =
                    confirm(
                        "Check in this rider?\n\n" +
                        registrationID
                    );


                if (!confirmed) {
                    return;
                }


                const originalHTML =
                    button.innerHTML;


                button.disabled =
                    true;

                button.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i>';


                try {

                    const token =
                        sessionStorage.getItem(
                            "sherpas_admin_token"
                        );


                    if (!token) {

                        throw new Error(
                            "Admin session expired. Please login again."
                        );

                    }


                    const form =
                        new URLSearchParams();


                    form.append(
                        "action",
                        "BULK_CHECK_IN_RIDERS"
                    );


                    form.append(
                        "token",
                        token
                    );


                    form.append(
                        "data",
                        JSON.stringify({

                            eventID:
                                eventID,

                            registrationIDs:
                                [
                                    registrationID
                                ]

                        })
                    );


                    const response =
                        await fetch(
                            MEMBERS_API,
                            {
                                method: "POST",
                                body: form
                            }
                        );


                    const result =
                        await response.json();



                    if (!result.success) {

                        throw new Error(
                            result.message ||
                            "Check-in failed."
                        );

                    }


                    /*
                        Reload the selected event.
                        This also updates the counters.
                    */

                    await loadEventDayRiders(
                        eventID
                    );

                }
                catch (error) {

                    console.error(
                        "INDIVIDUAL CHECK-IN ERROR:",
                        error
                    );


                    alert(
                        "Check-in failed.\n\n" +
                        error.message
                    );


                    button.disabled =
                        false;

                    button.innerHTML =
                        originalHTML;

                }

            }
        );

        /*------------------------------------------
                INDIVIDUAL MARK ABSENT
        ------------------------------------------*/

        riderList.addEventListener(
            "click",
            async function(e) {

                const button =
                    e.target.closest(
                        ".event-day-absent-btn"
                    );


                if (!button) {
                    return;
                }


                const registrationID =
                    String(
                        button.dataset.registrationId || ""
                    ).trim();


                const eventSelect =
                    document.getElementById(
                        "eventDayEventSelect"
                    );


                const eventID =
                    eventSelect
                        ? eventSelect.value.trim()
                        : "";


                if (
                    !registrationID ||
                    !eventID
                ) {

                    alert(
                        "Unable to identify the rider or event."
                    );

                    return;

                }


                if (
                    !confirm(
                        "Mark " +
                        registrationID +
                        " as absent?"
                    )
                ) {

                    return;

                }


                const originalHTML =
                    button.innerHTML;


                button.disabled =
                    true;


                button.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i>';


                try {

                    const token =
                        sessionStorage.getItem(
                            "sherpas_admin_token"
                        );


                    if (!token) {

                        throw new Error(
                            "Admin session expired. Please login again."
                        );

                    }


                    const form =
                        new URLSearchParams();


                    form.append(
                        "action",
                        "MARK_ABSENT_RIDER"
                    );


                    form.append(
                        "token",
                        token
                    );


                    form.append(
                        "data",
                        JSON.stringify({

                            eventID:
                                eventID,

                            registrationID:
                                registrationID,

                            adminEmail:
                                sessionStorage.getItem(
                                    "sherpas_admin_email"
                                ) || ""

                        })
                    );


                    const response =
                        await fetch(
                            MEMBERS_API,
                            {
                                method: "POST",
                                body: form
                            }
                        );


                    const result =
                        await response.json();


                    if (!result.success) {

                        throw new Error(
                            result.message ||
                            "Unable to mark rider absent."
                        );

                    }


                    await loadEventDayRiders(
                        eventID
                    );

                }
                catch (error) {

                    console.error(
                        "MARK ABSENT ERROR:",
                        error
                    );


                    alert(
                        "Mark Absent failed.\n\n" +
                        error.message
                    );


                    button.disabled =
                        false;


                    button.innerHTML =
                        originalHTML;

                }

            }
        );

        /*------------------------------------------
                INDIVIDUAL UNDO CHECK-IN
        ------------------------------------------*/

        riderList.addEventListener(
            "click",
            async function(e) {

                const button =
                    e.target.closest(
                        ".event-day-undo-checkin-btn"
                    );


                if (!button) {
                    return;
                }


                const registrationID =
                    String(
                        button.dataset
                            .registrationId || ""
                    ).trim();


                const eventSelect =
                    document.getElementById(
                        "eventDayEventSelect"
                    );


                const eventID =
                    eventSelect
                        ? eventSelect.value.trim()
                        : "";


                if (
                    !registrationID ||
                    !eventID
                ) {

                    alert(
                        "Unable to identify the rider or event."
                    );

                    return;

                }


                const confirmed =
                    confirm(
                        "Undo check-in for " +
                        registrationID +
                        "?\n\n" +
                        "The attendance record will be kept, " +
                        "but the rider will be marked as not checked in."
                    );


                if (!confirmed) {
                    return;
                }


                const originalHTML =
                    button.innerHTML;


                button.disabled =
                    true;


                button.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i>';


                try {

                    const token =
                        sessionStorage.getItem(
                            "sherpas_admin_token"
                        );


                    if (!token) {

                        throw new Error(
                            "Admin session expired. Please login again."
                        );

                    }


                    const form =
                        new URLSearchParams();


                    form.append(
                        "action",
                        "UNDO_CHECK_IN_RIDER"
                    );


                    form.append(
                        "token",
                        token
                    );


                    form.append(
                        "data",
                        JSON.stringify({

                            eventID:
                                eventID,

                            registrationID:
                                registrationID,

                            adminEmail:
                                sessionStorage.getItem(
                                    "sherpas_admin_email"
                                ) || ""

                        })
                    );


                    const response =
                        await fetch(
                            MEMBERS_API,
                            {
                                method: "POST",
                                body: form
                            }
                        );


                    const result =
                        await response.json();



                    if (!result.success) {

                        throw new Error(
                            result.message ||
                            "Unable to undo check-in."
                        );

                    }


                    await loadEventDayRiders(
                        eventID
                    );

                }
                catch (error) {

                    console.error(
                        "UNDO CHECK-IN ERROR:",
                        error
                    );


                    alert(
                        "Undo Check-In failed.\n\n" +
                        error.message
                    );


                    button.disabled =
                        false;


                    button.innerHTML =
                        originalHTML;

                }

            }
        );

        riderList.addEventListener(
            "click",
            async function(e) {

                const button =
                    e.target.closest(
                        ".event-day-start-btn"
                    );

                if (!button) {
                    return;
                }

                const registrationID =
                    String(
                        button.dataset.registrationId || ""
                    ).trim();

                const eventSelect =
                    document.getElementById(
                        "eventDayEventSelect"
                    );

                const eventID =
                    eventSelect
                        ? eventSelect.value.trim()
                        : "";

                if (
                    !registrationID ||
                    !eventID
                ) {

                    alert(
                        "Unable to identify the rider or event."
                    );

                    return;
                }

                if (
                    !confirm(
                        "Start ride for " +
                        registrationID +
                        "?"
                    )
                ) {
                    return;
                }

                const originalHTML =
                    button.innerHTML;

                button.disabled =
                    true;

                button.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i>';

                try {

                    const token =
                        sessionStorage.getItem(
                            "sherpas_admin_token"
                        );

                    if (!token) {

                        throw new Error(
                            "Admin session expired. Please login again."
                        );

                    }

                    const form =
                        new URLSearchParams();

                    form.append(
                        "action",
                        "START_RIDE_RIDER"
                    );

                    form.append(
                        "token",
                        token
                    );

                    form.append(
                        "data",
                        JSON.stringify({

                            eventID:
                                eventID,

                            registrationID:
                                registrationID,

                            adminEmail:
                                sessionStorage.getItem(
                                    "sherpas_admin_email"
                                ) || ""

                        })
                    );

                    const response =
                        await fetch(
                            MEMBERS_API,
                            {
                                method: "POST",
                                body: form
                            }
                        );

                    const result =
                        await response.json();


                    if (!result.success) {

                        throw new Error(
                            result.message ||
                            "Start Ride failed."
                        );

                    }

                    await loadEventDayRiders(
                        eventID
                    );

                }
                catch (error) {

                    console.error(
                        "START RIDE ERROR:",
                        error
                    );

                    alert(
                        "Start Ride failed.\n\n" +
                        error.message
                    );

                    button.disabled =
                        false;

                    button.innerHTML =
                        originalHTML;
                }

            }
        );

        /*------------------------------------------
                INDIVIDUAL RETURN RIDE
        ------------------------------------------*/

        riderList.addEventListener(
            "click",
            async function(e) {

                const button =
                    e.target.closest(
                        ".event-day-return-btn"
                    );

                if (!button) {
                    return;
                }


                const registrationID =
                    String(
                        button.dataset.registrationId || ""
                    ).trim();


                const eventSelect =
                    document.getElementById(
                        "eventDayEventSelect"
                    );


                const eventID =
                    eventSelect
                        ? eventSelect.value.trim()
                        : "";


                if (
                    !registrationID ||
                    !eventID
                ) {

                    alert(
                        "Unable to identify the rider or event."
                    );

                    return;

                }


                if (
                    !confirm(
                        "Mark " +
                        registrationID +
                        " as returned?"
                    )
                ) {

                    return;

                }


                const originalHTML =
                    button.innerHTML;


                button.disabled =
                    true;


                button.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i>';


                try {

                    const token =
                        sessionStorage.getItem(
                            "sherpas_admin_token"
                        );


                    if (!token) {

                        throw new Error(
                            "Admin session expired. Please login again."
                        );

                    }


                    const form =
                        new URLSearchParams();


                    form.append(
                        "action",
                        "RETURN_RIDE_RIDER"
                    );


                    form.append(
                        "token",
                        token
                    );


                    form.append(
                        "data",
                        JSON.stringify({

                            eventID:
                                eventID,

                            registrationID:
                                registrationID,

                            adminEmail:
                                sessionStorage.getItem(
                                    "sherpas_admin_email"
                                ) || ""

                        })
                    );


                    const response =
                        await fetch(
                            MEMBERS_API,
                            {
                                method: "POST",
                                body: form
                            }
                        );


                    const result =
                        await response.json();



                    if (!result.success) {

                        throw new Error(
                            result.message ||
                            "Return failed."
                        );

                    }


                    await loadEventDayRiders(
                        eventID
                    );

                }
                catch (error) {

                    console.error(
                        "RETURN RIDE ERROR:",
                        error
                    );


                    alert(
                        "Return Ride failed.\n\n" +
                        error.message
                    );


                    button.disabled =
                        false;


                    button.innerHTML =
                        originalHTML;

                }

            }
        );
            


    const clearButton =
        document.getElementById(
            "clearEventDaySelectionBtn"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearEventDaySelection
        );

    }

}


function updateEventDayBulkSelection() {

    const selected =
        Array.from(
            document.querySelectorAll(
                ".event-day-rider-select:checked"
            )
        );


    const count =
        selected.length;


    const countElement =
        document.getElementById(
            "eventDaySelectedCount"
        );


    const bulkButton =
        document.getElementById(
            "bulkCheckInEventDayBtn"
        );

    const bulkAbsentButton =
        document.getElementById(
            "bulkAbsentEventDayBtn"
        );

    const bulkStartButton =
        document.getElementById(
            "bulkStartRideEventDayBtn"
        );

    const bulkReturnButton =
        document.getElementById(
            "bulkReturnRideEventDayBtn"
        );
    
    
    const clearButton =
        document.getElementById(
            "clearEventDaySelectionBtn"
        );


    if (countElement) {

        countElement.textContent =
            count;

    }


    if (bulkButton) {

        const checkInCount =
            selected.filter(
                function(checkbox) {

                    const registrationID =
                        String(
                            checkbox.dataset
                                .registrationId || ""
                        ).trim();


                    const attendance =
                        allEventDayAttendance.find(
                            function(item) {

                                return String(
                                    item[
                                        "Registration ID"
                                    ] || ""
                                ).trim()
                                ===
                                registrationID;

                            }
                        );


                    const checkInStatus =
                        String(
                            attendance?.[
                                "Check-In Status"
                            ] || ""
                        )
                        .trim()
                        .toLowerCase();


                    return (
                        checkInStatus !==
                        "checked in"
                        &&
                        checkInStatus !==
                        "started"
                    );

                }
            ).length;


        bulkButton.disabled =
            checkInCount === 0;

    }

    if (bulkAbsentButton) {

        const absentableCount =
            selected.filter(
                function(checkbox) {

                    const registrationID =
                        String(
                            checkbox.dataset
                                .registrationId || ""
                        ).trim();


                    const attendance =
                        allEventDayAttendance.find(
                            function(item) {

                                return String(
                                    item[
                                        "Registration ID"
                                    ] || ""
                                ).trim()
                                ===
                                registrationID;

                            }
                        );


                    const checkInStatus =
                        String(
                            attendance?.[
                                "Check-In Status"
                            ] || ""
                        )
                        .trim()
                        .toLowerCase();


                    const startStatus =
                        String(
                            attendance?.[
                                "Start Status"
                            ] || ""
                        )
                        .trim()
                        .toLowerCase();


                    const returnStatus =
                        String(
                            attendance?.[
                                "Return Status"
                            ] || ""
                        )
                        .trim()
                        .toLowerCase();


                    const attendanceStatus =
                        String(
                            attendance?.[
                                "Attendance Status"
                            ] || ""
                        )
                        .trim()
                        .toLowerCase();


                    return (
                        checkInStatus !== "checked in"
                        &&
                        startStatus !== "started"
                        &&
                        returnStatus !== "returned"
                        &&
                        attendanceStatus !== "no show"
                    );

                }
            ).length;


        bulkAbsentButton.disabled =
            absentableCount === 0;

    }

    if (bulkStartButton) {

        const startableCount =
            selected.filter(
                function(checkbox) {

                    const registrationID =
                        String(
                            checkbox.dataset
                                .registrationId || ""
                        ).trim();


                    const attendance =
                        allEventDayAttendance.find(
                            function(item) {

                                return String(
                                    item[
                                        "Registration ID"
                                    ] || ""
                                ).trim()
                                ===
                                registrationID;

                            }
                        );


                    const checkedIn =
                        String(
                            attendance?.[
                                "Check-In Status"
                            ] || ""
                        )
                        .trim()
                        .toLowerCase()
                        ===
                        "checked in";


                    const started =
                        String(
                            attendance?.[
                                "Start Status"
                            ] || ""
                        )
                        .trim()
                        .toLowerCase()
                        ===
                        "started";


                    return (
                        checkedIn &&
                        !started
                    );

                }
            ).length;


        bulkStartButton.disabled =
            startableCount === 0;

    }

    if (bulkReturnButton) {

        const returnableCount =
            selected.filter(
                function(checkbox) {

                    const registrationID =
                        String(
                            checkbox.dataset
                                .registrationId || ""
                        ).trim();


                    const attendance =
                        allEventDayAttendance.find(
                            function(item) {

                                return String(
                                    item[
                                        "Registration ID"
                                    ] || ""
                                ).trim()
                                ===
                                registrationID;

                            }
                        );


                    const startStatus =
                        String(
                            attendance?.[
                                "Start Status"
                            ] || ""
                        )
                        .trim()
                        .toLowerCase();


                    const returnStatus =
                        String(
                            attendance?.[
                                "Return Status"
                            ] || ""
                        )
                        .trim()
                        .toLowerCase();


                    return (
                        startStatus === "started" &&
                        returnStatus !== "returned"
                    );

                }
            ).length;


        bulkReturnButton.disabled =
            returnableCount === 0;

    }


    if (clearButton) {

        clearButton.disabled =
            count === 0;

    }


    const selectAll =
        document.getElementById(
            "eventDaySelectAll"
        );


    const all =
        document.querySelectorAll(
            ".event-day-rider-select"
        );


    if (selectAll) {

        selectAll.checked =
            all.length > 0 &&
            selected.length ===
                all.length;

    }

}

async function bulkCheckInSelectedRiders() {

    const eventSelect =
        document.getElementById(
            "eventDayEventSelect"
        );


    const eventID =
        eventSelect
            ? eventSelect.value.trim()
            : "";


    const selectedIDs =
        Array.from(
            document.querySelectorAll(
                ".event-day-rider-select:checked"
            )
        )
        .map(
            function(checkbox) {

                return String(
                    checkbox.dataset
                        .registrationId ||
                    ""
                ).trim();

            }
        )
        .filter(Boolean);


    if (!eventID) {

        alert(
            "Please select an event."
        );

        return;

    }


    if (!selectedIDs.length) {

        return;

    }


    const confirmed =
        confirm(
            "Check in " +
            selectedIDs.length +
            " selected rider(s)?"
        );


    if (!confirmed) {
        return;
    }


    const button =
        document.getElementById(
            "bulkCheckInEventDayBtn"
        );


    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Checking In...';

    }


    try {

        const token =
            sessionStorage.getItem(
                "sherpas_admin_token"
            );


        if (!token) {

            throw new Error(
                "Admin session expired. Please login again."
            );

        }


        const form =
            new URLSearchParams();


        form.append(
            "action",
            "BULK_CHECK_IN_RIDERS"
        );


        form.append(
            "token",
            token
        );


        form.append(
            "data",
            JSON.stringify({

                eventID:
                    eventID,

                registrationIDs:
                    selectedIDs

            })
        );


        const response =
            await fetch(
                MEMBERS_API,
                {
                    method: "POST",
                    body: form
                }
            );


        const result =
            await response.json();



        if (!result.success) {

            throw new Error(
                result.message ||
                "Bulk check-in failed."
            );

        }


        alert(
            result.message ||
            "Selected riders checked in successfully."
        );


        clearEventDaySelection();


        await loadEventDayRiders(
            eventID
        );

    }
    catch (error) {

        console.error(
            "BULK CHECK-IN ERROR:",
            error
        );


        alert(
            "Bulk check-in failed.\n\n" +
            error.message
        );

    }
    finally {

        if (button) {

            button.innerHTML =
                '<i class="fa-solid fa-right-to-bracket"></i> Check In Selected';

            updateEventDayBulkSelection();

        }

    }

}

async function bulkStartSelectedRiders() {

    const eventSelect =
        document.getElementById(
            "eventDayEventSelect"
        );


    const eventID =
        eventSelect
            ? eventSelect.value.trim()
            : "";


    if (!eventID) {

        alert(
            "Please select an event."
        );

        return;

    }


    const selectedIDs =
        Array.from(
            document.querySelectorAll(
                ".event-day-rider-select:checked"
            )
        )
        .map(
            function(checkbox) {

                return String(
                    checkbox.dataset
                        .registrationId || ""
                ).trim();

            }
        )
        .filter(Boolean);


    const startableIDs =
        selectedIDs.filter(
            function(registrationID) {

                const attendance =
                    allEventDayAttendance.find(
                        function(item) {

                            return String(
                                item[
                                    "Registration ID"
                                ] || ""
                            ).trim()
                            ===
                            registrationID;

                        }
                    );


                const checkedIn =
                    String(
                        attendance?.[
                            "Check-In Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    "checked in";


                const started =
                    String(
                        attendance?.[
                            "Start Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    "started";


                return (
                    checkedIn &&
                    !started
                );

            }
        );


    if (!startableIDs.length) {

        alert(
            "No selected riders are ready to start."
        );

        return;

    }


    if (
        !confirm(
            "Start ride for " +
            startableIDs.length +
            " selected rider(s)?"
        )
    ) {

        return;

    }


    const button =
        document.getElementById(
            "bulkStartRideEventDayBtn"
        );


    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Starting...';

    }


    try {

        const token =
            sessionStorage.getItem(
                "sherpas_admin_token"
            );


        if (!token) {

            throw new Error(
                "Admin session expired. Please login again."
            );

        }


        const results =
            await Promise.all(
                startableIDs.map(
                    async function(
                        registrationID
                    ) {

                        const form =
                            new URLSearchParams();


                        form.append(
                            "action",
                            "START_RIDE_RIDER"
                        );


                        form.append(
                            "token",
                            token
                        );


                        form.append(
                            "data",
                            JSON.stringify({

                                eventID:
                                    eventID,

                                registrationID:
                                    registrationID,

                                adminEmail:
                                    sessionStorage.getItem(
                                        "sherpas_admin_email"
                                    ) || ""

                            })
                        );


                        const response =
                            await fetch(
                                MEMBERS_API,
                                {
                                    method: "POST",
                                    body: form
                                }
                            );


                        const result =
                            await response.json();


                        return {
                            registrationID:
                                registrationID,

                            success:
                                result.success,

                            message:
                                result.message || ""
                        };

                    }
                )
            );


        const successful =
            results.filter(
                function(item) {

                    return item.success;

                }
            );


        const failed =
            results.filter(
                function(item) {

                    return !item.success;

                }
            );


        alert(
            successful.length +
            " rider(s) started successfully." +
            (
                failed.length
                    ? "\n" +
                      failed.length +
                      " rider(s) failed."
                    : ""
            )
        );


        clearEventDaySelection();


        await loadEventDayRiders(
            eventID
        );

    }
    catch (error) {

        console.error(
            "BULK START ERROR:",
            error
        );


        alert(
            "Bulk Start failed.\n\n" +
            error.message
        );

    }
    finally {

        if (button) {

            button.innerHTML =
                '<i class="fa-solid fa-flag-checkered"></i> Start Selected';

            updateEventDayBulkSelection();

        }

    }

}

async function bulkReturnSelectedRiders() {

    const eventSelect =
        document.getElementById(
            "eventDayEventSelect"
        );


    const eventID =
        eventSelect
            ? eventSelect.value.trim()
            : "";


    if (!eventID) {

        alert(
            "Please select an event."
        );

        return;

    }


    const selectedIDs =
        Array.from(
            document.querySelectorAll(
                ".event-day-rider-select:checked"
            )
        )
        .map(
            function(checkbox) {

                return String(
                    checkbox.dataset
                        .registrationId || ""
                ).trim();

            }
        )
        .filter(Boolean);


    /*
        Only riders who have STARTED
        and are NOT already RETURNED.
    */

    const returnableIDs =
        selectedIDs.filter(
            function(registrationID) {

                const attendance =
                    allEventDayAttendance.find(
                        function(item) {

                            return String(
                                item[
                                    "Registration ID"
                                ] || ""
                            ).trim()
                            ===
                            registrationID;

                        }
                    );


                const startStatus =
                    String(
                        attendance?.[
                            "Start Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase();


                const returnStatus =
                    String(
                        attendance?.[
                            "Return Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase();


                return (
                    startStatus === "started" &&
                    returnStatus !== "returned"
                );

            }
        );


    if (!returnableIDs.length) {

        alert(
            "No selected riders are ready to be returned."
        );

        return;

    }


    if (
        !confirm(
            "Mark " +
            returnableIDs.length +
            " selected rider(s) as returned?"
        )
    ) {

        return;

    }


    const button =
        document.getElementById(
            "bulkReturnRideEventDayBtn"
        );


    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Returning...';

    }


    try {

        const token =
            sessionStorage.getItem(
                "sherpas_admin_token"
            );


        if (!token) {

            throw new Error(
                "Admin session expired. Please login again."
            );

        }


        const results =
            await Promise.all(
                returnableIDs.map(
                    async function(
                        registrationID
                    ) {

                        const form =
                            new URLSearchParams();


                        form.append(
                            "action",
                            "RETURN_RIDE_RIDER"
                        );


                        form.append(
                            "token",
                            token
                        );


                        form.append(
                            "data",
                            JSON.stringify({

                                eventID:
                                    eventID,

                                registrationID:
                                    registrationID,

                                adminEmail:
                                    sessionStorage.getItem(
                                        "sherpas_admin_email"
                                    ) || ""

                            })
                        );


                        const response =
                            await fetch(
                                MEMBERS_API,
                                {
                                    method: "POST",
                                    body: form
                                }
                            );


                        const result =
                            await response.json();


                        return {

                            registrationID:
                                registrationID,

                            success:
                                result.success,

                            message:
                                result.message || ""

                        };

                    }
                )
            );


        const successful =
            results.filter(
                function(item) {

                    return item.success;

                }
            );


        const failed =
            results.filter(
                function(item) {

                    return !item.success;

                }
            );


        let message =
            successful.length +
            " rider(s) returned successfully.";


        if (
            failed.length
        ) {

            message +=
                "\n" +
                failed.length +
                " rider(s) failed.";

        }


        alert(message);


        clearEventDaySelection();


        await loadEventDayRiders(
            eventID
        );

    }
    catch (error) {

        console.error(
            "BULK RETURN ERROR:",
            error
        );


        alert(
            "Bulk Return failed.\n\n" +
            error.message
        );

    }
    finally {

        if (button) {

            button.innerHTML =
                '<i class="fa-solid fa-rotate-left"></i> Return Selected';


            updateEventDayBulkSelection();

        }

    }

}


async function bulkMarkRidersAbsent() {

    const eventSelect =
        document.getElementById(
            "eventDayEventSelect"
        );


    const eventID =
        eventSelect
            ? eventSelect.value.trim()
            : "";


    if (!eventID) {

        alert(
            "Please select an event."
        );

        return;

    }


    const selectedIDs =
        Array.from(
            document.querySelectorAll(
                ".event-day-rider-select:checked"
            )
        )
        .map(
            function(checkbox) {

                return String(
                    checkbox.dataset
                        .registrationId || ""
                ).trim();

            }
        )
        .filter(Boolean);


    const absentableIDs =
        selectedIDs.filter(
            function(registrationID) {

                const attendance =
                    allEventDayAttendance.find(
                        function(item) {

                            return String(
                                item[
                                    "Registration ID"
                                ] || ""
                            ).trim()
                            ===
                            registrationID;

                        }
                    );


                const checkedIn =
                    String(
                        attendance?.[
                            "Check-In Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    "checked in";


                const started =
                    String(
                        attendance?.[
                            "Start Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    "started";


                const returned =
                    String(
                        attendance?.[
                            "Return Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    "returned";


                const alreadyAbsent =
                    String(
                        attendance?.[
                            "Attendance Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    "no show";


                return (
                    !checkedIn &&
                    !started &&
                    !returned &&
                    !alreadyAbsent
                );

            }
        );


    if (!absentableIDs.length) {

        alert(
            "No selected riders are eligible to be marked absent."
        );

        return;

    }


    if (
        !confirm(
            "Mark " +
            absentableIDs.length +
            " selected rider(s) as absent?"
        )
    ) {

        return;

    }


    const button =
        document.getElementById(
            "bulkAbsentEventDayBtn"
        );


    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Marking...';

    }


    try {

        const token =
            sessionStorage.getItem(
                "sherpas_admin_token"
            );


        if (!token) {

            throw new Error(
                "Admin session expired. Please login again."
            );

        }


        const results =
            await Promise.all(
                absentableIDs.map(
                    async function(registrationID) {

                        const form =
                            new URLSearchParams();


                        form.append(
                            "action",
                            "MARK_ABSENT_RIDER"
                        );


                        form.append(
                            "token",
                            token
                        );


                        form.append(
                            "data",
                            JSON.stringify({

                                eventID:
                                    eventID,

                                registrationID:
                                    registrationID,

                                adminEmail:
                                    sessionStorage.getItem(
                                        "sherpas_admin_email"
                                    ) || ""

                            })
                        );


                        const response =
                            await fetch(
                                MEMBERS_API,
                                {
                                    method: "POST",
                                    body: form
                                }
                            );


                        const result =
                            await response.json();


                        return {

                            registrationID:
                                registrationID,

                            success:
                                result.success,

                            message:
                                result.message || ""

                        };

                    }
                )
            );


        const successful =
            results.filter(
                function(item) {

                    return item.success;

                }
            );


        const failed =
            results.filter(
                function(item) {

                    return !item.success;

                }
            );


        alert(
            successful.length +
            " rider(s) marked absent." +
            (
                failed.length
                    ? "\n" +
                      failed.length +
                      " rider(s) failed."
                    : ""
            )
        );


        clearEventDaySelection();


        await loadEventDayRiders(
            eventID
        );

    }
    catch (error) {

        console.error(
            "BULK ABSENT ERROR:",
            error
        );


        alert(
            "Bulk Absent failed.\n\n" +
            error.message
        );

    }
    finally {

        if (button) {

            button.innerHTML =
                '<i class="fa-solid fa-user-xmark"></i> Absent Selected';

            updateEventDayBulkSelection();

        }

    }

}



function formatAttendanceDateTime(value) {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        }
    );

}



function clearEventDaySelection() {

    document
        .querySelectorAll(
            ".event-day-rider-select"
        )
        .forEach(
            function(checkbox) {

                checkbox.checked =
                    false;

            }
        );


    const selectAll =
        document.getElementById(
            "eventDaySelectAll"
        );


    if (selectAll) {

        selectAll.checked =
            false;

    }


    updateEventDayBulkSelection();

}



/*==================================================
        EVENT DAY MANAGEMENT
==================================================*/

function loadEventDay() {

    const select =
        document.getElementById(
            "eventDayEventSelect"
        );

    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Select an event
        </option>
    `;


    allEvents
        .filter(function(event) {

            return String(
                event["Status"] || ""
            )
            .trim()
            .toLowerCase()
            === "active";

        })
        .forEach(function(event) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                event["Event ID"] || "";


            option.textContent =
                event["Event Name"] ||
                event["Event ID"] ||
                "Event";


            select.appendChild(
                option
            );

        });

        /*------------------------------------------
                AUTO-LOAD FIRST ACTIVE EVENT
        ------------------------------------------*/

        const activeEvents =
            allEvents.filter(function(event) {

                return String(
                    event["Status"] || ""
                )
                .trim()
                .toLowerCase()
                === "active";

            });


        if (
            activeEvents.length > 0
        ) {

            select.value =
                activeEvents[0]["Event ID"] || "";


            loadEventDayRiders(
                select.value
            );

        }
       

    select.onchange =
        function() {

            const eventID =
                this.value;

            if (!eventID) {

                hideEventDayDashboard();

                return;

            }

            loadEventDayRiders(
                eventID
            );
        };


    const refreshButton =
        document.getElementById(
            "refreshEventDayBtn"
        );


    if (refreshButton) {

        refreshButton.onclick =
            function() {

                loadEvents();

                loadEventDay();

            };

    }

}


function hideEventDayDashboard() {

    const dashboard =
        document.getElementById(
            "eventDayDashboard"
        );


    if (dashboard) {

        dashboard.style.display =
            "none";

    }

}


async function loadRideRegistrationsDataOnly() {

    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );


    if (!token) {

        throw new Error(
            "Admin session expired. Please login again."
        );

    }


    const response =
        await fetch(
            MEMBERS_API,
            {
                method: "POST",

                body:
                    new URLSearchParams({

                        action:
                            "GET_RIDE_REGISTRATIONS",

                        token:
                            token,

                        data:
                            "{}"

                    })

            }
        );


    const result =
        await response.json();


    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to load ride registrations."
        );

    }


    allRideRegistrations =
        Array.isArray(result.data)
            ? result.data
            : [];

}


async function loadEventDayAttendance(
    eventID
) {

    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );


    if (!token) {

        throw new Error(
            "Admin session expired. Please login again."
        );

    }


    const response =
        await fetch(
            MEMBERS_API,
            {
                method: "POST",

                body:
                    new URLSearchParams({

                        action:
                            "GET_EVENT_DAY_ATTENDANCE",

                        token:
                            token,

                        data:
                            JSON.stringify({

                                eventID:
                                    eventID

                            })

                    })

            }
        );


    const result =
        await response.json();



    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to load event attendance."
        );

    }


    allEventDayAttendance =
        Array.isArray(
            result.data
        )
            ? result.data
            : [];


    return allEventDayAttendance;

}

async function loadEventDayRiders(
    eventID
) {

        const event =
            allEvents.find(
                function(item) {

                    return String(
                        item["Event ID"] || ""
                    ).trim().toUpperCase()
                    ===
                    String(
                        eventID || ""
                    ).trim().toUpperCase();

                }
            );


        if (!event) {

            console.warn(
                "Event not found:",
                eventID
            );

            return;

        }


        /*------------------------------------------
                SHOW EVENT DAY DASHBOARD
        ------------------------------------------*/

        const dashboard =
            document.getElementById(
                "eventDayDashboard"
            );


        if (dashboard) {

            dashboard.style.display =
                "block";

        }


        /*------------------------------------------
                EVENT TITLE / DETAILS
        ------------------------------------------*/

        const title =
            document.getElementById(
                "eventDaySelectedEvent"
            );


        const details =
            document.getElementById(
                "eventDayEventDetails"
            );


        if (title) {

            title.textContent =
                event["Event Name"] ||
                "Event";

        }


        if (details) {

            details.textContent =
                [
                    event["Date"],
                    event["Time"],
                    event["Location"]
                ]
                .filter(Boolean)
                .join(" • ");

        }

    if (
        !Array.isArray(allRideRegistrations) ||
        allRideRegistrations.length === 0
    ) {

    await loadRideRegistrationsDataOnly();

    }

        try {

            await loadEventDayAttendance(
                eventID
            );

        }
        catch (attendanceError) {

            console.error(
                "EVENT DAY ATTENDANCE LOAD ERROR:",
                attendanceError
            );

            /*
                Do not stop Event Day rider loading
                if attendance data cannot be read.
            */

            allEventDayAttendance = [];

        }

    const selectedEventID =
        String(eventID || "")
            .trim()
            .toUpperCase();

    const riders =
        allRideRegistrations.filter(
            function(registration) {

                const registrationEventID =
                    String(
                        registration["Event ID"] || ""
                    )
                    .trim()
                    .toUpperCase();

                const approval =
                    String(
                        registration["Approval Status"] || ""
                    )
                    .trim()
                    .toLowerCase();

                const payment =
                    String(
                        registration["Payment Status"] || ""
                    )
                    .trim()
                    .toLowerCase();

                return (
                    registrationEventID ===
                        selectedEventID
                    &&
                    approval === "approved"
                    &&
                    payment === "verified"
                );

            }
        );

    const approvedCount =
        riders.length;


    const approvedElement =
        document.getElementById(
            "eventDayApprovedCount"
        );


    if (approvedElement) {

        approvedElement.textContent =
            approvedCount;

    }


    const checkedIn =
        allEventDayAttendance.filter(
            function(item) {

                return String(
                    item["Check-In Status"] || ""
                )
                .trim()
                .toLowerCase()
                === "checked in";

            }
        ).length;


    const started =
        allEventDayAttendance.filter(
            function(item) {

                return String(
                    item["Start Status"] || ""
                )
                .trim()
                .toLowerCase()
                === "started";

            }
        ).length;


    const returned =
        allEventDayAttendance.filter(
            function(item) {

                return String(
                    item["Return Status"] || ""
                )
                .trim()
                .toLowerCase()
                === "returned";

            }
        ).length;


    const absent =
        allEventDayAttendance.filter(
            function(item) {

                return String(
                    item["Attendance Status"] || ""
                )
                .trim()
                .toLowerCase()
                === "no show";

            }
        ).length;


    const checkedInElement =
        document.getElementById(
            "eventDayCheckedInCount"
        );

    if (checkedInElement) {

        checkedInElement.textContent =
            checkedIn;

    }


    const startedElement =
        document.getElementById(
            "eventDayStartedCount"
        );

    if (startedElement) {

        startedElement.textContent =
            started;

    }


    const returnedElement =
        document.getElementById(
            "eventDayReturnedCount"
        );

    if (returnedElement) {

        returnedElement.textContent =
            returned;

    }


    const noShowElement =
        document.getElementById(
            "eventDayNoShowCount"
        );

    if (noShowElement) {

        noShowElement.textContent =
            absent;

    }

    renderEventDayRiders(
        riders
    );

}

/* =========================================================
   EVENT DAY DATE / TIME FORMAT
   ========================================================= */

function formatEventDayDateTime(value) {

    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",

            hour12: false
        }
    );
}



function renderEventDayRiders(
    riders
) {

    const container =
        document.getElementById(
            "eventDayRiderList"
        );


    if (!container) {
        return;
    }


    if (!riders.length) {

        container.innerHTML = `
            <div class="event-day-empty">

                <i class="fa-solid fa-user-slash"></i>

                <p>
                    No approved riders found
                    for this event.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        riders.map(
            function(registration) {

                const registrationID =
                    String(
                        registration[
                            "Registration ID"
                        ] || ""
                    ).trim();

                const adminRemarks =
                    String(
                        registration[
                            "Admin Remarks"
                        ] || ""
                    ).trim();


                const attendance =
                    allEventDayAttendance.find(
                        function(item) {

                            return String(
                                item[
                                    "Registration ID"
                                ] || ""
                            ).trim()
                            ===
                            registrationID;

                        }
                    );


                const checkInStatus =
                    String(
                        attendance?.[
                            "Check-In Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase();


                const checkInTime =
                    formatEventDayDateTime(
                        attendance?.[
                            "Check-In Time"
                        ]
                    );


                const isCheckedIn =
                    checkInStatus ===
                    "checked in";
                    

                const startStatus =
                    String(
                        attendance?.[
                            "Start Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase();


               const startTime =
                    formatEventDayDateTime(
                        attendance?.[
                            "Start Time"
                        ]
                    );

                const returnStatus =
                    String(
                        attendance?.[
                            "Return Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase();


                const returnTime =
                    formatEventDayDateTime(
                        attendance?.[
                            "Return Time"
                        ]
                    );


                const attendanceStatus =
                    String(
                        attendance?.[
                            "Attendance Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase();


                const isAbsent =
                    attendanceStatus ===
                    "no show";


                const isReturned =
                    returnStatus ===
                    "returned";


                const isStarted =
                    startStatus ===
                    "started";

                return `

                    <div
                        class="event-day-rider-card"
                        data-registration-id="${escapeHTML(
                            registration[
                                "Registration ID"
                            ] || ""
                        )}"
                    >

                        <!-- SELECT -->

                        <div
                            class="event-day-select-cell"
                        >

                            <input
                                type="checkbox"
                                class="event-day-rider-select"
                                data-registration-id="${escapeHTML(
                                    registration[
                                        "Registration ID"
                                    ] || ""
                                )}"
                                title="Select rider"
                            >

                        </div>


                        <!-- RIDER -->

                        <div>

                            <strong>
                                ${escapeHTML(
                                    registration[
                                        "Registration ID"
                                    ] || "-"
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    registration[
                                        "Full Name"
                                    ] || "-"
                                )}
                            </span>

                        </div>


                        <!-- MEMBER -->

                        <div>

                            <small>
                                ${escapeHTML(
                                    registration[
                                        "Membership ID"
                                    ] || "-"
                                )}
                            </small>

                            <small>
                                ${escapeHTML(
                                    registration[
                                        "Phone"
                                    ] || "-"
                                )}
                            </small>

                        </div>


                        <!-- VEHICLE -->

                        <div>

                            <small>
                                Vehicle
                            </small>

                            <strong>
                                ${escapeHTML(
                                    registration[
                                        "Vehicle Registration"
                                    ] || "-"
                                )}
                            </strong>

                        </div>
                                        
                        ${
                            adminRemarks
                                ? `
                                    <div class="event-day-admin-remark">

                                        <div class="event-day-admin-remark-title">
                                            <i class="fa-solid fa-user-shield"></i>
                                            Admin Remark
                                        </div>

                                        <div class="event-day-admin-remark-text">
                                            ${escapeHTML(
                                                adminRemarks
                                            )}
                                        </div>

                                    </div>
                                `
                                : ""
                        }        
                       
                        <!-- ATTENDANCE -->

                        <div>

                            <div class="event-day-attendance-timeline">

                                <!-- CHECK-IN -->

                                <div
                                    class="event-day-timeline-item ${
                                        isCheckedIn
                                            ? "completed"
                                            : ""
                                    }"
                                >

                                    <span
                                        class="event-day-timeline-icon"
                                    >
                                        <i
                                            class="fa-solid fa-right-to-bracket"
                                        ></i>
                                    </span>


                                    <div
                                        class="event-day-timeline-content"
                                    >

                                        <strong>
                                            Check-In
                                        </strong>


                                        ${
                                            isCheckedIn

                                                ? `
                                                    <span
                                                        class="event-day-timeline-time"
                                                    >
                                                        ${escapeHTML(
                                                            checkInTime
                                                        )}
                                                    </span>
                                                `

                                                : `
                                                    <span
                                                        class="event-day-timeline-pending"
                                                    >
                                                        Not Checked In
                                                    </span>
                                                `
                                        }

                                    </div>

                                </div>


                                <!-- START -->

                                <div
                                    class="event-day-timeline-item ${
                                        isStarted
                                            ? "completed"
                                            : ""
                                    }"
                                >

                                    <span
                                        class="event-day-timeline-icon"
                                    >
                                        <i
                                            class="fa-solid fa-flag-checkered"
                                        ></i>
                                    </span>


                                    <div
                                        class="event-day-timeline-content"
                                    >

                                        <strong>
                                            Start
                                        </strong>


                                        ${
                                            isStarted

                                                ? `
                                                    <span
                                                        class="event-day-timeline-time"
                                                    >
                                                        ${escapeHTML(
                                                            startTime
                                                        )}
                                                    </span>
                                                `

                                                : `
                                                    <span
                                                        class="event-day-timeline-pending"
                                                    >
                                                        Not Started
                                                    </span>
                                                `
                                        }

                                    </div>

                                </div>


                                <!-- RETURN -->

                                <div
                                    class="event-day-timeline-item"
                                >

                                    <span
                                        class="event-day-timeline-icon"
                                    >
                                        <i
                                            class="fa-solid fa-rotate-left"
                                        ></i>
                                    </span>


                                    <div
                                        class="event-day-timeline-content"
                                    >

                                        <strong>
                                            Return
                                        </strong>

                                        ${
                                            isReturned

                                                ? `
                                                    <span
                                                        class="event-day-timeline-time"
                                                    >
                                                        ${escapeHTML(
                                                            returnTime
                                                        )}
                                                    </span>
                                                `

                                                : `
                                                    <span
                                                        class="event-day-timeline-pending"
                                                    >
                                                        Not Returned
                                                    </span>
                                                `
                                        }
                                        
                                    </div>

                                </div>


                            </div>


                            <!-- ACTIONS -->

                            <div
                                class="event-day-attendance-actions"
                            >

                            ${
                                isAbsent

                                    ? `
                                        <span
                                            class="event-day-status-badge absent"
                                        >
                                            <i
                                                class="fa-solid fa-user-xmark"
                                            ></i>

                                            Absent
                                        </span>
                                    `

                                    : !isCheckedIn

                                        ? `
                                            <button
                                                type="button"
                                                class="event-day-checkin-btn"
                                                data-registration-id="${escapeHTML(
                                                    registrationID
                                                )}"
                                                title="Check in rider"
                                            >
                                                <i
                                                    class="fa-solid fa-right-to-bracket"
                                                ></i>

                                                Check In
                                            </button>


                                            <button
                                                type="button"
                                                class="event-day-absent-btn"
                                                data-registration-id="${escapeHTML(
                                                    registrationID
                                                )}"
                                                title="Mark rider absent"
                                            >
                                                <i
                                                    class="fa-solid fa-user-xmark"
                                                ></i>

                                                Absent
                                            </button>
                                        `

                                        : !isStarted


                                            ? `
                                                <button
                                                    type="button"
                                                    class="event-day-start-btn"
                                                    data-registration-id="${escapeHTML(
                                                        registrationID
                                                    )}"
                                                    title="Start ride"
                                                >

                                                    <i
                                                        class="fa-solid fa-flag-checkered"
                                                    ></i>

                                                    Start Ride

                                                </button>


                                                <button
                                                    type="button"
                                                    class="event-day-undo-checkin-btn"
                                                    data-registration-id="${escapeHTML(
                                                        registrationID
                                                    )}"
                                                    title="Undo check-in"
                                                >

                                                    <i
                                                        class="fa-solid fa-rotate-left"
                                                    ></i>

                                                    Undo

                                                </button>
                                            `

                                            : isReturned

                                                ? `
                                                    <span
                                                        class="event-day-status-badge returned"
                                                    >

                                                        <i
                                                            class="fa-solid fa-circle-check"
                                                        ></i>

                                                        Returned

                                                    </span>
                                                `

                                                : `
                                                    <div
                                                        class="event-day-attendance-actions"
                                                    >

                                                        <span
                                                            class="event-day-status-badge started"
                                                        >

                                                            <i
                                                                class="fa-solid fa-flag-checkered"
                                                            ></i>

                                                            Ride Started

                                                        </span>


                                                        <button
                                                            type="button"
                                                            class="event-day-return-btn"
                                                            data-registration-id="${escapeHTML(
                                                                registrationID
                                                            )}"
                                                            title="Mark rider as returned"
                                                        >

                                                            <i
                                                                class="fa-solid fa-rotate-left"
                                                            ></i>

                                                            Return

                                                        </button>

                                                    </div>
                                                `
                                }

                            </div>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

    initializeEventDayBulkSelection();

    updateEventDayBulkSelection();

}



/*==================================================
        RIDE REGISTRATIONS
==================================================*/
let allRideRegistrations = [];

async function loadRideRegistrations() {

    const container =
        document.getElementById(
            "rideRegistrationsTable"
        );

    if (!container) {
        return;
    }

    ensureBulkRegistrationToolbar();

    container.innerHTML = `

        <div class="registrations-loading">

            <i class="fa-solid fa-spinner fa-spin"></i>

            Loading registrations...

        </div>

    `;


    try {

        const token =
            sessionStorage.getItem(
                "sherpas_admin_token"
            );


        if (!token) {

            throw new Error(
                "Admin session not found."
            );

        }


        const response =
            await fetch(
                MEMBERS_API,
                {
                    method: "POST",

                    body:
                        new URLSearchParams({

                            action:
                                "GET_RIDE_REGISTRATIONS",

                            token:
                                token,

                            data:
                                "{}"

                        })

                }
            );


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load ride registrations."
            );

        }

        allRideRegistrations =
            result.data || [];

        populateRegistrationEventFilter();

        filterRideRegistrations();

        renderRideRegistrations(
            allRideRegistrations
        );


    }
    catch (error) {

        console.error(
            "Ride registrations error:",
            error
        );


        container.innerHTML = `

            <div class="registrations-empty">

                ${escapeHTML(
                    error.message ||
                    "Unable to load registrations."
                )}

            </div>

        `;

    }

}

/*==================================================
        BULK REGISTRATION ACTIONS TOOLBAR
==================================================*/

function ensureBulkRegistrationToolbar() {

    const table =
        document.getElementById(
            "rideRegistrationsTable"
        );

    if (!table) {
        return;
    }


    if (
        document.getElementById(
            "bulkRegistrationToolbar"
        )
    ) {
        return;
    }


    const toolbar =
        document.createElement("div");

    toolbar.id =
        "bulkRegistrationToolbar";

    toolbar.className =
        "bulk-registration-toolbar";

    toolbar.innerHTML = `

        <div class="bulk-selection-info">

            <i class="fa-solid fa-check-double"></i>

            <strong>
                <span id="bulkSelectedCount">
                    0
                </span>
            </strong>

            selected

        </div>


        <div class="bulk-actions">

            <button
                type="button"
                id="bulkVerifyPaymentBtn"
                class="bulk-action-btn bulk-verify-btn"
                disabled
                title="Verify payment for selected registrations"
            >
                <i class="fa-solid fa-circle-check"></i>
                Verify Payment
            </button>


            <button
                type="button"
                id="bulkApproveBtn"
                class="bulk-action-btn bulk-approve-btn"
                disabled
                title="Approve selected registrations"
            >
                <i class="fa-solid fa-user-check"></i>
                Approve Selected
            </button>


            <button
                type="button"
                id="clearBulkSelectionBtn"
                class="bulk-action-btn bulk-clear-btn"
                disabled
                title="Clear selection"
            >
                <i class="fa-solid fa-xmark"></i>
                Clear
            </button>

        </div>

    `;


    table.parentNode.insertBefore(
        toolbar,
        table
    );


    initializeBulkRegistrationActions();

}

/*==================================================
        BULK SELECTION LOGIC
==================================================*/

function getSelectedRegistrationIDs() {

    return Array.from(
        document.querySelectorAll(
            ".registration-select:checked"
        )
    )
    .map(
        function (checkbox) {
            return String(
                checkbox.dataset.id || ""
            ).trim();
        }
    )
    .filter(Boolean);

}


function updateBulkRegistrationToolbar() {

    const selectedIDs =
        getSelectedRegistrationIDs();


    const count =
        selectedIDs.length;


    const countElement =
        document.getElementById(
            "bulkSelectedCount"
        );


    const verifyButton =
        document.getElementById(
            "bulkVerifyPaymentBtn"
        );


    const approveButton =
        document.getElementById(
            "bulkApproveBtn"
        );


    const clearButton =
        document.getElementById(
            "clearBulkSelectionBtn"
        );


    if (countElement) {

        countElement.textContent =
            count;

    }


    let canVerify =
        false;

    let canApprove =
        false;


    selectedIDs.forEach(
        function (registrationID) {

            const registration =
                allRideRegistrations.find(
                    function (item) {

                        return String(
                            item[
                                "Registration ID"
                            ] || ""
                        ).trim()
                        ===
                        registrationID;

                    }
                );


            if (!registration) {
                return;
            }


            const paymentStatus =
                String(
                    registration[
                        "Payment Status"
                    ] || ""
                )
                .trim()
                .toLowerCase();


            const approvalStatus =
                String(
                    registration[
                        "Approval Status"
                    ] || ""
                )
                .trim()
                .toLowerCase();


            if (
                paymentStatus ===
                    "pending verification"
                &&
                registration[
                    "Payment Proof URL"
                ]
            ) {

                canVerify = true;

            }


            if (
                paymentStatus ===
                    "verified"
                &&
                (
                    approvalStatus ===
                        "pending"
                    ||
                    approvalStatus ===
                        "rejected"
                )
            ) {

                canApprove = true;

            }

        }
    );


    /*
        Enable action only when EVERY
        selected record is valid for
        that specific bulk operation.
    */

    if (verifyButton) {

        verifyButton.disabled =
            count === 0 ||
            !selectedIDs.every(
                function (registrationID) {

                    const registration =
                        allRideRegistrations.find(
                            function (item) {

                                return String(
                                    item[
                                        "Registration ID"
                                    ] || ""
                                ).trim()
                                ===
                                registrationID;

                            }
                        );


                    if (!registration) {
                        return false;
                    }


                    return (
                        String(
                            registration[
                                "Payment Status"
                            ] || ""
                        )
                        .trim()
                        .toLowerCase()
                        ===
                        "pending verification"
                        &&
                        registration[
                            "Payment Proof URL"
                        ]
                    );

                }
            );

    }


    if (approveButton) {

        approveButton.disabled =
            count === 0 ||
            !selectedIDs.every(
                function (registrationID) {

                    const registration =
                        allRideRegistrations.find(
                            function (item) {

                                return String(
                                    item[
                                        "Registration ID"
                                    ] || ""
                                ).trim()
                                ===
                                registrationID;

                            }
                        );


                    if (!registration) {
                        return false;
                    }


                    const payment =
                        String(
                            registration[
                                "Payment Status"
                            ] || ""
                        )
                        .trim()
                        .toLowerCase();


                    const approval =
                        String(
                            registration[
                                "Approval Status"
                            ] || ""
                        )
                        .trim()
                        .toLowerCase();


                    return (
                        payment ===
                            "verified"
                        &&
                        (
                            approval ===
                                "pending"
                            ||
                            approval ===
                                "rejected"
                        )
                    );

                }
            );

    }


    if (clearButton) {

        clearButton.disabled =
            count === 0;

    }

}

document.addEventListener(
    "change",
    function (e) {

        if (
            e.target.matches(
                ".registration-select"
            )
        ) {

            updateBulkRegistrationToolbar();

        }


        if (
            e.target.matches(
                "#selectAllRegistrations"
            )
        ) {

            const checked =
                e.target.checked;


            document
                .querySelectorAll(
                    ".registration-select"
                )
                .forEach(
                    function (checkbox) {

                        checkbox.checked =
                            checked;

                    }
                );


            updateBulkRegistrationToolbar();

        }

    }
);

function initializeBulkRegistrationActions() {

    const verifyButton =
        document.getElementById(
            "bulkVerifyPaymentBtn"
        );


    const approveButton =
        document.getElementById(
            "bulkApproveBtn"
        );


    const clearButton =
        document.getElementById(
            "clearBulkSelectionBtn"
        );


    if (verifyButton) {

        verifyButton.onclick =
            bulkVerifyPayments;

    }


    if (approveButton) {

        approveButton.onclick =
            bulkApproveRegistrations;

    }


    if (clearButton) {

        clearButton.onclick =
            clearBulkSelection;

    }


    updateBulkRegistrationToolbar();

}

/*==================================================
        BULK VERIFY PAYMENT
==================================================*/

async function bulkVerifyPayments() {

    const selectedIDs =
        getSelectedRegistrationIDs();


    if (!selectedIDs.length) {
        return;
    }


    const confirmed =
        confirm(
            "Verify payment for " +
            selectedIDs.length +
            " selected registration(s)?\n\n" +
            "Only registrations with pending payment verification " +
            "and available payment proof will be processed."
        );


    if (!confirmed) {
        return;
    }


    const button =
        document.getElementById(
            "bulkVerifyPaymentBtn"
        );


    if (button) {

        button.disabled = true;

        button.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';

    }


    try {

        const result =
            await bulkRegistrationPaymentAction(
                selectedIDs,
                "VERIFY"
            );


        alert(
            result.message ||
            "Bulk payment verification completed."
        );


        clearBulkSelection();

        await loadRideRegistrations();

    }
    catch (error) {

        console.error(
            "BULK PAYMENT VERIFY ERROR:",
            error
        );


        alert(
            "Bulk payment verification failed.\n\n" +
            error.message
        );

    }
    finally {

        if (button) {

            button.innerHTML =
                '<i class="fa-solid fa-circle-check"></i> Verify Payment';

            updateBulkRegistrationToolbar();

        }

    }

}

/*==================================================
        BULK APPROVE REGISTRATIONS
==================================================*/

async function bulkApproveRegistrations() {

    const selectedIDs =
        getSelectedRegistrationIDs();


    if (!selectedIDs.length) {
        return;
    }


    const confirmed =
        confirm(
            "Approve " +
            selectedIDs.length +
            " selected registration(s)?\n\n" +
            "All selected registrations must already have " +
            "Payment Status = Verified."
        );


    if (!confirmed) {
        return;
    }


    const button =
        document.getElementById(
            "bulkApproveBtn"
        );


    if (button) {

        button.disabled = true;

        button.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Approving...';

    }


    try {

        const result =
            await bulkRegistrationApprovalAction(
                selectedIDs
            );


        alert(
            result.message ||
            "Bulk approval completed."
        );


        clearBulkSelection();

        await loadRideRegistrations();

    }
    catch (error) {

        console.error(
            "BULK APPROVAL ERROR:",
            error
        );


        alert(
            "Bulk approval failed.\n\n" +
            error.message
        );

    }
    finally {

        if (button) {

            button.innerHTML =
                '<i class="fa-solid fa-user-check"></i> Approve Selected';

            updateBulkRegistrationToolbar();

        }

    }

}

async function bulkRegistrationPaymentAction(
    registrationIDs,
    paymentAction
) {

    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );


    if (!token) {

        throw new Error(
            "Admin session expired. Please login again."
        );

    }


    const form =
        new URLSearchParams();


    form.append(
        "action",
        "BULK_VERIFY_RIDE_PAYMENT"
    );


    form.append(
        "token",
        token
    );


    form.append(
        "data",
        JSON.stringify({

            registrationIDs:
                registrationIDs,

            paymentAction:
                paymentAction

        })
    );


    const response =
        await fetch(
            MEMBERS_API,
            {
                method: "POST",
                body: form
            }
        );


    const result =
        await response.json();


    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to process bulk payment verification."
        );

    }


    return result;

}

async function bulkRegistrationApprovalAction(
    registrationIDs
) {

    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );


    if (!token) {

        throw new Error(
            "Admin session expired. Please login again."
        );

    }


    const form =
        new URLSearchParams();


    form.append(
        "action",
        "BULK_UPDATE_RIDE_APPROVAL"
    );


    form.append(
        "token",
        token
    );


    form.append(
        "data",
        JSON.stringify({

            registrationIDs:
                registrationIDs,

            approvalAction:
                "APPROVE"

        })
    );


    const response =
        await fetch(
            MEMBERS_API,
            {
                method: "POST",
                body: form
            }
        );


    const result =
        await response.json();



    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to process bulk approval."
        );

    }


    return result;

}

function clearBulkSelection() {

    document
        .querySelectorAll(
            ".registration-select"
        )
        .forEach(
            function (checkbox) {

                checkbox.checked =
                    false;

            }
        );


    const selectAll =
        document.getElementById(
            "selectAllRegistrations"
        );


    if (selectAll) {

        selectAll.checked =
            false;

    }


    updateBulkRegistrationToolbar();

}



function renderRideRegistrations(
    registrations
) {

    const container =
        document.getElementById(
            "rideRegistrationsTable"
        );


    if (!container) {
        return;
    }


    if (!registrations.length) {

        container.innerHTML = `

            <div class="registrations-empty">

                No ride registrations found.

            </div>

        `;

        return;

    }


    let html = `
        <div class="registration-row header">

            <div class="registration-select-cell">
                <input
                    type="checkbox"
                    id="selectAllRegistrations"
                    class="registration-select-all"
                    title="Select all eligible registrations"
                >
            </div>

            <div>Registration</div>
            <div>Event</div>
            <div>Member</div>
            <div>Payment</div>
            <div>Approval</div>
            <div>Registration</div>
            <div>Actions</div>

        </div>
    `;


    registrations.forEach(
        function(registration) {

            const paymentStatus =
                registration[
                    "Payment Status"
                ] || "Not Required";


            const approvalStatus =
                registration[
                    "Approval Status"
                ] || "Pending";


            const registrationStatus =
                registration[
                    "Registration Status"
                ] || "";


            html += `

                <div
                    class="registration-row"
                    data-registration-id="${escapeHTML(
                        registration["Registration ID"] || ""
                    )}"
                >

                <div class="registration-select-cell">

                    ${
                        (
                            paymentStatus.toLowerCase() ===
                            "pending verification"
                            &&
                            registration["Payment Proof URL"]
                        )
                        ||
                        (
                            paymentStatus.toLowerCase() ===
                            "verified"
                            &&
                            (
                                approvalStatus.toLowerCase() === "pending"
                                ||
                                approvalStatus.toLowerCase() === "rejected"
                            )
                        )
                        ? `
                            <input
                                type="checkbox"
                                class="registration-select"
                                data-id="${escapeHTML(
                                    registration["Registration ID"] || ""
                                )}"
                                title="Select registration"
                            >
                        `
                        : `
                            <span class="registration-select-placeholder"></span>
                        `
                    }

                </div>

                    <div class="registration-cell">

                        <div class="registration-id">

                            ${escapeHTML(
                                registration[
                                    "Registration ID"
                                ] || "-"
                            )}

                        </div>

                        <span class="registration-subtext">

                            ${escapeHTML(
                                registration[
                                    "Registration Date"
                                ] || ""
                            )}

                        </span>

                    </div>


                    <div class="registration-cell">

                        <div class="registration-event">

                            ${escapeHTML(
                                registration[
                                    "Event Name"
                                ] || "-"
                            )}

                        </div>

                        <span class="registration-subtext">

                            ${escapeHTML(
                                registration[
                                    "Event ID"
                                ] || ""
                            )}

                        </span>

                    </div>


                    <div class="registration-cell">

                        <div class="registration-member">

                            ${escapeHTML(
                                registration[
                                    "Full Name"
                                ] || "-"
                            )}

                        </div>

                        <span class="registration-subtext">

                            ${escapeHTML(
                                registration[
                                    "Membership ID"
                                ] || ""
                            )}

                            •

                            ${escapeHTML(
                                registration[
                                    "Phone"
                                ] || ""
                            )}

                        </span>

                    </div>


                    <div class="registration-cell">

                        <span class="
                            status-badge
                            ${getStatusClass(
                                paymentStatus
                            )}
                        ">

                            ${escapeHTML(
                                paymentStatus
                            )}

                        </span>

                    </div>


                    <div class="registration-cell">

                        <span class="
                            status-badge
                            ${getStatusClass(
                                approvalStatus
                            )}
                        ">

                            ${escapeHTML(
                                approvalStatus
                            )}

                        </span>

                    </div>


                    <div class="registration-cell">

                        <span class="
                            status-badge
                            ${getStatusClass(
                                registrationStatus
                            )}
                        ">

                            ${escapeHTML(
                                registrationStatus
                            )}

                        </span>

                    </div>


                    <div class="registration-cell">

                        <div class="registration-actions">

                            <!-- VIEW -->
                            <button
                                type="button"
                                class="
                                    registration-action-btn
                                    registration-view-btn
                                "
                                data-action="view"
                                data-id="${escapeHTML(
                                    registration["Registration ID"] || ""
                                )}"
                            >
                                <i class="fa-solid fa-eye"></i>
                            </button>

                            <!-- PDF -->
                            <button
                                type="button"
                                class="
                                    registration-action-btn
                                    registration-pdf-btn
                                "
                                data-action="registration-pdf"
                                data-id="${escapeHTML(
                                    registration["Registration ID"] || ""
                                )}"
                            >
                                <i class="fa-solid fa-file-pdf"></i>
                            </button>

                            <!-- PAYMENT -->
                            ${
                                registration["Payment Proof URL"]
                                    ? `
                                        <button
                                            type="button"
                                            class="
                                                registration-action-btn
                                                registration-payment-btn
                                            "
                                            data-action="payment"
                                            data-id="${escapeHTML(
                                                registration["Registration ID"] || ""
                                            )}"
                                        >
                                            <i class="fa-solid fa-receipt"></i>
                                        </button>
                                    `
                                    : ""
                            }


                            <!-- VERIFY PAYMENT -->
                            ${
                                paymentStatus.toLowerCase() ===
                                    "pending verification"
                                &&
                                registration["Payment Proof URL"]
                                    ? `
                                        <button
                                            type="button"
                                            class="
                                                registration-action-btn
                                                registration-verify-payment-btn
                                            "
                                            data-action="verify-payment"
                                            data-id="${escapeHTML(
                                                registration["Registration ID"] || ""
                                            )}"
                                        >
                                            <i class="fa-solid fa-circle-check"></i>
                                        </button>
                                    `
                                    : ""
                            }


                            <!-- REJECT PAYMENT -->
                            ${
                                paymentStatus.toLowerCase() ===
                                    "pending verification"
                                &&
                                registration["Payment Proof URL"]
                                    ? `
                                        <button
                                            type="button"
                                            class="
                                                registration-action-btn
                                                registration-reject-payment-btn
                                            "
                                            data-action="reject-payment"
                                            data-id="${escapeHTML(
                                                registration["Registration ID"] || ""
                                            )}"
                                        >
                                            <i class="fa-solid fa-circle-xmark"></i>
                                        </button>
                                    `
                                    : ""
                            }


                            <!-- APPROVE REGISTRATION -->
                            ${
                                paymentStatus.toLowerCase() === "verified"
                                &&
                                (
                                    approvalStatus.toLowerCase() === "pending"
                                    ||
                                    approvalStatus.toLowerCase() === "rejected"
                                )
                                    ? `
                                        <button
                                            type="button"
                                            class="
                                                registration-action-btn
                                                registration-approve-btn
                                            "
                                            data-action="approve-registration"
                                            data-id="${escapeHTML(
                                                registration["Registration ID"] || ""
                                            )}"
                                        >
                                            <i class="fa-solid fa-user-check"></i>
                                        </button>
                                    `
                                    : ""
                            }


                            <!-- REJECT REGISTRATION -->
                            ${
                                paymentStatus.toLowerCase() === "verified"
                                &&
                                (
                                    approvalStatus.toLowerCase() === "pending"
                                    ||
                                    approvalStatus.toLowerCase() === "approved"
                                )
                                    ? `
                                        <button
                                            type="button"
                                            class="
                                                registration-action-btn
                                                registration-reject-btn
                                            "
                                            data-action="reject-registration"
                                            data-id="${escapeHTML(
                                                registration["Registration ID"] || ""
                                            )}"
                                        >
                                            <i class="fa-solid fa-user-xmark"></i>
                                        </button>
                                    `
                                    : ""
                            }

                        </div>

                    </div>

                </div>

            `;

        }
    );


    container.innerHTML =
        html;

    ensureBulkRegistrationToolbar();
    updateBulkRegistrationToolbar();
}


/*==================================================
        POPULATE EVENT FILTER
==================================================*/

function populateRegistrationEventFilter() {

    const select =
        document.getElementById(
            "registrationEventFilter"
        );

    if (!select) {
        return;
    }


    const events = {};


    allRideRegistrations.forEach(
        function (registration) {

            const eventID =
                String(
                    registration["Event ID"] || ""
                ).trim();

            const eventName =
                String(
                    registration["Event Name"] || ""
                ).trim();


            if (
                eventID &&
                eventName
            ) {

                events[eventID] =
                    eventName;

            }

        }
    );


    select.innerHTML = `
        <option value="">
            All Events
        </option>
    `;


    Object.keys(events)
        .sort()
        .forEach(
            function (eventID) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    eventID;

                option.textContent =
                    events[eventID];

                select.appendChild(
                    option
                );

            }
        );

}

/*==================================================
        FILTER REGISTRATIONS
==================================================*/

function filterRideRegistrations() {

    const eventID =
        String(
            document.getElementById(
                "registrationEventFilter"
            )?.value || ""
        ).trim();


    const paymentStatus =
        String(
            document.getElementById(
                "registrationPaymentFilter"
            )?.value || ""
        ).trim()
        .toLowerCase();


    const approvalStatus =
        String(
            document.getElementById(
                "registrationApprovalFilter"
            )?.value || ""
        ).trim()
        .toLowerCase();


    const registrationStatus =
        String(
            document.getElementById(
                "registrationStatusFilter"
            )?.value || ""
        ).trim()
        .toLowerCase();


    const search =
        String(
            document.getElementById(
                "registrationSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const filtered =
        allRideRegistrations.filter(
            function (registration) {

                const matchesEvent =
                    !eventID ||
                    String(
                        registration["Event ID"] || ""
                    ).trim()
                    ===
                    eventID;


                const matchesPayment =
                    !paymentStatus ||
                    String(
                        registration[
                            "Payment Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    paymentStatus;


                const matchesApproval =
                    !approvalStatus ||
                    String(
                        registration[
                            "Approval Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    approvalStatus;


                const matchesRegistration =
                    !registrationStatus ||
                    String(
                        registration[
                            "Registration Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    registrationStatus;


                const searchText = [

                    registration[
                        "Registration ID"
                    ],

                    registration[
                        "Membership ID"
                    ],

                    registration[
                        "Full Name"
                    ],

                    registration[
                        "Phone"
                    ],

                    registration[
                        "Event Name"
                    ]

                ]
                .join(" ")
                .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchText.includes(
                        search
                    );


                return (
                    matchesEvent &&
                    matchesPayment &&
                    matchesApproval &&
                    matchesRegistration &&
                    matchesSearch
                );

            }
        );


    renderRideRegistrations(
        filtered
    );

    updateRegistrationSummary(
        filtered
    );

}

/*==================================================
        EXPORT EVENT REGISTRATIONS TO EXCEL
==================================================*/

function exportRegistrationsToExcel() {

    const eventFilter =
        document.getElementById(
            "registrationEventFilter"
        );


    const eventID =
        eventFilter
            ? eventFilter.value.trim()
            : "";


    /*------------------------------------------
            REQUIRE EVENT SELECTION
    ------------------------------------------*/

    if (!eventID) {

        alert(
            "Please select an event before exporting."
        );

        if (eventFilter) {

            eventFilter.focus();

        }

        return;

    }


    /*------------------------------------------
            GET EVENT NAME
    ------------------------------------------*/

    const selectedOption =
        eventFilter.selectedOptions[0];


    const eventName =
        selectedOption
            ? selectedOption.textContent.trim()
            : "Event";


    /*------------------------------------------
            GET EVENT REGISTRATIONS
    ------------------------------------------*/

    const eventRegistrations =
        allRideRegistrations.filter(
            function (registration) {

                return String(
                    registration["Event ID"] || ""
                ).trim()
                ===
                eventID;

            }
        );


    if (!eventRegistrations.length) {

        alert(
            "No registrations found for " +
            eventName +
            "."
        );

        return;

    }


    /*------------------------------------------
            CHECK EXCEL LIBRARY
    ------------------------------------------*/

    if (
        typeof XLSX === "undefined"
    ) {

        alert(
            "Excel library is not loaded.\n\n" +
            "Please check the XLSX script in events.html."
        );

        return;

    }


    /*------------------------------------------
            CREATE EXPORT DATA
    ------------------------------------------*/

    const exportData =
        eventRegistrations.map(
            function (registration, index) {

                return {

                    "Sl No":
                        index + 1,

                    "Registration ID":
                        registration[
                            "Registration ID"
                        ] || "",

                    "Event ID":
                        registration[
                            "Event ID"
                        ] || "",

                    "Event Name":
                        registration[
                            "Event Name"
                        ] || "",

                    "Event Type":
                        registration[
                            "Event Type"
                        ] || "",

                    "Membership ID":
                        registration[
                            "Membership ID"
                        ] || "",

                    "Registration Date":
                        registration[
                            "Registration Date"
                        ] || "",

                    "Registration Status":
                        registration[
                            "Registration Status"
                        ] || "",

                    "Payment Status":
                        registration[
                            "Payment Status"
                        ] || "",

                    "Approval Status":
                        registration[
                            "Approval Status"
                        ] || "",

                    "Full Name":
                        registration[
                            "Full Name"
                        ] || "",

                    "Phone":
                        registration[
                            "Phone"
                        ] || "",

                    "Alternate Phone":
                        registration[
                            "Alternate Phone"
                        ] || "",

                    "Date of Birth":
                        registration[
                            "Date of Birth"
                        ] || "",

                    "Age":
                        registration[
                            "Age"
                        ] || "",

                    "Gender":
                        registration[
                            "Gender"
                        ] || "",

                    "Blood Group":
                        registration[
                            "Blood Group"
                        ] || "",

                    "Emergency Contact Name":
                        registration[
                            "Emergency Contact Name"
                        ] || "",

                    "Emergency Contact Relationship":
                        registration[
                            "Emergency Contact Relationship"
                        ] || "",

                    "Emergency Contact Number":
                        registration[
                            "Emergency Contact Number"
                        ] || "",

                    "Emergency Contact Address":
                        registration[
                            "Emergency Contact Address"
                        ] || "",

                    "Vehicle Registration":
                        registration[
                            "Vehicle Registration"
                        ] || "",

                    "Motorcycle Make":
                        registration[
                            "Motorcycle Make"
                        ] || "",

                    "Motorcycle Model":
                        registration[
                            "Motorcycle Model"
                        ] || "",

                    "Vehicle Variant":
                        registration[
                            "Vehicle Variant"
                        ] || "",

                    "Engine Number":
                        registration[
                            "Engine Number"
                        ] || "",

                    "Chassis Number":
                        registration[
                            "Chassis Number"
                        ] || "",

                    "Vehicle Owner":
                        registration[
                            "Vehicle Owner"
                        ] || "",

                    "Owner Name":
                        registration[
                            "Owner Name"
                        ] || "",

                    "Owner Phone":
                        registration[
                            "Owner Phone"
                        ] || "",

                    "Owner NOC Required":
                        registration[
                            "Owner NOC Required"
                        ] || "",

                    "Insurance Company":
                        registration[
                            "Vehicle Insurance Company"
                        ] || "",

                    "Insurance Policy Number":
                        registration[
                            "Insurance Policy Number"
                        ] || "",

                    "Insurance Valid From":
                        registration[
                            "Insurance Valid From"
                        ] || "",

                    "Insurance Valid To":
                        registration[
                            "Insurance Valid To"
                        ] || "",

                    "PUC Valid To":
                        registration[
                            "Pollution Certificate Valid To"
                        ] || "",

                    "Pillion Required":
                        registration[
                            "Pillion Required"
                        ] || "",

                    "Pillion Name":
                        registration[
                            "Pillion Full Name"
                        ] || "",

                    "Pillion Phone":
                        registration[
                            "Pillion Phone"
                        ] || "",

                    "Pillion Relationship":
                        registration[
                            "Pillion Relationship"
                        ] || "",

                    "Pillion Blood Group":
                        registration[
                            "Pillion Blood Group"
                        ] || "",

                    "Pillion Emergency Contact":
                        registration[
                            "Pillion Emergency Contact Name"
                        ] || "",

                    "Height CM":
                        registration[
                            "Height CM"
                        ] || "",

                    "Weight KG":
                        registration[
                            "Weight KG"
                        ] || "",

                    "Identification Mark":
                        registration[
                            "Identification Mark"
                        ] || "",

                    "Disability Details":
                        registration[
                            "Disability Details"
                        ] || "",

                    "Accident History":
                        registration[
                            "Accident History"
                        ] || "",

                    "Medicine Allergies":
                        registration[
                            "Medicine Allergies"
                        ] || "",

                    "Current Medications":
                        registration[
                            "Current Medications"
                        ] || "",

                    "Smoker":
                        registration[
                            "Smoker"
                        ] || "",

                    "Alcohol Consumption":
                        registration[
                            "Alcohol Consumption"
                        ] || "",

                    "Health Insurance":
                        registration[
                            "Health Insurance"
                        ] || "",

                    "Health Insurance Details":
                        registration[
                            "Health Insurance Details"
                        ] || "",

                    "Medical Declaration":
                        registration[
                            "Medical Declaration"
                        ] || "",

                    "Ride Declaration Accepted":
                        registration[
                            "Ride Declaration Accepted"
                        ] || "",

                    "Declaration Version":
                        registration[
                            "Ride Declaration Version"
                        ] || "",

                    "Declaration Date":
                        registration[
                            "Declaration Date"
                        ] || "",

                    "Declaration Time":
                        registration[
                            "Declaration Time"
                        ] || ""

                };

            }
        );


    /*------------------------------------------
            CREATE WORKSHEET
    ------------------------------------------*/

    const worksheet =
        XLSX.utils.json_to_sheet(
            exportData
        );


    /*------------------------------------------
            COLUMN WIDTHS
    ------------------------------------------*/

    worksheet["!cols"] = [

        { wch: 7 },
        { wch: 15 },
        { wch: 12 },
        { wch: 22 },
        { wch: 12 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 18 },
        { wch: 22 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 },
        { wch: 8 },
        { wch: 10 },
        { wch: 12 },
        { wch: 24 },
        { wch: 20 },
        { wch: 18 },
        { wch: 28 }

    ];


    /*------------------------------------------
            CREATE WORKBOOK
    ------------------------------------------*/

    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Registrations"
    );


    /*------------------------------------------
            SAFE FILE NAME
    ------------------------------------------*/

    const safeEventName =
        eventName
            .replace(
                /[^a-z0-9]+/gi,
                "_"
            )
            .replace(
                /^_+|_+$/g,
                ""
            );


    /*------------------------------------------
            DOWNLOAD
    ------------------------------------------*/

    const filename =
        `SHERPAS_${safeEventName}_Registrations.xlsx`;


    XLSX.writeFile(
        workbook,
        filename
    );



}

/*==================================================
        EXPORT EVENT DAY ATTENDANCE TO EXCEL
==================================================*/

function exportEventDayAttendanceToExcel() {

    const eventSelect =
        document.getElementById(
            "eventDayEventSelect"
        );


    const eventID =
        eventSelect
            ? String(
                eventSelect.value || ""
              ).trim()
            : "";


    if (!eventID) {

        alert(
            "Please select an event before exporting."
        );

        return;

    }


    if (
        typeof XLSX ===
        "undefined"
    ) {

        alert(
            "Excel library is not loaded."
        );

        return;

    }


    const event =
        allEvents.find(
            function(item) {

                return String(
                    item["Event ID"] || ""
                ).trim()
                .toUpperCase()
                ===
                eventID.toUpperCase();

            }
        );


    if (!event) {

        alert(
            "Selected event could not be found."
        );

        return;

    }


    /*
        Get all approved + payment verified
        riders for this event.
    */

    const riders =
        allRideRegistrations.filter(
            function(registration) {

                const registrationEventID =
                    String(
                        registration[
                            "Event ID"
                        ] || ""
                    )
                    .trim()
                    .toUpperCase();


                const approval =
                    String(
                        registration[
                            "Approval Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase();


                const payment =
                    String(
                        registration[
                            "Payment Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase();


                return (
                    registrationEventID ===
                    eventID.toUpperCase()
                    &&
                    approval ===
                    "approved"
                    &&
                    payment ===
                    "verified"
                );

            }
        );


    if (!riders.length) {

        alert(
            "No approved riders found for this event."
        );

        return;

    }


    const exportData =
        riders.map(
            function(registration) {

                const registrationID =
                    String(
                        registration[
                            "Registration ID"
                        ] || ""
                    ).trim();


                const attendance =
                    allEventDayAttendance.find(
                        function(item) {

                            return String(
                                item[
                                    "Registration ID"
                                ] || ""
                            ).trim()
                            ===
                            registrationID;

                        }
                    ) || {};


                return {

                    "Event ID":
                        event["Event ID"] || "",

                    "Event Name":
                        event["Event Name"] || "",

                    "Event Date":
                        event["Date"] || "",

                    "Event Time":
                        event["Time"] || "",

                    "Location":
                        event["Location"] || "",

                    "Registration ID":
                        registrationID,

                    "Membership ID":
                        registration[
                            "Membership ID"
                        ] || "",

                    "Rider Name":
                        registration[
                            "Full Name"
                        ] || "",

                    "Phone":
                        registration[
                            "Phone"
                        ] || "",

                    "Vehicle Registration":
                        registration[
                            "Vehicle Registration"
                        ] || "",

                    "Payment Status":
                        registration[
                            "Payment Status"
                        ] || "",

                    "Approval Status":
                        registration[
                            "Approval Status"
                        ] || "",

                    "Check-In Status":
                        attendance[
                            "Check-In Status"
                        ] ||
                        "Not Checked In",

                    "Check-In Time":
                        formatAttendanceDateTime(
                            attendance[
                                "Check-In Time"
                            ]
                        ) || "",

                    "Checked In By":
                        attendance[
                            "Checked In By"
                        ] || "",

                    "Start Status":
                        attendance[
                            "Start Status"
                        ] ||
                        "Not Started",

                    "Start Time":
                        formatAttendanceDateTime(
                            attendance[
                                "Start Time"
                            ]
                        ) || "",

                    "Started By":
                        attendance[
                            "Started By"
                        ] || "",

                    "Return Status":
                        attendance[
                            "Return Status"
                        ] ||
                        "Not Returned",

                    "Return Time":
                        formatAttendanceDateTime(
                            attendance[
                                "Return Time"
                            ]
                        ) || "",

                    "Returned By":
                        attendance[
                            "Returned By"
                        ] || "",

                    "Attendance Status":
                        String(
                            attendance["Attendance Status"] || ""
                        ).trim().toLowerCase() === "no show"
                            ? "Absent"
                            : (
                                attendance["Attendance Status"] ||
                                "Pending"
                            ),

                    "Admin Remarks":
                        attendance[
                            "Admin Remarks"
                        ] || ""

                };

            }
        );


    const worksheet =
        XLSX.utils.json_to_sheet(
            exportData
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Attendance"
    );


    worksheet["!cols"] = [
        { wch: 12 },
        { wch: 22 },
        { wch: 12 },
        { wch: 12 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
        { wch: 22 },
        { wch: 15 },
        { wch: 20 },
        { wch: 15 },
        { wch: 16 },
        { wch: 22 },
        { wch: 20 },
        { wch: 24 },
        { wch: 16 },
        { wch: 22 },
        { wch: 20 },
        { wch: 16 },
        { wch: 22 },
        { wch: 20 },
        { wch: 18 },
        { wch: 30 }
    ];


    const safeEventName =
        String(
            event["Event Name"] ||
            eventID
        )
        .replace(
            /[^a-z0-9]+/gi,
            "_"
        );


    XLSX.writeFile(
        workbook,
        `SHERPAS_Event_Attendance_${safeEventName}.xlsx`
    );

}

/*==================================================
        EXPORT EVENT DAY ATTENDANCE TO PDF
==================================================*/

function exportEventDayAttendanceToPDF() {

    const eventSelect =
        document.getElementById(
            "eventDayEventSelect"
        );


    const eventID =
        eventSelect
            ? String(
                eventSelect.value || ""
              ).trim()
            : "";


    if (!eventID) {

        alert(
            "Please select an event before exporting."
        );

        return;

    }


    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        alert(
            "PDF library is not loaded."
        );

        return;

    }


    const event =
        allEvents.find(
            function(item) {

                return String(
                    item["Event ID"] || ""
                ).trim()
                .toUpperCase()
                ===
                eventID.toUpperCase();

            }
        );


    if (!event) {

        alert(
            "Selected event could not be found."
        );

        return;

    }


    const riders =
        allRideRegistrations.filter(
            function(registration) {

                const registrationEventID =
                    String(
                        registration[
                            "Event ID"
                        ] || ""
                    )
                    .trim()
                    .toUpperCase();


                const approval =
                    String(
                        registration[
                            "Approval Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase();


                const payment =
                    String(
                        registration[
                            "Payment Status"
                        ] || ""
                    )
                    .trim()
                    .toLowerCase();


                return (
                    registrationEventID ===
                    eventID.toUpperCase()
                    &&
                    approval ===
                    "approved"
                    &&
                    payment ===
                    "verified"
                );

            }
        );


    if (!riders.length) {

        alert(
            "No approved riders found for this event."
        );

        return;

    }


    const {
        jsPDF
    } = window.jspdf;


    const doc =
        new jsPDF(
            "landscape",
            "mm",
            "a4"
        );


    const attendanceRows =
        riders.map(
            function(registration) {

                const registrationID =
                    String(
                        registration[
                            "Registration ID"
                        ] || ""
                    ).trim();

                const adminRemarks =
                    String(
                        registration[
                            "Admin Remarks"
                        ] || ""
                    ).trim();


                const attendance =
                    allEventDayAttendance.find(
                        function(item) {

                            return String(
                                item[
                                    "Registration ID"
                                ] || ""
                            ).trim()
                            ===
                            registrationID;

                        }
                    ) || {};


                return [

                    registrationID,

                    registration[
                        "Full Name"
                    ] || "",

                    registration[
                        "Membership ID"
                    ] || "",

                    registration[
                        "Phone"
                    ] || "",

                    registration[
                        "Vehicle Registration"
                    ] || "",

                    attendance[
                        "Check-In Status"
                    ] ||
                    "Not Checked In",

                    formatAttendanceDateTime(
                        attendance[
                            "Check-In Time"
                        ]
                    ) || "—",

                    attendance[
                        "Start Status"
                    ] ||
                    "Not Started",

                    formatAttendanceDateTime(
                        attendance[
                            "Start Time"
                        ]
                    ) || "—",

                    attendance[
                        "Return Status"
                    ] ||
                    "Not Returned",

                    formatAttendanceDateTime(
                        attendance[
                            "Return Time"
                        ]
                    ) || "—",

                    String(
                        attendance["Attendance Status"] || ""
                    ).trim().toLowerCase() === "no show"
                        ? "Absent"
                        : (
                            attendance["Attendance Status"] ||
                            "Pending"
                        )

                ];

            }
        );


    doc.setFontSize(
        18
    );

    doc.text(
        "SHERPAS OF SOUTH INDIA",
        14,
        15
    );


    doc.setFontSize(
        14
    );

    doc.text(
        "Event Day Attendance Report",
        14,
        23
    );


    doc.setFontSize(
        11
    );

    doc.text(
        String(
            event["Event Name"] ||
            "Event"
        ),
        14,
        31
    );


    doc.setFontSize(
        9
    );

    doc.text(
        [
            event["Date"],
            event["Time"],
            event["Location"]
        ]
        .filter(Boolean)
        .join(" • "),
        14,
        37
    );


    /*
        Summary
    */

    const checkedIn =
        allEventDayAttendance.filter(
            function(item) {

                return String(
                    item[
                        "Check-In Status"
                    ] || ""
                )
                .trim()
                .toLowerCase()
                ===
                "checked in";

            }
        ).length;


    const started =
        allEventDayAttendance.filter(
            function(item) {

                return String(
                    item[
                        "Start Status"
                    ] || ""
                )
                .trim()
                .toLowerCase()
                ===
                "started";

            }
        ).length;


    const returned =
        allEventDayAttendance.filter(
            function(item) {

                return String(
                    item[
                        "Return Status"
                    ] || ""
                )
                .trim()
                .toLowerCase()
                ===
                "returned";

            }
        ).length;


    const noShow =
        allEventDayAttendance.filter(
            function(item) {

                return String(
                    item[
                        "Attendance Status"
                    ] || ""
                )
                .trim()
                .toLowerCase()
                ===
                "no show";

            }
        ).length;


    doc.text(
        `Approved: ${riders.length}    Checked In: ${checkedIn}    Started: ${started}    Returned: ${returned}    No Show: ${noShow}`,
        14,
        44
    );


    doc.autoTable({

        startY: 49,

        head: [[

            "Registration",
            "Rider",
            "Membership",
            "Phone",
            "Vehicle",
            "Check-In",
            "Check-In Time",
            "Start",
            "Start Time",
            "Return",
            "Return Time",
            "Attendance"

        ]],

        body:
            attendanceRows,

        theme:
            "grid",

        styles: {

            fontSize: 7,

            cellPadding: 2,

            overflow:
                "linebreak",

            valign:
                "middle"

        },

        headStyles: {

            fontSize: 7,

            fontStyle:
                "bold"

        },

        columnStyles: {

            0: { cellWidth: 22 },
            1: { cellWidth: 27 },
            2: { cellWidth: 22 },
            3: { cellWidth: 22 },
            4: { cellWidth: 27 },
            5: { cellWidth: 20 },
            6: { cellWidth: 28 },
            7: { cellWidth: 20 },
            8: { cellWidth: 28 },
            9: { cellWidth: 20 },
            10: { cellWidth: 28 },
            11: { cellWidth: 22 }

        },

        margin: {

            left: 8,

            right: 8

        }

    });


    const safeEventName =
        String(
            event["Event Name"] ||
            eventID
        )
        .replace(
            /[^a-z0-9]+/gi,
            "_"
        );


    doc.save(
        `SHERPAS_Event_Attendance_${safeEventName}.pdf`
    );

}




function getFilteredRideRegistrations(
    eventID,
    paymentStatus,
    approvalStatus,
    registrationStatus,
    search
) {

    return allRideRegistrations.filter(
        function (registration) {

            const searchText = [
                registration["Registration ID"],
                registration["Membership ID"],
                registration["Full Name"],
                registration["Phone"],
                registration["Event Name"]
            ]
            .join(" ")
            .toLowerCase();


            return (

                (!eventID ||
                    String(
                        registration["Event ID"] || ""
                    ).trim()
                    ===
                    eventID)

                &&

                (!paymentStatus ||
                    String(
                        registration["Payment Status"] || ""
                    ).trim().toLowerCase()
                    ===
                    paymentStatus.trim().toLowerCase())

                &&

                (!approvalStatus ||
                    String(
                        registration["Approval Status"] || ""
                    ).trim().toLowerCase()
                    ===
                    approvalStatus.trim().toLowerCase())

                &&

                (!registrationStatus ||
                    String(
                        registration["Registration Status"] || ""
                    ).trim().toLowerCase()
                    ===
                    registrationStatus.trim().toLowerCase())

                &&

                (!search ||
                    searchText.includes(
                        search.trim().toLowerCase()
                    ))

            );

        }
    );

}


/*==================================================
        REGISTRATION SUMMARY
==================================================*/

function updateRegistrationSummary(
    registrations
) {

    const container =
        document.getElementById(
            "registrationSummary"
        );


    if (!container) {
        return;
    }


    const paymentPending =
        registrations.filter(
            function (r) {

                return String(
                    r["Payment Status"] || ""
                )
                .trim()
                .toLowerCase()
                ===
                "pending verification";

            }
        ).length;


    const paymentVerified =
        registrations.filter(
            function (r) {

                return String(
                    r["Payment Status"] || ""
                )
                .trim()
                .toLowerCase()
                ===
                "verified";

            }
        ).length;


    const approvalPending =
        registrations.filter(
            function (r) {

                return String(
                    r["Approval Status"] || ""
                )
                .trim()
                .toLowerCase()
                ===
                "pending";

            }
        ).length;


    const approved =
        registrations.filter(
            function (r) {

                return String(
                    r["Approval Status"] || ""
                )
                .trim()
                .toLowerCase()
                ===
                "approved";

            }
        ).length;


    const rejected =
        registrations.filter(
            function (r) {

                return String(
                    r["Approval Status"] || ""
                )
                .trim()
                .toLowerCase()
                ===
                "rejected";

            }
        ).length;


    container.innerHTML = `

        <div class="registration-summary-item">

            <strong>
                ${registrations.length}
            </strong>

            Registrations

        </div>


        <div class="registration-summary-item">

            <strong>
                ${paymentPending}
            </strong>

            Payment Pending

        </div>


        <div class="registration-summary-item">

            <strong>
                ${paymentVerified}
            </strong>

            Payment Verified

        </div>


        <div class="registration-summary-item">

            <strong>
                ${approvalPending}
            </strong>

            Approval Pending

        </div>


        <div class="registration-summary-item">

            <strong>
                ${approved}
            </strong>

            Approved

        </div>


        <div class="registration-summary-item">

            <strong>
                ${rejected}
            </strong>

            Rejected

        </div>

    `;

}

/*==================================================
        REGISTRATION FILTER EVENTS
==================================================*/

function initializeRegistrationFilters() {

    const controls = [

        "registrationEventFilter",

        "registrationPaymentFilter",

        "registrationApprovalFilter",

        "registrationStatusFilter"

    ];


    controls.forEach(
        function (id) {

            const element =
                document.getElementById(id);


            if (element) {

                element.addEventListener(
                    "change",
                    filterRideRegistrations
                );

            }

        }
    );


    const search =
        document.getElementById(
            "registrationSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            filterRideRegistrations
        );

    }

}



/*==================================================
        OPEN REGISTRATION VIEW
==================================================*/

document.addEventListener(
    "click",
    function (e) {

        const btn =
            e.target.closest(
                ".registration-view-btn"
            );

        if (!btn) {
            return;
        }


        const registrationID =
            btn.dataset.id;


        if (!registrationID) {
            return;
        }


        const registration =
            allRideRegistrations.find(
                function (item) {

                    return String(
                        item["Registration ID"] || ""
                    ).trim()
                    ===
                    String(
                        registrationID
                    ).trim();

                }
            );


        if (!registration) {

            alert(
                "Registration details could not be found."
            );

            return;

        }


        openRegistrationView(
            registration
        );

    }
);


/*==================================================
        UPDATE RIDE APPROVAL
==================================================*/

async function updateRegistrationApproval(
    registrationID,
    approvalAction,
    remarks = ""
) {

    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );

    if (!token) {

        throw new Error(
            "Admin session expired. Please login again."
        );

    }


    const form =
        new URLSearchParams();


    form.append(
        "action",
        "UPDATE_RIDE_APPROVAL"
    );


    form.append(
        "token",
        token
    );


    form.append(
        "data",
        JSON.stringify({

            registrationID:
                registrationID,

            approvalAction:
                approvalAction,

            remarks:
                remarks

        })
    );


    const response =
        await fetch(
            MEMBERS_API,
            {
                method: "POST",
                body: form
            }
        );


    const result =
        await response.json();


    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to update registration status."
        );

    }


    return result;

}


/*==================================================
        UPDATE RIDE REGISTRATION
==================================================*/

async function saveRideRegistrationChanges(
    registrationID,
    changes
) {

    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );


    if (!token) {

        throw new Error(
            "Admin session expired. Please login again."
        );

    }


    const form =
        new URLSearchParams();


    form.append(
        "action",
        "UPDATE_RIDE_REGISTRATION"
    );


    form.append(
        "token",
        token
    );


    form.append(
        "data",
        JSON.stringify({

            registrationID:
                registrationID,

            ...changes

        })
    );


    const response =
        await fetch(
            MEMBERS_API,
            {
                method: "POST",
                body: form
            }
        );


    const result =
        await response.json();



    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to update registration."
        );

    }


    return result;

}

/*==================================================
        APPROVE REGISTRATION MODAL
==================================================*/

function openApproveRegistrationModal(
    registration,
    approveButton
) {

    const existingModal =
        document.getElementById(
            "approveRegistrationModal"
        );

    if (existingModal) {
        existingModal.remove();
    }


    const registrationID =
        String(
            registration["Registration ID"] || ""
        ).trim();


    const memberName =
        String(
            registration["Full Name"] || "-"
        ).trim();


    const eventName =
        String(
            registration["Event Name"] || "-"
        ).trim();


    const existingRemark =
        String(
            registration["Admin Remarks"] || ""
        ).trim();


    const modal =
        document.createElement("div");

    modal.id =
        "approveRegistrationModal";

    modal.className =
        "approve-registration-modal";


    modal.innerHTML = `

        <div class="approve-registration-dialog">

            <!-- HEADER -->

            <div class="approve-registration-header">

                <div>

                    <h3>
                        <i class="fa-solid fa-user-check"></i>
                        Approve Registration
                    </h3>

                    <p>
                        ${escapeHTML(
                            registrationID
                        )}
                    </p>

                </div>


                <button
                    type="button"
                    class="approve-registration-close"
                    id="closeApproveRegistrationModal"
                    aria-label="Close"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>

            </div>


            <!-- BODY -->

            <div class="approve-registration-body">

                <div class="approve-registration-summary">

                    <div>
                        <span>Rider</span>

                        <strong>
                            ${escapeHTML(
                                memberName
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>Event</span>

                        <strong>
                            ${escapeHTML(
                                eventName
                            )}
                        </strong>
                    </div>

                </div>


                <div class="approve-registration-payment-note">

                    <i class="fa-solid fa-circle-check"></i>

                    Payment has already been verified.

                </div>


                <div class="approve-registration-field">

                    <label for="approveRegistrationRemarks">

                        <i class="fa-solid fa-user-shield"></i>

                        Admin Remarks

                    </label>


                    <textarea
                        id="approveRegistrationRemarks"
                        rows="4"
                        maxlength="1000"
                        placeholder="Enter an admin remark..."
                    >${escapeHTML(
                        existingRemark
                    )}</textarea>


                    <div class="approve-registration-help">

                        You can keep the existing remark,
                        edit it, or leave it blank.

                    </div>

                </div>

            </div>


            <!-- FOOTER -->

            <div class="approve-registration-footer">

                <button
                    type="button"
                    class="approve-registration-cancel-btn"
                    id="cancelApproveRegistration"
                >
                    <i class="fa-solid fa-xmark"></i>
                    Cancel
                </button>


                <button
                    type="button"
                    class="approve-registration-confirm-btn"
                    id="confirmApproveRegistration"
                >
                    <i class="fa-solid fa-user-check"></i>
                    Approve Registration
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const textarea =
        document.getElementById(
            "approveRegistrationRemarks"
        );


    const closeModal =
        function() {

            modal.remove();

            document.body.style.overflow = "";

        };


    document
        .getElementById(
            "closeApproveRegistrationModal"
        )
        .onclick =
        closeModal;


    document
        .getElementById(
            "cancelApproveRegistration"
        )
        .onclick =
        closeModal;


    modal.addEventListener(
        "click",
        function(e) {

            if (
                e.target === modal
            ) {

                closeModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        function approveModalEscapeHandler(
            e
        ) {

            if (
                e.key !== "Escape"
            ) {
                return;
            }


            if (
                document.body.contains(
                    modal
                )
            ) {

                closeModal();

            }


            document.removeEventListener(
                "keydown",
                approveModalEscapeHandler
            );

        }
    );


    const confirmButton =
        document.getElementById(
            "confirmApproveRegistration"
        );


    confirmButton.onclick =
        async function() {

            const remarks =
                textarea
                    ? textarea.value.trim()
                    : "";


            confirmButton.disabled =
                true;


            confirmButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Approving...';


            try {

                await updateRegistrationApproval(
                    registrationID,
                    "APPROVE",
                    remarks
                );


                closeModal();


                alert(
                    "Registration approved successfully."
                );


                await loadRideRegistrations();

            }
            catch (error) {

                console.error(
                    "APPROVE REGISTRATION ERROR:",
                    error
                );


                alert(
                    "Approval failed.\n\n" +
                    error.message
                );


                confirmButton.disabled =
                    false;


                confirmButton.innerHTML =
                    '<i class="fa-solid fa-user-check"></i> Approve Registration';

            }

        };


    document.body.style.overflow =
        "hidden";


    setTimeout(
        function() {

            if (textarea) {

                textarea.focus();

                textarea.setSelectionRange(
                    textarea.value.length,
                    textarea.value.length
                );

            }

        },
        50
    );

}


/*==================================================
        APPROVE REGISTRATION
==================================================*/

document.addEventListener(
    "click",
    function (e) {

        const btn =
            e.target.closest(
                '[data-action="approve-registration"]'
            );


        if (!btn) {
            return;
        }


        const registrationID =
            btn.dataset.id;


        if (!registrationID) {

            return;

        }


        const registration =
            allRideRegistrations.find(
                function (item) {

                    return String(
                        item["Registration ID"] || ""
                    ).trim()
                    ===
                    String(
                        registrationID || ""
                    ).trim();

                }
            );


        if (!registration) {

            alert(
                "Registration not found."
            );

            return;

        }


        /*
            Open the custom styled
            approval modal.

            Existing Admin Remarks,
            if any, will be loaded
            into the editable textarea.
        */

        openApproveRegistrationModal(
            registration,
            btn
        );

    }
);

/*==================================================
        REJECT REGISTRATION
==================================================*/

document.addEventListener(
    "click",
    async function (e) {

        const btn =
            e.target.closest(
                '[data-action="reject-registration"]'
            );

        if (!btn) {
            return;
        }


        const registrationID =
            btn.dataset.id;


        const registration =
            allRideRegistrations.find(
                function (item) {

                    return String(
                        item["Registration ID"] || ""
                    ).trim()
                    ===
                    String(
                        registrationID || ""
                    ).trim();

                }
            );


        if (!registration) {

            alert(
                "Registration not found."
            );

            return;

        }


        const reason =
            prompt(
                "Enter the reason for rejecting this registration:"
            );


        if (reason === null) {
            return;
        }


        if (!reason.trim()) {

            alert(
                "A rejection reason is required."
            );

            return;

        }


        const confirmed =
            confirm(
                "Reject registration " +
                registrationID +
                "?\n\n" +
                "Reason:\n" +
                reason.trim()
            );


        if (!confirmed) {
            return;
        }


        btn.disabled = true;

        btn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Rejecting...';


        try {

            await updateRegistrationApproval(
                registrationID,
                "REJECT",
                reason.trim()
            );


            alert(
                "Registration rejected successfully."
            );


            await loadRideRegistrations();

        }
        catch (error) {

            console.error(
                "REJECT REGISTRATION ERROR:",
                error
            );


            alert(
                "Registration rejection failed.\n\n" +
                error.message
            );

        }
        finally {

            btn.disabled = false;

        }

    }
);


/*==================================================
        OPEN REGISTRATION DETAILS
==================================================*/

function openRegistrationView(
    registration
) {

    const modal =
        document.getElementById(
            "registrationViewModal"
        );

    const body =
        document.getElementById(
            "registrationViewBody"
        );

    const subtitle =
        document.getElementById(
            "registrationViewSubtitle"
        );


    if (
        !modal ||
        !body
    ) {

        return;

    }


    const registrationID =
        registration["Registration ID"] || "-";


    if (subtitle) {

        subtitle.textContent =
            `${registration["Event Name"] || "Event"} • ${registrationID}`;

    }


    const header =
        modal.querySelector(
            ".registration-view-header"
        );

    const oldEditButton =
        document.getElementById(
            "registrationEditBtn"
        );

    if (oldEditButton) {
        oldEditButton.remove();
    }

    const editButton =
        document.createElement("button");

    editButton.type = "button";
    editButton.id = "registrationEditBtn";
    editButton.className = "registration-edit-btn";

    editButton.innerHTML =
        '<i class="fa-solid fa-pen"></i> Edit';

    editButton.onclick =
        function () {
            renderRegistrationEdit(
                registration
            );
        };

    const closeButton =
        document.getElementById(
            "closeRegistrationView"
        );

    if (
        header &&
        closeButton
    ) {
        header.insertBefore(
            editButton,
            closeButton
        );
    }

    const existingHeader =
        modal.querySelector(
            ".registration-view-header > div"
        );


    function item(
        label,
        value,
        full = false
    ) {

        const displayValue =
            value === undefined ||
            value === null ||
            String(value).trim() === ""
                ? "-"
                : String(value);


        return `

            <div class="
                registration-detail-item
                ${full ? "registration-detail-full" : ""}
            ">

                <span class="registration-detail-label">

                    ${escapeHTML(label)}

                </span>

                <span class="registration-detail-value">

                    ${escapeHTML(displayValue)}

                </span>

            </div>

        `;

    }


    function linkItem(
        label,
        url
    ) {

        if (
            !url ||
            !String(url).trim()
        ) {

            return item(
                label,
                ""
            );

        }


        return `

            <div class="registration-detail-item">

                <span class="registration-detail-label">

                    ${escapeHTML(label)}

                </span>

                <a
                    href="${escapeHTML(url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="registration-view-file"
                >

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                    Open

                </a>

            </div>

        `;

    }


    const paymentStatus =
        registration[
            "Payment Status"
        ] || "Not Required";


    const approvalStatus =
        registration[
            "Approval Status"
        ] || "Pending";


    const registrationStatus =
        registration[
            "Registration Status"
        ] || "";


    body.innerHTML = `

        <!-- ==================================
             STATUS
        ================================== -->

        <div class="registration-detail-section">

            <h3>
                <i class="fa-solid fa-chart-simple"></i>
                Registration Status
            </h3>

            <div class="registration-status-line">

                <span class="
                    status-badge
                    ${getStatusClass(
                        paymentStatus
                    )}
                ">

                    Payment:
                    ${escapeHTML(paymentStatus)}

                </span>


                <span class="
                    status-badge
                    ${getStatusClass(
                        approvalStatus
                    )}
                ">

                    Approval:
                    ${escapeHTML(approvalStatus)}

                </span>


                <span class="
                    status-badge
                    ${getStatusClass(
                        registrationStatus
                    )}
                ">

                    Registration:
                    ${escapeHTML(registrationStatus)}

                </span>

            </div>

        </div>


        <!-- ==================================
             EVENT
        ================================== -->

        <div class="registration-detail-section">

            <h3>
                <i class="fa-solid fa-calendar-days"></i>
                Event Information
            </h3>

            <div class="registration-detail-grid">

                ${item(
                    "Registration ID",
                    registration["Registration ID"]
                )}

                ${item(
                    "Event ID",
                    registration["Event ID"]
                )}

                ${item(
                    "Event Name",
                    registration["Event Name"]
                )}

                ${item(
                    "Event Type",
                    registration["Event Type"]
                )}

                ${item(
                    "Registration Date",
                    registration["Registration Date"]
                )}

            </div>

        </div>


        <!-- ==================================
             MEMBER
        ================================== -->

        <div class="registration-detail-section">

            <h3>
                <i class="fa-solid fa-user"></i>
                Member Information
            </h3>

            <div class="registration-detail-grid">

                ${item(
                    "Membership ID",
                    registration["Membership ID"]
                )}

                ${item(
                    "Full Name",
                    registration["Full Name"]
                )}

                ${item(
                    "Phone",
                    registration["Phone"]
                )}

                ${item(
                    "Alternate Phone",
                    registration["Alternate Phone"]
                )}

                ${item(
                    "Date of Birth",
                    registration["Date of Birth"]
                )}

                ${item(
                    "Age",
                    registration["Age"]
                )}

                ${item(
                    "Gender",
                    registration["Gender"]
                )}

                ${item(
                    "Blood Group",
                    registration["Blood Group"]
                )}

                ${item(
                    "Address",
                    registration["Address"],
                    true
                )}

            </div>

        </div>


        <!-- ==================================
             EMERGENCY
        ================================== -->

        <div class="registration-detail-section">

            <h3>
                <i class="fa-solid fa-phone-volume"></i>
                Emergency Contact
            </h3>

            <div class="registration-detail-grid">

                ${item(
                    "Name",
                    registration[
                        "Emergency Contact Name"
                    ]
                )}

                ${item(
                    "Relationship",
                    registration[
                        "Emergency Contact Relationship"
                    ]
                )}

                ${item(
                    "Number",
                    registration[
                        "Emergency Contact Number"
                    ]
                )}

                ${item(
                    "Address",
                    registration[
                        "Emergency Contact Address"
                    ],
                    true
                )}

            </div>

        </div>


        <!-- ==================================
             VEHICLE
        ================================== -->

        <div class="registration-detail-section">

            <h3>
                <i class="fa-solid fa-motorcycle"></i>
                Vehicle Information
            </h3>

            <div class="registration-detail-grid">

                ${item(
                    "Vehicle Registration",
                    registration[
                        "Vehicle Registration"
                    ]
                )}

                ${item(
                    "Motorcycle Make",
                    registration[
                        "Motorcycle Make"
                    ]
                )}

                ${item(
                    "Motorcycle Model",
                    registration[
                        "Motorcycle Model"
                    ]
                )}

                ${item(
                    "Variant",
                    registration[
                        "Vehicle Variant"
                    ]
                )}

                ${item(
                    "Engine Number",
                    registration[
                        "Engine Number"
                    ]
                )}

                ${item(
                    "Chassis Number",
                    registration[
                        "Chassis Number"
                    ]
                )}

                ${item(
                    "Vehicle Owner",
                    registration[
                        "Vehicle Owner"
                    ]
                )}

                ${item(
                    "Owner Name",
                    registration[
                        "Owner Name"
                    ]
                )}

                ${item(
                    "Owner Phone",
                    registration[
                        "Owner Phone"
                    ]
                )}

                ${item(
                    "NOC Required",
                    registration[
                        "Owner NOC Required"
                    ]
                )}

                ${linkItem(
                    "NOC",
                    registration[
                        "Owner NOC URL"
                    ]
                )}

            </div>

        </div>


        <!-- ==================================
             INSURANCE
        ================================== -->

        <div class="registration-detail-section">

            <h3>
                <i class="fa-solid fa-shield-halved"></i>
                Insurance & PUC
            </h3>

            <div class="registration-detail-grid">

                ${item(
                    "Insurance Company",
                    registration[
                        "Vehicle Insurance Company"
                    ]
                )}

                ${item(
                    "Policy Number",
                    registration[
                        "Insurance Policy Number"
                    ]
                )}

                ${item(
                    "Insurance Valid From",
                    registration[
                        "Insurance Valid From"
                    ]
                )}

                ${item(
                    "Insurance Valid To",
                    registration[
                        "Insurance Valid To"
                    ]
                )}

                ${item(
                    "PUC Valid To",
                    registration[
                        "Pollution Certificate Valid To"
                    ]
                )}

            </div>

        </div>


        <!-- ==================================
             PILLION
        ================================== -->

        <div class="registration-detail-section">

            <h3>
                <i class="fa-solid fa-user-group"></i>
                Pillion
            </h3>

            <div class="registration-detail-grid">

                ${item(
                    "Pillion Required",
                    registration[
                        "Pillion Required"
                    ]
                )}

                ${item(
                    "Full Name",
                    registration[
                        "Pillion Full Name"
                    ]
                )}

                ${item(
                    "Relationship",
                    registration[
                        "Pillion Relationship"
                    ]
                )}

                ${item(
                    "Phone",
                    registration[
                        "Pillion Phone"
                    ]
                )}

                ${item(
                    "Blood Group",
                    registration[
                        "Pillion Blood Group"
                    ]
                )}

                ${item(
                    "Address",
                    registration[
                        "Pillion Address"
                    ],
                    true
                )}

                ${item(
                    "Emergency Contact Name",
                    registration[
                        "Pillion Emergency Contact Name"
                    ]
                )}

                ${item(
                    "Emergency Contact Relationship",
                    registration[
                        "Pillion Emergency Contact Relationship"
                    ]
                )}

                ${item(
                    "Emergency Contact Number",
                    registration[
                        "Pillion Emergency Contact Number"
                    ]
                )}

                ${item(
                    "Emergency Contact Address",
                    registration[
                        "Pillion Emergency Contact Address"
                    ],
                    true
                )}

            </div>

        </div>


        <!-- ==================================
             MEDICAL
        ================================== -->

        <div class="registration-detail-section">

            <h3>
                <i class="fa-solid fa-heart-pulse"></i>
                Medical Information
            </h3>

            <div class="registration-detail-grid">

                ${item(
                    "Height (CM)",
                    registration["Height CM"]
                )}

                ${item(
                    "Weight (KG)",
                    registration["Weight KG"]
                )}

                ${item(
                    "Identification Mark",
                    registration["Identification Mark"]
                )}

                ${item(
                    "Disability Details",
                    registration["Disability Details"],
                    true
                )}

                ${item(
                    "Accident History",
                    registration["Accident History"]
                )}

                ${item(
                    "Medicine Allergies",
                    registration["Medicine Allergies"],
                    true
                )}

                ${item(
                    "Current Medications",
                    registration["Current Medications"],
                    true
                )}

                ${item(
                    "Smoker",
                    registration["Smoker"]
                )}

                ${item(
                    "Alcohol Consumption",
                    registration[
                        "Alcohol Consumption"
                    ]
                )}

                ${item(
                    "Health Insurance",
                    registration[
                        "Health Insurance"
                    ]
                )}

                ${item(
                    "Health Insurance Details",
                    registration[
                        "Health Insurance Details"
                    ],
                    true
                )}

                ${item(
                    "Medical Declaration",
                    registration[
                        "Medical Declaration"
                    ]
                )}

            </div>

        </div>


        <!-- ==================================
             PAYMENT
        ================================== -->

        <div class="registration-detail-section">

            <h3>
                <i class="fa-solid fa-credit-card"></i>
                Payment
            </h3>

            <div class="registration-detail-grid">

                ${item(
                    "Payment Status",
                    paymentStatus
                )}

                ${linkItem(
                    "Payment Proof",
                    registration[
                        "Payment Proof URL"
                    ]
                )}

            </div>

        </div>


        <!-- ==================================
             DECLARATION
        ================================== -->

        <div class="registration-detail-section">

            <h3>
                <i class="fa-solid fa-file-signature"></i>
                Declaration
            </h3>

            <div class="registration-detail-grid">

                ${item(
                    "Ride Declaration Accepted",
                    registration[
                        "Ride Declaration Accepted"
                    ]
                )}

                ${item(
                    "Declaration Version",
                    registration[
                        "Ride Declaration Version"
                    ]
                )}

                ${item(
                    "Declaration Date",
                    registration[
                        "Declaration Date"
                    ]
                )}

                ${item(
                    "Declaration Time",
                    registration[
                        "Declaration Time"
                    ]
                )}

            </div>

        </div>


        <!-- ==================================
             ADMIN
        ================================== -->

        <div class="registration-detail-section">

            <h3>
                <i class="fa-solid fa-user-shield"></i>
                Admin Processing
            </h3>

            <div class="registration-detail-grid">

                ${item(
                    "Admin Remarks",
                    registration[
                        "Admin Remarks"
                    ],
                    true
                )}

                ${item(
                    "Approved By",
                    registration[
                        "Approved By"
                    ]
                )}

                ${item(
                    "Approved Date",
                    registration[
                        "Approved Date"
                    ]
                )}

                ${item(
                    "Rejected By",
                    registration[
                        "Rejected By"
                    ]
                )}

                ${item(
                    "Rejected Date",
                    registration[
                        "Rejected Date"
                    ]
                )}

                ${item(
                    "Rejection Reason",
                    registration[
                        "Rejection Reason"
                    ],
                    true
                )}

                ${item(
                    "Created At",
                    registration[
                        "Created At"
                    ]
                )}

                ${item(
                    "Last Updated",
                    registration[
                        "Last Updated"
                    ]
                )}

            </div>

        </div>

    `;


    modal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}


/*==================================================
        RENDER REGISTRATION EDIT MODE
==================================================*/

function renderRegistrationEdit(
    registration
) {

    const body =
        document.getElementById(
            "registrationViewBody"
        );


    if (!body) {
        return;
    }


    const registrationID =
        String(
            registration["Registration ID"] ||
            ""
        ).trim();


    body.innerHTML = `

        <div class="registration-edit-wrapper">

            <div class="registration-edit-notice">
                <i class="fa-solid fa-circle-info"></i>

                Admin edit mode.
                Protected status and audit fields
                cannot be changed here.
            </div>


            <!-- RIDER -->

            <div class="registration-detail-section">

                <h3>
                    <i class="fa-solid fa-user"></i>
                    Rider Information
                </h3>


                <div class="registration-edit-grid">

                    ${editField(
                        "Alternate Phone",
                        "Alternate Phone",
                        registration["Alternate Phone"]
                    )}

                    ${editField(
                        "Address",
                        "Address",
                        registration["Address"],
                        "textarea"
                    )}

                </div>

            </div>


            <!-- EMERGENCY -->

            <div class="registration-detail-section">

                <h3>
                    <i class="fa-solid fa-phone"></i>
                    Emergency Contact
                </h3>


                <div class="registration-edit-grid">

                    ${editField(
                        "Name",
                        "Emergency Contact Name",
                        registration["Emergency Contact Name"]
                    )}

                    ${editField(
                        "Relationship",
                        "Emergency Contact Relationship",
                        registration["Emergency Contact Relationship"]
                    )}

                    ${editField(
                        "Number",
                        "Emergency Contact Number",
                        registration["Emergency Contact Number"]
                    )}

                    ${editField(
                        "Address",
                        "Emergency Contact Address",
                        registration["Emergency Contact Address"],
                        "textarea"
                    )}

                </div>

            </div>


            <!-- VEHICLE -->

            <div class="registration-detail-section">

                <h3>
                    <i class="fa-solid fa-motorcycle"></i>
                    Vehicle Information
                </h3>


                <div class="registration-edit-grid">

                    ${editField(
                        "Vehicle Registration",
                        "Vehicle Registration",
                        registration["Vehicle Registration"]
                    )}

                    ${editField(
                        "Motorcycle Make",
                        "Motorcycle Make",
                        registration["Motorcycle Make"]
                    )}

                    ${editField(
                        "Motorcycle Model",
                        "Motorcycle Model",
                        registration["Motorcycle Model"]
                    )}

                    ${editField(
                        "Vehicle Variant",
                        "Vehicle Variant",
                        registration["Vehicle Variant"]
                    )}

                    ${editField(
                        "Engine Number",
                        "Engine Number",
                        registration["Engine Number"]
                    )}

                    ${editField(
                        "Chassis Number",
                        "Chassis Number",
                        registration["Chassis Number"]
                    )}

                    ${editField(
                        "Vehicle Owner",
                        "Vehicle Owner",
                        registration["Vehicle Owner"],
                        "select",
                        ["Yes", "No"]
                    )}

                    ${editField(
                        "Owner Name",
                        "Owner Name",
                        registration["Owner Name"]
                    )}

                    ${editField(
                        "Owner Phone",
                        "Owner Phone",
                        registration["Owner Phone"]
                    )}

                </div>

            </div>


            <!-- ADMIN REMARK -->

            <div class="registration-detail-section">

                <h3>
                    <i class="fa-solid fa-user-shield"></i>
                    Admin Processing
                </h3>


                <div class="registration-edit-grid">

                    ${editField(
                        "Admin Remarks",
                        "Admin Remarks",
                        registration["Admin Remarks"],
                        "textarea",
                        null,
                        true
                    )}

                </div>

            </div>


            <!-- ACTIONS -->

            <div class="registration-edit-actions">

                <button
                    type="button"
                    class="registration-edit-cancel-btn"
                    id="cancelRegistrationEditBtn"
                >
                    <i class="fa-solid fa-xmark"></i>
                    Cancel
                </button>


                <button
                    type="button"
                    class="registration-edit-save-btn"
                    id="saveRegistrationEditBtn"
                >
                    <i class="fa-solid fa-floppy-disk"></i>
                    Save Changes
                </button>

            </div>

        </div>

    `;


    document
        .getElementById(
            "cancelRegistrationEditBtn"
        )
        .onclick =
        function() {

            openRegistrationView(
                registration
            );

        };


    document
        .getElementById(
            "saveRegistrationEditBtn"
        )
        .onclick =
        async function() {

            const button =
                this;


            const changes = {};


            document
                .querySelectorAll(
                    "[data-registration-field]"
                )
                .forEach(
                    function(field) {

                        changes[
                            field.dataset.registrationField
                        ] =
                            field.value;

                    }
                );


            button.disabled =
                true;


            button.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';


            try {

                await saveRideRegistrationChanges(
                    registrationID,
                    changes
                );


                alert(
                    "Registration updated successfully."
                );


                await loadRideRegistrations();


                const updatedRegistration =
                    allRideRegistrations.find(
                        function(item) {

                            return String(
                                item["Registration ID"] || ""
                            ).trim()
                            ===
                            registrationID;

                        }
                    );


                if (
                    updatedRegistration
                ) {

                    openRegistrationView(
                        updatedRegistration
                    );

                }

            }
            catch (error) {

                console.error(
                    "SAVE REGISTRATION ERROR:",
                    error
                );


                alert(
                    "Unable to save registration.\n\n" +
                    error.message
                );

            }
            finally {

                button.disabled =
                    false;


                button.innerHTML =
                    '<i class="fa-solid fa-floppy-disk"></i> Save Changes';

            }

        };

}

function editField(
    label,
    field,
    value,
    type = "input",
    options = null,
    full = false
) {

    const safeValue =
        String(
            value || ""
        );


    let control = "";


    if (
        type === "textarea"
    ) {

        control = `
            <textarea
                class="registration-edit-control"
                data-registration-field="${escapeHTML(field)}"
                rows="3"
            >${escapeHTML(
                safeValue
            )}</textarea>
        `;

    }
    else if (
        type === "select"
    ) {

        control = `
            <select
                class="registration-edit-control"
                data-registration-field="${escapeHTML(field)}"
            >
                ${
                    (options || [])
                        .map(
                            function(option) {

                                return `
                                    <option
                                        value="${escapeHTML(option)}"
                                        ${
                                            safeValue
                                                .toLowerCase()
                                                ===
                                            String(option)
                                                .toLowerCase()
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${escapeHTML(option)}
                                    </option>
                                `;

                            }
                        )
                        .join("")
                }
            </select>
        `;

    }
    else {

        control = `
            <input
                type="text"
                class="registration-edit-control"
                data-registration-field="${escapeHTML(field)}"
                value="${escapeHTML(
                    safeValue
                )}"
            >
        `;

    }


    return `
        <div class="
            registration-edit-field
            ${full ? "registration-detail-full" : ""}
        ">

            <label>
                ${escapeHTML(label)}
            </label>

            ${control}

        </div>
    `;

}



/*==================================================
        CLOSE REGISTRATION VIEW MODAL
==================================================*/

function closeRegistrationView() {

    const modal =
        document.getElementById(
            "registrationViewModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    document.body.style.overflow = "";

}


/*==================================================
        REGISTRATION VIEW MODAL EVENTS
==================================================*/

document.addEventListener(
    "click",
    function (e) {

        /*------------------------------------------
                CLOSE BUTTON
        ------------------------------------------*/

        if (
            e.target.closest(
                "#closeRegistrationView"
            )
        ) {

            e.preventDefault();

            e.stopPropagation();

            closeRegistrationView();

            return;

        }


        /*------------------------------------------
                CLICK OUTSIDE MODAL
        ------------------------------------------*/

        const modal =
            document.getElementById(
                "registrationViewModal"
            );


        if (
            modal &&
            modal.classList.contains("show") &&
            e.target === modal
        ) {

            closeRegistrationView();

        }

    },
    true
);


/*==================================================
        ESC KEY
==================================================*/

document.addEventListener(
    "keydown",
    function (e) {

        if (
            e.key === "Escape"
        ) {

            const modal =
                document.getElementById(
                    "registrationViewModal"
                );


            if (
                modal &&
                modal.classList.contains("show")
            ) {

                closeRegistrationView();

            }

        }

    }
);

    


/*==================================================
        SECURE PAYMENT PROOF VIEWER
==================================================*/

async function openPaymentProof(registration) {

    const modal =
        document.getElementById(
            "paymentProofModal"
        );

    const body =
        document.getElementById(
            "paymentProofBody"
        );

    const subtitle =
        document.getElementById(
            "paymentProofSubtitle"
        );


    if (!modal || !body) {
        return;
    }


    const registrationID =
        String(
            registration["Registration ID"] || ""
        ).trim();


    if (!registrationID) {

        alert("Registration ID is missing.");

        return;

    }


    if (subtitle) {

        subtitle.textContent =
            `${registration["Event Name"] || "Event"} • ${registrationID}`;

    }

    

    body.innerHTML = `

        <div class="registrations-loading">

            <i class="fa-solid fa-spinner fa-spin"></i>

            Loading payment proof...

        </div>

    `;


    modal.classList.add("show");

    document.body.style.overflow = "hidden";


    try {

        const token =
            sessionStorage.getItem(
                "sherpas_admin_token"
            );


        if (!token) {

            throw new Error(
                "Admin session expired. Please login again."
            );

        }


        const response =
            await fetch(
                MEMBERS_API,
                {
                    method: "POST",

                    body:
                        new URLSearchParams({

                            action:
                                "GET_PAYMENT_PROOF",

                            token:
                                token,

                            data:
                                JSON.stringify({

                                    registrationID:
                                        registrationID

                                })

                        })
                }
            );


        const result =
            await response.json();



        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load payment proof."
            );

        }


        const proof =
            result.data;


        if (
            !proof ||
            !proof.base64 ||
            !proof.mimeType
        ) {

            throw new Error(
                "Payment proof data is incomplete."
            );

        }


        const dataURL =
            "data:" +
            proof.mimeType +
            ";base64," +
            proof.base64;


        body.innerHTML = `

            <iframe
                src="${dataURL}"
                class="payment-proof-frame"
                title="Payment Proof"
            ></iframe>

        `;

    }
    catch (error) {

        console.error(
            "SECURE PAYMENT PROOF ERROR:",
            error
        );


        body.innerHTML = `

            <div class="registrations-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <br><br>

                Unable to load payment proof.

                <br><br>

                ${escapeHTML(
                    error.message ||
                    "Unknown error."
                )}

            </div>

        `;

    }

}




/*==================================================
        CLOSE PAYMENT PROOF
==================================================*/

function closePaymentProof() {

    const modal =
        document.getElementById(
            "paymentProofModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}


/*--------------------------------------------------
        CLOSE BUTTON
--------------------------------------------------*/

document.addEventListener(
    "click",
    function (e) {

        if (
            e.target.closest(
                "#closePaymentProofModal"
            )
        ) {

            closePaymentProof();

        }

    }
);


/*--------------------------------------------------
        OUTSIDE CLICK
--------------------------------------------------*/

document.addEventListener(
    "click",
    function (e) {

        const modal =
            document.getElementById(
                "paymentProofModal"
            );


        if (
            modal &&
            e.target === modal
        ) {

            closePaymentProof();

        }

    }
);


/*--------------------------------------------------
        ESC
--------------------------------------------------*/

document.addEventListener(
    "keydown",
    function (e) {

        if (
            e.key === "Escape"
        ) {

            closePaymentProof();

        }

    }
);

/*==================================================
        PAYMENT BUTTON
==================================================*/

document.addEventListener(
    "click",
    function (e) {

        const btn =
            e.target.closest(
                '[data-action="payment"]'
            );


        if (!btn) {
            return;
        }


        const registrationID =
            btn.dataset.id;


        const registration =
            allRideRegistrations.find(
                function (item) {

                    return String(
                        item["Registration ID"] || ""
                    ).trim()
                    ===
                    String(
                        registrationID || ""
                    ).trim();

                }
            );


        if (!registration) {

            alert(
                "Registration details could not be found."
            );

            return;

        }


        openPaymentProof(
            registration
        );

    }
);

/*==================================================
        VERIFY PAYMENT
==================================================*/

async function verifyRegistrationPayment(
    registrationID
) {

    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );


    if (!token) {

        throw new Error(
            "Admin session expired. Please login again."
        );

    }


    const form =
        new URLSearchParams();


    form.append(
        "action",
        "VERIFY_RIDE_PAYMENT"
    );


    form.append(
        "token",
        token
    );


    form.append(
        "data",
        JSON.stringify({

            registrationID:
                registrationID,

            paymentAction:
                "VERIFY"

        })
    );


    const response =
        await fetch(
            MEMBERS_API,
            {
                method: "POST",
                body: form
            }
        );


    const result =
        await response.json();


    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to verify payment."
        );

    }


    return result;

}

/*==================================================
        VERIFY PAYMENT BUTTON
==================================================*/

document.addEventListener(
    "click",
    async function (e) {

        const btn =
            e.target.closest(
                '[data-action="verify-payment"]'
            );


        if (!btn) {
            return;
        }


        const registrationID =
            btn.dataset.id;


        if (!registrationID) {
            return;
        }


        const registration =
            allRideRegistrations.find(
                function (item) {

                    return String(
                        item["Registration ID"] || ""
                    ).trim()
                    ===
                    String(
                        registrationID
                    ).trim();

                }
            );


        if (!registration) {

            alert(
                "Registration not found."
            );

            return;

        }


        const confirmed =
            confirm(
                "Verify the payment for " +
                registrationID +
                "?\n\n" +
                "The payment will be marked as Verified."
            );


        if (!confirmed) {
            return;
        }


        btn.disabled =
            true;

        btn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';


        try {

            await verifyRegistrationPayment(
                registrationID
            );


            alert(
                "Payment verified successfully."
            );


            closePaymentProof();

            await loadRideRegistrations();

        }
        catch (error) {

            console.error(
                "VERIFY PAYMENT ERROR:",
                error
            );


            alert(
                "Payment verification failed.\n\n" +
                error.message
            );

        }
        finally {

            btn.disabled =
                false;

        }

    }
);

/*==================================================
        REJECT PAYMENT
==================================================*/

async function rejectRegistrationPayment(
    registrationID,
    remarks
) {

    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );


    if (!token) {

        throw new Error(
            "Admin session expired. Please login again."
        );

    }


    const form =
        new URLSearchParams();


    form.append(
        "action",
        "VERIFY_RIDE_PAYMENT"
    );


    form.append(
        "token",
        token
    );


    form.append(
        "data",
        JSON.stringify({

            registrationID:
                registrationID,

            paymentAction:
                "REJECT",

            remarks:
                remarks

        })
    );


    const response =
        await fetch(
            MEMBERS_API,
            {
                method: "POST",
                body: form
            }
        );


    const result =
        await response.json();



    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to reject payment."
        );

    }


    return result;

}

/*==================================================
        REJECT PAYMENT BUTTON
==================================================*/

document.addEventListener(
    "click",
    async function (e) {

        const btn =
            e.target.closest(
                '[data-action="reject-payment"]'
            );


        if (!btn) {
            return;
        }


        const registrationID =
            btn.dataset.id;


        if (!registrationID) {
            return;
        }


        const reason =
            prompt(
                "Enter the reason for rejecting this payment:"
            );


        if (
            reason === null
        ) {

            return;

        }


        if (
            !reason.trim()
        ) {

            alert(
                "A rejection reason is required."
            );

            return;

        }


        const confirmed =
            confirm(
                "Reject payment for " +
                registrationID +
                "?\n\n" +
                "Reason:\n" +
                reason
            );


        if (!confirmed) {
            return;
        }


        btn.disabled =
            true;

        btn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Rejecting...';


        try {

            await rejectRegistrationPayment(
                registrationID,
                reason.trim()
            );


            alert(
                "Payment rejected successfully."
            );


            closePaymentProof();

            await loadRideRegistrations();

        }
        catch (error) {

            console.error(
                "REJECT PAYMENT ERROR:",
                error
            );


            alert(
                "Payment rejection failed.\n\n" +
                error.message
            );

        }
        finally {

            btn.disabled =
                false;

        }

    }
);




function getStatusClass(
    status
) {

    const value =
        String(
            status || ""
        ).toLowerCase();


    if (
        value.includes("approved") ||
        value.includes("verified")
    ) {

        return "status-approved";

    }


    if (
        value.includes("rejected")
    ) {

        return "status-rejected";

    }


    return "status-pending";

}


/*==================================================
        EVENT POSTER LIGHTBOX
==================================================*/

document.addEventListener(
    "click",
    function (e) {

        const poster =
            e.target.closest(
                ".event-poster-image"
            );

        if (!poster) {
            return;
        }

        /* IMPORTANT:
           Prevent browser from following any
           accidental link around the image.
        */
        e.preventDefault();
        e.stopPropagation();

        const posterURL =
            poster.dataset.poster ||
            poster.getAttribute("src");

        if (!posterURL) {
            return;
        }

        const lightbox =
            document.getElementById(
                "posterLightbox"
            );

        const lightboxImage =
            document.getElementById(
                "posterLightboxImage"
            );

        if (!lightbox || !lightboxImage) {

            console.error(
                "Poster lightbox elements not found."
            );

            return;

        }

        lightboxImage.src =
            posterURL;

        lightbox.classList.add(
            "show"
        );

        document.body.classList.add(
            "poster-open"
        );

    },
    true
);


/*==================================================
        CLOSE POSTER
==================================================*/

function closePosterLightbox() {

    const lightbox =
        document.getElementById(
            "posterLightbox"
        );

    const image =
        document.getElementById(
            "posterLightboxImage"
        );


    if (!lightbox) {
        return;
    }


    lightbox.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "poster-open"
    );


    if (image) {

        image.src = "";

    }

}


/*==================================================
        CLOSE BUTTON
==================================================*/

document.addEventListener(
    "click",
    function (e) {

        if (
            e.target.closest(
                "#posterLightboxClose"
            )
        ) {

            closePosterLightbox();

        }

    }
);


/*==================================================
        CLICK OUTSIDE IMAGE
==================================================*/

document.addEventListener(
    "click",
    function (e) {

        const lightbox =
            document.getElementById(
                "posterLightbox"
            );


        if (
            lightbox &&
            e.target === lightbox
        ) {

            closePosterLightbox();

        }

    }
);


/*==================================================
        ESC KEY
==================================================*/

document.addEventListener(
    "keydown",
    function (e) {

        if (e.key === "Escape") {

            closePosterLightbox();

        }

    }
);

/*==================================================
        GENERATE RIDE REGISTRATION PDF
==================================================*/

async function generateRegistrationPDF(
    registrationID
) {

    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        );


    if (!token) {

        throw new Error(
            "Admin session expired. Please login again."
        );

    }


    const response =
        await fetch(
            MEMBERS_API,
            {
                method: "POST",

                body:
                    new URLSearchParams({

                        action:
                            "GENERATE_RIDE_REGISTRATION_PDF",

                        token:
                            token,

                        data:
                            JSON.stringify({

                                registrationID:
                                    registrationID

                            })

                    })
            }
        );


    const result =
        await response.json();



    if (!result.success) {

        throw new Error(
            result.message ||
            "Unable to generate registration PDF."
        );

    }


    return result;

}

/*==================================================
        PDF BUTTON
==================================================*/

document.addEventListener(
    "click",
    async function (e) {

        const btn =
            e.target.closest(
                '[data-action="registration-pdf"]'
            );


        if (!btn) {
            return;
        }


        const registrationID =
            btn.dataset.id;


        if (!registrationID) {
            return;
        }


        const registration =
            allRideRegistrations.find(
                function (item) {

                    return String(
                        item["Registration ID"] || ""
                    ).trim()
                    ===
                    String(
                        registrationID
                    ).trim();

                }
            );


        if (!registration) {

            alert(
                "Registration not found."
            );

            return;

        }


        const confirmed =
            confirm(
                "Generate PDF for " +
                registrationID +
                "?\n\n" +
                "Member: " +
                (
                    registration["Full Name"] ||
                    "-"
                ) +
                "\nEvent: " +
                (
                    registration["Event Name"] ||
                    "-"
                )
            );


        if (!confirmed) {
            return;
        }


        btn.disabled = true;


        const originalHTML =
            btn.innerHTML;


        btn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> PDF...';


        try {

            const result =
                await generateRegistrationPDF(
                    registrationID
                );


            const downloadURL =
                result.data &&
                result.data.downloadURL;


            const pdfURL =
                result.data &&
                result.data.pdfURL;


            if (downloadURL) {

                window.open(
                    downloadURL,
                    "_blank"
                );

            }
            else if (pdfURL) {

                window.open(
                    pdfURL,
                    "_blank"
                );

            }
            else {

                throw new Error(
                    "PDF URL was not returned."
                );

            }

        }
        catch (error) {

            console.error(
                "REGISTRATION PDF ERROR:",
                error
            );


            alert(
                "Unable to generate PDF.\n\n" +
                error.message
            );

        }
        finally {

            btn.disabled = false;

            btn.innerHTML =
                originalHTML;

        }

    }
);
