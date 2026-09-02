/*==================================================
        SHERPAS FORM MASTER DATA
==================================================*/

/*==================================================
        STATES & DISTRICTS
==================================================*/

const STATE_DISTRICTS = {

    "Kerala": [
        "Thiruvananthapuram",
        "Kollam",
        "Pathanamthitta",
        "Alappuzha",
        "Kottayam",
        "Idukki",
        "Ernakulam",
        "Thrissur",
        "Palakkad",
        "Malappuram",
        "Kozhikode",
        "Wayanad",
        "Kannur",
        "Kasaragod"
    ],

    "Tamil Nadu": [
        "Chennai",
        "Coimbatore",
        "Madurai",
        "Salem",
        "Tiruchirappalli",
        "Tirunelveli",
        "Vellore",
        "Erode",
        "Thoothukudi",
        "Kanyakumari"
    ],

    "Karnataka": [
        "Bengaluru",
        "Mysuru",
        "Mangaluru",
        "Hubballi",
        "Belagavi",
        "Shivamogga",
        "Kalaburagi"
    ],

    "Andhra Pradesh": [
        "Visakhapatnam",
        "Vijayawada",
        "Guntur",
        "Kurnool",
        "Nellore",
        "Tirupati"
    ],

    "Telangana": [
        "Hyderabad",
        "Warangal",
        "Karimnagar",
        "Nizamabad",
        "Khammam"
    ]

};

/*==================================================
        MOTORCYCLE MODELS
==================================================*/

const MOTORCYCLES = {

    "Royal Enfield Himalayan 450": [
        "Hanle Black",
        "Kamet White",
        "Slate Poppy Blue",
        "Slate Himalayan Salt",
        "Kaza Brown",
        "Mana Black"
    ],

    "Royal Enfield Guerrilla 450": [
        "Apex Red",
        "Apex Black",
        "Apex Green",
        "Twilight Blue",
        "Shadow Ash",
        "Peix Bronze",
        "Smoke Silver",
        "Brava Blue"
    ]

};

/*==================================================
        BLOOD GROUPS
==================================================*/

const BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-"
];

/*==================================================
        GENDER
==================================================*/

const GENDERS = [
    "Male",
    "Female",
    "Other"
];

/*==================================================
        MARITAL STATUS
==================================================*/

const MARITAL_STATUS = [
    "Single",
    "Married",
    "Divorced",
    "Widowed"
];

/*==================================================
        INITIALIZE FORM DATA
==================================================*/

function initializeFormData() {

    populateStates();
    populateBloodGroups();
    populateGenders();
    populateMaritalStatus();
    populateMotorcycles();

}

/*==================================================
        STATES
==================================================*/

function populateStates() {

    const state = document.getElementById("state");
    if (!state) return;

    state.innerHTML = '<option value="">Select State</option>';

    Object.keys(STATE_DISTRICTS).forEach(item => {

        state.innerHTML += `<option value="${item}">${item}</option>`;

    });

    state.addEventListener("change", function () {

        populateDistricts(this.value);

    });

}

/*==================================================
        DISTRICTS
==================================================*/

function populateDistricts(stateName) {

    const district = document.getElementById("district");

    if (!district) return;

    district.innerHTML = '<option value="">Select District</option>';

    if (!STATE_DISTRICTS[stateName]) return;

    STATE_DISTRICTS[stateName].forEach(item => {

        district.innerHTML += `<option value="${item}">${item}</option>`;

    });

}

/*==================================================
        BLOOD GROUP
==================================================*/

function populateBloodGroups() {

    const blood = document.getElementById("bloodgroup");
    if (!blood) return;

    blood.innerHTML = "";

    BLOOD_GROUPS.forEach(item => {

        blood.innerHTML += `<option value="${item}">${item}</option>`;

    });

}

/*==================================================
        GENDER
==================================================*/

function populateGenders() {

    const gender = document.getElementById("gender");
    if (!gender) return;

    gender.innerHTML = "";

    GENDERS.forEach(item => {

        gender.innerHTML += `<option value="${item}">${item}</option>`;

    });

}

/*==================================================
        MARITAL STATUS
==================================================*/

function populateMaritalStatus() {

    const marital = document.getElementById("maritalstatus");
    if (!marital) return;

    marital.innerHTML = "";

    MARITAL_STATUS.forEach(item => {

        marital.innerHTML += `<option value="${item}">${item}</option>`;

    });

}

/*==================================================
        MOTORCYCLE
==================================================*/

function populateMotorcycles() {

    const bike = document.getElementById("motorcyclemodel");
    if (!bike) return;

    bike.innerHTML = '<option value="">Select Motorcycle</option>';

    Object.keys(MOTORCYCLES).forEach(item => {

        bike.innerHTML += `<option value="${item}">${item}</option>`;

    });

    bike.addEventListener("change", function () {

        populateVariants(this.value);

    });

}

/*==================================================
        VARIANTS
==================================================*/

function populateVariants(model) {

    const variant = document.getElementById("vehiclevariant");
    if (!variant) return;

    variant.innerHTML = '<option value="">Select Colour / Variant</option>';

    if (!MOTORCYCLES[model]) return;

    MOTORCYCLES[model].forEach(item => {

        variant.innerHTML += `<option value="${item}">${item}</option>`;

    });

}

