const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRzKkepmT24n2sOcOcDfhA5HigPVSVnYneHm8Oe7luoT61GsqTwYcik9CiBn3eytOo0ZKUv5WRgI_dB/pub?gid=0&single=true&output=csv";

let allData = [];

Papa.parse(SHEET_URL, {

  download: true,

  header: true,

  skipEmptyLines: true,

  complete: function(results) {

    allData = results.data.filter(
      x => x.team
    );

    populateTeams();

    setDefaultDate();

    applyFilters();
  }
});

function setDefaultDate() {

  const dates =
    [...new Set(
      allData.map(x => x.report_date)
    )];

  if (dates.length > 0) {

    document.getElementById(
      "dateFilter"
    ).value = formatDate(dates[0]);
  }
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

    const rowDate =
      formatDate(item.report_date);

    return (

      (!selectedDate ||
       rowDate === selectedDate)

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

  let avgAI = 0;

  data.forEach(item => {

    avgAI += Number(
      item.ai_percentage || 0
    );
  });

  avgAI =
    totalTeams
      ? Math.round(avgAI / totalTeams)
      : 0;

  container.innerHTML = `

    ${createKPI(
      "Teams",
      totalTeams,
      "👥"
    )}

    ${createKPI(
      "AI Adoption",
      avgAI + "%",
      "🤖"
    )}

    ${createKPI(
      "Tasks",
      countTasks(data),
      "✅"
    )}

    ${createKPI(
      "Report",
      data[0]?.report_date || "-",
      "📅"
    )}

  `;
}

function createKPI(title, value, icon) {

  return `

    <div
      class="bg-slate-900 border border-slate-800 rounded-3xl p-5"
    >

      <div class="flex justify-between items-center">

        <div>

          <p class="text-slate-400 text-xs uppercase tracking-[3px]">
            ${title}
          </p>

          <h2 class="text-3xl font-bold mt-3">
            ${value}
          </h2>

        </div>

        <div class="text-3xl">
          ${icon}
        </div>

      </div>

    </div>
  `;
}

function countTasks(data) {

  let count = 0;

  data.forEach(item => {

    Object.keys(item).forEach(key => {

      if (
        key.startsWith("ai_work_")
        &&
        item[key]
      ) {
        count++;
      }
    });
  });

  return count;
}

function renderCards(data) {

  const container =
    document.getElementById("reportContainer");

  container.innerHTML = "";

  if (data.length === 0) {

    container.innerHTML = `

      <div
        class="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center"
      >

        <h2 class="text-3xl font-bold">

          No Report Found

        </h2>

      </div>
    `;

    return;
  }

  data.forEach(item => {

    container.innerHTML += `

      <div
        class="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-5"
      >

        <!-- HEADER -->

        <div class="flex justify-between gap-4 flex-wrap">

          <div class="flex gap-4">

            <div
              class="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-2xl"
            >

              ${item.icon}

            </div>

            <div>

              <h2 class="text-2xl font-bold">

                ${item.team}

              </h2>

              <p class="text-slate-400 text-sm mt-1">

                ${item.category}

              </p>

            </div>

          </div>

          <div>

            <div
              class="bg-cyan-500 text-black text-sm px-4 py-2 rounded-full font-bold"
            >

              ${item.ai_percentage}% AI

            </div>

          </div>

        </div>

        <!-- BAR -->

        <div class="mt-6">

          <div
            class="flex justify-between text-xs mb-2 font-semibold"
          >

            <span class="text-cyan-400">

              ${item.ai_percentage}% AI

            </span>

            <span class="text-pink-400">

              ${item.manual_percentage}% Manual

            </span>

          </div>

          <div
            class="w-full bg-slate-800 rounded-full h-3 overflow-hidden flex"
          >

            <div
              class="bg-cyan-400 h-3"
              style="width:${item.ai_percentage}%"
            ></div>

            <div
              class="bg-pink-500 h-3"
              style="width:${item.manual_percentage}%"
            ></div>

          </div>

        </div>

        <!-- TASKS -->

        <div class="grid md:grid-cols-2 gap-5 mt-7">

          <!-- AI TASK -->

          <div>

            <h3
              class="text-xs uppercase tracking-[3px] text-cyan-400 font-bold mb-4"
            >

              AI Tasks

            </h3>

            <div class="space-y-3">

              ${generateTasks(item, "ai_work_")}

            </div>

          </div>

          <!-- MANUAL -->

          <div>

            <h3
              class="text-xs uppercase tracking-[3px] text-pink-400 font-bold mb-4"
            >

              Manual Tasks

            </h3>

            <div class="space-y-3">

              ${generateTasks(item, "manual_work_")}

            </div>

          </div>

        </div>

        <!-- NOTE -->

        <div
          class="mt-6 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4"
        >

          <p class="text-sm text-slate-300 leading-relaxed">

            💡 ${item.note}

          </p>

        </div>

      </div>
    `;
  });
}

function generateTasks(item, prefix) {

  let html = "";

  Object.keys(item).forEach(key => {

    if (
      key.startsWith(prefix)
      &&
      item[key]
    ) {

      html += `

        <div
          class="bg-slate-800 rounded-2xl p-3 border border-slate-700"
        >

          <div class="flex gap-3">

            <div
              class="w-6 h-6 rounded-full bg-cyan-500 text-black flex items-center justify-center text-xs font-bold"
            >

              ✓

            </div>

            <p class="text-sm leading-relaxed text-slate-200">

              ${item[key]}

            </p>

          </div>

        </div>
      `;
    }
  });

  return html;
}
