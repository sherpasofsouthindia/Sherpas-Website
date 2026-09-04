let allMembers = [];

document.addEventListener("DOMContentLoaded", function () {
    loadDashboard();
});


/* =========================================
   LOAD DASHBOARD DATA
========================================= */

async function loadDashboard() {

    try {

        const response = await fetch(API_URL);
        const result = await response.json();

        if (!result.success) {
            console.error("Dashboard API error:", result.message);
            return;
        }

        allMembers = Array.isArray(result.members)
            ? result.members
            : [];

        updateCards();
        loadRecentMembers();
        loadStatistics();
        loadBirthdays();
        loadMembershipValidity();
        updateStatusGraphic();

    } catch (error) {

        console.error("Dashboard loading error:", error);

    }

}


/* =========================================
   SAFE ELEMENT UPDATE
========================================= */

function setDashboardValue(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.innerText = value;
    }

}


/* =========================================
   SUMMARY CARDS
========================================= */

function updateCards() {

    const total = allMembers.length;

    const approved = allMembers.filter(member =>
        String(member["Status"] || "").trim() === "Approved"
    ).length;

    const pending = allMembers.filter(member =>
        String(member["Status"] || "").trim() === "Pending"
    ).length;

    const rejected = allMembers.filter(member =>
        String(member["Status"] || "").trim() === "Rejected"
    ).length;

    setDashboardValue("totalMembers", total);
    setDashboardValue("approvedMembers", approved);
    setDashboardValue("pendingMembers", pending);
    setDashboardValue("rejectedMembers", rejected);

}


/* =========================================
   RECENT MEMBERS
========================================= */

function loadRecentMembers() {

    const list = document.getElementById("recentMembersList");

    if (!list) return;

    list.innerHTML = "";

    const recentMembers = [...allMembers]
        .reverse()
        .slice(0, 5);

    if (recentMembers.length === 0) {

        list.innerHTML = `
            <li>No recent members found.</li>
        `;

        return;
    }

    recentMembers.forEach(member => {

        list.innerHTML += `
            <li>
                <div>
                    <strong>${member["Full Name"] || "-"}</strong>
                    <small>${member["Application ID"] || "-"}</small>
                </div>

                <span>
                    ${member["Status"] || "-"}
                </span>
            </li>
        `;

    });

}


/* =========================================
   MEMBERSHIP STATISTICS
========================================= */

function loadStatistics() {

    const today = new Date();

    const todayDate = today.toDateString();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let todayCount = 0;
    let monthCount = 0;

    allMembers.forEach(member => {

        if (!member["Application Date"]) return;

        const applicationDate = new Date(
            member["Application Date"]
        );

        if (isNaN(applicationDate.getTime())) return;

        if (applicationDate.toDateString() === todayDate) {
            todayCount++;
        }

        if (
            applicationDate.getMonth() === currentMonth &&
            applicationDate.getFullYear() === currentYear
        ) {
            monthCount++;
        }

    });

    const approved = allMembers.filter(member =>
        String(member["Status"] || "").trim() === "Approved"
    ).length;

    const pending = allMembers.filter(member =>
        String(member["Status"] || "").trim() === "Pending"
    ).length;

    const rejected = allMembers.filter(member =>
        String(member["Status"] || "").trim() === "Rejected"
    ).length;

    setDashboardValue("todayRegistrations", todayCount);
    setDashboardValue("monthRegistrations", monthCount);

    setDashboardValue("statsApproved", approved);
    setDashboardValue("statsPending", pending);
    setDashboardValue("statsRejected", rejected);

}


/* =========================================
   UPCOMING BIRTHDAYS
========================================= */

function loadBirthdays() {

    const list = document.getElementById("birthdayList");

    if (!list) return;

    list.innerHTML = "";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const birthdays = [];

    allMembers.forEach(member => {

        if (!member["Date of Birth"]) return;

        const dob = new Date(member["Date of Birth"]);

        if (isNaN(dob.getTime())) return;

        let nextBirthday = new Date(
            today.getFullYear(),
            dob.getMonth(),
            dob.getDate()
        );

        nextBirthday.setHours(0, 0, 0, 0);

        if (nextBirthday < today) {
            nextBirthday.setFullYear(
                today.getFullYear() + 1
            );
        }

        const difference =
            nextBirthday.getTime() - today.getTime();

        const daysRemaining = Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );

        if (daysRemaining <= 30) {

            birthdays.push({
                name: member["Full Name"] || "-",
                date: nextBirthday,
                days: daysRemaining
            });

        }

    });

    birthdays.sort((a, b) => a.days - b.days);

    if (birthdays.length === 0) {

        list.innerHTML = `
            <li>No birthdays in the next 30 days.</li>
        `;

        return;
    }

    birthdays.forEach(person => {

        let remainingText = "";

        if (person.days === 0) {
            remainingText = "Today";
        } else if (person.days === 1) {
            remainingText = "Tomorrow";
        } else {
            remainingText = `In ${person.days} days`;
        }

        list.innerHTML += `
            <li>
                <div>
                    <strong>${person.name}</strong>
                    <small>
                        ${person.date.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short"
                        })}
                    </small>
                </div>

                <span>${remainingText}</span>
            </li>
        `;

    });

}


/* =========================================
   MEMBERSHIP VALIDITY
========================================= */

function loadMembershipValidity() {

    const validList = [];
    const expiringList = [];
    const expiredList = [];

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    allMembers.forEach(member => {

        const status = String(
            member["Status"] || ""
        ).trim();

        if (status !== "Approved") return;

        const validityValue =
            member["Membership Valid Until"];

        if (!validityValue) return;

        const validUntil = new Date(validityValue);

        if (isNaN(validUntil.getTime())) return;

        validUntil.setHours(0, 0, 0, 0);

        const difference =
            validUntil.getTime() - today.getTime();

        const daysRemaining = Math.ceil(
            difference / (1000 * 60 * 60 * 24)
        );

        const memberData = {
            name: member["Full Name"] || "-",
            membershipID: member["Membership ID"] || "-",
            validUntil: validUntil,
            days: daysRemaining
        };

        if (daysRemaining < 0) {

            expiredList.push(memberData);

        } else if (daysRemaining <= 30) {

            expiringList.push(memberData);

        } else {

            validList.push(memberData);

        }

    });

    expiringList.sort((a, b) => a.days - b.days);
    expiredList.sort((a, b) => a.days - b.days);

    setDashboardValue(
        "validMembershipCount",
        validList.length
    );

    setDashboardValue(
        "expiringMembershipCount",
        expiringList.length
    );

    setDashboardValue(
        "expiredMembershipCount",
        expiredList.length
    );

    const attentionList =
        document.getElementById("expiringMembersList");

    if (attentionList) {

        attentionList.innerHTML = "";

        const combinedList = [
            ...expiredList,
            ...expiringList
        ].slice(0, 8);

        setDashboardValue(
            "attentionMemberCount",
            combinedList.length + " members"
        );

        if (combinedList.length === 0) {

            attentionList.innerHTML = `
                <li>No memberships require attention.</li>
            `;

        } else {

            combinedList.forEach(member => {

                const isExpired = member.days < 0;

                let dateText = member.validUntil.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

                let remainingText;

                if (isExpired) {
                    remainingText = "Expired";
                } else if (member.days === 0) {
                    remainingText = "Expires today";
                } else if (member.days === 1) {
                    remainingText = "1 day remaining";
                } else {
                    remainingText = `${member.days} days remaining`;
                }

                attentionList.innerHTML += `
                    <li class="${isExpired ? "expired" : ""}">

                        <div>
                            <strong>${member.name}</strong>

                            <small>
                                ${member.membershipID}
                                · Valid until ${dateText}
                            </small>
                        </div>

                        <span class="expiry-date">
                            ${remainingText}
                        </span>

                    </li>
                `;

            });

        }

    }

}


/* =========================================
   MEMBERSHIP STATUS GRAPHIC
========================================= */

function updateStatusGraphic() {

    const approved = allMembers.filter(member =>
        String(member["Status"] || "").trim() === "Approved"
    ).length;

    const pending = allMembers.filter(member =>
        String(member["Status"] || "").trim() === "Pending"
    ).length;

    const rejected = allMembers.filter(member =>
        String(member["Status"] || "").trim() === "Rejected"
    ).length;

    const total = approved + pending + rejected;

    setDashboardValue("statusChartTotal", total);
    setDashboardValue("chartApproved", approved);
    setDashboardValue("chartPending", pending);
    setDashboardValue("chartRejected", rejected);

    const donut = document.querySelector(".status-donut");

    if (!donut) return;

    if (total === 0) {

        donut.style.background = "#e5e7eb";
        return;

    }

    const approvedDegree =
        (approved / total) * 360;

    const pendingDegree =
        (pending / total) * 360;

    const pendingEnd =
        approvedDegree + pendingDegree;

    donut.style.background = `
        conic-gradient(
            #16a34a 0deg ${approvedDegree}deg,
            #d97706 ${approvedDegree}deg ${pendingEnd}deg,
            #dc2626 ${pendingEnd}deg 360deg
        )
    `;

}


/* =========================================
   MANUAL REFRESH
========================================= */

window.loadDashboard = loadDashboard;

