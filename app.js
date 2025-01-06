// Initialize data from localStorage
let sheets = JSON.parse(localStorage.getItem("sheets")) || {};
let currentSheet = null;

// Show create or open sheet options
function showSheetAction() {
    document.getElementById("sheetAction").style.display = "block";
    document.getElementById("existingSheets").style.display = "none";
    document.getElementById("sheetForm").style.display = "none";
    document.getElementById("quotationGenerator").style.display = "none";
}

// Create a new sheet
function createNewSheet() {
    const sheetName = prompt("Enter a name for your new sheet:");

    if (!sheetName) return; // Exit if no name provided

    if (sheets[sheetName]) {
        alert("Sheet with this name already exists. Choose another name.");
        return;
    }

    currentSheet = [];
    sheets[sheetName] = currentSheet;
    localStorage.setItem("sheets", JSON.stringify(sheets));

    document.getElementById("sheetAction").style.display = "none";
    document.getElementById("sheetForm").style.display = "block";
    document.getElementById("sheetFormTitle").innerText = `Create New Sheet: ${sheetName}`;
    clearFields();
}

// Open an existing sheet
// Open an existing sheet
function openExistingSheet() {
    document.getElementById("sheetAction").style.display = "none";
    document.getElementById("existingSheets").style.display = "block";
    const sheetList = document.getElementById("sheetList");
    sheetList.innerHTML = '';

    for (const sheetName in sheets) {
        const li = document.createElement("li");
        li.className = "sheet-item";
        
        const sheetNameSpan = document.createElement("span");
        sheetNameSpan.innerText = sheetName;
        sheetNameSpan.onclick = function () {
            loadSheet(sheetName);
        };
        sheetNameSpan.style.cursor = "pointer";

        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.onclick = function (event) {
            event.stopPropagation(); // Prevent parent click event
            deleteSheet(sheetName);
        };

        li.appendChild(sheetNameSpan);
        li.appendChild(deleteButton);
        sheetList.appendChild(li);
    }
}

// Delete a sheet
function deleteSheet(sheetName) {
    const confirmation = confirm(`Are you sure you want to delete the sheet: "${sheetName}"?`);
    if (confirmation) {
        delete sheets[sheetName];
        localStorage.setItem("sheets", JSON.stringify(sheets));
        alert(`Sheet "${sheetName}" has been deleted.`);
        openExistingSheet(); // Refresh the sheet list
    }
}


// Load an existing sheet
function loadSheet(sheetName) {
    currentSheet = sheets[sheetName];

    document.getElementById("existingSheets").style.display = "none";
    document.getElementById("sheetForm").style.display = "block";
    document.getElementById("sheetFormTitle").innerText = `Editing Sheet: ${sheetName}`;

    clearFields();
    displayExistingData(currentSheet);
}

// Display data rows for existing data
function displayExistingData(sheetData) {
    const dataContainer = document.getElementById("dataContainer");
    dataContainer.innerHTML = '';

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

// Save data to the current sheet
function saveData() {
    const dropdownValue = document.getElementById("productName").value;
    const customValue = document.getElementById("customProductName").value;

    // Use the custom value if it exists; otherwise, use the dropdown value
    const productName = customValue.trim() !== "" ? customValue : dropdownValue;

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

    if (!currentSheet) {
        const sheetName = prompt("Enter a name for your new sheet:");
        if (!sheetName) return;
        currentSheet = [];
        sheets[sheetName] = currentSheet;
    }

    currentSheet.push(newData);
    localStorage.setItem("sheets", JSON.stringify(sheets));
    alert("Data saved successfully!");
    clearFields();
    displayExistingData(currentSheet);
}

// Delete a row of data
function deleteData(index) {
    currentSheet.splice(index, 1);
    localStorage.setItem("sheets", JSON.stringify(sheets));
    displayExistingData(currentSheet);
}

// Export sheet data to Excel
function exportToExcel() {
    if (!currentSheet || currentSheet.length === 0) {
        alert("No data to export!");
        return;
    }

    const data = currentSheet.map(item => ({
        "Product Name": item.productName,
        "Quantity": item.quantity,
        "Rate": item.rate,
        "Amount": item.amount,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `Sheet_${Date.now()}.xlsx`);
}

// Show quotation generator
function showQuotationGenerator() {
    document.getElementById("sheetAction").style.display = "none";
    document.getElementById("quotationGenerator").style.display = "block";
    const sheetList = document.getElementById("quotationSheetList");
    sheetList.innerHTML = '';

    for (const sheetName in sheets) {
        const li = document.createElement("li");
        li.innerText = sheetName;
        li.onclick = function () {
            generateQuotation(sheetName);
        };
        sheetList.appendChild(li);
    }
}

// Generate quotation (Updated for PDF generation)
async function generateQuotation(sheetName) {
    const { jsPDF } = window.jspdf;
    const sheetData = sheets[sheetName];

    if (!sheetData || sheetData.length === 0) {
        alert("No data available in the selected sheet!");
        return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const xStart = 20;
    const columnWidths = [70, 30, 30, 40];

    let yPosition = 40; 
    const headerHeight = 12;
    const rowHeight = 8;

    pdf.setFontSize(12);
    pdf.setFont("courier", "italic");
    pdf.setTextColor(50, 50, 150);
    pdf.text("Innovating the Future", xStart, 20);

    pdf.setFontSize(16);
    pdf.setFont("times", "bold");
    pdf.setTextColor(0, 0, 0);
    pdf.text("Your Organization Name", pageWidth - 100, 20);
    pdf.setFontSize(12);
    pdf.setFont("times", "normal");
    pdf.text("contact@yourorg.com", pageWidth - 100, 25);

    pdf.setLineWidth(0.5);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(xStart, 30, pageWidth - xStart, 30);

    yPosition += 10;

    const headers = ["Product Name", "Quantity", "Rate", "Amount"];
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setFillColor(230, 230, 230);
    pdf.setTextColor(0, 0, 0);

    pdf.rect(xStart, yPosition, columnWidths[0], headerHeight, 'FD');
    pdf.rect(xStart + columnWidths[0], yPosition, columnWidths[1], headerHeight, 'FD');
    pdf.rect(xStart + columnWidths[0] + columnWidths[1], yPosition, columnWidths[2], headerHeight, 'FD');
    pdf.rect(xStart + columnWidths[0] + columnWidths[1] + columnWidths[2], yPosition, columnWidths[3], headerHeight, 'FD');

    headers.forEach((header, i) => {
        const xPos = xStart + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
        pdf.text(header, xPos + 5, yPosition + 7);
    });

    yPosition += headerHeight;

    let totalAmount = 0;
    sheetData.forEach((data) => {
        const row = [
            data.productName,
            data.quantity.toString(),
            data.rate.toString(),
            data.amount.toString(),
        ];

        row.forEach((cell, i) => {
            const xPos = xStart + columnWidths.slice(0, i).reduce((a, b) => a + b, 0);
            pdf.setFont("helvetica", "normal");
            if (i === 2 || i === 3) {
                cell += "/-";  // Add slash after rate
            }
            pdf.text(cell, xPos + 5, yPosition + 5);
        });

        pdf.rect(xStart, yPosition, columnWidths[0], rowHeight);
        pdf.rect(xStart + columnWidths[0], yPosition, columnWidths[1], rowHeight);
        pdf.rect(xStart + columnWidths[0] + columnWidths[1], yPosition, columnWidths[2], rowHeight);
        pdf.rect(xStart + columnWidths[0] + columnWidths[1] + columnWidths[2], yPosition, columnWidths[3], rowHeight);

        totalAmount += data.amount;
        yPosition += rowHeight;

        if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 20;
        }
    });

    const totalRowY = yPosition;
    pdf.setFont("helvetica", "bold");
    pdf.setFillColor(200, 255, 200);
    pdf.rect(xStart, totalRowY, columnWidths[0] + columnWidths[1] + columnWidths[2], rowHeight, 'FD');
    pdf.text("Total", xStart + 5, totalRowY + 5);

    const totalAmountX = xStart + columnWidths[0] + columnWidths[1] + columnWidths[2];
    pdf.setFillColor(255, 255, 102);
    pdf.rect(totalAmountX, totalRowY, columnWidths[3], rowHeight, 'FD');
    pdf.setFont("helvetica", "bold");
    pdf.text(totalAmount.toFixed(2) + "/-", totalAmountX + 10, totalRowY + 5);
    yPosition = totalRowY + rowHeight;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);

    pdf.setLineWidth(0.5);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(xStart, pageHeight - 20, pageWidth - xStart, pageHeight - 20);

    pdf.text(`Page 1 of 1`, pageWidth - 40, pageHeight - 10, { align: "right" });
    pdf.text("Contact Us: contact@yourorg.com", xStart, pageHeight - 10);

    pdf.save(`${sheetName}_Quotation.pdf`);
}

// Utility functions
function clearFields() {
    document.getElementById("productName").value = '';
    document.getElementById("customProductName").value = '';
    document.getElementById("quantity").value = '1';
    document.getElementById("rate").value = '';
    document.getElementById("amount").value = '';
}

// Calculate amount
document.getElementById("quantity").addEventListener("input", calculateAmount);
document.getElementById("rate").addEventListener("input", calculateAmount);

function calculateAmount() {
    const quantity = document.getElementById("quantity").value;
    const rate = document.getElementById("rate").value;
    document.getElementById("amount").value = quantity && rate ? quantity * rate : '';
}

// Event listeners
document.getElementById("newSheetBtn").addEventListener("click", createNewSheet);
document.getElementById("openSheetBtn").addEventListener("click", openExistingSheet);
document.getElementById("quotationGeneratorBtn").addEventListener("click", showQuotationGenerator);
document.getElementById("saveDataBtn").addEventListener("click", saveData);
document.getElementById("exportToExcelBtn").addEventListener("click", exportToExcel);
document.getElementById("backToActionsBtn").addEventListener("click", showSheetAction);
document.getElementById("backToActionsFromFormBtn").addEventListener("click", showSheetAction);
document.getElementById("backToActionsFromQuotationBtn").addEventListener("click", showSheetAction);

// Initialize app
window.onload = showSheetAction;
 
