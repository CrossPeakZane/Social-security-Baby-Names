function queryName() {
    const name = document.getElementById("name").value;
    const analyticsDiv = document.getElementById("analytics");
    const debugDiv = document.getElementById("debugInfo");
    const loadingBar = document.getElementById("loadingBar");
    analyticsDiv.innerHTML = "";
    debugDiv.innerHTML = "";
    
    let nameData = [];

    const fetchDataPromises = Array.from({ length: 2023 - 1880 + 1 }, (_, i) => 1880 + i).reduce((promiseChain, year) => {
        return promiseChain.then(() => {
            return fetch(`./names/yob${year}.txt`)
                .then(response => response.text())
                .then(text => {
                    const lines = text.split('\n');
                    const nameLines = lines.filter(line => line.startsWith(name + ','));
                    nameLines.forEach(line => {
                        const [_, gender, count] = line.split(',');
                        nameData.push({ year, gender, count: parseInt(count) });
                    });

                    const progress = ((year - 1880) / (2023 - 1880)) * 100;
                    loadingBar.style.width = `${progress}%`;
                    debugDiv.innerHTML += `Data loaded for year ${year}<br>`;

                    return text;
                })
                .catch(error => {
                    console.error(`Error fetching data for year ${year}:`, error);
                    return "";
                });
        });
    }, Promise.resolve());

    fetchDataPromises
        .then(() => {
            const years = [...new Set(nameData.map(data => data.year))];
            const totalOccurrences = nameData.reduce((acc, data) => acc + data.count, 0);
            const maleCount = nameData.filter(data => data.gender === 'M').reduce((acc, data) => acc + data.count, 0);
            const femaleCount = nameData.filter(data => data.gender === 'F').reduce((acc, data) => acc + data.count, 0);
            const firstYear = nameData[0]?.year || 'N/A';
            const lastYear = nameData[nameData.length - 1]?.year || 'N/A';
            const mostPopularYearMale = getMostPopularYear(nameData, 'M');
            const mostPopularYearFemale = getMostPopularYear(nameData, 'F');
            const avgOccurrences = totalOccurrences / years.length;

            analyticsDiv.innerHTML = `
                <h2>Analytics for ${name}</h2>
                <p>Total Occurrences: ${totalOccurrences}</p>
                <p>Male Count: ${maleCount}</p>
                <p>Female Count: ${femaleCount}</p>
                <p>First Year Recorded: ${firstYear}</p>
                <p>Last Year Recorded: ${lastYear}</p>
                <p>Most Popular Year for Males: ${mostPopularYearMale}</p>
                <p>Most Popular Year for Females: ${mostPopularYearFemale}</p>
                <p>Average Yearly Occurrences: ${avgOccurrences.toFixed(2)}</p>
            `;
            loadingBar.style.width = '0%';
        })
        .catch(error => {
            console.error("Error querying data:", error);
        });
}

function getMostPopularYear(data, gender) {
    const filteredData = data.filter(d => d.gender === gender);
    const yearCount = {};
    filteredData.forEach(d => {
        yearCount[d.year] = (yearCount[d.year] || 0) + d.count;
    });
    const mostPopularYear = Object.keys(yearCount).reduce((a, b) => yearCount[a] > yearCount[b] ? a : b, 'N/A');
    return mostPopularYear;
}

function toggleDebug() {
    const debugDiv = document.getElementById("debugInfo");
    if (debugDiv.style.display === "none") {
        debugDiv.style.display = "flex";
    } else {
        debugDiv.style.display = "none";
    }
}
