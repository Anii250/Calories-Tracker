/* ============================================================
   ExportData Component — CSV download
   ============================================================ */

function ExportData() {
    return `
    <div class="settings-section">
      <div class="settings-section__title">📤 Export Data</div>
      <p style="font-size:.82rem;color:var(--text-secondary);margin-bottom:12px;">
        Download all your logged meals as a CSV file.
      </p>
      <button class="btn btn-primary" style="width:100%;" onclick="downloadCSV()">
        📥 Export as CSV
      </button>
    </div>
  `;
}

function downloadCSV() {
    const csv = Store.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calorieai_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show feedback
    const btn = document.querySelector('.settings-section .btn-primary[onclick="downloadCSV()"]');
    if (btn) {
        btn.textContent = '✓ Downloaded!';
        setTimeout(() => { btn.textContent = '📥 Export as CSV'; }, 2000);
    }
}
