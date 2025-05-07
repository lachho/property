// import React, { useEffect, useRef, useMemo } from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import * as d3 from 'd3';


// interface InvestmentAllocationProps {
//   assets: any[];
//   profile: any;
// }

// const currency = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
// const percentage = (n: number) => `${n.toFixed(1)}%`;

// type ChartData = {
//   label: string;
//   value: number;
//   color: string;
// }[];

// function annualizeIncome(amount: number, frequency: string): number {
//   switch (frequency) {
//     case 'Weekly': return amount * 52;
//     case 'Fortnightly': return amount * 26;
//     case 'Monthly': return amount * 12;
//     case 'Quarterly': return amount * 4;
//     case 'Annual': return amount;
//     default: return 0;
//   }
// }

// const assetColors: Record<string, string> = {
//   'Primary Home': '#4f46e5',
//   'Investment Property': '#8b5cf6',
//   'Business': '#ec4899',
//   'Shares': '#14b8a6',
//   'Super': '#f97316',
//   'Savings': '#a3e635',
//   'Other': '#94a3b8',
//   'Employment': '#0ea5e9',
//   'Partner Employment': '#6366f1'
// };

// const InvestmentAllocationChart: React.FC<InvestmentAllocationProps> = ({ assets, profile }) => {
//   const svgRef = useRef<SVGSVGElement>(null);
  
//   // Calculate asset allocation data
//   const assetAllocation = useMemo(() => {
//     const allocation: Record<string, number> = {};
    
//     // Add up asset values by type
//     assets.forEach(asset => {
//       const type = asset.assetType;
//       if (!allocation[type]) allocation[type] = 0;
//       allocation[type] += asset.currentValue || 0;
//     });
    
//     // Convert to array format for chart
//     return Object.entries(allocation)
//       .map(([label, value]) => ({
//         label,
//         value,
//         color: assetColors[label] || '#94a3b8' // Default to gray if no color defined
//       }))
//       .filter(item => item.value > 0)
//       .sort((a, b) => b.value - a.value);
//   }, [assets]);
  
//   // Calculate income allocation data
//   const incomeAllocation = useMemo(() => {
//     const allocation: Record<string, number> = {};
    
//     // Start with employment income
//     if (profile?.grossIncome) {
//       allocation['Employment'] = Number(profile.grossIncome) || 0;
//     }
    
//     if (profile?.partnerIncome) {
//       allocation['Partner Employment'] = Number(profile.partnerIncome) || 0;
//     }
    
//     // Add asset income by type
//     assets.forEach(asset => {
//       const type = asset.assetType;
//       if (!allocation[type]) allocation[type] = 0;
//       const annualIncome = annualizeIncome(
//         Number(asset.incomeAmount || 0), 
//         asset.incomeFrequency || 'Annual'
//       );
//       allocation[type] += annualIncome;
//     });
    
//     // Convert to array format for chart
//     return Object.entries(allocation)
//       .map(([label, value]) => ({
//         label,
//         value,
//         color: assetColors[label] || '#94a3b8' // Default to gray if no color defined
//       }))
//       .filter(item => item.value > 0)
//       .sort((a, b) => b.value - a.value);
//   }, [assets, profile]);
  
//   // Draw pie chart
//   const drawPieChart = (data: ChartData, type: string) => {
//     if (!svgRef.current || !data.length) return;
    
//     const width = svgRef.current.clientWidth;
//     const height = width; // Make it square
//     const radius = Math.min(width, height) / 2;
    
//     // Clear previous chart
//     d3.select(svgRef.current).selectAll('*').remove();
    
//     const svg = d3.select(svgRef.current)
//       .attr('width', width)
//       .attr('height', height)
//       .append('g')
//       .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
//     // Total for percentage calculation
//     const total = data.reduce((sum, d) => sum + d.value, 0);
    
//     // Generate pie
//     const pie = d3.pie<any>()
//       .value(d => d.value)
//       .sort(null);
    
//     // Generate arcs
//     const arc = d3.arc()
//       .innerRadius(0)
//       .outerRadius(radius * 0.8);
    
//     // Outer arc for labels
//     const outerArc = d3.arc()
//       .innerRadius(radius * 0.9)
//       .outerRadius(radius * 0.9);
    
//     // Create pie chart
//     const slices = svg.selectAll('.slice')
//       .data(pie(data))
//       .enter()
//       .append('g')
//       .attr('class', 'slice');
    
//     // Add colored slices
//     slices.append('path')
//       .attr('d', arc as any)
//       .attr('fill', d => d.data.color)
//       .attr('stroke', 'white')
//       .style('stroke-width', '2px')
//       .style('opacity', 0.9);
    
//     // Add labels
//     const text = slices.append('text')
//       .attr('transform', d => {
//         const pos = outerArc.centroid(d as any);
//         const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
//         pos[0] = radius * 0.95 * (midAngle < Math.PI ? 1 : -1);
//         return `translate(${pos})`;
//       })
//       .attr('dy', '.35em')
//       .attr('text-anchor', d => {
//         const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
//         return midAngle < Math.PI ? 'start' : 'end';
//       });
    
//     // Add label text
//     text.append('tspan')
//       .text(d => {
//         const percentage = Number(((d.data.value / total) * 100).toFixed(1));
//         return percentage > 5 ? `${d.data.label} (${percentage}%)` : '';
//       })
//       .attr('x', 0)
//       .attr('font-size', '12px');
    
//     // Add polylines between slices and labels
//     slices.append('polyline')
//       .attr('points', d => {
//         const pos = outerArc.centroid(d as any);
//         const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
//         pos[0] = radius * 0.95 * (midAngle < Math.PI ? 1 : -1);
        
//         const percent = (d.data.value / total) * 100;
//         return percent > 5 ? [arc.centroid(d as any), outerArc.centroid(d as any), pos].join(' ') : '';
//       })
//       .style('fill', 'none')
//       .style('stroke', '#ccc')
//       .style('stroke-width', '1px')
//       .style('opacity', 0.5);
//   };
  
//   useEffect(() => {
//     // Initial draw with asset allocation
//     drawPieChart(assetAllocation, 'assets');
//   }, [assetAllocation]);
  
//   return (
//     <Card className="mb-8">
//       <CardHeader>
//         <CardTitle>Investment Allocation</CardTitle>
//         <CardDescription>Breakdown of assets and income sources</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <Tabs defaultValue="assets" className="w-full" onValueChange={(value) => {
//           if (value === 'assets') drawPieChart(assetAllocation, 'assets');
//           else drawPieChart(incomeAllocation, 'income');
//         }}>
//           <TabsList className="grid w-full grid-cols-2 mb-4">
//             <TabsTrigger value="assets">Assets</TabsTrigger>
//             <TabsTrigger value="income">Income</TabsTrigger>
//           </TabsList>
          
//           <TabsContent value="assets" className="mt-0">
//             <div className="aspect-square w-full max-w-md mx-auto">
//               <svg ref={svgRef} width="100%" height="100%"></svg>
//             </div>
            
//             <div className="mt-6 space-y-2">
//               {assetAllocation.map((item, index) => (
//                 <div key={index} className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div className="w-4 h-4 mr-2" style={{ backgroundColor: item.color }}></div>
//                     <span>{item.label}</span>
//                   </div>
//                   <div className="flex">
//                     <span className="mr-4">{currency(item.value)}</span>
//                     <span className="w-16 text-right">
//                       {percentage((item.value / assetAllocation.reduce((sum, d) => sum + d.value, 0)) * 100)}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//               <div className="border-t pt-2 mt-2 font-medium flex justify-between">
//                 <span>Total</span>
//                 <span>{currency(assetAllocation.reduce((sum, d) => sum + d.value, 0))}</span>
//               </div>
//             </div>
//           </TabsContent>
          
//           <TabsContent value="income" className="mt-0">
//             <div className="aspect-square w-full max-w-md mx-auto">
//               <svg ref={svgRef} width="100%" height="100%"></svg>
//             </div>
            
//             <div className="mt-6 space-y-2">
//               {incomeAllocation.map((item, index) => (
//                 <div key={index} className="flex items-center justify-between">
//                   <div className="flex items-center">
//                     <div className="w-4 h-4 mr-2" style={{ backgroundColor: item.color }}></div>
//                     <span>{item.label}</span>
//                   </div>
//                   <div className="flex">
//                     <span className="mr-4">{currency(item.value)}</span>
//                     <span className="w-16 text-right">
//                       {percentage((item.value / incomeAllocation.reduce((sum, d) => sum + d.value, 0)) * 100)}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//               <div className="border-t pt-2 mt-2 font-medium flex justify-between">
//                 <span>Total Annual Income</span>
//                 <span>{currency(incomeAllocation.reduce((sum, d) => sum + d.value, 0))}</span>
//               </div>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </CardContent>
//     </Card>
//   );
// };

// export default InvestmentAllocationChart; 