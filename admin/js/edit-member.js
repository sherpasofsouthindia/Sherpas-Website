/*==================================================
        EVENTS ADMIN
==================================================*/


/*==================================================
        EVENTS API URL
==================================================*/

const API =
"https://script.google.com/macros/s/AKfycbyTrfXWeKUONXzdOppsE_a3oF8o98u7yjTC1ixc2hoE7zgmks0smIGIF7uaI4ZD2Vc0Bw/exec";


/*==================================================
        DOM ELEMENTS
==================================================*/

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

const eventForm =
document.getElementById("eventForm");

const eventsTable =
document.getElementById("eventsTable");


/*==================================================
        OPEN MODAL
==================================================*/

addBtn.onclick = function () {

    modal.classList.add("show");

};


/*==================================================
        CLOSE MODAL
==================================================*/

closeBtn.onclick = function () {

    modal.classList.remove("show");

};


/*==================================================
        CLOSE WHEN CLICK OUTSIDE
==================================================*/

window.onclick = function (e) {

    if (e.target === modal) {

        modal.classList.remove("show");

    }

};


/*==================================================
        POSTER PREVIEW
==================================================*/

poster.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];

        if (!file) {

            preview.src = "";
            preview.style.display = "none";

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


/*==================================================
        FILE TO BASE64
==================================================*/

function fileToBase64(file) {

    return new Promise(
        function (resolve, reject) {

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


/*==================================================
        LOAD EVENTS
==================================================*/

async function loadEvents() {

    console.log(
        "Loading events..."
    );

    eventsTable.innerHTML = `
        <div style="
            padding:30px;
            text-align:center;
            color:#cbd5e1;
        ">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading events...
        </div>
    `;


    try {

        /*
         * Use POST exactly like
         * the working Membership system.
         */

        const formData =
            new URLSearchParams();

        formData.append(
            "action",
            "GET_EVENTS"
        );

        const response =
            await fetch(API, {

                method: "POST",

                body: formData

            });


        console.log(
            "GET EVENTS STATUS:",
            response.status
        );


        const text =
            await response.text();


        console.log(
            "GET EVENTS RESPONSE:",
            text
        );


        let result;

        try {

            result =
                JSON.parse(text);

        }
        catch (parseError) {

            console.error(
                "Invalid JSON:",
                text
            );

            throw new Error(
                "Server returned invalid JSON."
            );

        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Failed to load events."
            );

        }


        const events =
            result.data || [];


        console.log(
            "EVENTS:",
            events
        );


        renderEvents(events);


    }
    catch (error) {

        console.error(
            "LOAD EVENTS ERROR:",
            error
        );


        eventsTable.innerHTML = `

            <div style="
                padding:30px;
                color:#f87171;
            ">

                <strong>
                    Failed to load events.
                </strong>

                <br><br>

                ${error.message}

            </div>

        `;

    }

}


/*==================================================
        RENDER EVENTS
==================================================*/

function renderEvents(events) {

    eventsTable.innerHTML = "";


    if (!events.length) {

        eventsTable.innerHTML = `

            <div style="
                padding:30px;
                text-align:center;
                color:#94a3b8;
            ">

                No events found.

            </div>

        `;

        return;

    }


    events.forEach(
        function (event) {

            const imageURL =
                event["Image URL"] ||
                "../assets/event-placeholder.jpg";


            const status =
                String(
                    event["Status"] || "Inactive"
                );


            const statusClass =
                status === "Active"
                    ? "active"
                    : "inactive";


            const statusIcon =
                status === "Active"

                    ? '<i class="fa-solid fa-eye-slash"></i>'

                    : '<i class="fa-solid fa-eye"></i>';


            let eventDate = "";

            if (event["Date"]) {

                const date =
                    new Date(
                        event["Date"]
                    );

                if (!isNaN(date)) {

                    eventDate =
                        date.toLocaleDateString(
                            "en-GB",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        );

                }

            }


            const row =
                document.createElement("div");

            row.className =
                "event-row";


            row.innerHTML = `

                <div>

                    <img
                        src="${imageURL}"
                        alt="Event Poster"
                        onerror="
                            this.src='../assets/event-placeholder.jpg';
                        "
                    >

                </div>


                <div class="event-title">

                    ${escapeHTML(
                        event["Event Name"] || ""
                    )}

                </div>


                <div class="event-date">

                    ${eventDate}

                </div>


                <div>

                    <span class="
                        status
                        ${statusClass}
                    ">

                        ${status}

                    </span>

                </div>


                <div class="actions">

                    <button
                        type="button"
                        class="edit-btn"
                        data-id="${event["Event ID"] || ""}"
                        title="Edit Event"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        type="button"
                        class="status-btn"
                        data-id="${event["Event ID"] || ""}"
                        title="Change Status"
                    >

                        ${statusIcon}

                    </button>

                </div>

            `;


            eventsTable.appendChild(row);

        }
    );

}


/*==================================================
        HTML ESCAPE
==================================================*/

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


/*==================================================
        SEARCH EVENTS
==================================================*/

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


/*==================================================
        TOGGLE STATUS
==================================================*/

document.addEventListener(
    "click",
    async function (e) {

        const btn =
            e.target.closest(
                ".status-btn"
            );

        if (!btn) return;


        const eventID =
            btn.dataset.id;


        if (!eventID) {

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Event ID not found."
            });

            return;

        }


        btn.disabled = true;


        try {

            const formData =
                new URLSearchParams();


            formData.append(
                "action",
                "TOGGLE_STATUS"
            );


            formData.append(
                "data",
                JSON.stringify({

                    eventID: eventID

                })
            );


            const response =
                await fetch(API, {

                    method: "POST",

                    body: formData

                });


            const text =
                await response.text();


            console.log(
                "TOGGLE RESPONSE:",
                text
            );


            const result =
                JSON.parse(text);


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "Unable to change status."
                );

            }


            await loadEvents();


        }
        catch (error) {

            console.error(
                "TOGGLE STATUS ERROR:",
                error
            );


            Swal.fire({

                icon: "error",

                title: "Status Update Failed",

                text: error.message

            });

        }
        finally {

            btn.disabled = false;

        }

    }
);


/*==================================================
        ADD EVENT
==================================================*/

eventForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        const file =
            poster.files[0];


        let base64 = "";


        /*------------------------------------------
                POSTER OPTIONAL
        ------------------------------------------*/

        if (file) {

            base64 =
                await fileToBase64(file);

        }


        /*------------------------------------------
                PREPARE DATA
        ------------------------------------------*/

        const data = {

            name:
                document
                    .getElementById(
                        "eventName"
                    )
                    .value
                    .trim(),


            category:
                document
                    .getElementById(
                        "eventCategory"
                    )
                    .value,


            date:
                document
                    .getElementById(
                        "eventDate"
                    )
                    .value,


            time:
                document
                    .getElementById(
                        "eventTime"
                    )
                    .value,


            location:
                document
                    .getElementById(
                        "eventLocation"
                    )
                    .value
                    .trim(),


            description:
                document
                    .getElementById(
                        "eventDescription"
                    )
                    .value
                    .trim(),


            image:
                base64,


            link:
                document
                    .getElementById(
                        "registrationLink"
                    )
                    .value
                    .trim()

        };


        console.log(
            "EVENT DATA:",
            data
        );


        /*------------------------------------------
                BASIC VALIDATION
        ------------------------------------------*/

        if (!data.name) {

            Swal.fire({
                icon: "warning",
                title: "Event Name Required"
            });

            return;

        }


        if (!data.date) {

            Swal.fire({
                icon: "warning",
                title: "Event Date Required"
            });

            return;

        }


        if (!data.time) {

            Swal.fire({
                icon: "warning",
                title: "Event Time Required"
            });

            return;

        }


        if (!data.location) {

            Swal.fire({
                icon: "warning",
                title: "Location Required"
            });

            return;

        }


        /*------------------------------------------
                SHOW LOADING
        ------------------------------------------*/

        Swal.fire({

            title: "Saving Event",

            text: "Please wait...",

            allowOutsideClick: false,

            allowEscapeKey: false,

            didOpen: function () {

                Swal.showLoading();

            }

        });


        try {

            const formData =
                new URLSearchParams();


            formData.append(
                "action",
                "ADD_EVENT"
            );


            formData.append(
                "data",
                JSON.stringify(data)
            );


            console.log(
                "Sending event to Apps Script..."
            );


            const response =
                await fetch(API, {

                    method: "POST",

                    body: formData

                });


            console.log(
                "ADD EVENT STATUS:",
                response.status
            );


            const text =
                await response.text();


            console.log(
                "ADD EVENT RESPONSE:",
                text
            );


            let result;


            try {

                result =
                    JSON.parse(text);

            }
            catch (parseError) {

                throw new Error(
                    "Server returned invalid JSON:\n\n" +
                    text
                );

            }


            if (!result.success) {

                throw new Error(
                    result.message ||
                    result.error ||
                    "Event could not be added."
                );

            }


            Swal.fire({

                icon: "success",

                title: "Event Added Successfully",

                text:
                    result.message ||
                    "Event has been added."

            });


            /*--------------------------------------
                    CLOSE MODAL
            --------------------------------------*/

            modal.classList.remove(
                "show"
            );


            /*--------------------------------------
                    RESET FORM
            --------------------------------------*/

            eventForm.reset();


            preview.src = "";

            preview.style.display =
                "none";


            /*--------------------------------------
                    RELOAD EVENTS
            --------------------------------------*/

            loadEvents();


        }
        catch (error) {

            console.error(
                "ADD EVENT ERROR:",
                error
            );


            Swal.fire({

                icon: "error",

                title: "Event Upload Failed",

                text: error.message

            });

        }

    }
);


/*==================================================
        INITIAL LOAD
==================================================*/

loadEvents();