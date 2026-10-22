/* =========================================
   SHERPAS PUBLIC WEBSITE TEAM
========================================= */

(function () {
    "use strict";

    // Use the existing main website API endpoint.
    const TEAM_API_URL =
        "https://script.google.com/macros/s/AKfycbwVBqSyZyg0E9LPKqMAWDSUFJcya4NdH9HvzAsOpMOYphAlDmuxJkQJSlRrW_0E85uY/exec";

    document.addEventListener("DOMContentLoaded", loadPublicTeam);

    async function loadPublicTeam() {
        const adminContainer =
            document.getElementById("adminTeamContainer");

        const supportContainer =
            document.getElementById("supportTeamContainer");

        if (!adminContainer || !supportContainer) return;

        try {
            const response = await fetch(
                TEAM_API_URL + "?action=GET_PUBLIC_TEAM"
            );

            if (!response.ok) {
                throw new Error("Team API request failed.");
            }

            const result = await response.json();

            if (!result.success || !Array.isArray(result.data)) {
                throw new Error(
                    result.message || "Unable to load website team."
                );
            }

            const team = result.data;

            renderTeam(
                adminContainer,
                team.filter(member => member.category === "admin"),
                "No leadership team members to display."
            );

            renderTeam(
                supportContainer,
                team.filter(member => member.category === "support"),
                "No supporting team members to display."
            );

        } catch (error) {
            console.error("Public team loading error:", error);

            adminContainer.textContent =
                "Leadership team is temporarily unavailable.";

            supportContainer.textContent =
                "Supporting team is temporarily unavailable.";
        }
    }

    function renderTeam(container, members, emptyMessage) {
        container.replaceChildren();

        if (!members.length) {
            const message = document.createElement("p");
            message.className = "team-loading";
            message.textContent = emptyMessage;
            container.appendChild(message);
            return;
        }

        members.forEach(member => {
            const card = document.createElement("div");
            card.className = "admin-card";

            const image = document.createElement("img");
            image.alt = member.fullName || "Team member";
            image.loading = "lazy";
          

            image.onerror = function () {
                this.onerror = null;
                this.src = "assets/logo.png";
            };

            if (member.photoData) {
                image.src = member.photoData;
            } else {
                image.src = "assets/logo.png";
            }
                 

            const name = document.createElement("h4");
            name.textContent = member.fullName || "";

            const role = document.createElement("p");
            role.className = "admin-role";
            role.textContent =
                member.category === "admin"
                    ? "Admin"
                    : "Supporting Team";

            const designation = document.createElement("p");
            designation.className = "designation";
            designation.textContent = member.designation || "";

            const description = document.createElement("p");
            description.className = "admin-quote";
            description.textContent = member.description || "";

            card.append(
                image,
                name,
                role,
                designation,
                description
            );

            if (member.phone) {
                const digits = String(member.phone).replace(/\D/g, "");
                const whatsappNumber =
                    digits.length === 10 ? "91" + digits : digits;

                const buttons = document.createElement("div");
                buttons.className = "admin-buttons";

                const call = document.createElement("a");
                call.href = "tel:" + digits;
                call.textContent = "Call";
                call.className = "admin-call";

                const whatsapp = document.createElement("a");
                whatsapp.href =
                    "https://wa.me/" + whatsappNumber;
                whatsapp.target = "_blank";
                whatsapp.rel = "noopener noreferrer";
                whatsapp.textContent = "WhatsApp";
                whatsapp.className = "admin-whatsapp";

                buttons.append(call, whatsapp);
                card.appendChild(buttons);
            }

            container.appendChild(card);
        });
    }
})();
