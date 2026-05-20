const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRzKkepmT24n2sOcOcDfhA5HigPVSVnYneHm8Oe7luoT61GsqTwYcik9CiBn3eytOo0ZKUv5WRgI_dB/pub?gid=0&single=true&output=csv";

let allData = [];

async function loadData() {

  Papa.parse(SHEET_URL, {

    download: true,
    header: true,

    complete: function(results) {

      allData = results.data.filter(
        x => x.team
      );

      populateTeams();

      const today =
        new Date().toISOString().split("T")[0];

      document.getElementById(
        "dateFilter"
      ).value = today;

      applyFilters();
    }
  });
}

function populateTeams() {

  const dropdown =
    document.getElementById("teamFilter");

  const teams =
    [...new Set(allData.map(x => x.team))];

  teams.forEach(team => {

    dropdown.innerHTML += `
      <option value="${team}">
        ${team}
      </option>
    `;
  });
}

function formatDate(dateString) {

  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toISOString().split("T")[0];
}

function applyFilters() {

  const selectedDate =
    document.getElementById("dateFilter").value;

  const selectedTeam =
    document.getElementById("teamFilter").value;

  const filtered = allData.filter(item => {

    const sheetDate =
      formatDate(item.report_date);

    return (

      (!selectedDate ||
       sheetDate === selectedDate)

      &&

      (!selectedTeam ||
       item.team === selectedTeam)
    );
  });

  renderDashboard(filtered);
}

function renderDashboard(data) {

  renderKPI(data);

  renderCards(data);
}

function renderKPI(data) {

  const container =
    document.getElementById("kpiContainer");

  const totalTeams = data.length;

  let totalAI = 0;

  data.forEach(item => {

    totalAI += Number(
      item.ai_percentage || 0
    );
  });

  const avgAI =
    totalTeams
      ? Math.round(totalAI / totalTeams)
      : 0;

  container.innerHTML = `

    <div class="bg-white rounded-2xl p-5 shadow-sm">

      <p class="text-xs uppercase tracking-wider text-gray-400">
        Total Teams
      </p>

      <h2 class="text-3xl font-bold mt-2">
        ${totalTeams}
      </h2>

    </div>

    <div class="bg-white rounded-2xl p-5 shadow-sm">

      <p class="text-xs uppercase tracking-wider text-gray-400">
        Average AI
      </p>

      <h2 class="text-3xl font-bold mt-2 text-green-600">
        ${avgAI}%
      </h2>

    </div>

    <div class="bg-white rounded-2xl p-5 shadow-sm">

      <p class="text-xs uppercase tracking-wider text-gray-400">
        Report Date
      </p>

      <h2 class="text-xl font-bold mt-2">
        ${data[0]?.report_date || "-"}
      </h2>

    </div>
  `;
}

function renderCards(data) {

  const container =
    document.getElementById("reportContainer");

  container.innerHTML = "";

  if (data.length === 0) {

    container.innerHTML = `

      <div class="bg-white rounded-3xl p-10 text-center shadow-sm">

        <h2 class="text-2xl font-bold">

          No Report Found

        </h2>

        <p class="text-gray-500 mt-3">

          Please select another date or team.

        </p>

      </div>
    `;

    return;
  }

  data.forEach(item => {

    container.innerHTML += `

      <div class="bg-white rounded-3xl p-6 mb-6 shadow-sm">

        <!-- HEADER -->

        <div class="flex justify-between items-start">

          <div class="flex items-center gap-4">

            <div
              class="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-xl"
            >

              ${item.icon}

            </div>

            <div>

              <h2 class="text-xl font-bold">

                ${item.team}

              </h2>

              <p class="text-gray-400 text-sm">

                ${item.category}

              </p>

            </div>

          </div>

          <div
            class="bg-green-100 text-green-700 text-xs px-3 py-2 rounded-full font-semibold"
          >

            ${item.ai_percentage}% AI

          </div>

        </div>

        <!-- PROGRESS -->

        <div class="mt-5">

          <div class="flex justify-between text-xs font-semibold mb-2">

            <span class="text-green-600">

              ${item.ai_percentage}% AI

            </span>

            <span class="text-purple-600">

              ${item.manual_percentage}% Manual

            </span>

          </div>

          <div
            class="w-full bg-gray-200 rounded-full h-3 overflow-hidden flex"
          >

            <div
              class="bg-green-500 h-3"
              style="width:${item.ai_percentage}%"
            ></div>

            <div
              class="bg-purple-500 h-3"
              style="width:${item.manual_percentage}%"
            ></div>

          </div>

        </div>

        <!-- AI WORK -->

        <div class="mt-6">

          <h3
            class="text-xs uppercase tracking-[3px] text-gray-400 font-bold"
          >

            AI Work

          </h3>

          <ul class="mt-3 space-y-2">

            ${generateList(item, "ai_work")}

          </ul>

        </div>

        <!-- MANUAL -->

        <div class="mt-6">

          <h3
            class="text-xs uppercase tracking-[3px] text-gray-400 font-bold"
          >

            Why ${item.manual_percentage}% was manual

          </h3>

          <ul class="mt-3 space-y-2">

            ${generateList(item, "manual_work")}

          </ul>

        </div>

        <!-- NOTE -->

        <div
          class="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-4"
        >

          <p class="text-yellow-700 text-sm leading-relaxed">

            💡 ${item.note}

          </p>

        </div>

      </div>
    `;
  });
}

function generateList(item, prefix) {

  let html = "";

  for (let i = 1; i <= 3; i++) {

    const value =
      item[`${prefix}_${i}`];

    if (value) {

      html += `

        <li class="flex gap-3 text-sm">

          <span class="text-green-600">

            ✓

          </span>

          <span>

            ${value}

          </span>

        </li>
      `;
    }
  }

  return html;
}

loadData();
