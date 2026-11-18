/* ===================================================
   BHARAT YATRA HOLIDAYS - JAVASCRIPT & SUPABASE
   Simple, beginner-friendly vanilla JS with Supabase connection.
   =================================================== */

// ==========================================
// 1. SUPABASE CLIENT INITIALIZATION
// ==========================================
const SUPABASE_URL = (typeof ENV !== 'undefined' && ENV.SUPABASE_URL) ? ENV.SUPABASE_URL : "https://hriqaqalseortxzrpjeu.supabase.co";
const SUPABASE_KEY = (typeof ENV !== 'undefined' && ENV.SUPABASE_KEY) ? ENV.SUPABASE_KEY : "sb_publishable__xCwnrsOtleqXSItY6cITw_dmyYiAgA";

let db = null;
if (window.supabase) {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Connected to Supabase!");
}

// Default Fallback Data (used when offline or before tables are initialized)
let packages = [
    {
        id: 1,
        destination: "Kashmir Paradise (Srinagar & Gulmarg)",
        price: 25000,
        days: 5,
        hotel: "Grand Pine Houseboat & Resort (4★)",
        image: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=600&auto=format&fit=crop&q=80",
        itinerary: ["Day 1: Srinagar Dal Lake Shikara ride", "Day 2: Gulmarg Gondola cable car", "Day 3: Pahalgam valley tour", "Day 4: Mughal Gardens visit", "Day 5: Airport drop"],
        dates: ["2026-06-10", "2026-07-15", "2026-08-20"]
    },
    {
        id: 2,
        destination: "Goa Beach & Coastal Carnival",
        price: 15000,
        days: 4,
        hotel: "Goa Bay View Resort (4★)",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80",
        itinerary: ["Day 1: Arrival & Baga beach chill", "Day 2: Calangute water sports", "Day 3: Dudhsagar Falls & spice farm", "Day 4: Old Goa churches & departure"],
        dates: ["2026-06-05", "2026-07-20", "2026-09-12"]
    },
    {
        id: 3,
        destination: "Manali & Solang Snow Valley",
        price: 18000,
        days: 5,
        hotel: "Snow Valley Himalayan Inn (4★)",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80",
        itinerary: ["Day 1: Drive to Manali & check-in", "Day 2: Hadimba Temple & Mall Road", "Day 3: Solang Valley snow sports", "Day 4: Atal Tunnel visit", "Day 5: Return journey"],
        dates: ["2026-05-20", "2026-06-25", "2026-08-15"]
    },
    {
        id: 4,
        destination: "Kerala Backwaters & Munnar",
        price: 22000,
        days: 6,
        hotel: "Alleppey Lake Palace (4★)",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=80",
        itinerary: ["Day 1: Kochi to Munnar tea gardens", "Day 2: Eravikulam National Park", "Day 3: Periyar wildlife boat ride", "Day 4: Alleppey houseboat stay", "Day 5: Ayurveda massage", "Day 6: Airport drop"],
        dates: ["2026-06-15", "2026-08-10", "2026-10-05"]
    }
];

let bookings = [
    { id: "BK-101", customerName: "Rahul Sharma", email: "rahul@example.com", idProof: "5829 1948 2910", destination: "Kashmir Paradise (Srinagar & Gulmarg)", travelDate: "2026-06-10", status: "Confirmed" },
    { id: "BK-102", customerName: "Priya Patel", email: "priya@example.com", idProof: "8291 3847 1029", destination: "Goa Beach & Coastal Carnival", travelDate: "2026-07-20", status: "Pending" }
];

let selectedCompare = [];

// ==========================================
// 2. FETCH DATA FROM SUPABASE
// ==========================================
async function loadDataFromSupabase() {
    if (!db) {
        renderPackages();
        renderCustomerBookings();
        renderAdminBookings();
        return;
    }

    // Try fetching packages from Supabase
    try {
        let { data: pkgData, error: pkgErr } = await db.from('packages').select('*');
        if (!pkgErr && pkgData && pkgData.length > 0) {
            packages = pkgData;
        }
    } catch (e) {
        console.log("Using local packages");
    }
    renderPackages();

    // Try fetching bookings from Supabase
    try {
        let { data: bData, error: bErr } = await db.from('bookings').select('*');
        if (!bErr && bData && bData.length > 0) {
            bookings = bData.map(b => ({
                id: b.id,
                customerName: b.customer_name || b.customerName,
                email: b.email,
                idProof: b.id_proof || b.idProof,
                destination: b.destination,
                travelDate: b.travel_date || b.travelDate,
                status: b.status
            }));
        }
    } catch (e) {
        console.log("Using local bookings");
    }
    renderCustomerBookings();
    renderAdminBookings();
}

// ==========================================
// 3. SWITCH VIEWS (Customer vs Admin)
// ==========================================
function switchView(view) {
    let custView = document.getElementById("customer-view");
    let adminView = document.getElementById("admin-view");
    let btnCust = document.getElementById("btn-customer");
    let btnAdmin = document.getElementById("btn-admin");

    if (view === "customer") {
        custView.style.display = "block";
        adminView.style.display = "none";
        btnCust.className = "nav-btn active-tab";
        btnAdmin.className = "nav-btn";
    } else {
        custView.style.display = "none";
        adminView.style.display = "block";
        btnAdmin.className = "nav-btn active-tab";
        btnCust.className = "nav-btn";
        renderAdminBookings();
    }
}

// ==========================================
// 4. RENDER PACKAGE CARDS & DROPDOWNS
// ==========================================
function renderPackages() {
    let grid = document.getElementById("package-grid");
    grid.innerHTML = "";

    packages.forEach(function (pkg) {
        let isChecked = selectedCompare.includes(pkg.id) ? "checked" : "";
        let card = document.createElement("div");
        card.className = "package-card";
        card.innerHTML = `
            <img src="${pkg.image}" class="package-img" alt="${pkg.destination}">
            <h3>${pkg.destination}</h3>
            <div class="package-price">₹${pkg.price.toLocaleString('en-IN')}</div>
            <p style="font-size: 12px; color: #666;">⏱️ ${pkg.days} Days | 🏨 ${pkg.hotel}</p>
            <div class="card-footer">
                <label style="font-size: 12px; cursor: pointer;">
                    <input type="checkbox" onchange="toggleCompare(${pkg.id}, this.checked)" ${isChecked}> Compare
                </label>
                <button class="btn btn-orange" onclick="showDetails(${pkg.id})">Details</button>
            </div>
        `;
        grid.appendChild(card);
    });

    populatePackageDropdown();
}

// ==========================================
// 5. PACKAGE COMPARISON LOGIC
// ==========================================
function toggleCompare(id, checked) {
    if (checked) {
        if (!selectedCompare.includes(id)) selectedCompare.push(id);
    } else {
        selectedCompare = selectedCompare.filter(item => item !== id);
    }
    renderComparison();
}

function renderComparison() {
    let box = document.getElementById("comparison-box");
    let table = document.getElementById("comparison-table");

    if (selectedCompare.length < 2) {
        box.style.display = "none";
        return;
    }

    box.style.display = "block";
    let list = packages.filter(p => selectedCompare.includes(p.id));

    let header = "<tr><th>Feature</th>" + list.map(p => `<th>${p.destination}</th>`).join("") + "</tr>";
    let price = "<tr><td><b>Price</b></td>" + list.map(p => `<td><b style="color:#e65100">₹${p.price.toLocaleString('en-IN')}</b></td>`).join("") + "</tr>";
    let duration = "<tr><td><b>Days</b></td>" + list.map(p => `<td>${p.days} Days</td>`).join("") + "</tr>";
    let hotel = "<tr><td><b>Hotel</b></td>" + list.map(p => `<td>${p.hotel}</td>`).join("") + "</tr>";

    table.innerHTML = header + price + duration + hotel;
}

// ==========================================
// 6. PACKAGE DETAILS VIEW
// ==========================================
function showDetails(id) {
    let pkg = packages.find(p => p.id === id);
    if (!pkg) return;

    let box = document.getElementById("detail-box");
    let content = document.getElementById("detail-content");

    let itineraryHTML = pkg.itinerary.map(item => `<li>${item}</li>`).join("");
    let datesHTML = pkg.dates.map(d => `<option value="${d}">${d}</option>`).join("");

    content.innerHTML = `
        <img src="${pkg.image}" class="detail-img" alt="${pkg.destination}">
        <div class="detail-info">
            <h3 style="color:#e65100;">${pkg.destination}</h3>
            <p><b>Price:</b> ₹${pkg.price.toLocaleString('en-IN')} | <b>Duration:</b> ${pkg.days} Days</p>
            <p><b>Hotel:</b> ${pkg.hotel}</p>
            <p style="margin-top: 8px;"><b>Available Dates:</b> <select id="detail-date">${datesHTML}</select></p>
            <p style="margin-top: 8px;"><b>Itinerary:</b></p>
            <ul>${itineraryHTML}</ul>
            <button class="btn btn-green" onclick="selectAndBook(${pkg.id})">Book This Package</button>
        </div>
    `;

    box.style.display = "block";
    window.location.hash = "detail-box";
}

function closeDetails() {
    document.getElementById("detail-box").style.display = "none";
}

function selectAndBook(id) {
    let pkgSelect = document.getElementById("book-pkg-select");
    pkgSelect.value = id;
    handlePackageChange();
    let detailDate = document.getElementById("detail-date");
    if (detailDate) document.getElementById("book-date-select").value = detailDate.value;
    window.location.hash = "booking-box";
}

// ==========================================
// 7. BOOKING SYSTEM & SUPABASE INSERT
// ==========================================
function populatePackageDropdown() {
    let select = document.getElementById("book-pkg-select");
    select.innerHTML = '<option value="">-- Choose Package --</option>';
    packages.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.destination} (₹${p.price.toLocaleString('en-IN')})</option>`;
    });
}

function handlePackageChange() {
    let id = parseInt(document.getElementById("book-pkg-select").value);
    let dateSelect = document.getElementById("book-date-select");
    dateSelect.innerHTML = '<option value="">-- Choose Date --</option>';

    let pkg = packages.find(p => p.id === id);
    if (pkg) {
        pkg.dates.forEach(d => {
            dateSelect.innerHTML += `<option value="${d}">${d}</option>`;
        });
    }
}

async function handleBooking(e) {
    e.preventDefault();
    let pkgId = parseInt(document.getElementById("book-pkg-select").value);
    let pkg = packages.find(p => p.id === pkgId);

    let newBooking = {
        id: "BK-" + (100 + bookings.length + 1),
        customerName: document.getElementById("passenger-name").value.trim(),
        email: document.getElementById("passenger-email").value.trim(),
        idProof: document.getElementById("passenger-id").value.trim(),
        destination: pkg ? pkg.destination : "Custom Package",
        travelDate: document.getElementById("book-date-select").value,
        status: "Pending"
    };

    // Update locally
    bookings.unshift(newBooking);
    alert("Booking successful!");

    // Save to Supabase Backend
    if (db) {
        try {
            await db.from('bookings').insert([{
                id: newBooking.id,
                customer_name: newBooking.customerName,
                email: newBooking.email,
                id_proof: newBooking.idProof,
                destination: newBooking.destination,
                travel_date: newBooking.travelDate,
                status: newBooking.status
            }]);
            console.log("Booking saved to Supabase:", newBooking.id);
        } catch (err) {
            console.log("Could not save to Supabase:", err);
        }
    }

    document.getElementById("booking-form").reset();
    document.getElementById("book-date-select").innerHTML = '<option value="">-- Choose Date --</option>';

    renderCustomerBookings();
    renderAdminBookings();
}

function renderCustomerBookings() {
    let tbody = document.getElementById("customer-history-tbody");
    tbody.innerHTML = "";
    bookings.forEach(b => {
        let statusClass = "status-" + b.status.toLowerCase();
        tbody.innerHTML += `
            <tr>
                <td><b>${b.id}</b></td>
                <td>${b.destination}</td>
                <td>${b.travelDate}</td>
                <td>${b.customerName}</td>
                <td>${b.idProof}</td>
                <td><span class="${statusClass}">${b.status}</span></td>
            </tr>
        `;
    });
}

// ==========================================
// 8. ADMIN ACTIONS & SUPABASE SYNC
// ==========================================
async function handleAddPackage(e) {
    e.preventDefault();
    let dest = document.getElementById("add-dest").value.trim();
    let price = parseInt(document.getElementById("add-price").value);
    let days = parseInt(document.getElementById("add-days").value);
    let hotel = document.getElementById("add-hotel").value.trim();
    let dates = document.getElementById("add-dates").value.split(",").map(d => d.trim());
    let img = document.getElementById("add-image").value.trim() || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=80";
    let itinerary = document.getElementById("add-itinerary").value.split(",").map(i => i.trim());

    let newPkg = {
        id: packages.length + 1,
        destination: dest,
        price: price,
        days: days,
        hotel: hotel,
        image: img,
        itinerary: itinerary,
        dates: dates
    };

    // Update locally
    packages.push(newPkg);
    alert("Package added successfully!");

    // Save to Supabase Backend
    if (db) {
        try {
            await db.from('packages').insert([{
                destination: dest,
                price: price,
                days: days,
                hotel: hotel,
                image: img,
                itinerary: itinerary,
                dates: dates
            }]);
            console.log("Package saved to Supabase:", dest);
        } catch (err) {
            console.log("Could not save to Supabase:", err);
        }
    }

    document.getElementById("add-pkg-form").reset();
    renderPackages();
}

function renderAdminBookings() {
    let tbody = document.getElementById("admin-bookings-tbody");
    tbody.innerHTML = "";
    bookings.forEach(b => {
        tbody.innerHTML += `
            <tr>
                <td><b>${b.id}</b></td>
                <td>${b.customerName}</td>
                <td>${b.email}</td>
                <td>${b.idProof}</td>
                <td>${b.destination}</td>
                <td>${b.travelDate}</td>
                <td>
                    <select onchange="changeStatus('${b.id}', this.value)">
                        <option value="Pending" ${b.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="Confirmed" ${b.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
                        <option value="Cancelled" ${b.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                    </select>
                </td>
            </tr>
        `;
    });
}

async function changeStatus(id, newStatus) {
    let b = bookings.find(item => item.id === id);
    if (b) {
        b.status = newStatus;
        renderCustomerBookings();
    }

    // Update in Supabase Backend
    if (db) {
        try {
            await db.from('bookings').update({ status: newStatus }).eq('id', id);
            console.log("Status updated in Supabase for:", id, "->", newStatus);
        } catch (err) {
            console.log("Could not update status in Supabase:", err);
        }
    }
}

// ==========================================
// 9. INITIALIZE ON LOAD
// ==========================================
window.onload = function () {
    loadDataFromSupabase();
};
