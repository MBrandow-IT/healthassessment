import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';

// Register the necessary components
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

interface ChartDataProps {
  Fiscal_Period_Start: string;
  Month_Value: number;
  Last_Years_Value: number;
}

interface LineChartProps {
  chartData: ChartDataProps[];
}

const QuestionChart: React.FC<LineChartProps> = ({ chartData }) => {
  const period = chartData.slice(0, 13).map(obj => obj.Fiscal_Period_Start);
  const currData = chartData.slice(0, 13).map(obj => obj.Month_Value);
  const lastYearData = chartData.slice(0, 13).map(obj => obj.Last_Years_Value);

  const labels = period.map(period => new Date(period).toLocaleDateString('en-us', { month: 'short', year: 'numeric' }));
  const labelsFinal = [...labels].reverse();

  const currDataFinal = [...currData].reverse();
  const lastYearDataFinal = [...lastYearData].reverse();

  return (
    <Line
      datasetIdKey='id'
      data={{
        labels: labelsFinal,
        datasets: [
          {
            id: 1,
            label: 'Most Recent',
            data: currDataFinal,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.4,
          },
          {
            id: 2,
            label: 'Previous Year',
            data: lastYearDataFinal,
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            fill: true,
            tension: 0.4,
          },
        ],
      }}
      options={{
        plugins: {
          legend: {
            display: true,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      }}
    />
  );
};

export default QuestionChart;
