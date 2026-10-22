/*==================================================
              SHERPAS SETTINGS
==================================================*/

const settingsForm = document.getElementById("settingsForm");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");
const reloadSettingsBtn = document.getElementById("reloadSettingsBtn");
const settingsMessage = document.getElementById("settingsMessage");

const settingFields = {
  "Organization Name": "organizationName",
  "Organization Phone": "organizationPhone",
  "Organization Email": "organizationEmail",
  "Website URL": "websiteURL",
  "Organization Address": "organizationAddress",

  "Membership Prefix": "membershipPrefix",
  "Starting Membership Number": "startingMembershipNumber",
  "Membership Fee": "membershipFee",
  "Renewal Fee": "renewalFee",
  "Membership Validity": "membershipValidity",

  "Application Prefix": "applicationPrefix",
  "Registration Enabled": "registrationEnabled",

  "Admin Email": "adminEmail"
};


/*==================================================
              ADMIN TOKEN
==================================================*/

function getAdminToken() {
  return sessionStorage.getItem("sherpas_admin_token") || "";
}


/*==================================================
              SHOW MESSAGE
==================================================*/

function showSettingsMessage(message, type = "success") {
  if (!settingsMessage) return;

  settingsMessage.textContent = message;
  settingsMessage.className = `settings-message ${type}`;
}


/*==================================================
              LOAD SETTINGS
==================================================*/

async function loadSettings() {
  try {
    reloadSettingsBtn.disabled = true;
    saveSettingsBtn.disabled = true;

    showSettingsMessage("Loading settings...", "info");

    const token = getAdminToken();

    const formData = new URLSearchParams();
    formData.append("action", "GET_SETTINGS");
    formData.append("token", token);
    formData.append("data", JSON.stringify({}));

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Unable to load settings");
    }

    const settings = result.data || result;

    Object.entries(settingFields).forEach(([settingName, fieldId]) => {
      const field = document.getElementById(fieldId);

      if (field && settings[settingName] !== undefined) {
        field.value = settings[settingName];
      }
    });

    showSettingsMessage("Settings loaded successfully.", "success");

  } catch (error) {
    console.error("Load settings error:", error);
    showSettingsMessage(error.message || "Unable to load settings.", "error");

    Swal.fire({
      icon: "error",
      title: "Unable to Load Settings",
      text: error.message || "Please try again."
    });

  } finally {
    reloadSettingsBtn.disabled = false;
    saveSettingsBtn.disabled = false;
  }
}


/*==================================================
              SAVE SETTINGS
==================================================*/

async function saveSettings() {
  try {
    reloadSettingsBtn.disabled = true;
    saveSettingsBtn.disabled = true;

    showSettingsMessage("Saving settings...", "info");

    const settings = {};

    Object.entries(settingFields).forEach(([settingName, fieldId]) => {
      const field = document.getElementById(fieldId);

      if (field) {
        settings[settingName] = field.value.trim();
      }
    });

    const token = getAdminToken();

    const formData = new URLSearchParams();
    formData.append("action", "SAVE_SETTINGS");
    formData.append("token", token);
    formData.append("data", JSON.stringify(settings));

    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Unable to save settings");
    }

    showSettingsMessage("Settings saved successfully.", "success");

    await Swal.fire({
      icon: "success",
      title: "Saved Successfully",
      text: "Your settings have been updated.",
      timer: 1800,
      showConfirmButton: false
    });

  } catch (error) {
    console.error("Save settings error:", error);
    showSettingsMessage(error.message || "Unable to save settings.", "error");

    Swal.fire({
      icon: "error",
      title: "Unable to Save Settings",
      text: error.message || "Please try again."
    });

  } finally {
    reloadSettingsBtn.disabled = false;
    saveSettingsBtn.disabled = false;
  }
}


/*==================================================
              EVENTS
==================================================*/

if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener("click", saveSettings);
}

if (reloadSettingsBtn) {
  reloadSettingsBtn.addEventListener("click", loadSettings);
}


/*==================================================
              INITIAL LOAD
==================================================*/

document.addEventListener("DOMContentLoaded", loadSettings);

 

/* =========================================
   TEAM MANAGEMENT
========================================= */

let adminTeamMembers = [];
let approvedTeamMembers = [];
let editingTeamMembershipID = "";

async function loadTeamMemberOptions() {
    const select = document.getElementById("teamMemberSelect");
    if (!select) return;

    select.innerHTML = '<option value="">Loading members...</option>';

    try {
        const response = await fetch(API_URL);
        const result = await response.json();

        if (!result.success || !Array.isArray(result.members)) {
            throw new Error("Unable to load member records.");
        }

        approvedTeamMembers = result.members
            .filter(member =>
                String(member["Status"] || "").trim().toLowerCase() === "approved" &&
                String(member["Membership ID"] || "").trim() &&
                String(member["Full Name"] || "").trim()
            )
            .sort((a, b) =>
                String(a["Membership ID"]).trim().localeCompare(
                    String(b["Membership ID"]).trim(),
                    undefined,
                    { numeric: true, sensitivity: "base" }
                )
            );

        renderTeamMemberOptions();

    } catch (error) {
        console.error("Member dropdown error:", error);
        select.innerHTML =
            '<option value="">Unable to load members</option>';
    }
}

function renderTeamMemberOptions() {
    const select = document.getElementById("teamMemberSelect");
    const search = document.getElementById("teamMemberSearch");

    if (!select) return;

    const previousValue =
        select.value || editingTeamMembershipID;

    const query = String(search?.value || "")
        .trim()
        .toLowerCase();

    const filteredMembers = approvedTeamMembers.filter(member => {
        const id = String(member["Membership ID"] || "").trim();
        const name = String(member["Full Name"] || "").trim();

        return (
            name.toLowerCase().includes(query) ||
            id.toLowerCase().includes(query)
        );
    });

    select.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = filteredMembers.length
        ? "Select a member"
        : "No matching approved members";
    select.appendChild(placeholder);

    filteredMembers.forEach(member => {
        const id = String(member["Membership ID"]).trim();
        const name = String(member["Full Name"]).trim();

        const option = document.createElement("option");
        option.value = id;
        option.textContent = `${id} — ${name}`;
        select.appendChild(option);
    });

    // Preserve the selected member while searching.
    if (
        previousValue &&
        !Array.from(select.options).some(
            option => option.value === previousValue
        )
    ) {
        const selectedMember = approvedTeamMembers.find(
            member =>
                String(member["Membership ID"]).trim() === previousValue
        );

        if (selectedMember) {
            const option = document.createElement("option");
            option.value = previousValue;
            option.textContent =
                `${previousValue} — ${selectedMember["Full Name"]}`;
            select.appendChild(option);
        }
    }

    if (previousValue) {
        select.value = previousValue;
    }
}

// Attach the search listener once.
const teamMemberSearch = document.getElementById("teamMemberSearch");

if (teamMemberSearch) {
    teamMemberSearch.addEventListener("input", renderTeamMemberOptions);
}


async function loadAdminTeam() {
    const tbody = document.getElementById("websiteTeamTableBody");
    if (!tbody) return;

    tbody.innerHTML =
        '<tr><td colspan="5">Loading team members...</td></tr>';

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                action: "GET_ADMIN_TEAM",
                token: getAdminToken(),
                data: JSON.stringify({})
            })
        });

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
            throw new Error(result.message || "Unable to load team.");
        }

        adminTeamMembers = result.data;
        renderAdminTeam();

    } catch (error) {
        console.error("Admin team loading error:", error);
        tbody.innerHTML =
            '<tr><td colspan="5">Unable to load team members.</td></tr>';
    }
}


function renderAdminTeam() {
    const tbody = document.getElementById("websiteTeamTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (adminTeamMembers.length === 0) {
        tbody.innerHTML =
            '<tr><td colspan="6">No team members added yet.</td></tr>';
        return;
    }

    adminTeamMembers.forEach(member => {
        const row = document.createElement("tr");

        const profile = approvedTeamMembers.find(person =>
            String(person["Membership ID"] || "").trim() ===
            String(member.membershipID || "").trim()
        );

        const name = profile
            ? String(profile["Full Name"] || "").trim()
            : "Member not found";

        // Member name and Membership ID
        const memberCell = document.createElement("td");
        memberCell.textContent =
            `${name} (${member.membershipID || "-"})`;
        row.appendChild(memberCell);

        // Category
        const categoryCell = document.createElement("td");
        categoryCell.textContent =
            member.category === "admin"
                ? "Admin / Leadership"
                : "Supporting Team";
        row.appendChild(categoryCell);

        // Designation
        const designationCell = document.createElement("td");
        designationCell.textContent = member.designation || "-";
        row.appendChild(designationCell);

        // Description
        const descriptionCell = document.createElement("td");
        descriptionCell.textContent = member.description || "-";
        row.appendChild(descriptionCell);

        // Display Order
        const orderCell = document.createElement("td");
        orderCell.textContent = member.displayOrder ?? "-";
        row.appendChild(orderCell);

        // Edit and Delete actions
        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            editAdminTeamMember(member);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.style.marginLeft = "6px";
        deleteButton.addEventListener("click", () => {
            deleteAdminTeamMember(member);
        });

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);

        tbody.appendChild(row);
    });
}

function editAdminTeamMember(member) {
    editingTeamMembershipID = String(member.membershipID || "").trim();

    document.getElementById("teamMemberSelect").value =
        editingTeamMembershipID;
    document.getElementById("teamRoleSelect").value =
        member.category || "admin";
    document.getElementById("teamDesignation").value =
        member.designation || "";
    
    document.getElementById("teamPosition").value =
        member.displayOrder || 1;

    document.getElementById("teamDescription").value =
        member.description || "";

    const button = document.getElementById("addTeamMemberBtn");
    button.innerHTML = "Update Team Member";

    showSettingsMessage(
        "Edit the details above, then click Update Team Member."
    );

    document.getElementById("teamManagementCard")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteAdminTeamMember(member) {
    const membershipID = String(member.membershipID || "").trim();
    if (!membershipID) return;

    if (!window.confirm(
        `Remove ${membershipID} from the website team? ` +
        "Their main membership record will remain unchanged."
    )) return;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                action: "DELETE_ADMIN_TEAM",
                token: getAdminToken(),
                data: JSON.stringify({ membershipID })
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Unable to delete team member.");
        }

        if (editingTeamMembershipID === membershipID) {
            cancelAdminTeamEdit();
        }

        showSettingsMessage(result.message || "Team member removed.");
        await loadAdminTeam();

    } catch (error) {
        console.error("Team deletion error:", error);
        showSettingsMessage(
            error.message || "Unable to delete team member.",
            "error"
        );
    }
}

function cancelAdminTeamEdit() {
    editingTeamMembershipID = "";

    document.getElementById("teamDesignation").value = "";
    document.getElementById("teamDescription").value = "";

    const positionInput = document.getElementById("teamPosition");
    if (positionInput) {
        const highestPosition = adminTeamMembers.reduce(
            (max, member) => Math.max(max, Number(member.displayOrder) || 0),
            0
        );
        positionInput.value = highestPosition + 1;
    }

    const button = document.getElementById("addTeamMemberBtn");
    button.innerHTML =
        '<i class="fa-solid fa-plus"></i> Add to Website Team';
}

async function saveAdminTeam() {
    const memberSelect = document.getElementById("teamMemberSelect");
    const categorySelect = document.getElementById("teamRoleSelect");
    const designationInput = document.getElementById("teamDesignation");
    const descriptionInput = document.getElementById("teamDescription");
    const positionInput = document.getElementById("teamPosition");
    const button = document.getElementById("addTeamMemberBtn");

    const membershipID = memberSelect.value;
    const category = categorySelect.value;
    const designation = designationInput.value.trim();
    const description = descriptionInput.value.trim();
    const displayOrder = Number(positionInput.value);


    if (!membershipID) {
        showSettingsMessage("Please select a member.", "error");
        return;
    }

    if (!designation) {
        showSettingsMessage("Please enter the designation.", "error");
        designationInput.focus();
        return;
    }

    
    if (!Number.isInteger(displayOrder) || displayOrder < 1) {
        showSettingsMessage(
            "Please enter a valid Position Number (1 or greater).",
            "error"
        );
        return;
    }


    button.disabled = true;
    button.textContent = "Saving...";

    try {
        const isEditing = Boolean(editingTeamMembershipID);

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                action: "SAVE_ADMIN_TEAM",
                token: getAdminToken(),
                data: JSON.stringify({
                    membershipID,
                    originalMembershipID: isEditing
                        ? editingTeamMembershipID
                        : "",
                    category,
                    designation,
                    description,
                    displayOrder: displayOrder,
                    active: true
                })
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Unable to save team member.");
        }

        showSettingsMessage(
            result.message || "Team member saved successfully."
        );

        cancelAdminTeamEdit();

        await loadTeamMemberOptions();
        await loadAdminTeam();

    } catch (error) {
        console.error("Team save error:", error);
        showSettingsMessage(
            error.message || "Unable to save team member.",
            "error"
        );
    } finally {
        button.disabled = false;

        button.innerHTML =
            '<i class="fa-solid fa-plus"></i> Add to Website Team';
    }
}


const addTeamMemberBtn = document.getElementById("addTeamMemberBtn");

if (addTeamMemberBtn) {
    addTeamMemberBtn.addEventListener("click", saveAdminTeam);
}

function initializeTeamManagement() {
    loadTeamMemberOptions();
    loadAdminTeam();
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeTeamManagement
    );
} else {
    initializeTeamManagement();
}
