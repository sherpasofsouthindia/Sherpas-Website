let allMembers = [];

document.addEventListener("DOMContentLoaded", () => {

    loadDashboard();

});

async function loadDashboard() {

    try {

        const response = await fetch(API_URL);

        const result = await response.json();

        if (!result.success) return;

        allMembers = result.members;

        updateCards();

        loadRecentMembers();

        loadStatistics();

        loadBirthdays();

    }
    catch (err) {

        console.log(err);

    }

}

function updateCards() {

    document.getElementById("totalMembers").innerText =
        allMembers.length;

    document.getElementById("approvedMembers").innerText =
        allMembers.filter(x => x.Status == "Approved").length;

    document.getElementById("pendingMembers").innerText =
        allMembers.filter(x => x.Status == "Pending").length;

    document.getElementById("rejectedMembers").innerText =
        allMembers.filter(x => x.Status == "Rejected").length;

}

function loadRecentMembers() {

    const list = document.getElementById("recentMembersList");

    list.innerHTML = "";

    const recent = [...allMembers]
        .reverse()
        .slice(0, 5);

    recent.forEach(member => {

        list.innerHTML += `
            <li>
                <strong>${member["Full Name"]}</strong><br>
                <small>${member["Application ID"]}</small>
            </li>
        `;

    });

}

function loadStatistics(){

    const today = new Date();

    const todayString = today.toDateString();

    const currentMonth = today.getMonth();

    const currentYear = today.getFullYear();

    let todayCount = 0;

    let monthCount = 0;

    allMembers.forEach(member=>{

        if(!member["Application Date"]) return;

        const date = new Date(member["Application Date"]);

        if(date.toDateString() === todayString){

            todayCount++;

        }

        if(date.getMonth() === currentMonth &&
           date.getFullYear() === currentYear){

            monthCount++;

        }

    });

    document.getElementById("todayRegistrations").innerText =
        todayCount;

    document.getElementById("monthRegistrations").innerText =
        monthCount;

    document.getElementById("statsApproved").innerText =
        allMembers.filter(x=>x.Status==="Approved").length;

    document.getElementById("statsPending").innerText =
        allMembers.filter(x=>x.Status==="Pending").length;

    document.getElementById("statsRejected").innerText =
        allMembers.filter(x=>x.Status==="Rejected").length;

}

function loadBirthdays() {

    const list = document.getElementById("birthdayList");

    list.innerHTML = "";

    const today = new Date();

    const birthdays = [];

    allMembers.forEach(member => {

        if (!member["Date of Birth"]) return;

        const dob = new Date(member["Date of Birth"]);

        const nextBirthday = new Date(
            today.getFullYear(),
            dob.getMonth(),
            dob.getDate()
        );

        if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        const diffDays = Math.ceil(
            (nextBirthday - today) / (1000 * 60 * 60 * 24)
        );

        if (diffDays <= 30) {

            birthdays.push({

                name: member["Full Name"],

                date: nextBirthday,

                days: diffDays

            });

        }

    });

    birthdays.sort((a, b) => a.days - b.days);

    if (birthdays.length === 0) {

        list.innerHTML =
            "<li>No birthdays in the next 30 days.</li>";

        return;

    }

    birthdays.forEach(person => {

        list.innerHTML += `
            <li>
                ${person.date.toLocaleDateString("en-IN",{
                    day:"2-digit",
                    month:"short"
                })}
                - ${person.name}
            </li>
        `;

    });

}
