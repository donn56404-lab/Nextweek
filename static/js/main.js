// ============================
// Sidebar toggle for mobile
// ============================
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.flex-1');
const hamburgerButton = document.createElement('div');
hamburgerButton.innerHTML = '<i class="fa-solid fa-bars text-2xl text-[#00bfff]"></i>';
hamburgerButton.classList.add('p-3', 'md:hidden', 'cursor-pointer', 'absolute', 'top-4', 'left-4', 'bg-[#001d3d]', 'rounded');
document.body.appendChild(hamburgerButton);

hamburgerButton.addEventListener('click', () => {
  sidebar.classList.toggle('-translate-x-full');
});

// ============================
// Tab switching
// ============================
const tabs = document.querySelectorAll('.sidebar a');
const contents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', e => {
    e.preventDefault();
    const targetId = tab.getAttribute('href').substring(1) + '-tab';
    contents.forEach(c => c.classList.add('hidden'));
    document.getElementById(targetId).classList.remove('hidden');

    // Optional: highlight active tab
    tabs.forEach(t => t.classList.remove('bg-[#00bfff22]'));
    tab.classList.add('bg-[#00bfff22]');
  });
});

// ============================
// Fetch Prices from CoinGecko
// ============================
async function updatePrices() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,dogecoin&vs_currencies=usd&include_24hr_change=true');
    const data = await res.json();

    const table = document.getElementById('crypto-table');
    table.innerHTML = `
      <tr><td>BTC</td><td>$${data.bitcoin.usd.toLocaleString()}</td><td class="${data.bitcoin.usd_24h_change >= 0 ? 'text-green-400' : 'text-red-400'}">${data.bitcoin.usd_24h_change.toFixed(2)}%</td></tr>
      <tr><td>ETH</td><td>$${data.ethereum.usd.toLocaleString()}</td><td class="${data.ethereum.usd_24h_change >= 0 ? 'text-green-400' : 'text-red-400'}">${data.ethereum.usd_24h_change.toFixed(2)}%</td></tr>
      <tr><td>USDT</td><td>$${data.tether.usd.toLocaleString()}</td><td class="${data.tether.usd_24h_change >= 0 ? 'text-green-400' : 'text-red-400'}">${data.tether.usd_24h_change.toFixed(2)}%</td></tr>
      <tr><td>DOGE</td><td>$${data.dogecoin.usd.toLocaleString()}</td><td class="${data.dogecoin.usd_24h_change >= 0 ? 'text-green-400' : 'text-red-400'}">${data.dogecoin.usd_24h_change.toFixed(2)}%</td></tr>
    `;
  } catch (err) {
    console.error("Error fetching crypto data:", err);
  }
}

// Initial fetch + update every 15 seconds
updatePrices();
setInterval(updatePrices, 15000);
