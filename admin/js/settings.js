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
   LOAD MEMBERS FOR TEAM MANAGEMENT
========================================= */


let adminTeamMembers = [];
let approvedTeamMembers = [];
let editingTeamMembershipID = "";

async function loadAdminTeam() {
    const tbody = document.getElementById("websiteTeamTableBody");
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5">Loading team members...</td></tr>';

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

        // Load approved members to map Membership ID to Full Name.
        const memberResponse = await fetch(API_URL);
        const memberResult = await memberResponse.json();

        approvedTeamMembers = memberResult.success &&
            Array.isArray(memberResult.members)
            ? memberResult.members.filter(member =>
                String(member["Status"] || "").trim().toLowerCase() === "approved"
            )
            : [];

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
            '<tr><td colspan="5">No team members added yet.</td></tr>';
        return;
    }

    adminTeamMembers.forEach(member => {
        const row = document.createElement("tr");

        const profile = approvedTeamMembers.find(person =>
            String(person["Membership ID"] || "").trim() ===
            String(member.membershipID || "").trim()
        );

        const fullName = profile
            ? String(profile["Full Name"] || "").trim()
            : "Member not found";

        const memberCell = document.createElement("td");
        memberCell.textContent =
            `${fullName} (${member.membershipID || "-"})`;
        row.appendChild(memberCell);

        [
            member.category === "admin" ? "Admin / Leadership" : "Supporting Team",
            member.designation,
            member.description
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value || "-";
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => editAdminTeamMember(member));

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.style.marginLeft = "6px";
        deleteButton.addEventListener("click", () => deleteAdminTeamMember(member));

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);

        tbody.appendChild(row);
    });
}

function editAdminTeamMember(member) {
    const memberSelect = document.getElementById("teamMemberSelect");
    const categorySelect = document.getElementById("teamRoleSelect");
    const designationInput = document.getElementById("teamDesignation");
    const descriptionInput = document.getElementById("teamDescription");
    const saveButton = document.getElementById("addTeamMemberBtn");

    editingTeamMembershipID = String(member.membershipID || "").trim();

    memberSelect.value = editingTeamMembershipID;
    categorySelect.value = member.category || "admin";
    designationInput.value = member.designation || "";
    descriptionInput.value = member.description || "";

    saveButton.innerHTML = "Update Team Member";

    showSettingsMessage(
        "Edit the details above, then click Update Team Member."
    );

    document.getElementById("teamManagementCard")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function deleteAdminTeamMember(member) {
    const membershipID = String(member.membershipID || "").trim();

    if (!membershipID) return;

    const confirmed = window.confirm(
        `Remove ${membershipID} from the website team? Their membership record will remain unchanged.`
    );

    if (!confirmed) return;

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
        showSettingsMessage(error.message || "Unable to delete team member.", "error");
    }
}

function cancelAdminTeamEdit() {
    editingTeamMembershipID = "";

    document.getElementById("teamDesignation").value = "";
    document.getElementById("teamDescription").value = "";

    const saveButton = document.getElementById("addTeamMemberBtn");
    saveButton.innerHTML =
        '<i class="fa-solid fa-plus"></i> Add to Website Team';
}

document.addEventListener("DOMContentLoaded", loadAdminTeam);



async function loadAdminTeam() {
    const tbody = document.getElementById("websiteTeamTableBody");
    if (!tbody) return;

    tbody.innerHTML =
        '<tr><td colspan="5">Loading admin team...</td></tr>';

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
            throw new Error(result.message || "Unable to load admin team.");
        }

        if (result.data.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="5">No team members added yet.</td></tr>';
            return;
        }

        tbody.innerHTML = "";

        result.data.forEach(member => {
            const row = document.createElement("tr");

            [
                member.membershipID,
                member.category,
                member.designation,
                member.description,
                member.active ? "Active" : "Inactive"
            ].forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value || "-";
                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Admin team loading error:", error);
        tbody.innerHTML =
            '<tr><td colspan="5">Unable to load admin team.</td></tr>';
    }
}

document.addEventListener("DOMContentLoaded", loadAdminTeam);


async function saveAdminTeam() {
    const memberSelect = document.getElementById("teamMemberSelect");
    const categorySelect = document.getElementById("teamRoleSelect");
    const designationInput = document.getElementById("teamDesignation");
    const descriptionInput = document.getElementById("teamDescription");
    const saveButton = document.getElementById("addTeamMemberBtn");

    const membershipID = memberSelect.value;
    const category = categorySelect.value;
    const designation = designationInput.value.trim();
    const description = descriptionInput.value.trim();

    if (!membershipID) {
        showSettingsMessage("Please select a member.", "error");
        return;
    }

    if (!designation) {
        showSettingsMessage("Please enter the designation.", "error");
        designationInput.focus();
        return;
    }

    saveButton.disabled = true;
    saveButton.innerHTML = "Saving...";

    try {
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
                    category,
                    designation,
                    description,
                    displayOrder: Date.now(),
                    active: true
                })
            })
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Unable to save team member.");
        }

        showSettingsMessage(result.message || "Team member saved successfully.");
        designationInput.value = "";
        descriptionInput.value = "";

        await loadAdminTeam();

    } catch (error) {
        console.error("Team save error:", error);
        showSettingsMessage(error.message || "Unable to save team member.", "error");
    } finally {
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fa-solid fa-plus"></i> Add to Website Team';
    }
}

const addTeamMemberBtn = document.getElementById("addTeamMemberBtn");

if (addTeamMemberBtn) {
    addTeamMemberBtn.addEventListener("click", saveAdminTeam);
}

