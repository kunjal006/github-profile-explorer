const search      = document.querySelector("#searchbox");
const form        = document.querySelector("#searchform");
const sortSelect  = document.querySelector("#sort");
const filterSelect= document.querySelector("#filter");
const BASE_URL    = "https://api.github.com/users/";

let allRepos = [];

document.querySelector("#theme").addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark");
    document.querySelector("#theme-icon").className = isDark
        ? "fa-regular fa-lightbulb"
        : "fa-solid fa-moon";
});

sortSelect.addEventListener("change",   () => renderRepos(allRepos));
filterSelect.addEventListener("change", () => renderRepos(allRepos));

form.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const username = search.value.trim();
    if (!username) return;

    showLoader();

    const data = await fetchUser(username);
    if (!data) return;

    profileDetails(username, data);

    allRepos = await repoLoad(username);
    updateAnalytics(allRepos);
    renderRepos(allRepos);

    showContent();
});

function showLoader() {
    hide("profile");
    hide("analysis");
    hide("repo-detail");
    hide("error-box");
    show("loader");
}

function showContent() {
    hide("loader");
    show("profile");
    show("analysis");
    show("repo-detail");
}

function showError(title, msg) {
    hide("loader");
    hide("profile");
    hide("analysis");
    hide("repo-detail");
    document.querySelector("#error-title").innerText = title;
    document.querySelector("#error-msg").innerText   = msg;
    show("error-box");
}

function show(id) { document.getElementById(id).classList.remove("hidden"); }
function hide(id) { document.getElementById(id).classList.add("hidden"); }

async function fetchUser(username) {
    try {
        const res  = await fetch(`${BASE_URL}${username}`);
        const data = await res.json();
        if (data.message === "Not Found") {
            showError("User not found", `"${username}" doesn't exist on GitHub. Try another username.`);
            return null;
        }
        return data;
    } catch {
        showError("Something went wrong", "Could not connect to GitHub. Check your internet and try again.");
        return null;
    }
}

function profileDetails(username, data) {
    document.querySelector("#dp").src          = data.avatar_url;
    document.querySelector("#name").innerText  = data.name || username;
    document.querySelector("#username").innerText = "@" + username;
    document.querySelector("#desc").innerText  = data.bio || "No bio available.";

    const locWrap  = document.getElementById("location-wrap");
    const locText  = document.getElementById("location-text");
    if (data.location) {
        locText.innerText = data.location;
        locWrap.classList.remove("hidden");
    } else {
        locWrap.classList.add("hidden");
    }

    const blogWrap = document.getElementById("blog-wrap");
    const blogLink = document.getElementById("blog");
    if (data.blog) {
        const url = data.blog.startsWith("http") ? data.blog : "https://" + data.blog;
        blogLink.href        = url;
        blogLink.innerText   = data.blog.replace(/^https?:\/\//, "");
        blogWrap.classList.remove("hidden");
    } else {
        blogWrap.classList.add("hidden");
    }

    const joined = new Date(data.created_at);
    document.getElementById("joined").innerText = "Joined " + joined.toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric"
    });

    document.getElementById("followers-count").innerText = formatNum(data.followers);
    document.getElementById("following-count").innerText = formatNum(data.following);
    document.getElementById("repo-count").innerText      = formatNum(data.public_repos);
}

async function repoLoad(username) {
    try {
        const res   = await fetch(`${BASE_URL}${username}/repos?per_page=100&sort=updated`);
        const repos = await res.json();
        return Array.isArray(repos) ? repos : [];
    } catch {
        return [];
    }
}

function updateAnalytics(repos) {
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);

    const langCount = {};
    repos.forEach(r => {
        if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
    });
    const topLang = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0];

    document.getElementById("total-repos").innerText  = formatNum(repos.length);
    document.getElementById("total-stars").innerText  = formatNum(totalStars);
    document.getElementById("top-language").innerText = topLang ? topLang[0] : "N/A";
}

function getProcessedRepos(repos) {
    const sortBy   = sortSelect.value;
    const filterBy = filterSelect.value.toLowerCase();

    let result = filterBy === "all"
        ? [...repos]
        : repos.filter(r => r.language && r.language.toLowerCase() === filterBy);

    result.sort((a, b) => {
        if (sortBy === "stars")   return b.stargazers_count - a.stargazers_count;
        if (sortBy === "name")    return a.name.localeCompare(b.name);
        if (sortBy === "updated") return new Date(b.updated_at) - new Date(a.updated_at);
        return 0;
    });

    return result;
}

function renderRepos(repos) {
    const container = document.getElementById("repo-container");
    const processed = getProcessedRepos(repos);

    if (processed.length === 0) {
        container.innerHTML = `<p class="no-results">No repositories match this filter.</p>`;
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
                <span class="stars">⭐ ${formatNum(repo.stargazers_count)}</span>
                <span class="forks">🍴 ${formatNum(repo.forks_count)}</span>
                ${repo.language ? `<span class="language">${repo.language}</span>` : ""}
            </div>
            <p class="repo-updated">Updated ${timeAgo(repo.updated_at)}</p>
            <a href="${repo.html_url}" target="_blank" class="vog">View on GitHub</a>
        `;

        container.appendChild(card);
    });
}

function formatNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return n;
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr);
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    const months= Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (mins < 60)    return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
    if (hours < 24)   return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    if (days < 30)    return `${days} day${days !== 1 ? "s" : ""} ago`;
    if (months < 12)  return `${months} month${months !== 1 ? "s" : ""} ago`;
    return `${years} year${years !== 1 ? "s" : ""} ago`;
}