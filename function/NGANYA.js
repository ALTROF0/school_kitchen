/**
 * NGANYA.js — loads the nganya table from GET /api/nganya
 * and renders one <tr> per record into #nganyaTable.
 */

const API_BASE = "http://127.0.0.1:5000";

function makeCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value ?? "";
  return cell;
}

function showEmptyRow(board, message) {
  const tr = document.createElement("tr");
  const td = makeCell(message);
  td.colSpan = 3;
  tr.appendChild(td);
  board.appendChild(tr);
}

async function loadNganya() {
  const board = document.getElementById("nganyaTable");
  const countEl = document.getElementById("count");
  board.replaceChildren();

  let data;
  try {
    const response = await fetch(`${API_BASE}/api/nganya`);
    if (!response.ok) {
      showEmptyRow(board, `Server error ${response.status}`);
      return;
    }
    data = await response.json();
  } catch (err) {
    console.error("Network error:", err);
    showEmptyRow(board, "Cannot reach server — is Flask running?");
    return;
  }

  if (!data.nganya || data.nganya.length === 0) {
    showEmptyRow(board, "The board is empty — add a nganya first");
  } else {
    for (const n of data.nganya) {
      const tr = document.createElement("tr");
      tr.appendChild(makeCell(n.carID));
      tr.appendChild(makeCell(n.fullName));
      tr.appendChild(makeCell(n.road));
      board.appendChild(tr);
    }
  }

  countEl.textContent =
    (data.nganya ? data.nganya.length : 0) + " nganyas on the board";
}

document.addEventListener("DOMContentLoaded", loadNganya);