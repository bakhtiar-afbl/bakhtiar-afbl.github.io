const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRzKkepmT24n2sOcOcDfhA5HigPVSVnYneHm8Oe7luoT61GsqTwYcik9CiBn3eytOo0ZKUv5WRgI_dB/pub?gid=0&single=true&output=csv";

let allData = [];

async function loadData() {

  const response = await fetch(SHEET_URL);

  const csv = await response.text();

  const rows = csv.split("\n").slice(1);

  allData = rows.map(row => {

    const cols = row.split(",");

    return {
      report_date: cols[0],
      team: cols[1],
      title: cols[2],
      summary: cols[3],
      impact: cols[4],
      status: cols[5],
      owner: cols[6],
      priority: cols[7],
      metric_value: cols[8]
    };

  });

  populateTeams();

  renderDashboard(allData);
}

function populateTeams() {

  const teams = [...new Set(allData.map(x => x.team))];

  const dropdown =
    document.getElementById("teamFilter");

  teams.forEach(team => {

    dropdown.innerHTML +=
      `<option value="${team}">${team}</option>`;

  });
}

function applyFilters() {

  const team =
    document.getElementById("teamFilter").value;

  const date =
    document.getElementById("dateFilter").value;

  const filtered = allData.filter(item => {

    return (
      (!team || item.team === team) &&
      (!date || item.report_date === date)
    );

  });

  renderDashboard(filtered);
}

function renderDashboard(data) {

  renderKPI(data);

  renderCards(data);

  renderChart(data);
}

function renderKPI(data) {

  const container =
    document.getElementById("kpiCards");

  container.innerHTML = `
    <div class="bg-gray-900 p-4 rounded">
      <h2 class="text-xl">Total Tasks</h2>
      <p class="text-3xl font-bold">${data.length}</p>
    </div>
  `;
}

function renderCards(data) {

  const container =
    document.getElementById("reportContainer");

  container.innerHTML = "";

  data.forEach(item => {

    container.innerHTML += `
      <div class="bg-gray-900 p-6 rounded mb-4">

        <div class="flex justify-between">

          <h2 class="text-2xl font-bold">
            ${item.title}
          </h2>

          <span class="text-sm">
            ${item.team}
          </span>

        </div>

        <p class="mt-4 text-gray-300">
          ${item.summary}
        </p>

        <div class="mt-4">

          <p><b>Impact:</b> ${item.impact}</p>

          <p><b>Status:</b> ${item.status}</p>

          <p><b>Owner:</b> ${item.owner}</p>

        </div>

      </div>
    `;
  });
}

function renderChart(data) {

  const ctx =
    document.getElementById("teamChart");

  const teamCount = {};

  data.forEach(item => {

    if (!teamCount[item.team]) {
      teamCount[item.team] = 0;
    }

    teamCount[item.team]++;
  });

  new Chart(ctx, {

    type: "bar",

    data: {

      labels: Object.keys(teamCount),

      datasets: [{
        label: "Tasks",
        data: Object.values(teamCount)
      }]
    }
  });
}

loadData();
