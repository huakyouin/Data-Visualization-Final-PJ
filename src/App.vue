
<template>
  <!-- <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link> |
    <router-link to="/TheOverview">OverView</router-link>
  </nav> -->
  
  <TheOverview ></TheOverview>

  <!-- <router-view/> -->
</template>

<script>
import TheOverview from './components/TheOverview.vue';

export default {
  name: "App",
}

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: grid;
  height: 96vh;
  grid-template-columns: 40% 30% 30%; 
  grid-template-rows: 70% 30%;
  gap: 10px; /* 设置行列之间的间隔 */
}

#overview {
  display: flex;
  flex-direction: column; /* 将子元素排成一列 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  background-color: #f2f2f2;
  padding: 20px;
  text-align: center;
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  border-radius: 10px; /* 添加圆角 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
  justify-items: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

/* 超链接导航栏设置 */
nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
