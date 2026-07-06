<template>
  <div class="tle-viewer">
    <div id="cesiumContainer" ref="cesiumRef"></div>
    <div class="control-panel">
      <h3>TLE 7参数信息</h3>
      <p>历元时刻：{{ tle7Params.epoch.toLocaleString() }}</p>
      <p>轨道倾角：{{ tle7Params.inclination.toFixed(2) }}°</p>
      <p>偏心率：{{ tle7Params.eccentricity.toFixed(6) }}</p>
      <p>B*拖曳系数：{{ tle7Params.bStar.toExponential(6) }}</p>
      <p>平均运动：{{ tle7Params.meanMotion.toFixed(4) }} 圈/天</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import * as Cesium from 'cesium';
import { parseTLE7Params, calculateOrbit, eciToCesium } from '../utils/tleCalculator';
import type { TLE7Params } from '../types/tle';

// 配置Cesium Token（替换成你自己的）
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZTE4NjNkNC0wNGI2LTQ4ZGItYWE5My1lYWUxMDU0MDBhOWUiLCJpZCI6NDUyODYyLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODMzMDg0OTF9.oWll3Sdsw3mtsoVE521wXKhJKhiaCDtf5Byc3_UbUFo';

// DOM引用
const cesiumRef = ref<HTMLElement | null>(null);
let viewer: Cesium.Viewer | null = null;
let satelliteEntity: Cesium.Entity | null = null;
let orbitPath: Cesium.Entity | null = null;
let animationFrame: number | null = null;

// 示例TLE（国际空间站）
const TLE_LINE1 = '1 25544U 98067A   25120.50000000  .00000000  00000-0  12345-6 0  9999';
const TLE_LINE2 = '2 25544  51.6400  90.0000 0003000   0.0000  0.0000 15.00000000999999';

// 7参数TLE对象
const tle7Params = ref<TLE7Params>(parseTLE7Params(TLE_LINE1, TLE_LINE2));

// 计算轨道轨迹（多时刻采样）
const getOrbitPositions = (): Cesium.Cartesian3[] => {
  const positions: Cesium.Cartesian3[] = [];
  const now = new Date();
  
  // 采样60个点，绘制一圈轨道
  for (let i = 0; i < 60; i++) {
    const time = new Date(now.getTime() + i * 10000);
    const orbit = calculateOrbit(TLE_LINE1, TLE_LINE2, time);
    positions.push(eciToCesium(orbit.position));
  }
  
  return positions;
};

// 获取卫星位置的回调函数
const getSatellitePosition = (): Cesium.Cartesian3 => {
  const now = new Date();
  const orbit = calculateOrbit(TLE_LINE1, TLE_LINE2, now);
  return eciToCesium(orbit.position);
};

// 初始化Cesium
const initCesium = () => {
  if (!cesiumRef.value) return;
  
  viewer = new Cesium.Viewer(cesiumRef.value, {
    timeline: false,
    animation: false,
    baseLayerPicker: true,
    geocoder: false,
    homeButton: false,
    shouldAnimate: true,
  });

  // 创建卫星实体 - 使用 CallbackPositionProperty
  satelliteEntity = viewer.entities.add({
    position: new Cesium.CallbackPositionProperty(
      () => {
        return getSatellitePosition();
      },
      false // 是否异步
    ),
    point: {
      pixelSize: 8,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: 'TLE卫星(含B*阻力)',
      font: '14px sans-serif',
      fillColor: Cesium.Color.WHITE,
      pixelOffset: new Cesium.Cartesian2(0, -15),
    },
  });

  // 创建轨道线 - 使用 CallbackProperty（这个可以用普通的）
  orbitPath = viewer.entities.add({
    polyline: {
      positions: new Cesium.CallbackProperty(
        () => {
          return getOrbitPositions();
        },
        false
      ),
      width: 2,
      material: new Cesium.ColorMaterialProperty(Cesium.Color.YELLOW.withAlpha(0.6)),
    },
  });

  // 启动实时更新
  startUpdate();
};

// 实时更新卫星位置
const startUpdate = () => {
  const update = () => {
    if (!viewer) return;
    
    // 每帧更新轨道位置缓存（让轨道线动起来）
    if (orbitPath && orbitPath.polyline) {
      // 触发 CallbackProperty 重新计算
      (orbitPath.polyline as any).positions = new Cesium.CallbackProperty(
        () => {
          return getOrbitPositions();
        },
        false
      );
    }
    
    animationFrame = requestAnimationFrame(update);
  };
  
  update();
};

onMounted(() => {
  initCesium();
});

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  if (viewer) viewer.destroy();
});
</script>

<style scoped>
.tle-viewer {
  width: 100vw;
  height: 100vh;
  position: relative;
}

#cesiumContainer {
  width: 100%;
  height: 100%;
}

.control-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 8px;
  min-width: 320px;
  font-size: 13px;
  pointer-events: none;
  z-index: 10;
}

.control-panel h3 {
  margin: 0 0 10px 0;
  color: #4fc3f7;
}

.control-panel p {
  margin: 5px 0;
  font-family: monospace;
}
</style>