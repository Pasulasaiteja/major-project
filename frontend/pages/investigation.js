window.InvestigationPage = {
  protected: false,
  render: async () => {
    const div = document.createElement('div');
    div.className = "min-h-screen bg-inverse-surface text-inverse-on-surface flex flex-col page-enter";
    div.innerHTML = `
      <header class="h-16 border-b border-white/10 px-6 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-primary-fixed">admin_panel_settings</span>
          <span class="font-headline-sm text-headline-sm text-surface-bright">Specialist Portal</span>
        </div>
        <button onclick="Router.navigate('/landing')" class="text-surface-dim hover:text-white transition-colors">
          Exit
        </button>
      </header>
      
      <main class="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        <div>
          <h1 class="font-display-lg text-[32px] text-surface-bright mb-2">Central Node Metrics</h1>
          <p class="font-body-sm text-surface-dim">Global model training status and network health</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white/5 border border-white/10 rounded-xl p-6">
            <span class="font-label-mono-sm text-surface-variant uppercase tracking-wider block mb-2">Global Accuracy</span>
            <span class="font-display-lg text-[40px] text-emerald-400" id="global-acc">--%</span>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-xl p-6">
            <span class="font-label-mono-sm text-surface-variant uppercase tracking-wider block mb-2">Active Edge Nodes</span>
            <span class="font-display-lg text-[40px] text-primary-fixed-dim" id="active-nodes">--</span>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-xl p-6">
            <span class="font-label-mono-sm text-surface-variant uppercase tracking-wider block mb-2">Training Round</span>
            <span class="font-display-lg text-[40px] text-amber-400" id="train-round">--</span>
          </div>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-xl p-6 flex-1 flex flex-col">
          <h3 class="font-headline-sm mb-4">Edge Node Status (Simulated Central View)</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-white/10 text-surface-variant font-label-mono-sm uppercase">
                  <th class="py-3 px-4 font-normal">Node ID</th>
                  <th class="py-3 px-4 font-normal">Status</th>
                  <th class="py-3 px-4 font-normal">Local Sample Size</th>
                  <th class="py-3 px-4 font-normal">Last Sync</th>
                </tr>
              </thead>
              <tbody id="node-list" class="font-body-sm text-surface-bright divide-y divide-white/5">
                <tr><td colspan="4" class="p-4 text-center">Loading network state...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    `;
    return div;
  },
  afterRender: async () => {
    try {
      // For this, we just poll the central API summary
      const summary = await API.getSystemSummary();
      
      document.getElementById('global-acc').textContent = (summary.last_accuracy * 100).toFixed(1) + "%"; 
      document.getElementById('train-round').textContent = summary.global_model_rounds;
      document.getElementById('active-nodes').textContent = summary.active_nodes;

      const nodes = await API.getNodes();
      const tbody = document.getElementById('node-list');
      tbody.innerHTML = '';
      
      if(nodes.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center">No nodes connected</td></tr>';
      }

      for (const data of nodes) {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-white/5";
        tr.innerHTML = `
          <td class="py-4 px-4 font-label-mono-md text-primary-fixed">${data.bank_id}</td>
          <td class="py-4 px-4">
            <span class="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] uppercase font-bold tracking-wider">${data.status}</span>
          </td>
          <td class="py-4 px-4">${data.transactions_processed || '1,420'}</td>
          <td class="py-4 px-4 text-surface-variant">Just now</td>
        `;
        tbody.appendChild(tr);
      }

    } catch (e) {
      console.error(e);
      document.getElementById('node-list').innerHTML = `<tr><td colspan="4" class="p-4 text-center text-error">Failed to connect to Central API on port 8000.</td></tr>`;
    }
  }
};
