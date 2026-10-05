const fs = require('fs');
let content = fs.readFileSync('src/components/ProjectEditor.astro', 'utf8');

const oldScript = /<\/script>/;
const newScript = `
// Auto-fill file label from filename
const fileUploadInput = document.getElementById('file-upload-input');
const fileLabelInput = document.getElementById('file-label-input');
if (fileUploadInput && fileLabelInput) {
  fileUploadInput.addEventListener('change', (e) => {
    if (fileLabelInput.value === '') {
      const file = e.target.files[0];
      if (file) {
        let name = file.name;
        // Remove extension
        const dotIndex = name.lastIndexOf('.');
        if (dotIndex > 0) name = name.substring(0, dotIndex);
        // Replace dashes and underscores with spaces
        name = name.replace(/[-_]/g, ' ');
        // Capitalize first letter of each word
        name = name.replace(/\\w\\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        fileLabelInput.value = name;
      }
    }
  });
}
</script>`;

content = content.replace(oldScript, newScript);
fs.writeFileSync('src/components/ProjectEditor.astro', content);
console.log('Script updated');
