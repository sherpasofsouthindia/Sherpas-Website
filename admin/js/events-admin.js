const EVENTS_API_URL = 
"https://script.google.com/macros/s/AKfycbyvsQZcqyzXEfLnBmDRgOGjj4Jr2TXbNgkn3t9y2lE6wJZMLXbFDV5GKURkn4LiGzjmtA/exec";

/*==========================================
        EVENTS ADMIN
==========================================*/

const API =
"https://script.google.com/macros/s/AKfycbyvsQZcqyzXEfLnBmDRgOGjj4Jr2TXbNgkn3t9y2lE6wJZMLXbFDV5GKURkn4LiGzjmtA/exec";


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
    let allEvents = [];
    let editingEventID = null;


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


        console.log(
            "Events API response:",
            result
        );


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


            console.log(
                "TOGGLE response:",
                text
            );


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


                console.log(
                    "Event data:",
                    eventData
                );


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


                console.log(
                    "ADD_EVENT response:",
                    text
                );


                const result =
                    JSON.parse(text);


                if (!result.success) {

                    throw new Error(

                        result.message ||
                        result.error ||
                        "Event could not be added."

                    );

                }


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


document.addEventListener("DOMContentLoaded", function () {

    loadEvents();

});

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


            console.log(
                "DELETE_EVENT response:",
                text
            );


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


