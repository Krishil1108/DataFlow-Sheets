// Initialize data from localStorage
let sheets = JSON.parse(localStorage.getItem("sheets")) || {};
let currentSheet = null;  // Track the current sheet being edited

// Show create or open sheet options
function showSheetAction() {
    document.getElementById("sheetAction").style.display = "block";
    document.getElementById("existingSheets").style.display = "none";
    document.getElementById("sheetForm").style.display = "none";
    document.getElementById("sheetFormTitle").innerText = "Create or Open Sheet";
}

function createNewSheet() {
    const sheetName = prompt("Enter a name for your new sheet:");

    if (!sheetName) return;  // If no name is provided, exit

    // If sheet already exists, ask to overwrite or cancel
    if (sheets[sheetName]) {
        alert("Sheet with this name already exists. Choose another name.");
        return;
    }

    // Initialize the new sheet as an empty array
    currentSheet = [];
    sheets[sheetName] = currentSheet;
    localStorage.setItem("sheets", JSON.stringify(sheets));

    document.getElementById("sheetAction").style.display = "none";
    document.getElementById("sheetForm").style.display = "block";
    document.getElementById("sheetFormTitle").innerText = `Create New Sheet: ${sheetName}`;
    clearFields();
}

// Open an existing sheet
function openExistingSheet() {
    document.getElementById("sheetAction").style.display = "none";
    document.getElementById("existingSheets").style.display = "block";
    const sheetList = document.getElementById("sheetList");
    sheetList.innerHTML = '';

    for (const sheetName in sheets) {
        const li = document.createElement("li");
        li.innerText = sheetName;
        li.onclick = function () {
            loadSheet(sheetName);
        };
        sheetList.appendChild(li);
    }
}

// Load an existing sheet and show data entry fields
function loadSheet(sheetName) {
    currentSheet = sheets[sheetName];

    document.getElementById("existingSheets").style.display = "none";
    document.getElementById("sheetForm").style.display = "block";
    document.getElementById("sheetFormTitle").innerText = `Editing Sheet: ${sheetName}`;

    // Clear previous fields and display the existing data
    clearFields();
    displayExistingData(currentSheet);
}

// Display the existing data in the form with a Delete button for each item
function displayExistingData(sheetData) {
    const dataContainer = document.getElementById("dataContainer");
    dataContainer.innerHTML = ''; // Clear existing entries

    sheetData.forEach((data, index) => {
        const row = document.createElement("div");
        row.classList.add("data-row");

        row.innerHTML = `
            <p><strong>Product Name:</strong> ${data.productName}</p>
            <p><strong>Quantity:</strong> ${data.quantity}</p>
            <p><strong>Rate:</strong> ${data.rate}</p>
            <p><strong>Amount:</strong> ${data.amount}</p>
            <button onclick="deleteData(${index})">Delete</button>
            <hr>
        `;

        dataContainer.appendChild(row);
    });
}

// Function to delete the data from the list
function deleteData(index) {
    if (confirm("Are you sure you want to delete this data?")) {
        // Remove the data at the specified index
        currentSheet.splice(index, 1);
        localStorage.setItem("sheets", JSON.stringify(sheets));
        alert("Data deleted successfully!");

        // Display the updated data
        displayExistingData(currentSheet);
    }
}

// Save data (either in new sheet or append to existing sheet)
function saveData() {
    const productName = document.getElementById("productName").value;
    const quantity = document.getElementById("quantity").value;
    const rate = document.getElementById("rate").value;
    const amount = document.getElementById("amount").value;

    if (!productName || !quantity || !rate) {
        alert("Please fill in all fields!");
        return;
    }

    const newData = {
        productName,
        quantity: parseFloat(quantity),
        rate: parseFloat(rate),
        amount: parseFloat(amount),
    };

    // If no current sheet, prompt for new sheet name
    if (!currentSheet) {
        const sheetName = prompt("Enter a name for your new sheet:");
        if (!sheetName) return;

        currentSheet = [];
        sheets[sheetName] = currentSheet;
    }

    // Add data to current sheet
    currentSheet.push(newData);
    localStorage.setItem("sheets", JSON.stringify(sheets));
    alert("Data saved successfully!");
    clearFields();

    // Display the updated data
    displayExistingData(currentSheet);
}

// Calculate the amount (quantity * rate)
document.getElementById("quantity").addEventListener("input", calculateAmount);
document.getElementById("rate").addEventListener("input", calculateAmount);

function calculateAmount() {
    const quantity = document.getElementById("quantity").value;
    const rate = document.getElementById("rate").value;
    if (quantity && rate) {
        document.getElementById("amount").value = quantity * rate;
    }
}

function clearFields() {
    document.getElementById("productName").value = '';
    document.getElementById("quantity").value = '';
    document.getElementById("rate").value = '';
    document.getElementById("amount").value = '';
}

// Export data to Excel
function exportToExcel() {
    if (!currentSheet || currentSheet.length === 0) {
        alert("No data to export!");
        return;
    }

    // Prepare data for SheetJS
    const data = currentSheet.map(item => ({
        "Product Name": item.productName,
        "Quantity": item.quantity,
        "Rate": item.rate,
        "Amount": item.amount,
    }));

    // Convert the data to a worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Export the workbook as an Excel file
    XLSX.writeFile(wb, `${Object.keys(sheets)[0] || "Sheet"}_data.xlsx`);
}

window.onload = showSheetAction;
