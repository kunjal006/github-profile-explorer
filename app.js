const search = document.querySelector("form input");
const form = document.querySelector("#searchform");
const sbtn = document.querySelector("#searchbtn");
BASE_URL = `https://api.github.com/users/`

form.addEventListener("submit" , async (evt) => {
    evt.preventDefault();

    const username = search.value.trim();
    if(!username) return;

    const data = await fetchUser(username);
    if(!data) return;

    profileDetails(username, data);

    const repos = await repoLoad(username);
    console.log(repos);

    showRepo(repos);
});

async function fetchUser(username) {
    try {
        const response = await fetch(`${BASE_URL}${username}`);
        const data = await response.json();
        if(data.message === "Not Found"){
            alert("User is not found");
            return null;
        }
        return data;
    } catch (error) {
        alert("Error fetching details...");
        return null;
    }
}

function profileDetails(username, data){
    document.querySelector("#name").innerText = data.name;
    document.querySelector("#username").innerText = "@" + username;
    document.querySelector("#desc").innerText = data.bio;
    document.querySelector("#followers").innerText = "Followers: "+ data.followers;
    document.querySelector("#following").innerText = "Following: "+ data.following;
    document.querySelector("#repo-created").innerText = "Repositories: "+ data.public_repos;
    document.querySelector("#dp").src = data.avatar_url;

}

async function repoLoad(username) {
    const response = await fetch(`${BASE_URL}${username}/repos`);
    const repos = await response.json();

    return repos;
}

async function showRepo(repos) {
    const container = document.querySelector(".repo-container");

    container.innerHTML = "";

    repos.forEach(repo => {
        const card = document.createElement("div");

        card.classList.add("repo-card");

        card.innerHTML = `
        <h3>${repo.name}</h3>
        <p>${repo.description || "No Description"} </p>
        <span>⭐${repo.stargazers_count}</span>
        <a href="${repo.html_url}" target="_blank" class = "vog">View on Github</a>`;

        container.appendChild(card);
        
    });
}