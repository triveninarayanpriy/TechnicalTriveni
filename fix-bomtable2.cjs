const fs = require("fs");
let c = fs.readFileSync("src/components/BomTable.astro", "utf8");
c = c.replace(/textContent = "\\?" \+ coreSum/g, "innerHTML = `&#8377;` + coreSum");
c = c.replace(/textContent = "\\?" \+ selSum/g, "innerHTML = `&#8377;` + selSum");
fs.writeFileSync("src/components/BomTable.astro", c);
