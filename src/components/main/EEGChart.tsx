import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EEGChartProps {
  data: number[];
}

const EEGChart: React.FC<EEGChartProps> = ({ data }) => {
  const chartData = data.map((value, index) => ({ time: index, voltage: value }));

  return (
    <div className="w-full h-72 mt-8" style={{ background: 'transparent' }}>
      <ResponsiveContainer width="100%" height="100%" style={{ background: 'transparent' }}>
        <AreaChart data={chartData} style={{ background: 'transparent' }}>
          <defs>
            <linearGradient id="colorVoltage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#05AEFC" stopOpacity={0.8}/>
              <stop offset="50%" stopColor="#12DBF7" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="voltage"
            stroke="#8884d8"
            fill="url(#colorVoltage)"
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
export default EEGChart;
