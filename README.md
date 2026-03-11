# GitHub Profile Explorer 🔍

A small web app that allows you to search for any GitHub user and view their profile details. It fetches data directly from the GitHub API and displays useful information such as the user’s avatar, bio, repositories, followers, and following.

This project was mainly built to practice working with APIs and handling asynchronous JavaScript while updating the UI dynamically.

Features

Search for any GitHub username

Displays profile picture and basic user details

Shows number of repositories, followers, and following

Handles invalid usernames gracefully

Simple and clean user interface

Tech Stack

HTML5 – page structure

CSS3 – styling

JavaScript (ES6) – API calls and dynamic content

GitHub REST API – fetching user data

How It Works

When a username is entered in the search field:

The app sends a request to the GitHub API.

The API returns the user’s public profile data.

JavaScript processes the response and updates the UI with the retrieved information.

Project Structure
github-profile-explorer
│
├── index.html
├── style.css
└── script.js

index.html – main layout of the application

style.css – styling for the interface

script.js – handles API requests and updates the UI

Running the Project

Clone the repository

git clone https://github.com/kunjal006/github-profile-explorer.git

Open the project folder

Run index.html in your browser.

Learning Goals

This project helped me practice:

Working with external APIs

Using async/await with fetch

Handling user input and form events

Updating the DOM dynamically
