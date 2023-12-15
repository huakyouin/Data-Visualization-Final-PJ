<template>
  <div id="overview" ref="parentContainer">
    <div id="d3-map"></div>
    <div style="margin-right: 10px;">
      <button @click="toggleAnimation">{{ isAnimating ? '暂停' : '播放' }}</button>
      <input type="range" min="0" :max="keys.length - 1" v-model="timeIndex" @input="updatePoints" />
    </div>
    <span>{{ keys[timeIndex] }}</span>
  </div>
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
const Width = 700;


export default {
  name: 'D3Map',
  data() {
    return {
      isAnimating: true,
      timeIndex: 0,
      keys : Array.from(group_data.keys()), // 获取所有时间键值
      parentContainerWidth : 0,
      widthToHeightRatio: 0.6, //svg 宽高比
      projection: null,
      path: null,
    };
  },
  mounted() {
    // 获取实际宽度
    this.parentContainerWidth = this.$refs.parentContainer.offsetWidth;
    // 投影方法
    this.projection = d3.geoIdentity().fitSize([this.parentContainerWidth, this.parentContainerWidth * this.widthToHeightRatio], geojson);
    //这里暂时没有翻转y轴，所以可能看起来和示例是反的，后面会调整
    this.path = d3.geoPath().projection(this.projection);

    this.drawMap();
    this.updatePoints(); // 调用更新点的方法
    this.animationInterval = setInterval(this.updatePoints, 1000); // 每隔1秒钟更新一次点的位置
    // 创建缩放对象
    const zoom = d3.zoom()
      .scaleExtent([1, 8]) // 设置缩放范围，最小为 1 倍，最大为 8 倍
      .on('zoom', this.zoomed); // 创建 zoomed 方法用于处理缩放事件
    // 将缩放对象应用到地图的 SVG 元素上
    d3.select('#d3-map svg').call(zoom);


  },
  methods: {
    drawMap() {
      
      const svg = d3
        .select('#d3-map')
        .append('svg')
        .attr('width', this.parentContainerWidth)
        .attr('height', this.parentContainerWidth*this.widthToHeightRatio);

      const background = svg.append('g')

      background
        .selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('d', this.path)
        .style('fill', 'none')
        .style('stroke', 'steelblue')
        .style('stroke-width', 2);

      background
        .selectAll('.crosswalk')
        .data(crosswalk.features)
        .enter()
        .append('path')
        .attr('d', this.path)
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
        .attr('d', this.path)
        .style('fill', 'none')
        .style('stroke', 'red')
        .style('stroke-width', 2);

      background
        .selectAll('.lane')
        .data(lane.features)
        .enter()
        .append('path')
        .attr('class', 'lane')
        .attr('d', this.path)
        .style('fill', 'none')
        .style('stroke', 'darkgray')
        .style('stroke-width', 1);

      background
        .selectAll('circle')
        .data(signal.features)
        .enter()
        .append('circle')
        .attr('cx', d => this.projection(d.geometry.coordinates)[0])
        .attr('cy', d => this.projection(d.geometry.coordinates)[1])
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
        .attr('cx', d=>this.projection([d.d.x,d.d.y])[0])
        .attr('cy', d=>this.projection([d.d.x,d.d.y])[1])
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
      let currentKey = d3.select('#p').selectAll(".ptts").datum().time;
      let currentIndex = this.keys.findIndex(key => {
        // 在这里进行临时的转换操作，将时间格式转换为 Date 对象
        let keyTime = new Date(key);
        let currentKeyTime = new Date(currentKey);
        return keyTime.getTime() === currentKeyTime.getTime();
      });
      let updateKey; // 声明 updateKey 在方法内部的范围
      if (!this.isAnimating && this.keys[this.timeIndex]==currentKey) {  // 没拖动时间轴+暂停状态，什么都不做
        return
      }
      else if (this.isAnimating && this.keys[this.timeIndex]==currentKey) {// 没拖动时间轴+播放状态，往后面一个key更新
        if (currentIndex==this.keys.length-1) { //播放到最后了,结束
          this.toggleAnimation()
          return
        }
        updateKey = this.keys[currentIndex + 1]
        this.timeIndex = currentIndex + 1 
      }
      else if (this.keys[this.timeIndex]!=currentKey) { // 拖动了时间轴
        updateKey = this.keys[this.timeIndex]
      }
      else {
        console.log('fuck')
      }
      // console.log(updateKey)  //check

      // 清空现有的点
      d3.select('#d3-map')
        .selectAll('.ptts')
        .remove();

      const p = d3.select('#p'); // 选择 p 容器
      p
        .selectAll(".ptts")
        .data(group_data.get(updateKey))
        .enter()
        .append('circle')
        .attr('cx', d=>this.projection([d.d.x,d.d.y])[0])
        .attr('cy', d=>this.projection([d.d.x,d.d.y])[1])
        .attr('r', 3) 
        .attr('id', d=>d.d.id)
        .classed('ptts',true)
        .attr('fill', 'red');
    },
    toggleAnimation() {
      this.isAnimating = !this.isAnimating;
      if (this.isAnimating) {
        if (this.timeIndex == this.keys.length-1) { // 重播的核心逻辑
          this.timeIndex = 0;
        }
        this.animationInterval = setInterval(this.updatePoints, 1000);
      } else {
        clearInterval(this.animationInterval);
      }
    },
    // 处理缩放事件的方法
    zoomed(event) {
      const { transform } = event;
      d3.select('#d3-map g').attr('transform', transform); // 将缩放变换应用到地图的 g 元素上
      d3.select('#d3-map #p').attr('transform', transform); // 将缩放变换应用到 p 容器上
    },

  },
  
};
</script>

<style>
input[type="range"] {
  width: 300px; /* 设置input[type="range"]的宽度 */
}
</style>
