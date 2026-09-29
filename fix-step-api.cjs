const fs = require("fs");
let c = fs.readFileSync("src/pages/api/admin/step/add.ts", "utf8");
c = c.replace(/image_url: strField\(form, 'image_url', 500\),/, `image_url: strField(form, "image_url", 500),
    goal: strField(form, "goal", 200),
    time_est: strField(form, "time_est", 100),
    parts_needed: form.getAll("parts_needed").filter(Boolean).join(","),
    file_id: intField(form, "file_id", 0) || null,
    expected_res: strField(form, "expected_res", 500),
    if_fails: strField(form, "if_fails", 500),
    video_ts: strField(form, "video_ts", 20),`);
fs.writeFileSync("src/pages/api/admin/step/add.ts", c);

c = fs.readFileSync("src/pages/api/admin/step/update.ts", "utf8");
c = c.replace(/image_url: strField\(form, 'image_url', 500\),/, `image_url: strField(form, "image_url", 500),
    goal: strField(form, "goal", 200),
    time_est: strField(form, "time_est", 100),
    parts_needed: form.getAll("parts_needed").filter(Boolean).join(","),
    file_id: intField(form, "file_id", 0) || null,
    expected_res: strField(form, "expected_res", 500),
    if_fails: strField(form, "if_fails", 500),
    video_ts: strField(form, "video_ts", 20),`);
fs.writeFileSync("src/pages/api/admin/step/update.ts", c);
