const fs = require("fs");

// File names
const inputFile = "output.csv";
const outputFile = "output_final.csv";

// Categories in required order
const targetCategories = [
  "Civil & Structural Works",
  "Shore Piling & Excavation",
  "Finishing Works",
  "Aluminium Works",
  "MEP including Elevators",
  "Parking System",
  "Addon Cost",
  "Professional Fees",
  "Common Infra Works",
  "IGBC related cost",
  "Safety @ 0.5 %",
];

try {
  // Read CSV
  const data = fs.readFileSync(inputFile, "utf8");
  const lines = data.split(/\r?\n/);

  // Column indexes from CSV
  // Adjust these if your CSV structure changes
const DESCRIPTION_INDEX = 1;
const COC_INDEX = 2;
const COMMITMENT_INDEX = 4;
const ASSIGNED_INDEX = 5;
const BUDGET_AVAIL_INDEX = 6;

  // Initialize sums object
  const sums = {};

  targetCategories.forEach((cat) => {
    sums[cat] = {
      coc: 0,
      commitment: 0,
      assigned: 0,
      budgetAvail: 0,
    };
  });

  // Process rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    const columns = line.split(",");

    const description = columns[DESCRIPTION_INDEX]
      ? columns[DESCRIPTION_INDEX].trim()
      : "";

    if (!sums.hasOwnProperty(description)) continue;

    sums[description].coc += parseFloat(columns[COC_INDEX]) || 0;
    sums[description].commitment +=
      parseFloat(columns[COMMITMENT_INDEX]) || 0;
    sums[description].assigned +=
      parseFloat(columns[ASSIGNED_INDEX]) || 0;
    sums[description].budgetAvail +=
      parseFloat(columns[BUDGET_AVAIL_INDEX]) || 0;
  }

  // Output header
  const finalLines = [
    "Category,Total Budget (Rs. Cr),Total Commitment(Rs. Cr),Total Assigned(Rs. Cr),Total Budget Avail(Rs. Cr)",
  ];

  // Totals
  let subTotal = {
    coc: 0,
    commitment: 0,
    assigned: 0,
    budgetAvail: 0,
  };

  // Convert Rupees → Crores
  const CRORE_DIVISOR = 10000000;

  // Category rows
  targetCategories.forEach((cat) => {
    const coc = sums[cat].coc / CRORE_DIVISOR;
    const commitment = sums[cat].commitment / CRORE_DIVISOR;
    const assigned = sums[cat].assigned / CRORE_DIVISOR;
    const budgetAvail = sums[cat].budgetAvail / CRORE_DIVISOR;

    subTotal.coc += coc;
    subTotal.commitment += commitment;
    subTotal.assigned += assigned;
    subTotal.budgetAvail += budgetAvail;

    finalLines.push(
      `"${cat}",${coc.toFixed(2)},${commitment.toFixed(
        2
      )},${assigned.toFixed(2)},${budgetAvail.toFixed(2)}`
    );
  });

  // Sub Total row
  finalLines.push(
    `"Sub total",${subTotal.coc.toFixed(
      2
    )},${subTotal.commitment.toFixed(
      2
    )},${subTotal.assigned.toFixed(
      2
    )},${subTotal.budgetAvail.toFixed(2)}`
  );

  // Spacer
  finalLines.push(`" ", , , , `);

  // Contingency (2.5%)
  const contingency = {
    coc: subTotal.coc * 0.025,
    commitment: subTotal.commitment * 0.025,
    assigned: subTotal.assigned * 0.025,
    budgetAvail: subTotal.budgetAvail * 0.025,
  };

  finalLines.push(
    `"Contingency @ 2.5%",${contingency.coc.toFixed(
      2
    )},${contingency.commitment.toFixed(
      2
    )},${contingency.assigned.toFixed(
      2
    )},${contingency.budgetAvail.toFixed(2)}`
  );

  // Spacer
  finalLines.push(`" ", , , , `);

  // Escalation (10%)
  const escalation = {
    coc: subTotal.coc * 0.1,
    commitment: subTotal.commitment * 0.1,
    assigned: subTotal.assigned * 0.1,
    budgetAvail: subTotal.budgetAvail * 0.1,
  };

  finalLines.push(
    `"Escalation @ 10%",${escalation.coc.toFixed(
      2
    )},${escalation.commitment.toFixed(
      2
    )},${escalation.assigned.toFixed(
      2
    )},${escalation.budgetAvail.toFixed(2)}`
  );

  // Spacer
  finalLines.push(`" ", , , , `);

  // Grand Total
  const grandTotal = {
    coc: subTotal.coc + contingency.coc + escalation.coc,
    commitment:
      subTotal.commitment +
      contingency.commitment +
      escalation.commitment,
    assigned:
      subTotal.assigned + contingency.assigned + escalation.assigned,
    budgetAvail:
      subTotal.budgetAvail +
      contingency.budgetAvail +
      escalation.budgetAvail,
  };

  finalLines.push(
    `"Grand Total",${grandTotal.coc.toFixed(
      2
    )},${grandTotal.commitment.toFixed(
      2
    )},${grandTotal.assigned.toFixed(
      2
    )},${grandTotal.budgetAvail.toFixed(2)}`
  );

  // Save file
  fs.writeFileSync(outputFile, finalLines.join("\n"), "utf8");

  console.log(`Success! Consolidated sheet saved as: ${outputFile}`);
} catch (err) {
  console.error("An error occurred processing the CSV file:", err);
}