document.addEventListener("DOMContentLoaded", function() {
    const feed = document.getElementById("feed");
    const modal = document.getElementById("modal");
    const openModal = document.getElementById("openModal");
    const closeModal = document.getElementById("closeModal");
    const usernameInput = document.getElementById("username");
    const messageInput = document.getElementById("message");
    const counter = document.getElementById("counter");
    const submitPip = document.getElementById("submitPip");
    const navItems = document.querySelectorAll(".nav-item");
    const suggestionsFeed = document.getElementById("suggestionsFeed");

    // Open modal when user clicks on "Pip" button
    openModal.addEventListener("click", function() {
        modal.style.display = "block";
    });

    // Close modal when user clicks on "X" icon
    closeModal.addEventListener("click", function() {
        modal.style.display = "none";
    });

    // Close modal if user clicks outside the modal
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Update character counter as user types in message field
    messageInput.addEventListener("input", function() {
        counter.innerText = `${this.value.length}/255`;
    });

    // Send a new Pip to the server
    submitPip.addEventListener("click", function() {
        const username = usernameInput.value.trim();
        const message = messageInput.value.trim();

        // Validate input
        if (username === '' || message === '') {
            alert('Brugernavn og besked må ikke være tomme.');
            return;
        }

        // Send data to the server
        fetch("api.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `username=${encodeURIComponent(username)}&message=${encodeURIComponent(message)}`
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Netværksrespons var ikke ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === "success") {
                fetchPips(); // Update feed with the new Pip
                fetchLatestPips(); // Update suggestions with the latest Pips
                modal.style.display = "none"; // Close modal
                usernameInput.value = ""; // Clear input fields
                messageInput.value = "";
                counter.innerText = "0/255"; // Reset counter
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Der opstod en fejl:', error);
            alert('Der opstod en fejl ved sending af Pip.');
        });
    });

    // Fetch Pips from the server
    function fetchPips() {
        fetch("api.php")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Netværksrespons var ikke ok');
                }
                return response.json();
            })
            .then(data => {
                // Sort by created_at to show newest first
                data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                feed.innerHTML = ""; // Clear feed
                data.forEach(pip => {
                    const pipElement = document.createElement("div");
                    pipElement.innerHTML = `
                        <div class="pip-item">
                            <img src="https://avatars.dicebear.com/api/human/${pip.id}.svg" alt="Avatar" class="avatar" />
                            <div class="pip-content">
                                <h4>${pip.username}</h4>
                                <p>${pip.message}</p>
                            </div>
                        </div>
                    `;
                    feed.append(pipElement); // Append new Pips to the feed
                });
            })
            .catch(error => {
                console.error('Fejl ved hentning af Pips:', error);
            });
    }

    // Fetch latest 3 Pips for suggestions
    function fetchLatestPips() {
        fetch("api.php")
            .then(response => {
                if (!response.ok) {
                    throw new Error('Netværksrespons var ikke ok');
                }
                return response.json();
            })
            .then(data => {
                // Sort by created_at to get the latest Pips
                data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                
                suggestionsFeed.innerHTML = ""; // Clear previous suggestions
                const latestPips = data.slice(0, 3); // Get the 3 latest Pips
                
                latestPips.forEach(pip => {
                    const suggestionElement = document.createElement("div");
                    suggestionElement.innerHTML = `
                        <div class="suggestion-item">
                            <img src="https://avatars.dicebear.com/api/human/${pip.id}.svg" alt="Avatar" class="avatar" />
                            <div class="suggestion-content">
                                <p><strong>${pip.username}</strong></p>
                                <p>${pip.message}</p>
                            </div>
                        </div>
                    `;
                    suggestionsFeed.append(suggestionElement); // Add each suggestion
                });
            })
            .catch(error => {
                console.error('Fejl ved hentning af forslag:', error);
            });
    }

    // Section switching functionality
    navItems.forEach(item => {
        item.addEventListener("click", function() {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove("active"));
            // Add active class to the clicked item
            item.classList.add("active");

            // Handle different sections
            switch (item.id) {
                case "home":
                    feed.style.display = "block"; // Show feed
                    fetchPips(); // Fetch Pips again
                    fetchLatestPips(); // Update suggestions
                    break;
                case "explore":
                    feed.style.display = "block"; // Keep feed visible for Explore section
                    fetchLatestPips(); // Update suggestions
                    break;
                case "notifications":
                    feed.style.display = "block"; // Keep feed visible for Notifications section
                    fetchLatestPips(); // Update suggestions
                    break;
                case "messages":
                    feed.style.display = "block"; // Keep feed visible for Messages section
                    fetchLatestPips(); // Update suggestions
                    break;
            }
        });
    });

    // Initial fetch of Pips and latest suggestions
    fetchPips(); 
    fetchLatestPips(); 
});
