const EVENTS_API_URL = 
"https://script.google.com/macros/s/AKfycbxcoPESR32V3Xl4yG4Mk59uv-0Pr1ZQ4yAHOHlmX2ljvQsNY3-71Gcpj5pwEICtditg9g/exec";

/*==========================================
        EVENTS ADMIN
==========================================*/

const API =
"https://script.google.com/macros/s/AKfycbxcoPESR32V3Xl4yG4Mk59uv-0Pr1ZQ4yAHOHlmX2ljvQsNY3-71Gcpj5pwEICtditg9g/exec";


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


        renderEvents(
            result.data || []
        );


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


            form.append(
                "action",
                "TOGGLE_STATUS"
            );


            form.append(
                "data",
                JSON.stringify({

                    eventID:
                        eventID

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


                console.log(
                    "Event data:",
                    eventData
                );


                const form =
                    new URLSearchParams();


                form.append(
                    "action",
                    "ADD_EVENT"
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

