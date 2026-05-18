const fs = require("fs");

// File names
const inputFile = "output.csv"; // Ensure this matches the output of your previous script
const outputFile = "output_final.csv";

// The categories exactly as you requested them, in order.
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
  // Read the mapped CSV file
  const data = fs.readFileSync(inputFile, "utf8");
  const lines = data.split(/\r?\n/);

  // Initialize an object to hold our sums for each category
  const sums = {};
  targetCategories.forEach((cat) => (sums[cat] = 0));

  // We need to decide which column to sum.
  // Based on your original file: Object[0], Description[1], Budget[2], Actual costs[3]...
  // We will sum the "Budget" column (Index 2). Change this to 5 if you prefer "Assigned".
  const VALUE_COLUMN_INDEX = 2;

  // Loop through the lines, skipping the header (index 0)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle standard CSV splitting
    const columns = line.split(",");
    const description = columns[1] ? columns[1].trim() : "";
    const value = parseFloat(columns[VALUE_COLUMN_INDEX]) || 0;

    // If the description matches one of our target categories, add the value to its sum
    if (sums.hasOwnProperty(description)) {
      sums[description] += value;
    }
  }

  // Prepare the final CSV content starting with the headers
  const finalLines = ["Category,COC (Rs. Cr)"];
  let subTotal = 0;

  // Divisor to convert standard Rupees to Crores (1 Crore = 10,000,000)
  const CRORE_DIVISOR = 10000000;

  // 1. Add the base categories and accumulate the Sub Total
  targetCategories.forEach((cat) => {
    const valueInCr = sums[cat] / CRORE_DIVISOR;
    subTotal += valueInCr;
    finalLines.push(`"${cat}",${valueInCr.toFixed(2)}`);
  });

  // 2. Add Sub total
  finalLines.push(`"Sub total",${subTotal.toFixed(2)}`);

  // Empty spacer line for formatting
  finalLines.push(`" ", `);

  // 3. Calculate Contingency (2.5% of Sub total)
  const contingency = subTotal * 0.025;
  finalLines.push(`"Contingency @ 2.5%",${contingency.toFixed(2)}`);

  // Empty spacer line for formatting
  finalLines.push(`" ", `);

  // 4. Calculate Escalation (10% of Sub total)
  const escalation = subTotal * 0.1;
  finalLines.push(`"Escalation @ 10%",${escalation.toFixed(2)}`);

  // Empty spacer line for formatting
  finalLines.push(`" ", `);

  // 5. Calculate and add Grand Total
  const grandTotal = subTotal + contingency + escalation;
  finalLines.push(`"Grand Total",${grandTotal.toFixed(2)}`);

  // Write the consolidated data to the final CSV file
  fs.writeFileSync(outputFile, finalLines.join("\n"), "utf8");

  console.log(`Success! Consolidated sheet saved as: ${outputFile}`);
} catch (err) {
  console.error("An error occurred processing the CSV file:", err);
}
