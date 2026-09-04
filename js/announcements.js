/* =========================================================
   PUBLIC ANNOUNCEMENTS + SOCIAL LINKS
   ========================================================= */

const ANNOUNCEMENTS_API =
    "https://script.google.com/macros/s/AKfycbzQN8dVs044LgU80P9fE5FVq4lHpjZawzPyoM28rxlByC8KINOvyQwdMDjW7r4Q5flm/exec";


let publicAnnouncements = [];
let publicSocialLinks = [];

let tickerItems = [];
let currentAnnouncementIndex = 0;


/* =========================================================
   LOAD ANNOUNCEMENTS + SOCIAL LINKS
   ========================================================= */

async function loadPublicAnnouncements() {

    const ticker =
        document.getElementById(
            "announcementTicker"
        );

    if (!ticker) {
        return;
    }


    try {

        const [
            announcementResponse,
            socialResponse
        ] = await Promise.all([

            fetch(
                ANNOUNCEMENTS_API +
                "?action=GET_ANNOUNCEMENTS"
            ),

            fetch(
                ANNOUNCEMENTS_API +
                "?action=GET_SOCIAL_LINKS"
            )

        ]);


        if (!announcementResponse.ok) {
            throw new Error(
                "Announcement API request failed."
            );
        }


        if (!socialResponse.ok) {
            throw new Error(
                "Social Links API request failed."
            );
        }


        const announcementResult =
            await announcementResponse.json();

        const socialResult =
            await socialResponse.json();


        /* =====================================================
           VALIDATE ANNOUNCEMENTS
           ===================================================== */

        if (
            !announcementResult.success ||
            !Array.isArray(
                announcementResult.data
            )
        ) {
            throw new Error(
                "Invalid announcement response."
            );
        }


        /* =====================================================
           VALIDATE SOCIAL LINKS
           ===================================================== */

        if (
            !socialResult.success ||
            !Array.isArray(
                socialResult.data
            )
        ) {
            throw new Error(
                "Invalid social links response."
            );
        }


        publicAnnouncements =
            announcementResult.data;


        publicSocialLinks =
            socialResult.data.filter(
                function (item) {

                    return String(
                        item["Active"] || ""
                    )
                        .trim()
                        .toLowerCase() === "yes";

                }
            );


        /* =====================================================
           BUILD COMBINED TICKER
           ===================================================== */

        tickerItems = [

            /* Existing announcements */
            ...publicAnnouncements.map(
                function (item) {

                    return {
                        type: "announcement",
                        data: item
                    };

                }
            ),


            /* Active social links */
            ...publicSocialLinks.map(
                function (item) {

                    return {
                        type: "social",
                        data: item
                    };

                }
            )

        ];


        currentAnnouncementIndex = 0;


        renderAnnouncementTicker();

    }

    catch (error) {

        console.error(
            "Announcements / Social Links error:",
            error
        );


        ticker.innerHTML = `
            <span class="announcement-empty">
                No current announcements
            </span>
        `;

    }

}


/* =========================================================
   ESCAPE ATTRIBUTE
   ========================================================= */

function escapeAttribute(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


/* =========================================================
   RENDER TICKER
   ========================================================= */

function renderAnnouncementTicker() {

    const ticker =
        document.getElementById("announcementTicker");

    if (!ticker) {
        return;
    }

    if (tickerItems.length === 0) {

        ticker.innerHTML = `
            <span class="announcement-empty">
                Welcome to Sherpas of South India
            </span>
        `;

        return;
    }


    /* =====================================================
       CREATE ONE SEQUENCE
       ===================================================== */

    const itemsHTML =
        tickerItems
            .map(function (tickerItem) {

                const item = tickerItem.data;


                /* =================================================
                   ANNOUNCEMENT
                   ================================================= */

                if (tickerItem.type === "announcement") {

                    return `
                        <span class="announcement-item">

                            <span class="announcement-dot">
                                ●
                            </span>

                            <strong>
                                ${escapeHTML(
                                    item["Title"] || ""
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    item["Message"] || ""
                                )}
                            </span>

                        </span>
                    `;
                }


                /* =================================================
                   SOCIAL LINK
                   ================================================= */

                if (tickerItem.type === "social") {

                    const url =
                        item["URL"] || "";

                    const platform =
                        item["Platform"] || "";

                    const title =
                        item["Title"] || "";

                    const description =
                        item["Description"] || "";


                    return `
                        <a
                            class="announcement-item social-ticker-item"
                            href="${escapeAttribute(url)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >

                            <span class="announcement-dot">
                                ●
                            </span>

                            <strong>
                                ${escapeHTML(platform)}
                            </strong>

                            <span>
                                ${escapeHTML(title)}
                            </span>

                            ${
                                description
                                    ? `
                                        <span>
                                            -
                                            ${escapeHTML(description)}
                                        </span>
                                      `
                                    : ""
                            }

                        </a>
                    `;
                }


                return "";

            })
            .join("");


    /* =====================================================
       TWO IDENTICAL SEQUENCES
       This removes the gap between cycles.
       ===================================================== */

    ticker.innerHTML = `
        <div class="ticker-track">

            <div class="ticker-sequence">
                ${itemsHTML}
            </div>

            <div
                class="ticker-sequence"
                aria-hidden="true"
            >
                ${itemsHTML}
            </div>

        </div>
    `;

}

/* =========================================================
   PREVIOUS
   ========================================================= */

function showPreviousAnnouncement() {

    if (!tickerItems.length) {
        return;
    }


    currentAnnouncementIndex--;


    if (
        currentAnnouncementIndex < 0
    ) {

        currentAnnouncementIndex =
            tickerItems.length - 1;

    }


    showSingleAnnouncement();

}


/* =========================================================
   NEXT
   ========================================================= */

function showNextAnnouncement() {

    if (!tickerItems.length) {
        return;
    }


    currentAnnouncementIndex++;


    if (
        currentAnnouncementIndex >=
        tickerItems.length
    ) {

        currentAnnouncementIndex = 0;

    }


    showSingleAnnouncement();

}


/* =========================================================
   SHOW ONE TICKER ITEM
   ========================================================= */

function showSingleAnnouncement() {

    const ticker =
        document.getElementById(
            "announcementTicker"
        );

    if (!ticker) {
        return;
    }


    const tickerItem =
        tickerItems[
            currentAnnouncementIndex
        ];


    if (!tickerItem) {
        return;
    }


    const item =
        tickerItem.data;


    /* =====================================================
       ANNOUNCEMENT
       ===================================================== */

    if (
        tickerItem.type ===
        "announcement"
    ) {

        ticker.innerHTML = `

            <span
                class="announcement-item"
            >

                <span
                    class="announcement-dot"
                >
                    ●
                </span>

                <strong>
                    ${escapeHTML(
                        item["Title"] || ""
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        item["Message"] || ""
                    )}
                </span>

            </span>

        `;

    }


    /* =================================================
    SOCIAL LINK
    ================================================= */

    if (tickerItem.type === "social") {

        const url =
            item["URL"] || "";

        const platform =
            item["Platform"] || "";

        const title =
            item["Title"] || "";

        const description =
            item["Description"] || "";


        /* Platform icon */

        let platformIcon =
            '<i class="fa-solid fa-link"></i>';

        const platformLower =
            String(platform).toLowerCase();


        if (platformLower.includes("youtube")) {

            platformIcon =
                '<i class="fa-brands fa-youtube social-platform-icon youtube-icon"></i>';

        }
        else if (platformLower.includes("instagram")) {

            platformIcon =
                '<i class="fa-brands fa-instagram social-platform-icon instagram-icon"></i>';

        }
        else if (platformLower.includes("facebook")) {

            platformIcon =
                '<i class="fa-brands fa-facebook social-platform-icon facebook-icon"></i>';

        }
        else if (platformLower.includes("whatsapp")) {

            platformIcon =
                '<i class="fa-brands fa-whatsapp social-platform-icon whatsapp-icon"></i>';

        }


        return `
            <a
                class="announcement-item social-ticker-item"
                href="${escapeAttribute(url)}"
                target="_blank"
                rel="noopener noreferrer"
                title="Open ${escapeAttribute(platform)}"
            >

                <span class="announcement-dot">
                    ●
                </span>


                <span class="social-platform">

                    ${platformIcon}

                    <strong>
                        ${escapeHTML(platform)}
                    </strong>

                </span>


                <span class="social-ticker-title">
                    ${escapeHTML(title)}
                </span>


                ${
                    description
                        ? `
                            <span class="social-ticker-description">
                                -
                                ${escapeHTML(description)}
                            </span>
                        `
                        : ""
                }


                <i
                    class="fa-solid fa-arrow-up-right-from-square social-external-icon"
                    aria-hidden="true"
                ></i>

            </a>
        `;
    }


    /*
        Stop current animation when
        Previous / Next is clicked.
    */

    ticker.style.animation = "none";

}


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadPublicAnnouncements();


        const previousButton =
            document.getElementById(
                "announcementPrev"
            );


        const nextButton =
            document.getElementById(
                "announcementNext"
            );


        if (previousButton) {

            previousButton.addEventListener(
                "click",
                showPreviousAnnouncement
            );

        }


        if (nextButton) {

            nextButton.addEventListener(
                "click",
                showNextAnnouncement
            );

        }

    }
);

