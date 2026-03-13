const search = document.querySelector("form input");
const form = document.querySelector("#searchform");
const BASE_URL = `https://api.github.com/users/`;

// ── Dark Mode Toggle ───────────────────────────────
const themeBtn = document.querySelector("#theme");
const themeIcon = document.querySelector("#theme-icon");

themeBtn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
    themeIcon.className = isDark ? "fa-regular fa-lightbulb" : "fa-solid fa-moon";
});

// ── Sort & Filter ──────────────────────────────────
const sortSelect = document.querySelector("#sort");
const filterSelect = document.querySelector("#filter");

let allRepos = [];

sortSelect.addEventListener("change", () => renderRepos(allRepos));
filterSelect.addEventListener("change", () => renderRepos(allRepos));

// ── Form Submit ────────────────────────────────────
form.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const username = search.value.trim();
    if (!username) return;

    const data = await fetchUser(username);
    if (!data) return;

    profileDetails(username, data);

    allRepos = await repoLoad(username);

    updateAnalytics(allRepos);
    renderRepos(allRepos);
});

// ── Fetch User ─────────────────────────────────────
async function fetchUser(username) {
    try {
        const response = await fetch(`${BASE_URL}${username}`);
        const data = await response.json();
        if (data.message === "Not Found") {
            alert("User not found");
            return null;
        }
        return data;
    } catch (error) {
        alert("Error fetching user details.");
        return null;
    }
}

// ── Profile Details ────────────────────────────────
function profileDetails(username, data) {
    document.querySelector("#dp").src = data.avatar_url;
    document.querySelector("#name").innerText = data.name || username;
    document.querySelector("#username").innerText = "@" + username;
    document.querySelector("#desc").innerText = data.bio || "No bio available.";
    document.querySelector("#followers").innerText = "Followers: " + data.followers;
    document.querySelector("#following").innerText = "Following: " + data.following;
    document.querySelector("#repo-created").innerText = "Repositories: " + data.public_repos;
}

// ── Load Repos ─────────────────────────────────────
async function repoLoad(username) {
    try {
        const response = await fetch(`${BASE_URL}${username}/repos?per_page=100`);
        const repos = await response.json();
        return repos;
    } catch (error) {
        alert("Error fetching repositories.");
        return [];
    }
}

// ── Analytics ──────────────────────────────────────
function updateAnalytics(repos) {
    const totalRepos = repos.length;
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

    const langCount = {};
    repos.forEach(r => {
        if (r.language) {
            langCount[r.language] = (langCount[r.language] || 0) + 1;
        }
    });

    const topLang = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0];

    document.querySelector("#total-repos").innerText = totalRepos;
    document.querySelector("#total-stars").innerText = totalStars;
    document.querySelector("#top-language").innerText = topLang ? topLang[0] : "N/A";
}

// ── Sort & Filter Logic ────────────────────────────
function getProcessedRepos(repos) {
    const sortBy = sortSelect.value;
    const filterBy = filterSelect.value.toLowerCase();

    let filtered = filterBy === "all"
        ? [...repos]
        : repos.filter(r => r.language && r.language.toLowerCase() === filterBy);

    filtered.sort((a, b) => {
        if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "updated") return new Date(b.updated_at) - new Date(a.updated_at);
        return 0;
    });

    return filtered;
}

// ── Render Repos ───────────────────────────────────
function renderRepos(repos) {
    const container = document.querySelector(".repo-container");
    const processed = getProcessedRepos(repos);

    if (processed.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">No repositories match this filter.</p>`;
        return;
    }

    container.innerHTML = "";

    processed.forEach(repo => {
        const card = document.createElement("div");
        card.classList.add("repo-card");

        card.innerHTML = `
            <h3 class="repo-name">${repo.name}</h3>
            <p class="repo-desc">${repo.description || "No description available."}</p>
            <div class="repo-info">
                <span class="stars">⭐ ${repo.stargazers_count}</span>
                ${repo.language ? `<span class="language">${repo.language}</span>` : ""}
            </div>
            <a href="${repo.html_url}" target="_blank" class="vog">View on GitHub</a>
        `;

        container.appendChild(card);
    });
}