const fs = require("fs");
let c = fs.readFileSync("src/components/StageCard.astro", "utf8");

c = c.replace(/\{step\.parts_needed && \(/, 
`{step.file_id && (
      <div class="stage-card__file" style="margin-bottom:0.75rem;">
        <a href={"/api/download/free/" + step.file_id} class="btn btn-ghost btn-sm" style="display:inline-flex; border: 1px solid var(--border)">
          <Icon name="download" size={14} /> Download Sketch/File
        </a>
      </div>
    )}
    
    {step.parts_needed && (`);

fs.writeFileSync("src/components/StageCard.astro", c);
