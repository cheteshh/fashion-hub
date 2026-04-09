import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

interface PriceChartProps {
  history: { date: string; price: number }[];
}

const PriceChart = ({ history }: PriceChartProps) => {
  const data = {
    labels: history.map((h) => h.date),
    datasets: [
      {
        label: "Price (₹)",
        data: history.map((h) => h.price),
        borderColor: "hsl(38, 92%, 50%)",
        backgroundColor: "hsla(38, 92%, 50%, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "hsl(38, 92%, 50%)",
        pointRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `₹${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (val: any) => `₹${val.toLocaleString()}`,
        },
        grid: { color: "hsla(0,0%,50%,0.1)" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default PriceChart;
