import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const GrowthChart = () => {
    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f3f4f6',
                    borderDash: [5, 5],
                },
                ticks: {
                    display: false
                },
                border: {
                    display: false
                }
            },
            x: {
                grid: {
                    display: false,
                },
                border: {
                    display: false
                }
            },
        },
        maintainAspectRatio: false,
        borderRadius: 8,
        barThickness: 24,
    };

    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Revenue',
                data: [12000, 19000, 15000, 22000, 18000, 24000, 32000],
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, '#4F8CFF');
                    gradient.addColorStop(1, '#A0C4FF');
                    return gradient;
                },
            },
        ],
    };

    return (
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 p-6">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Platform Growth</h3>
                <p className="text-sm text-gray-500">Revenue and user acquisition (Past 30 days)</p>
            </div>
            <div className="h-64">
                <Bar options={options} data={data} />
            </div>
        </div>
    );
};

export default GrowthChart;
