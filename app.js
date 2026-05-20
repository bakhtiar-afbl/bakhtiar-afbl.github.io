const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vRzKkepmT24n2sOcOcDfhA5HigPVSVnYneHm8Oe7luoT61GsqTwYcik9CiBn3eytOo0ZKUv5WRgI_dB/pub?gid=0&single=true&output=csv";

let allData = [];

async function loadData() {

  Papa.parse(
    SHEET_URL + "&t=" + new Date().getTime(),

    {

      download: true,

      header: true,

      skipEmptyLines: true,

      complete: function(results) {

        allData = results.data.filter(
          x => x.team
        );

        populateTeams();

        setLatestDate();

        applyFilters();
      }
    }
  );
}

function populateTeams() {

  const dropdown =
    document.getElementById("teamFilter");

  dropdown.innerHTML =
    `<option value="">All Teams</option>`;

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

function setLatestDate() {

  const dates =
    [...new Set(
      allData.map(x => x.report_date)
    )]
    .sort()
    .reverse();

  if (dates.length > 0) {

    document.getElementById(
      "dateFilter"
    ).value = formatDate(dates[0]);
  }
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
      "Date",
      data[0]?.report_date || "-",
      "📅"
    )}

  `;
}

function createKPI(title, value, icon) {

  return `

    <div
      class="card-bg border border-slate-800 rounded-2xl p-4"
    >

      <div class="flex justify-between items-center">

        <div>

          <p
            class="text-[10px] uppercase tracking-[4px] text-slate-400"
          >

            ${title}

          </p>

          <h2
            class="text-2xl font-bold mt-2"
          >

            ${value}

          </h2>

        </div>

        <div class="text-2xl">
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
        class="card-bg rounded-2xl p-10 text-center border border-slate-800"
      >

        <h2 class="text-2xl font-bold">

          No Report Found

        </h2>

      </div>

    `;

    return;
  }

  data.forEach(item => {

    container.innerHTML += `

      <div
        class="card-bg border border-slate-800 rounded-2xl p-4 mb-4"
      >

        <!-- HEADER -->

        <div
          class="flex justify-between items-start"
        >

          <div
            class="flex items-center gap-3"
          >

            <div
              class="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-lg"
            >

              ${item.icon}

            </div>

            <div>

              <h2
                class="text-xl font-bold"
              >

                ${item.team}

              </h2>

              <p
                class="text-slate-400 text-xs mt-1"
              >

                ${item.category}

              </p>

            </div>

          </div>

          <div
            class="bg-cyan-500 text-black text-xs px-3 py-1.5 rounded-full font-semibold"
          >

            ${item.ai_percentage}% AI

          </div>

        </div>

        <!-- BAR -->

        <div class="mt-5">

          <div
            class="flex justify-between text-[11px] mb-2 font-semibold"
          >

            <span class="text-cyan-400">

              ${item.ai_percentage}% AI

            </span>

            <span class="text-pink-400">

              ${item.manual_percentage}% Manual

            </span>

          </div>

          <div
            class="w-full bg-slate-800 rounded-full h-2 overflow-hidden flex"
          >

            <div
              class="bg-cyan-400 h-2"
              style="width:${item.ai_percentage}%"
            ></div>

            <div
              class="bg-pink-500 h-2"
              style="width:${item.manual_percentage}%"
            ></div>

          </div>

        </div>

        <!-- TASKS -->

        <div
          class="grid md:grid-cols-2 gap-4 mt-5"
        >

          <!-- AI -->

          <div>

            <h3
              class="text-[11px] uppercase tracking-[3px] text-cyan-400 font-bold mb-3"
            >

              AI Tasks

            </h3>

            <div class="space-y-2">

              ${generateTasks(
                item,
                "ai_work_",
                "cyan"
              )}

            </div>

          </div>

          <!-- MANUAL -->

          <div>

            <h3
              class="text-[11px] uppercase tracking-[3px] text-pink-400 font-bold mb-3"
            >

              Manual Tasks

            </h3>

            <div class="space-y-2">

              ${generateTasks(
                item,
                "manual_work_",
                "pink"
              )}

            </div>

          </div>

        </div>

        <!-- NOTE -->

        <div
          class="mt-5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3"
        >

          <p
            class="text-[13px] text-slate-300 leading-relaxed"
          >

            💡 ${item.note}

          </p>

        </div>

      </div>
    `;
  });
}

function generateTasks(
  item,
  prefix,
  color
) {

  let html = "";

  Object.keys(item).forEach(key => {

    if (
      key.startsWith(prefix)
      &&
      item[key]
    ) {

      html += `

        <div
          class="bg-slate-800 rounded-xl p-2.5 border border-slate-700"
        >

          <div class="flex gap-3">

            <div
              class="
              w-5 h-5 rounded-full
              ${
                color === "cyan"
                ? "bg-cyan-400 text-black"
                : "bg-pink-500 text-white"
              }
              flex items-center justify-center
              text-[10px] font-bold
              "
            >

              ✓

            </div>

            <p
              class="text-[13px] leading-relaxed text-slate-200"
            >

              ${item[key]}

            </p>

          </div>

        </div>

      `;
    }
  });

  return html;
}

loadData();
