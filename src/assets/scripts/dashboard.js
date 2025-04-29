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
    return data.data.map(period => ({
      time: period.from.slice(11, 16),
      actual: period.intensity.actual,
      forecast: period.intensity.forecast
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
        radius: '50%',
        plugins: {
          legend: {
            labels: {
              color: 'white'
            }
          }
        }

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
        plugins: {
          legend: {
            labels: {
              color: 'white'
            }
          }
        },
        scales: {
          x: {
            ticks:{
              color: 'white'
            },
            grid: {
              color: 'white'
            }
          },
          y: {
            ticks:{
              color: 'white'
            },
            grid: {
              color: 'white'
            }
          }
        }
      }
    }
  );
}

async function renderCarbonIntensityChart(date) {
  const intensityData = await fetchCarbonIntensityData(date);

  const ctx = document.getElementById('line');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: intensityData.map(d => d.time),
      datasets: [
        {
          label: 'Forecast Intensity (gCO₂/kWh)',
          data: intensityData.map(d => d.forecast),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          stack: 'carbon',
          yAxisID: 'y',
          type: 'bar'
        },
        {
          label: 'Actual Intensity (gCO₂/kWh)',
          data: intensityData.map(d => d.actual),
          borderColor: 'rgb(248, 255, 255)',
          backgroundColor: 'rgb(253, 253, 253)',
          tension: 0.4,
          fill: false,
          yAxisID: 'y',
          type: 'line'
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false
      },
      stacked: true,
      plugins: {
        legend: {
          labels: {
            color: 'white'
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          ticks:{
            color: 'white'
          },
          grid: {
            color: 'white'
          },
          title: {
            display: true,
            text: 'Time of Day',
            color: 'white'
          }
        },
        y: {
          stacked: true,
          ticks:{
            color: 'white'
          },
          grid: {
            color: 'white'
          },
          title: {
            display: true,
            text: 'gCO₂ per kWh',
            color: 'white'
          }
        }
      }
    }
  });
}

function renderDashboard(){
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  renderGenerationMixChart();
  renderIntensityFactorsChart();
  renderCarbonIntensityChart(formattedDate);
}


(async function() {
  renderDashboard()
})();
