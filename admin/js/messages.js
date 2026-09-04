/* =========================================================
   SHERPAS ADMIN - MESSAGES / ANNOUNCEMENTS
========================================================= */


/* ---------------------------------------------------------
   USE THE SAME APPS SCRIPT WEB APP URL
   YOU USED TO TEST GET_ANNOUNCEMENTS
--------------------------------------------------------- */

const MESSAGES_API =
    "https://script.google.com/macros/s/AKfycbzQN8dVs044LgU80P9fE5FVq4lHpjZawzPyoM28rxlByC8KINOvyQwdMDjW7r4Q5flm/exec";


let announcements = [];


/* =========================================================
   DOM
========================================================= */

const announcementList =
    document.getElementById(
        "announcementList"
    );


const announcementModal =
    document.getElementById(
        "announcementModal"
    );


const announcementForm =
    document.getElementById(
        "announcementForm"
    );


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value || "")

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


/* =========================================================
   LOAD
========================================================= */

async function loadAnnouncements() {

    try {

        announcementList.innerHTML = `

            <div class="announcement-loading">

                <i class="fa-solid fa-spinner fa-spin"></i>

                Loading announcements...

            </div>

        `;


        const token =
            sessionStorage.getItem(
                "sherpas_admin_token"
            ) || "";


        const response =
            await fetch(
                MESSAGES_API +
                "?action=GET_ANNOUNCEMENTS" +
                "&token=" +
                encodeURIComponent(token)
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load announcements."
            );

        }


        const result =
            await response.json();


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to load announcements."
            );

        }


        announcements =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        updateAnnouncementStats();

        renderAnnouncements();

    }
    catch (error) {

        console.error(
            "LOAD ANNOUNCEMENTS ERROR:",
            error
        );


        announcementList.innerHTML = `

            <div class="announcement-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <br><br>

                Unable to load announcements.

                <br>

                ${escapeHTML(
                    error.message
                )}

            </div>

        `;

    }

}


/* =========================================================
   STATS
========================================================= */

function updateAnnouncementStats() {

    const totalElement =
        document.getElementById(
            "totalAnnouncements"
        );


    const activeElement =
        document.getElementById(
            "activeAnnouncements"
        );


    const scrollingElement =
        document.getElementById(
            "scrollingAnnouncements"
        );


    const activeCount =
        announcements.filter(
            function(item) {

                return String(
                    item["Active"] || ""
                )
                    .trim()
                    .toLowerCase()
                    === "yes";

            }
        ).length;


    const scrollingCount =
        announcements.filter(
            function(item) {

                return String(
                    item["Scrolling"] || ""
                )
                    .trim()
                    .toLowerCase()
                    === "yes";

            }
        ).length;


    if (totalElement) {

        totalElement.textContent =
            announcements.length;

    }


    if (activeElement) {

        activeElement.textContent =
            activeCount;

    }


    if (scrollingElement) {

        scrollingElement.textContent =
            scrollingCount;

    }

}


/* =========================================================
   RENDER
========================================================= */

function renderAnnouncements(
    filterText = ""
) {

    const search =
        String(
            filterText
        )
            .toLowerCase()
            .trim();


    const filtered =
        announcements.filter(
            function(item) {

                const text =
                    [

                        item["Title"],

                        item["Message"],

                        item["Type"],

                        item["Announcement ID"]

                    ]
                        .join(" ")
                        .toLowerCase();


                return text.includes(
                    search
                );

            }
        );


    if (
        filtered.length === 0
    ) {

        announcementList.innerHTML = `

            <div class="announcement-empty">

                <i class="fa-solid fa-bullhorn"></i>

                <br><br>

                No announcements found.

            </div>

        `;

        return;

    }


    announcementList.innerHTML =
        filtered.map(
            function(item) {

                const id =
                    String(
                        item["Announcement ID"] || ""
                    );


                const title =
                    String(
                        item["Title"] || ""
                    );


                const message =
                    String(
                        item["Message"] || ""
                    );


                const type =
                    String(
                        item["Type"] ||
                        "Announcement"
                    );


                const priority =
                    String(
                        item["Priority"] ||
                        "1"
                    );


                const active =
                    String(
                        item["Active"] || ""
                    )
                        .trim()
                        .toLowerCase()
                        === "yes";


                const scrolling =
                    String(
                        item["Scrolling"] || ""
                    )
                        .trim()
                        .toLowerCase()
                        === "yes";


                let priorityClass =
                    "";


                let priorityText =
                    "Normal";


                if (
                    priority === "3"
                ) {

                    priorityClass =
                        "priority-high";

                    priorityText =
                        "High";

                }
                else if (
                    priority === "2"
                ) {

                    priorityClass =
                        "priority-important";

                    priorityText =
                        "Important";

                }


                return `

                    <article
                        class="announcement-card"
                    >

                        <div
                            class="announcement-card-top"
                        >

                            <div>

                                <div
                                    class="announcement-card-title"
                                >
                                    ${escapeHTML(
                                        title
                                    )}
                                </div>


                                <div
                                    class="announcement-card-message"
                                >
                                    ${escapeHTML(
                                        message
                                    )}
                                </div>


                                <div
                                    class="announcement-meta"
                                >

                                    <span>
                                        <i class="fa-solid fa-tag"></i>

                                        ${escapeHTML(
                                            type
                                        )}

                                    </span>


                                    <span
                                        class="${priorityClass}"
                                    >
                                        <i class="fa-solid fa-flag"></i>

                                        ${priorityText}

                                    </span>


                                    <span
                                        class="${
                                            active
                                                ? "active"
                                                : "inactive"
                                        }"
                                    >

                                        <i
                                            class="fa-solid ${
                                                active
                                                    ? "fa-circle-check"
                                                    : "fa-circle-xmark"
                                            }"
                                        ></i>

                                        ${
                                            active
                                                ? "Active"
                                                : "Inactive"
                                        }

                                    </span>


                                    ${
                                        scrolling
                                            ? `
                                                <span>

                                                    <i class="fa-solid fa-arrows-left-right"></i>

                                                    Scrolling

                                                </span>
                                            `
                                            : ""
                                    }


                                    ${
                                        item["Start Date"]
                                        ? `
                                            <span>

                                                <i class="fa-regular fa-calendar"></i>

                                                ${escapeHTML(
                                                    item["Start Date"]
                                                )}

                                            </span>
                                        `
                                        : ""
                                    }


                                    ${
                                        item["End Date"]
                                        ? `
                                            <span>

                                                →

                                                ${escapeHTML(
                                                    item["End Date"]
                                                )}

                                            </span>
                                        `
                                        : ""
                                    }

                                </div>

                            </div>

                        </div>


                        <div
                            class="announcement-card-actions"
                        >

                            <button
                                type="button"
                                class="announcement-action edit"
                                data-action="edit"
                                data-id="${escapeHTML(id)}"
                            >

                                <i class="fa-solid fa-pen"></i>

                                Edit

                            </button>


                            <button
                                type="button"
                                class="announcement-action toggle"
                                data-action="toggle"
                                data-id="${escapeHTML(id)}"
                            >

                                <i class="fa-solid ${
                                    active
                                        ? "fa-eye-slash"
                                        : "fa-eye"
                                }"></i>

                                ${
                                    active
                                        ? "Disable"
                                        : "Enable"
                                }

                            </button>


                            <button
                                type="button"
                                class="announcement-action delete"
                                data-action="delete"
                                data-id="${escapeHTML(id)}"
                            >

                                <i class="fa-solid fa-trash"></i>

                                Delete

                            </button>

                        </div>

                    </article>

                `;

            }
        ).join("");

}


/* =========================================================
   OPEN MODAL
========================================================= */

function openAnnouncementModal(
    item = null
) {

    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    if (!item) {

        announcementForm.reset();


        document.getElementById(
            "announcementID"
        ).value = "";


        document.getElementById(
            "announcementScrolling"
        ).checked = true;


        document.getElementById(
            "announcementActive"
        ).value = "Yes";


        modalTitle.innerHTML = `

            <i class="fa-solid fa-bullhorn"></i>

            New Announcement

        `;

    }
    else {

        document.getElementById(
            "announcementID"
        ).value =
            item["Announcement ID"] || "";


        document.getElementById(
            "announcementTitle"
        ).value =
            item["Title"] || "";


        document.getElementById(
            "announcementMessage"
        ).value =
            item["Message"] || "";


        document.getElementById(
            "announcementType"
        ).value =
            item["Type"] ||
            "Announcement";


        document.getElementById(
            "announcementPriority"
        ).value =
            item["Priority"] ||
            "1";


        document.getElementById(
            "announcementActive"
        ).value =
            String(
                item["Active"] ||
                "Yes"
            );


        document.getElementById(
            "announcementStartDate"
        ).value =
            item["Start Date"] || "";


        document.getElementById(
            "announcementEndDate"
        ).value =
            item["End Date"] || "";


        document.getElementById(
            "announcementScrolling"
        ).checked =
            String(
                item["Scrolling"] ||
                ""
            )
                .toLowerCase()
                === "yes";


        modalTitle.innerHTML = `

            <i class="fa-solid fa-pen"></i>

            Edit Announcement

        `;

    }


    announcementModal.classList.remove(
        "hidden"
    );

    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeAnnouncementModal() {

    announcementModal.classList.add(
        "hidden"
    );

    document.body.style.overflow =
        "";

}


/* =========================================================
   SAVE
========================================================= */

async function saveAnnouncement(
    event
) {

    event.preventDefault();


    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        ) || "";


    if (!token) {

        Swal.fire(
            "Session expired",
            "Please login again.",
            "error"
        );

        return;

    }


    const announcementID =
        document.getElementById(
            "announcementID"
        ).value.trim();


    const title =
        document.getElementById(
            "announcementTitle"
        ).value.trim();


    const message =
        document.getElementById(
            "announcementMessage"
        ).value.trim();


    const type =
        document.getElementById(
            "announcementType"
        ).value;


    const priority =
        document.getElementById(
            "announcementPriority"
        ).value;


    const active =
        document.getElementById(
            "announcementActive"
        ).value;


    const startDate =
        document.getElementById(
            "announcementStartDate"
        ).value;


    const endDate =
        document.getElementById(
            "announcementEndDate"
        ).value;


    const scrolling =
        document.getElementById(
            "announcementScrolling"
        ).checked;


    if (!title) {

        Swal.fire(
            "Title required",
            "Please enter an announcement title.",
            "warning"
        );

        return;

    }


    if (!message) {

        Swal.fire(
            "Message required",
            "Please enter the announcement message.",
            "warning"
        );

        return;

    }


    if (
        startDate &&
        endDate &&
        startDate > endDate
    ) {

        Swal.fire(
            "Invalid dates",
            "End date cannot be before start date.",
            "warning"
        );

        return;

    }


    const isEdit =
        Boolean(
            announcementID
        );


    const action =
        isEdit
            ? "UPDATE_ANNOUNCEMENT"
            : "ADD_ANNOUNCEMENT";


    const button =
        document.getElementById(
            "saveAnnouncementBtn"
        );


    const originalHTML =
        button.innerHTML;


    button.disabled = true;

    button.innerHTML = `

        <i class="fa-solid fa-spinner fa-spin"></i>

        Saving...

    `;


    try {

        const form =
            new URLSearchParams();


        form.append(
            "action",
            action
        );


        form.append(
            "token",
            token
        );


        form.append(
            "data",
            JSON.stringify({

                announcementID,

                title,

                message,

                type,

                priority,

                startDate,

                endDate,

                scrolling,

                active:
                    active === "Yes",

                createdBy:
                    sessionStorage.getItem(
                        "sherpas_admin_email"
                    ) || "Admin"

            })
        );


        const response =
            await fetch(
                MESSAGES_API,
                {
                    method: "POST",
                    body: form
                }
            );


        const result =
            await response.json();



        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to save announcement."
            );

        }


        closeAnnouncementModal();


        await loadAnnouncements();


        Swal.fire({

            icon: "success",

            title:
                isEdit
                    ? "Announcement Updated"
                    : "Announcement Added",

            text:
                isEdit
                    ? "The announcement has been updated."
                    : "The announcement has been added.",

            timer: 1800,

            showConfirmButton: false

        });

    }
    catch (error) {

        console.error(
            "SAVE ANNOUNCEMENT ERROR:",
            error
        );


        Swal.fire(
            "Save failed",
            error.message,
            "error"
        );

    }
    finally {

        button.disabled = false;

        button.innerHTML =
            originalHTML;

    }

}


/* =========================================================
   TOGGLE ACTIVE
========================================================= */

async function toggleAnnouncement(
    id
) {

    const item =
        announcements.find(
            function(item) {

                return String(
                    item["Announcement ID"] || ""
                ).trim()
                ===
                String(id).trim();

            }
        );


    if (!item) {
        return;
    }


    const currentlyActive =
        String(
            item["Active"] || ""
        )
            .trim()
            .toLowerCase()
            === "yes";


    const nextState =
        !currentlyActive;


    const confirmed =
        await Swal.fire({

            icon: "question",

            title:
                nextState
                    ? "Enable announcement?"
                    : "Disable announcement?",

            text:
                item["Title"] || "",

            showCancelButton: true,

            confirmButtonText:
                nextState
                    ? "Enable"
                    : "Disable"

        });


    if (
        !confirmed.isConfirmed
    ) {
        return;
    }


    await updateAnnouncementStatus(
        id,
        nextState
            ? "Yes"
            : "No"
    );

}


/* =========================================================
   UPDATE ACTIVE ONLY
========================================================= */

async function updateAnnouncementStatus(
    id,
    activeValue
) {

    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        ) || "";


    try {

        const form =
            new URLSearchParams();


        form.append(
            "action",
            "UPDATE_ANNOUNCEMENT"
        );


        form.append(
            "token",
            token
        );


        const item =
            announcements.find(
                function(item) {

                    return String(
                        item["Announcement ID"] || ""
                    ).trim()
                    ===
                    String(id).trim();

                }
            );


        if (!item) {
            return;
        }


        form.append(
            "data",
            JSON.stringify({

                announcementID:
                    id,

                title:
                    item["Title"] || "",

                message:
                    item["Message"] || "",

                type:
                    item["Type"] ||
                    "Announcement",

                priority:
                    item["Priority"] ||
                    "1",

                startDate:
                    item["Start Date"] ||
                    "",

                endDate:
                    item["End Date"] ||
                    "",

                scrolling:
                    String(
                        item["Scrolling"] ||
                        ""
                    )
                        .toLowerCase()
                        === "yes",

                active:
                    activeValue === "Yes"

            })
        );


        const response =
            await fetch(
                MESSAGES_API,
                {
                    method: "POST",
                    body: form
                }
            );


        const result =
            await response.json();


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to update announcement."
            );

        }


        await loadAnnouncements();

    }
    catch (error) {

        console.error(
            "TOGGLE ANNOUNCEMENT ERROR:",
            error
        );


        Swal.fire(
            "Update failed",
            error.message,
            "error"
        );

    }

}


/* =========================================================
   DELETE
========================================================= */

async function deleteAnnouncement(
    id
) {

    const item =
        announcements.find(
            function(item) {

                return String(
                    item["Announcement ID"] || ""
                ).trim()
                ===
                String(id).trim();

            }
        );


    if (!item) {
        return;
    }


    const confirmed =
        await Swal.fire({

            icon: "warning",

            title:
                "Delete announcement?",

            text:
                item["Title"] ||
                "This announcement will be permanently deleted.",

            showCancelButton: true,

            confirmButtonText:
                "Delete",

            confirmButtonColor:
                "#dc2626"

        });


    if (
        !confirmed.isConfirmed
    ) {
        return;
    }


    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        ) || "";


    try {

        const form =
            new URLSearchParams();


        form.append(
            "action",
            "DELETE_ANNOUNCEMENT"
        );


        form.append(
            "token",
            token
        );


        form.append(
            "data",
            JSON.stringify({

                announcementID:
                    id

            })
        );


        const response =
            await fetch(
                MESSAGES_API,
                {
                    method: "POST",
                    body: form
                }
            );


        const result =
            await response.json();


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Unable to delete announcement."
            );

        }


        await loadAnnouncements();


        Swal.fire({

            icon: "success",

            title:
                "Deleted",

            text:
                "Announcement deleted successfully.",

            timer: 1500,

            showConfirmButton: false

        });

    }
    catch (error) {

        console.error(
            "DELETE ANNOUNCEMENT ERROR:",
            error
        );


        Swal.fire(
            "Delete failed",
            error.message,
            "error"
        );

    }

}


/* =========================================================
   CLICK EVENTS
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const actionButton =
            event.target.closest(
                ".announcement-action"
            );


        if (!actionButton) {
            return;
        }


        const action =
            actionButton.dataset.action;


        const id =
            actionButton.dataset.id;


        const item =
            announcements.find(
                function(item) {

                    return String(
                        item["Announcement ID"] || ""
                    ).trim()
                    ===
                    String(id).trim();

                }
            );


        if (action === "edit") {

            openAnnouncementModal(
                item
            );

        }


        if (action === "toggle") {

            toggleAnnouncement(
                id
            );

        }


        if (action === "delete") {

            deleteAnnouncement(
                id
            );

        }

    }
);


/* =========================================================
   SEARCH
========================================================= */

const announcementSearch =
    document.getElementById(
        "announcementSearch"
    );


if (announcementSearch) {

    announcementSearch.addEventListener(
        "input",
        function() {

            renderAnnouncements(
                this.value
            );

        }
    );

}


/* =========================================================
   NEW
========================================================= */

document.getElementById(
    "addAnnouncementBtn"
).addEventListener(
    "click",
    function() {

        openAnnouncementModal();

    }
);


/* =========================================================
   CLOSE BUTTONS
========================================================= */

document.getElementById(
    "closeAnnouncementModal"
).addEventListener(
    "click",
    closeAnnouncementModal
);


document.getElementById(
    "cancelAnnouncementBtn"
).addEventListener(
    "click",
    closeAnnouncementModal
);


document.querySelector(
    ".message-modal-overlay"
).addEventListener(
    "click",
    closeAnnouncementModal
);


/* =========================================================
   FORM
========================================================= */

announcementForm.addEventListener(
    "submit",
    saveAnnouncement
);


/* =========================================================
   TABS
========================================================= */

document
    .querySelectorAll(
        ".message-tab"
    )
    .forEach(
        function(tab) {

            tab.addEventListener(
                "click",
                function() {

                    const targetID =
                        this.dataset.tab;


                    document
                        .querySelectorAll(
                            ".message-tab"
                        )
                        .forEach(
                            function(item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    document
                        .querySelectorAll(
                            ".message-panel"
                        )
                        .forEach(
                            function(panel) {

                                panel.classList.remove(
                                    "active"
                                );

                            }
                        );


                    this.classList.add(
                        "active"
                    );


                    const target =
                        document.getElementById(
                            targetID
                        );


                    if (target) {

                        target.classList.add(
                            "active"
                        );

                    }

                }
            );

        }
    );


/* =========================================================
   INITIAL LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadAnnouncements();

    }
);

/* =========================================================
   SOCIAL LINKS MANAGEMENT
========================================================= */

let socialLinks = [];


/* ---------------------------------------------------------
   SOCIAL DOM
--------------------------------------------------------- */

const socialList =
    document.getElementById("socialList");

const socialModal =
    document.getElementById("socialModal");

const socialForm =
    document.getElementById("socialForm");


/* =========================================================
   SOCIAL HELPERS
========================================================= */

function getSocialValue(item, key, fallback = "") {

    if (!item || typeof item !== "object") {
        return fallback;
    }

    if (Object.prototype.hasOwnProperty.call(item, key)) {
        return item[key] ?? fallback;
    }

    const wanted =
        String(key)
            .trim()
            .toLowerCase();

    const actualKey =
        Object.keys(item).find(function(k) {

            return String(k)
                .trim()
                .toLowerCase() === wanted;

        });

    return actualKey
        ? (item[actualKey] ?? fallback)
        : fallback;
}


function socialIsActive(item) {

    const value =
        String(
            getSocialValue(item, "Active", "")
        )
            .trim()
            .toLowerCase();

    return (
        value === "yes" ||
        value === "true" ||
        value === "1" ||
        value === "active"
    );
}


function getSocialID(item) {

    return String(
        getSocialValue(
            item,
            "Social ID",
            ""
        )
    ).trim();
}


function getSocialPlatform(item) {

    return String(
        getSocialValue(
            item,
            "Platform",
            "Other"
        )
    ).trim();
}


function getSocialPlatformIcon(platform) {

    const value =
        String(platform || "")
            .trim()
            .toLowerCase();

    if (value === "youtube") {
        return "fa-brands fa-youtube";
    }

    if (value === "instagram") {
        return "fa-brands fa-instagram";
    }

    if (value === "facebook") {
        return "fa-brands fa-facebook";
    }

    return "fa-solid fa-share-nodes";
}


function getSocialPlatformName(platform) {

    const value =
        String(platform || "Other")
            .trim();

    return value || "Other";
}


/* =========================================================
   LOAD SOCIAL LINKS
========================================================= */

async function loadSocialLinks() {

    if (!socialList) {
        return;
    }

    try {

        socialList.innerHTML = `
            <div class="social-empty">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <h3>Loading social content...</h3>
                <p>Please wait.</p>
            </div>
        `;


        const token =
            sessionStorage.getItem(
                "sherpas_admin_token"
            ) || "";


        const response =
            await fetch(
                MESSAGES_API +
                "?action=GET_SOCIAL_LINKS" +
                "&token=" +
                encodeURIComponent(token)
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load social content."
            );

        }


        const result =
            await response.json();



        if (!result.success) {

            throw new Error(
                result.message ||
                "Unable to load social content."
            );

        }


        socialLinks =
            Array.isArray(result.data)
                ? result.data
                : [];


        updateSocialStats();

        renderSocialLinks();

    }
    catch (error) {

        console.error(
            "LOAD SOCIAL LINKS ERROR:",
            error
        );


        socialList.innerHTML = `
            <div class="social-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    Unable to load social content
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;


        updateSocialStats();

    }

}


/* =========================================================
   SOCIAL STATS
========================================================= */

function updateSocialStats() {

    const totalElement =
        document.getElementById(
            "totalSocialLinks"
        );


    const activeElement =
        document.getElementById(
            "activeSocialLinks"
        );


    const youtubeElement =
        document.getElementById(
            "youtubeSocialLinks"
        );


    const instagramElement =
        document.getElementById(
            "instagramSocialLinks"
        );


    const facebookElement =
        document.getElementById(
            "facebookSocialLinks"
        );


    const activeLinks =
        socialLinks.filter(
            function(item) {

                return socialIsActive(item);

            }
        );


    const youtubeCount =
        socialLinks.filter(
            function(item) {

                return (
                    getSocialPlatform(item)
                        .toLowerCase() ===
                    "youtube"
                );

            }
        ).length;


    const instagramCount =
        socialLinks.filter(
            function(item) {

                return (
                    getSocialPlatform(item)
                        .toLowerCase() ===
                    "instagram"
                );

            }
        ).length;


    const facebookCount =
        socialLinks.filter(
            function(item) {

                return (
                    getSocialPlatform(item)
                        .toLowerCase() ===
                    "facebook"
                );

            }
        ).length;


    if (totalElement) {

        totalElement.textContent =
            socialLinks.length;

    }


    if (activeElement) {

        activeElement.textContent =
            activeLinks.length;

    }


    if (youtubeElement) {

        youtubeElement.textContent =
            youtubeCount;

    }


    if (instagramElement) {

        instagramElement.textContent =
            instagramCount;

    }


    if (facebookElement) {

        facebookElement.textContent =
            facebookCount;

    }

}


/* =========================================================
   RENDER SOCIAL LINKS
========================================================= */

function renderSocialLinks(
    filterText = ""
) {

    if (!socialList) {
        return;
    }


    const search =
        String(filterText)
            .toLowerCase()
            .trim();


    const filtered =
        socialLinks.filter(
            function(item) {

                const text = [

                    getSocialValue(
                        item,
                        "Social ID"
                    ),

                    getSocialValue(
                        item,
                        "Platform"
                    ),

                    getSocialValue(
                        item,
                        "Title"
                    ),

                    getSocialValue(
                        item,
                        "Description"
                    ),

                    getSocialValue(
                        item,
                        "URL"
                    )

                ]
                    .join(" ")
                    .toLowerCase();


                return text.includes(search);

            }
        );


    if (filtered.length === 0) {

        socialList.innerHTML = `

            <div class="social-empty">

                <i class="fa-solid fa-share-nodes"></i>

                <h3>
                    No social content found
                </h3>

                <p>
                    Add your first YouTube, Instagram,
                    Facebook or other public link.
                </p>

            </div>

        `;

        return;

    }


    socialList.innerHTML =
        filtered.map(
            function(item) {

                const id =
                    getSocialID(item);


                const platform =
                    getSocialPlatform(item);


                const title =
                    String(
                        getSocialValue(
                            item,
                            "Title",
                            platform
                        )
                    );


                const description =
                    String(
                        getSocialValue(
                            item,
                            "Description",
                            ""
                        )
                    );


                const url =
                    String(
                        getSocialValue(
                            item,
                            "URL",
                            ""
                        )
                    );


                const active =
                    socialIsActive(item);


                const icon =
                    getSocialPlatformIcon(
                        platform
                    );


                return `

                    <article
                        class="social-card"
                        data-social-id="${escapeHTML(id)}"
                    >

                        <div class="social-card-top">

                            <div class="social-card-platform">

                                <div class="social-card-platform-icon">

                                    <i class="${icon}"></i>

                                </div>

                                <div>

                                    <div class="social-card-platform-name">

                                        ${escapeHTML(
                                            getSocialPlatformName(
                                                platform
                                            )
                                        )}

                                    </div>

                                </div>

                            </div>


                            <span
                                class="social-status ${
                                    active
                                        ? "active"
                                        : "inactive"
                                }"
                            >

                                ${
                                    active
                                        ? "Active"
                                        : "Inactive"
                                }

                            </span>

                        </div>


                        <h3>
                            ${escapeHTML(title)}
                        </h3>


                        ${
                            description
                                ? `

                                    <p class="social-card-description">

                                        ${escapeHTML(
                                            description
                                        )}

                                    </p>

                                `
                                : ""
                        }


                        ${
                            url
                                ? `

                                    <a
                                        class="social-card-url"
                                        href="${escapeHTML(url)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="${escapeHTML(url)}"
                                    >

                                        ${escapeHTML(url)}

                                    </a>

                                `
                                : ""
                        }


                        <div class="social-card-bottom">

                            <span class="social-card-id">

                                ${escapeHTML(id)}

                            </span>


                            <div class="social-card-actions">

                                <button
                                    type="button"
                                    class="edit-social-btn"
                                    data-social-action="edit"
                                    data-social-id="${escapeHTML(id)}"
                                    title="Edit"
                                >

                                    <i class="fa-solid fa-pen"></i>

                                </button>


                                <button
                                    type="button"
                                    class="toggle-social-btn"
                                    data-social-action="toggle"
                                    data-social-id="${escapeHTML(id)}"
                                    title="${
                                        active
                                            ? "Disable"
                                            : "Enable"
                                    }"
                                >

                                    <i class="fa-solid ${
                                        active
                                            ? "fa-eye-slash"
                                            : "fa-eye"
                                    }"></i>

                                </button>


                                <button
                                    type="button"
                                    class="delete-social-btn"
                                    data-social-action="delete"
                                    data-social-id="${escapeHTML(id)}"
                                    title="Delete"
                                >

                                    <i class="fa-solid fa-trash"></i>

                                </button>

                            </div>

                        </div>

                    </article>

                `;

            }
        ).join("");

}


/* =========================================================
   OPEN SOCIAL MODAL
========================================================= */

function openSocialModal(
    item = null
) {

    if (!socialModal || !socialForm) {
        return;
    }


    const modalTitle =
        document.getElementById(
            "socialModalTitle"
        );


    socialForm.reset();


    document.getElementById(
        "socialID"
    ).value = "";


    document.getElementById(
        "socialActive"
    ).checked = true;


    if (!item) {

        if (modalTitle) {

            modalTitle.innerHTML = `

                <i class="fa-solid fa-share-nodes"></i>

                Add Social Content

            `;

        }

    }
    else {

        document.getElementById(
            "socialID"
        ).value =
            getSocialID(item);


        document.getElementById(
            "socialPlatform"
        ).value =
            getSocialValue(
                item,
                "Platform",
                "Other"
            );


        document.getElementById(
            "socialTitle"
        ).value =
            getSocialValue(
                item,
                "Title",
                ""
            );


        document.getElementById(
            "socialURL"
        ).value =
            getSocialValue(
                item,
                "URL",
                ""
            );


        document.getElementById(
            "socialDescription"
        ).value =
            getSocialValue(
                item,
                "Description",
                ""
            );


        document.getElementById(
            "socialActive"
        ).checked =
            socialIsActive(item);


        if (modalTitle) {

            modalTitle.innerHTML = `

                <i class="fa-solid fa-pen"></i>

                Edit Social Content

            `;

        }

    }


    socialModal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE SOCIAL MODAL
========================================================= */

function closeSocialModal() {

    if (!socialModal) {
        return;
    }


    socialModal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   SAVE SOCIAL LINK
========================================================= */

async function saveSocialLink(
    event
) {

    event.preventDefault();


    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        ) || "";


    if (!token) {

        Swal.fire(
            "Session expired",
            "Please login again.",
            "error"
        );

        return;

    }


    const socialID =
        document.getElementById(
            "socialID"
        ).value.trim();


    const platform =
        document.getElementById(
            "socialPlatform"
        ).value;


    const title =
        document.getElementById(
            "socialTitle"
        ).value.trim();


    const url =
        document.getElementById(
            "socialURL"
        ).value.trim();


    const description =
        document.getElementById(
            "socialDescription"
        ).value.trim();


    const active =
        document.getElementById(
            "socialActive"
        ).checked;


    if (!platform) {

        Swal.fire(
            "Platform required",
            "Please select a platform.",
            "warning"
        );

        return;

    }


    if (!title) {

        Swal.fire(
            "Title required",
            "Please enter a title.",
            "warning"
        );

        return;

    }


    if (!url) {

        Swal.fire(
            "URL required",
            "Please enter the public URL.",
            "warning"
        );

        return;

    }


    try {

        new URL(url);

    }
    catch (error) {

        Swal.fire(
            "Invalid URL",
            "Please enter a valid URL including https://",
            "warning"
        );

        return;

    }


    const isEdit =
        Boolean(socialID);


    const action =
        isEdit
            ? "UPDATE_SOCIAL"
            : "ADD_SOCIAL";


    const button =
        document.getElementById(
            "saveSocialBtn"
        );


    const originalHTML =
        button
            ? button.innerHTML
            : "";


    if (button) {

        button.disabled = true;


        button.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            Saving...

        `;

    }


    try {

        const form =
            new URLSearchParams();


        form.append(
            "action",
            action
        );


        form.append(
            "token",
            token
        );


        form.append(
            "data",
            JSON.stringify({

                socialID,

                platform,

                title,

                url,

                description,

                active,

                createdBy:
                    sessionStorage.getItem(
                        "sherpas_admin_email"
                    ) || "Admin"

            })
        );


        const response =
            await fetch(
                MESSAGES_API,
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
                "Unable to save social content."
            );

        }


        closeSocialModal();


        await loadSocialLinks();


        Swal.fire({

            icon: "success",

            title:
                isEdit
                    ? "Social Content Updated"
                    : "Social Content Added",

            text:
                isEdit
                    ? "The social content has been updated."
                    : "The social content has been added.",

            timer: 1800,

            showConfirmButton: false

        });

    }
    catch (error) {

        console.error(
            "SAVE SOCIAL LINK ERROR:",
            error
        );


        Swal.fire(
            "Save failed",
            error.message,
            "error"
        );

    }
    finally {

        if (button) {

            button.disabled = false;

            button.innerHTML =
                originalHTML;

        }

    }

}


/* =========================================================
   TOGGLE SOCIAL STATUS
========================================================= */

async function toggleSocialLink(
    id
) {

    const item =
        socialLinks.find(
            function(item) {

                return getSocialID(item) ===
                    String(id).trim();

            }
        );


    if (!item) {
        return;
    }


    const currentlyActive =
        socialIsActive(item);


    const nextState =
        !currentlyActive;


    const confirmed =
        await Swal.fire({

            icon: "question",

            title:
                nextState
                    ? "Enable social content?"
                    : "Disable social content?",

            text:
                getSocialValue(
                    item,
                    "Title",
                    ""
                ),

            showCancelButton: true,

            confirmButtonText:
                nextState
                    ? "Enable"
                    : "Disable"

        });


    if (!confirmed.isConfirmed) {
        return;
    }


    await updateSocialStatus(
        id,
        nextState
    );

}


/* =========================================================
   UPDATE SOCIAL STATUS
========================================================= */

async function updateSocialStatus(
    id,
    activeValue
) {

    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        ) || "";


    if (!token) {

        Swal.fire(
            "Session expired",
            "Please login again.",
            "error"
        );

        return;

    }


    const item =
        socialLinks.find(
            function(item) {

                return getSocialID(item) ===
                    String(id).trim();

            }
        );


    if (!item) {
        return;
    }


    try {

        const form =
            new URLSearchParams();


        form.append(
            "action",
            "UPDATE_SOCIAL"
        );


        form.append(
            "token",
            token
        );


        form.append(
            "data",
            JSON.stringify({

                socialID:
                    id,

                platform:
                    getSocialValue(
                        item,
                        "Platform",
                        "Other"
                    ),

                title:
                    getSocialValue(
                        item,
                        "Title",
                        ""
                    ),

                url:
                    getSocialValue(
                        item,
                        "URL",
                        ""
                    ),

                description:
                    getSocialValue(
                        item,
                        "Description",
                        ""
                    ),

                active:
                    Boolean(activeValue)

            })
        );


        const response =
            await fetch(
                MESSAGES_API,
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
                "Unable to update social content."
            );

        }


        await loadSocialLinks();

    }
    catch (error) {

        console.error(
            "TOGGLE SOCIAL LINK ERROR:",
            error
        );


        Swal.fire(
            "Update failed",
            error.message,
            "error"
        );

    }

}


/* =========================================================
   DELETE SOCIAL LINK
========================================================= */

async function deleteSocialLink(
    id
) {

    const item =
        socialLinks.find(
            function(item) {

                return getSocialID(item) ===
                    String(id).trim();

            }
        );


    if (!item) {
        return;
    }


    const confirmed =
        await Swal.fire({

            icon: "warning",

            title:
                "Delete social content?",

            text:
                getSocialValue(
                    item,
                    "Title",
                    "This content will be permanently deleted."
                ),

            showCancelButton: true,

            confirmButtonText:
                "Delete",

            confirmButtonColor:
                "#dc2626"

        });


    if (!confirmed.isConfirmed) {
        return;
    }


    const token =
        sessionStorage.getItem(
            "sherpas_admin_token"
        ) || "";


    if (!token) {

        Swal.fire(
            "Session expired",
            "Please login again.",
            "error"
        );

        return;

    }


    try {

        const form =
            new URLSearchParams();


        form.append(
            "action",
            "DELETE_SOCIAL"
        );


        form.append(
            "token",
            token
        );


        form.append(
            "data",
            JSON.stringify({

                socialID:
                    id

            })
        );


        const response =
            await fetch(
                MESSAGES_API,
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
                "Unable to delete social content."
            );

        }


        await loadSocialLinks();


        Swal.fire({

            icon: "success",

            title:
                "Deleted",

            text:
                "Social content deleted successfully.",

            timer: 1500,

            showConfirmButton: false

        });

    }
    catch (error) {

        console.error(
            "DELETE SOCIAL LINK ERROR:",
            error
        );


        Swal.fire(
            "Delete failed",
            error.message,
            "error"
        );

    }

}


/* =========================================================
   SOCIAL CLICK EVENTS
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "[data-social-action]"
            );


        if (!button) {
            return;
        }


        const action =
            button.dataset.socialAction;


        const id =
            button.dataset.socialId;


        const item =
            socialLinks.find(
                function(item) {

                    return getSocialID(item) ===
                        String(id).trim();

                }
            );


        if (action === "edit") {

            if (item) {

                openSocialModal(
                    item
                );

            }

        }


        if (action === "toggle") {

            toggleSocialLink(
                id
            );

        }


        if (action === "delete") {

            deleteSocialLink(
                id
            );

        }

    }
);


/* =========================================================
   SOCIAL SEARCH
========================================================= */

const socialSearch =
    document.getElementById(
        "socialSearch"
    );


if (socialSearch) {

    socialSearch.addEventListener(
        "input",
        function() {

            renderSocialLinks(
                this.value
            );

        }
    );

}


/* =========================================================
   SOCIAL NEW BUTTON
========================================================= */

const addSocialBtn =
    document.getElementById(
        "addSocialBtn"
    );


if (addSocialBtn) {

    addSocialBtn.addEventListener(
        "click",
        function() {

            openSocialModal();

        }
    );

}


/* =========================================================
   SOCIAL CLOSE BUTTONS
========================================================= */

const closeSocialBtn =
    document.getElementById(
        "closeSocialModal"
    );


if (closeSocialBtn) {

    closeSocialBtn.addEventListener(
        "click",
        closeSocialModal
    );

}


const cancelSocialBtn =
    document.getElementById(
        "cancelSocialBtn"
    );


if (cancelSocialBtn) {

    cancelSocialBtn.addEventListener(
        "click",
        closeSocialModal
    );

}


if (socialModal) {

    socialModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === socialModal
            ) {

                closeSocialModal();

            }

        }
    );

}


/* =========================================================
   SOCIAL FORM
========================================================= */

if (socialForm) {

    socialForm.addEventListener(
        "submit",
        saveSocialLink
    );

}


/* =========================================================
   SOCIAL TAB
========================================================= */

const socialTab =
    document.querySelector(
        '.message-tab[data-tab="socialPanel"]'
    );


if (socialTab) {

    socialTab.addEventListener(
        "click",
        function() {

            loadSocialLinks();

        }
    );

}


/* =========================================================
   INITIAL SOCIAL LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        updateSocialStats();

        loadSocialLinks();

    }
);

