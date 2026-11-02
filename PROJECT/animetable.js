function makeCell(value) {
    const cell = document.createElement('td');
    cell.textContent = value;
    return cell;
}

async function LoadAnime() {
    const response = await fetch("http://127.0.0.1:5000/api/animetable");
    if (!response.ok) {
        console.log("the kitchen answered with " + response.status);
        return;
    }
    const data = await response.json();
    const board = document.getElementById("animeTable");
    board.replaceChildren();

    if (data.anime.length === 0) {
        const tr = document.createElement("tr");
        const emptyCell = makeCell("the board is empty - add an anime first");
        emptyCell.colSpan = 8; // Updated to 8 because we added an Actions column
        tr.appendChild(emptyCell);
        board.appendChild(tr);
    } else {
        for (const anime of data.anime) {
            const tr = document.createElement("tr");
            
            tr.appendChild(makeCell(anime.id));
            tr.appendChild(makeCell(anime.name));
            tr.appendChild(makeCell(anime.mainCharacter));
            tr.appendChild(makeCell(anime.sideCharacter));
            tr.appendChild(makeCell(anime.mcPower));
            tr.appendChild(makeCell(anime.scPower));
            tr.appendChild(makeCell(anime.words));
            tr.appendChild(makeCell(anime.stats));

            // Create Actions Cell
            const actionCell = document.createElement('td');

            // Edit Button
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.className = 'edit-btn';
            editBtn.onclick = () => editAnime(anime.id); // Pass the anime ID

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteAnime(anime.id); // Pass the anime ID

            actionCell.appendChild(editBtn);
            actionCell.appendChild(deleteBtn);
            tr.appendChild(actionCell);

            board.appendChild(tr);
        }
    }
    document.getElementById("count").textContent = data.anime.length + " animes on the board";
}

// Handle Deleting an Anime
async function deleteAnime(id) {
    if (confirm("Are you sure you want to delete this anime?")) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/animetable/${id}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                LoadAnime(); // Reload table after deletion
            } else {
                alert("Failed to delete the anime.");
            }
        } catch (error) {
            console.error("Error deleting anime:", error);
        }
    }
}

// Handle Editing an Anime (Redirects to form with ID)
function editAnime(id) {
    // Sends user to the form page with the ID as a URL parameter so it can pre-fill the form
    window.location.href = `animeform.html?id=${id}`;
}

// Invoke the function when DOM is ready
document.addEventListener("DOMContentLoaded", LoadAnime);