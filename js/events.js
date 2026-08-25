const EVENTS_API =
"https://script.google.com/macros/s/AKfycbyvsQZcqyzXEfLnBmDRgOGjj4Jr2TXbNgkn3t9y2lE6wJZMLXbFDV5GKURkn4LiGzjmtA/exec";


const container =
    document.getElementById("eventsContainer");


/*==================================================
        LOAD EVENTS
==================================================*/

async function loadEvents() {

    try {

        const response =
            await fetch(
                EVENTS_API +
                "?action=GET_EVENTS"
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
            "Events API response:",
            result
        );


        /*
        ------------------------------------------
        HANDLE BOTH RESPONSE FORMATS

        Format 1:
        {
            success:true,
            data:[...]
        }

        Format 2:
        [...]
        ------------------------------------------
        */

        let events;


        if (
            result &&
            Array.isArray(result.data)
        ) {

            events =
                result.data;

        }

        else if (
            Array.isArray(result)
        ) {

            events =
                result;

        }

        else {

            throw new Error(
                result.message ||
                "Invalid events response."
            );

        }


        /*==================================================
                SHOW ACTIVE + UPCOMING EVENTS ONLY
        ==================================================*/

        const today = new Date();

        /*
            Remove time from today's date
            so today's events are still considered upcoming.
        */

        today.setHours(0, 0, 0, 0);


        events = events.filter(function (event) {

            /*------------------------------------------
                    CHECK STATUS
            ------------------------------------------*/

            const status =
                String(
                    event["Status"] || ""
                )
                .trim()
                .toLowerCase();


            if (status !== "active") {

                return false;

            }


            /*------------------------------------------
                    CHECK EVENT DATE
            ------------------------------------------*/

            const eventDate =
                new Date(
                    event["Date"]
                );


            if (
                isNaN(
                    eventDate.getTime()
                )
            ) {

                return false;

            }


            eventDate.setHours(
                0,
                0,
                0,
                0
            );


            /*------------------------------------------
                    FUTURE / TODAY ONLY
            ------------------------------------------*/

            return eventDate >= today;

        });


        /*==================================================
                NO ACTIVE EVENTS
        ==================================================*/

        if (events.length === 0) {

            container.innerHTML = `
                <div class="loading-events">
                    <i class="fa-solid fa-calendar-xmark"></i>

                    <p>
                        No Upcoming Events
                    </p>
                </div>
            `;

            return;

        }


        container.innerHTML = "";


        /*
        ------------------------------------------
                CREATE EVENT CARDS
        ------------------------------------------
        */

        for (
            const event of events
        ) {

            const date =
                new Date(
                    event["Date"]
                );


            const formattedDate =
                !isNaN(date.getTime())

                    ? date.toLocaleDateString(
                        "en-IN",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }
                    )

                    : event["Date"] || "";


            /*
            --------------------------------------
                    IMAGE
            --------------------------------------
            */

            let image = event["Image URL"];

            if (!image || image.trim() === "") {
                image = "assets/event-placeholder.jpg";
            }


            /*
            --------------------------------------
                    CREATE CARD
            --------------------------------------
            */

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "event-card";


            card.onclick =
                function () {

                    openPoster(image);

                };


            card.innerHTML = `

                <div class="event-image">

                    <img
                        src="${image}"
                        alt="${escapeHTML(
                            event["Event Name"] || ""
                        )}"
                    >

                    <div class="event-category">

                        ${escapeHTML(
                            event["Category"] || ""
                        )}

                    </div>

                </div>


                <div class="event-body">

                    <div class="event-date">

                        <i class="fa-solid fa-calendar-days"></i>

                        ${escapeHTML(
                            formattedDate
                        )}

                    </div>


                    <div class="event-title">

                        ${escapeHTML(
                            event["Event Name"] || ""
                        )}

                    </div>

                </div>

            `;


            container.appendChild(
                card
            );

        }

    }

    catch (error) {

        console.error(
            "Load Events Error:",
            error
        );


        container.innerHTML = `

            <div class="loading-events">

                Unable to load events.

            </div>

        `;

    }

}



/*==================================================
        POSTER ZOOM + PAN
==================================================*/

let posterZoom = 1;

let isDragging = false;

let startX = 0;
let startY = 0;

let translateX = 0;
let translateY = 0;


const posterModal =
    document.getElementById("posterModal");

const posterImage =
    document.getElementById("posterImage");


/*==================================================
        APPLY TRANSFORM
==================================================*/

function updatePosterTransform() {

    posterImage.style.transform =
        `translate(${translateX}px, ${translateY}px) scale(${posterZoom})`;

}


/*==================================================
        OPEN POSTER
==================================================*/

function openPoster(image) {

    posterImage.src = image;

    posterZoom = 1;

    translateX = 0;

    translateY = 0;

    posterImage.style.cursor =
        "zoom-in";

    updatePosterTransform();

    posterModal.style.display =
        "flex";

}


/*==================================================
        MOUSE WHEEL ZOOM
==================================================*/

posterImage.addEventListener(
    "wheel",
    function (e) {

        e.preventDefault();


        if (e.deltaY < 0) {

            posterZoom += 0.15;

        } else {

            posterZoom -= 0.15;

        }


        /* Minimum */

        if (posterZoom < 1) {

            posterZoom = 1;

            translateX = 0;

            translateY = 0;

        }


        /* Maximum */

        if (posterZoom > 4) {

            posterZoom = 4;

        }


        updatePosterTransform();


        posterImage.style.cursor =
            posterZoom > 1
                ? "grab"
                : "zoom-in";

    },
    {
        passive: false
    }
);


/*==================================================
        MOUSE DOWN - START PAN
==================================================*/

posterImage.addEventListener(
    "mousedown",
    function (e) {

        if (posterZoom <= 1) {

            return;

        }


        isDragging = true;


        startX =
            e.clientX - translateX;

        startY =
            e.clientY - translateY;


        posterImage.style.cursor =
            "grabbing";


        e.preventDefault();

    }
);


/*==================================================
        MOUSE MOVE - PAN
==================================================*/

document.addEventListener(
    "mousemove",
    function (e) {

        if (!isDragging) {

            return;

        }


        translateX =
            e.clientX - startX;

        translateY =
            e.clientY - startY;


        updatePosterTransform();

    }
);


/*==================================================
        MOUSE UP
==================================================*/

document.addEventListener(
    "mouseup",
    function () {

        if (!isDragging) {

            return;

        }


        isDragging = false;


        posterImage.style.cursor =
            posterZoom > 1
                ? "grab"
                : "zoom-in";

    }
);


/*==================================================
        DOUBLE CLICK - RESET
==================================================*/

posterImage.addEventListener(
    "dblclick",
    function () {

        posterZoom = 1;

        translateX = 0;

        translateY = 0;


        updatePosterTransform();


        posterImage.style.cursor =
            "zoom-in";

    }
);


/*==================================================
        CLOSE BUTTON
==================================================*/

document
    .querySelector(".close-poster")
    .onclick = function () {

        posterModal.style.display =
            "none";


        posterZoom = 1;

        translateX = 0;

        translateY = 0;

        updatePosterTransform();

    };


/*==================================================
        CLICK OUTSIDE
==================================================*/

posterModal.onclick =
    function (e) {

        if (
            e.target ===
            posterModal
        ) {

            posterModal.style.display =
                "none";


            posterZoom = 1;

            translateX = 0;

            translateY = 0;

            updatePosterTransform();

        }

    };


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
        START
==================================================*/

loadEvents();