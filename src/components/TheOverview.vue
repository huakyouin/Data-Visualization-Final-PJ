<template>
  <div id="d3-map"></div>
</template>

<script>
import * as d3 from 'd3';
import geojson from '../assets/boundary.json'; 
import crosswalk from '../assets/crosswalk.json'; 
import lane from '../assets/lane.json'; 
import signal from '../assets/signal.json'; 
import stopline from '../assets/stopline.json'; 
import data from '../assets/part.json'; 

// 对记录按秒分组
let group_data = d3.group(data.map(d=>{return {d,time:new Date(Math.floor(d.time_meas/1000000)*1000)}}),d=>d.time)
const firstKey = group_data.keys().next().value //最开始时间的键值
const keys = Array.from(group_data.keys()); // 获取所有时间键值

// 投影方法
const projection = d3.geoIdentity().fitSize([800, 600], geojson);
      //这里暂时没有翻转y轴，所以可能看起来和示例是反的，后面会调整
      const path = d3.geoPath().projection(projection);

export default {
  name: 'D3Map',
  mounted() {
    this.drawMap();
    this.updatePoints(); // 调用更新点的方法
    setInterval(this.updatePoints, 300); // 每隔1秒钟更新一次点的位置
  },
  methods: {
    drawMap() {

      const svg = d3
        .select('#d3-map')
        .append('svg')
        .attr('width', 800)
        .attr('height', 600);

      const background = svg.append('g')

      background
        .selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('fill', 'none')
        .style('stroke', 'steelblue')
        .style('stroke-width', 2);

      background
        .selectAll('.crosswalk')
        .data(crosswalk.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('fill', 'none')
        .style('stroke', 'green')
        .style('stroke-width', 2)
        .attr('class', 'crosswalk');

      background
        .selectAll('.stopline')
        .data(stopline.features)
        .enter()
        .append('path')
        .attr('class', 'stopline')
        .attr('d', path)
        .style('fill', 'none')
        .style('stroke', 'red')
        .style('stroke-width', 2);

      background
        .selectAll('.lane')
        .data(lane.features)
        .enter()
        .append('path')
        .attr('class', 'lane')
        .attr('d', path)
        .style('fill', 'none')
        .style('stroke', 'darkgray')
        .style('stroke-width', 1);

      background
        .selectAll('circle')
        .data(signal.features)
        .enter()
        .append('circle')
        .attr('cx', d => projection(d.geometry.coordinates)[0])
        .attr('cy', d => projection(d.geometry.coordinates)[1])
        .attr('r', 2)
        .style('fill', 'orange');
      // 静态数据全部载入，尺寸/颜色需要调整


      // 参与者容器
      const p = svg.append('g').attr("id","p")
      p
        .selectAll(".ptts")
        .data(group_data.get(firstKey))
        .enter()
        .append('circle')
        .attr('cx', d=>projection([d.d.x,d.d.y])[0])
        .attr('cy', d=>projection([d.d.x,d.d.y])[1])
        .attr('r', 3) 
        .attr('id', d=>d.d.id)
        .classed('ptts',true)
        .attr('fill', 'red'); 
          // 需要根据种类确定大小颜色
          // 需要加入tooltip，查看点的信息
      // 目前只展示了前100个数据，需要调整为根据时间筛选

      // 需要加入图例，等所有视图合并后确定颜色
    },
    // 更新点的位置的方法
    updatePoints() {
      // 获取下一个时间的数据
      const nextTimeKey = this.getNextTimeKey(); // 实现该方法获取下一个时间的键值

      // 清空现有的点
      d3.select('#d3-map')
        .selectAll('.ptts')
        .remove();

      const p = d3.select('#p'); // 选择 p 容器
      p
        .selectAll(".ptts")
        .data(group_data.get(nextTimeKey))
        .enter()
        .append('circle')
        .attr('cx', d=>projection([d.d.x,d.d.y])[0])
        .attr('cy', d=>projection([d.d.x,d.d.y])[1])
        .attr('r', 3) 
        .attr('id', d=>d.d.id)
        .classed('ptts',true)
        .attr('fill', 'red');

      
    },
    // 获取下一个时间的键值的方法
    getNextTimeKey() {
      // console.log(d3.select('#p').selectAll(".ptts").datum())
      let currentKey = d3.select('#p').selectAll(".ptts").datum().time;
      let currentIndex = keys.indexOf(currentKey);
      if (currentIndex< keys.length-1) {
        return keys[currentIndex+1]
      }
      else {
        return keys[-1]
      }

    }

  },
  
};
</script>