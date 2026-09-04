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

    