const API_BASE = "http://127.0.0.1:5000";

function makeCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value ?? "";
    return cell;
}

async function LoadAnime() {
    const board = document.getElementById("animeTable");
    const count = document.getElementById("count");

    try {
        const response = await fetch(`${API_BASE}/api/animetable`);
        if (!response.ok) {
            count.textContent = "Error loading data (" + response.status + ")";
            return;
        }

        const data = await response.json();
        board.replaceChildren();

        if (!data.anime || data.anime.length === 0) {
            const tr = document.createElement("tr");
            const emptyCell = makeCell("The board is empty — add an anime first.");
            emptyCell.colSpan = 9;
            tr.appendChild(emptyCell);
            board.appendChild(tr);
        } else {
            for (const anime of data.anime) {
                const tr = document.createElement("tr");
                tr.appendChild(makeCell(anime.id));
                tr.appendChild(makeCell(anime.animeName));
                tr.appendChild(makeCell(anime.mainCharacter));
                tr.appendChild(makeCell(anime.sideCharacter));
                tr.appendChild(makeCell(anime.mcPower));
                tr.appendChild(makeCell(anime.scPower));
                tr.appendChild(makeCell(anime.words));
                tr.appendChild(makeCell(anime.stats));

                const actionCell = document.createElement("td");

                const editBtn = document.createElement("button");
                editBtn.textContent = "Edit";
                editBtn.className = "edit-btn";
                editBtn.onclick = () => editAnime(anime.id);

                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.className = "delete-btn";
                deleteBtn.onclick = () => deleteAnime(anime.id);

                actionCell.append(editBtn, deleteBtn);
                tr.appendChild(actionCell);
                board.appendChild(tr);
            }
        }

        count.textContent = (data.anime?.length || 0) + " anime(s) on the board";
    } catch (err) {
        console.error("Load error:", err);
        count.textContent = "Network error — is Flask running?";
    }
}

async function deleteAnime(id) {
    if (!confirm("Are you sure you want to delete this anime?")) return;
    try {
        const response = await fetch(`${API_BASE}/api/animetable/${id}`, {
            method: "DELETE",
        });
        if (response.ok) {
            LoadAnime();
        } else {
            const err = await response.json().catch(() => ({}));
            alert("Failed to delete: " + (err.error || response.status));
        }
    } catch (error) {
        console.error("Delete error:", error);
    }
}

function editAnime(id) {
    window.location.href = `/animeform.html?id=${id}`;
}

document.addEventListener("DOMContentLoaded", LoadAnime);