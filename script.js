const auth_link = "https://www.strava.com/oauth/token";

// Mapping of activity types to local image file paths
const activityIcons = {
    'Run': "images/Run.png",
    'Ride': "images/Ride.png",
    // Add more types and file paths as needed
};

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const hoursString = hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''}` : '';
    const minutesString = minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : '';
    const secondsString = remainingSeconds > 0 ? `${remainingSeconds} second${remainingSeconds !== 1 ? 's' : ''}` : '';

    const timeComponents = [hoursString, minutesString, secondsString].filter(component => component !== '');

    return timeComponents.join(' ');
}

function getActivities(res) {
    // Replace 'YOUR_ACCESS_TOKEN' with your actual access token obtained from Strava
    const accessToken = res.access_token;

    // Fetch activities from Strava API
    fetch('https://www.strava.com/api/v3/athlete/activities', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const messageDiv = document.getElementById('message');
        const messageDiv2 = document.getElementById('message2');
        const activitiesDiv = document.getElementById('activities');

        activitiesDiv.innerHTML = ''; // Clear previous content

        // Display the message outside the activity cards
        messageDiv.textContent = 'Here are all your activities:';

        // Looping through activities and display all available data
        data.forEach(activity => {
            const activityCard = document.createElement('div');
            activityCard.className = 'activity-card';
            activityCard.innerHTML = `
                <h3>${activity.name}</h3>

                <img src="${activityIcons[activity.type]}" class="activity-icon" alt="${activity.type} Icon">

                <p> <p2>Type  :</p2> ${activity.type}</p>
                <p> <p2>Distance  :</p2> ${activity.distance} meters</p>
                <p> <p2>Start Date  :</p2> ${new Date(activity.start_date).toLocaleString()}</p>
                <p> <p2>Duration  :</p2> ${formatDuration(activity.elapsed_time)} </p>
                <p> <p2>Calories Burned  :</p2> ${activity.calories}</p>
                <p> <p2>Average Speed  :</p2> ${activity.average_speed} m/s</p>
                <p> <p2>Max Speed  :</p2> ${activity.max_speed} m/s</p>
                
                
                <div id="map-${activity.id}" class="activity-map"></div>
            `;
            activitiesDiv.appendChild(activityCard);

            // Fetch activity streams (route data) using the activity ID
            fetch(`https://www.strava.com/api/v3/activities/${activity.id}/streams/latlng?access_token=${accessToken}`)
            .then(response => response.json())
            .then(routeData => {
                // Create a map for this activity using OpenStreetMap tiles
                const mapElement = document.getElementById(`map-${activity.id}`);
                const map = L.map(mapElement).setView([0, 0], 13); // Set initial view and zoom level

                // Add OpenStreetMap tiles as the base layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                // Extract latitude and longitude data from routeData
                const latlngs = routeData.find(stream => stream.type === 'latlng').data;

                // Create a polyline to display the route on the map
                const polyline = L.polyline(latlngs, { color: 'Blue' }).addTo(map);

                // Fit the map to the bounds of the route
                map.fitBounds(polyline.getBounds());
            })
            .catch(error => console.error(error));
        });

        // Display the message outside and After the activity cards
        messageDiv2.textContent= 'Keep Pumping, Keep Going.....';
    })
    .catch(error => console.error(error));
}

function reAuthorize() {
    fetch(auth_link, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: '108770',
            client_secret: 'b3d2872bc80d42f41e2094a3ad1bd56cd5f4d959',
            refresh_token: '1d01b612ee58920541259c0f0f28d968a0c5bcde',
            grant_type: 'refresh_token'
        })
    })
    .then(res => res.json())
    .then(res => getActivities(res))
    .catch(error => console.error(error));
}
