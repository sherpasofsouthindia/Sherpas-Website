let allMembers = [];

let selectedMember = null;

document.addEventListener("DOMContentLoaded", () => {

    loadMembers();

    document
        .getElementById("refreshBtn")
        .addEventListener("click", loadMembers);

    document.getElementById("searchMember")
    .addEventListener("input", function () {

        const keyword = this.value.toLowerCase();

        const filtered = allMembers.filter(member =>

            (member["Application ID"] || "").toLowerCase().includes(keyword) ||

            (member["Full Name"] || "").toLowerCase().includes(keyword) ||

            (member["Phone"] || "").toString().includes(keyword) ||

            (member["Vehicle Registration"] || "").toLowerCase().includes(keyword)

        );

        renderMembers(filtered);

    });

    document
    .getElementById("imageViewer")
    .addEventListener("click",closeImage);

    document
    .querySelector(".close-image")
    .addEventListener("click",closeImage);

    });

async function loadMembers() {

    try {

        const tbody =
            document.getElementById("membersTableBody");

        tbody.innerHTML = `
        <tr>
            <td colspan="7">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading Members...
            </td>
        </tr>`;

        const response = await fetch(API_URL);

        const result = await response.json();
        console.log(result);


        if (!result.success) {

            tbody.innerHTML =
            "<tr><td colspan='7'>No Members Found</td></tr>";

            return;

        }

        console.log(result);
        console.log(result.members);

        allMembers = result.members;

        console.log(allMembers);

        renderMembers(allMembers);

        updateCounts();

    }

    catch (err) {

        console.log(err);

    }

}

function renderMembers(members) {

    const tbody =
        document.getElementById("membersTableBody");

    tbody.innerHTML = "";

    if (members.length == 0) {

        tbody.innerHTML =
        "<tr><td colspan='7'>No Members Found</td></tr>";

        return;

    }

    members.forEach(member => {

        tbody.innerHTML += `

<tr>

<td>${member["Membership ID"]}</td>

<td>

<img
src="${driveToImage(member["Photo URL"])}"
style="
width:50px;
height:50px;
border-radius:50%;
object-fit:cover;
border:2px solid #ff7a00;"
onerror="this.src='assets/user.png'">

</td>

<td>${member["Full Name"]}</td>

<td>${member["Phone"]}</td>

<td>${member["Vehicle Registration"] || "-"}</td>

<td>

<span class="${member.Status.toLowerCase()}">

${member.Status}

</span>

</td>

<td>

<button
class="icon-btn"
onclick="viewMember(${allMembers.indexOf(member)})">

<i class="fa-solid fa-eye"></i>

</button>

${(member["Status"] || "").toLowerCase() === "pending" ? `

<button
class="icon-btn approve"
onclick="approveMember(${allMembers.indexOf(member)})"
title="Approve Member">

<i class="fa-solid fa-circle-check"></i>

</button>

` : ""}

<button
class="icon-btn"
onclick="editMember(${allMembers.indexOf(member)})">

<i class="fa-solid fa-pen"></i>

</td>

</tr>

`;

    });

}

function updateCounts() {

    document.getElementById("totalMembers").innerHTML =
        allMembers.length;

    document.getElementById("approvedMembers").innerHTML =
        allMembers.filter(x => x.Status == "Approved").length;

    document.getElementById("pendingMembers").innerHTML =
        allMembers.filter(x => x.Status == "Pending").length;

    document.getElementById("rejectedMembers").innerHTML =
        allMembers.filter(x => x.Status == "Rejected").length;

}

function searchMembers() {

    const keyword =
        document
        .getElementById("searchMember")
        .value
        .toLowerCase();

    const filtered = allMembers.filter(member =>

        member["Full Name"]
            .toLowerCase()
            .includes(keyword)

        ||

        member["Membership ID"]
            .toLowerCase()
            .includes(keyword)

        ||

        member["Phone"]
            .toLowerCase()
            .includes(keyword)

    );

    renderMembers(filtered);

}

function driveToImage(url){

    if(!url) return "assets/user.png";

    const match = url.match(/\/d\/(.*?)\//);

    if(match){

        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`;

    }

    return url;

}

function viewMember(index){

    const member = allMembers[index];
    
    selectedMember = member;

    const html = `

    <div class="profile-header">

        <img
        src="${driveToImage(member["Photo URL"])}"
        onclick="zoomImage('${driveToImage(member["Photo URL"])}')">

        <div class="profile-info">

            <h2>${member["Full Name"]}</h2>

            <h3>${member["Membership ID"]}</h3>

            <span class="${member["Status"].toLowerCase()}">

                ${member["Status"]}

            </span>

        </div>

    </div>

    <div class="details-grid">

        <div class="detail-card">

            <h3>Personal Information</h3>

            <p><strong>Date of Birth :</strong> ${formatDate(member["Date of Birth"] || "-")}</p>
            <p><strong>Blood Group :</strong> ${member["Blood Group"] || "-"}</p>
            <p><strong>Phone :</strong> ${member["Phone"] || "-"}</p>
            <p><strong>Email :</strong> ${member["Email"] || "-"}</p>

        </div>

        <div class="detail-card">

            <h3>Address</h3>

            <p>${member["Address"] || "-"}</p>

            <p><strong>District :</strong> ${member["District"] || "-"}</p>

        </div>

        <div class="detail-card">

            <h3>Vehicle Details</h3>

            <p><strong>Registration :</strong> ${member["Vehicle Registration"] || "-"}</p>

            <p><strong>Driving Licence :</strong> ${member["Driving Licence"] || "-"}</p>

        </div>

        <div class="detail-card">

            <h3>Emergency Contact</h3>

            <p><strong>Primary :</strong> ${member["Emergency Contact 1"] || "-"}</p>

            <p><strong>Secondary :</strong> ${member["Emergency Contact 2"] || "-"}</p>

        </div>

        <div class="detail-card">

            <h3>Signature</h3>

            <img
            src="${driveToImage(member["Signature URL"])}"
            onclick="zoomImage('${driveToImage(member["Signature URL"])}')">

        </div>

        <div class="detail-card">

            <h3>Payment Proof</h3>

            <img
            src="${driveToImage(member["Payment Proof URL"])}"
            onclick="zoomImage('${driveToImage(member["Payment Proof URL"])}')">

        </div>

    </div>

    `;

    let buttons="";

    switch(member["Status"]){

        case "Pending":

            buttons=`

            <div class="profile-actions">

                <button class="btn-success"
                    onclick="approveSelectedMember()">

                    <i class="fa-solid fa-circle-check"></i>

                    Approve

                </button>

                <button class="btn-danger"
                    onclick="rejectSelectedMember()">

                    <i class="fa-solid fa-ban"></i>

                    Reject

                </button>

                <button class="btn-primary"
                    onclick="editSelectedMember()">

                    <i class="fa-solid fa-pen"></i>

                    Edit

                </button>

            </div>

            `;

        break;

        case "Approved":

            buttons=`

            <div class="profile-actions">

                <button class="btn-warning"
                    onclick="changeMemberStatus('Inactive')">

                    <i class="fa-solid fa-user-slash"></i>

                    Deactivate

                </button>

                <button class="btn-primary"
                    onclick="editSelectedMember()">

                    <i class="fa-solid fa-pen"></i>

                    Edit

                </button>

                <button class="btn-info"
                    onclick="printMembershipCard()">

                    <i class="fa-solid fa-id-card"></i>

                    Print Card

                </button>

            </div>

            `;

        break;

        case "Inactive":

            buttons=`

            <div class="profile-actions">

                <button class="btn-success"
                    onclick="changeMemberStatus('Approved')">

                    <i class="fa-solid fa-user-check"></i>

                    Activate

                </button>

                <button class="btn-primary"
                    onclick="editSelectedMember()">

                    <i class="fa-solid fa-pen"></i>

                    Edit

                </button>

            </div>

            `;

        break;

        case "Rejected":

            buttons=`

            <div class="profile-actions">

                <button class="btn-success"
                    onclick="approveSelectedMember()">

                    <i class="fa-solid fa-circle-check"></i>

                    Approve

                </button>

                <button class="btn-primary"
                    onclick="editSelectedMember()">

                    <i class="fa-solid fa-pen"></i>

                    Edit

                </button>

            </div>

            `;

        break;

    }

    document.getElementById("memberDetails").innerHTML = html + buttons;

    document.getElementById("memberModal").style.display = "block";

}

document.querySelector(".close-modal").onclick = function(){

    document.getElementById("memberModal").style.display = "none";

}

window.onclick = function(event){

    if(event.target == document.getElementById("memberModal")){

        document.getElementById("memberModal").style.display = "none";

    }

}
function formatDate(date){

    if(!date) return "-";

    return new Date(date).toLocaleDateString("en-IN",{
        day:"2-digit",
        month:"long",
        year:"numeric"
    });

}

let currentScale = 1;
let translateX = 0;
let translateY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

function zoomImage(src){

    const viewer = document.getElementById("imageViewer");
    const img = document.getElementById("viewerImage");

    currentScale = 1;
    translateX = 0;
    translateY = 0;

    img.src = src;

    img.style.transform = "translate(0px,0px) scale(1)";

    viewer.style.display="flex";

}

const viewer=document.getElementById("imageViewer");
const viewerImg=document.getElementById("viewerImage");

document.getElementById("imageViewer").addEventListener("wheel", function(e){

    e.preventDefault();

    if(e.deltaY<0){

        currentScale+=0.2;

    }else{

        currentScale-=0.2;

    }

    if(currentScale<1) currentScale=1;

    if(currentScale>6) currentScale=6;

    viewerImg.style.transform=
    `translate(${translateX}px,${translateY}px)
     scale(${currentScale})`;

}, { passive:false });

viewerImg.addEventListener("mousedown",function(e){

    if(currentScale==1) return;

    isDragging=true;

    startX=e.clientX-translateX;

    startY=e.clientY-translateY;

    viewerImg.style.cursor="grabbing";

});

document.addEventListener("mousemove",function(e){

    if(!isDragging) return;

    translateX=e.clientX-startX;

    translateY=e.clientY-startY;

    viewerImg.style.transform=
    `translate(${translateX}px,${translateY}px)
     scale(${currentScale})`;

});

document.addEventListener("mouseup",function(){

    isDragging=false;

    viewerImg.style.cursor="grab";

});

viewerImg.addEventListener("dblclick",function(){

    currentScale=1;

    translateX=0;

    translateY=0;

    viewerImg.style.transform="translate(0px,0px) scale(1)";

});

document.addEventListener("keydown",function(e){

    if(e.key==="Escape"){

        closeImage();

    }

});

function closeImage(){

    document.getElementById("imageViewer").style.display="none";

}

function editMember(index){

    const member = allMembers[index];

    window.location.href =
        "edit-member.html?id=" +
        member["Membership ID"];

}

async function approveMember(index) {

    const member = allMembers[index];

    const confirm = await Swal.fire({
        title: "Approve Member?",
        text: member["Full Name"],
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Approve"
    });

    if (!confirm.isConfirmed) return;

    const formData = new URLSearchParams();

    formData.append("action", "APPROVE_MEMBER");

    formData.append(
        "data",
        JSON.stringify({
            applicationID: member["Application ID"]
        })
    );

    const response = await fetch(API_URL, {
        method: "POST",
        body: formData
    });

    const result = await response.json();

    if(result.success){

        Swal.fire({

            icon: "success",

            title: "Member Approved",

            html: `
                <h2 style="color:#ff7a00">
                    ${result.data.memberID}
                </h2>

                <p>Application Approved Successfully</p>
            `

        });

        loadMembers();

    }else{

        Swal.fire(
            "Error",
            result.message,
            "error"
        );

    }

}

function approveSelectedMember(){

    // Close member profile popup
    document.getElementById("memberModal").style.display = "none";

    // Open SweetAlert
    approveMember(
        allMembers.indexOf(selectedMember)
    );

}

function editSelectedMember(){

    editMember(
        allMembers.indexOf(selectedMember)
    );

}

async function changeMemberStatus(status){

    document.getElementById("memberModal").style.display="none";

    const confirm = await Swal.fire({

        icon:"question",

        title:status=="Inactive"
            ?"Deactivate Member?"
            :"Activate Member?",

        text:selectedMember["Full Name"],

        showCancelButton:true,

        confirmButtonText:status

    });

    if(!confirm.isConfirmed)
        return;

    const formData=new URLSearchParams();

    formData.append("action","CHANGE_STATUS");

    formData.append(

        "data",

        JSON.stringify({

            memberID:selectedMember["Membership ID"],

            status:status

        })

    );

    const response=await fetch(API_URL,{

        method:"POST",

        body:formData

    });

    const result=await response.json();

    if(result.success){

        Swal.fire(

            "Success",

            result.message,

            "success"

        );

        loadMembers();

    }

}

async function rejectSelectedMember(){

    document.getElementById("memberModal").style.display = "none";

    const { value: reason } = await Swal.fire({

        title: "Reject Member",

        input: "textarea",

        inputLabel: "Reason",

        inputPlaceholder: "Enter rejection reason...",

        showCancelButton: true,

        confirmButtonText: "Reject",

        confirmButtonColor: "#dc2626",

        inputValidator: (value)=>{

            if(!value){

                return "Please enter rejection reason.";

            }

        }

    });

    if(!reason) return;

    const formData = new URLSearchParams();

    formData.append("action","REJECT_MEMBER");

    formData.append(

        "data",

        JSON.stringify({

            memberID:selectedMember["Membership ID"],

            reason:reason

        })

    );

    const response = await fetch(API_URL,{

        method:"POST",

        body:formData

    });

    const result = await response.json();

    if(result.success){

        Swal.fire(

            "Rejected",

            result.message,

            "success"

        );

        loadMembers();

    }else{

        Swal.fire(

            "Error",

            result.message,

            "error"

        );

    }

}
function printMembershipCard(){

    alert("Coming Soon");

}
