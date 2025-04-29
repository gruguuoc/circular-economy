import Chart from 'chart.js/auto'

async function fetchGenerationMix() {
  const urlGenerationMix = "https://api.carbonintensity.org.uk/generation";
  try {
    const response = await fetch(urlGenerationMix);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const res = await response.json();
    return res.data.generationmix;
  } catch (error) {
    console.error("Error fetching generation mix data:", error);
  }
}

async function fetchIntensityFactors() {
  const urlIntensityFactors = "https://api.carbonintensity.org.uk/intensity/factors";
  try {
    const response = await fetch(urlIntensityFactors);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const res = await response.json();
    return res.data[0];
  } catch (error) {
    console.error("Error fetching intensity factors data:", error);
  }
}

async function fetchCarbonIntensityData(date) {
  try {
    const response = await fetch(`https://api.carbonintensity.org.uk/intensity/date/${date}`);
    const data = await response.json();
    console.log(data);
    return data.data.map(period => ({
      time: period.from.slice(11, 16),
      intensity: period.intensity.actual
    }));
  } catch (error) {
    console.error("Error fetching carbon intensity data:", error);
  }
}

async function renderGenerationMixChart() {
  const generationMix = await fetchGenerationMix();
  new Chart(
    document.getElementById('doughnut'),
    {
      type: 'doughnut',
      data: {
        labels: generationMix.map(row => row.fuel),
        datasets: [
          {
            label: 'Generation percentage',
            data: generationMix.map(row => row.perc)
          }
        ]
      },
      options: {
        radius: '50%'

      }
    }
  );
}

async function renderIntensityFactorsChart() {
  const data = await fetchIntensityFactors();
  new Chart(
    document.getElementById('bars'),
    {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label: 'Intensity factor by fuel type',
            data: Object.values(data)
          }
        ]
      },
      options: {
        plugins: {}
      }
    }
  );
}

async function renderCarbonIntensityChart(date) {
  const intensityData = await fetchCarbonIntensityData(date);
  console.log(intensityData);
  new Chart(document.getElementById('line'),
    {
      type: 'line',
      data: {
        labels: intensityData.map(d => d.time),
        datasets: [{
          label: 'Carbon Intensity (gCO₂/kWh)',
          data: intensityData.map(d => d.intensity),
          fill: true,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time of Day'
            }
          },
          y: {
            title: {
              display: true,
              text: 'gCO₂ per kWh'
            }
          }
        }
      }
    }
  );
}

(async function() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  renderGenerationMixChart();
  renderIntensityFactorsChart();
  renderCarbonIntensityChart(formattedDate);
})();
